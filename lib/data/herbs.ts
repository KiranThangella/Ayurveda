import type { Herb } from '../types';

export const herbs: Herb[] = [
  {
    slug: 'turmeric',
    commonName: 'Turmeric',
    teluguName: 'పసుపు',
    sanskritName: 'Haridra',
    englishName: 'Turmeric',
    botanicalName: 'Curcuma longa',
    regionalNames: [
      { language: 'Hindi', name: 'Haldi' },
      { language: 'Tamil', name: 'Manjal' },
      { language: 'Kannada', name: 'Arishina' },
      { language: 'Bengali', name: 'Holud' },
    ],
    category: 'herbs',
    imageQuery: 'turmeric powder roots',
    introduction: {
      en: 'Turmeric is one of the most widely used and revered herbs in Ayurveda. Known for its vibrant golden color, it has been a cornerstone of Indian cooking, ritual, and traditional medicine for thousands of years.',
      te: 'పసుపు ఆయుర్వేదంలో అత్యధికంగా ఉపయోగించబడే మరియు పూజనీయమైన మూలికలలో ఒకటి. దాని స్వర్ణవర్ణానికి ప్రసిద్ధి చెందిన ఇది, వేలాది సంవత్సరాలుగా భారతీయ వంటకాలు, ఆచారాలు మరియు సంప్రదాయ వైద్యంలో మూలస్తంభంగా నిలిచింది.',
    },
    traditionalDescription: {
      en: 'In Ayurveda, turmeric (Haridra) is described as bitter, pungent, and heating in nature. It is traditionally understood to balance all three doshas when used appropriately, and is considered especially beneficial for supporting healthy circulation, skin, and digestion.',
      te: 'ఆయుర్వేదంలో పసుపు (హరిద్ర) కషాయం, కారంగా మరియు వేడిగా ఉంటుందని వర్ణించబడింది. తగినట్లు ఉపయోగించినప్పుడు మూడు దోషాలను సమతుల్యం చేస్తుందని, ముఖ్యంగా రక్తప్రసరణ, చర్మం మరియు జీర్ణక్రియకు మేలు చేస్తుందని సంప్రదాయంగా చెబుతారు.',
    },
    traditionalUses: [
      {
        en: 'Traditionally used in Ayurveda to support healthy digestion and metabolism',
        te: 'జీర్ణక్రియ మరియు చయాపచయ క్రియకు మద్దతు ఇవ్వడానికి సంప్రదాయంగా ఉపయోగిస్తారు',
      },
      {
        en: 'Applied externally in traditional skin care pastes and Ubtan formulations',
        te: 'సంప్రదాయ చర్మ సంరక్షణ పేస్టులు మరియు ఉబ్టన్ తయారీలలో బాహ్యంగా ఉపయోగిస్తారు',
      },
      {
        en: 'Used in daily cooking as a spice believed to support overall wellness',
        te: 'మొత్తం ఆరోగ్యానికి మద్దతు ఇస్తుందని నమ్మే సుగంధ ద్రవ్యంగా దైనందిన వంటలో ఉపయోగిస్తారు',
      },
    ],
    commonPreparations: [
      {
        en: 'Golden Milk (Haldi Doodh): Turmeric mixed with warm milk, traditionally consumed before bed',
        te: 'గోల్డెన్ మిల్క్ (హల్దీ దూద్): పసుపును వేడి పాలలో కలిపి, సంప్రదాయంగా నిద్రకు ముందు తాగుతారు',
      },
      {
        en: 'Turmeric paste for external application on skin',
        te: 'చర్మంపై బాహ్య ప్రయోగం కోసం పసుపు పేస్ట్',
      },
    ],
    foodUses: {
      en: 'Turmeric is a staple spice in Indian cooking, used in curries, dals, rice dishes, and pickles. A pinch is often added to most savory dishes for color and flavor.',
      te: 'పసుపు భారతీయ వంటలో ఒక ముఖ్యమైన సుగంధ ద్రవ్యం, కూరలు, పప్పులు, అన్నం వంటకాలు మరియు ఊరగాయలలో ఉపయోగిస్తారు. రంగు మరియు రుచి కోసం చాలా కారం లేని వంటకాలకు కొద్దిగా జోడిస్తారు.',
    },
    culturalHistory: {
      en: 'Turmeric has been used in India for over 4,000 years. It holds sacred significance in Hindu rituals and ceremonies, symbolizing purity and prosperity. Turmeric paste is applied to brides and grooms in traditional wedding ceremonies.',
      te: 'పసుపు భారతదేశంలో 4,000 సంవత్సరాలుగా ఉపయోగించబడుతోంది. హిందూ ఆచారాలు మరియు వేడుకలలో ఇది పవిత్రత మరియు సంపదకు చిహ్నంగా ప్రాముఖ్యత కలిగి ఉంది. సంప్రదాయ వివాహ వేడుకలలో వధూవరులకు పసుపు పేస్ట్ పూస్తారు.',
    },
    growingInfo: {
      en: 'Turmeric grows in warm, humid climates with well-drained soil. It is a perennial plant that produces rhizomes, typically planted in late spring and harvested 8-10 months later.',
      te: 'పసుపు వేడి, తేమ వాతావరణంలో మంచి నీటి పారుదల గల నేలలో పెరుగుతుంది. ఇది ఒక బహువార్షిక మొక్క, దీని నుండి దుంపలు వస్తాయి, సాధారణంగా వసంతం చివరలో నాటి 8-10 నెలలకు కోస్తారు.',
    },
    storageInfo: {
      en: 'Store turmeric powder in an airtight container away from direct sunlight. Fresh rhizomes can be refrigerated for 1-2 weeks. Ground turmeric retains potency for about 6 months.',
      te: 'పసుపు పొడిని గాలి చొరబడని పాత్రలో సూర్యకాంతి నుండి దూరంగా నిల్వ చేయండి. తాజా దుంపలను 1-2 వారాలు ఫ్రిడ్జ్‌లో ఉంచవచ్చు. పొడి పసుపు 6 నెలల వరకు శక్తిని కలిగి ఉంటుంది.',
    },
    safetyInfo: {
      en: 'Turmeric is generally considered safe when used in culinary amounts. High doses of turmeric supplements may cause gastrointestinal discomfort. Turmeric may interact with blood-thinning medications. Consult a healthcare professional before taking turmeric supplements, especially if pregnant, nursing, or on medication.',
      te: 'వంట పరిమాణంలో ఉపయోగించినప్పుడు పసుపు సాధారణంగా సురక్షితం. పసుపు సప్లిమెంట్లు అధిక మోతాదులో జీర్ణ అసౌకర్యానికి కారణం కావచ్చు. పసుపు రక్తాన్ని పలుచగొట్టే మందులతో పరస్పర చర్య చేయవచ్చు. ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా మందులు వాడేవారు పసుపు సప్లిమెంట్లు తీసుకునే ముందు వైద్య నిపుణులను సంప్రదించండి.',
    },
    interactions: {
      en: 'May interact with anticoagulant and antiplatelet medications. Consult your doctor if taking blood thinners.',
      te: 'యాంటీకోయాగ్యులెంట్ మరియు యాంటీప్లేట్‌లెట్ మందులతో పరస్పర చర్య చేయవచ్చు. రక్తాన్ని పలుచగొట్టే మందులు వాడుతుంటే వైద్యులను సంప్రదించండి.',
    },
    references: [
      'Charaka Samhita — classical Ayurveda text',
      'Bhavaprakasha Nighantu — Ayurveda materia medica',
      'National Center for Complementary and Integrative Health (NCCIH)',
    ],
    whenToConsult: {
      en: 'Consult a qualified healthcare professional before using turmeric as a supplement, especially if you are pregnant, nursing, taking medications, or have a medical condition.',
      te: 'పసుపును సప్లిమెంట్‌గా ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు, మందులు వాడేవారు లేదా వైద్య పరిస్థితి ఉన్నవారు అర్హత కలిగిన ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
  },
  {
    slug: 'ashwagandha',
    commonName: 'Ashwagandha',
    teluguName: 'అశ్వగంధ',
    sanskritName: 'Ashwagandha',
    englishName: 'Winter Cherry / Indian Ginseng',
    botanicalName: 'Withania somnifera',
    regionalNames: [
      { language: 'Hindi', name: 'Asgandh' },
      { language: 'Tamil', name: 'Amukkara' },
      { language: 'Kannada', name: 'Hiremaddina gida' },
      { language: 'Marathi', name: 'Asonda' },
    ],
    category: 'herbs',
    imageQuery: 'ashwagandha root powder plant',
    introduction: {
      en: 'Ashwagandha is one of the most important herbs in Ayurveda, classified as a Rasayana — a rejuvenating herb. Its name translates to "smell of a horse," referring both to its distinct odor and the traditional belief that it imparts the strength of a horse.',
      te: 'అశ్వగంధ ఆయుర్వేదంలో అత్యంత ముఖ్యమైన మూలికలలో ఒకటి, దీనిని రసాయనం — పునరుజ్జీవన మూలికగా వర్గీకరించారు. దీని పేరుకు "గుర్రపు వాసన" అని అర్థం, ఇది దాని ప్రత్యేక వాసనకు మరియు గుర్రపు బలాన్ని ఇస్తుందనే సంప్రదాయ నమ్మకానికి సూచన.',
    },
    traditionalDescription: {
      en: 'In Ayurveda, Ashwagandha is classified as a Rasayana (rejuvenative) and is traditionally used to promote vitality, strength, and calm. It is considered warming and grounding, traditionally used to balance Vata dosha.',
      te: 'ఆయుర్వేదంలో అశ్వగంధను రసాయనం (పునరుజ్జీవనం) గా వర్గీకరించారు, సంప్రదాయంగా ఉత్సాహం, బలం మరియు ప్రశాంతతను ప్రోత్సహించడానికి ఉపయోగిస్తారు. ఇది వేడిగా మరియు స్థిరంగా ఉంటుందని, వాత దోషాన్ని సమతుల్యం చేయడానికి సంప్రదాయంగా ఉపయోగిస్తారు.',
    },
    traditionalUses: [
      {
        en: 'Traditionally used as an adaptogen to support the body\u2019s response to stress',
        te: 'ఒత్తిడికి శరీరం యొక్క ప్రతిస్పందనకు మద్దతు ఇవ్వడానికి అడాప్టోజెన్‌గా సంప్రదాయంగా ఉపయోగిస్తారు',
      },
      {
        en: 'Used to promote healthy sleep and relaxation in Ayurvedic tradition',
        te: 'ఆయుర్వేద సంప్రదాయంలో సుఖప్రదమైన నిద్ర మరియు విశ్రాంతిని ప్రోత్సహించడానికి ఉపయోగిస్తారు',
      },
      {
        en: 'Valued in Rasayana practices for promoting vitality and strength',
        te: 'ఉత్సాహం మరియు బలాన్ని ప్రోత్సహించడానికి రసాయన అభ్యాసాలలో విలువైనదిగా పరిగణిస్తారు',
      },
    ],
    commonPreparations: [
      {
        en: 'Churna (powder): Typically 1/4 to 1/2 teaspoon mixed with warm milk or water',
        te: 'చూర్ణం (పొడి): సాధారణంగా 1/4 నుండి 1/2 టీస్పూన్ వేడి పాలు లేదా నీటిలో కలిపి',
      },
      {
        en: 'Ashwagandha oil for external massage',
        te: 'బాహ్య మసాజ్ కోసం అశ్వగంధ నూనె',
      },
    ],
    foodUses: {
      en: 'Ashwagandha is primarily used as a supplement rather than in cooking. It is often mixed with warm milk and honey as a nighttime drink.',
      te: 'అశ్వగంధను ప్రధానంగా వంటలో కాకుండా సప్లిమెంట్‌గా ఉపయోగిస్తారు. తరచుగా వేడి పాలు మరియు తేనెతో రాత్రి పానీయంగా కలిపి తాగుతారు.',
    },
    culturalHistory: {
      en: 'Ashwagandha has been used in Ayurveda for over 3,000 years. It is mentioned in classical texts like the Charaka Samhita as a premier Rasayana herb, traditionally given to strengthen and rejuvenate.',
      te: 'అశ్వగంధ 3,000 సంవత్సరాలుగా ఆయుర్వేదంలో ఉపయోగించబడుతోంది. చరక సంహిత వంటి శాస్త్రీయ గ్రంథాలలో ఇది ప్రధాన రసాయన మూలికగా పేర్కొనబడింది, సంప్రదాయంగా బలవర్థకం మరియు పునరుజ్జీవనం కోసం ఇస్తారు.',
    },
    growingInfo: {
      en: 'Ashwagandha grows in dry regions of India, preferring sandy, well-drained soil. It is a hardy plant that requires minimal water and is typically harvested after 150-170 days.',
      te: 'అశ్వగంధ భారతదేశంలో పొడి ప్రాంతాలలో పెరుగుతుంది, ఇసుక, మంచి నీటి పారుదల గల నేలను ఇష్టపడుతుంది. ఇది కఠినమైన మొక్క, తక్కువ నీరు అవసరం, సాధారణంగా 150-170 రోజుల తర్వాత కోస్తారు.',
    },
    storageInfo: {
      en: 'Store ashwagandha powder in an airtight container in a cool, dry place. Roots can be stored whole for longer shelf life.',
      te: 'అశ్వగంధ పొడిని గాలి చొరబడని పాత్రలో చల్లని, పొడి ప్రదేశంలో నిల్వ చేయండి. వేర్లను మొత్తంగా ఎక్కువ కాలం నిల్వ ఉంచవచ్చు.',
    },
    safetyInfo: {
      en: 'Ashwagandha is generally well-tolerated in moderate amounts. It should be avoided during pregnancy unless supervised by a qualified practitioner. May interact with thyroid medications, sedatives, and immunosuppressants. Consult a healthcare professional before use.',
      te: 'అశ్వగంధ మధ్యస్థ మోతాదులో సాధారణంగా సహించదగినది. గర్భధారణ సమయంలో అర్హత కలిగిన వైద్యుల పర్యవేక్షణ లేకుండా నివారించాలి. థైరాయిడ్ మందులు, నిద్రమందులు మరియు రోగనిరోధక శక్తిని అణిచివేసే మందులతో పరస్పర చర్య చేయవచ్చు. ఉపయోగించే ముందు ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
    interactions: {
      en: 'May interact with thyroid medications, sedatives, blood pressure medications, and immunosuppressants. Consult your doctor before use.',
      te: 'థైరాయిడ్ మందులు, నిద్రమందులు, రక్తపోటు మందులు మరియు రోగనిరోధక శక్తిని అణిచివేసే మందులతో పరస్పర చర్య చేయవచ్చు. ఉపయోగించే ముందు వైద్యులను సంప్రదించండి.',
    },
    references: [
      'Charaka Samhita — Rasayana section',
      'Sushruta Samhita',
      'Indian Journal of Pharmacology — review of Withania somnifera',
    ],
    whenToConsult: {
      en: 'Consult a qualified healthcare professional before using ashwagandha, especially if pregnant, nursing, on thyroid or blood pressure medications, or having autoimmune conditions.',
      te: 'అశ్వగంధను ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు, థైరాయిడ్ లేదా రక్తపోటు మందులు వాడేవారు, లేదా ఆటోఇమ్యూన్ పరిస్థితులు ఉన్నవారు అర్హత కలిగిన ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
  },
  {
    slug: 'tulsi',
    commonName: 'Tulsi (Holy Basil)',
    teluguName: 'తులసి',
    sanskritName: 'Tulasi',
    englishName: 'Holy Basil',
    botanicalName: 'Ocimum sanctum',
    regionalNames: [
      { language: 'Hindi', name: 'Tulsi' },
      { language: 'Tamil', name: 'Thulasi' },
      { language: 'Kannada', name: 'Tulasi' },
      { language: 'Bengali', name: 'Tulshi' },
    ],
    category: 'herbs',
    imageQuery: 'tulsi holy basil plant leaves',
    introduction: {
      en: 'Tulsi, or Holy Basil, is revered in Indian culture as a sacred plant and is one of the most cherished herbs in Ayurveda. Found in many Indian homes, it is traditionally worshipped and valued for its purifying properties.',
      te: 'తులసి, లేదా పవిత్ర తులసి, భారతీయ సంస్కృతిలో పవిత్ర మొక్కగా పూజించబడుతుంది మరియు ఆయుర్వేదంలో అత్యంత ప్రీతిపాత్రమైన మూలికలలో ఒకటి. చాలా భారతీయ ఇళ్లలో కనిపిస్తుంది, సంప్రదాయంగా పూజించబడుతుంది మరియు శుద్ధి చేసే గుణాలకు విలువైనదిగా పరిగణిస్తారు.',
    },
    traditionalDescription: {
      en: 'In Ayurveda, Tulsi is considered a Rasayana herb. It is described as light, dry, and heating, traditionally used to clear respiratory channels, support immunity, and promote clarity of mind.',
      te: 'ఆయుర్వేదంలో తులసిని రసాయన మూలికగా పరిగణిస్తారు. ఇది తేలికగా, పొడిగా మరియు వేడిగా ఉంటుందని, శ్వాస మార్గాలను శుద్ధి చేయడానికి, రోగనిరోధక శక్తికి మద్దతు ఇవ్వడానికి మరియు మనస్సు స్పష్టతను ప్రోత్సహించడానికి సంప్రదాయంగా ఉపయోగిస్తారు.',
    },
    traditionalUses: [
      {
        en: 'Traditionally used in Ayurveda to support respiratory wellness',
        te: 'శ్వాసకోశ ఆరోగ్యానికి మద్దతు ఇవ్వడానికి ఆయుర్వేదంలో సంప్రదాయంగా ఉపయోగిస్తారు',
      },
      {
        en: 'Used in traditional kadha (herbal decoction) for daily wellness',
        te: 'దైనందిన ఆరోగ్యం కోసం సంప్రదాయ కాఢా (మూలికల కషాయం) లో ఉపయోగిస్తారు',
      },
      {
        en: 'Revered in Indian households for its spiritual and purifying significance',
        te: 'భారతీయ కుటుంబాలలో దీని ఆధ్యాత్మిక మరియు శుద్ధి ప్రాముఖ్యతకు గౌరవం',
      },
    ],
    commonPreparations: [
      {
        en: 'Tulsi tea: Fresh or dried leaves steeped in hot water',
        te: 'తులసి టీ: తాజా లేదా ఎండిన ఆకులను వేడి నీటిలో నానబెట్టి',
      },
      {
        en: 'Kadha: Herbal decoction with ginger, black pepper, and other herbs',
        te: 'కాఢా: అల్లం, నల్ల మిరియాలు మరియు ఇతర మూలికలతో కషాయం',
      },
    ],
    foodUses: {
      en: 'Tulsi is primarily consumed as a tea or decoction. Leaves are sometimes added to water for purification. It is not commonly used in cooking.',
      te: 'తులసిని ప్రధానంగా టీ లేదా కషాయంగా తాగుతారు. శుద్ధి కోసం ఆకులను కొన్నిసార్లు నీటిలో జోడిస్తారు. వంటలో సాధారణంగా ఉపయోగించరు.',
    },
    culturalHistory: {
      en: 'Tulsi is considered the most sacred plant in Hindu tradition. It is grown in courtyards and worshipped daily in many Indian homes. According to tradition, Tulsi is an incarnation of the goddess Lakshmi.',
      te: 'తులసి హిందూ సంప్రదాయంలో అత్యంత పవిత్రమైన మొక్కగా పరిగణిస్తారు. ఇది ఆంగణాలలో పెంచుతారు మరియు చాలా భారతీయ ఇళ్లలో దైనందిన పూజిస్తారు. సంప్రదాయం ప్రకారం, తులసి దేవత లక్ష్మీదేవి అవతారం.',
    },
    growingInfo: {
      en: 'Tulsi grows easily in warm climates with plenty of sunlight. It can be grown in pots or gardens and requires regular watering. The plant is perennial in tropical regions.',
      te: 'తులసి వేడి వాతావరణంలో సమృద్ధ సూర్యరశ్మితో సులభంగా పెరుగుతుంది. కుండలలో లేదా తోటలలో పెంచవచ్చు, క్రమం తప్పకుండా నీరు పాయించాలి. ఉష్ణమండల ప్రాంతాలలో ఇది బహువార్షిక మొక్క.',
    },
    storageInfo: {
      en: 'Fresh leaves can be kept for a few days in the refrigerator. Dried leaves should be stored in an airtight container away from moisture.',
      te: 'తాజా ఆకులను ఫ్రిడ్జ్‌లో కొన్ని రోజులు ఉంచవచ్చు. ఎండిన ఆకులను తేమ లేని గాలి చొరబడని పాత్రలో నిల్వ చేయాలి.',
    },
    safetyInfo: {
      en: 'Tulsi is generally safe when consumed in moderate amounts as tea. Excessive consumption may cause mild discomfort. Consult a healthcare professional if pregnant or on medications, as tulsi may have mild blood-thinning effects.',
      te: 'టీగా మధ్యస్థ మోతాదులో తీసుకున్నప్పుడు తులసి సాధారణంగా సురక్షితం. అధిక వినియోగం స్వల్ప అసౌకర్యానికి కారణం కావచ్చు. గర్భిణీలు లేదా మందులు వాడేవారు ఆరోగ్య నిపుణులను సంప్రదించండి, తులసికి స్వల్ప రక్తాన్ని పలుచగొట్టే గుణం ఉండవచ్చు.',
    },
    references: [
      'Charaka Samhita',
      'Bhavaprakasha Nighantu',
      'Journal of Ayurveda and Integrative Medicine',
    ],
    whenToConsult: {
      en: 'Consult a healthcare professional before using tulsi supplements, especially if pregnant, nursing, or on blood-thinning medications.',
      te: 'తులసి సప్లిమెంట్లు ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా రక్తాన్ని పలుచగొట్టే మందులు వాడేవారు ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
  },
  {
    slug: 'neem',
    commonName: 'Neem',
    teluguName: 'వేప',
    sanskritName: 'Nimba',
    englishName: 'Neem',
    botanicalName: 'Azadirachta indica',
    regionalNames: [
      { language: 'Hindi', name: 'Neem' },
      { language: 'Tamil', name: 'Vembu' },
      { language: 'Kannada', name: 'Bevu' },
      { language: 'Bengali', name: 'Nim' },
    ],
    category: 'herbs',
    imageQuery: 'neem tree leaves',
    introduction: {
      en: 'Neem is a versatile tree native to the Indian subcontinent, used in Ayurveda for centuries. Every part of the neem tree — leaves, bark, seeds, and oil — has traditional uses in wellness and skin care.',
      te: 'వేప భారత ఉపఖండానికి చెందిన బహుముఖ వృక్షం, శతాబ్దాలుగా ఆయుర్వేదంలో ఉపయోగించబడుతోంది. వేప చెట్టు ప్రతి భాగం — ఆకులు, బెరడు, గింజలు, నూనె — ఆరోగ్యం మరియు చర్మ సంరక్షణలో సంప్రదాయ ఉపయోగాలు కలిగి ఉంది.',
    },
    traditionalDescription: {
      en: 'In Ayurveda, neem is described as intensely bitter and cooling. It is traditionally used to purify the blood, support skin health, and balance Pitta and Kapha doshas. Neem is considered one of the most powerful detoxifying herbs in Ayurveda.',
      te: 'ఆయుర్వేదంలో వేప అత్యంత కషాయంగా మరియు చల్లగా ఉంటుందని వర్ణించబడింది. రక్తాన్ని శుద్ధి చేయడానికి, చర్మ ఆరోగ్యానికి మద్దతు ఇవ్వడానికి మరియు పిత్త మరియు కఫ దోషాలను సమతుల్యం చేయడానికి సంప్రదాయంగా ఉపయోగిస్తారు. వేప ఆయుర్వేదంలో అత్యంత శక్తివంతమైన విషహరిణ మూలికలలో ఒకటిగా పరిగణిస్తారు.',
    },
    traditionalUses: [
      {
        en: 'Traditionally used for skin wellness and in natural skin care preparations',
        te: 'చర్మ ఆరోగ్యం మరియు సహజ చర్మ సంరక్షణ తయారీలలో సంప్రదాయంగా ఉపయోగిస్తారు',
      },
      {
        en: 'Neem leaves used in traditional bathing rituals and skin pastes',
        te: 'సంప్రదాయ స్నాన ఆచారాలు మరియు చర్మ పేస్టులలో వేప ఆకులు ఉపయోగిస్తారు',
      },
      {
        en: 'Used in traditional dental care — chewing neem twigs as a natural brush',
        te: 'సంప్రదాయ దంత సంరక్షణలో — వేప కొమ్మలను సహజ బ్రష్‌గా నమలడం',
      },
    ],
    commonPreparations: [
      {
        en: 'Neem paste: Fresh leaves ground into paste for external application',
        te: 'వేప పేస్ట్: తాజా ఆకులను బాహ్య ప్రయోగం కోసం పేస్ట్‌గా రుబ్బి',
      },
      {
        en: 'Neem oil: Cold-pressed from seeds, used in skin care',
        te: 'వేప నూనె: గింజల నుండి కల్డ్-ప్రెస్డ్, చర్మ సంరక్షణలో ఉపయోగిస్తారు',
      },
    ],
    foodUses: {
      en: 'Neem is extremely bitter and not used in cooking in significant amounts. Tender neem leaves are sometimes consumed in small quantities at the start of meals in traditional practice.',
      te: 'వేప అత్యంత కషాయంగా ఉంటుంది మరియు వంటలో గణనీయమైన మోతాదులో ఉపయోగించరు. సంప్రదాయ పద్ధతిలో భోజనం ప్రారంభంలో మెత్తని వేప ఆకులను కొద్ది మోతాదులో తింటారు.',
    },
    culturalHistory: {
      en: 'Neem has been called the "village pharmacy" in India due to its wide range of traditional uses. It is deeply woven into Indian culture, used in Ugadi festival traditions and daily dental care practices.',
      te: 'వేపను భారతదేశంలో "గ్రామ ఔషధ శాల" అని పిలుస్తారు, దాని విస్తృత సంప్రదాయ ఉపయోగాల కారణంగా. ఇది భారతీయ సంస్కృతిలో లోతుగా నిండి ఉంది, ఉగాది పండుగ సంప్రదాయాలు మరియు దైనందిన దంత సంరక్షణ ఆచారాలలో ఉపయోగిస్తారు.',
    },
    growingInfo: {
      en: 'Neem is a hardy, fast-growing tree that thrives in tropical and subtropical climates. It is drought-resistant and can grow in poor soils, making it easy to cultivate.',
      te: 'వేప కఠినమైన, వేగంగా పెరిగే చెట్టు, ఉష్ణమండల మరియు ఉపఉష్ణమండల వాతావరణంలో బాగా పెరుగుతుంది. ఇది కరువు నిరోధకం, పేద నేలలలో కూడా పెరుగుతుంది, సులభంగా సాగు చేయవచ్చు.',
    },
    storageInfo: {
      en: 'Dried neem leaves can be stored for months in airtight containers. Neem oil should be stored in a cool, dark place.',
      te: 'ఎండిన వేప ఆకులను గాలి చొరబడని పాత్రలలో నెలల తరబడి నిల్వ చేయవచ్చు. వేప నూనెను చల్లని, చీకటి ప్రదేశంలో నిల్వ చేయాలి.',
    },
    safetyInfo: {
      en: 'Neem is generally safe for external use. Internal consumption should be limited and supervised. Neem oil should never be ingested. Avoid during pregnancy and breastfeeding. Consult a healthcare professional before internal use.',
      te: 'వేప బాహ్య ఉపయోగానికి సాధారణంగా సురక్షితం. అంతర్గత వినియోగం పరిమితంగా మరియు పర్యవేక్షణలో ఉండాలి. వేప నూనెను ఎప్పుడూ తీసుకోకూడదు. గర్భధారణ మరియు పాలిచ్చే సమయంలో నివారించండి. అంతర్గత ఉపయోగానికి ముందు ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
    references: [
      'Charaka Samhita',
      'Sushruta Samhita',
      'Bhavaprakasha Nighantu',
    ],
    whenToConsult: {
      en: 'Consult a qualified healthcare professional before using neem internally, especially if pregnant, nursing, or trying to conceive.',
      te: 'వేపను అంతర్గతంగా ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా గర్భధారణ ప్రయత్నించేవారు అర్హత కలిగిన ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
  },
  {
    slug: 'ginger',
    commonName: 'Ginger',
    teluguName: 'అల్లం',
    sanskritName: 'Shunti',
    englishName: 'Ginger',
    botanicalName: 'Zingiber officinale',
    regionalNames: [
      { language: 'Hindi', name: 'Adrak' },
      { language: 'Tamil', name: 'Inji' },
      { language: 'Kannada', name: 'Shunti' },
      { language: 'Bengali', name: 'Ada' },
    ],
    category: 'spices',
    imageQuery: 'ginger root fresh',
    introduction: {
      en: 'Ginger is one of the most widely used spices and herbs in both Ayurveda and Indian cooking. Known as a "universal medicine" in Ayurvedic tradition, it is valued for its warming properties and versatility.',
      te: 'అల్లం ఆయుర్వేదం మరియు భారతీయ వంటలో అత్యధికంగా ఉపయోగించబడే సుగంధ ద్రవ్యాలు మరియు మూలికలలో ఒకటి. ఆయుర్వేద సంప్రదాయంలో "సార్వత్రిక ఔషధం" గా పిలువబడుతుంది, దీని వేడి గుణాలు మరియు బహుముఖతకు విలువైనది.',
    },
    traditionalDescription: {
      en: 'In Ayurveda, ginger is described as pungent, sweet, and warming. It is traditionally used to kindle Agni (digestive fire), support digestion, and balance Vata and Kapha doshas. Fresh and dry ginger have somewhat different properties in Ayurveda.',
      te: 'ఆయుర్వేదంలో అల్లం కారంగా, తీపిగా మరియు వేడిగా ఉంటుందని వర్ణించబడింది. అగ్ని (జీర్ణ అగ్ని)ని ప్రజ్వలింపజేయడానికి, జీర్ణక్రియకు మద్దతు ఇవ్వడానికి మరియు వాత మరియు కఫ దోషాలను సమతుల్యం చేయడానికి సంప్రదాయంగా ఉపయోగిస్తారు. తాజా మరియు ఎండిన అల్లానికి ఆయుర్వేదంలో కొంత విభిన్న గుణాలు ఉన్నాయి.',
    },
    traditionalUses: [
      {
        en: 'Traditionally used to support healthy digestion and kindle Agni',
        te: 'జీర్ణక్రియకు మద్దతు ఇవ్వడానికి మరియు అగ్నిని ప్రజ్వలింపజేయడానికి సంప్రదాయంగా ఉపయోగిస్తారు',
      },
      {
        en: 'Common home remedy for occasional nausea and morning discomfort',
        te: 'అప్పుడప్పుడు వికారం మరియు ఉదయం అసౌకర్యానికి సాధారణ ఇంటి మందు',
      },
      {
        en: 'Used in traditional ginger tea with honey for respiratory comfort',
        te: 'శ్వాసకోశ సౌకర్యం కోసం తేనెతో సంప్రదాయ అల్లం టీలో ఉపయోగిస్తారు',
      },
    ],
    commonPreparations: [
      {
        en: 'Ginger tea: Fresh ginger boiled in water, often with honey and lemon',
        te: 'అల్లం టీ: తాజా అల్లంను నీటిలో మరిగించి, తరచుగా తేనె మరియు నిమ్మరసం జోడించి',
      },
      {
        en: 'Shunti churna: Dried ginger powder used in various Ayurvedic formulations',
        te: 'శుంటి చూర్ణం: ఎండిన అల్లం పొడిని వివిధ ఆయుర్వేద తయారీలలో ఉపయోగిస్తారు',
      },
    ],
    foodUses: {
      en: 'Ginger is extensively used in Indian cooking — in curries, dals, teas, chutneys, and sweets. Fresh ginger is added to savory dishes, while dried ginger powder is used in desserts and spices.',
      te: 'అల్లం భారతీయ వంటలో విస్తృతంగా ఉపయోగిస్తారు — కూరలు, పప్పులు, టీలు, పచ్చళ్లు మరియు మిఠాయిలలో. తాజా అల్లంను కారం వంటకాలకు, ఎండిన అల్లం పొడిని డెజర్ట్లు మరియు సుగంధ ద్రవ్యాలలో ఉపయోగిస్తారు.',
    },
    culturalHistory: {
      en: 'Ginger has been cultivated in India for over 3,000 years and is mentioned in classical Ayurvedic texts. It was traded extensively along ancient spice routes and is one of the first spices to reach Europe from Asia.',
      te: 'అల్లం 3,000 సంవత్సరాలుగా భారతదేశంలో సాగు చేయబడుతోంది మరియు శాస్త్రీయ ఆయుర్వేద గ్రంథాలలో పేర్కొనబడింది. పురాతన సుగంధ ద్రవ్యాల మార్గాల వెంట విస్తృతంగా వర్తకం జరిగింది, ఆసియా నుండి ఐరోపాకు చేరుకున్న మొదటి సుగంధ ద్రవ్యాలలో ఒకటి.',
    },
    growingInfo: {
      en: 'Ginger grows in warm, humid climates with well-drained, rich soil. It is propagated from rhizome cuttings and typically harvested after 8-10 months.',
      te: 'అల్లం వేడి, తేమ వాతావరణంలో మంచి నీటి పారుదల, సారవంతమైన నేలలో పెరుగుతుంది. దుంప కటింగ్‌ల నుండి ప్రవేశపెడతారు మరియు సాధారణంగా 8-10 నెలల తర్వాత కోస్తారు.',
    },
    storageInfo: {
      en: 'Fresh ginger can be refrigerated for 2-3 weeks or frozen for months. Dried ginger powder should be stored in an airtight container.',
      te: 'తాజా అల్లంను 2-3 వారాలు ఫ్రిడ్జ్‌లో లేదా నెలల తరబడి ఫ్రీజర్‌లో ఉంచవచ్చు. ఎండిన అల్లం పొడిని గాలి చొరబడని పాత్రలో నిల్వ చేయాలి.',
    },
    safetyInfo: {
      en: 'Ginger is generally safe in culinary amounts. High doses may cause heartburn or digestive discomfort. May interact with blood-thinning medications. Consult a healthcare professional before using ginger supplements, especially if pregnant, nursing, or on medication.',
      te: 'వంట పరిమాణంలో అల్లం సాధారణంగా సురక్షితం. అధిక మోతాదులు గుండెలో మంట లేదా జీర్ణ అసౌకర్యానికి కారణం కావచ్చు. రక్తాన్ని పలుచగొట్టే మందులతో పరస్పర చర్య చేయవచ్చు. అల్లం సప్లిమెంట్లు ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా మందులు వాడేవారు ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
    references: [
      'Charaka Samhita',
      'Bhavaprakasha Nighantu',
      'WHO Monographs on Selected Medicinal Plants',
    ],
    whenToConsult: {
      en: 'Consult a healthcare professional before using ginger in medicinal amounts, especially if pregnant, nursing, or on blood-thinning medications.',
      te: 'అల్లంను ఔషధ మోతాదులో ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా రక్తాన్ని పలుచగొట్టే మందులు వాడేవారు ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
  },
  {
    slug: 'amla',
    commonName: 'Amla (Indian Gooseberry)',
    teluguName: 'ఉసిరికాయ',
    sanskritName: 'Amalaki',
    englishName: 'Indian Gooseberry',
    botanicalName: 'Phyllanthus emblica',
    regionalNames: [
      { language: 'Hindi', name: 'Amla' },
      { language: 'Tamil', name: 'Nellikkai' },
      { language: 'Kannada', name: 'Nellikayi' },
      { language: 'Bengali', name: 'Amlaki' },
    ],
    category: 'herbs',
    imageQuery: 'amla indian gooseberry fruit',
    introduction: {
      en: 'Amla, or Indian Gooseberry, is one of the most celebrated herbs in Ayurveda. It is considered a premier Rasayana (rejuvenating) herb and is a key ingredient in the classical formulation Chyavanaprasha.',
      te: 'ఉసిరికాయ, లేదా ఇండియన్ గూస్‌బెర్రీ, ఆయుర్వేదంలో అత్యంత ప్రసిద్ధి చెందిన మూలికలలో ఒకటి. ఇది ప్రధాన రసాయన (పునరుజ్జీవన) మూలికగా పరిగణించబడుతుంది మరియు శాస్త్రీయ తయారీ చ్యవనప్రాశలో ముఖ్య ఘటకం.',
    },
    traditionalDescription: {
      en: 'In Ayurveda, Amla is described as having all six tastes except salty, with a predominance of sour and astringent. It is cooling in nature and traditionally used to balance all three doshas. It is considered one of the best herbs for promoting overall vitality.',
      te: 'ఆయుర్వేదంలో ఉసిరికాయ ఉప్పు తప్ప మిగిలిన ఆరు రుచులను కలిగి ఉంటుందని, పులుపు మరియు కషాయం ప్రధానంగా ఉంటాయని వర్ణించబడింది. ఇది చల్లని స్వభావం కలిగి ఉంటుంది, మూడు దోషాలను సమతుల్యం చేయడానికి సంప్రదాయంగా ఉపయోగిస్తారు. మొత్తం ఉత్సాహాన్ని ప్రోత్సహించడానికి ఉత్తమ మూలికలలో ఒకటిగా పరిగణిస్తారు.',
    },
    traditionalUses: [
      {
        en: 'Considered a premier Rasayana for promoting vitality and longevity',
        te: 'ఉత్సాహం మరియు దీర్ఘాయుష్కు ప్రోత్సహించడానికి ప్రధాన రసాయనంగా పరిగణిస్తారు',
      },
      {
        en: 'Traditionally used to support healthy hair and skin',
        te: 'ఆరోగ్యకరమైన జుట్టు మరియు చర్మానికి మద్దతు ఇవ్వడానికి సంప్రదాయంగా ఉపయోగిస్తారు',
      },
      {
        en: 'Key ingredient in Chyavanaprasha, a traditional Ayurvedic jam',
        te: 'సంప్రదాయ ఆయుర్వేద జామ్ అయిన చ్యవనప్రాశలో ముఖ్య ఘటకం',
      },
    ],
    commonPreparations: [
      {
        en: 'Chyavanaprasha: Traditional Ayurvedic jam with amla as the main ingredient',
        te: 'చ్యవనప్రాశ: ఉసిరికాయ ప్రధాన ఘటకంగా సంప్రదాయ ఆయుర్వేద జామ్',
      },
      {
        en: 'Amla juice: Fresh juice consumed in small amounts, often diluted with water',
        te: 'ఉసిరి రసం: తాజా రసాన్ని చిన్న మోతాదులో, తరచుగా నీటిలో కలిపి తీసుకుంటారు',
      },
      {
        en: 'Amla powder: Dried and ground, used in hair oils and supplements',
        te: 'ఉసిరి పొడి: ఎండబెట్టి రుబ్బి, జుట్టు నూనెలు మరియు సప్లిమెంట్లలో ఉపయోగిస్తారు',
      },
    ],
    foodUses: {
      en: 'Amla is used in pickles, chutneys, murabba (sweet preserve), and candies. It is also consumed as juice. Its tangy flavor makes it versatile in both sweet and savory preparations.',
      te: 'ఉసిరికాయను ఊరగాయలు, పచ్చళ్లు, మురబ్బ (తీపి భరిణె), మరియు క్యాండీలలో ఉపయోగిస్తారు. రసంగా కూడా తీసుకుంటారు. దాని పుల్ల రుచి తీపి మరియు కారం తయారీలలో బహుముఖంగా ఉపయోగపడుతుంది.',
    },
    culturalHistory: {
      en: 'Amla has been revered in Ayurveda for millennia. According to Hindu mythology, the amla tree is believed to have originated from the drops of Amrita (elixir of immortality). It is traditionally consumed during the month of Kartik for wellness.',
      te: 'ఉసిరికాయ సహస్రాబ్దాలుగా ఆయుర్వేదంలో పూజించబడుతోంది. హిందూ పురాణాల ప్రకారం, ఉసిరి చెట్టు అమృతం (అమరత్వ అమృతం) బిందువుల నుండి ఉద్భవించిందని నమ్ముతారు. ఆరోగ్యం కోసం కార్తీక మాసంలో సంప్రదాయంగా తీసుకుంటారు.',
    },
    growingInfo: {
      en: 'Amla trees grow in tropical and subtropical regions. They are deciduous, medium-sized trees that can tolerate a range of soil conditions. Trees begin bearing fruit in 6-8 years.',
      te: 'ఉసిరి చెట్లు ఉష్ణమండల మరియు ఉపఉష్ణమండల ప్రాంతాలలో పెరుగుతాయి. ఇవి ఆకురాల్చే, మధ్యమ పరిమాణ చెట్లు, వివిధ నేల పరిస్థితులను తట్టుకోగలవు. చెట్లు 6-8 సంవత్సరాలలో కాయలు ఇవ్వడం ప్రారంభిస్తాయి.',
    },
    storageInfo: {
      en: 'Fresh amla can be refrigerated for 1-2 weeks. It can also be frozen. Dried amla powder should be stored in an airtight container away from moisture.',
      te: 'తాజా ఉసిరికాయను 1-2 వారాలు ఫ్రిడ్జ్‌లో ఉంచవచ్చు. ఫ్రీజ్ కూడా చేయవచ్చు. ఎండిన ఉసిరి పొడిని తేమ లేని గాలి చొరబడని పాత్రలో నిల్వ చేయాలి.',
    },
    safetyInfo: {
      en: 'Amla is generally safe in culinary amounts. Due to its vitamin C content, very high doses may cause digestive discomfort. Consult a healthcare professional before using amla supplements, especially if pregnant, nursing, or on medications.',
      te: 'వంట పరిమాణంలో ఉసిరికాయ సాధారణంగా సురక్షితం. విటమిన్ C కంటెంట్ కారణంగా, చాలా అధిక మోతాదులు జీర్ణ అసౌకర్యానికి కారణం కావచ్చు. ఉసిరి సప్లిమెంట్లు ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా మందులు వాడేవారు ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
    references: [
      'Charaka Samhita — Rasayana section',
      'Sushruta Samhita',
      'Indian Journal of Pharmacology',
    ],
    whenToConsult: {
      en: 'Consult a qualified healthcare professional before using amla supplements, especially if pregnant, nursing, or on medications.',
      te: 'ఉసిరి సప్లిమెంట్లు ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా మందులు వాడేవారు అర్హత కలిగిన ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
  },
  {
    slug: 'brahmi',
    commonName: 'Brahmi',
    teluguName: 'బ్రాహ్మి',
    sanskritName: 'Brahmi',
    englishName: 'Bacopa',
    botanicalName: 'Bacopa monnieri',
    regionalNames: [
      { language: 'Hindi', name: 'Brahmi' },
      { language: 'Tamil', name: 'Neer Brahmi' },
      { language: 'Kannada', name: 'Ondelaga' },
      { language: 'Malayalam', name: 'Brahmi' },
    ],
    category: 'herbs',
    imageQuery: 'brahmi bacopa plant leaves',
    introduction: {
      en: 'Brahmi is a revered herb in Ayurveda, traditionally associated with cognitive wellness and mental clarity. Its name is derived from "Brahma," reflecting its connection to consciousness and wisdom in Indian tradition.',
      te: 'బ్రాహ్మి ఆయుర్వేదంలో పూజనీయమైన మూలిక, సంప్రదాయంగా జ్ఞాన ఆరోగ్యం మరియు మానసిక స్పష్టతతో సంబంధం కలిగి ఉంది. దాని పేరు "బ్రహ్మ" నుండి ఉద్భవించింది, భారతీయ సంప్రదాయంలో చైతన్యం మరియు జ్ఞానంతో దాని సంబంధాన్ని సూచిస్తుంది.',
    },
    traditionalDescription: {
      en: 'In Ayurveda, Brahmi is classified as a Medhya Rasayana — a herb that supports the mind and intellect. It is cooling, light, and traditionally used to promote mental clarity, focus, and calm.',
      te: 'ఆయుర్వేదంలో బ్రాహ్మిని మేధ్య రసాయనం — మనస్సు మరియు బుద్ధికి మద్దతు ఇచ్చే మూలికగా వర్గీకరించారు. ఇది చల్లగా, తేలికగా ఉంటుంది, మానసిక స్పష్టత, ఏకాగ్రత మరియు ప్రశాంతతను ప్రోత్సహించడానికి సంప్రదాయంగా ఉపయోగిస్తారు.',
    },
    traditionalUses: [
      {
        en: 'Traditionally classified as Medhya Rasayana for supporting cognitive wellness',
        te: 'జ్ఞాన ఆరోగ్యానికి మద్దతు ఇవ్వడానికి మేధ్య రసాయనంగా సంప్రదాయంగా వర్గీకరించారు',
      },
      {
        en: 'Used to promote mental clarity and calm focus',
        te: 'మానసిక స్పష్టత మరియు ప్రశాంత ఏకాగ్రతను ప్రోత్సహించడానికి ఉపయోగిస్తారు',
      },
      {
        en: 'Traditionally used in meditation practices to support concentration',
        te: 'ఏకాగ్రతకు మద్దతు ఇవ్వడానికి ధ్యాన అభ్యాసాలలో సంప్రదాయంగా ఉపయోగిస్తారు',
      },
    ],
    commonPreparations: [
      {
        en: 'Brahmi powder: Mixed with warm water or ghee',
        te: 'బ్రాహ్మి పొడి: వేడి నీరు లేదా నెయ్యితో కలిపి',
      },
      {
        en: 'Brahmi oil: Infused in sesame or coconut oil for head massage',
        te: 'బ్రాహ్మి నూనె: తల మసాజ్ కోసం నువ్వుల లేదా కొబ్బరి నూనెలో నింపి',
      },
    ],
    foodUses: {
      en: 'Brahmi is not commonly used in cooking. It is primarily consumed as a powder, tea, or supplement.',
      te: 'బ్రాహ్మిని సాధారణంగా వంటలో ఉపయోగించరు. ప్రధానంగా పొడి, టీ లేదా సప్లిమెంట్‌గా తీసుకుంటారు.',
    },
    culturalHistory: {
      en: 'Brahmi has been used in Ayurveda for thousands of years and is mentioned in classical texts as a herb for scholars and seekers of knowledge. It has long been associated with meditation and spiritual practices.',
      te: 'బ్రాహ్మి వేలాది సంవత్సరాలుగా ఆయుర్వేదంలో ఉపయోగించబడుతోంది, శాస్త్రీయ గ్రంథాలలో పండితులు మరియు జ్ఞాన సాధకుల కోసం మూలికగా పేర్కొనబడింది. ఇది ధ్యానం మరియు ఆధ్యాత్మిక అభ్యాసాలతో దీర్ఘకాలంగా సంబంధం కలిగి ఉంది.',
    },
    growingInfo: {
      en: 'Brahmi is a creeping plant that grows in wet, marshy areas. It requires consistent moisture and partial shade. It can be grown in pots with regular watering.',
      te: 'బ్రాహ్మి తేమ, చిత్తడి ప్రాంతాలలో పెరిగే పాకే మొక్క. ఇది నిరంతర తేమ మరియు పాక్షిక నీడ అవసరం. క్రమం తప్పకుండా నీరు పాయించి కుండలలో పెంచవచ్చు.',
    },
    storageInfo: {
      en: 'Fresh brahmi should be used quickly. Dried brahmi powder should be stored in an airtight container in a cool, dry place.',
      te: 'తాజా బ్రాహ్మిని త్వరగా ఉపయోగించాలి. ఎండిన బ్రాహ్మి పొడిని చల్లని, పొడి ప్రదేశంలో గాలి చొరబడని పాత్రలో నిల్వ చేయాలి.',
    },
    safetyInfo: {
      en: 'Brahmi is generally well-tolerated. Mild digestive discomfort may occur in some individuals. Consult a healthcare professional before use, especially if pregnant, nursing, or on medications.',
      te: 'బ్రాహ్మి సాధారణంగా సహించదగినది. కొందరిలో స్వల్ప జీర్ణ అసౌకర్యం కలిగి ఉండవచ్చు. ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా మందులు వాడేవారు ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
    references: [
      'Charaka Samhita — Medhya Rasayana section',
      'Sushruta Samhita',
      'Journal of Ethnopharmacology',
    ],
    whenToConsult: {
      en: 'Consult a qualified healthcare professional before using brahmi supplements, especially if pregnant, nursing, or on medications for thyroid or digestive conditions.',
      te: 'బ్రాహ్మి సప్లిమెంట్లు ఉపయోగించే ముందు, ముఖ్యంగా గర్భిణీలు, పాలిచ్చేవారు లేదా థైరాయిడ్ లేదా జీర్ణ పరిస్థితుల మందులు వాడేవారు అర్హత కలిగిన ఆరోగ్య నిపుణులను సంప్రదించండి.',
    },
  },
];

export function getHerbBySlug(slug: string): Herb | undefined {
  return herbs.find((h) => h.slug === slug);
}

export function getHerbsByCategory(category: string): Herb[] {
  return herbs.filter((h) => h.category === category);
}
