'use client';

import { useState } from 'react';
import { Type } from 'lucide-react';

export interface AutoTagResult {
  genres: string[];
  moods: string[];
  contentWarnings: string[];
}

export const useEnhancedAutoTag = () => {
  const [loading, setLoading] = useState(false);

  const generateTags = async (book: { title: string; author?: string; content?: string }): Promise<AutoTagResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/autotag-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      const data = await response.json();
      return data;
    } catch {
      return { genres: [], moods: [], contentWarnings: [] };
    } finally {
      setLoading(false);
    }
  };

  return { generateTags, loading };
};
