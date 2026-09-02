'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Ebook } from '@/lib/types';
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2,
  Smartphone,
  IndianRupee,
} from 'lucide-react';

interface PaymentModalProps {
  ebook: Ebook;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking';

const BANKS = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBIN' },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICIC' },
  { id: 'axis', name: 'Axis Bank', code: 'UTIB' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KKBK' },
];

export function savePurchase(ebookSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('mindwriter_purchased_ebooks');
    const existing: string[] = raw ? JSON.parse(raw) : [];
    if (!existing.includes(ebookSlug)) {
      existing.push(ebookSlug);
      localStorage.setItem('mindwriter_purchased_ebooks', JSON.stringify(existing));
    }
  } catch (e) {
    console.error('Failed to save purchase to localStorage', e);
  }
}

export function isEbookPurchased(ebookSlug: string, isFree?: boolean): boolean {
  if (isFree) return true;
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('mindwriter_purchased_ebooks');
    const existing: string[] = raw ? JSON.parse(raw) : [];
    return existing.includes(ebookSlug);
  } catch {
    return false;
  }
}

export function PaymentModal({ ebook, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { lang, isTelugu } = useLanguage();
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('qr');
  const [upiId, setUpiId] = useState('');
  
  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Netbanking
  const [selectedBank, setSelectedBank] = useState('sbi');

  // Payment process state
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const title = ebook.title[lang] || ebook.title.en;
  const price = ebook.price || 199;

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handlePay = async () => {
    setProcessing(true);
    setError(null);

    // Basic validation
    if (method === 'upi' && upiApp !== 'qr' && !upiId.includes('@')) {
      setProcessing(false);
      setError(lang === 'te' ? 'దయచేసి సరైన UPI ID ని నమోదు చేయండి (ఉదా: user@upi)' : 'Please enter a valid UPI ID (e.g., user@upi)');
      return;
    }

    if (method === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setProcessing(false);
        setError(lang === 'te' ? 'సరైన 16 ఆంకెల కార్డ్ సంఖ్యను ఇవ్వండి' : 'Please enter a valid 16-digit card number');
        return;
      }
      if (cardExpiry.length < 5) {
        setProcessing(false);
        setError(lang === 'te' ? 'సరైన గడువు తేదీని ఇవ్వండి (MM/YY)' : 'Please enter valid expiry date (MM/YY)');
        return;
      }
      if (cardCvv.length < 3) {
        setProcessing(false);
        setError(lang === 'te' ? 'సరైన 3 అంకెల CVV ఇవ్వండి' : 'Please enter 3-digit CVV');
        return;
      }
    }

    try {
      const simulatedTxn = 'TXN_' + Math.random().toString(36).substring(2, 11).toUpperCase();
      
      // Send verification to backend
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ebookSlug: ebook.slug,
          ebookId: ebook.id || ebook.slug,
          amount: price,
          paymentMethod: method,
          transactionId: simulatedTxn,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      // Save locally
      savePurchase(ebook.slug);
      setTxnId(simulatedTxn);
      setCompleted(true);
      setTimeout(() => {
        onSuccess(simulatedTxn);
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className={cn('text-base font-bold leading-none', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'సురక్షిత చెల్లింపు (Secure Checkout)' : 'Secure Checkout'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">256-Bit Encrypted Payment Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success State */}
        {completed ? (
          <div className="p-8 text-center space-y-4 animate-scale-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <div>
              <h4 className={cn('text-xl font-bold text-foreground', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'చెల్లింపు విజయవంతమైంది!' : 'Payment Successful!'}
              </h4>
              <p className={cn('text-sm text-muted-foreground mt-1', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'ఈబుక్ సబ్‌స్క్రిప్షన్ అన్‌లాక్ చేయబడింది. శుభ పఠనం!' : 'Your e-book subscription is now unlocked. Happy Reading!'}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground font-mono">
              Transaction ID: <span className="font-bold text-foreground">{txnId}</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {lang === 'te' ? 'పాఠకుడి పేజీకి మళ్లించబడుతోంది...' : 'Redirecting to reader page...'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <div className="h-16 w-12 rounded-lg bg-primary/10 border border-primary/20 shrink-0 overflow-hidden flex items-center justify-center">
                {ebook.coverImage ? (
                  <img src={ebook.coverImage} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <IndianRupee className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary block">
                  {lang === 'te' ? 'ఈబుక్ ప్యాకేజీ' : 'Premium Ebook'}
                </span>
                <h4 className={cn('text-sm font-bold truncate text-foreground', isTelugu && lang === 'te' && 'font-telugu')}>
                  {title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ebook.chapters?.length || 0} {lang === 'te' ? 'అధ్యాయాలు • లైఫ్‌టైమ్ యాక్సెస్' : 'Chapters • Lifetime Access'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-muted-foreground line-through block">₹{price * 2}</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">₹{price}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className={cn('block text-xs font-semibold text-muted-foreground uppercase tracking-wider', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'చెల్లింపు విధానాన్ని ఎంచుకోండి' : 'Select Payment Method'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi' as const, label: 'UPI / QR', icon: QrCode },
                  { id: 'card' as const, label: 'Debit / Card', icon: CreditCard },
                  { id: 'netbanking' as const, label: 'Netbanking', icon: Building2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = method === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setMethod(item.id); setError(null); }}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all',
                        active
                          ? 'border-primary bg-primary/10 text-primary shadow-soft'
                          : 'border-border/60 bg-card hover:bg-muted/40 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-4">
              {method === 'upi' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[
                      { id: 'qr' as const, label: 'Scan QR' },
                      { id: 'gpay' as const, label: 'GPay' },
                      { id: 'phonepe' as const, label: 'PhonePe' },
                      { id: 'paytm' as const, label: 'Paytm' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setUpiApp(app.id)}
                        className={cn(
                          'flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors',
                          upiApp === app.id ? 'border-primary bg-primary text-primary-foreground font-bold' : 'border-border/60 bg-card text-muted-foreground'
                        )}
                      >
                        {app.label}
                      </button>
                    ))}
                  </div>

                  {upiApp === 'qr' ? (
                    <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-zinc-900 rounded-xl border border-border/60 space-y-2">
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-zinc-200">
                        {/* Simulated QR Code SVG */}
                        <svg className="h-32 w-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" fill="white" />
                          <path d="M10 10H40V40H10V10ZM15 15V35H35V15H15Z" fill="black" />
                          <path d="M20 20H30V30H20V20Z" fill="black" />
                          <path d="M60 10H90V40H60V10ZM65 15V35H85V15H65Z" fill="black" />
                          <path d="M70 20H80V30H70V20Z" fill="black" />
                          <path d="M10 60H40V90H10V60ZM15 65V85H35V65H15Z" fill="black" />
                          <path d="M20 70H30V80H20V70Z" fill="black" />
                          <rect x="50" y="50" width="10" height="10" fill="black" />
                          <rect x="70" y="50" width="20" height="10" fill="black" />
                          <rect x="50" y="70" width="15" height="15" fill="black" />
                          <rect x="75" y="70" width="15" height="20" fill="black" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {lang === 'te' ? 'ఏదైనా UPI యాప్ ద్వారా స్కాన్ చేయండి' : 'Scan with GPay, PhonePe or Paytm'}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">UPI ID: ayurveda@upi</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        {lang === 'te' ? 'మీ UPI ID ని టైప్ చేయండి' : 'Enter your UPI ID'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi"
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                        />
                        <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {method === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4532 0000 0000 0000"
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="12/28"
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary font-mono text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {method === 'netbanking' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {lang === 'te' ? 'బ్యాంకును ఎంచుకోండి' : 'Choose Popular Bank'}
                  </label>
                  <div className="space-y-1.5">
                    {BANKS.map((bank) => (
                      <label
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={cn(
                          'flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition-colors',
                          selectedBank === bank.id
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border/60 bg-card hover:bg-muted/30 text-foreground'
                        )}
                      >
                        <span>{bank.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{bank.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            {/* Submit CTA */}
            <div className="space-y-2">
              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-sm font-bold shadow-soft hover:shadow-card transition-all disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{lang === 'te' ? 'పరిశీలిస్తోంది...' : 'Processing Payment...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span className={isTelugu ? 'font-telugu' : ''}>
                      {lang === 'te' ? `₹${price} చెల్లించి అన్‌లాక్ చేయండి` : `Pay ₹${price} & Unlock Ebook`}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'te' ? '100% సేఫ్ & ఇన్స్టెంట్ యాక్సెస్' : '100% Safe & Instant Unlock'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
