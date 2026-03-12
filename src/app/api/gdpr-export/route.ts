import { NextRequest, NextResponse } from 'next/server';

interface GDPRData {
  exportDate: string;
  version: string;
  user: {
    settings: Record<string, unknown>;
    preferences: Record<string, unknown>;
  };
  books: Array<{
    id: string;
    title: string;
    author?: string;
    format: string;
    progress: number;
    rating?: number;
    tags: string[];
    addedAt: number;
    lastRead?: number;
  }>;
  bookmarks: Array<{
    id: string;
    bookId: string;
    title: string;
    location: string;
    createdAt: number;
  }>;
  highlights: Array<{
    id: string;
    bookId: string;
    text: string;
    color: string;
    note?: string;
    location: string;
    createdAt: number;
  }>;
  notes: Array<{
    id: string;
    bookId: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
  }>;
  readingStats: {
    totalBooksRead: number;
    totalPagesRead: number;
    totalReadingTime: number;
    currentStreak: number;
    longestStreak: number;
    dailyStats: Record<string, { pages: number; time: number }>;
  };
  achievements: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    unlockedAt?: number;
  }>;
  readingSessions: Array<{
    id: string;
    bookId: string;
    startTime: number;
    endTime?: number;
    pagesRead: number;
    duration: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, format } = body as { data: GDPRData; format: 'json' | 'markdown' };

    if (format === 'markdown') {
      const markdown = generateMarkdownReport(data);
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="gdpr-export-${Date.now()}.md"`,
        },
      });
    }

    // Default: JSON format
    const jsonData = JSON.stringify(data, null, 2);
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="gdpr-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json({ error: 'GDPR export failed' }, { status: 500 });
  }
}

function generateMarkdownReport(data: GDPRData): string {
  let markdown = `# GDPR Datenexport - eBook Reader

**Exportiert am:** ${data.exportDate}
**Version:** ${data.version}

---

## 📊 Übersicht

| Metrik | Wert |
|--------|------|
| Bücher insgesamt | ${data.books.length} |
| Markierungen | ${data.highlights.length} |
| Notizen | ${data.notes.length} |
| Lesezeichen | ${data.bookmarks.length} |
| Gelesene Seiten | ${data.readingStats.totalPagesRead} |
| Lesezeit gesamt | ${Math.floor(data.readingStats.totalReadingTime / 60)} Minuten |
| Aktuelle Lesestreak | ${data.readingStats.currentStreak} Tage |
| Längste Streak | ${data.readingStats.longestStreak} Tage |

---

## 📚 Bücher

`;

  data.books.forEach((book, index) => {
    markdown += `### ${index + 1}. ${book.title}
${book.author ? `**Autor:** ${book.author}\n` : ''}- **Format:** ${book.format}
- **Fortschritt:** ${book.progress}%
- **Hinzugefügt am:** ${new Date(book.addedAt).toLocaleDateString('de-DE')}
${book.lastRead ? `- **Zuletzt gelesen:** ${new Date(book.lastRead).toLocaleDateString('de-DE')}\n` : ''}${book.rating ? `- **Bewertung:** ${'⭐'.repeat(book.rating)}\n` : ''}${book.tags.length > 0 ? `- **Tags:** ${book.tags.join(', ')}\n` : ''}

`;
  });

  if (data.highlights.length > 0) {
    markdown += `---

## 🖍️ Markierungen

`;
    data.highlights.forEach((highlight, index) => {
      const book = data.books.find(b => b.id === highlight.bookId);
      markdown += `### Markierung ${index + 1}
> "${highlight.text}"

${book ? `- **Buch:** ${book.title}\n` : ''}- **Farbe:** ${highlight.color}
- **Erstellt am:** ${new Date(highlight.createdAt).toLocaleDateString('de-DE')}
${highlight.note ? `- **Notiz:** ${highlight.note}\n` : ''}

`;
    });
  }

  if (data.notes.length > 0) {
    markdown += `---

## 📝 Notizen

`;
    data.notes.forEach((note, index) => {
      const book = data.books.find(b => b.id === note.bookId);
      markdown += `### ${note.title}
${book ? `*Buch: ${book.title}*\n\n` : ''}${note.content}

*Erstellt: ${new Date(note.createdAt).toLocaleDateString('de-DE')}*
${note.tags.length > 0 ? `*Tags: ${note.tags.join(', ')}*` : ''}

---

`;
    });
  }

  if (data.achievements.length > 0) {
    markdown += `---

## 🏆 Erfolge

| Erfolg | Beschreibung | Status |
|--------|--------------|--------|
`;
    data.achievements.forEach((achievement) => {
      const status = achievement.unlockedAt ? '✅ Freigeschaltet' : '🔒 Gesperrt';
      markdown += `| ${achievement.title} | ${achievement.description} | ${status} |\n`;
    });
  }

  markdown += `---

## ⚙️ Einstellungen

\`\`\`json
${JSON.stringify(data.user.settings, null, 2)}
\`\`\`

---

## 📖 Lesestatistiken (Täglich)

`;
  const dailyStats = data.readingStats.dailyStats;
  const sortedDates = Object.keys(dailyStats).sort().reverse().slice(0, 30);
  
  sortedDates.forEach((date) => {
    const stat = dailyStats[date];
    markdown += `- **${date}:** ${stat.pages} Seiten, ${Math.floor(stat.time / 60)} Minuten\n`;
  });

  markdown += `
---

*Dieser Export wurde gemäß der DSGVO (GDPR) erstellt. Alle Ihre persönlichen Daten sind in diesem Export enthalten.*

**Anfrage zur Löschung:** Um alle Ihre Daten zu löschen, nutzen Sie die "Daten löschen" Funktion in den Datenschutzeinstellungen.
`;

  return markdown;
}
