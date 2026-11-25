'use client';

import { useState, useRef, useEffect } from 'react';
import { Zap, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';

export const SpeedReadingPanel = ({
  text,
  open,
  onOpenChange,
}: {
  text: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { settings, updateSettings } = useBookStore();
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Split text into words and filter out empty strings
    const wordList = text.split(/\s+/).filter(w => w.trim().length > 0);
    setWords(wordList);
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const intervalMs = 60000 / settings.speedReadingWPM;
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, settings.speedReadingWPM, words.length]);

  const togglePlay = () => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const goBack = () => {
    setCurrentIndex(Math.max(0, currentIndex - 10));
  };

  const goForward = () => {
    setCurrentIndex(Math.min(words.length - 1, currentIndex + 10));
  };

  const currentWord = words[currentIndex] || '';
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  // Calculate optimal reading position (ORP) - highlight middle of word
  const getORPIndex = (word: string): number => {
    const len = word.length;
    if (len <= 1) return 0;
    if (len <= 4) return 1;
    if (len <= 8) return 2;
    return 3;
  };

  const renderWord = (word: string) => {
    const orpIndex = getORPIndex(word);
    return (
      <span className="inline-flex items-center">
        <span className="text-muted-foreground">{word.slice(0, orpIndex)}</span>
        <span className="text-primary font-bold">{word[orpIndex]}</span>
        <span className="text-muted-foreground">{word.slice(orpIndex + 1)}</span>
      </span>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Speed Reading (RSVP)
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] space-y-6">
          {/* Word Display */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-4 min-h-[80px] flex items-center justify-center">
              {renderWord(currentWord)}
            </div>
            <p className="text-sm text-muted-foreground">
              Wort {currentIndex + 1} von {words.length}
            </p>
          </div>

          {/* Progress */}
          <div className="w-full max-w-md">
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <span>{settings.speedReadingWPM} WPM</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={goBack}>
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button size="lg" onClick={togglePlay} className="w-16 h-16 rounded-full">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Button variant="outline" size="icon" onClick={goForward}>
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* WPM Slider */}
          <div className="w-full max-w-md space-y-2">
            <Label className="text-sm">Geschwindigkeit: {settings.speedReadingWPM} Wörter/Min</Label>
            <Slider
              value={[settings.speedReadingWPM]}
              onValueChange={([value]) => updateSettings({ speedReadingWPM: value })}
              min={100}
              max={600}
              step={25}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
