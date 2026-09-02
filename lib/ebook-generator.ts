import { cleanAndDeduplicateContent } from '@/lib/ai/text-cleaner';

export type GenLang = 'en' | 'te';

export interface GeneratedChapter {
  title: string;
  content: string;
  wordCount: number;
}

export interface GeneratedBook {
  title: string;
  subtitle: string;
  description: string;
  chapters: GeneratedChapter[];
  price: number;
  language: GenLang;
  topicIdx: number;
  totalWords: number;
}

export const PRICES = [
  { value: 0, label: { en: 'Free', te: 'ఉచితం' } },
  { value: 49, label: { en: '₹49', te: '₹49' } },
  { value: 99, label: { en: '₹99', te: '₹99' } },
  { value: 149, label: { en: '₹149', te: '₹149' } },
  { value: 199, label: { en: '₹199', te: '₹199' } },
  { value: 299, label: { en: '₹299', te: '₹299' } },
  { value: 499, label: { en: '₹499', te: '₹499' } },
];

const TOPIC_INFO: Record<number, { titleEn: string; titleTe: string; subEn: string; subTe: string }> = {
  0: { titleEn: 'Dinacharya', titleTe: 'దినచర్య', subEn: 'The Ayurvedic Daily Routine', subTe: 'ఆయుర్వేద దైనందిన ఆచారం' },
  1: { titleEn: 'Ayurveda for Beginners', titleTe: 'ప్రారంభకుల ఆయుర్వేదం', subEn: 'A Complete Introduction', subTe: 'సంపూర్ణ పరిచయం' },
  2: { titleEn: 'Ayurvedic Herbs Guide', titleTe: 'ఆయుర్వేద మూలికల మార్గదర్శకం', subEn: 'Traditional Herbs & Their Uses', subTe: 'సంప్రదాయ మూలికలు & వాటి ఉపయోగాలు' },
  3: { titleEn: 'Food & Nutrition in Ayurveda', titleTe: 'ఆయుర్వేదంలో ఆహారం & పోషణ', subEn: 'Eating for Balance', subTe: 'సమతుల్యత కోసం ఆహారం' },
  4: { titleEn: 'Yoga and Ayurveda', titleTe: 'యోగ మరియు ఆయుర్వేదం', subEn: 'Sister Sciences for Wellness', subTe: 'ఆరోగ్యం కోసం సోదరీ శాస్త్రాలు' },
  5: { titleEn: 'Meditation & Mindfulness', titleTe: 'ధ్యానం & మనస్సు', subEn: 'Inner Peace Through Practice', subTe: 'అభ్యాసం ద్వారా ఆంతరిక శాంతి' },
  6: { titleEn: 'Sleep & Relaxation', titleTe: 'నిద్ర & విశ్రాంతి', subEn: 'Restful Nights in Ayurveda', subTe: 'ఆయుర్వేదంలో సుఖప్రదమైన నిద్ర' },
  7: { titleEn: 'Stress Management', titleTe: 'ఒత్తిడి నిర్వహణ', subEn: 'Calming the Mind Naturally', subTe: 'సహజంగా మనస్సును శాంతింపజేయడం' },
  8: { titleEn: 'Ritucharya', titleTe: 'ఋతుచర్య', subEn: 'Seasonal Living in Ayurveda', subTe: 'ఆయుర్వేదంలో ఋతుపరమైన జీవనం' },
  9: { titleEn: 'Skin & Hair Care', titleTe: 'చర్మం & జుట్టు సంరక్షణ', subEn: 'Natural Beauty from Within', subTe: 'అంతర్గత సౌందర్యం నుండి' },
  10: { titleEn: 'Digestion & Gut Wellness', titleTe: 'జీర్ణక్రియ & ఆంత్ర ఆరోగ్యం', subEn: 'The Fire of Life', subTe: 'జీవిత అగ్ని' },
  11: { titleEn: "Women's Wellness", titleTe: 'మహిళల ఆరోగ్యం', subEn: 'Ayurveda for Every Stage', subTe: 'ప్రతి దశలో ఆయుర్వేదం' },
};

const AUDIENCE_WORDS: Record<number, { en: string; te: string }> = {
  0: { en: 'beginners', te: 'ప్రారంభకులు' },
  1: { en: 'intermediate practitioners', te: 'మధ్యస్థ అభ్యాసకులు' },
  2: { en: 'advanced practitioners', te: 'ఉన్నత అభ్యాసకులు' },
  3: { en: 'families', te: 'కుటుంబాలు' },
  4: { en: 'yoga practitioners', te: 'యోగ అభ్యాసకులు' },
  5: { en: 'seniors', te: 'వృద్ధులు' },
};

const STYLE_WORDS: Record<number, { en: string; te: string }> = {
  0: { en: 'educational and informative', te: 'విద్యాపరమైన మరియు సమాచార' },
  1: { en: 'story-based and engaging', te: 'కథఆధారిత మరియు ఆకర్షణీయ' },
  2: { en: 'practical and step-by-step', te: 'ఆచరణాత్మక మరియు దశలవారీ' },
  3: { en: 'spiritual and philosophical', te: 'ఆధ్యాత్మిక మరియు తాత్విక' },
};

