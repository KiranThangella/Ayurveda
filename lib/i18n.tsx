'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

export type Language = 'en' | 'te';

export interface LanguageOption {
  code: Language;
  nativeName: string;
  englishName: string;
  script: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    script: 'Latin',
  },
  {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    script: 'Telugu',
  },
];

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  toggleLang: () => void;
  dir: 'ltr';
  isTelugu: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  en: {
    'brand.name': 'Evergreen Ayurveda',
    'brand.tagline': 'Ancient Wisdom. Modern Understanding.',

    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.search': 'Search',
    'nav.library': 'My Library',
    'nav.profile': 'Profile',
    'nav.herbs': 'Herbs',
    'nav.ebooks': 'Ebooks',
    'nav.dosha': 'Doshas',
    'nav.daily': 'Daily Wisdom',
    'nav.generate': 'Create Ebook',
    'nav.admin': 'Admin',
    'nav.login': 'Sign In',
    'nav.signup': 'Get Started',

    'hero.title': 'Discover the Wisdom of Ayurveda',
    'hero.subtitle': 'Explore timeless Indian wellness traditions through beautifully designed ebooks, guides and educational resources.',
    'hero.cta.explore': 'Explore Ayurveda',
    'hero.cta.generate': 'Create My Ebook',
    'hero.cta.ebooks': 'Explore Ebooks',

    'section.featured': 'Featured Ebooks',
    'section.featured.sub': 'Premium and popular ebooks handpicked for you',
    'section.explore': 'Explore Ayurveda',
    'section.explore.sub': 'Browse topics across the breadth of Ayurvedic knowledge',
    'section.herbs': 'Herbs of India',
    'section.herbs.sub': 'Discover the healing plants of Ayurvedic tradition',
    'section.telugu': 'Learn in Telugu',
    'section.telugu.sub': 'A native Telugu experience for Ayurveda wisdom',
    'section.english': 'Discover Ayurveda in English',
    'section.english.sub': 'A premium global perspective on Indian wellness',
    'section.daily': "Today's Ayurveda Wisdom",
    'section.recommended': 'Recommended for You',
    'section.why': 'Why Learn Ayurveda With Us?',
    'section.start': 'Start Your Journey',
    'section.popularTelugu': 'Popular in Telugu',
    'section.popularWorldwide': 'Popular Worldwide',
    'section.trending': 'Trending This Week',
    'section.newEbooks': 'New Ebooks',
    'section.because': 'Because You Read',

    'card.readTime': 'min read',
    'card.free': 'Free',
    'card.premium': 'Premium',
    'card.readNow': 'Read Now',
    'card.learnMore': 'Learn More',
    'card.startReading': 'Start Reading',
    'card.viewAll': 'View All',
    'card.rating': 'Rating',

    'herbs.title': 'Herb Library',
    'herbs.subtitle': 'An interactive guide to Ayurvedic herbs and plants',
    'herbs.search': 'Search herbs...',
    'herbs.commonName': 'Common Name',
    'herbs.teluguName': 'Telugu Name',
    'herbs.sanskritName': 'Sanskrit Name',
    'herbs.botanicalName': 'Botanical Name',
    'herbs.traditionalUses': 'Traditional Uses',
    'herbs.preparations': 'Common Preparations',
    'herbs.culturalHistory': 'Cultural History',
    'herbs.safetyInfo': 'Safety Information',
    'herbs.growingInfo': 'Growing Information',
    'herbs.storageInfo': 'Storage Information',
    'herbs.foodUses': 'Food Uses',
    'herbs.references': 'References',

    'ebook.reader': 'Ebook Reader',
    'ebook.chapters': 'Chapters',
    'ebook.bookmark': 'Bookmark',
    'ebook.highlight': 'Highlight',
    'ebook.notes': 'Notes',
    'ebook.search': 'Search in book',
    'ebook.progress': 'Progress',
    'ebook.fontSize': 'Font Size',
    'ebook.darkMode': 'Dark Mode',
    'ebook.lightMode': 'Light Mode',
    'ebook.next': 'Next Chapter',
    'ebook.prev': 'Previous Chapter',
    'ebook.contents': 'Table of Contents',
    'ebook.continue': 'Continue Reading',

    'generate.title': 'Create Your Ebook',
    'generate.subtitle': 'Generate a personalized Ayurveda ebook with AI',
    'generate.step.language': 'Choose Language',
    'generate.step.topic': 'Choose Topic',
    'generate.step.audience': 'Choose Audience',
    'generate.step.level': 'Reading Level',
    'generate.step.length': 'Ebook Length',
    'generate.step.style': 'Writing Style',
    'generate.step.generate': 'Generate',
    'generate.next': 'Continue',
    'generate.back': 'Back',
    'generate.regenerate': 'Regenerate Section',
    'generate.generating': 'Generating your ebook...',

    'search.title': 'Search',
    'search.subtitle': 'Search across herbs, ebooks, topics and more',
    'search.placeholder': 'Search herbs, topics, ebooks...',
    'search.popular': 'Popular Searches',
    'search.related': 'Related Topics',
    'search.history': 'Search History',
    'search.noResults': 'No results found',
    'search.results': 'results',

    'dosha.title': 'Learn About Your Ayurveda Constitution',
    'dosha.subtitle': 'An educational introduction to the three doshas',
    'dosha.vata': 'Vata',
    'dosha.pitta': 'Pitta',
    'dosha.kapha': 'Kapha',
    'dosha.quiz': 'Take Educational Quiz',
    'dosha.disclaimer': 'This is an educational tool, not a medical diagnosis.',

    'daily.title': "Today's Ayurveda Wisdom",
    'daily.herb': 'Today\'s Herb',
    'daily.fact': 'Ayurveda Fact',
    'daily.food': 'Traditional Food Knowledge',
    'daily.concept': 'Sanskrit Concept',
    'daily.quote': 'Daily Quote',
    'daily.recommended': 'Recommended Ebook',
    'daily.seasonal': 'Seasonal Wellness',

    'auth.login': 'Sign In',
    'auth.signup': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.loginBtn': 'Sign In',
    'auth.signupBtn': 'Create Account',
    'auth.google': 'Continue with Google',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.languagePref': 'Language Preference',

    'library.title': 'My Library',
    'library.bookmarks': 'Bookmarks',
    'library.history': 'Reading History',
    'library.favorites': 'Favorites',
    'library.generated': 'Generated Ebooks',
    'library.purchases': 'Purchases',
    'library.downloads': 'Downloads',
    'library.empty': 'Nothing here yet. Start exploring to fill your library.',

    'admin.title': 'Admin Dashboard',
    'admin.users': 'Users',
    'admin.ebooks': 'Ebooks',
    'admin.categories': 'Categories',
    'admin.revenue': 'Revenue',
    'admin.aiGenerations': 'AI Generations',
    'admin.popularSearches': 'Popular Searches',
    'admin.safetyFlags': 'Safety Flags',
    'admin.overview': 'Overview',
    'admin.engagement': 'Engagement',

    'disclaimer.short': 'Educational information only. Not a substitute for professional medical advice.',
    'disclaimer.full': 'This platform provides educational information about Ayurveda and traditional wellness practices. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making changes to your wellness routine.',
    'disclaimer.warning': 'This page discusses topics involving health conditions. Please consult a qualified healthcare professional before acting on any information here.',

    'share.title': 'Share This Knowledge',
    'share.whatsapp': 'WhatsApp',
    'share.facebook': 'Facebook',
    'share.x': 'X',
    'share.copy': 'Copy Link',
    'share.copied': 'Copied!',

    'newsletter.title': 'Weekly Ayurveda Wisdom',
    'newsletter.subtitle': 'Get one herb, one concept, one ebook, and one wellness tip every week.',
    'newsletter.placeholder': 'Enter your email',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.langPref': 'Email language preference',

    'pricing.free': 'Free',
    'pricing.reader': 'Reader',
    'pricing.premium': 'Premium',
    'pricing.creator': 'Creator',
    'pricing.month': '/month',

    'cta.getStarted': 'Get Started Free',
    'cta.browseAll': 'Browse All Ebooks',
    'cta.exploreHerbs': 'Explore Herb Library',

    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.share': 'Share',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.viewAll': 'View All',
    'common.seeMore': 'See More',
  },
  te: {
    'brand.name': 'ఎవర్‌గ్రీన్ ఆయుర్వేద',
    'brand.tagline': 'ప్రాచీన జ్ఞానం. ఆధునిక అవగాహన.',

    'nav.home': 'హోమ్',
    'nav.explore': 'అన్వేషణ',
    'nav.search': 'శోధన',
    'nav.library': 'నా లైబ్రరీ',
    'nav.profile': 'ప్రొఫైల్',
    'nav.herbs': 'మూలికలు',
    'nav.ebooks': 'పుస్తకాలు',
    'nav.dosha': 'దోషాలు',
    'nav.daily': 'నేటి జ్ఞానం',
    'nav.generate': 'పుస్తకం సృష్టించండి',
    'nav.admin': 'అడ్మిన్',
    'nav.login': 'సైన్ ఇన్',
    'nav.signup': 'ప్రారంభించండి',

    'hero.title': 'ఆయుర్వేద జ్ఞానాన్ని కనుగొనండి',
    'hero.subtitle': 'అందమైన పుస్తకాలు, మార్గదర్శకాలు మరియు విద్యా వనరుల ద్వారా శాశ్వతమైన భారతీయ ఆరోగ్య సంప్రదాయాలను అన్వేషించండి.',
    'hero.cta.explore': 'ఆయుర్వేదం అన్వేషించండి',
    'hero.cta.generate': 'నా పుస్తకం సృష్టించండి',
    'hero.cta.ebooks': 'పుస్తకాలు చూడండి',

    'section.featured': 'ప్రతిష్ఠాత్మక పుస్తకాలు',
    'section.featured.sub': 'మీ కోసం ఎంపిక చేసిన ఉత్తమ పుస్తకాలు',
    'section.explore': 'ఆయుర్వేదం అన్వేషించండి',
    'section.explore.sub': 'ఆయుర్వేద జ్ఞాన విభాగాలను అన్వేషించండి',
    'section.herbs': 'భారతీయ మూలికలు',
    'section.herbs.sub': 'ఆయుర్వేద సంప్రదాయ మూలికలను తెలుసుకోండి',
    'section.telugu': 'తెలుగులో నేర్చుకోండి',
    'section.telugu.sub': 'ఆయుర్వేద జ్ఞానం కోసం స్వచ్ఛమైన తెలుగు అనుభవం',
    'section.english': 'ఇంగ్లీషులో ఆయుర్వేదం',
    'section.english.sub': 'భారతీయ ఆరోగ్య సంప్రదాయంపై ప్రపంచ దృక్పథం',
    'section.daily': 'నేటి ఆయుర్వేద జ్ఞానం',
    'section.recommended': 'మీ కోసం సిఫార్సు',
    'section.why': 'మాతో ఎందుకు నేర్చుకోవాలి?',
    'section.start': 'మీ ప్రయాణం ప్రారంభించండి',
    'section.popularTelugu': 'తెలుగులో ప్రాచుర్యం',
    'section.popularWorldwide': 'ప్రపంచవ్యాప్తంగా ప్రాచుర్యం',
    'section.trending': 'ఈ వారం ట్రెండింగ్',
    'section.newEbooks': 'కొత్త పుస్తకాలు',
    'section.because': 'మీరు చదివినవి',

    'card.readTime': 'నిమిషాలు',
    'card.free': 'ఉచితం',
    'card.premium': 'ప్రీమియం',
    'card.readNow': 'ఇప్పుడు చదవండి',
    'card.learnMore': 'మరింత తెలుసుకో',
    'card.startReading': 'చదవడం ప్రారంభించండి',
    'card.viewAll': 'అన్నీ చూడండి',
    'card.rating': 'రేటింగ్',

    'herbs.title': 'మూలికల పాఠశాల',
    'herbs.subtitle': 'ఆయుర్వేద మూలికలు మరియు మొక్కల పూర్తి పుస్తకం',
    'herbs.search': 'మూలికలు శోధించండి...',
    'herbs.commonName': 'సాధారణ పేరు',
    'herbs.teluguName': 'తెలుగు పేరు',
    'herbs.sanskritName': 'సంస్కృత పేరు',
    'herbs.botanicalName': 'వృక్షశాస్త్రీయ నామం',
    'herbs.traditionalUses': 'సంప్రదాయ ఉపయోగాలు',
    'herbs.preparations': 'సాధారణ తయారీలు',
    'herbs.culturalHistory': 'సాంస్కృతిక చరిత్ర',
    'herbs.safetyInfo': 'భద్రతా సమాచారం',
    'herbs.growingInfo': 'సాగు సమాచారం',
    'herbs.storageInfo': 'నిల్వ సమాచారం',
    'herbs.foodUses': 'ఆహార ఉపయోగాలు',
    'herbs.references': 'ప్రతిభ ప్రస్తావనలు',

    'ebook.reader': 'పుస్తక పఠనం',
    'ebook.chapters': 'అధ్యాయాలు',
    'ebook.bookmark': 'బుక్‌మార్క్',
    'ebook.highlight': 'హైలైట్',
    'ebook.notes': 'గమనికలు',
    'ebook.search': 'పుస్తకంలో శోధించండి',
    'ebook.progress': 'పురోగతి',
    'ebook.fontSize': 'అక్షర పరిమాణం',
    'ebook.darkMode': 'డార్క్ మోడ్',
    'ebook.lightMode': 'లైట్ మోడ్',
    'ebook.next': 'తదుపరి అధ్యాయం',
    'ebook.prev': 'మునుపటి అధ్యాయం',
    'ebook.contents': 'విషయ సూచిక',
    'ebook.continue': 'చదవడం కొనసాగించండి',

    'generate.title': 'మీ పుస్తకం సృష్టించండి',
    'generate.subtitle': 'AI ద్వారా వ్యక్తిగతీకరించిన ఆయుర్వేద పుస్తకం',
    'generate.step.language': 'భాష ఎంచుకోండి',
    'generate.step.topic': 'అంశం ఎంచుకోండి',
    'generate.step.audience': 'పఠనకారులు ఎంచుకోండి',
    'generate.step.level': 'పఠన స్థాయి',
    'generate.step.length': 'పుస్తక పొడవు',
    'generate.step.style': 'రచనా శైలి',
    'generate.step.generate': 'సృష్టించండి',
    'generate.next': 'కొనసాగండి',
    'generate.back': 'వెనుకకు',
    'generate.regenerate': 'విభాగం మళ్లీ సృష్టించండి',
    'generate.generating': 'మీ పుస్తకం సృష్టిస్తోంది...',

    'search.title': 'శోధన',
    'search.subtitle': 'మూలికలు, పుస్తకాలు, అంశాలు శోధించండి',
    'search.placeholder': 'మూలికలు, అంశాలు, పుస్తకాలు శోధించండి...',
    'search.popular': 'ప్రాచుర్యం పొందిన శోధనలు',
    'search.related': 'సంబంధిత అంశాలు',
    'search.history': 'శోధన చరిత్ర',
    'search.noResults': 'ఫలితాలు లేవు',
    'search.results': 'ఫలితాలు',

    'dosha.title': 'మీ ఆయుర్వేద ప్రకృతిని తెలుసుకోండి',
    'dosha.subtitle': 'మూడు దోషాల పరిచయం',
    'dosha.vata': 'వాత',
    'dosha.pitta': 'పిత్త',
    'dosha.kapha': 'కఫ',
    'dosha.quiz': 'విద్యా క్విజ్ తీసుకోండి',
    'dosha.disclaimer': 'ఇది విద్యా సాధనం, వైద్య నిర్ధారణ కాదు.',

    'daily.title': 'నేటి ఆయుర్వేద జ్ఞానం',
    'daily.herb': 'ఈరోజు మూలిక',
    'daily.fact': 'ఆయుర్వేద విషయం',
    'daily.food': 'సంప్రదాయ ఆహార జ్ఞానం',
    'daily.concept': 'సంస్కృత భావన',
    'daily.quote': 'నేటి వాక్యం',
    'daily.recommended': 'సిఫార్సు పుస్తకం',
    'daily.seasonal': 'ఋతుపు ఆరోగ్యం',

    'auth.login': 'సైన్ ఇన్',
    'auth.signup': 'ఖాతా సృష్టించండి',
    'auth.email': 'ఇమెయిల్',
    'auth.password': 'పాస్‌వర్డ్',
    'auth.name': 'పూర్తి పేరు',
    'auth.loginBtn': 'సైన్ ఇన్',
    'auth.signupBtn': 'ఖాతా సృష్టించండి',
    'auth.google': 'గూగుల్‌తో కొనసాగండి',
    'auth.noAccount': 'ఖాతా లేదా?',
    'auth.haveAccount': 'ఇప్పటికే ఖాతా ఉందా?',
    'auth.languagePref': 'భాష ప్రాధాన్యత',

    'library.title': 'నా లైబ్రరీ',
    'library.bookmarks': 'బుక్‌మార్క్‌లు',
    'library.history': 'చదివిన చరిత్ర',
    'library.favorites': 'ఇష్టమైనవి',
    'library.generated': 'సృష్టించిన పుస్తకాలు',
    'library.purchases': 'కొనుగోళ్లు',
    'library.downloads': 'డౌన్‌లోడ్‌లు',
    'library.empty': 'ఇంకా ఇక్కడ ఏమీ లేదు. అన్వేషణ ప్రారంభించండి.',

    'admin.title': 'అడ్మిన్ డ్యాష్‌బోర్డ్',
    'admin.users': 'వినియోగదారులు',
    'admin.ebooks': 'పుస్తకాలు',
    'admin.categories': 'వర్గాలు',
    'admin.revenue': 'ఆదాయం',
    'admin.aiGenerations': 'AI సృష్టి',
    'admin.popularSearches': 'ప్రాచుర్య శోధనలు',
    'admin.safetyFlags': 'భద్రతా హెచ్చరికలు',
    'admin.overview': 'అవలోకనం',
    'admin.engagement': 'నిమగ్నత',

    'disclaimer.short': 'విద్యా సమాచారం మాత్రమే. వృత్తిపరమైన వైద్య సలహాకు ప్రత్యామ్నాయం కాదు.',
    'disclaimer.full': 'ఈ వేదిక ఆయుర్వేదం మరియు సంప్రదాయ ఆరోగ్య పద్ధతుల గురించి విద్యా సమాచారం అందిస్తుంది. ఇది వృత్తిపరమైన వైద్య సలహా, నిర్ధారణ లేదా చికిత్సకు ప్రత్యామ్నాయం కాదు.',
    'disclaimer.warning': 'ఈ పేజీ ఆరోగ్య పరిస్థితులను చర్చిస్తుంది. దయచేసి ఒక అర్హత కలిగిన ఆరోగ్య నిపుణులను సంప్రదించండి.',

    'share.title': 'ఈ జ్ఞానాన్ని పంచుకోండి',
    'share.whatsapp': 'వాట్సాప్',
    'share.facebook': 'ఫేస్‌బుక్',
    'share.x': 'X',
    'share.copy': 'లింక్ కాపీ',
    'share.copied': 'కాపీ అయింది!',

    'newsletter.title': 'వారాంతపు ఆయుర్వేద జ్ఞానం',
    'newsletter.subtitle': 'ప్రతి వారం ఒక మూలిక, ఒక భావన, ఒక పుస్తకం, ఒక ఆరోగ్య చిట్కా.',
    'newsletter.placeholder': 'మీ ఇమెయిల్ నమోదు చేయండి',
    'newsletter.subscribe': 'సభ్యత్వం తీసుకోండి',
    'newsletter.langPref': 'ఇమెయిల్ భాష ప్రాధాన్యత',

    'pricing.free': 'ఉచితం',
    'pricing.reader': 'రీడర్',
    'pricing.premium': 'ప్రీమియం',
    'pricing.creator': 'క్రియేటర్',
    'pricing.month': '/నెల',

    'cta.getStarted': 'ఉచితంగా ప్రారంభించండి',
    'cta.browseAll': 'అన్ని పుస్తకాలు చూడండి',
    'cta.exploreHerbs': 'మూలికల పాఠశాల చూడండి',

    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'ఏదో తప్పు జరిగింది',
    'common.retry': 'మళ్లీ ప్రయత్నించండి',
    'common.close': 'మూసివేయి',
    'common.save': 'సేవ్',
    'common.cancel': 'రద్దు',
    'common.delete': 'తొలగించు',
    'common.edit': 'సవరించు',
    'common.share': 'పంచుకో',
    'common.back': 'వెనుకకు',
    'common.next': 'తదుపరి',
    'common.viewAll': 'అన్నీ చూడండి',
    'common.seeMore': 'మరిన్ని చూడండి',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('ayurveda-lang') : null;
    if (stored === 'en' || stored === 'te') {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayurveda-lang', newLang);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'te' : 'en');
  }, [lang, setLang]);

  const t = useCallback(
    (key: string) => {
      return translations[lang][key] ?? translations.en[key] ?? key;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      toggleLang,
      dir: 'ltr' as const,
      isTelugu: lang === 'te',
    }),
    [lang, setLang, t, toggleLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
