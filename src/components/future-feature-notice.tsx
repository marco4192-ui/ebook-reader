'use client';

import { Construction } from 'lucide-react';

interface FutureFeatureNoticeProps {
  /** Kurzer Titel, Standard: „Geplante Funktion“ */
  title?: string;
  /** Erklärung, was bereits funktioniert und was noch nicht. */
  description: string;
}

/**
 * Ehrlicher Hinweis-Banner für Funktionen, die noch in Entwicklung sind.
 * Wird in Panels verwendet, deren Backend-Anbindung noch nicht existiert,
 * damit keine Schein-Erfolge („Verbunden!“, „E-Mail gesendet!“) angezeigt werden.
 */
export function FutureFeatureNotice({ title = 'Geplante Funktion', description }: FutureFeatureNoticeProps) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-50 p-3 dark:bg-amber-950/20"
    >
      <Construction className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <div className="text-xs">
        <p className="font-medium text-amber-900 dark:text-amber-200">{title}</p>
        <p className="text-amber-800/80 dark:text-amber-300/80">{description}</p>
      </div>
    </div>
  );
}
