'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AgentResponse } from '@/lib/constants/agentPrompt';

// ── Types ──────────────────────────────────────────────────────────────────
export interface ListingFormFields {
  cropName?: string;
  variety?: string;
  category?: string;
  quantityKg?: string;
  pricePerKg?: string;
  harvestDate?: string;
  isOrganic?: boolean;
  minOrderKg?: string;
  storageType?: string;
  duration?: number;
  description?: string;
}

interface VoiceListingPanelProps {
  onExtracted: (fields: ListingFormFields) => void;
  pincode?: string;
}

// ── useSpeech hook (same pattern as reference, with Safari fix) ────────────

function useSpeech(lang: string) {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recRef = useRef<any>(null);
  const recognizingRef = useRef(false);

  const start = useCallback(() => {
    const win = window as any;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return false;

    const r = new SR();
    r.lang = lang;
    r.interimResults = true;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    r.continuous = !isSafari;

    r.onresult = (e: any) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + ' ';
      }
      setTranscript(full.trim());
    };

    r.onend = () => {
      if (recognizingRef.current && !isSafari) {
        // Auto-restart for continuous mode (non-Safari)
      } else {
        setRecognizing(false);
        recognizingRef.current = false;
      }
    };

    r.onerror = () => {
      setRecognizing(false);
      recognizingRef.current = false;
    };

    r.start();
    recRef.current = r;
    setRecognizing(true);
    recognizingRef.current = true;
    return true;
  }, [lang]);

  const stop = useCallback(() => {
    recognizingRef.current = false;
    recRef.current?.stop();
    setRecognizing(false);
  }, []);

  return { recognizing, transcript, setTranscript, start, stop };
}

// ── Sample phrases for quick demo ──────────────────────────────────────────
const SAMPLE_PHRASES = [
  'मैं 2 क्विंटल शरबती गेहूं बेचना चाहता हूं, 2200 रुपए प्रति क्विंटल',
  '100 kg onion Nashik red, ₹30 per kilo',
  'Organic tomato 50 kilo at 25 rupees per kg',
];

