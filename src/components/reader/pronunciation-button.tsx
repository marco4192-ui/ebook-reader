'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Type, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export const PronunciationButton = ({ text }: { text: string }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [pronunciation, setPronunciation] = useState<{
    phonetic?: string;
    syllables?: string;
    tips?: string;
    difficulty?: number;
  } | null>(null);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast.error('Sprachausgabe nicht unterstützt');
    }
  };

  const fetchPronunciation = async () => {
    try {
      const response = await fetch('/api/pronounce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: 'de-DE' }),
      });
      const result = await response.json();
      if (result.success) {
        setPronunciation(result.pronunciation);
        setShowGuide(true);
      }
    } catch (error) {
      console.error('Pronunciation fetch error:', error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={speak} className="h-7 px-2">
          <Volume2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={fetchPronunciation} className="h-7 px-2">
          <BookOpen className="w-4 h-4" />
        </Button>
      </div>
      <AnimatePresence>
        {showGuide && pronunciation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-[100] bg-popover border rounded-lg shadow-xl p-4 w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Aussprache
              </h4>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowGuide(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              {pronunciation.phonetic && (
                <div>
                  <span className="text-muted-foreground">Phonetisch:</span>
                  <p className="font-mono">{pronunciation.phonetic}</p>
                </div>
              )}
              {pronunciation.syllables && (
                <div>
                  <span className="text-muted-foreground">Silben:</span>
                  <p>{pronunciation.syllables}</p>
                </div>
              )}
              {pronunciation.tips && (
                <p className="text-xs text-muted-foreground">{pronunciation.tips}</p>
              )}
              {pronunciation.difficulty && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Schwierigkeit:</span>
                  <Progress value={(pronunciation.difficulty / 5) * 100} className="h-1.5 w-16" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
