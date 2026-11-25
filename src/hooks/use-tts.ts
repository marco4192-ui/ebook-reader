'use client';

import { useState, useRef, useCallback } from 'react';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { settings } = useBookStore();

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.ttsSpeed;
      const voices = window.speechSynthesis.getVoices();
      if (settings.ttsVoice) {
        const voice = voices.find(v => v.name === settings.ttsVoice);
        if (voice) utterance.voice = voice;
      } else if (voices.length > 0) utterance.voice = voices[0];
      utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); onEnd?.(); };
      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    } else toast.error('TTS wird nicht unterstützt');
  }, [settings.ttsSpeed, settings.ttsVoice]);

  const stop = useCallback(() => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false); } }, []);
  const pause = useCallback(() => { if ('speechSynthesis' in window) { window.speechSynthesis.pause(); setIsPaused(true); } }, []);
  const resume = useCallback(() => { if ('speechSynthesis' in window) { window.speechSynthesis.resume(); setIsPaused(false); } }, []);

  return { speak, stop, pause, resume, isSpeaking, isPaused };
};