export function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function buildChapterEn(
  chNum: number,
  totalChapters: number,
  topicIdx: number,
  audienceIdx: number,
  styleIdx: number,
): GeneratedChapter {
  const info = TOPIC_INFO[topicIdx] || TOPIC_INFO[1];
  const aud = AUDIENCE_WORDS[audienceIdx] || AUDIENCE_WORDS[0];
  const style = STYLE_WORDS[styleIdx] || STYLE_WORDS[0];
  const isFirst = chNum === 0;
  const isLast = chNum === totalChapters - 1;

  let title: string;
  let content: string;

  if (isFirst) {
    title = `Introduction: The World of ${info.titleEn}`;
    content = `Welcome, dear reader, to this journey through ${info.titleEn}. What you hold in your hands is not just another book about Ayurveda — it is an invitation to rediscover a way of living that has sustained millions of people across thousands of years. Whether you are completely new to this ancient science or have been exploring it for some time, the pages ahead will offer you something valuable, something practical, and something deeply human.

Ayurveda, which translates from Sanskrit as "the science of life," is perhaps the oldest continuously practiced system of wellness in the world. Its origins stretch back more than five thousand years, rooted in the Vedic civilization of ancient India. But do not let its age fool you. The principles you are about to learn are as relevant today as they were when sages first articulated them beneath the banyan trees of their hermitages. In fact, in our modern world of constant stress, processed foods, and disconnection from nature, Ayurveda's wisdom may be more urgently needed than ever before.

This book has been written specifically for ${aud.en}, with a ${style.en} approach. That means you will not find dense academic jargon or impenetrable Sanskrit verses here. Instead, you will find clear explanations, real-world examples, and practical guidance that you can begin applying from the very first chapter. Every concept has been broken down into digestible pieces, every practice has been explained in terms of why it works and how to do it, and every section has been crafted with the understanding that you are a real person living a real life with real constraints on your time and energy.

Let us begin by understanding what Ayurveda actually is. At its core, Ayurveda is a holistic system of wellness that views each person as a unique combination of physical, mental, and spiritual elements. Unlike conventional approaches that tend to focus on symptoms and treat everyone the same, Ayurveda recognizes that what works for one person may not work for another. Your neighbor's perfect diet might cause you digestive distress. Your friend's ideal exercise routine might leave you feeling depleted. The meditation style that transformed your colleague's life might leave you restless and frustrated. Ayurveda explains why this is so and, more importantly, shows you how to discover what is right for you.

The foundation of Ayurveda rests on a simple but profound observation: everything in the universe, including our bodies and minds, is composed of five great elements. These are Ether (space), Air, Fire, Water, and Earth. These five elements combine in different proportions to form three fundamental energies, known as doshas. Vata is composed of Ether and Air and governs movement. Pitta is composed of Fire and Water and governs transformation. Kapha is composed of Water and Earth and governs structure. Every person has all three doshas within them, but the proportions are unique to each individual. This unique combination is called your Prakriti, or constitution.

Understanding your constitution is the first and most important step in your Ayurvedic journey. It is the key that unlocks personalized recommendations for diet, lifestyle, exercise, sleep, and even the best times of day for different activities. A Vata-dominant person, for instance, tends to be naturally creative, quick-thinking, and energetic, but may also be prone to anxiety, dry skin, and digestive irregularity when out of balance. A Pitta-dominant person is typically focused, ambitious, and sharp-minded, but may struggle with anger, inflammation, and overheating when imbalanced. A Kapha-dominant person is usually calm, grounded, and nurturing, but can become lethargic, congested, and emotionally attached when their dosha is aggravated.

But this book is not just about theory. Throughout the following chapters, you will find practical applications, daily routines, dietary guidelines, herbal recommendations, and lifestyle adjustments that are grounded in Ayurvedic principles yet accessible to modern readers. You will learn how to eat according to your constitution, how to structure your day for maximum energy and balance, how to use common herbs and spices, how to practice yoga and meditation in a way that suits your unique nature, and how to navigate the changing seasons without falling ill.

A word about safety before we proceed. This book is educational in nature and is not intended to replace the guidance of a qualified healthcare professional. Ayurveda is a powerful system, but it should be used wisely. If you have existing medical conditions, are pregnant or nursing, or are taking medications, please consult with your doctor before making significant changes to your diet or lifestyle. The herbs and practices described in this book are traditional and have been used safely for generations, but individual circumstances vary, and what is beneficial for one person may not be appropriate for another.

As you read through these pages, I encourage you to approach the material with an open mind but also with discernment. Not everything in this book will resonate with you, and that is perfectly fine. Take what works, leave what does not, and remember that Ayurveda is ultimately about helping you live a more balanced, healthy, and fulfilling life — not about following rules rigidly. The goal is not perfection but awareness. Every small change you make, every new habit you adopt, every moment of mindful attention you bring to your daily life is a step toward greater wellbeing.

So let us turn the page and begin our exploration of ${info.titleEn} — a journey that, I hope, will transform not just how you think about health, but how you live each and every day.`;
  } else if (isLast) {
    title = `Conclusion & Your Path Forward`;
    content = `As we reach the end of this book, I want to take a moment to reflect on the journey we have taken together. Over the course of these chapters, we have explored the rich and multifaceted world of ${info.titleEn}, from its ancient philosophical foundations to its practical applications in daily life. You have learned about the doshas, the elements, the importance of digestive fire, the power of daily routines, the role of herbs and spices, the connection between mind and body, and so much more. But knowledge, as the sages have always taught, is only the beginning. The real transformation happens when you take what you have learned and bring it into your life.

Let me be honest with you. Reading this book will not, by itself, change your life. What will change your life is what you do with the information you have gathered here. Ayurveda is not a passive science. It asks for your participation, your awareness, and your willingness to make changes — sometimes small, sometimes significant — to the way you eat, sleep, move, and relate to the world around you. The beauty of Ayurveda is that it does not demand perfection. It does not require you to overhaul your entire life overnight. It simply asks you to begin where you are, with what you have, and to make one small change at a time.

If you take only one thing away from this book, let it be this: you are unique, and your path to wellness must be unique as well. The constitution you were born with, the imbalances you have developed, the environment you live in, the foods you have access to, the demands on your time and energy — all of these factors make your situation one of a kind. Ayurveda gives you the tools to understand your uniqueness and to make choices that support your particular nature. No diet book, no exercise program, no wellness trend can do this for you. Only you, armed with self-knowledge and guided by Ayurvedic principles, can find the balance that is right for you.

Let me offer a few practical suggestions for how to begin. First, start with your morning routine. If you do nothing else, simply waking up a little earlier, drinking a glass of warm water, and spending five minutes in quiet reflection can make a remarkable difference. Second, pay attention to your digestion. Notice how different foods make you feel, not just in the moment but hours and days afterward. Eat your largest meal at midday when your digestive fire is strongest, and keep your evening meal light and early. Third, begin incorporating herbs and spices into your cooking. Turmeric, ginger, cumin, coriander — these are not just flavorings but powerful allies for your health. Start with small amounts and observe their effects.

Fourth, make time for movement and stillness every day. This does not mean you need to spend an hour at the gym or sit in meditation for thirty minutes. A ten-minute walk, a few simple yoga stretches, a brief period of conscious breathing — these are enough to begin with. The key is consistency, not intensity. Fifth, honor the seasons. Just as nature changes throughout the year, your diet and lifestyle should change as well. Eat warming foods in winter, cooling foods in summer, and cleansing foods during the transitions between seasons. And sixth, perhaps most importantly, cultivate a relationship with yourself that is kind, patient, and curious. Ayurveda is not about self-judgment. It is about self-understanding.

I want to address one more thing before we part ways. In our modern world, there is a tendency to approach wellness as a project — something to be optimized, measured, and conquered. We track our sleep, count our steps, monitor our heart rate, and analyze our macros. There is nothing wrong with this, and Ayurveda itself encourages awareness and observation. But there is a difference between awareness and obsession, between self-care and self-monitoring. Ayurveda invites us to return to a more natural, intuitive relationship with our bodies. It asks us to trust the wisdom that is already within us, the wisdom that tells us when we are hungry, when we are tired, when we need movement, and when we need rest. The practices in this book are not meant to override that wisdom but to help you hear it more clearly.

As you step forward from here, remember that this is not the end of your journey but the beginning. Ayurveda is a vast ocean, and we have only waded into the shallows. There are entire texts, some running to thousands of verses, dedicated to topics we have only touched upon. There are deeper explorations of constitution, more detailed dietary frameworks, specialized herbal formulations, advanced yoga and meditation practices, seasonal cleanses, and much more. If this book has sparked your interest, I encourage you to continue learning. Read other books, talk to Ayurvedic practitioners, take courses, and most importantly, keep practicing.

And always, always remember the first principle of Ayurveda: everything is connected. Your body is connected to your mind. Your mind is connected to your spirit. Your health is connected to your relationships. Your relationships are connected to your environment. Your environment is connected to the seasons. The seasons are connected to the cosmos. When you begin to see these connections, you begin to understand what Ayurveda is truly about — not just the absence of disease, but the presence of harmony. Harmony within yourself, harmony with others, and harmony with the natural world.

Thank you for walking this path with me. May you find balance, vitality, and joy in the journey ahead. May you live in tune with your nature, eat with awareness, rest deeply, move freely, and approach each day with the kind of quiet wisdom that comes from truly knowing yourself. This is the gift of Ayurveda — a gift that has been passed down through millennia, and one that is now yours to carry forward.

One final reminder: this book is for educational purposes only. Always consult a qualified healthcare professional before beginning any new health practice, especially if you have medical conditions, are pregnant, or take medications. The information presented here is drawn from traditional Ayurvedic texts and modern interpretations, but it is not a substitute for personalized medical advice. Take care of yourself, listen to your body, and may your journey toward wellness be a long and fruitful one.`;
  } else {
    const chapterThemes: Record<number, { title: string; theme: string }> = {
      1: { title: 'The Five Elements and Three Doshas', theme: 'elements_doshas' },
      2: { title: 'Understanding Your Unique Constitution', theme: 'prakriti' },
      3: { title: 'The Art of Daily Living', theme: 'dinacharya' },
      4: { title: 'Food as Medicine', theme: 'food' },
      5: { title: 'Herbs, Spices, and Natural Remedies', theme: 'herbs' },
      6: { title: 'Movement, Breath, and Stillness', theme: 'yoga' },
      7: { title: 'Rest, Rejuvenation, and Balance', theme: 'rest' },
    };
    const theme = chapterThemes[chNum] || { title: `Deep Dive: Chapter ${chNum + 1}`, theme: 'general' };

    title = theme.title;

    if (theme.theme === 'elements_doshas') {
      content = `To truly understand Ayurveda, we must begin at the very beginning — with the building blocks of existence itself. Ancient Ayurvedic texts tell us that everything in the universe, from the most distant star to the smallest cell in your body, is composed of five fundamental elements. These are known as the Pancha Mahabhutas, the five great elements: Ether, Air, Fire, Water, and Earth. Let us explore each of these in detail, because grasping them is essential to everything that follows.

Ether, or Akasha, is the most subtle of the five elements. It is space itself — the emptiness that allows everything else to exist. Without space, there could be no movement, no sound, no growth. In the body, ether is present in the cavities and channels: the mouth, the nostrils, the gastrointestinal tract, the spaces between cells. Ether is associated with sound and hearing. When you listen to music, when you hear the voice of a loved one, when you sit in silence and become aware of the quiet, you are experiencing the element of ether. People with a strong ether component tend to be introspective, creative, and spiritually inclined, but when ether is excessive, they may feel spacey, disconnected, or ungrounded.

Air, or Vayu, is the principle of movement. It is the wind that blows through the trees, the breath that flows in and out of your lungs, the impulses that travel along your nerves, the thoughts that move through your mind. Air is associated with touch and the sense of feeling. Everything that moves in your body — the beating of your heart, the peristalsis of your intestines, the blinking of your eyes — is governed by the air element. Air is dry, light, cold, rough, and subtle. When air is in balance, there is easy movement, creativity, and enthusiasm. When it is excessive, there can be anxiety, restlessness, dryness, and pain.

Fire, or Agni, is the principle of transformation. It is the sun that warms the earth, the fire that cooks your food, the digestive enzymes that break down what you eat, the intelligence that illuminates your mind. Fire is associated with sight and vision. In the body, fire governs digestion, metabolism, body temperature, and the processing of sensory information. Fire is hot, sharp, light, dry, and subtle. When fire is balanced, there is good digestion, clear thinking, healthy metabolism, and a warm, radiant presence. When fire is excessive, there can be inflammation, anger, acidity, and irritability.

Water, or Jala, is the principle of cohesion and flow. It is the rivers that carve the land, the blood that circulates through your vessels, the fluids that lubricate your joints, the tears that cleanse your eyes. Water is associated with taste. In the body, water governs all fluid processes: blood, lymph, saliva, digestive juices, cerebrospinal fluid, and the cytoplasm within every cell. Water is moist, cold, heavy, soft, and smooth. When water is balanced, there is proper hydration, healthy circulation, emotional flow, and a sense of connection. When it is excessive, there can be congestion, swelling, weight gain, and emotional attachment.

Earth, or Prithvi, is the principle of structure and stability. It is the mountains that stand for millennia, the bones that support your body, the muscles that give you form, the skin that holds you together. Earth is associated with smell. In the body, earth governs all solid structures: bones, muscles, fat, skin, nails, hair, and the dense tissues of the organs. Earth is heavy, dense, static, hard, and gross. When earth is balanced, there is stability, strength, endurance, and groundedness. When it is excessive, there can be sluggishness, weight gain, attachment, and resistance to change.

Now, here is where it gets interesting. These five elements do not exist in isolation. They combine in specific ways to form the three doshas — the fundamental energies that govern all physiological and psychological processes. Vata dosha is the combination of Ether and Air. It is the principle of movement and governs all motion in the body: the beating of the heart, the flow of breath, the movement of food through the digestive tract, the transmission of nerve impulses, and even the movement of thoughts through the mind. Pitta dosha is the combination of Fire and Water. It is the principle of transformation and governs all metabolic processes: digestion, absorption, assimilation, body temperature regulation, and the processing of information and emotions. Kapha dosha is the combination of Water and Earth. It is the principle of structure and cohesion and governs all anabolic processes: building and maintaining tissues, lubricating joints, providing immune function, and giving the body its form and substance.

Every person has all three doshas within them. You cannot exist without Vata, because without movement, nothing in your body would function. You cannot exist without Pitta, because without transformation, you could not digest food or process experiences. You cannot exist without Kapha, because without structure, your body would have no form. However, the proportions of the doshas vary from person to person. This unique proportion is what we call Prakriti, and it is determined at the moment of conception. Your Prakriti is like your genetic blueprint — it does not change throughout your life. What does change is the state of balance or imbalance of your doshas, which is called Vikriti.

A person with a Vata-predominant constitution tends to be thin, light, and quick. They often have dry skin, prominent joints, and a tendency toward coldness. Their mind is active, creative, and quick to learn but also quick to forget. They are enthusiastic, adaptable, and spontaneous, but when out of balance, they may experience anxiety, insomnia, constipation, and a sense of being scattered. Vata types benefit from warmth, regularity, oiliness, and grounding foods and practices.

A person with a Pitta-predominant constitution tends to be medium-built, muscular, and warm. They often have sharp features, warm skin, and a strong appetite. Their mind is sharp, focused, and analytical. They are ambitious, organized, and natural leaders, but when out of balance, they may experience anger, irritability, inflammation, acid reflux, and a tendency toward perfectionism. Pitta types benefit from cooling, sweet, and calming foods and practices.

A person with a Kapha-predominant constitution tends to be solid, heavy, and strong. They often have smooth, oily skin, thick hair, and a sturdy frame. Their mind is calm, steady, and patient. They are nurturing, loyal, and deeply connected to family and community, but when out of balance, they may experience lethargy, weight gain, congestion, attachment, and resistance to change. Kapha types benefit from stimulation, warmth, lightness, and variety in their routine.

Understanding these doshas is not about putting yourself in a box. It is about gaining a framework for self-understanding. Think of it as a map that helps you navigate the terrain of your own nature. With this map, you can begin to make choices that support your constitution rather than fighting against it. You can eat foods that balance your dosha, adopt routines that harmonize with your natural rhythms, and cultivate practices that address your specific vulnerabilities. This is the essence of Ayurvedic wisdom — living in alignment with who you truly are.`;
    } else if (theme.theme === 'prakriti') {
      content = `In the previous chapter, we explored the five elements and the three doshas. Now, let us turn our attention to something deeply personal — your own constitution, your Prakriti. This is one of the most important concepts in all of Ayurveda, because it is the foundation upon which all personalized recommendations are built. Without understanding your Prakriti, you cannot truly practice Ayurveda in the way it was meant to be practiced — as a personalized system tailored to your unique nature.

Prakriti is determined at the moment of conception. It is influenced by the constitutional state of your parents at the time of conception, the season and time of day, the diet and lifestyle of your mother during pregnancy, and other subtle factors. Your Prakriti is fixed for life — it does not change. What does change is the state of your doshas, which fluctuates based on diet, lifestyle, seasons, age, stress, and environment. This current state of fluctuation is called Vikriti, and it is what we seek to balance through Ayurvedic practices.

Determining your Prakriti requires honest self-observation. There are questionnaires available that can help, and consulting with a qualified Ayurvedic practitioner is always the best approach, but you can begin to get a sense of your constitution by observing your physical characteristics, mental tendencies, and behavioral patterns. Let us look at each dosha's constitutional traits in detail.

If you are Vata-predominant, your physical frame is likely thin, light, and either tall or short. You may find it difficult to gain weight. Your skin tends to be dry, thin, and cool to the touch. Your hair may be dry, frizzy, or thin. Your eyes are often small or irregular in shape. You have prominent veins and tend to feel cold easily. Your appetite and digestion are variable — sometimes ravenous, sometimes absent. Your sleep is often light and easily disturbed. In terms of personality, you are likely creative, enthusiastic, quick to learn, and adaptable. You enjoy movement and change. You may be prone to worry, anxiety, and overthinking when stressed. You tend to act quickly but may lack follow-through.

If you are Pitta-predominant, your physical frame is likely medium and well-proportioned with good muscle tone. You may gain or lose weight relatively easily. Your skin tends to be warm, reddish, or freckled, and you may be sensitive to the sun. Your hair is often fine, and you may experience premature graying or thinning. Your eyes are sharp and penetrating. You have a strong appetite and good digestion — you feel irritable if you skip a meal. You tend to feel warm and may perspire easily. Your sleep is moderate and sound. In terms of personality, you are likely focused, intelligent, organized, and ambitious. You enjoy challenges and competition. You may be prone to anger, impatience, and criticism when stressed. You are a natural leader and decision-maker.

If you are Kapha-predominant, your physical frame is likely solid, broad, and sturdy. You may gain weight easily and find it difficult to lose. Your skin tends to be thick, oily, smooth, and cool. Your hair is thick, lustrous, and often wavy. Your eyes are large, warm, and gentle. You have a steady appetite but can skip meals without much distress. You tend to feel cool but tolerate cold reasonably well. Your sleep is deep and heavy, and you may find it difficult to wake up. In terms of personality, you are likely calm, patient, loyal, and nurturing. You enjoy stability and routine. You may be prone to attachment, possessiveness, and lethargy when stressed. You are a natural caretaker and peacemaker.

Most people are not purely one dosha. You may be a dual-dosha type, such as Vata-Pitta, Pitta-Kapha, or Vata-Kapha. In these cases, you will see characteristics of both doshas, often with one being more dominant. A smaller percentage of people are tridoshic, with relatively equal proportions of all three doshas. Whatever your constitution, the key is to understand it without judgment. There is no better or worse Prakriti. Each has its strengths and its vulnerabilities. The goal is not to change your constitution but to keep it in balance.

Once you have identified your Prakriti, you can begin to tailor your lifestyle accordingly. A Vata type benefits from warm, moist, grounding foods; regular routines; gentle exercise like walking or yoga; plenty of rest; and practices that calm the mind like meditation and oil massage. A Pitta type benefits from cooling, fresh foods; moderate exercise that is not overly competitive; time in nature; and practices that cultivate patience and compassion. A Kapha type benefits from warm, light, spicy foods; vigorous exercise; varied routines that prevent stagnation; and practices that stimulate and energize.

It is important to remember that your constitution is not a sentence. It is a starting point. It tells you where your natural tendencies lie and where your vulnerabilities are, but it does not dictate your destiny. With awareness and appropriate choices, you can keep your doshas in balance regardless of your Prakriti. The key is consistency and mindfulness — not rigid adherence to rules, but a flexible, intelligent approach to living that takes your unique nature into account.

As you continue through this book, keep your constitution in mind. Notice which recommendations resonate with you and which do not. Observe how your body and mind respond to different foods, routines, and practices. This self-observation is the heart of Ayurveda. It is not about following a prescribed formula but about developing a deep, personal understanding of what works for you. Your constitution is your guide, and your experience is your teacher. Together, they will lead you toward a life of greater balance, health, and harmony.`;
    } else if (theme.theme === 'dinacharya') {
      content = `In Ayurveda, how you live your day is considered just as important as what you eat or how you exercise. The concept of Dinacharya — daily routine — is one of the most practical and powerful tools Ayurveda offers for maintaining balance and preventing disease. The idea is simple yet profound: by aligning your daily activities with the natural rhythms of the day, you support your body's innate intelligence and keep your doshas in harmony. Let us explore what a balanced Ayurvedic day looks like, step by step, and why each element matters.

The Ayurvedic day begins before sunrise, during a period known as Brahma Muhurta. This is roughly the hour and a half before dawn, typically between 4:30 and 6:00 AM. According to Ayurvedic wisdom, this is the most spiritually charged time of day, when the atmosphere is pure, calm, and filled with subtle energy. Vata dosha is naturally dominant during this period, which means there is a quality of lightness, clarity, and freshness in the air. Waking during Brahma Muhurta allows you to absorb these qualities. You do not need to wake at 4:30 if that feels too extreme — even waking by 6:00 AM is a significant improvement over sleeping late for most people. The key is to wake with the sun, aligning your body with the natural cycle of light and dark.

Upon waking, before you even get out of bed, take a moment to set an intention for the day. Ayurveda suggests touching the earth (or the floor) with your hands as a gesture of gratitude. Simply lying still for a few moments, taking a few deep breaths, and bringing awareness to the new day can set a positive tone. This small act of mindfulness, performed before the demands of the day rush in, is remarkably grounding.

The first practice of the day is tongue scraping. Before brushing your teeth, use a tongue scraper — traditionally made of copper or stainless steel — to gently scrape the coating from your tongue. This coating, called Ama in Ayurveda, is a sign of metabolic waste that has accumulated overnight. Scraping the tongue removes this waste, stimulates the digestive organs, and gives you a clean start. Scrape from back to front, gently, three to five times. It takes about ten seconds, but the impact on your oral health and digestion is significant.

Next, attend to your teeth and mouth. Brush your teeth using a soft brush and a natural toothpaste. Ayurveda also recommends oil pulling — swishing a tablespoon of warm sesame or coconut oil in your mouth for five to fifteen minutes. This ancient practice draws out impurities, strengthens the gums, and is said to improve overall oral health. If oil pulling feels like too much, you can begin with just one minute and gradually increase. After brushing, rinse your mouth with warm water.

Drinking a glass of warm water first thing in the morning is one of the simplest yet most beneficial practices you can adopt. Warm water stimulates the digestive system, flushes the kidneys, promotes bowel movement, and hydrates the body after the long night without fluids. You can add a squeeze of lemon or a slice of fresh ginger for additional digestive benefits. Avoid cold water in the morning — it can shock the system and dampen your digestive fire.

Elimination is the next important step. A healthy digestive system should produce a natural urge to have a bowel movement shortly after waking and drinking warm water. If this is not happening for you, it is a sign that your digestion may need attention. Regular elimination is essential for removing waste from the body and preventing the buildup of toxins. Ayurveda views the health of the digestive tract as the foundation of overall health, and regular, complete bowel movements are a key indicator of digestive wellness.

After elimination comes Abhyanga — the practice of self-massage with warm oil. This is one of the most nurturing and grounding practices in Ayurveda. Use warm sesame oil for Vata and Kapha types, or warm coconut oil for Pitta types. Massage the oil into your skin using long strokes on the long bones and circular strokes on the joints. Allow the oil to absorb for five to fifteen minutes before showering. Abhyanga nourishes the skin, calms the nervous system, improves circulation, lubricates the joints, and promotes a sense of wellbeing. It is especially beneficial for Vata types, who tend toward dryness and anxiety.

After your shower or bath, engage in some form of exercise. Ayurveda recommends exercising to half of your capacity — until you break a light sweat but not to the point of exhaustion. The type of exercise should be suited to your constitution: Vata types benefit from gentle, grounding exercise like walking, yoga, or tai chi. Pitta types benefit from moderate, non-competitive exercise like swimming, hiking, or cycling. Kapha types benefit from vigorous, stimulating exercise like running, dancing, or intense yoga. Exercise in the morning helps circulate the prana, or life force, throughout the body and sets an energized tone for the day.

Following exercise, spend some time in meditation or quiet reflection. This does not need to be long — even five to ten minutes of sitting quietly, observing your breath, or repeating a mantra can profoundly affect your mental state for the rest of the day. The morning is when the mind is freshest and most receptive to positive impressions. By establishing a meditation practice in the morning, you create a foundation of calm and clarity that carries through everything you do.

Breakfast should be eaten mindfully and should be appropriate for your constitution. Vata types benefit from warm, moist, grounding breakfasts like oatmeal with ghee and cooked fruit. Pitta types benefit from cooling, sweet breakfasts like fresh fruit with yogurt or a smoothie. Kapha types benefit from light, warm breakfasts like a small bowl of cooked grains with spices, or they may even skip breakfast if not hungry. The key is to eat only if you are truly hungry and to choose foods that support your dosha. Eating while distracted, rushed, or upset undermines digestion, no matter how good the food is.

The middle part of the day, from about 10:00 AM to 2:00 PM, is when Pitta dosha is dominant. This is the time when your digestive fire is strongest, making it the ideal time for your largest meal. Lunch should be your heaviest and most substantial meal of the day. This is when your body can most efficiently digest and assimilate nutrients. A typical Ayurvedic lunch includes a grain like rice or quinoa, a protein like lentils or vegetables, cooked vegetables, and perhaps a small amount of healthy fat like ghee. Eat in a calm environment, chew your food thoroughly, and avoid overeating. A good rule of thumb is to fill your stomach one-third with food, one-third with liquid, and leave one-third empty for digestion.

The late afternoon, from 2:00 to 6:00 PM, is when Vata dosha becomes dominant again. This is a time for creative work, mental activity, and gentle movement. If you feel a dip in energy during this time, it is often a sign that your lunch was too heavy or that you need a short walk, some fresh air, or a brief rest. Avoid drinking caffeine during this period — it can interfere with your natural rhythms and disturb your sleep later. Instead, sip warm water or herbal tea.

Evening, from 6:00 to 10:00 PM, is when Kapha dosha dominates. This is the time to wind down, spend time with family, eat a light dinner, and prepare for sleep. Dinner should be eaten early — ideally by 7:00 PM — and should be light and easy to digest. Soup, cooked vegetables, or a small portion of grains are ideal. Eating heavy meals late in the evening disrupts digestion and disturbs sleep. After dinner, take a short walk to aid digestion. Avoid screens, intense mental activity, or emotional conversations close to bedtime.

Bedtime should ideally be by 10:00 PM, before the Pitta period of the night begins (10:00 PM to 2:00 AM). If you stay up past 10:00, you may notice a surge of energy and alertness — this is the Pitta influence kicking in, and it can make falling asleep difficult. Before bed, wash your face and feet, apply a small amount of oil to your feet and scalp, and spend a few minutes in quiet reflection or gentle stretching. Avoid looking at screens for at least thirty minutes before bed. Sleep in a cool, dark, quiet room. Aim for seven to eight hours of sleep.

This may seem like a lot to incorporate, and you should not try to adopt it all at once. Begin with one or two practices — perhaps drinking warm water in the morning and eating your largest meal at lunchtime. As these become habits, gradually add more elements. The beauty of Dinacharya is that it is not rigid — it is a framework that you can adapt to your life. The goal is not to follow a perfect routine but to move in the direction of greater alignment with natural rhythms. Even small changes, practiced consistently, can yield remarkable results over time.`;
    } else if (theme.theme === 'food') {
      content = `In Ayurveda, food is not merely fuel. It is medicine, it is information, and it is one of the most powerful tools you have for creating balance in your life. The Ayurvedic approach to nutrition is radically different from modern dietary philosophies. It does not count calories or macronutrients. It does not prescribe one-size-fits-all meal plans. Instead, it offers a sophisticated framework for understanding how different foods affect different people and how to eat in a way that supports your unique constitution. Let us explore this framework in depth.

The first principle of Ayurvedic nutrition is that you are what you can digest. It does not matter how nutritious a food is on paper if your body cannot properly digest and assimilate it. In Ayurveda, the concept of Agni — digestive fire — is central. Agni is the transformative power that converts food into the substances your body can use. When Agni is strong, digestion is efficient, nutrients are well absorbed, and waste is properly eliminated. When Agni is weak, digestion is sluggish, nutrients are poorly absorbed, and metabolic waste accumulates in the form of Ama, which is the root cause of most diseases.

There are four states of Agni. Balanced Agni produces good digestion, regular elimination, a coated-but-clear tongue, and a sense of lightness and energy after eating. Irregular Agni, common in Vata types, produces variable appetite, gas, bloating, constipation, and a feeling of heaviness or lightness after eating. Sharp Agni, common in Pitta types, produces excessive hunger, acid reflux, heartburn, and a burning sensation. Dull Agni, common in Kapha types, produces low appetite, heaviness after eating, sluggish elimination, and a feeling of lethargy. The goal is to maintain balanced Agni through appropriate food choices, eating habits, and lifestyle practices.

The second principle is that food should be chosen according to your constitution. Vata types, who tend toward dryness, coldness, and lightness, need foods that are warm, moist, and grounding. Think soups, stews, cooked grains, root vegetables, dairy products, nuts, and healthy oils. Vata types should avoid cold, raw, dry, and overly light foods like salads, crackers, and cold beverages. They benefit from three regular meals at consistent times, with healthy snacks if needed. Warming spices like ginger, cinnamon, and cardamom are especially beneficial.

Pitta types, who tend toward heat and intensity, need foods that are cooling, fresh, and moderately heavy. Think sweet fruits, leafy green vegetables, cucumber, coconut, dairy products, grains, and mild spices. Pitta types should avoid excessively spicy, sour, salty, and fermented foods, as well as deep-fried foods and alcohol. They benefit from eating in a calm, unhurried environment and should never skip meals, as hunger can quickly turn to irritability.

Kapha types, who tend toward heaviness and sluggishness, need foods that are warm, light, and stimulating. Think light grains, steamed vegetables, legumes, spicy foods, and minimal fats. Kapha types should avoid heavy, oily, sweet, and cold foods, as well as excessive dairy and wheat. They benefit from eating smaller portions, possibly skipping breakfast if not hungry, and using warming spices like black pepper, ginger, and turmeric to stimulate digestion.

The third principle is the concept of six tastes, or Rasas. Ayurveda categorizes all foods into six tastes: sweet, sour, salty, pungent, bitter, and astringent. Each taste has specific effects on the doshas and the body. A balanced meal should include all six tastes in appropriate proportions. The sweet taste builds tissues and calms the mind. It is nourishing and grounding but can be excessive for Kapha. The sour taste stimulates digestion and energizes the body. It is good for Vata but can aggravate Pitta. The salty taste retains water and stimulates digestion. It is good for Vata but can aggravate Pitta and Kapha. The pungent taste stimulates digestion and circulation. It is good for Kapha but can aggravate Vata and Pitta. The bitter taste cleanses and detoxifies. It is good for Pitta and Kapha but can aggravate Vata. The astringent taste tones tissues and absorbs moisture. It is good for Pitta and Kapha but can aggravate Vata.

The fourth principle is how you eat matters as much as what you eat. Ayurveda places great emphasis on the circumstances of eating. Eat in a calm, pleasant environment. Sit down — never eat standing or walking. Do not eat when you are upset, angry, or anxious, as these emotions interfere with digestion. Chew your food thoroughly — digestion begins in the mouth. Eat at regular times each day to establish a rhythm. Do not overeat — stop when you feel about three-quarters full. Do not eat too quickly or too slowly. Sip warm water with meals but do not drink large quantities, as this dilutes digestive enzymes. Avoid cold drinks with meals. Eat fresh, freshly cooked food whenever possible — leftovers are considered to have less prana, or life force.

The fifth principle is food combining. Ayurveda has detailed guidelines about which foods combine well and which do not. Some general rules include: do not mix milk with sour fruits, salt, fish, or meat. Do not eat raw and cooked foods together. Do not mix equal quantities of ghee and honey. Do not drink cold water during or immediately after meals. While these rules may seem restrictive, they are based on the observation that certain combinations produce Ama and digestive distress. You do not need to follow all of them perfectly, but being aware of them and following the ones that resonate with you can improve your digestion significantly.

Finally, let us talk about specific foods that are universally beneficial in Ayurveda. Ghee, or clarified butter, is considered the king of fats. It nourishes all tissues, enhances digestion, and is suitable for all constitutions. Fresh ginger is a universal remedy for digestive issues and is beneficial for all doshas. Turmeric is a powerful anti-inflammatory and antioxidant. Cumin, coriander, and fennel seeds, when taken as a tea or added to food, support digestion and detoxification. Basmati rice is the most easily digested grain and is suitable for everyone. Mung dal, or split mung beans, is the most easily digested legume and is the basis of the traditional Ayurvedic cleansing diet. Cooked vegetables are generally better than raw, as cooking breaks down the cellular structure and makes nutrients more accessible.

As you begin to apply these principles, remember that change does not have to be dramatic. Start by simply noticing how different foods make you feel. Notice your hunger patterns. Notice your digestion. Over time, as you become more attuned to your body's responses, you will naturally gravitate toward foods that support you and away from foods that do not. This is the true Ayurvedic way — not following external rules but developing an internal wisdom that guides your choices. Food is one of the most intimate ways we interact with the world. By bringing mindfulness and Ayurvedic principles to this daily act, you transform eating from a mundane activity into a powerful practice of self-care and self-awareness.`;
    } else if (theme.theme === 'herbs') {
      content = `For thousands of years, Ayurvedic practitioners have relied on the plant kingdom to support wellness, treat imbalances, and promote longevity. The herbs and spices used in Ayurveda are not merely flavorings or supplements — they are considered sacred allies, each with its own unique properties, actions, and energetics. In this chapter, we will explore some of the most important Ayurvedic herbs and spices, understanding their traditional uses, their effects on the doshas, and how to incorporate them safely into daily life.

Let us begin with turmeric, perhaps the most well-known Ayurvedic herb in the modern world. Known in Sanskrit as Haridra, turmeric has been used in Ayurveda for millennia. Its brilliant golden color reflects its potent properties. Turmeric is bitter, pungent, and astringent in taste, and it has a heating effect on the body. It is particularly beneficial for balancing Kapha and can be used moderately for Vata and Pitta. Turmeric supports the liver, promotes healthy skin, aids digestion, and is a powerful anti-inflammatory. A pinch of turmeric added to warm milk with a little ghee and black pepper is a classic Ayurvedic remedy for general wellness. Turmeric can also be added to cooking — it pairs well with almost any savory dish. A word of caution: turmeric can interact with blood-thinning medications, and high doses should be avoided during pregnancy.

Ginger, known as Shunti in Sanskrit, is another cornerstone of Ayurvedic herbalism. Called the "universal medicine" in Ayurvedic texts, ginger is pungent and sweet in taste and has a heating effect. It is beneficial for all three doshas when used appropriately. Ginger is perhaps the best herb for digestive issues — it stimulates Agni, reduces nausea, relieves gas and bloating, and supports overall digestive function. A cup of ginger tea before meals can significantly improve digestion. Fresh ginger is more heating and stimulating, while dried ginger is more penetrating and is used for respiratory conditions. Ginger also supports circulation, reduces inflammation, and can help with joint discomfort. For colds and coughs, a tea made with ginger, honey, and a pinch of turmeric is a traditional and effective remedy.

Tulsi, or holy basil, is one of the most revered plants in Ayurvedic tradition. Considered sacred in Hindu culture, tulsi is known as the "queen of herbs" and is prized for its ability to promote mental clarity, reduce stress, and support the immune system. Tulsi has a pungent and bitter taste and a heating effect. It is beneficial for all doshas but especially for Kapha and Vata. Tulsi is an adaptogen, meaning it helps the body adapt to stress and maintain balance. A cup of tulsi tea in the morning or evening can calm the mind, support respiratory health, and promote a sense of wellbeing. Tulsi can be grown easily at home, and fresh leaves can be chewed or brewed into tea daily.

Ashwagandha, meaning "smell of a horse" in Sanskrit, is one of the most important Ayurvedic herbs for vitality and stress management. It is a powerful adaptogen that helps the body cope with physical and mental stress. Ashwagandha has a bitter and astringent taste and a heating effect. It is particularly beneficial for Vata types, who tend toward anxiety and exhaustion, and can also benefit Kapha. It is generally not recommended for Pitta types in large quantities due to its heating nature. Ashwagandha supports the nervous system, promotes restful sleep, enhances energy and stamina, and supports healthy adrenal function. It is typically taken as a powder mixed with warm milk and a little honey before bed. As with any herb, consult a healthcare professional before using ashwagandha, especially if you have thyroid conditions, autoimmune disorders, or are pregnant.

Brahmi, also known as Bacopa, is the primary Ayurvedic herb for brain and nervous system health. Its name is derived from Brahman, the universal consciousness in Hindu philosophy, reflecting its association with mental clarity and spiritual awareness. Brahmi has a bitter and sweet taste and a cooling effect. It is beneficial for all doshas, particularly Pitta. Brahmi supports memory, concentration, and learning. It calms the mind, reduces anxiety, and promotes mental clarity. Brahmi is also used to support healthy sleep and to balance the nervous system. It can be taken as a powder, in capsules, or as a tea. Brahmi oil, applied to the scalp, is a traditional practice for promoting mental wellness and healthy hair.

Triphala, meaning "three fruits," is perhaps the most widely used Ayurvedic herbal formulation. It consists of three fruits: Amalaki (Indian gooseberry), Bibhitaki, and Haritaki. Triphala is a gentle, balanced formula that is suitable for all doshas. It supports digestion, promotes regular elimination, detoxifies the body, and nourishes all tissues. Triphala is rich in antioxidants, particularly from Amalaki, which is one of the richest natural sources of vitamin C. A teaspoon of Triphala powder taken with warm water before bed is a traditional practice for maintaining digestive health and promoting gentle detoxification. Triphala can also be used as an eyewash and as a mouth rinse.

Cumin, coriander, and fennel seeds, when combined, form one of the most popular Ayurvedic tea blends. This combination, often called CCF tea, is a gentle digestive aid suitable for all doshas. Cumin stimulates digestion and reduces gas. Coriander cools the body and supports liver function. Fennel is calming, sweet, and helps reduce bloating. To make CCF tea, combine equal parts of whole cumin, coriander, and fennel seeds, steep a teaspoon of the mixture in hot water for five minutes, and sip throughout the day. This simple tea can dramatically improve digestion and is especially helpful after heavy meals.

Other important Ayurvedic herbs and spices include cardamom, which is cooling and aids digestion; cinnamon, which is warming and supports blood sugar balance; black pepper, which enhances the absorption of other herbs and stimulates digestion; and nutmeg, which is calming and promotes sleep. Each of these can be incorporated into daily cooking and teas to support overall wellness.

A note on sourcing and quality: the quality of herbs matters enormously. Whenever possible, choose organic, sustainably sourced herbs from reputable suppliers. Fresh is generally better than dried, and whole is generally better than powdered, though powders are more convenient. Store herbs in airtight containers away from heat and light to preserve their potency.

Finally, remember that herbs are not magic pills. They work best when used as part of a holistic approach that includes proper diet, adequate sleep, regular exercise, and stress management. Ayurvedic herbs are gentle and work over time — they are not meant for quick fixes but for sustained, gradual support. Start with small amounts, observe how your body responds, and adjust accordingly. And always, always consult a qualified healthcare professional before using herbs medicinally, especially if you have existing health conditions, are pregnant or nursing, or are taking medications. The wisdom of Ayurvedic herbalism is vast and profound, and with patience and attention, it can become a valuable part of your wellness journey.`;
    } else if (theme.theme === 'yoga') {
      content = `Yoga and Ayurveda are sister sciences, two branches of the same ancient tree of Vedic wisdom. While Ayurveda focuses on the body and its balance, yoga focuses on the mind and its liberation. Together, they form a complete system for holistic wellness — physical, mental, and spiritual. In this chapter, we will explore how yoga complements Ayurveda, how to practice yoga according to your constitution, and how breath and meditation can transform your daily life.

The word yoga comes from the Sanskrit root yuj, meaning to yoke or unite. At its most fundamental level, yoga is about union — the union of body, mind, and spirit, and the union of the individual self with the universal consciousness. But in practical terms, yoga is a system of practices designed to purify the body, calm the mind, and prepare the practitioner for higher states of awareness. The physical postures, or asanas, that most people associate with yoga are just one aspect of a much broader system that includes ethical guidelines, breath control, meditation, and philosophical inquiry.

From an Ayurvedic perspective, yoga is a powerful tool for balancing the doshas. Different postures, breathing techniques, and meditation practices have different effects on Vata, Pitta, and Kapha, and by choosing practices that are appropriate for your constitution, you can use yoga as a form of medicine. Let us look at how each dosha should approach yoga practice.

For Vata types, the goal is grounding, calming, and stabilizing. Vata types benefit from slow, gentle, grounding yoga practices that build strength and stability. Poses that are held for longer durations, such as standing poses and gentle forward bends, are ideal. Vata types should avoid fast-paced, vigorous styles like power yoga or rapid vinyasa, as these can increase Vata and lead to exhaustion or anxiety. Restorative yoga, yin yoga, and gentle Hatha yoga are ideal. Key poses for Vata include mountain pose, tree pose, child's pose, and legs-up-the-wall pose. The breath should be slow and deep, with an emphasis on the exhalation. Vata types should always warm up thoroughly and end their practice with a long, nourishing relaxation in Savasana.

For Pitta types, the goal is cooling, calming, and surrendering. Pitta types benefit from moderate-paced practices that are challenging but not competitive. They should avoid overheating and pushing themselves to the point of exhaustion. Poses that open the chest and hips, gentle backbends, and cooling forward bends are ideal. Pitta types should practice with an attitude of surrender rather than achievement. Moon salutations are more appropriate than sun salutations. Key poses for Pitta include fish pose, camel pose (done gently), pigeon pose, and seated forward bends. The breath should be smooth and even. Pitta types should practice in a cool environment and avoid practicing during the hottest part of the day.

For Kapha types, the goal is stimulation, warming, and energizing. Kapha types benefit from vigorous, dynamic practices that build heat and promote movement. Sun salutations, flowing sequences, and poses that build strength and stamina are ideal. Kapha types should challenge themselves with more demanding poses and maintain a faster pace. Ujjayi breathing, which builds internal heat, is particularly beneficial. Key poses for Kapha include sun salutations, warrior poses, chair pose, and wheel pose. Kapha types should include backbends and standing poses to open the chest and stimulate circulation. They should avoid lingering too long in restful poses and should aim to break a sweat.

Pranayama, or breath control, is the bridge between the physical practice of yoga and the mental practice of meditation. In Ayurveda, the breath is considered the vehicle of prana, the life force that animates all living beings. By controlling the breath, we can influence the flow of prana and, through it, the state of the doshas and the mind. There are many pranayama techniques, each with specific effects. Let us explore the most important ones.

Nadi Shodhana, or alternate nostril breathing, is perhaps the most balancing of all pranayama techniques. It balances the left and right hemispheres of the brain, calms the nervous system, and harmonizes all three doshas. To practice, sit comfortably with your spine straight. Close your right nostril with your right thumb and inhale through the left nostril. Then close the left nostril with your ring finger, release the right nostril, and exhale through the right. Inhale through the right, then close it and exhale through the left. This completes one round. Practice five to ten rounds in the morning and evening. Nadi Shodhana is an excellent preparation for meditation.

Bhramari, or humming bee breath, is a calming practice that soothes the mind and reduces stress. To practice, close your eyes and gently close your ears with your thumbs. Place your fingers lightly over your closed eyes. Inhale deeply through the nose, then exhale slowly while making a humming sound, like a bee. The vibration should be felt in the head and face. Practice five to seven rounds. Bhramari is especially beneficial for Vata and Pitta types and is excellent for relieving anxiety and tension headaches.

Kapalabhati, or skull-shining breath, is an energizing and cleansing practice. To practice, sit comfortably and take a deep inhale. Then begin a series of short, forceful exhalations through the nose, letting the abdomen contract sharply with each exhale. The inhalations happen passively between the exhalations. Start with twenty to thirty rounds and gradually increase. Kapalabhati is particularly beneficial for Kapha types, as it builds heat and clears congestion. It should be avoided by those with high blood pressure, heart conditions, or during pregnancy.

Meditation is the crown of the yogic path and one of the most powerful tools for mental wellness. In Ayurveda, meditation is considered essential for all doshas, as it calms the mind, reduces stress, and promotes self-awareness. There are many forms of meditation, and the best one is the one that you will practice consistently. Here are a few approaches that are particularly aligned with Ayurvedic principles.

Mindfulness of breath is the simplest and most accessible form of meditation. Sit comfortably, close your eyes, and bring your attention to your breath. Notice the sensation of the air entering and leaving your nostrils. When your mind wanders — and it will — gently bring it back to the breath. Start with five minutes and gradually increase to twenty or thirty minutes. This practice is suitable for all doshas and is an excellent starting point for beginners.

Mantra meditation involves the silent repetition of a word or phrase. The mantra serves as an anchor for the mind, giving it something to focus on. A simple and universally beneficial mantra is So Hum, which means "I am that" in Sanskrit. On the inhale, silently say "So," and on the exhale, silently say "Hum." This practice is calming for all doshas and connects the practitioner to a sense of universal awareness.

Guided visualization is particularly beneficial for Vata types, who tend to have active, wandering minds. In this practice, you visualize a peaceful scene — a forest, a beach, a mountain meadow — and immerse yourself in the sensory details. This practice can be done with a recorded guided meditation or independently. It calms the mind and grounds the nervous system.

The key to a successful yoga and meditation practice is consistency. Ten minutes every day is far more valuable than an hour once a week. Find a time that works for you — most people find early morning or late evening best — and make it a non-negotiable part of your routine. Create a dedicated space for your practice, even if it is just a corner of a room. Over time, this space will become associated with peace and focus, making it easier to settle into your practice each day.

As with all things Ayurvedic, the goal is not perfection but awareness. Some days your practice will feel deep and effortless. Other days it will feel shallow and difficult. Both are fine. The practice is not about achieving a particular state but about showing up, again and again, with willingness and openness. Over time, the cumulative effect of this showing up is profound. You will find yourself more grounded, more centered, more in tune with your body and your breath, and more resilient in the face of life's challenges. This is the gift of yoga — a gift that complements and enhances everything you have learned about Ayurveda in this book.`;
    } else if (theme.theme === 'rest') {
      content = `In our achievement-oriented culture, rest is often viewed as laziness. We glorify busyness, celebrate productivity, and feel guilty when we are not doing something useful. But Ayurveda has always recognized what modern science is now confirming: rest is not a luxury. It is a biological necessity. Without adequate rest, the body cannot repair, the mind cannot integrate, and the spirit cannot replenish. In this chapter, we will explore the Ayurvedic approach to sleep, relaxation, and rejuvenation — practices that are, paradoxically, some of the most powerful tools for vibrant health.

Sleep, or Nidra, is one of the three pillars of health in Ayurveda, alongside diet and lifestyle. Ayurvedic texts describe sleep as the nursemaid of all living beings, a time when the body heals, the mind processes, and the nervous system resets. The quality and quantity of sleep are considered just as important as the quality of the food you eat. Poor sleep, in Ayurveda, is not just an inconvenience — it is a root cause of disease.

Ayurveda views sleep through the lens of the doshas. The period from 10:00 PM to 2:00 AM is the Pitta time of night, when the body's internal fire is active for repair and detoxification. If you are asleep during this time, your body can perform these essential functions. If you are awake, you miss this natural healing window. The period from 2:00 AM to 6:00 AM is the Vata time of night, when the mind is light and active. This is why waking during this period feels fresh and clear, and why staying up until 2:00 AM often results in a surge of energy that makes it hard to fall asleep.

Each dosha has its own relationship with sleep. Vata types tend to have light, easily disturbed sleep. They may have difficulty falling asleep due to racing thoughts, and they may wake frequently during the night. Vata types need the most sleep — ideally eight to nine hours — and benefit from practices that ground and calm the nervous system before bed. Pitta types tend to have moderate, sound sleep, but can be kept awake by intense dreams or a feeling of being too hot. They need seven to eight hours and benefit from cooling, calming practices. Kapha types tend to have deep, heavy sleep and may find it difficult to wake up. They need the least sleep — six to seven hours — and benefit from going to bed a bit later and waking earlier.

Let us explore the Ayurvedic approach to better sleep. The foundation of good sleep is a consistent routine. Go to bed at the same time each night, ideally by 10:00 PM. Wake at the same time each morning, ideally by 6:00 AM. This consistency entrains your body's internal clock, making it easier to fall asleep and wake up naturally. Create a wind-down routine for the hour before bed. This should include dimming the lights, avoiding screens, and engaging in calming activities like reading, gentle stretching, or listening to soft music. Avoid stimulating activities, intense conversations, or heavy meals within three hours of bedtime.

Your sleep environment matters. The bedroom should be cool, dark, and quiet. Use blackout curtains if needed. Remove electronic devices, or at least turn them off and keep them away from the bed. The bed itself should be comfortable and supportive. Ayurveda recommends sleeping with the head pointing east or south. Avoid sleeping with the head pointing north, as this is said to disrupt the body's magnetic field. While this may seem esoteric, there is some evidence that the earth's magnetic field can influence the body's rhythms.

Several Ayurvedic practices can enhance sleep quality. Abhyanga, or warm oil massage, performed before bed, is deeply calming and grounding, especially for Vata types. Massage warm sesame oil into the soles of your feet and the crown of your head before bed. A cup of warm milk with a pinch of nutmeg, cardamom, and a small amount of ghee is a traditional Ayurvedic sleep remedy. The tryptophan in the milk, combined with the calming spices, promotes relaxation. Avoid caffeine after 2:00 PM, as its effects can last for many hours. Avoid alcohol before bed — while it may help you fall asleep, it disrupts the deeper stages of sleep and leads to poorer quality rest.

If you have difficulty falling asleep, try lying on your back and practicing deep belly breathing. Place one hand on your abdomen and feel it rise and fall with each breath. Count each exhalation backward from twenty-seven to one. This practice, known in yoga as a relaxation technique, calms the mind and prepares the body for sleep. If your mind is particularly active, try the practice of mental release: as thoughts arise, imagine placing them in a box and closing the lid. Tell yourself, "I will deal with this tomorrow. Tonight is for rest."

Beyond sleep, Ayurveda recognizes the importance of conscious rest during the day. The practice of Yoga Nidra, or yogic sleep, is a powerful technique for deep relaxation. In Yoga Nidra, you lie comfortably on your back and are guided through a systematic relaxation of the body and mind. Twenty minutes of Yoga Nidra is said to be equivalent to several hours of regular sleep. While this may be an exaggeration, the practice is undeniably restorative. You can find guided Yoga Nidra recordings online, and even ten minutes can make a significant difference in your energy and mental clarity.

The afternoon is a natural time for rest. After lunch, between 1:00 and 3:00 PM, the body naturally slows down as it directs energy toward digestion. A short nap — ten to twenty minutes — can be refreshing, especially for Vata types. However, napping for longer than thirty minutes can lead to grogginess and should be avoided by Kapha types, who may find it makes them more lethargic. If napping is not possible, simply lying down for ten minutes with your eyes closed and your legs elevated can provide a meaningful reset.

Rejuvenation, or Rasayana in Ayurveda, goes beyond simple rest. It is the practice of actively nourishing and rebuilding the body's tissues and energy. Rasayana includes not just sleep and relaxation but also the use of rejuvenating herbs, nourishing foods, and practices that promote longevity and vitality. Key Rasayana herbs include ashwagandha, shatavari, and amalaki. These herbs, taken over time, help rebuild the body's reserves and promote resilience. Nourishing foods like ghee, dates, almonds, and warm milk are also considered Rasayana foods. The practice of meditation, spending time in nature, and cultivating positive relationships are all part of the Rasayana approach to life.

Stress management is an integral part of rest and rejuvenation. Chronic stress depletes the body's reserves, disrupts sleep, and accelerates aging. Ayurveda offers many tools for managing stress, including the daily practices we have already discussed — Abhyanga, meditation, yoga, and pranayama. Additionally, spending time in nature is profoundly restorative. Walking in a forest, sitting by a body of water, or simply spending time in a garden can calm the nervous system and reduce stress hormones. Ayurveda recognizes the healing power of nature and recommends regular contact with the natural world as part of a balanced lifestyle.

Finally, remember that rest is not the opposite of productivity — it is its foundation. When you rest well, you work better. When you sleep deeply, you think more clearly. When you take time to rejuvenate, you have more to give to others. The Ayurvedic approach to rest is not about doing nothing. It is about doing the right things to support your body's natural rhythms of activity and recovery. By honoring these rhythms, you create a life that is not only productive but sustainable — a life that can be lived with energy, clarity, and joy for many years to come.`;
    } else {
      content = `In this chapter, we continue our deep exploration of the principles and practices that form the foundation of Ayurvedic wisdom. Building on what we have learned in previous chapters, we will examine additional concepts and practical applications that will enrich your understanding and support your journey toward balanced living.

One of the most important concepts in Ayurveda is the idea of Ama — metabolic waste or toxins that accumulate in the body when digestion is impaired. Ama is considered the root cause of most diseases in Ayurveda. When your digestive fire, or Agni, is weak, food is not properly digested and assimilated. Instead of nourishing the body, incompletely digested food forms a sticky, foul-smelling substance that circulates through the body and lodges in tissues, creating blockages and imbalances. The signs of Ama include a thick coating on the tongue, a feeling of heaviness after eating, foul-smelling breath or stool, dullness or foggy thinking, and a general sense of malaise.

Removing Ama is a central goal of Ayurvedic treatment. The primary method is to strengthen Agni through proper eating habits, appropriate food choices, and the use of digestive spices like ginger, cumin, and turmeric. Fasting or eating lightly for a day can also help, as it gives the digestive system a chance to rest and process accumulated waste. The traditional Ayurvedic cleanse, known as Panchakarma, is a more intensive approach to removing Ama, but it should only be undertaken under the guidance of a qualified practitioner. For daily maintenance, the practice of eating a light dinner, sipping warm water throughout the day, and avoiding cold, heavy, and processed foods is sufficient to keep Ama at bay.

Another important concept is Ojas — the subtle essence that gives the body its vitality, immunity, and radiance. Ojas is the product of proper digestion and healthy lifestyle. When your Agni is strong, your food is well digested, and your lifestyle is balanced, Ojas is produced in abundance. When digestion is poor or lifestyle is stressful, Ojas is depleted. The signs of healthy Ojas include a radiant complexion, strong immunity, a sense of calm and contentment, restful sleep, and abundant energy. The signs of depleted Ojas include frequent illness, fatigue, anxiety, poor sleep, and a dull complexion. Building Ojas requires the same practices that strengthen Agni: proper diet, adequate rest, regular routine, stress management, and the use of nourishing herbs and foods. Ghee, dates, almonds, saffron, and ashwagandha are all considered Ojas-building foods and herbs.

The concept of Srotas, or channels, is another key element of Ayurvedic anatomy. The body contains numerous channels through which substances flow — nutrients, waste, doshas, and prana. When these channels are clear and functioning properly, health is maintained. When they become blocked or obstructed, disease results. The blockage of channels is often caused by Ama, but it can also be caused by stress, poor diet, lack of exercise, or environmental factors. Keeping the channels clear requires proper hydration, regular exercise, adequate rest, and practices that promote circulation and detoxification. Drinking warm water, practicing yoga and pranayama, and eating a diet rich in fresh, whole foods all support the health of the Srotas.

Ayurveda also recognizes the deep connection between the mind and the body. Physical imbalances can affect the mind, and mental states can affect the body. Anxiety can cause digestive distress. Anger can trigger inflammation. Grief can weaken immunity. Joy can boost vitality. This mind-body connection is not just a philosophical concept in Ayurveda — it is a practical reality that is addressed through specific practices. Meditation, yoga, pranayama, and the cultivation of positive emotions are all considered therapeutic practices that benefit both body and mind. The Ayurvedic approach to mental wellness includes not just these practices but also dietary recommendations, as the food you eat directly affects the mind. Sattvic foods — fresh, pure, light, and nourishing foods like fruits, vegetables, whole grains, and dairy — promote mental clarity and calm. Rajasic foods — stimulating, spicy, and sour foods — promote activity and ambition but can cause restlessness. Tamasic foods — heavy, stale, and processed foods — promote lethargy and dullness. A diet that emphasizes Sattvic foods is recommended for mental wellness.

The practice of self-care in Ayurveda extends beyond diet and exercise to include daily rituals that nurture the senses. Ayurveda recognizes that we take in the world through our senses — sight, sound, touch, taste, and smell — and that what we expose our senses to affects our doshas and our overall wellbeing. Creating a soothing, beautiful environment; listening to calming music; surrounding yourself with pleasant scents; and engaging in activities that bring you joy are all considered important aspects of Ayurvedic self-care. This is not indulgence — it is a recognition that the quality of what we take in through our senses directly affects the quality of our health.

As you integrate these concepts into your life, remember that Ayurveda is not about rules and restrictions. It is about awareness and choice. Every time you eat, you can choose foods that support your constitution. Every morning, you can choose to wake with awareness. Every evening, you can choose to wind down with intention. These choices, made consistently over time, are what create lasting health and wellbeing. The journey of Ayurveda is not a sprint — it is a lifelong path of self-discovery and self-care. Each step you take, no matter how small, brings you closer to a state of balance, vitality, and harmony. This is the promise and the practice of Ayurveda — an ancient wisdom that is as alive and relevant today as it has ever been.`;
    }
  }

  return { title, content, wordCount: countWords(content) };
}

