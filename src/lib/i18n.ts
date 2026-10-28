import { Language } from '../types';

export interface ExampleChip {
  id: string;
  label: string;
  label_hi: string;
  text: string;
}

export const EXAMPLE_CHIPS: ExampleChip[] = [
  {
    id: 'obc-student',
    label: 'OBC College Student (Hinglish)',
    label_hi: 'OBC कॉलेज छात्रा (हिंग्लिश)',
    text: 'Main 19 saal ki ladki hoon Bihar se, OBC category. Abhi BA 1st year college mein padh rahi hoon aur family ki saalana income 1.8 lakh hai.',
  },
  {
    id: 'hindi-farmer',
    label: 'Small Farmer in UP (Hindi)',
    label_hi: 'छोटे किसान - उत्तर प्रदेश (हिंदी)',
    text: 'मैं उत्तर प्रदेश का 45 साल का किसान हूँ। मेरे पास थोड़ी खेती की ज़मीन है और सालाना आमदनी लगभग 1 लाख 20 हज़ार रुपये है। सामान्य वर्ग।',
  },
  {
    id: 'street-vendor',
    label: 'Urban Street Vendor (English)',
    label_hi: 'रेहड़ी-पटरी विक्रेता (अंग्रेजी)',
    text: 'I am a 34 year old male street vendor selling vegetables in Maharashtra. SC category, studied till class 8, annual income around Rs 1,60,000.',
  },
  {
    id: 'girl-child',
    label: '6-Yr Girl Child Savings',
    label_hi: '6 वर्षीय बेटी के लिए बचत',
    text: 'Looking for government savings schemes for my 6 year old daughter in Rajasthan. General category, household income Rs 4.2 lakh per year.',
  },
  {
    id: 'pwd-student',
    label: 'Student with Disability',
    label_hi: 'दिव्यांग विद्यार्थी छात्रवृत्ति',
    text: 'I am 21 years old from Madhya Pradesh with 50% benchmark disability (UDID card). Pursuing B.Sc undergraduate degree, family annual income is Rs 2 lakh, OBC category.',
  },
];

export const UI_COPY: Record<
  Language,
  {
    brand: string;
    navDiscover: string;
    navAllSchemes: string;
    navExplainForm: string;
    navApplications: string;
    signIn: string;
    signOut: string;
    heroKicker: string;
    heroTitle: string;
    heroSubtitle: string;
    textareaLabel: string;
    textareaPlaceholder: string;
    micStart: string;
    micListening: string;
    micUnsupported: string;
    extractBtn: string;
    extractingBtn: string;
    manualEntryBtn: string;
    examplesHeading: string;
    howItWorksTitle: string;
    howStep1: string;
    howStep2: string;
    howStep3: string;
    officialDisclaimer: string;
    confirmTitle: string;
    confirmSubtitle: string;
    missingAlertTitle: string;
    viewMatchesBtn: string;
    backToDescribeBtn: string;
    resultsTitle: string;
    allSchemesTitle: string;
    editProfileBtn: string;
    eligibleCountLabel: string;
    verifyCountLabel: string;
    whyEligibleLabel: string;
    benefitsLabel: string;
    documentsLabel: string;
    stepsLabel: string;
    applyOfficialBtn: string;
    saveSchemeBtn: string;
    savedSchemeBtn: string;
    viewDetailsBtn: string;
    simplifyAiBtn: string;
    simplifyingAiBtn: string;
  }
