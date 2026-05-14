'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ruleBasedIntent } from '@/lib/services/agent/ruleBasedFallback';
import { getIntentAction, type VoiceAction } from '@/lib/services/agent/intentActions';
import { getVoiceResponse } from '@/lib/services/agent/voiceResponses';
import type { AgentResponse } from '@/lib/constants/agentPrompt';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface UseVoiceAgentOptions {
  useGemini?: boolean;
}

interface UseVoiceAgentReturn {
  state: VoiceState;
  transcript: string;
  response: string;
  action: VoiceAction | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

/**
 * Voice agent hook — uses browser-native Web Speech API.
 * When useGemini=true and online, sends transcript to /api/agent/process first.
 * Falls back to ruleBasedIntent() on failure or offline.
 */
export function useVoiceAgent(options?: UseVoiceAgentOptions): UseVoiceAgentReturn {
  const useGemini = options?.useGemini ?? false;

  const [state, setState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [action, setAction] = useState<VoiceAction | null>(null);

  // Use ref to track current state — avoids stale closure in event handlers
  const stateRef = useRef<VoiceState>('IDLE');
  const recognitionRef = useRef<any>(null);

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Check browser support
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setState('IDLE');
      return;
    }
    window.speechSynthesis.cancel();
    // Strip emojis so TTS doesn't read them as words
    const clean = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setState('IDLE');
    utterance.onerror = () => setState('IDLE');

    setState('SPEAKING');
    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Gemini API call with 6s timeout ─────────────────────────────────────
  const tryGeminiAPI = useCallback(async (text: string): Promise<AgentResponse | null> => {
    if (!navigator.onLine) {
      console.log('[Voice] Offline — skipping Gemini');
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch('/api/agent/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, language: 'hi' }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return null;
      const data = await res.json() as AgentResponse;
      if (data.confidence < 0.5) return null;
      return data;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }, []);

  const processTranscript = useCallback(async (text: string) => {
    setState('PROCESSING');

    if (useGemini) {
      // Try Gemini first
      const geminiResult = await tryGeminiAPI(text);

      if (geminiResult) {
        const voiceAction = getIntentAction({
          intent: geminiResult.intent,
          params: geminiResult.params as Record<string, unknown>,
          confidence: geminiResult.confidence,
        });
        const voiceResponse = geminiResult.response_hi || getVoiceResponse(geminiResult.intent, geminiResult.params as Record<string, unknown>);

        setResponse(voiceResponse);
        setAction(voiceAction);
        speak(voiceResponse);
        return;
      }

      // Fell through — use rule-based
      console.log('[Voice] Gemini unavailable — falling back to offline mode');
    }

    // Rule-based (always works)
    setTimeout(() => {
      const intentResult = ruleBasedIntent(text);
      const voiceAction = getIntentAction(intentResult);
      const voiceResponse = getVoiceResponse(intentResult.intent, intentResult.params);

      setResponse(voiceResponse);
      setAction(voiceAction);
      speak(voiceResponse);
    }, 400);
  }, [speak, useGemini, tryGeminiAPI]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Abort any existing recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }

    // Reset previous state
    setTranscript('');
    setResponse('');
    setAction(null);

    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'hi-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let hasProcessed = false;

    recognition.onstart = () => {
      setState('LISTENING');
    };

    recognition.onresult = (event: any) => {
      if (hasProcessed) return;

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Show interim results for live feedback
      setTranscript(finalTranscript || interimTranscript);

      // Process when we get a final result
      if (finalTranscript) {
        hasProcessed = true;
        recognitionRef.current = null;
        processTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.log('[Voice] Recognition error:', event.error);
      if (event.error === 'no-speech') {
        setState('IDLE');
        setTranscript('');
      } else if (event.error === 'not-allowed') {
        setState('ERROR');
        setResponse('🎤 Mic blocked — allow mic in browser settings.');
      } else if (event.error === 'aborted') {
        // Manual abort — do nothing, already handled
      } else {
        setState('ERROR');
        setResponse('Voice error. Try again.');
      }
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      // CRITICAL FIX: Use ref, not stale closure value
      const currentState = stateRef.current;
      console.log('[Voice] Recognition ended, current state:', currentState);

      // Only auto-reset to IDLE if we're still in LISTENING
      // (not if we've already moved to PROCESSING or SPEAKING)
      if (currentState === 'LISTENING' && !hasProcessed) {
        setState('IDLE');
        setTranscript('');
      }
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error('[Voice] Failed to start recognition:', err);
      setState('ERROR');
      setResponse('Could not start voice. Try again.');
    }
  }, [isSupported, processTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }
    // Force back to IDLE on manual stop
    if (stateRef.current === 'LISTENING') {
      setState('IDLE');
      setTranscript('');
    }
  }, []);

  const reset = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setState('IDLE');
    setTranscript('');
    setResponse('');
    setAction(null);
  }, []);

  return {
    state,
    transcript,
    response,
    action,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}