function buildChapterTe(
  chNum: number,
  totalChapters: number,
  topicIdx: number,
  audienceIdx: number,
  styleIdx: number,
): GeneratedChapter {
  const info = TOPIC_INFO[topicIdx] || TOPIC_INFO[1];
  const isFirst = chNum === 0;
  const isLast = chNum === totalChapters - 1;

  let title: string;
  let content: string;

  if (isFirst) {
    title = `పరిచయం: ${info.titleTe}`;
    content = `${info.titleTe} గురించి ఈ పుస్తకంలోకి స్వాగతం. మీ చేతుల్లో ఉన్నది కేవలం ఆయుర్వేదం గురించిన మరో పుస్తకం కాదు — ఇది వేల సంవత్సరాలుగా లక్షలాది మంది ప్రజలను ఆదరించిన జీవన విధానాన్ని పునరుద్ధరించడానికి ఒక ఆహ్వానం. ఈ ప్రాచీన శాస్త్రం పట్ల మీరు పూర్తిగా కొత్తవారైనా, లేదా కొంతకాలంగా అన్వేషిస్తున్నా, ముందున్న పేజీలు మీకు విలువైనది, ఆచరణీయమైనది, మరియు లోతైనది అందిస్తాయి.

ఆయుర్వేదం అంటే "జీవిత శాస్త్రం" అని సంస్కృతంలో అర్థం. ఇది ప్రపంచంలోని అత్యంత ప్రాచీన సంపూర్ణ ఆరోగ్య వ్యవస్థలలో ఒకటి. దీని మూలాలు ఐదు వేల సంవత్సరాల క్రితం వేద నాగరికతలో ఉన్నాయి. కానీ దాని వయస్సును చూసి మోసపోకండి. ఈ పుస్తకంలో మీరు నేర్చుకోబోయే సూత్రాలు నేడు అప్పటిలాగే సంబంధితంగా ఉన్నాయి. వాస్తవానికి, నిరంతర ఒత్తిడి, ప్రాసెస్‌డ్ ఆహారం, మరియు ప్రకృతి నుండి దూరంగా ఉండే మన ఆధునిక ప్రపంచంలో, ఆయుర్వేద జ్ఞానం ఇంతకంటే ఎప్పటికన్నా అవసరం.

ఆయుర్వేదం అనేది ప్రతి వ్యక్తిని శారీరక, మానసిక, మరియు ఆధ్యాత్మిక అంశాల ప్రత్యేక మిశ్రమంగా చూసే సంపూర్ణ ఆరోగ్య వ్యవస్థ. లక్షణాలపై దృష్టి పెట్టి అందరికీ ఒకేలా చికిత్స చేసే సాంప్రదాయ విధానాలకు భిన్నంగా, ఆయుర్వేదం ఒక వ్యక్తికి పనిచేసేది మరొకరికి పనిచేయకపోవచ్చని గుర్తిస్తుంది.

ఆయుర్వేదం యొక్క పునాది ఒక సరళమైన కానీ లోతైన పరిశీలనపై ఆధారపడి ఉంది: విశ్వంలోని ప్రతిదీ, మన శరీరాలు మరియు మనసులతో సహా, ఐదు మహాభూతాలతో నిర్మితమైంది. అవి ఆకాశం, వాయువు, అగ్ని, జల, పృథ్వి. ఈ ఐదు మూలకాలు విభిన్న నిష్పత్తులలో కలిసి మూడు దోషాలను సృష్టిస్తాయి — వాత, పిత్త, కఫ. ప్రతి వ్యక్తిలో ఈ మూడు దోషాలు ఉన్నా, వాటి నిష్పత్తులు ప్రతి వ్యక్తికి ప్రత్యేకం. దీనినే ప్రకృతి లేదా వ్యక్తిగత స్వభావం అంటారు.

ఈ పుస్తకం విద్యా ప్రయోజనాల కోసం మాత్రమే. మీకు వైద్య పరిస్థితులు ఉంటే, గర్భవతి అయితే, లేదా మందులు వాడుతుంటే, దయచేసి అర్హత పొందిన వైద్య నిపుణులను సంప్రదించండి. ఈ పుస్తకంలోని సమాచారం సంప్రదాయ ఆయుర్వేద గ్రంథాల నుండి సేకరించబడింది, కానీ ఇది వ్యక్తిగత వైద్య సలహాకు ప్రత్యామ్నాయం కాదు.

ఈ ప్రయాణంలో మీరు సమతుల్యత, ఉత్సాహం, మరియు సంతోషం కనుగొనుటకు నేను కోరుకుంటున్నాను. ${info.titleTe} అనే ఈ ప్రయాణం మీ జీవితాన్ని మార్చగలదని నమ్ముతున్నాను.`;
  } else if (isLast) {
    title = `ముగింపు & మీ భవిష్య మార్గం`;
    content = `ఈ పుస్తకం చివరికి చేరుకున్న ఈ క్షణంలో, మనం కలిసి చేసిన ప్రయాణాన్ని గురించి ఆలోచిద్దాం. ఈ అధ్యాయాలలో మనం ${info.titleTe} యొక్క సంపన్న మరియు బహుళ ప్రావలం కలిగిన ప్రపంచాన్ని అన్వేషించాం — దాని ప్రాచీన తాత్విక పునాదుల నుండి దైనందిన జీవితంలో దాని ఆచరణాత్మక అనువర్తనాల వరకు.

నిజాయితీగా చెప్పాలంటే, ఈ పుస్తకం చదవడం మాత్రం మీ జీవితాన్ని మార్చదు. మీ జీవితాన్ని మార్చేది మీరు ఇక్కడ సేకరించిన సమాచారంతో మీరు చేసే పనే. ఆయుర్వేదం ఒక నిశ్శబ్ద శాస్త్రం కాదు. ఇది మీ పాల్గొనడాన్ని, మీ అవగాహనను, మరియు మార్పులు చేయడానికి మీ సంసిద్ధతను అడుగుతుంది.

కొన్ని ఆచరణీయ సూచనలు ఇవ్వబోతున్నాను. ముందుగా, మీ ఉదయం ఆచారంతో ప్రారంభించండి. రెండవది, మీ జీర్ణక్రియపై దృష్టి పెట్టండి. మూడవది, మీ వంటలో మూలికలు మరియు మసాలాలను చేర్చండి. నాలుగవది, ప్రతిరోజూ కదలిక మరియు నిశ్శబ్దతకు సమయం కేటాయించండి. ఐదవది, ఋతువులను గౌరవించండి. ఆరవది, మీతో మీకు దయగల, ఓర్పుగల సంబంధాన్ని పెంపొందించుకోండి.

ఈ పుస్తకం విద్యా ప్రయోజనాల కోసం మాత్రమే. ఏ కొత్త ఆరోగ్య ఆచారాన్ని ప్రారంభించే ముందు, ముఖ్యంగా వైద్య పరిస్థితులు ఉంటే, గర్భవతి అయితే, లేదా మందులు వాడుతుంటే, అర్హత పొందిన వైద్య నిపుణులను సంప్రదించండి.

ఈ మార్గంలో నడిచినందుకు ధన్యవాదాలు. మీ ఆరోగ్య ప్రయాణం సుదీర్ఘ మరియు ఫలవంతంగా ఉండాలని కోరుకుంటున్నాను.`;
  } else {
    const chapterThemes: Record<number, string> = {
      1: 'పంచ మహాభూతాలు మరియు మూడు దోషాలు',
      2: 'మీ ప్రత్యేక ప్రకృతిని అర్థం చేసుకోవడం',
      3: 'దైనందిన జీవిత కళ',
      4: 'ఆహారమే మంత్రం',
      5: 'మూలికలు, మసాలాలు, మరియు సహజ పరిష్కారాలు',
      6: 'కదలిక, శ్వాస, మరియు నిశ్శబ్దత',
      7: 'విశ్రాంతి, పునరుజ్జీవనం, మరియు సమతుల్యత',
    };
    title = chapterThemes[chNum] || `అధ్యాయం ${chNum + 1}`;
    content = `ఈ అధ్యాయంలో, ${info.titleTe} యొక్క సూత్రాలు మరియు ఆచరణలను మనం లోతుగా అన్వేషిస్తాం. మునుపటి అధ్యాయాలలో మనం నేర్చుకున్న వాటిపై నిర్మించి, అదనపు భావనలు మరియు ఆచరణాత్మక అనువర్తనాలను పరిశీలిస్తాం.

ఆయుర్వేదంలో అనేక ముఖ్యమైన భావనలు ఉన్నాయి. అగ్ని (జీర్ణ అగ్ని), ఆమ (విషపదార్థాలు), ఓజస్ (ఉత్సాహం), మరియు స్రోతస్ (మార్గాలు) — ఇవన్నీ ఆయుర్వేద అర్థంలో కీలకమైనవి. ప్రతి భావన శరీరం యొక్క పనితీరును మరియు ఆరోగ్యాన్ని ఎలా ప్రభావితం చేస్తుందో మనం అర్థం చేసుకోవాలి.

ఆయుర్వేదం ప్రకారం, మనం తినే ఆహారం కేవలం ఇంధనం కాదు. అది మంత్రం, అది సమాచారం, మరియు అది మన ప్రత్యేక స్వభావాన్ని సమతుల్యం చేయడానికి మనకు అందుబాటులో ఉన్న అత్యంత శక్తివంతమైన సాధనాలలో ఒకటి. ఆరు రుచులు — తీపి, పులుపు, ఉప్పు, కారం, కషాయం, కణుపు — సమతుల్య భోజనంలో ఉండాలి.

పసుపు, తులసి, అశ్వగంధ, మరియు అల్లం — ఇవి ఆయుర్వేదంలో అత్యంత ముఖ్యమైన మూలికలు. ప్రతి మూలికకు తనదైన ప్రత్యేక లక్షణాలు ఉన్నాయి. ఇవి వైద్యుల సలహా మేరకు ఉపయోగించాలి.

ఈ పుస్తకం విద్యా ప్రయోజనాల కోసం మాత్రమే. ఏ ఆయుర్వేద పద్ధతిని ప్రారంభించే ముందు అర్హత పొందిన వైద్య నిపుణులను సంప్రదించండి.`;
  }

  return { title, content, wordCount: countWords(content) };
}

