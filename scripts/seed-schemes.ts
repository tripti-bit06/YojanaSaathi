/**
 * Seed & validation script for data/schemes.json
 * Run via: npm run seed
 *
 * Validates all 12 central government schemes in data/schemes.json against
 * the required Yojana Saathi schema so they are ready for local server usage
 * or Firestore collection("schemes") upload when a Firebase service account is configured.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemesFile = path.resolve(__dirname, '..', 'data', 'schemes.json');

interface RawScheme {
  id: string;
  name: string;
  name_hi: string;
  category: string;
  description: string;
  description_hi: string;
  eligibility: {
    min_age: number | null;
    max_age: number | null;
    max_income: number | null;
    categories: string[];
    states: string[];
    education_levels: string[];
    gender: string;
    occupations: string[];
  };
  benefits: string;
  documents: string[];
  steps: string[];
  official_url: string;
}

function validateAndReport() {
  const raw = fs.readFileSync(schemesFile, 'utf-8');
  const schemes: RawScheme[] = JSON.parse(raw);

  if (!Array.isArray(schemes) || schemes.length < 12) {
    throw new Error(`Expected at least 12 schemes in data/schemes.json, found ${schemes.length}`);
  }

  for (const s of schemes) {
    const requiredStrings = [s.id, s.name, s.name_hi, s.category, s.description, s.description_hi, s.benefits, s.official_url];
    if (requiredStrings.some((val) => !val || typeof val !== 'string')) {
      throw new Error(`Invalid required string field on scheme ${s.id}`);
    }
    if (!Array.isArray(s.documents) || s.documents.length === 0) {
      throw new Error(`Missing documents[] on scheme ${s.id}`);
    }
    if (!Array.isArray(s.steps) || s.steps.length === 0) {
      throw new Error(`Missing steps[] on scheme ${s.id}`);
    }
    if (!s.official_url.startsWith('https://')) {
      throw new Error(`Official URL must be HTTPS on scheme ${s.id}`);
    }
  }

  console.log(`Validated ${schemes.length} central government schemes in data/schemes.json:`);
  for (const s of schemes) {
    console.log(` - [${s.id}] ${s.name} -> ${s.official_url}`);
  }
}

validateAndReport();
