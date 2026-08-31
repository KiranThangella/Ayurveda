import type { Language } from './i18n';

export interface BilingualText {
  en: string;
  te: string;
}

export interface Herb {
  slug: string;
  commonName: string;
  teluguName: string;
  sanskritName: string;
  englishName: string;
  botanicalName: string;
  regionalNames: { language: string; name: string }[];
  category: string;
  imageQuery: string;
  imageUrl?: string;
  imagePhotographer?: string;
  introduction: BilingualText;
  traditionalDescription: BilingualText;
  traditionalUses: BilingualText[];
  commonPreparations: BilingualText[];
  foodUses: BilingualText;
  culturalHistory: BilingualText;
  growingInfo: BilingualText;
  storageInfo: BilingualText;
  safetyInfo: BilingualText;
  interactions?: BilingualText;
  references: string[];
  whenToConsult: BilingualText;
}

export interface EbookChapter {
  id: string;
  title: BilingualText;
  content: BilingualText;
}

export interface Ebook {
  id?: string;
  slug: string;
  title: BilingualText;
  subtitle: BilingualText;
  description: BilingualText;
  coverQuery: string;
  coverImage?: string;
  category: string;
  language: Language;
  readingTime: number;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  isFree: boolean;
  price: number;
  author: BilingualText;
  chapters: EbookChapter[];
  tags: string[];
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
}

export interface AyurvedaTopic {
  slug: string;
  title: BilingualText;
  teluguTitle: string;
  englishTitle: string;
  category: string;
  introduction: BilingualText;
  traditionalPerspective: BilingualText;
  modernUnderstanding: BilingualText;
  traditionalUses: BilingualText;
  culturalContext: BilingualText;
  safetyNotes: BilingualText;
  contraindications?: BilingualText;
  whenToConsult: BilingualText;
  references: string[];
}

export interface Category {
  slug: string;
  name: BilingualText;
  icon: string;
  description: BilingualText;
  parent?: string;
}

export interface Dosha {
  slug: 'vata' | 'pitta' | 'kapha';
  name: BilingualText;
  elements: BilingualText;
  qualities: BilingualText;
  description: BilingualText;
  characteristics: BilingualText[];
  balancing: BilingualText[];
  description2: BilingualText;
}

export interface DailyContent {
  herb: { name: BilingualText; text: BilingualText };
  fact: BilingualText;
  food: BilingualText;
  concept: { sanskrit: string; meaning: BilingualText };
  quote: BilingualText;
  seasonal: BilingualText;
  recommendedEbookSlug: string;
}
