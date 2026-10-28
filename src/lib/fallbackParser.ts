import {
  CitizenProfile,
  EducationLevel,
  Gender,
  INDIAN_STATES,
  Language,
  Occupation,
  SocialCategory,
} from '../types';

const STATE_ALIASES: Array<{ state: string; patterns: RegExp[] }> = [
  { state: 'Uttar Pradesh', patterns: [/\buttar\s*pradesh\b/i, /\bu\.?p\.?\b/i, /उत्तर\s*प्रदेश/, /\blucknow\b/i, /\bvaranasi\b/i, /\bkanpur\b/i, /\bnoida\b/i] },
  { state: 'Bihar', patterns: [/\bbihar\b/i, /बिहार/, /\bpatna\b/i, /\bgaya\b/i, /\bmuzaffarpur\b/i] },
  { state: 'Maharashtra', patterns: [/\bmaharashtra\b/i, /\bmh\b/i, /महाराष्ट्र/, /\bmumbai\b/i, /\bpune\b/i, /\bnagpur\b/i] },
  { state: 'Madhya Pradesh', patterns: [/\bmadhya\s*pradesh\b/i, /\bm\.?p\.?\b/i, /मध्य\s*प्रदेश/, /\bbhopal\b/i, /\bindore\b/i] },
  { state: 'Rajasthan', patterns: [/\brajasthan\b/i, /\brj\b/i, /राजस्थान/, /\bjaipur\b/i, /\bjodhpur\b/i, /\bkota\b/i] },
  { state: 'Delhi', patterns: [/\bdelhi\b/i, /\bnew\s*delhi\b/i, /दिल्ली/] },
  { state: 'West Bengal', patterns: [/\bwest\s*bengal\b/i, /\bwb\b/i, /\bbengal\b/i, /पश्चिम\s*बंगाल/, /\bkolkata\b/i] },
  { state: 'Gujarat', patterns: [/\bgujarat\b/i, /गुजरात/, /\bahmedabad\b/i, /\bsurat\b/i] },
  { state: 'Karnataka', patterns: [/\bkarnataka\b/i, /कर्नाटक/, /\bbengaluru\b/i, /\bbangalore\b/i] },
  { state: 'Tamil Nadu', patterns: [/\btamil\s*nadu\b/i, /\btn\b/i, /तमिलनाडु/, /\bchennai\b/i] },
  { state: 'Telangana', patterns: [/\btelangana\b/i, /तेलंगाना/, /\bhyderabad\b/i] },
  { state: 'Andhra Pradesh', patterns: [/\bandhra\s*pradesh\b/i, /\ba\.?p\.?\b/i, /आंध्र\s*प्रदेश/] },
  { state: 'Haryana', patterns: [/\bharyana\b/i, /हरियाणा/, /\bgurugram\b/i, /\bgurgaon\b/i] },
  { state: 'Punjab', patterns: [/\bpunjab\b/i, /पंजाब/, /\bludhiana\b/i, /\bamritsar\b/i] },
  { state: 'Jharkhand', patterns: [/\bjharkhand\b/i, /झारखंड/, /\branchi\b/i] },
  { state: 'Chhattisgarh', patterns: [/\bchhattisgarh\b/i, /छत्तीसगढ़/, /\braipur\b/i] },
  { state: 'Odisha', patterns: [/\bodisha\b/i, /\borissa\b/i, /ओडिशा/, /\bbhubaneswar\b/i] },
  { state: 'Assam', patterns: [/\bassam\b/i, /असम/, /\bguwahati\b/i] },
  { state: 'Kerala', patterns: [/\bkerala\b/i, /केरल/, /\bkochi\b/i] },
  { state: 'Uttarakhand', patterns: [/\buttarakhand\b/i, /\buk\b/i, /उत्तराखंड/, /\bdehradun\b/i] },
  { state: 'Himachal Pradesh', patterns: [/\bhimachal\b/i, /\bh\.?p\.?\b/i, /हिमाचल/] },
  { state: 'Jammu and Kashmir', patterns: [/\bjammu\b/i, /\bkashmir\b/i, /\bj&k\b/i, /जम्मू/, /कश्मीर/] },
  { state: 'Goa', patterns: [/\bgoa\b/i, /गोवा/] },
];

/**
 * Deterministic regex & keyword fallback parser for Hindi, English, and Hinglish.
 * Ensures the user NEVER hits a dead end even if the AI service is busy or unreachable.
 */
