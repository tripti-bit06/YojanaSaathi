/**
 * Shared TypeScript types for Yojana Saathi
 */

export type Language = 'en' | 'hi';

export type Gender = 'male' | 'female' | 'other';

export type SocialCategory = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';

export type Occupation =
  | 'student'
  | 'farmer'
  | 'daily_wage'
  | 'street_vendor'
  | 'artisan'
  | 'self_employed'
  | 'homemaker'
  | 'salaried'
  | 'unemployed'
  | 'senior_citizen';

export type EducationLevel =
  | 'none'
  | 'primary'
  | 'secondary'
  | 'higher_secondary'
  | 'diploma'
  | 'undergraduate'
  | 'postgraduate';

export type ApplicationStatus = 'saved' | 'docs_ready' | 'applied' | 'approved';

export interface CitizenProfile {
  age: number | null;
  gender: Gender | null;
  category: SocialCategory | null;
  annual_income: number | null;
  state: string | null;
  occupation: Occupation | null;
  education_level: EducationLevel | null;
  disability: boolean | null;
}

export interface ExtractResponse {
  profile: CitizenProfile;
  missing_fields: (keyof CitizenProfile)[];
  extracted_note?: string;
  used_fallback?: boolean;
}

export interface SchemeEligibility {
  min_age: number | null;
  max_age: number | null;
  max_income: number | null;
  categories: string[]; // ["ALL"] or SocialCategory[]
  states: string[]; // ["ALL"] or state names
  education_levels: string[]; // ["ALL"] or EducationLevel[]
  gender: 'ALL' | Gender;
  occupations: string[]; // ["ALL"] or Occupation[]
  requires_disability?: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  name_hi: string;
  category: string;
  category_hi: string;
  ministry: string;
  ministry_hi: string;
  description: string;
  description_hi: string;
  eligibility: SchemeEligibility;
  benefits: string;
  benefits_hi: string;
  documents: string[];
  documents_hi: string[];
  steps: string[];
  steps_hi: string[];
  official_url: string;
  verification_note: string;
  verification_note_hi: string;
}

export interface MatchResult {
  scheme: Scheme;
  matchType: 'eligible' | 'needs_verification';
  reasons: string[];
  reasons_hi: string[];
  missingForScheme: (keyof CitizenProfile)[];
  summaryReason: string;
  summaryReason_hi: string;
}

export interface SavedApplication {
  schemeId: string;
  status: ApplicationStatus;
  checkedDocuments: string[];
  notes?: string;
  updatedAt: string;
}

export interface SimplifiedSchemeExplanation {
  simplified_summary: string;
  key_takeaways: string[];
  action_tip: string;
}

export interface FormFieldExplanation {
  field_name: string;
  plain_meaning: string;
  how_to_fill: string;
  example_value: string;
  common_mistake: string;
}

export interface FormExplanationResult {
  form_title: string;
  overall_purpose: string;
  fields: FormFieldExplanation[];
  safety_note: string;
}

export interface CitizenSessionUser {
  uid: string;
  name: string;
  email: string;
}

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;