export function generateChapter(
  chNum: number,
  totalChapters: number,
  lang: GenLang,
  topicIdx: number,
  audienceIdx: number,
  styleIdx: number,
): GeneratedChapter {
  const chapter = lang === 'te'
    ? buildChapterTe(chNum, totalChapters, topicIdx, audienceIdx, styleIdx)
    : buildChapterEn(chNum, totalChapters, topicIdx, audienceIdx, styleIdx);

  const cleaned = cleanAndDeduplicateContent(chapter.content);
  return {
    title: chapter.title,
    content: cleaned.content,
    wordCount: cleaned.wordCount,
  };
}

export function buildBookMeta(
  lang: GenLang,
  topicIdx: number,
  audienceIdx: number,
  styleIdx: number,
  chaptersCount: number,
  price: number,
  totalWords: number,
): { title: string; subtitle: string; description: string } {
  const info = TOPIC_INFO[topicIdx] || TOPIC_INFO[1];
  if (lang === 'te') {
    return {
      title: info.titleTe,
      subtitle: info.subTe,
      description: `${info.titleTe} గురించి సంపూర్ణ పుస్తకం. ${chaptersCount} అధ్యాయాలు, దాదాపు ${totalWords.toLocaleString()} పదాలు. సంప్రదాయ ఆయుర్వేద జ్ఞానం స్వచ్ఛమైన తెలుగులో.`,
    };
  }
  return {
    title: info.titleEn,
    subtitle: info.subEn,
    description: `A comprehensive guide to ${info.titleEn}. ${chaptersCount} chapters, approximately ${totalWords.toLocaleString()} words. Traditional Ayurvedic wisdom in an accessible, human tone.`,
  };
}

