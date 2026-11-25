'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export const WikipediaPopup = ({
  term,
  position,
  onClose,
}: {
  term: string;
  position: { x: number; y: number };
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    title: string;
    summary: string;
    details?: string;
    relatedTerms?: string[];
    source: string;
  } | null>(null);

  useEffect(() => {
    const fetchWikipedia = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/wikipedia?term=${encodeURIComponent(term)}&lang=de`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Wikipedia fetch error:', error);
      }
      setLoading(false);
    };
    fetchWikipedia();
  }, [term]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[100] bg-popover border rounded-lg shadow-xl w-80 max-h-96 overflow-hidden"
      style={{ left: Math.min(position.x, window.innerWidth - 340), top: Math.max(position.y - 20, 10) }}
    >
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-sm">Wikipedia</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="max-h-72">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="p-4 space-y-3">
            <h4 className="font-semibold">{data.title}</h4>
            <p className="text-sm text-muted-foreground">{data.summary}</p>
            {data.details && (
              <p className="text-xs text-muted-foreground border-t pt-2">{data.details}</p>
            )}
            {data.relatedTerms && data.relatedTerms.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {data.relatedTerms.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground pt-2">Quelle: {data.source}</p>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Keine Information gefunden
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};
