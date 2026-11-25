'use client';

import { useState, useRef, useEffect } from 'react';
import { Type, RefreshCw, Sparkles, Play, Pause, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { type Book } from '@/lib/book-store';
import { FutureFeatureNotice } from '@/components/future-feature-notice';
import { toast } from 'sonner';

export const PodcastModePanel = ({ book, bookContent, open, onOpenChange }: { book?: Book; bookContent?: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastScript, setPodcastScript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices.filter(v => v.lang.startsWith('de') || v.lang.startsWith('en')));
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const generatePodcast = async () => {
    if (!bookContent) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bookContent.substring(0, 4000), style: 'podcast' }),
      });
      const data = await response.json();
      setPodcastScript(data.summary || 'Podcast konnte nicht generiert werden.');
    } catch {
      toast.error('Fehler beim Generieren');
    }
    setIsGenerating(false);
  };

  const playPodcast = () => {
    if ('speechSynthesis' in window && podcastScript) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(podcastScript);
      const germanVoice = voices.find(v => v.lang.startsWith('de'));
      if (germanVoice) utterance.voice = germanVoice;
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      ttsRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const stopPodcast = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Podcast-Modus
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <p className="text-muted-foreground text-sm">
            Wandle dein Buch in einen Podcast um! Perfekt zum Hören während du unterwegs bist.
          </p>

          {!book || !bookContent ? (
            <FutureFeatureNotice
              title="Podcast-Modus benötigt ein geöffnetes Buch"
              description="Öffne ein Buch im Reader, um den Podcast-Modus mit dessen Inhalt zu nutzen. Ohne geöffnetes Buch ist hier keine Generierung möglich – stattdessen zeigen wir diesen ehrlichen Hinweis statt einer Schein-Funktion."
            />
          ) : !podcastScript ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Radio className="w-16 h-16 mx-auto text-primary/50 mb-4" />
                <h3 className="font-semibold mb-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  KI generiert eine Podcast-Version deines Buches
                </p>
                <Button onClick={generatePodcast} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generiere Podcast...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Podcast erstellen
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Podcast-Script</h4>
                    <div className="flex gap-2">
                      {isPlaying ? (
                        <Button onClick={stopPodcast} variant="destructive" size="sm">
                          <Pause className="w-4 h-4 mr-1" />Stopp
                        </Button>
                      ) : (
                        <Button onClick={playPodcast} size="sm">
                          <Play className="w-4 h-4 mr-1" />Abspielen
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-48">
                    <p className="text-sm whitespace-pre-wrap">{podcastScript}</p>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setPodcastScript('')}>
                  Neu generieren
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