> = {
  en: {
    brand: 'Yojana Saathi',
    navDiscover: 'Discover',
    navAllSchemes: 'All Schemes',
    navExplainForm: 'Explain Form',
    navApplications: 'My Applications',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    heroKicker: 'Civic Welfare Discovery · Central Government Schemes & Scholarships',
    heroTitle: 'Find government schemes you actually qualify for.',
    heroSubtitle:
      'Describe yourself in Hindi, English, or Hinglish using text or voice. AI extracts your details, and transparent rule-based logic matches schemes—never guesswork.',
    textareaLabel: 'Tell us about yourself or your family member',
    textareaPlaceholder:
      'Example: Main 20 saal ka student hoon UP se, OBC category, B.Sc 2nd year mein hoon aur family income 1.8 lakh saalana hai...',
    micStart: 'Speak',
    micListening: 'Listening... Tap to stop',
    micUnsupported: 'Voice input is not supported in this browser. Please type your details.',
    extractBtn: 'Check My Eligibility',
    extractingBtn: 'Reading details...',
    manualEntryBtn: 'Fill form manually instead',
    examplesHeading: 'Try an example:',
    howItWorksTitle: 'Transparent by Design',
    howStep1: '01. Describe in your own words — Hindi, English, or Hinglish.',
    howStep2: '02. Review & edit extracted fields; pure code checks exact rules.',
    howStep3: '03. Tick required documents & apply directly on official .gov.in portals.',
    officialDisclaimer:
      'Independent civic guide. Yojana Saathi does not enroll applicants; always verify final guidelines and apply on official government portals.',
    confirmTitle: 'Confirm Your Citizen Profile',
    confirmSubtitle:
      'Review the details extracted from your description. You can edit any field before matching schemes.',
    missingAlertTitle: 'Some details were not mentioned — fill them for sharper matches:',
    viewMatchesBtn: 'Match Eligible Schemes',
    backToDescribeBtn: 'Edit Description',
    resultsTitle: 'Matched Schemes for Your Profile',
    allSchemesTitle: 'All 12 Central Government Schemes',
    editProfileBtn: 'Edit Profile',
    eligibleCountLabel: 'Confirmed Rule Matches',
    verifyCountLabel: 'Needs Missing Info Check',
    whyEligibleLabel: 'Why You Match',
    benefitsLabel: 'Key Benefits',
    documentsLabel: 'Required Documents',
    stepsLabel: 'Application Steps',
    applyOfficialBtn: 'Apply on Official Site',
    saveSchemeBtn: 'Save to Tracker',
    savedSchemeBtn: 'Saved in Tracker',
    viewDetailsBtn: 'Checklist & Details',
    simplifyAiBtn: 'Simplify in Plain Words',
    simplifyingAiBtn: 'Simplifying...',
  },
  hi: {
    brand: 'योजना साथी',
    navDiscover: 'पात्रता जांचें',
    navAllSchemes: 'सभी योजनाएं',
    navExplainForm: 'फॉर्म समझें',
    navApplications: 'मेरे आवेदन',
    signIn: 'साइन इन',
    signOut: 'लॉग आउट',
    heroKicker: 'नागरिक सहायता · केंद्रीय सरकारी योजनाएं एवं छात्रवृत्तियां',
    heroTitle: 'अपने लिए सही सरकारी योजनाएं और छात्रवृत्तियां खोजें।',
    heroSubtitle:
      'हिंदी, अंग्रेजी या हिंग्लिश में बोलकर या लिखकर अपने बारे में बताएं। AI केवल जानकारी पढ़ता है और पारदर्शी नियम आपकी पात्रता तय करते हैं।',
    textareaLabel: 'अपने या परिवार के सदस्य के बारे में बताएं',
    textareaPlaceholder:
      'उदाहरण: मैं बिहार से 19 साल की छात्रा हूँ, OBC वर्ग से हूँ, अभी कॉलेज में पढ़ रही हूँ और परिवार की सालाना आय 1.8 लाख रुपये है...',
    micStart: 'बोलकर लिखें',
    micListening: 'सुन रहे हैं... रोकने के लिए दबाएं',
    micUnsupported: 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया टाइप करें।',
    extractBtn: 'पात्र योजनाएं खोजें',
    extractingBtn: 'विवरण पढ़ा जा रहा है...',
    manualEntryBtn: 'सीधे फॉर्म भरकर जांचें',
    examplesHeading: 'उदाहरण आज़माएं:',
    howItWorksTitle: 'पारदर्शी एवं सुरक्षित प्रक्रिया',
    howStep1: '01. अपनी भाषा (हिंदी, अंग्रेजी या हिंग्लिश) में विवरण लिखें या बोलें।',
    howStep2: '02. प्रोफ़ाइल की पुष्टि करें — पात्रता का निर्णय नियम-आधारित कोड करता है।',
    howStep3: '03. आवश्यक दस्तावेज़ों की सूची टिक करें और सीधे आधिकारिक .gov.in पोर्टल पर आवेदन करें।',
    officialDisclaimer:
      'यह एक नागरिक सहायता पोर्टल है। वास्तविक पंजीकरण केवल आधिकारिक सरकारी वेबसाइट (.gov.in) पर होता है। कृपया अंतिम नियम आधिकारिक पोर्टल पर अवश्य जांचें।',
    confirmTitle: 'अपनी प्रोफ़ाइल की पुष्टि करें',
    confirmSubtitle:
      'आपके विवरण से निकाली गई जानकारी नीचे दी गई है। आप किसी भी खाने में बदलाव कर सकते हैं।',
    missingAlertTitle: 'कुछ जानकारी अधूरी है — सटीक परिणाम के लिए इन्हें भरें:',
    viewMatchesBtn: 'पात्र योजनाएं देखें',
    backToDescribeBtn: 'विवरण बदलें',
    resultsTitle: 'आपकी प्रोफ़ाइल के अनुसार पात्र योजनाएं',
    allSchemesTitle: 'सभी 12 प्रमुख केंद्रीय सरकारी योजनाएं',
    editProfileBtn: 'प्रोफ़ाइल बदलें',
    eligibleCountLabel: 'पूर्ण पात्र योजनाएं',
    verifyCountLabel: 'अधूरी जानकारी जांचें',
    whyEligibleLabel: 'आप क्यों पात्र हैं',
    benefitsLabel: 'मुख्य लाभ',
    documentsLabel: 'आवश्यक दस्तावेज़',
    stepsLabel: 'आवेदन की प्रक्रिया',
    applyOfficialBtn: 'आधिकारिक साइट पर आवेदन करें',
    saveSchemeBtn: 'ट्रैकर में सेव करें',
    savedSchemeBtn: 'ट्रैकर में सेव है',
    viewDetailsBtn: 'दस्तावेज़ चेकलिस्ट व विवरण',
    simplifyAiBtn: 'सरल शब्दों में समझें',
    simplifyingAiBtn: 'सरल किया जा रहा है...',
  },
};
