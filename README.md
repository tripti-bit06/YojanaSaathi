# Yojana Saathi (योजना साथी)

**Theme:** Better Communities, Better Governance  
**Purpose:** Helping Indian citizens discover central government welfare schemes and scholarships they qualify for in **Hindi** and **English**—without middlemen, jargon, or opaque AI guesswork.

---

## 1. Problem Statement

India offers hundreds of high-impact welfare schemes and scholarships (PM-KISAN, Ayushman Bharat PM-JAY, PMAY, Sukanya Samriddhi, NSP Scholarships, PM Vishwakarma, PM SVANidhi), yet millions of eligible citizens miss out because:
1. Eligibility rules are buried inside complex PDFs and English-heavy portals.
2. Citizens naturally describe their situation in conversational Hindi, Hinglish, or regional phrasing rather than rigid form dropdowns.
3. Unregulated chatbots often hallucinate eligibility criteria or falsely imply they can enroll citizens.

---

## 2. Approach & Architecture

**Yojana Saathi** separates **natural-language understanding** from **rule enforcement**:

1. **Multilingual Voice & Text Intake (`/`):** Citizens speak (via the browser Web Speech API in `hi-IN` or `en-IN`) or type in Hindi, English, or Hinglish.
2. **Server-Side Profile Extraction (`POST /api/extract`):** Calls Gemini (`gemini-3.8-flash`) strictly on the server (`process.env.GEMINI_API_KEY` is never exposed to client code) using structured JSON schema output (`age`, `gender`, `category`, `annual_income`, `state`, `occupation`, `education_level`, `disability`) and flags missing attributes.
3. **Human-in-the-Loop Confirmation (`/confirm`):** Citizens verify and edit extracted fields before matching, seeing live rule-match counts update immediately.
4. **Deterministic TypeScript Rule Engine (`src/lib/matcher.ts`):** A pure TypeScript function—**never the LLM**—evaluates conservative eligibility thresholds against `data/schemes.json` and produces human-readable reasons in both English and Hindi (e.g., *"Matches because age 19 is within 14–35 yrs, annual income ₹1.8 Lakh is within ₹2.5 Lakh limit, category is OBC, and occupation is Student"*).
5. **Actionable Checklists & Application Tracker (`/scheme/:id` & `/applications`):** Interactive document preparation checklists, direct `.gov.in` official portal links, and a personal 4-stage application tracker (`Saved -> Docs Ready -> Applied -> Approved`).
6. **Explain This Form (`/explain-form`):** Citizens paste confusing bureaucratic form labels or affidavit clauses and receive a plain-language field-by-field guide (`POST /api/explain`, `mode: "form"`).

---

## 3. How AI Was Used Responsibly

- **Used for:**
  - Extracting structured profile fields from free-form Hindi/English/Hinglish descriptions (`/api/extract`).
  - Translating and simplifying dense scheme descriptions into everyday Hindi or simple Indian English (`/api/explain`).
  - Breaking down bureaucratic government form fields into plain instructions (`/explain-form`).
- **Explicitly NOT used for:**
  - Deciding whether a citizen is eligible for a scheme. All eligibility filtering happens deterministically in `src/lib/matcher.ts`.
  - Automated form submission or collecting sensitive identifiers (Aadhaar numbers, bank accounts, OTPs).

---

## 4. Dataset & Seed Script

- **`data/schemes.json`** contains **12 real central-government schemes**:
  1. PM-KISAN (`pmkisan.gov.in`)
  2. Ayushman Bharat PM-JAY (`pmjay.gov.in`)
  3. Pradhan Mantri Awas Yojana - PMAY (`pmaymis.gov.in`)
  4. Sukanya Samriddhi Yojana (`nsiindia.gov.in`)
  5. Post-Matric Scholarship for SC Students (`scholarships.gov.in`)
  6. Post-Matric Scholarship for ST Students (`scholarships.gov.in`)
  7. PM-YASASVI Post-Matric Scholarship for OBC, EBC & DNT (`scholarships.gov.in`)
  8. Central Sector Scheme of Scholarships for College & University Students (`scholarships.gov.in`)
  9. National Scholarships for Persons with Disabilities - DEPwD (`scholarships.gov.in`)
  10. PM Vishwakarma Yojana (`pmvishwakarma.gov.in`)
  11. PM SVANidhi (`pmsvanidhi.mohua.gov.in`)
  12. Atal Pension Yojana (`npscra.nsdl.co.in`)
- Validate the dataset anytime with:
  ```bash
  npm run seed
  ```
- *Note on Persistence:* Because Firebase cloud provisioning was declined in this environment, schemes are served from `data/schemes.json` and user-saved applications/checklists persist via `/api/applications` (`data/applications.json`) paired with browser storage.

---

## 5. How to Test Step-by-Step

1. **Bilingual Intake & Extraction:** On the Home page, click an example chip (e.g., *OBC College Student (Hinglish)* or *Small Farmer in UP (Hindi)*), or click **Speak** to dictate, then click **Check My Eligibility**.
2. **Profile Confirmation:** Verify the prefilled fields on `/confirm`, notice any highlighted missing fields, adjust income or category, and watch the live match counter update.
3. **Rule-Based Results & AI Simplifier:** Click **Match Eligible Schemes** to view matched cards with exact reasons, click **Simplify in Plain Words**, and toggle between **English** and **हिंदी (Hindi)** in the top workspace bar.
4. **Document Checklist:** Click **Checklist & Details** on any scheme and tick off required documents.
5. **Save & Track Applications:** Click **Save to Tracker**, sign in with a name and email, and open **My Applications** to update progress (`Saved -> Docs Ready -> Applied -> Approved`).
6. **Explain This Form:** Open **Explain Form** in the navigation bar, load one of the sample scholarship/land-record snippets (or paste any government form text), and generate a field-by-field breakdown in Hindi or English.

---

## 6. Limitations & Next Steps

- **Conservative Thresholds:** Central schemes often have sub-clauses (such as culturable land cut-off dates, SECC-2011 deprivation lists, or board-percentile cutoffs) that cannot be verified from a basic profile alone; every card includes a conservative verification notice and official `.gov.in` link.
- **Central Scope:** Currently covers 12 major central-government schemes; state-specific schemes (e.g., Ladli Behna, Kanyashree, Rythu Bharosa) are planned next.
- **Next Steps:** Expand regional language support (Tamil, Bengali, Marathi, Telugu), integrate state welfare directories, and support offline printable PDF document checklists for Common Service Centre (CSC) visits.
