'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { doshas } from '@/lib/data/doshas';
import { Disclaimer } from '@/components/disclaimer';
import { Wind, Flame, Droplets, CheckCircle2, AlertCircle } from 'lucide-react';

const doshaIcons: Record<string, typeof Wind> = {
  vata: Wind,
  pitta: Flame,
  kapha: Droplets,
};

const doshaColors: Record<string, string> = {
  vata: 'text-terracotta bg-terracotta/10 border-terracotta/20',
  pitta: 'text-gold bg-gold/10 border-gold/20',
  kapha: 'text-leaf bg-leaf/10 border-leaf/20',
};

export default function DoshaPage() {
  const { t, lang, isTelugu } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const quizQuestions = lang === 'te'
    ? [
        { question: 'మీ శరీర నిర్మాణం ఎలాంటిది?', options: ['సన్నని, తేలిక', 'మధ్యమ, కండరాలు', 'బలమైన, గట్టి'] },
        { question: 'మీ చర్మం ఎలా ఉంటుంది?', options: ['పొడి, గరుకు', 'వెచ్చని, ఎర్రగా', 'నూనెపదార్థం, మృదువు'] },
        { question: 'మీ ఆలోచన శైలి?', options: ['వేగవంతం, సృజనాత్మక', 'పదునైన, ఏకాగ్ర', 'నెమ్మది, స్థిరం'] },
        { question: 'మీ నిద్ర ఎలా ఉంటుంది?', options: ['తేలిక, ఆటంకాలు', 'మధ్యమ, సంతృప్తి', 'లోతైన, దీర్ఘ'] },
      ]
    : [
        { question: 'What is your body frame like?', options: ['Thin, light', 'Medium, muscular', 'Sturdy, strong'] },
        { question: 'How is your skin?', options: ['Dry, rough', 'Warm, reddish', 'Oily, smooth'] },
        { question: 'Your thinking style?', options: ['Quick, creative', 'Sharp, focused', 'Calm, steady'] },
        { question: 'How is your sleep?', options: ['Light, interrupted', 'Moderate, satisfying', 'Deep, long'] },
      ];

  const [answers, setAnswers] = useState<number[]>([-1, -1, -1, -1]);
  const [showResult, setShowResult] = useState(false);

  const getResult = () => {
    const scores = [0, 0, 0]; // vata, pitta, kapha
    answers.forEach((a) => { if (a >= 0) scores[a]++; });
    const max = Math.max(...scores);
    return scores.indexOf(max);
  };

  const resultIdx = getResult();

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className={cn('text-3xl sm:text-4xl font-bold tracking-tight font-display', isTelugu && 'font-telugu')}>
          {t('dosha.title')}
        </h1>
        <p className={cn('mt-2 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
          {t('dosha.subtitle')}
        </p>
      </div>

      {/* Dosha cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {doshas.map((dosha, i) => {
          const Icon = doshaIcons[dosha.slug];
          const isActive = activeTab === i;
          return (
            <button
              key={dosha.slug}
              onClick={() => setActiveTab(i)}
              className={cn(
                'text-left rounded-xl border p-5 transition-all',
                isActive ? cn(doshaColors[dosha.slug], 'border-current shadow-card') : 'border-border/60 bg-card shadow-soft hover:shadow-card'
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', isActive ? 'bg-current/15' : 'bg-muted/60')}>
                  <Icon className={cn('h-5 w-5', isActive ? '' : 'text-muted-foreground')} />
                </span>
                <div>
                  <h2 className={cn('text-lg font-bold', isTelugu && lang === 'te' && 'font-telugu')}>{dosha.name[lang]}</h2>
                  <p className="text-xs text-muted-foreground">{dosha.elements[lang]}</p>
                </div>
              </div>
              <p className={cn('text-xs text-foreground/70 line-clamp-2', isTelugu && lang === 'te' && 'font-telugu')}>
                {dosha.description[lang]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active dosha detail */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 mb-10 shadow-soft">
        {doshas.map((dosha, i) => {
          if (i !== activeTab) return null;
          const Icon = doshaIcons[dosha.slug];
          return (
            <div key={dosha.slug} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl', doshaColors[dosha.slug])}>
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className={cn('text-xl font-bold', isTelugu && lang === 'te' && 'font-telugu')}>{dosha.name[lang]}</h2>
                  <p className="text-sm text-muted-foreground">{dosha.qualities[lang]}</p>
                </div>
              </div>

              <p className={cn('text-sm leading-relaxed text-foreground/80 mb-6', isTelugu && lang === 'te' && 'font-telugu')}>
                {dosha.description[lang]}
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className={cn('flex items-center gap-2 text-sm font-bold mb-3', isTelugu && 'font-telugu')}>
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    {lang === 'te' ? 'లక్షణాలు' : 'Characteristics'}
                  </h3>
                  <ul className="space-y-1.5">
                    {dosha.characteristics.map((c, idx) => (
                      <li key={idx} className={cn('text-xs text-foreground/70 flex gap-2', isTelugu && lang === 'te' && 'font-telugu')}>
                        <span className="text-accent shrink-0">•</span>
                        {c[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={cn('flex items-center gap-2 text-sm font-bold mb-3', isTelugu && 'font-telugu')}>
                    <AlertCircle className="h-4 w-4 text-primary" />
                    {lang === 'te' ? 'సమతుల్యత సూచనలు' : 'Balancing Tips'}
                  </h3>
                  <ul className="space-y-1.5">
                    {dosha.balancing.map((b, idx) => (
                      <li key={idx} className={cn('text-xs text-foreground/70 flex gap-2', isTelugu && lang === 'te' && 'font-telugu')}>
                        <span className="text-primary shrink-0">•</span>
                        {b[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className={cn('mt-6 text-sm italic text-muted-foreground', isTelugu && lang === 'te' && 'font-telugu')}>
                {dosha.description2[lang]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Educational quiz */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8 mb-6">
        <h2 className={cn('text-xl font-bold mb-2', isTelugu && 'font-telugu')}>{t('dosha.quiz')}</h2>
        <p className={cn('text-sm text-muted-foreground mb-6', isTelugu && 'font-telugu')}>{t('dosha.disclaimer')}</p>

        {!showResult ? (
          <div className="space-y-5">
            {quizQuestions.map((q, qi) => (
              <div key={qi}>
                <p className={cn('text-sm font-medium mb-3', isTelugu && 'font-telugu')}>
                  {qi + 1}. {q.question}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                      className={cn(
                        'rounded-lg border px-4 py-2.5 text-xs font-medium text-left transition-all flex-1',
                        answers[qi] === oi
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 bg-card text-foreground/70 hover:border-primary/30',
                        isTelugu && 'font-telugu'
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowResult(true)}
              disabled={answers.some((a) => a === -1)}
              className={cn(
                'w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:scale-[1.01]',
                answers.some((a) => a === -1) && 'opacity-50 cursor-not-allowed',
                isTelugu && 'font-telugu'
              )}
            >
              {lang === 'te' ? 'ఫలితం చూడండి' : 'See Result'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className={cn('inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-4', doshaColors[doshas[resultIdx].slug])}>
              {(() => { const Icon = doshaIcons[doshas[resultIdx].slug]; return <Icon className="h-8 w-8" />; })()}
            </div>
            <h3 className={cn('text-2xl font-bold mb-2', isTelugu && lang === 'te' && 'font-telugu')}>
              {doshas[resultIdx].name[lang]}
            </h3>
            <p className={cn('text-sm text-muted-foreground mb-4 max-w-md mx-auto', isTelugu && lang === 'te' && 'font-telugu')}>
              {doshas[resultIdx].description2[lang]}
            </p>
            <p className={cn('text-xs text-muted-foreground mb-4', isTelugu && 'font-telugu')}>
              {t('dosha.disclaimer')}
            </p>
            <button
              onClick={() => { setAnswers([-1, -1, -1, -1]); setShowResult(false); }}
              className={cn('rounded-lg border border-border/60 px-4 py-2 text-xs font-medium hover:bg-muted/60', isTelugu && 'font-telugu')}
            >
              {lang === 'te' ? 'మళ్ళీ ప్రయత్నించండి' : 'Try Again'}
            </button>
          </div>
        )}
      </div>

      <Disclaimer variant="warning" />
    </div>
  );
}
