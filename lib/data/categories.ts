import type { Category } from '../types';

export const categories: Category[] = [
  {
    slug: 'ayurveda-basics',
    name: { en: 'Ayurveda Basics', te: 'ఆయుర్వేద ప్రాథమికాలు' },
    icon: 'Leaf',
    description: {
      en: 'Core principles and foundations of Ayurveda',
      te: 'ఆయుర్వేద మూలభూత సూత్రాలు మరియు పునాదులు',
    },
  },
  {
    slug: 'daily-routine',
    name: { en: 'Daily Routine', te: 'దినచర్య' },
    icon: 'Sun',
    description: {
      en: 'Dinacharya — Ayurvedic daily wellness practices',
      te: 'దినచర్య — ఆయుర్వేద దైనందిన ఆరోగ్య ఆచారాలు',
    },
  },
  {
    slug: 'food-nutrition',
    name: { en: 'Food & Nutrition', te: 'ఆహారం & పోషణ' },
    icon: 'UtensilsCrossed',
    description: {
      en: 'Ayurvedic principles of eating and nutrition',
      te: 'ఆహారం మరియు పోషణపై ఆయుర్వేద సూత్రాలు',
    },
  },
  {
    slug: 'herbs',
    name: { en: 'Herbs', te: 'మూలికలు' },
    icon: 'Sprout',
    description: {
      en: 'Medicinal plants and herbs in Ayurveda',
      te: 'ఆయుర్వేదంలో ఔషధ మొక్కలు మరియు మూలికలు',
    },
  },
  {
    slug: 'spices',
    name: { en: 'Spices', te: 'సుగంధ ద్రవ్యాలు' },
    icon: 'Flame',
    description: {
      en: 'Indian spices and their Ayurvedic properties',
      te: 'భారతీయ సుగంధ ద్రవ్యాలు మరియు వాటి ఆయుర్వేద గుణాలు',
    },
  },
  {
    slug: 'yoga',
    name: { en: 'Yoga', te: 'యోగ' },
    icon: 'PersonStanding',
    description: {
      en: 'Yoga asanas and practices for wellness',
      te: 'ఆరోగ్యం కోసం యోగాసనాలు మరియు అభ్యాసాలు',
    },
  },
  {
    slug: 'meditation',
    name: { en: 'Meditation', te: 'ధ్యానం' },
    icon: 'Brain',
    description: {
      en: 'Dhyana — meditation and mindfulness practices',
      te: 'ధ్యానం — ధ్యానం మరియు మైండ్‌ఫుల్‌నెస్ అభ్యాసాలు',
    },
  },
  {
    slug: 'sleep-relaxation',
    name: { en: 'Sleep & Relaxation', te: 'నిద్ర & విశ్రాంతి' },
    icon: 'Moon',
    description: {
      en: 'Ayurvedic approaches to restful sleep',
      te: 'సుఖప్రదమైన నిద్రకు ఆయుర్వేద పద్ధతులు',
    },
  },
  {
    slug: 'stress-management',
    name: { en: 'Stress Management', te: 'ఒత్తిడి నిర్వహణ' },
    icon: 'Waves',
    description: {
      en: 'Managing stress with Ayurvedic wisdom',
      te: 'ఆయుర్వేద జ్ఞానంతో ఒత్తిడి నిర్వహణ',
    },
  },
  {
    slug: 'skin-hair-care',
    name: { en: 'Skin & Hair Care', te: 'చర్మ & జుట్టు సంరక్షణ' },
    icon: 'Sparkles',
    description: {
      en: 'Natural beauty and self-care from Ayurveda',
      te: 'ఆయుర్వేదం నుండి సహజ సౌందర్య సంరక్షణ',
    },
  },
  {
    slug: 'digestion-gut',
    name: { en: 'Digestion & Gut Wellness', te: 'జీర్ణక్రియ & ఆంత్ర ఆరోగ్యం' },
    icon: 'CircleDot',
    description: {
      en: 'Agni, digestion and gut health in Ayurveda',
      te: 'అగ్ని, జీర్ణక్రియ మరియు ఆంత్ర ఆరోగ్యం',
    },
  },
  {
    slug: 'seasonal-living',
    name: { en: 'Seasonal Living', te: 'ఋతుపు జీవితం' },
    icon: 'CloudSun',
    description: {
      en: 'Ritucharya — adapting to seasonal changes',
      te: 'ఋతుచర్య — ఋతువులకు అనుగుణంగా జీవితం',
    },
  },
  {
    slug: 'women-wellness',
    name: { en: "Women's Wellness", te: 'మహిళల ఆరోగ్యం' },
    icon: 'Flower2',
    description: {
      en: 'Ayurvedic education for women\u2019s health',
      te: 'మహిళల ఆరోగ్యం కోసం ఆయుర్వేద విద్య',
    },
  },
  {
    slug: 'men-wellness',
    name: { en: "Men's Wellness", te: 'పురుషుల ఆరోగ్యం' },
    icon: 'Shield',
    description: {
      en: 'Ayurvedic education for men\u2019s health',
      te: 'పురుషుల ఆరోగ్యం కోసం ఆయుర్వేద విద్య',
    },
  },
  {
    slug: 'family-wellness',
    name: { en: 'Family Wellness', te: 'కుటుంబ ఆరోగ్యం' },
    icon: 'Users',
    description: {
      en: 'Wellness practices for the whole family',
      te: 'మొత్తం కుటుంబానికి ఆరోగ్య ఆచారాలు',
    },
  },
  {
    slug: 'senior-wellness',
    name: { en: 'Senior Wellness', te: 'వృద్ధుల ఆరోగ్యం' },
    icon: 'Heart',
    description: {
      en: 'Ayurveda for healthy aging and elder care',
      te: 'ఆరోగ్యకరమైన వృద్ధాప్యం కోసం ఆయుర్వేదం',
    },
  },
  {
    slug: 'children-wellness',
    name: { en: "Children's Wellness", te: 'పిల్లల ఆరోగ్యం' },
    icon: 'Baby',
    description: {
      en: 'General wellness education for children',
      te: 'పిల్లల కోసం సాధారణ ఆరోగ్య విద్య',
    },
  },
  {
    slug: 'beauty-self-care',
    name: { en: 'Beauty & Self-Care', te: 'అందం & స్వీయ సంరక్షణ' },
    icon: 'Flower',
    description: {
      en: 'Traditional beauty rituals and self-care',
      te: 'సంప్రదాయ సౌందర్య ఆచారాలు మరియు స్వీయ సంరక్షణ',
    },
  },
  {
    slug: 'traditional-foods',
    name: { en: 'Indian Traditional Foods', te: 'భారతీయ సంప్రదాయ ఆహారాలు' },
    icon: 'Soup',
    description: {
      en: 'Regional Indian foods and their Ayurvedic roots',
      te: 'ప్రాంతీయ భారతీయ ఆహారాలు మరియు వాటి ఆయుర్వేద మూలాలు',
    },
  },
  {
    slug: 'ayurveda-history',
    name: { en: 'Ayurveda History', te: 'ఆయుర్వేద చరిత్ర' },
    icon: 'ScrollText',
    description: {
      en: 'The history and evolution of Ayurveda',
      te: 'ఆయుర్వేద చరిత్ర మరియు పరిణామం',
    },
  },
  {
    slug: 'sanskrit-concepts',
    name: { en: 'Sanskrit Ayurveda Concepts', te: 'సంస్కృత ఆయుర్వేద భావనలు' },
    icon: 'BookOpen',
    description: {
      en: 'Fundamental Sanskrit concepts in Ayurveda',
      te: 'ఆయుర్వేదంలో ప్రాథమిక సంస్కృత భావనలు',
    },
  },
];
