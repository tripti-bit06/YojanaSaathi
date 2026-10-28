import {
  CitizenProfile,
  EducationLevel,
  Gender,
  MatchResult,
  Occupation,
  Scheme,
  SocialCategory,
} from '../types';

const OCCUPATION_LABELS: Record<Occupation, { en: string; hi: string }> = {
  student: { en: 'Student', hi: 'विद्यार्थी' },
  farmer: { en: 'Farmer', hi: 'किसान' },
  daily_wage: { en: 'Daily Wage Worker', hi: 'दिहाड़ी कामगार' },
  street_vendor: { en: 'Street Vendor', hi: 'पथ विक्रेता (रेहड़ी-पटरी)' },
  artisan: { en: 'Artisan / Craftsperson', hi: 'कारीगर / शिल्पकार' },
  self_employed: { en: 'Self-Employed', hi: 'स्वरोज़गार' },
  homemaker: { en: 'Homemaker', hi: 'गृहिणी' },
  salaried: { en: 'Salaried Employee', hi: 'वेतनभोगी कर्मचारी' },
  unemployed: { en: 'Job Seeker / Unemployed', hi: 'बेरोज़गार / काम की तलाश' },
  senior_citizen: { en: 'Senior Citizen / Retired', hi: 'वरिष्ठ नागरिक / सेवानिवृत्त' },
};

const EDUCATION_LABELS: Record<EducationLevel, { en: string; hi: string }> = {
  none: { en: 'No Formal Schooling', hi: 'कोई औपचारिक शिक्षा नहीं' },
  primary: { en: 'Primary / Middle (Up to Class 8)', hi: 'प्राथमिक / मिडिल (कक्षा 8 तक)' },
  secondary: { en: 'Secondary (Class 9–10)', hi: 'माध्यमिक (कक्षा 9–10)' },
  higher_secondary: { en: 'Higher Secondary (Class 11–12)', hi: 'उच्च माध्यमिक (कक्षा 11–12)' },
  diploma: { en: 'ITI / Polytechnic Diploma', hi: 'आईटीआई / पॉलिटेक्निक डिप्लोमा' },
  undergraduate: { en: 'Undergraduate (College Degree)', hi: 'स्नातक (कॉलेज डिग्री)' },
  postgraduate: { en: 'Postgraduate / Doctoral', hi: 'स्नातकोत्तर / पीएचडी' },
};

const GENDER_LABELS: Record<Gender, { en: string; hi: string }> = {
  male: { en: 'Male', hi: 'पुरुष' },
  female: { en: 'Female', hi: 'महिला / बालिका' },
  other: { en: 'Other', hi: 'अन्य' },
};

