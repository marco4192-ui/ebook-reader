import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface AutoTagEnhancedResult {
  genres: string[];
  moods: string[];
  contentWarnings: string[];
}

const EMPTY_RESULT: AutoTagEnhancedResult = { genres: [], moods: [], contentWarnings: [] };

export async function POST(request: NextRequest) {
  try {
    const { title, author, content } = await request.json();

    if (!title) {
      return NextResponse.json(EMPTY_RESULT);
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Du bist ein Buch-Kategorisierungs-Assistent. Analysiere Titel, Autor und (falls vorhanden) einen Textauszug und gib zurück:

1. genres: 2-4 passende Genres (z. B. Fantasy, Krimi, Sachbuch)
2. moods: 2-3 Stimmungen (z. B. spannend, melancholisch, humorvoll)
3. contentWarnings: ggf. Inhaltshinweise (z. B. Gewalt, Drogen), sonst leeres Array

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt in dieser Form:
{"genres": ["..."], "moods": ["..."], "contentWarnings": ["..."]}`,
        },
        {
          role: 'user',
          content: `Titel: ${title}${author ? `\nAutor: ${author}` : ''}${content ? `\nAuszug: ${content.substring(0, 1500)}` : ''}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    try {
      // Modell-Antwort kann von Markdown-Codeblöcken umschlossen sein.
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      return NextResponse.json({
        genres: Array.isArray(parsed?.genres) ? parsed.genres.slice(0, 5) : [],
        moods: Array.isArray(parsed?.moods) ? parsed.moods.slice(0, 4) : [],
        contentWarnings: Array.isArray(parsed?.contentWarnings) ? parsed.contentWarnings.slice(0, 4) : [],
      } satisfies AutoTagEnhancedResult);
    } catch {
      return NextResponse.json(EMPTY_RESULT);
    }
  } catch (error) {
    console.error('Enhanced auto-tag error:', error);
    return NextResponse.json(EMPTY_RESULT);
  }
}
