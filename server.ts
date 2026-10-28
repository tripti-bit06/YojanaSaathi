import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { parseCitizenProfileFallback } from './src/lib/fallbackParser.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SCHEMES_PATH = path.resolve(__dirname, 'data', 'schemes.json');
const APPLICATIONS_PATH = path.resolve(__dirname, 'data', 'applications.json');

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 14000,
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function readSchemes() {
  const raw = fs.readFileSync(SCHEMES_PATH, 'utf-8');
  return JSON.parse(raw);
}

interface StoredApplicationsMap {
  [uid: string]: Array<{
    schemeId: string;
    status: 'saved' | 'docs_ready' | 'applied' | 'approved';
    checkedDocuments: string[];
    notes?: string;
    updatedAt: string;
  }>;
}

function readApplicationsStore(): StoredApplicationsMap {
  try {
    if (!fs.existsSync(APPLICATIONS_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(APPLICATIONS_PATH, 'utf-8');
    return JSON.parse(raw) as StoredApplicationsMap;
  } catch {
    return {};
  }
}

function writeApplicationsStore(store: StoredApplicationsMap) {
  fs.mkdirSync(path.dirname(APPLICATIONS_PATH), { recursive: true });
  fs.writeFileSync(APPLICATIONS_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

function safeJsonParse<T>(rawText: string | undefined): T | null {
  if (!rawText) return null;
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch && fenceMatch[1]) {
      try {
        return JSON.parse(fenceMatch[1].trim()) as T;
      } catch {
        return null;
      }
    }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeIncomeNumber(val: unknown): number | null {
  if (typeof val === 'number' && !Number.isNaN(val) && val >= 0) {
    return Math.round(val);
  }
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    const lpa = s.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lac)/);
    if (lpa) return Math.round(parseFloat(lpa[1]) * 100000);
    const digits = parseInt(s.replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(digits) && digits >= 0) return digits;
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Schemes API
  app.get('/api/schemes', (_req, res) => {
    try {
      const schemes = readSchemes();
      res.status(200).json({ schemes });
    } catch (error) {
      console.error('[GET /api/schemes] Failed to read schemes.json:', error);
      res.status(500).json({ error: 'Unable to load government schemes right now.' });
    }
  });

  app.get('/api/schemes/:id', (req, res) => {
    try {
      const schemes = readSchemes();
      const found = schemes.find((s: { id: string }) => s.id === req.params.id);
      if (!found) {
        res.status(404).json({ error: 'Scheme not found.' });
        return;
      }
      res.status(200).json({ scheme: found });
    } catch (error) {
      console.error('[GET /api/schemes/:id] Failed to read scheme:', error);
      res.status(500).json({ error: 'Unable to load scheme details right now.' });
    }
  });

  // 2. Profile Extraction via Server-Side Gemini API (/api/extract) with Deterministic Fallback
  app.post('/api/extract', async (req, res) => {
    const { text, lang = 'en' } = req.body ?? {};
    const targetLang = lang === 'hi' ? 'hi' : 'en';

    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      res.status(400).json({
        error:
          targetLang === 'hi'
            ? 'कृपया अपने बारे में कुछ वाक्य लिखें या बोलें।'
            : 'Please write or speak a short description about yourself first.',
      });
      return;
    }

    const fallbackResult = parseCitizenProfileFallback(text, targetLang);

    try {
      const ai = getGeminiClient();
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Extract structured Indian citizen profile JSON from this description:\n"${text.trim().slice(0, 2000)}"`,
          config: {
            temperature: 0.1,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            systemInstruction: `Return ONLY valid JSON with these exact keys:
{
  "age": integer or null,
  "gender": "male" | "female" | "other" | null,
  "category": "General" | "OBC" | "SC" | "ST" | "EWS" | null,
  "annual_income": integer (annual INR, e.g. "2 LPA" -> 200000, "15000/month" -> 180000) or null,
  "state": standard English Indian state/UT name (e.g. "UP" -> "Uttar Pradesh") or null,
  "occupation": "student" | "farmer" | "daily_wage" | "street_vendor" | "artisan" | "self_employed" | "homemaker" | "salaried" | "unemployed" | "senior_citizen" | null,
  "education_level": "none" | "primary" | "secondary" | "higher_secondary" | "diploma" | "undergraduate" | "postgraduate" | null (BCA/BTech/BA/BSc/BCom -> "undergraduate"),
  "disability": boolean,
  "extracted_note": short 1-sentence confirmation in ${targetLang === 'hi' ? 'Hindi' : 'English'}
}
Never invent unmentioned facts; use null for missing fields.`,
            responseMimeType: 'application/json',
          },
        }),
        11500,
        'Gemini /api/extract'
      );

      const parsed = safeJsonParse<Record<string, unknown>>(response.text);
      if (!parsed) {
        console.error('[POST /api/extract] Invalid JSON from Gemini, using fallback parser:', response.text);
        res.status(200).json({
          ...fallbackResult,
          used_fallback: true,
        });
        return;
      }

      const validGenders = ['male', 'female', 'other'];
      const validCategories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
      const validOccupations = [
        'student',
        'farmer',
        'daily_wage',
        'street_vendor',
        'artisan',
        'self_employed',
        'homemaker',
        'salaried',
        'unemployed',
        'senior_citizen',
      ];
      const validEducation = [
        'none',
        'primary',
        'secondary',
        'higher_secondary',
        'diploma',
        'undergraduate',
        'postgraduate',
      ];

      // Merge AI result with fallback regex hits so obvious tokens like "BCA" or "2LPA" are never missed
      const aiIncome = normalizeIncomeNumber(parsed.annual_income);
      const profile = {
        age:
          typeof parsed.age === 'number' && parsed.age >= 0 && parsed.age <= 120
            ? Math.round(parsed.age)
            : fallbackResult.profile.age,
        gender: validGenders.includes(String(parsed.gender || '').toLowerCase())
          ? (String(parsed.gender).toLowerCase() as 'male' | 'female' | 'other')
          : fallbackResult.profile.gender,
        category: validCategories.includes(parsed.category as string)
          ? (parsed.category as 'General' | 'OBC' | 'SC' | 'ST' | 'EWS')
          : fallbackResult.profile.category,
        annual_income: aiIncome !== null ? aiIncome : fallbackResult.profile.annual_income,
        state:
          typeof parsed.state === 'string' && parsed.state.trim().length > 0
            ? parsed.state.trim()
            : fallbackResult.profile.state,
        occupation: validOccupations.includes(String(parsed.occupation || '').toLowerCase())
          ? (String(parsed.occupation).toLowerCase() as typeof fallbackResult.profile.occupation)
          : fallbackResult.profile.occupation,
        education_level: validEducation.includes(String(parsed.education_level || '').toLowerCase())
          ? (String(parsed.education_level).toLowerCase() as typeof fallbackResult.profile.education_level)
          : fallbackResult.profile.education_level,
        disability:
          typeof parsed.disability === 'boolean'
            ? parsed.disability
            : Boolean(fallbackResult.profile.disability),
      };

      const coreKeys = [
        'age',
        'gender',
        'category',
        'annual_income',
        'state',
        'occupation',
        'education_level',
      ] as const;

      const missing_fields = coreKeys.filter((k) => profile[k] === null);

      res.status(200).json({
        profile,
        missing_fields,
        extracted_note:
          typeof parsed.extracted_note === 'string' && parsed.extracted_note.trim()
            ? parsed.extracted_note.trim()
            : undefined,
        used_fallback: false,
      });
    } catch (error) {
      console.error('[POST /api/extract] Gemini call failed; serving regex fallback:', error);
      res.status(200).json({
        ...fallbackResult,
        used_fallback: true,
      });
    }
  });

  // 3. Simplify / Translate Scheme or Government Form Text (/api/explain)
  app.post('/api/explain', async (req, res) => {
    const { mode = 'scheme', targetLang = 'en', schemeData, formText } = req.body ?? {};
    const isHi = targetLang === 'hi';
    const langName = isHi
      ? 'simple everyday Hindi (Devanagari script)'
      : 'plain, easy-to-understand Indian English';

    try {
      const ai = getGeminiClient();

      if (mode === 'form') {
        if (!formText || typeof formText !== 'string' || formText.trim().length < 5) {
          res.status(400).json({
            error: isHi
              ? 'कृपया समझाने के लिए फॉर्म का टेक्स्ट पेस्ट करें।'
              : 'Please paste the government form text you want explained.',
          });
          return;
        }

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: `Break down and explain each field/clause in this Indian government form in ${langName}:\n\n${formText.trim().slice(0, 3500)}`,
            config: {
              temperature: 0.2,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              systemInstruction: `Explain bureaucratic Indian government form fields in clear ${langName}. Never ask for personal Aadhaar or OTP numbers.`,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  form_title: { type: Type.STRING },
                  overall_purpose: { type: Type.STRING },
                  fields: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        field_name: { type: Type.STRING },
                        plain_meaning: { type: Type.STRING },
                        how_to_fill: { type: Type.STRING },
                        example_value: { type: Type.STRING },
                        common_mistake: { type: Type.STRING },
                      },
                      required: [
                        'field_name',
                        'plain_meaning',
                        'how_to_fill',
                        'example_value',
                        'common_mistake',
                      ],
                    },
                  },
                  safety_note: { type: Type.STRING },
                },
                required: ['form_title', 'overall_purpose', 'fields', 'safety_note'],
              },
            },
          }),
          13000,
          'Gemini /api/explain (form)'
        );

        const parsed = safeJsonParse<Record<string, unknown>>(response.text);
        if (!parsed) {
          res.status(502).json({
            error: isHi
              ? 'अभी फॉर्म का सरल विवरण तैयार नहीं हो सका। कृपया पुनः प्रयास करें।'
              : 'Could not generate the form guide right now. Please tap Retry.',
          });
          return;
        }
        res.status(200).json({ explanation: parsed });
        return;
      }

      if (!schemeData || typeof schemeData !== 'object') {
        res.status(400).json({ error: 'Invalid scheme details request.' });
        return;
      }

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Simplify this Indian government scheme in ${langName}:\nScheme: ${schemeData.name}\nDescription: ${schemeData.description}\nBenefits: ${schemeData.benefits}\nWhy matched: ${schemeData.matchReason || 'General inquiry'}\nSteps: ${Array.isArray(schemeData.steps) ? schemeData.steps.join(' | ') : ''}`,
          config: {
            temperature: 0.2,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            systemInstruction: `Explain Indian welfare schemes in warm, zero-jargon ${langName}. Remind citizens to carry original documents to the official portal or CSC.`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                simplified_summary: { type: Type.STRING },
                key_takeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                action_tip: { type: Type.STRING },
              },
              required: ['simplified_summary', 'key_takeaways', 'action_tip'],
            },
          },
        }),
        12500,
        'Gemini /api/explain (scheme)'
      );

      const parsed = safeJsonParse<Record<string, unknown>>(response.text);
      if (!parsed) {
        res.status(502).json({
          error: isHi
            ? 'सरल सारांश अभी तैयार नहीं हो सका। कृपया पुनः प्रयास करें।'
            : 'Could not simplify this scheme right now. Please tap Retry.',
        });
        return;
      }

      res.status(200).json({ explanation: parsed });
    } catch (error) {
      console.error('[POST /api/explain] Gemini error:', error);
      res.status(503).json({
        error: isHi
          ? 'AI सहायक अभी व्यस्त है। कृपया कुछ क्षण बाद पुनः प्रयास करें।'
          : 'Our AI assistant is temporarily busy. Please tap Retry in a moment.',
      });
    }
  });

  // 4. Saved Applications Persistence API (/api/applications)
  app.get('/api/applications', (req, res) => {
    const uid = String(req.headers['x-citizen-uid'] || '').trim();
    if (!uid) {
      res.status(401).json({ error: 'Please sign in to view saved applications.' });
      return;
    }
    const store = readApplicationsStore();
    res.status(200).json({ applications: store[uid] || [] });
  });

  app.post('/api/applications', (req, res) => {
    const uid = String(req.headers['x-citizen-uid'] || '').trim();
    if (!uid) {
      res.status(401).json({ error: 'Please sign in to save applications.' });
      return;
    }
    const { schemeId, status = 'saved', checkedDocuments = [], notes = '' } = req.body ?? {};
    const validStatuses = ['saved', 'docs_ready', 'applied', 'approved'];
    if (!schemeId || typeof schemeId !== 'string' || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid application details.' });
      return;
    }

    const store = readApplicationsStore();
    const userApps = store[uid] || [];
    const updatedItem = {
      schemeId,
      status,
      checkedDocuments: Array.isArray(checkedDocuments)
        ? checkedDocuments.filter((d): d is string => typeof d === 'string').slice(0, 30)
        : [],
      notes: typeof notes === 'string' ? notes.slice(0, 500) : '',
      updatedAt: new Date().toISOString(),
    };

    const existingIdx = userApps.findIndex((a) => a.schemeId === schemeId);
    if (existingIdx >= 0) {
      userApps[existingIdx] = updatedItem;
    } else {
      userApps.unshift(updatedItem);
    }
    store[uid] = userApps;
    writeApplicationsStore(store);

    res.status(200).json({ application: updatedItem, applications: userApps });
  });

  app.delete('/api/applications/:schemeId', (req, res) => {
    const uid = String(req.headers['x-citizen-uid'] || '').trim();
    if (!uid) {
      res.status(401).json({ error: 'Please sign in first.' });
      return;
    }
    const store = readApplicationsStore();
    const userApps = (store[uid] || []).filter((a) => a.schemeId !== req.params.schemeId);
    store[uid] = userApps;
    writeApplicationsStore(store);
    res.status(200).json({ applications: userApps });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yojana Saathi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
