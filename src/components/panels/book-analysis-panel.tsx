'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Type,
  Clock,
  BarChart3,
  Tag,
  AlertCircle,
  Zap,
  Brain,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface AnalysisData {
  difficulty: number;
  readabilityScore: number;
  vocabularyComplexity: string;
  estimatedReadingTime: number;
  keyThemes: string[];
  moodAnalysis: {
    overall: string;
    breakdown: { emotion: string; percentage: number }[];
  };
  emotionCurve: { position: number; emotion: string; intensity: number }[];
}

export const BookAnalysisPanel = ({ text, bookTitle, author, open, onOpenChange }: { text: string; bookTitle: string; author?: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'themes' | 'mood'>('metrics');
  // Schlüssel der Anfrage, deren Ergebnis gerade angezeigt wird.
  // Der Ladezustand wird daraus abgeleitet (statt per setState im Effekt zu spiegeln).
  const [completedKey, setCompletedKey] = useState<string | null>(null);
  const requestKey = `${open}|${bookTitle}|${text}`;
  const loading = completedKey !== requestKey;

  useEffect(() => {
    if (!open || !text) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.substring(0, 8000), bookTitle, author })
        });
        const data = await response.json();
        if (!cancelled) setAnalysis(data.analysis);
      } catch {
        if (!cancelled) toast.error('Analyse fehlgeschlagen');
      }
      // erst NACH dem await: setzt den Ladeindikator zurück
      if (!cancelled) setCompletedKey(`${open}|${bookTitle}|${text}`);
    })();
    return () => { cancelled = true; };
  }, [open, text, bookTitle, author]);

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return 'text-green-500';
    if (level <= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return 'Leicht';
    if (level <= 6) return 'Mittel';
    return 'Schwierig';
  };

  const emotionColors: Record<string, string> = {
    'Freude': 'bg-yellow-400',
    'Trauer': 'bg-blue-400',
    'Angst': 'bg-purple-400',
    'Wut': 'bg-red-400',
    'Überraschung': 'bg-pink-400',
    'Neutral': 'bg-gray-400',
    'Hoffnung': 'bg-green-400',
    'Spannung': 'bg-orange-400',
    'Melancholie': 'bg-indigo-400',
    'Liebe': 'bg-rose-400',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Lese-Analyse
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
            <p className="text-muted-foreground">Analysiere Text...</p>
          </div>
        ) : analysis ? (
          <div className="mt-4 space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {[
                { id: 'metrics', label: 'Metriken', icon: BarChart3 },
                { id: 'themes', label: 'Themen', icon: Tag },
                { id: 'mood', label: 'Stimmung', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-background shadow' : 'text-muted-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <ScrollArea className="h-[calc(100vh-250px)]">
              {activeTab === 'metrics' && (
                <div className="space-y-4">
                  {/* Difficulty */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          Schwierigkeitsgrad
                        </Label>
                        <span className={`font-bold ${getDifficultyColor(analysis.difficulty)}`}>
                          {analysis.difficulty}/10
                        </span>
                      </div>
                      <Progress value={analysis.difficulty * 10} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {getDifficultyLabel(analysis.difficulty)} zu lesen
                      </p>
                    </CardContent>
                  </Card>

                  {/* Readability */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          Lesbarkeit
                        </Label>
                        <span className="font-bold text-blue-500">{analysis.readabilityScore}%</span>
                      </div>
                      <Progress value={analysis.readabilityScore} className="h-2" />
                    </CardContent>
                  </Card>

                  {/* Vocabulary & Reading Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Type className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                        <p className="font-bold capitalize">{analysis.vocabularyComplexity}</p>
                        <p className="text-xs text-muted-foreground">Wortschatz</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        <p className="font-bold">~{analysis.estimatedReadingTime} Min</p>
                        <p className="text-xs text-muted-foreground">Lesezeit</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'themes' && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-primary" />
                        Hauptthemen
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keyThemes.map((theme, i) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'mood' && (
                <div className="space-y-4">
                  {/* Overall Mood */}
                  <Card>
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Hauptstimmung: {analysis.moodAnalysis.overall}
                      </Label>
                      <div className="space-y-2">
                        {analysis.moodAnalysis.breakdown.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs w-20">{item.emotion}</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className={`h-full rounded-full ${emotionColors[item.emotion] || 'bg-gray-400'}`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emotion Curve */}
                  <Card>
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Emotionskurve
                      </Label>
                      <div className="h-32 flex items-end gap-1">
                        {analysis.emotionCurve.map((point, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-full rounded-t ${emotionColors[point.emotion] || 'bg-gray-400'}`}
                              style={{ height: `${point.intensity}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground mt-1">{point.position}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Keine Analyse verfügbar</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
