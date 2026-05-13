'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import styles from './MicFAB.module.css';

/**
 * MicFAB — Premium Floating Action Button for farmer voice commands.
 * Provides STT (Hindi) → NLP (Gemini / Groq / rule-based) → TTS (Hindi) → Navigation.
 * Available on every farmer page via farmer layout.
 */
export default function MicFAB() {
  const router = useRouter();
  const { state, transcript, response, action, isSupported, startListening, stopListening, reset } = useVoiceAgent({ useGemini: true });
  const actionHandled = useRef(false);
  const [minimized, setMinimized] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Show hint tooltip briefly on first render
  useEffect(() => {
    const seen = localStorage.getItem('agriconnect-mic-hint');
    if (!seen) {
      const t = setTimeout(() => setShowHint(true), 3000);
      const t2 = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('agriconnect-mic-hint', 'done');
      }, 8000);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, []);

  // Navigate after TTS finishes speaking
  useEffect(() => {
    if (state === 'IDLE' && action && !actionHandled.current) {
      actionHandled.current = true;
      if (action.type === 'navigate' && action.path) {
        router.push(action.path);
      }
      // Reset after navigation delay
      const timer = setTimeout(() => {
        reset();
        actionHandled.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state, action, router, reset]);

  // Reset actionHandled when starting a new listen
  useEffect(() => {
    if (state === 'LISTENING') {
      actionHandled.current = false;
      setMinimized(false);
      setShowHint(false);
    }
  }, [state]);

  if (!isSupported) return null;

  const handleClick = () => {
    if (state === 'LISTENING') {
      stopListening();
    } else if (state === 'IDLE' || state === 'ERROR') {
      startListening();
    }
  };

  const isActive = state !== 'IDLE';

  const fabClass = [
    styles.fab,
    state === 'IDLE' ? styles.fabIdle :
    state === 'LISTENING' ? styles.fabListening :
    state === 'PROCESSING' ? styles.fabProcessing :
    state === 'SPEAKING' ? styles.fabSpeaking :
    state === 'ERROR' ? styles.fabError : styles.fabIdle,
  ].join(' ');

  const icon =
    state === 'LISTENING' ? '⏹' :
    state === 'PROCESSING' ? '⏳' :
    state === 'SPEAKING' ? '🔊' :
    state === 'ERROR' ? '❌' : '🎤';

  const stateLabel =
    state === 'LISTENING' ? 'सुन रहा हूं... / Listening...' :
    state === 'PROCESSING' ? 'समझ रहा हूं... / Processing...' :
    state === 'SPEAKING' ? '✅ समझ गया / Understood' :
    state === 'ERROR' ? '⚠️ Error' : '';

  // Always show bubble when not IDLE (even without transcript yet)
  const showBubble = isActive && !minimized;

  return (
    <div className={styles['fab-container']}>
      {/* Hint tooltip */}
      {showHint && state === 'IDLE' && (
        <div className={styles.hint} onClick={() => setShowHint(false)}>
          <span className={styles.hintIcon}>🎤</span>
          <span>बोलकर listing बनाएं<br /><small>Tap to speak in Hindi</small></span>
        </div>
      )}

      {/* Transcript / Response Bubble */}
      {showBubble && (
        <div className={styles.bubble}>
          {/* Minimize button */}
          <button
            className={styles.bubbleClose}
            onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
            aria-label="Minimize"
          >
            ✕
          </button>

          {/* State label */}
          <div className={styles.bubbleLabel}>{stateLabel}</div>

          {/* Content based on state */}
          {state === 'LISTENING' && (
            <>
              <div className={styles.bubbleText}>
                {transcript || 'बोलिए... / Speak now...'}
              </div>
              <div className={styles.waveform}>
                <div className={styles.waveBar} />
                <div className={styles.waveBar} />
                <div className={styles.waveBar} />
                <div className={styles.waveBar} />
                <div className={styles.waveBar} />
                <div className={styles.waveBar} />
                <div className={styles.waveBar} />
              </div>
            </>
          )}

          {state === 'PROCESSING' && (
            <>
              <div className={styles.bubbleText}>{transcript}</div>
              <div className={styles.processingDots}>
                <span /><span /><span />
              </div>
            </>
          )}

          {state === 'SPEAKING' && (
            <div className={styles.bubbleResponse}>{response}</div>
          )}

          {state === 'ERROR' && (
            <div className={styles.bubbleText}>
              {response || 'Something went wrong. Tap mic to retry.'}
            </div>
          )}
        </div>
      )}

      {/* Ripple rings when listening */}
      {state === 'LISTENING' && (
        <>
          <div className={styles.ripple1} />
          <div className={styles.ripple2} />
        </>
      )}

      {/* FAB Button */}
      <button
        className={fabClass}
        onClick={handleClick}
        aria-label={state === 'LISTENING' ? 'रोकें / Stop' : 'बोलें / Speak'}
        title={state === 'LISTENING' ? 'Stop listening' : 'Speak a command in Hindi'}
      >
        <span className={styles.fabIconWrap}>{icon}</span>
      </button>
    </div>
  );
}
