'use client';

import { useMemo } from 'react';
import { type Character } from '@/lib/book-store';

export const CharacterHighlighter = ({
  content,
  characters,
  onCharacterClick,
}: {
  content: string;
  characters: Character[];
  onCharacterClick?: (character: Character) => void;
}) => {
  const highlightedContent = useMemo(() => {
    if (!characters.length) return content;

    // Sort by name length (longest first) to avoid overlapping highlights
    const sortedCharacters = [...characters].sort((a, b) => b.name.length - a.name.length);
    
    let result = content;
    const charColors = [
      'bg-blue-200 dark:bg-blue-800/40',
      'bg-green-200 dark:bg-green-800/40',
      'bg-purple-200 dark:bg-purple-800/40',
      'bg-pink-200 dark:bg-pink-800/40',
      'bg-cyan-200 dark:bg-cyan-800/40',
      'bg-amber-200 dark:bg-amber-800/40',
    ];

    sortedCharacters.forEach((char, index) => {
      const color = charColors[index % charColors.length];
      const regex = new RegExp(`\\b(${char.name}${char.aliases?.map(a => `|${a}`).join('') || ''})\\b`, 'gi');
      result = result.replace(regex, `<span class="${color} px-0.5 rounded cursor-pointer hover:ring-2 hover:ring-primary" data-character-id="${char.id}">$1</span>`);
    });

    return result;
  }, [content, characters]);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.dataset.characterId) {
          const char = characters.find(c => c.id === target.dataset.characterId);
          if (char && onCharacterClick) {
            onCharacterClick(char);
          }
        }
      }}
    />
  );
};