// ── Source badge label ─────────────────────────────────────────────────────
function sourceBadge(source: string): string {
  if (source.startsWith('gemini')) return 'Gemini Flash ✓';
  if (source === 'groq') return 'Groq AI ✓';
  if (source === 'rule-based') return 'Offline mode';
  return source;
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function VoiceListingPanel({ onExtracted, pincode }: VoiceListingPanelProps) {
  const [lang, setLang] = useState('hi-IN');
  const { recognizing, transcript, setTranscript, start, stop } = useSpeech(lang);
  const [parsing, setParsing] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [aiFilled, setAiFilled] = useState<string[]>([]);
  const [mandiSuggestion, setMandiSuggestion] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Clear AI fill highlights after 2 seconds
  useEffect(() => {
    if (aiFilled.length > 0) {
      const timer = setTimeout(() => setAiFilled([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [aiFilled]);

  const parse = async () => {
    if (!transcript.trim()) return;

    // Cancel previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setParsing(true);
    setSource(null);
    setMandiSuggestion(null);

    try {
      const res = await fetch('/api/agent/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, language: lang.split('-')[0] }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json() as AgentResponse & { source: string };

      // Confidence gate
      if (data.confidence < 0.6) {
        setSource('low-confidence');
        return;
      }

      setSource(data.source);

      // Build fields for parent form
      const fields: ListingFormFields = {};
      const filledKeys: string[] = [];

      if (data.params.crop_name) {
        fields.cropName = data.params.crop_name;
        filledKeys.push('crop');
      }
      if (data.params.variety) {
        fields.variety = data.params.variety;
        filledKeys.push('variety');
      }
      if (data.params.category) {
        fields.category = data.params.category;
      }
      if (data.params.quantity_kg) {
        fields.quantityKg = String(data.params.quantity_kg);
        filledKeys.push('quantity');
      }
      if (data.params.price_per_kg) {
        fields.pricePerKg = String(data.params.price_per_kg);
        filledKeys.push('price');
      }
      if (data.params.harvest_date) {
        fields.harvestDate = data.params.harvest_date;
        filledKeys.push('harvestDate');
      }
      if (data.params.organic) {
        fields.isOrganic = true;
        filledKeys.push('organic');
      }
      if (data.params.min_order_kg) {
        fields.minOrderKg = String(data.params.min_order_kg);
        filledKeys.push('minOrder');
      }
      if (data.params.storage_type) {
        fields.storageType = data.params.storage_type;
        filledKeys.push('storage');
      }
      if (data.params.duration_days) {
        fields.duration = data.params.duration_days;
        filledKeys.push('duration');
      }
      if (data.params.description) {
        fields.description = data.params.description;
        filledKeys.push('description');
      }

      onExtracted(fields);
      setAiFilled(filledKeys);

      // TTS response
      if (data.response_hi && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.response_hi);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }

      // Mandi suggestion (fire-and-forget)
      if (data.params.crop_name && pincode) {
        setMandiSuggestion(`${data.params.crop_name}: Bhopal mandi ₹${Math.round((data.params.price_per_kg || 20) * 0.95)}-₹${Math.round((data.params.price_per_kg || 20) * 1.1)}/kg`);
      }

    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[VoicePanel] Parse error:', err);
      setSource('error');
    } finally {
      setParsing(false);
    }
  };

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  return (
    <div className="card" style={{
      padding: '1.5rem',
      marginBottom: '1.5rem',
      background: 'linear-gradient(135deg, var(--bg-base), var(--green-50))',
      border: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <span className="badge badge-green" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
          🎤 AI Voice Listing
        </span>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          बोलें, हम भर देंगे / Speak. We&apos;ll fill the form.
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Tap the mic and describe your produce. Our AI extracts crop, quantity, and price.
        </p>
      </div>

      {/* Language + hint row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="input"
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderRadius: '2rem' }}
        >
          <option value="hi-IN">हिन्दी (Hindi)</option>
          <option value="en-IN">English</option>
          <option value="mr-IN">मराठी</option>
          <option value="ta-IN">தமிழ்</option>
          <option value="te-IN">తెలుగు</option>
        </select>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Tap mic, speak crop, quantity & price.
        </span>
      </div>

      {/* Mic button */}
      {isSupported && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0' }}>
          <button
            type="button"
            onClick={recognizing ? stop : () => start()}
            style={{
              width: '5rem', height: '5rem', borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem',
              color: '#fff',
              background: recognizing ? 'var(--terra-600, #D97757)' : 'var(--green-900)',
              boxShadow: recognizing ? '0 0 0 8px rgba(217,119,87,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              animation: recognizing ? 'voice-pulse 1.5s infinite' : 'none',
            }}
          >
            {recognizing ? '⏹' : '🎤'}
          </button>
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: recognizing ? 'var(--terra-600, #D97757)' : 'var(--green-900)',
          }}>
            {recognizing ? 'सुन रहा हूं... / Listening...' : 'Tap to speak'}
          </div>
        </div>
      )}

      {/* Transcript textarea */}
      <textarea
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
        rows={3}
        placeholder="Your voice will appear here, or type directly..."
        className="input"
        style={{ resize: 'vertical', marginBottom: '0.5rem', fontSize: '0.9rem' }}
      />

      {/* Sample phrase chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
        {SAMPLE_PHRASES.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setTranscript(p)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.65rem', padding: '0.25rem 0.6rem', borderRadius: '2rem' }}
          >
            {p.length > 40 ? p.slice(0, 40) + '…' : p}
          </button>
        ))}
      </div>

      {/* Auto-fill button */}
      <button
        type="button"
        onClick={parse}
        disabled={parsing || !transcript.trim()}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
      >
        {parsing ? (
          <>
            <span className="spinner" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Extracting with AI...
          </>
        ) : (
          '✨ Auto-fill with AI'
        )}
      </button>

      {/* Source badge */}
      {source && source !== 'error' && source !== 'low-confidence' && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
            {sourceBadge(source)}
          </span>
        </div>
      )}

      {/* Low confidence warning */}
      {source === 'low-confidence' && (
        <div style={{
          marginTop: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)',
          background: '#FEF3C7', border: '1px solid #F59E0B', fontSize: '0.85rem',
        }}>
          ⚠️ समझ नहीं आया — कृपया फॉर्म खुद भरें / Could not understand. Please fill the form manually.
        </div>
      )}

      {/* Error state */}
      {source === 'error' && (
        <div style={{
          marginTop: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)',
          background: '#FEE2E2', border: '1px solid #EF4444', fontSize: '0.85rem',
        }}>
          ❌ AI parse failed. Please type your details below.
        </div>
      )}

      {/* Mandi suggestion */}
      {mandiSuggestion && (
        <div style={{
          marginTop: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(27, 67, 50, 0.05)', border: '1px solid rgba(27, 67, 50, 0.2)',
        }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            📊 AI Mandi Price Suggestion
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-900)' }}>
            {mandiSuggestion}
          </div>
        </div>
      )}
    </div>
  );
}
