'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Type, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const AISummaryPanel = ({ text, onClose }: { text: string; onClose: () => void }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.substring(0, 5000) }) });
        const data = await response.json();
        setSummary(data.summary || 'Zusammenfassung nicht verfügbar.');
      } catch { setSummary('Fehler beim Generieren.'); }
      setLoading(false);
    };
    generate();
  }, [text]);

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" />KI-Zusammenfassung</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100%-80px)] mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4" />
              <p className="text-muted-foreground">Generiere Zusammenfassung...</p>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none"><ReactMarkdown>{summary}</ReactMarkdown></div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