export function formatRupees(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    const formatted = Number.isInteger(lakhs) ? lakhs.toString() : lakhs.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatRupeesHi(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    const formatted = Number.isInteger(lakhs) ? lakhs.toString() : lakhs.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} लाख`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Pure deterministic TypeScript eligibility matching function.
 * IMPORTANT: Eligibility is NEVER decided by an LLM. Every condition is evaluated transparently here.
 */
export function matchSchemesAgainstProfile(
  schemes: Scheme[],
  profile: CitizenProfile
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const scheme of schemes) {
    const { eligibility } = scheme;
    let disqualified = false;
    const reasons: string[] = [];
    const reasons_hi: string[] = [];
    const missingForScheme: (keyof CitizenProfile)[] = [];

    // 1. Age check
    if (eligibility.min_age !== null || eligibility.max_age !== null) {
      if (profile.age === null) {
        missingForScheme.push('age');
      } else {
        if (eligibility.min_age !== null && profile.age < eligibility.min_age) {
          disqualified = true;
        } else if (eligibility.max_age !== null && profile.age > eligibility.max_age) {
          disqualified = true;
        } else {
          const minStr = eligibility.min_age ?? 0;
          const maxStr = eligibility.max_age ?? 100;
          reasons.push(`age ${profile.age} is within ${minStr}–${maxStr} yrs`);
          reasons_hi.push(`आयु ${profile.age} वर्ष (${minStr}–${maxStr} वर्ष की सीमा में)`);
        }
      }
    }

    if (disqualified) continue;

    // 2. Annual Income check
    if (eligibility.max_income !== null) {
      if (profile.annual_income === null) {
        missingForScheme.push('annual_income');
      } else if (profile.annual_income > eligibility.max_income) {
        disqualified = true;
      } else {
        reasons.push(
          `annual income ${formatRupees(profile.annual_income)} is within ${formatRupees(eligibility.max_income)} limit`
        );
        reasons_hi.push(
          `वार्षिक आय ${formatRupeesHi(profile.annual_income)} (${formatRupeesHi(eligibility.max_income)} की अधिकतम सीमा के भीतर)`
        );
      }
    }

    if (disqualified) continue;

    // 3. Gender check
    if (eligibility.gender !== 'ALL') {
      if (profile.gender === null) {
        missingForScheme.push('gender');
      } else if (profile.gender !== eligibility.gender) {
        disqualified = true;
      } else {
        reasons.push(`gender is ${GENDER_LABELS[profile.gender].en}`);
        reasons_hi.push(`लिंग ${GENDER_LABELS[profile.gender].hi} है`);
      }
    }

    if (disqualified) continue;

    // 4. Social Category check
    if (!eligibility.categories.includes('ALL')) {
      if (profile.category === null) {
        missingForScheme.push('category');
      } else if (!eligibility.categories.includes(profile.category)) {
        disqualified = true;
      } else {
        reasons.push(`category is ${profile.category}`);
        reasons_hi.push(`सामाजिक वर्ग ${profile.category} है`);
      }
    }

    if (disqualified) continue;

    // 5. State check
    if (!eligibility.states.includes('ALL')) {
      if (!profile.state) {
        missingForScheme.push('state');
      } else {
        const normalizedState = profile.state.trim().toLowerCase();
        const stateMatch = eligibility.states.some(
          (s) => s.trim().toLowerCase() === normalizedState
        );
        if (!stateMatch) {
          disqualified = true;
        } else {
          reasons.push(`available in ${profile.state}`);
          reasons_hi.push(`${profile.state} राज्य में लागू`);
        }
      }
    } else if (profile.state) {
      reasons.push(`all-India central scheme (${profile.state})`);
      reasons_hi.push(`अखिल भारतीय केंद्रीय योजना (${profile.state})`);
    }

    if (disqualified) continue;

    // 6. Occupation check
    if (!eligibility.occupations.includes('ALL')) {
      if (profile.occupation === null) {
        missingForScheme.push('occupation');
      } else if (!eligibility.occupations.includes(profile.occupation)) {
        disqualified = true;
      } else {
        reasons.push(`occupation is ${OCCUPATION_LABELS[profile.occupation].en}`);
        reasons_hi.push(`पेशा ${OCCUPATION_LABELS[profile.occupation].hi} है`);
      }
    }

    if (disqualified) continue;

    // 7. Education level check
    if (!eligibility.education_levels.includes('ALL')) {
      if (profile.education_level === null) {
        missingForScheme.push('education_level');
      } else if (!eligibility.education_levels.includes(profile.education_level)) {
        disqualified = true;
      } else {
        reasons.push(
          `education level (${EDUCATION_LABELS[profile.education_level].en}) qualifies`
        );
        reasons_hi.push(
          `शिक्षा स्तर (${EDUCATION_LABELS[profile.education_level].hi}) पात्र है`
        );
      }
    }

    if (disqualified) continue;

    // 8. Disability check
    if (eligibility.requires_disability) {
      if (profile.disability === null) {
        missingForScheme.push('disability');
      } else if (!profile.disability) {
        disqualified = true;
      } else {
        reasons.push('applicable for persons with benchmark disability (PwD)');
        reasons_hi.push('दिव्यांगजन श्रेणी (PwD) के लिए विशेष रूप से लागू');
      }
    }

    if (disqualified) continue;

    // Only surface needs_verification if at most 2 fields are missing for this scheme
    if (missingForScheme.length > 2) continue;

    const matchType = missingForScheme.length === 0 ? 'eligible' : 'needs_verification';

    const summaryReason =
      matchType === 'eligible'
        ? `Matches because ${reasons.join(', ')}.`
        : `Potentially matches (${reasons.join(', ') || 'central scheme'}), but please confirm ${missingForScheme
            .map((f) => f.replace('_', ' '))
            .join(' & ')}.`;

    const summaryReason_hi =
      matchType === 'eligible'
        ? `पात्रता का कारण: ${reasons_hi.join(', ')}।`
        : `संभावित पात्रता (${reasons_hi.join(', ') || 'केंद्रीय योजना'}), कृपया ${missingForScheme
            .map((f) => f.replace('_', ' '))
            .join(' व ')} की पुष्टि करें।`;

    results.push({
      scheme,
      matchType,
      reasons,
      reasons_hi,
      missingForScheme,
      summaryReason,
      summaryReason_hi,
    });
  }

  // Sort confirmed eligible schemes first, then by specificity (more matched criteria first)
  return results.sort((a, b) => {
    if (a.matchType !== b.matchType) {
      return a.matchType === 'eligible' ? -1 : 1;
    }
    return b.reasons.length - a.reasons.length;
  });
}

export { OCCUPATION_LABELS, EDUCATION_LABELS, GENDER_LABELS };