export function parseCitizenProfileFallback(
  rawText: string,
  lang: Language = 'en'
): {
  profile: CitizenProfile;
  missing_fields: (keyof CitizenProfile)[];
  extracted_note: string;
} {
  const text = rawText.trim();

  // 1. Age extraction (e.g. "20 saal", "19 years old", "age 24", "45 साल", "6 yr")
  let age: number | null = null;
  const agePatterns = [
    /(\d{1,3})\s*(?:saal|sal|yr|yrs|year|years|वर्ष|साल)/i,
    /(?:age|umra|umar|आयु|उम्र)\s*(?:is|hai|:|-)?\s*(\d{1,3})/i,
    /\bi\s*am\s*(\d{2})\b/i,
    /\bmain\s*(\d{2})\b/i,
  ];
  for (const pat of agePatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      const parsedAge = parseInt(m[1], 10);
      if (parsedAge >= 0 && parsedAge <= 110) {
        age = parsedAge;
        break;
      }
    }
  }

  // 2. Gender extraction
  let gender: Gender | null = null;
  if (
    /\b(female|woman|girl|daughter|sister|mother|widow|ladki|beti|mahila|aurat|chhatra)\b/i.test(text) ||
    /(महिला|लड़की|बेटी|छात्रा|गृहिणी|औरत)/.test(text)
  ) {
    gender = 'female';
  } else if (
    /\b(male|man|boy|son|father|ladka|beta|purush|kisan\s*bhai)\b/i.test(text) ||
    /(पुरुष|लड़का|बेटा|छात्र\b)/.test(text)
  ) {
    gender = 'male';
  } else if (/\b(transgender|non-binary|other\s*gender)\b/i.test(text) || /ट्रांसजेंडर/.test(text)) {
    gender = 'other';
  }

  // 3. Social Category extraction
  let category: SocialCategory | null = null;
  if (/\b(obc|other\s*backward)\b/i.test(text) || /(ओबीसी|अन्य\s*पिछड़ा)/.test(text)) {
    category = 'OBC';
  } else if (/\b(sc|scheduled\s*caste|dalit)\b/i.test(text) || /(अनुसूचित\s*जाति|दलित)/.test(text)) {
    category = 'SC';
  } else if (/\b(st|scheduled\s*tribe|adivasi|tribal)\b/i.test(text) || /(अनुसूचित\s*जनजाति|आदिवासी)/.test(text)) {
    category = 'ST';
  } else if (/\b(ews|economically\s*weaker)\b/i.test(text)) {
    category = 'EWS';
  } else if (/\b(general|unreserved|open\s*category|gen)\b/i.test(text) || /(सामान्य\s*वर्ग|सामान्य)/.test(text)) {
    category = 'General';
  }

  // 4. Annual Income extraction (handles "2LPA", "1.8 lakh", "1 लाख 20 हज़ार", "Rs 1,60,000", "15000 per month")
  let annual_income: number | null = null;
  const lakhPlusThousand = text.match(
    /(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)\s*(?:aur|and|\+)?\s*(\d+)\s*(?:hazar|hazaar|thousand|हज़ार|हजार)/i
  );
  const lpaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lac|lakhs|लाख)/i);
  const monthlyMatch = text.match(
    /(\d[\d,]*)\s*(?:per\s*month|\/month|pm|mahina|mahine|प्रति\s*माह|महीना)/i
  );
  const hazaarMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hazar|hazaar|thousand|k\b|हज़ार|हजार)/i);
  const rawRupeeMatch = text.match(/(?:rs\.?|inr|₹|income|आमदनी|आय)\s*(?:around|is|hai|:)?\s*(\d[\d,]{3,})/i);

  if (lakhPlusThousand) {
    annual_income = Math.round(
      parseFloat(lakhPlusThousand[1]) * 100000 + parseFloat(lakhPlusThousand[2]) * 1000
    );
  } else if (lpaMatch) {
    annual_income = Math.round(parseFloat(lpaMatch[1]) * 100000);
  } else if (monthlyMatch) {
    const monthly = parseInt(monthlyMatch[1].replace(/,/g, ''), 10);
    if (!Number.isNaN(monthly)) annual_income = monthly * 12;
  } else if (rawRupeeMatch) {
    const rawVal = parseInt(rawRupeeMatch[1].replace(/,/g, ''), 10);
    if (!Number.isNaN(rawVal)) annual_income = rawVal;
  } else if (hazaarMatch) {
    annual_income = Math.round(parseFloat(hazaarMatch[1]) * 1000);
  }

  // 5. State extraction
  let state: string | null = null;
  for (const entry of STATE_ALIASES) {
    if (entry.patterns.some((p) => p.test(text))) {
      state = entry.state;
      break;
    }
  }
  if (!state) {
    for (const st of INDIAN_STATES) {
      if (new RegExp(`\\b${st}\\b`, 'i').test(text)) {
        state = st;
        break;
      }
    }
  }

  // 6. Education Level extraction (BCA, B.Tech, BA, B.Sc, MBA, ITI, Diploma, 12th, 10th, class 8...)
  let education_level: EducationLevel | null = null;
  if (/\b(phd|m\.?a\.?|m\.?sc|m\.?com|m\.?tech|mba|mca|post\s*grad|pg)\b/i.test(text) || /(स्नातकोत्तर|एमए|एमएससी)/.test(text)) {
    education_level = 'postgraduate';
  } else if (
    /\b(bca|b\.?tech|b\.?e\.?|b\.?a\.?|b\.?sc|b\.?com|bba|mbbs|llb|college|undergrad|graduation|degree|1st\s*year|2nd\s*year|3rd\s*year|4th\s*year)\b/i.test(text) ||
    /(कॉलेज|स्नातक|बीए|बीएससी|बीकॉम)/.test(text)
  ) {
    education_level = 'undergraduate';
  } else if (/\b(iti|polytechnic|diploma)\b/i.test(text) || /(डिप्लोमा|आईटीआई)/.test(text)) {
    education_level = 'diploma';
  } else if (/\b(11th|12th|class\s*11|class\s*12|inter|intermediate|higher\s*secondary|plus\s*two)\b/i.test(text) || /(12वीं|11वीं|बारहवीं)/.test(text)) {
    education_level = 'higher_secondary';
  } else if (/\b(9th|10th|class\s*9|class\s*10|matric|high\s*school)\b/i.test(text) || /(10वीं|दसवीं|मैट्रिक)/.test(text)) {
    education_level = 'secondary';
  } else if (/\b(class\s*[1-8]|1st|2nd|3rd|4th|5th|6th|7th|8th|primary|middle\s*school)\b/i.test(text) || /(8वीं|आठवीं|प्राथमिक)/.test(text)) {
    education_level = 'primary';
  }

  // 7. Occupation extraction
  let occupation: Occupation | null = null;
  if (
    /\b(student|studying|college|school|scholar|padh|padhai|bca|b\.?tech|b\.?sc|b\.?a\.?)\b/i.test(text) ||
    /(छात्र|छात्रा|विद्यार्थी|पढ़ाई|पढ़\s*रही|पढ़\s*रहा)/.test(text)
  ) {
    occupation = 'student';
  } else if (/\b(farmer|farming|agriculture|kisan|kheti)\b/i.test(text) || /(किसान|खेती|कृषि)/.test(text)) {
    occupation = 'farmer';
  } else if (
    /\b(street\s*vendor|vendor|hawker|thela|rehdi|patri|vegetable\s*seller)\b/i.test(text) ||
    /(रेहड़ी|पटरी|ठेला|विक्रेता)/.test(text)
  ) {
    occupation = 'street_vendor';
  } else if (
    /\b(artisan|carpenter|tailor|potter|weaver|blacksmith|mason|barber|cobbler|vishwakarma|darzi|badhai|kumhar)\b/i.test(text) ||
    /(कारीगर|शिल्पकार|दर्जी|बढ़ई|कुम्हार|लोहार)/.test(text)
  ) {
    occupation = 'artisan';
  } else if (/\b(daily\s*wage|labour|laborer|worker|mazdoor|dihadi)\b/i.test(text) || /(मज़दूर|मजदूर|दिहाड़ी)/.test(text)) {
    occupation = 'daily_wage';
  } else if (/\b(homemaker|housewife|grahini)\b/i.test(text) || /(गृहिणी)/.test(text)) {
    occupation = 'homemaker';
  } else if (/\b(unemployed|jobless|looking\s*for\s*job|berozgar)\b/i.test(text) || /(बेरोज़गार|बेरोजगार)/.test(text)) {
    occupation = 'unemployed';
  } else if (/\b(self\s*employed|shopkeeper|small\s*business|dukaan)\b/i.test(text) || /(स्वरोज़गार|दुकान)/.test(text)) {
    occupation = 'self_employed';
  } else if (/\b(retired|pensioner|senior\s*citizen)\b/i.test(text) || /(वरिष्ठ\s*नागरिक|सेवानिवृत्त)/.test(text)) {
    occupation = 'senior_citizen';
  } else if (/\b(salaried|private\s*job|office\s*job)\b/i.test(text)) {
    occupation = 'salaried';
  }

  // 8. Disability check
  const disability =
    /\b(disability|disabled|pwd|divyang|handicap|handicapped|udid)\b/i.test(text) ||
    /(दिव्यांग|विकलांग)/.test(text);

  const profile: CitizenProfile = {
    age,
    gender,
    category,
    annual_income,
    state,
    occupation,
    education_level,
    disability,
  };

  const coreKeys: (keyof CitizenProfile)[] = [
    'age',
    'gender',
    'category',
    'annual_income',
    'state',
    'occupation',
    'education_level',
  ];
  const missing_fields = coreKeys.filter((k) => profile[k] === null);

  const extracted_note =
    lang === 'hi'
      ? 'AI अभी व्यस्त है, इसलिए हमने आपके विवरण से उपलब्ध जानकारी भर दी है। कृपया एक बार जांच लें।'
      : 'AI is busy, we filled what we could. Please check the details.';

  return { profile, missing_fields, extracted_note };
}
