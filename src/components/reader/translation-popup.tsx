'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Type, Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const languageOptions = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'Englisch', flag: '🇬🇧' },
  { code: 'fr', name: 'Französisch', flag: '🇫🇷' },
  { code: 'es', name: 'Spanisch', flag: '🇪🇸' },
  { code: 'it', name: 'Italienisch', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugiesisch', flag: '🇵🇹' },
  { code: 'nl', name: 'Niederländisch', flag: '🇳🇱' },
  { code: 'fi', name: 'Finnisch', flag: '🇫🇮' },
  { code: 'sv', name: 'Schwedisch', flag: '🇸🇪' },
  { code: 'pl', name: 'Polnisch', flag: '🇵🇱' },
  { code: 'zh', name: 'Chinesisch', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanisch', flag: '🇯🇵' },
];

export const TranslationPopup = ({ text, position, onClose }: { text: string; position: { x: number; y: number }; onClose: () => void }) => {
  const [targetLang, setTargetLang] = useState('de');
  // Ergebnis der letzten abgeschlossenen Übersetzung; der Ladezustand wird
  // daraus abgeleitet (statt setLoading synchron im Effekt zu setzen)
  const [completed, setCompleted] = useState<{ key: string; value: string } | null>(null);
  const requestKey = `${targetLang}:${text}`;
  const loading = completed?.key !== requestKey;
  const translatedText = completed?.key === requestKey ? completed.value : '';

  useEffect(() => {
    let cancelled = false;
    const key = `${targetLang}:${text}`;
    (async () => {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLanguage: targetLang })
        });
        const data = await response.json();
        // erst NACH dem await – und nur, wenn nicht inzwischen eine neuere
        // Anfrage gestartet wurde (verhindert veraltete Antworten)
        if (!cancelled) setCompleted({ key, value: data.translatedText });
      } catch {
        if (!cancelled) setCompleted({ key, value: 'Übersetzung fehlgeschlagen' });
      }
    })();
    return () => { cancelled = true; };
  }, [targetLang, text]);

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'Englisch', flag: '🇬🇧' },
    { code: 'fr', name: 'Französisch', flag: '🇫🇷' },
    { code: 'es', name: 'Spanisch', flag: '🇪🇸' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[100] w-72"
      style={{ left: position.x, top: position.y }}
    >
      <Card className="shadow-xl border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Übersetzung</span>
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onClose}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-1 mb-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={targetLang === lang.code ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setTargetLang(lang.code)}
              >
                {lang.flag}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2 italic">"{text.substring(0, 100)}{text.length > 100 ? '...' : ''}"</p>
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-sm bg-muted/50 p-2 rounded">{translatedText}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
