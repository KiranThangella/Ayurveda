import type { Dosha } from '../types';

export const doshas: Dosha[] = [
  {
    slug: 'vata',
    name: { en: 'Vata', te: 'వాత' },
    elements: {
      en: 'Air + Ether (Space)',
      te: 'గాలి + అంతరిక్షం',
    },
    qualities: {
      en: 'Light, dry, cold, mobile, subtle, rough',
      te: 'తేలిక, పొడి, చల్లని, చలించే, సూక్ష్మ, గరుకు',
    },
    description: {
      en: 'Vata is the energy of movement. It governs all motion in the body — breathing, circulation, nerve impulses, and the elimination of waste. When balanced, Vata promotes creativity, flexibility, and vitality. When aggravated, it can lead to dryness, anxiety, and restlessness.',
      te: 'వాత అనేది కదలిక యొక్క శక్తి. శరీరంలో అన్ని కదలికలను నియంత్రిస్తుంది — శ్వాస, ప్రసరణ, నాడీ ప్రేరణలు, మరియు వ్యర్థ విసర్జన. సమతుల్యంగా ఉన్నప్పుడు వాత సృజనాత్మకత, సౌష్టవం, మరియు ఉత్సాహాన్ని ప్రోత్సహిస్తుంది.',
    },
    characteristics: [
      { en: 'Thin, light frame', te: 'సన్నని, తేలికపాటి శరీరం' },
      { en: 'Quick, energetic thinking', te: 'వేగవంతమైన, ఉత్సాహభరిత ఆలోచన' },
      { en: 'Dry skin and hair', te: 'పొడి చర్మం మరియు జుట్టు' },
      { en: 'Tendency toward cold hands and feet', te: 'చల్లని చేతులు మరియు పాదాల ధోరణి' },
      { en: 'Creative and adaptable', te: 'సృజనాత్మక మరియు అనువర్తనశీలి' },
      { en: 'Light, interrupted sleep', te: 'తేలికపాటి, మధ్యలో ఆగిపోయే నిద్ర' },
    ],
    balancing: [
      { en: 'Keep warm and stay calm', te: 'వెచ్చగా ఉండండి, ప్రశాంతంగా ఉండండి' },
      { en: 'Maintain a regular daily routine', te: 'క్రమమైన దైనందిన ఆచారం పాటించండి' },
      { en: 'Eat warm, nourishing foods', te: 'వెచ్చని, పోషక ఆహారాలు తినండి' },
      { en: 'Practice gentle yoga and meditation', te: 'సున్నిత యోగ మరియు ధ్యానం అభ్యాసం చేయండి' },
      { en: 'Get adequate rest', te: 'సరిపడినంత విశ్రాంతి తీసుకోండి' },
      { en: 'Use warming oils like sesame for massage', te: 'మసాజ్ కోసం నువ్వుల నూనె వంటి వేడి నూనెలు ఉపయోగించండి' },
    ],
    description2: {
      en: 'Vata-dominant individuals are often creative, quick-thinking, and energetic, but may struggle with consistency and grounding.',
      te: 'వాత ప్రధాన వ్యక్తులు తరచుగా సృజనాత్మక, వేగవంతమైన ఆలోచన మరియు ఉత్సాహం కలిగి ఉంటారు, కానీ స్థిరత్వం మరియు గట్టిదనంతో సంఘర్షించవచ్చు.',
    },
  },
  {
    slug: 'pitta',
    name: { en: 'Pitta', te: 'పిత్త' },
    elements: {
      en: 'Fire + Water',
      te: 'అగ్ని + నీరు',
    },
    qualities: {
      en: 'Hot, sharp, light, oily, liquid, spreading',
      te: 'వేడి, పదునైన, తేలిక, నూనెపదార్థం, ద్రవ, వ్యాప్తి',
    },
    description: {
      en: 'Pitta is the energy of transformation. It governs digestion, metabolism, and body temperature. When balanced, Pitta promotes intelligence, focus, and courage. When aggravated, it can lead to irritability, inflammation, and excessive heat.',
      te: 'పిత్త అనేది పరివర్తన యొక్క శక్తి. జీర్ణక్రియ, చయాపచయ క్రియ, మరియు శరీర ఉష్ణోగ్రతను నియంత్రిస్తుంది. సమతుల్యంగా ఉన్నప్పుడు పిత్త తెలివితేటలు, ఏకాగ్రత, మరియు ధైర్యాన్ని ప్ోత్సహిస్తుంది.',
    },
    characteristics: [
      { en: 'Medium build, muscular', te: 'మధ్యమ నిర్మాణం, కండరాలు' },
      { en: 'Sharp, focused intellect', te: 'పదునైన, ఏకాగ్ర బుద్ధి' },
      { en: 'Warm body temperature', te: 'వేడి శరీర ఉష్ణోగ్రత' },
      { en: 'Strong appetite and digestion', te: 'బలమైన ఆకలి మరియు జీర్ణక్రియ' },
      { en: 'Ambitious and disciplined', te: 'మహత్తాకాంక్ష మరియు క్రమశిక్షణ' },
      { en: 'Rosy complexion, often with freckles', te: 'గులాబీ ఛాయ, తరచుగా చుక్కలతో' },
    ],
    balancing: [
      { en: 'Stay cool and avoid excessive heat', te: 'చల్లగా ఉండండి, అధిక వేడిని నివారించండి' },
      { en: 'Avoid skipping meals', te: 'భోజనం వదలకండి' },
      { en: 'Engage in calming activities', te: 'ప్రశాంతపరిచే కార్యకలాపాలలో పాల్గొనండి' },
      { en: 'Practice moderation in all things', te: 'అన్నింటా మితి పాటించండి' },
      { en: 'Spend time in nature, especially near water', te: 'ప్రకృతిలో సమయం గడపండి, ముఖ్యంగా నీటి సమీపంలో' },
      { en: 'Avoid spicy, fried, and fermented foods', te: 'కారం, వేయించిన మరియు పులియబెట్టిన ఆహారాలు నివారించండి' },
    ],
    description2: {
      en: 'Pitta-dominant individuals are often focused, ambitious, and natural leaders, but may struggle with anger and perfectionism when out of balance.',
      te: 'పిత్త ప్రధాన వ్యక్తులు తరచుగా ఏకాగ్ర, మహత్తాకాంక్ష కలవారు, సహజ నాయకులు, కానీ అసమతుల్యంగా ఉన్నప్పుడు కోపం మరియు పూర్తిదనంతో సంఘర్షించవచ్చు.',
    },
  },
  {
    slug: 'kapha',
    name: { en: 'Kapha', te: 'కఫ' },
    elements: {
      en: 'Earth + Water',
      te: 'భూమి + నీరు',
    },
    qualities: {
      en: 'Heavy, slow, cool, oily, smooth, dense, stable',
      te: 'బరువు, నెమ్మది, చల్లని, నూనెపదార్థం, మృదువు, సాంద్రం, స్థిరం',
    },
    description: {
      en: 'Kapha is the energy of structure and lubrication. It governs the physical structure of the body, immune system, and fluid balance. When balanced, Kapha promotes stability, strength, and compassion. When aggravated, it can lead to sluggishness, weight gain, and attachment.',
      te: 'కఫ అనేది నిర్మాణం మరియు స్నిగ్ధత యొక్క శక్తి. శరీర భౌతిక నిర్మాణం, రోగనిరోధక వ్యవస్థ, మరియు ద్రవ సమతుల్యతను నియంత్రిస్తుంది. సమతుల్యంగా ఉన్నప్పుడు కఫ స్థిరత్వం, బలం, మరియు కరుణను ప్రోత్సహిస్తుంది.',
    },
    characteristics: [
      { en: 'Strong, sturdy build', te: 'బలమైన, గట్టి నిర్మాణం' },
      { en: 'Calm, grounded demeanor', te: 'ప్రశాంత, స్థిరమైన ప్రవర్తన' },
      { en: 'Oily, smooth skin', te: 'నూనెపదార్థం, మృదువైన చర్మం' },
      { en: 'Deep, sound sleep', te: 'లోతైన, సుఖప్రదమైన నిద్ర' },
      { en: 'Slow to anger, forgiving', te: 'నెమ్మదిగా కోపం, క్షమాశీలి' },
      { en: 'Strong stamina and endurance', te: 'బలమైన ఓర్పు మరియు స్థిరత్వం' },
    ],
    balancing: [
      { en: 'Stay active and exercise regularly', te: 'చురుకుగా ఉండండి, క్రమం తప్పకుండా వ్యాయామం చేయండి' },
      { en: 'Vary your routine and try new things', te: 'మీ ఆచారాన్ని మార్చండి, కొత్త విషయాలు ప్రయత్నించండి' },
      { en: 'Eat light, warm, and spicy foods', te: 'తేలికపాటి, వెచ్చని, కారం ఆహారాలు తినండి' },
      { en: 'Avoid heavy, sweet, and oily foods', te: 'బరువైన, తీపి, నూనె ఆహారాలు నివారించండి' },
      { en: 'Practice stimulating activities', te: 'ఉత్తేజపరిచే కార్యకలాపాలు అభ్యాసం చేయండి' },
      { en: 'Get up early and avoid daytime naps', te: 'త్వరగా లేచి, పగటి నిద్ర నివారించండి' },
    ],
    description2: {
      en: 'Kapha-dominant individuals are often calm, loving, and reliable, but may struggle with motivation and change when out of balance.',
      te: 'కఫ ప్రధాన వ్యక్తులు తరచుగా ప్రశాంత, ప్రేమపూర్వక, నమ్మకదారులు, కానీ అసమతుల్యంగా ఉన్నప్పుడు ప్రేరణ మరియు మార్పుతో సంఘర్షించవచ్చు.',
    },
  },
];

export function getDoshaBySlug(slug: string): Dosha | undefined {
  return doshas.find((d) => d.slug === slug);
}
