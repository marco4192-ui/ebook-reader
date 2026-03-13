import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { book } = await request.json();
    
    if (!book || !book.title) {
      return NextResponse.json({ tags: [] });
    }

    const zai = await ZAI.create();
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Du bist ein Buch-Kategorisierungs-Assistent. Analysiere den Buchtitel und Autor und schlage 3-5 passende Tags/Kategorien vor.
          
Antworte NUR mit einer JSON-Array von Tags, z.B.: ["Fantasy", "Abenteuer", "Jugendbuch"]

Mögliche Kategorien sind: Fantasy, Science-Fiction, Krimi, Thriller, Romantik, Historisch, Biografie, Sachbuch, Philosophie, Wissenschaft, Klassiker, Jugendbuch, Kinderbuch, Horror, Humor, Reise, Kochbuch, Selbsthilfe, Business, Kunst, Musik, Sport, Religion, Politik, Psychologie, Medizin, Technik, Natur, Umwelt, Bildung, Sonstiges.`
        },
        {
          role: 'user',
          content: `Titel: ${book.title}${book.author ? `\nAutor: ${book.author}` : ''}`
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content || '[]';
    
    try {
      const tags = JSON.parse(response);
      return NextResponse.json({ tags: Array.isArray(tags) ? tags : [] });
    } catch {
      return NextResponse.json({ tags: [] });
    }
  } catch (error) {
    console.error('Auto-tag error:', error);
    return NextResponse.json({ tags: [] });
  }
}
