import type { Ebook } from '../types';
import { panchamahabhutaTridoshaEbook } from './books/panchamahabhuta-tridosha';

export const ebooks: Ebook[] = [
  panchamahabhutaTridoshaEbook,
  {
    slug: 'ayurveda-for-beginners',
    title: {
      en: 'Ayurveda for Beginners',
      te: 'ఆయుర్వేదం ప్రారంభకుల కోసం',
    },
    subtitle: {
      en: 'A Complete Introduction to Ancient Indian Wellness',
      te: 'ప్రాచీన భారతీయ ఆరోగ్య సంప్రదాయానికి పూర్తి పరిచయం',
    },
    description: {
      en: 'Start your Ayurveda journey with this comprehensive guide. Learn the core principles, doshas, daily routines, and how to bring Ayurvedic wisdom into modern life.',
      te: 'ఈ సమగ్ర మార్గదర్శకంతో మీ ఆయుర్వేద ప్రయాణాన్ని ప్రారంభించండి. మూల సూత్రాలు, దోషాలు, దైనందిన ఆచారాలు మరియు ఆయుర్వేద జ్ఞానాన్ని ఆధునిక జీవితంలోకి తీసుకురావడం నేర్చుకోండి.',
    },
    coverQuery: 'ayurveda herbs wellness',
    category: 'ayurveda-basics',
    language: 'en',
    readingTime: 45,
    rating: 4.8,
    reviewCount: 342,
    isPremium: false,
    isFree: true,
    price: 0,
    author: {
      en: 'Evergreen Ayurveda',
      te: 'ఎవర్‌గ్రీన్ ఆయుర్వేద',
    },
    featured: true,
    trending: true,
    newRelease: false,
    tags: ['beginners', 'doshas', 'dinacharya', 'fundamentals'],
    chapters: [
      {
        id: 'ch1',
        title: { en: 'What is Ayurveda?', te: 'ఆయుర్వేదం అంటే ఏమిటి?' },
        content: {
          en: 'Ayurveda, which translates to "the science of life," is one of the world\'s oldest holistic healing systems. Originating in India over 5,000 years ago, it offers a profound framework for understanding the relationship between body, mind, and spirit.\n\nAt its core, Ayurveda views each person as a unique combination of elements and energies. Rather than offering a one-size-fits-all approach, it recognizes that what works for one person may not work for another.\n\nThe word "Ayurveda" comes from two Sanskrit words: "Ayur" meaning life, and "Veda" meaning knowledge or science. Together, they represent a system that encompasses not just medicine, but a way of living in harmony with nature.\n\nAyurveda\'s foundational texts — the Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya — were written thousands of years ago and continue to guide practitioners today. These texts cover everything from internal medicine and surgery to pediatrics, psychology, and spiritual healing.',
          te: 'ఆయుర్వేదం అంటే "జీవిత శాస్త్రం", ఇది ప్రపంచంలోని అత్యంత పురాతన సంపూర్ణ వైద్య వ్యవస్థలలో ఒకటి. 5,000 సంవత్సరాల క్రితం భారతదేశంలో ఉద్భవించిన ఇది, శరీరం, మనస్సు మరియు ఆత్మ మధ్య సంబంధాన్ని అర్థం చేసుకోవడానికి లోతైన చట్రాన్ని అందిస్తుంది.\n\nదాని మూలంలో, ఆయుర్వేదం ప్రతి వ్యక్తిని మూలకాలు మరియు శక్తుల యొక్క ప్రత్యేక మిశ్రమంగా పరిగణిస్తుంది. అందరికీ ఒకే విధమైన విధానాన్ని అందించకుండా, ఒక వ్యక్తికి పని చేసేది మరొకరికి పని చేయకపోవచ్చు అని గుర్తిస్తుంది.\n\n"ఆయుర్వేదం" అనే పదం రెండు సంస్కృత పదాల నుండి వచ్చింది: "ఆయుర్" అంటే జీవితం, "వేద" అంటే జ్ఞానం లేదా శాస్త్రం. కలిసి, అవి కేవలం వైద్యం మాత్రమే కాకుండా, ప్రకృతితో సామరస్యంగా జీవించే మార్గాన్ని సూచిస్తాయి.',
        },
      },
      {
        id: 'ch2',
        title: { en: 'The Five Elements (Pancha Mahabhuta)', te: 'పంచ మహాభూతాలు' },
        content: {
          en: 'Ayurveda teaches that everything in the universe, including the human body, is composed of five great elements or Pancha Mahabhutas:\n\n1. Akasha (Ether/Space) — the field that holds everything\n2. Vayu (Air) — movement and circulation\n3. Agni (Fire) — transformation and metabolism\n4. Jala (Water) — cohesion and fluidity\n5. Prithvi (Earth) — structure and stability\n\nThese elements combine in different proportions to form the three doshas — Vata, Pitta, and Kapha — which govern all biological, psychological, and physiopathological functions of the body, mind, and consciousness.',
          te: 'ఆయుర్వేదం ప్రకారం విశ్వంలోని ప్రతిదీ, మానవ శరీరం సహా, ఐదు మహా భూతాలతో కూడుకున్నది:\n\n1. ఆకాశం (అంతరిక్షం/స్థలం) — అన్నింటినీ పట్టి ఉంచే క్షేత్రం\n2. వాయువు (గాలి) — కదలిక మరియు ప్రసరణ\n3. అగ్ని (అగ్ని) — పరివర్తన మరియు చయాపచయ క్రియ\n4. జల (నీరు) — సంబద్ధం మరియు ద్రవ్యత\n5. పృథ్వి (భూమి) — నిర్మాణం మరియు స్థిరత్వం',
        },
      },
      {
        id: 'ch3',
        title: { en: 'The Three Doshas', te: 'మూడు దోషాలు' },
        content: {
          en: 'The three doshas — Vata, Pitta, and Kapha — are the biological energies that govern all functions of the body and mind. Each person has a unique constitution (Prakriti) that is determined by the proportion of these doshas at birth.\n\nVata (Air + Ether): Governs movement, circulation, breathing, and the nervous system. People with dominant Vata tend to be thin, energetic, and creative.\n\nPitta (Fire + Water): Governs digestion, metabolism, and transformation. Pitta-dominant individuals tend to be focused, ambitious, and warm.\n\nKapha (Earth + Water): Governs structure, stability, and lubrication. Kapha-dominant people tend to be calm, grounded, and strong.\n\nUnderstanding your constitution is the first step toward personalized wellness in Ayurveda.',
          te: 'మూడు దోషాలు — వాత, పిత్త, కఫ — శరీరం మరియు మనస్సు యొక్క అన్ని కార్యాలను నియంత్రించే జీవ శక్తులు. ప్రతి వ్యక్తి పుట్టుకతో వచ్చే ప్రకృతిని ఈ దోషాల నిష్పత్తి నిర్ణయిస్తుంది.\n\nవాత (గాలి + అంతరిక్షం): కదలిక, ప్రసరణ, శ్వాస మరియు నాడీ వ్యవస్థను నియంత్రిస్తుంది.\n\nపిత్త (అగ్ని + నీరు): జీర్ణక్రియ, చయాపచయ క్రియ మరియు పరివర్తనను నియంత్రిస్తుంది.\n\nకఫ (భూమి + నీరు): నిర్మాణం, స్థిరత్వం మరియు స్నిగ్ధతను నియంత్రిస్తుంది.',
        },
      },
    ],
  },
  {
    slug: 'dinacharya-daily-routine',
    title: {
      en: 'Dinacharya: The Ayurvedic Daily Routine',
      te: 'దినచర్య: ఆయుర్వేద దైనందిన ఆచారం',
    },
    subtitle: {
      en: 'Align Your Life with Natural Rhythms',
      te: 'మీ జీవితాన్ని సహజ లయలతో సమన్వయం చేయండి',
    },
    description: {
      en: 'Discover how to structure your day according to Ayurvedic principles. Learn the ideal times for waking, eating, exercise, work, and rest to optimize your wellbeing.',
      te: 'ఆయుర్వేద సూత్రాల ప్రకారం మీ రోజును ఎలా నిర్మాణించాలో తెలుసుకోండి. మీ ఆరోగ్యాన్ని అనుకూలంగా మార్చడానికి మేల్కొలుపు, తినడం, వ్యాయామం, పని, మరియు విశ్రాంతికి సరైన సమయాలను నేర్చుకోండి.',
    },
    coverQuery: 'sunrise meditation yoga',
    category: 'daily-routine',
    language: 'en',
    readingTime: 35,
    rating: 4.9,
    reviewCount: 218,
    isPremium: true,
    isFree: false,
    price: 499,
    author: { en: 'Evergreen Ayurveda', te: 'ఎవర్‌గ్రీన్ ఆయుర్వేద' },
    featured: true,
    trending: true,
    newRelease: false,
    tags: ['dinacharya', 'daily routine', 'lifestyle', 'wellness'],
    chapters: [
      {
        id: 'ch1',
        title: { en: 'Waking Up: Brahma Muhurta', te: 'మేల్కొలుపు: బ్రహ్మ ముహూర్తం' },
        content: {
          en: 'In Ayurveda, the ideal time to wake is during Brahma Muhurta — approximately 90 minutes before sunrise. This early morning period, between 4:30 and 6:00 AM, is considered the most pure and peaceful time of day.\n\nDuring this time, the atmosphere is fresh, the mind is clear, and the energy of nature is supportive of spiritual practices. Waking during Brahma Muhurta is said to promote clarity, positivity, and vitality throughout the day.\n\nWhile this may seem early for modern lifestyles, even gradually shifting your wake time earlier can bring noticeable benefits. Start by waking 15 minutes earlier each week until you reach your desired time.',
          te: 'ఆయుర్వేదం ప్రకారం, మేల్కొనే సరైన సమయం బ్రహ్మ ముహూర్తం — సూర్యోదయానికి దాదాపు 90 నిమిషాల ముందు. ఉదయం 4:30 నుండి 6:00 మధ్య ఈ సమయం, రోజులో అత్యంత పవిత్రమైన మరియు ప్రశాంతమైన సమయంగా పరిగణిస్తారు.\n\nఈ సమయంలో వాతావరణం తాజాగా, మనస్సు స్పష్టంగా ఉంటుంది, ప్రకృతి శక్తి ఆధ్యాత్మిక అభ్యాసాలకు అనుకూలంగా ఉంటుంది. బ్రహ్మ ముహూర్తంలో మేల్కొవడం రోజంతా స్పష్టత, సానుకూలత మరియు ఉత్సాహాన్ని ప్రోత్సహిస్తుందని చెబుతారు.',
        },
      },
      {
        id: 'ch2',
        title: { en: 'Morning Cleansing Practices', te: 'ఉదయం శుద్ధి ఆచారాలు' },
        content: {
          en: 'Ayurveda recommends a sequence of morning practices to cleanse and prepare the body and mind for the day:\n\n1. Tongue Scraping (Jihva Nirlekhana): Using a copper or steel tongue scraper to remove toxins accumulated overnight.\n\n2. Oil Pulling (Gandusha): Swishing sesame or coconut oil in the mouth for several minutes to promote oral health.\n\n3. Drinking Warm Water: A glass of warm water upon waking helps stimulate digestion and elimination.\n\n4. Nasal Cleansing (Nasya): Applying a few drops of sesame oil or ghee in the nostrils to clear the nasal passages.',
          te: 'ఆయుర్వేదం రోజుకు శరీరం మరియు మనస్సును శుద్ధి చేయడానికి మరియు సిద్ధం చేయడానికి ఉదయం ఆచారాల క్రమాన్ని సిఫార్సు చేస్తుంది:\n\n1. నాలుక రుబ్బుకోవడం: రాత్రిపూట పేరుకున్న విషపదార్థాలను తొలగించడానికి రాగి లేదా స్టీల్ నాలుక స్క్రాపర్ ఉపయోగించడం.\n\n2. ఆయిల్ పుల్లింగ్: నోటి ఆరోగ్యాన్ని ప్రోత్సహించడానికి నువ్వుల లేదా కొబ్బరి నూనెను నోటిలో కొంతసేపు తిప్పడం.\n\n3. వేడి నీరు తాగడం: మేల్కొలుపు వెంటనే ఒక గ్లాస్ వేడి నీరు జీర్ణక్రియను ఉత్తేజపరచడానికి సహాయపడుతుంది.',
        },
      },
    ],
  },
  {
    slug: 'herbs-of-india',
    title: {
      en: 'Herbs of India: A Complete Guide',
      te: 'భారతీయ మూలికలు: పూర్తి మార్గదర్శకం',
    },
    subtitle: {
      en: 'Traditional Knowledge and Modern Understanding',
      te: 'సంప్రదాయ జ్ఞానం మరియు ఆధునిక అవగాహన',
    },
    description: {
      en: 'Explore the most important herbs in Ayurveda — from turmeric and ashwagandha to tulsi and brahmi. Learn their traditional uses, preparations, and safety considerations.',
      te: 'ఆయుర్వేదంలో అత్యంత ముఖ్యమైన మూలికలను అన్వేషించండి — పసుపు మరియు అశ్వగంధ నుండి తులసి మరియు బ్రాహ్మి వరకు. వాటి సంప్రదాయ ఉపయోగాలు, తయారీలు, మరియు భద్రతా జాగ్రత్తలను నేర్చుకోండి.',
    },
    coverQuery: 'indian herbs spices ayurveda',
    category: 'herbs',
    language: 'en',
    readingTime: 60,
    rating: 4.7,
    reviewCount: 189,
    isPremium: true,
    isFree: false,
    price: 699,
    author: { en: 'Evergreen Ayurveda', te: 'ఎవర్‌గ్రీన్ ఆయుర్వేద' },
    featured: true,
    trending: false,
    newRelease: true,
    tags: ['herbs', 'turmeric', 'ashwagandha', 'tulsi', 'neem'],
    chapters: [
      {
        id: 'ch1',
        title: { en: 'Introduction to Ayurvedic Herbs', te: 'ఆయుర్వేద మూలికల పరిచయం' },
        content: {
          en: 'Ayurveda recognizes thousands of herbs, each with unique properties and traditional uses. In this guide, we explore the most significant herbs that have been used for centuries in Indian wellness traditions.\n\nIt is important to understand that Ayurvedic herbs are traditionally used as part of a holistic approach to wellness, not as isolated treatments. The traditional knowledge surrounding these herbs has been passed down through generations and documented in classical texts.',
          te: 'ఆయుర్వేదం వేలాది మూలికలను గుర్తిస్తుంది, ప్రతి ఒక్కటి ప్రత్యేక గుణాలు మరియు సంప్రదాయ ఉపయోగాలను కలిగి ఉంటుంది. ఈ మార్గదర్శకంలో, భారతీయ ఆరోగ్య సంప్రదాయాలలో శతాబ్దాలుగా ఉపయోగించబడుతున్న అత్యంత ముఖ్యమైన మూలికలను అన్వేషిస్తాం.',
        },
      },
    ],
  },
  {
    slug: 'telugu-ayurveda-padham',
    title: {
      en: 'Ayurveda Basics (Telugu)',
      te: 'ఆయుర్వేదం పాఠం',
    },
    subtitle: {
      en: 'తెలుగులో ఆయుర్వేద ప్రాథమిక జ్ఞానం',
      te: 'తెలుగులో ఆయుర్వేద ప్రాథమిక జ్ఞానం',
    },
    description: {
      en: 'A foundational introduction to Ayurveda written in natural Telugu for Telugu-speaking families.',
      te: 'తెలుగు మాట్లాడే కుటుంబాల కోసం సహజ తెలుగులో రాసిన ఆయుర్వేద పరిచయం.',
    },
    coverQuery: 'ayurveda traditional indian medicine',
    category: 'ayurveda-basics',
    language: 'te',
    readingTime: 40,
    rating: 4.9,
    reviewCount: 156,
    isPremium: false,
    isFree: true,
    price: 0,
    author: { en: 'Evergreen Ayurveda', te: 'ఎవర్‌గ్రీన్ ఆయుర్వేద' },
    featured: true,
    trending: true,
    newRelease: false,
    tags: ['telugu', 'beginners', 'fundamentals', 'doshas'],
    chapters: [
      {
        id: 'ch1',
        title: { en: 'What is Ayurveda?', te: 'ఆయుర్వేదం అంటే ఏమిటి?' },
        content: {
          en: 'Ayurveda is the ancient Indian system of wellness.',
          te: 'ఆయుర్వేదం అనేది "జీవిత శాస్త్రం" అని అర్థం. భారతదేశంలో 5,000 సంవత్సరాల క్రితం ఉద్భవించిన ఇది, ప్రపంచంలోని అత్యంత పురాతన సంపూర్ణ ఆరోగ్య వ్యవస్థలలో ఒకటి.\n\nఆయుర్వేదం ప్రతి వ్యక్తిని ప్రత్యేకంగా పరిగణిస్తుంది. అందరికీ ఒకే విధమైన చికిత్స కాకుండా, ప్రతి ఒక్కరి శరీర స్వభావాన్ని బట్టి తగిన సలహాలు ఇస్తుంది.\n\n"ఆయుర్" అంటే జీవితం, "వేద" అంటే జ్ఞానం. ఆయుర్వేదం కేవలం వైద్యం మాత్రమే కాదు, ప్రకృతితో సామరస్యంగా జీవించే మార్గం.',
        },
      },
      {
        id: 'ch2',
        title: { en: 'Three Doshas', te: 'మూడు దోషాలు' },
        content: {
          en: 'The three doshas are Vata, Pitta, and Kapha.',
          te: 'ఆయుర్వేదం ప్రకారం శరీరంలో మూడు దోషాలు ఉన్నాయి — వాత, పిత్త, కఫ. ఈ మూడు దోషాల సమతుల్యతను బట్టి మన ఆరోగ్యం ఉంటుంది.\n\nవాత (గాలి + అంతరిక్షం): శరీరంలో కదలిక, ప్రసరణ, శ్వాస నియంత్రిస్తుంది.\n\nపిత్త (అగ్ని + నీరు): జీర్ణక్రియ, చయాపచయ క్రియ నియంత్రిస్తుంది.\n\nకఫ (భూమి + నీరు): శరీర నిర్మాణం, స్థిరత్వం నియంత్రిస్తుంది.',
        },
      },
    ],
  },
  {
    slug: 'telugu-dinacharya',
    title: {
      en: 'Dinacharya in Telugu',
      te: 'దినచర్య — ఆయుర్వేద దైనందిన ఆచారం',
    },
    subtitle: {
      en: 'Daily Ayurveda routine in Telugu',
      te: 'తెలుగులో ఆయుర్వేద దైనందిన ఆచారం',
    },
    description: {
      en: 'Learn how to follow an Ayurvedic daily routine, written naturally in Telugu for Telugu families.',
      te: 'ఆయుర్వేద దైనందిన ఆచారాన్ని ఎలా పాటించాలో తెలుగు కుటుంబాల కోసం సహజ తెలుగులో తెలుసుకోండి.',
    },
    coverQuery: 'indian morning routine wellness',
    category: 'daily-routine',
    language: 'te',
    readingTime: 30,
    rating: 4.8,
    reviewCount: 98,
    isPremium: false,
    isFree: true,
    price: 0,
    author: { en: 'Evergreen Ayurveda', te: 'ఎవర్‌గ్రీన్ ఆయుర్వేద' },
    featured: false,
    trending: true,
    newRelease: false,
    tags: ['telugu', 'dinacharya', 'daily routine', 'lifestyle'],
    chapters: [
      {
        id: 'ch1',
        title: { en: 'Waking Up', te: 'ఉదయం మేల్కొలుపు' },
        content: {
          en: 'Wake up early during Brahma Muhurta.',
          te: 'ఆయుర్వేదం ప్రకారం, ఉదయం సూర్యోదయానికి 90 నిమిషాల ముందు — బ్రహ్మ ముహూర్తంలో మేల్కోవడం ఉత్తమం. ఈ సమయంలో మనస్సు ప్రశాంతంగా మరియు స్పష్టంగా ఉంటుంది. రోజంతా ఉత్సాహంగా ఉండటానికి ఈ సమయంలో మేల్కోవడం సహాయపడుతుంది.',
        },
      },
      {
        id: 'ch2',
        title: { en: 'Morning Cleansing', te: 'ఉదయం శుద్ధి' },
        content: {
          en: 'Tongue scraping, drinking warm water.',
          te: 'ఉదయం లేచిన తర్వాత:\n\n1. నాలుక కడిగి రాగి లేదా స్టీల్ స్క్రాపర్‌తో నాలుక రుబ్బడం\n2. వేడి నీరు తాగడం — జీర్ణక్రియను ఉత్తేజపరచడానికి\n3. నోటిలో నువ్వుల నూనె తిప్పడం — నోటి ఆరోగ్యం కోసం\n4. ముఖం కడుక్కోవడం — చల్లని నీటితో',
        },
      },
    ],
  },
  {
    slug: 'ayurveda-food-nutrition',
    title: {
      en: 'Ayurveda Food & Nutrition',
      te: 'ఆయుర్వేద ఆహారం & పోషణ',
    },
    subtitle: {
      en: 'Eating According to Your Constitution',
      te: 'మీ ప్రకృతికి అనుగుణంగా ఆహారం',
    },
    description: {
      en: 'Learn how to eat according to Ayurvedic principles. Understand the six tastes, food combinations, and how to optimize digestion for your unique constitution.',
      te: 'ఆయుర్వేద సూత్రాల ప్రకారం ఎలా తినాలో నేర్చుకోండి. ఆరు రుచులు, ఆహార సంయోగాలు, మరియు మీ ప్రత్యేక ప్రకృతికి జీర్ణక్రియను ఎలా అనుకూలంగా మార్చాలో తెలుసుకోండి.',
    },
    coverQuery: 'healthy indian food vegetables',
    category: 'food-nutrition',
    language: 'en',
    readingTime: 50,
    rating: 4.6,
    reviewCount: 127,
    isPremium: true,
    isFree: false,
    price: 399,
    author: { en: 'Evergreen Ayurveda', te: 'ఎవర్‌గ్రీన్ ఆయుర్వేద' },
    featured: false,
    trending: false,
    newRelease: true,
    tags: ['food', 'nutrition', 'agni', 'six tastes'],
    chapters: [
      {
        id: 'ch1',
        title: { en: 'The Six Tastes (Rasa)', te: 'ఆరు రుచులు (రస)' },
        content: {
          en: 'In Ayurveda, all foods are classified according to six tastes or Rasas. A balanced meal should ideally contain all six tastes:\n\n1. Madhura (Sweet) — builds tissues, grounding\n2. Amla (Sour) — stimulates digestion\n3. Lavana (Salty) — maintains mineral balance\n4. Katu (Pungent) — stimulates metabolism\n5. Tikta (Bitter) — detoxifying\n6. Kashaya (Astringent) — absorbing',
          te: 'ఆయుర్వేదంలో అన్ని ఆహారాలను ఆరు రుచుల ప్రకారం వర్గీకరిస్తారు. సమతుల్య భోజనంలో ఆరు రుచులు ఉండాలి:\n\n1. మధుర (తీపి) — కణజాలాలను నిర్మిస్తుంది\n2. ఆమ్ల (పులుపు) — జీర్ణక్రియను ఉత్తేజపరుస్తుంది\n3. లవణ (ఉప్పు) — ఖనిజ సమతుల్యతను కాపాడుతుంది\n4. కటు (కారం) — చయాపచయ క్రియను ఉత్తేజపరుస్తుంది\n5. టిక్త (కషాయం) — విషహరిణ\n6. కషాయ (కణుపు) — శోషిస్తుంది',
        },
      },
    ],
  },
  {
    slug: 'yoga-ayurveda',
    title: {
      en: 'Yoga and Ayurveda',
      te: 'యోగ మరియు ఆయుర్వేదం',
    },
    subtitle: {
      en: 'Sister Sciences for Complete Wellness',
      te: 'సంపూర్ణ ఆరోగ్యం కోసం సోదర శాస్త్రాలు',
    },
    description: {
      en: 'Explore the deep connection between Yoga and Ayurveda. Learn how asanas, pranayama, and meditation complement Ayurvedic principles for holistic wellness.',
      te: 'యోగ మరియు ఆయుర్వేదం మధ్య లోతైన సంబంధాన్ని అన్వేషించండి. ఆసనాలు, ప్రాణాయామం, మరియు ధ్యానం ఆయుర్వేద సూత్రాలను ఎలా అనుబంధిస్తాయో తెలుసుకోండి.',
    },
    coverQuery: 'yoga meditation pose',
    category: 'yoga',
    language: 'en',
    readingTime: 40,
    rating: 4.7,
    reviewCount: 145,
    isPremium: false,
    isFree: true,
    price: 0,
    author: { en: 'Evergreen Ayurveda', te: 'ఎవర్‌గ్రీన్ ఆయుర్వేద' },
    featured: false,
    trending: false,
    newRelease: false,
    tags: ['yoga', 'pranayama', 'meditation', 'wellness'],
    chapters: [
      {
        id: 'ch1',
        title: { en: 'The Sister Sciences', te: 'సోదర శాస్త్రాలు' },
        content: {
          en: 'Yoga and Ayurveda are often called sister sciences, both originating from the same Vedic tradition. While Ayurveda focuses on the health of the body and mind, Yoga focuses on the union of body, mind, and spirit.\n\nTogether, they offer a comprehensive system for wellbeing. Ayurveda provides the foundation — proper diet, daily routine, and lifestyle — while Yoga provides practices for physical health, mental clarity, and spiritual growth.',
          te: 'యోగ మరియు ఆయుర్వేదాన్ని తరచుగా సోదర శాస్త్రాలు అని పిలుస్తారు, రెండూ ఒకే వేద సంప్రదాయం నుండి ఉద్భవించాయి. ఆయుర్వేదం శరీరం మరియు మనస్సు ఆరోగ్యంపై దృష్టి సారిస్తే, యోగ శరీరం, మనస్సు, ఆత్మ ఐక్యతపై దృష్టి సారిస్తుంది.',
        },
      },
    ],
  },
];

export function getEbookBySlug(slug: string): Ebook | undefined {
  return ebooks.find((e) => e.slug === slug);
}

export function getFeaturedEbooks(): Ebook[] {
  return ebooks.filter((e) => e.featured);
}

export function getTrendingEbooks(): Ebook[] {
  return ebooks.filter((e) => e.trending);
}

export function getNewEbooks(): Ebook[] {
  return ebooks.filter((e) => e.newRelease);
}

export function getEbooksByCategory(category: string): Ebook[] {
  return ebooks.filter((e) => e.category === category);
}

export function getEbooksByLanguage(lang: string): Ebook[] {
  return ebooks.filter((e) => e.language === lang);
}

export function getTeluguEbooks(): Ebook[] {
  return ebooks.filter((e) => e.language === 'te');
}

export function getEnglishEbooks(): Ebook[] {
  return ebooks.filter((e) => e.language === 'en');
}
