import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, lang = 'de-DE' } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    try {
      const zai = await ZAI.create();

      // Use AI to generate pronunciation guide
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Du bist ein Aussprache-Experte. Gib eine detaillierte Aussprache-Anleitung für den gegebenen Text.
Formatiere die Antwort als JSON mit:
- original: Der Originaltext
- ipa: IPA-Lautschrift (International Phonetic Alphabet)
- phonetic: Phonetische Umschrift (für deutsche Sprecher)
- syllables: Silben-Trennung
- stress: Betonte Silbe (mit Akzent markiert)
- tips: Tipps zur Aussprache (optional)
- difficulty: Schwierigkeitsgrad (1-5, wobei 1 sehr einfach ist)`
          },
          {
            role: 'user',
            content: `Wie spricht man "${text}" aus? (${lang})`
          }
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      const responseText = completion.choices[0]?.message?.content || '';
      
      let pronunciation;
      try {
        pronunciation = JSON.parse(responseText);
      } catch {
        pronunciation = {
          original: text,
          phonetic: responseText,
          difficulty: 2
        };
      }

      return NextResponse.json({
        success: true,
        pronunciation
      });
    } catch (aiError) {
      // Fallback: return basic pronunciation info
      return NextResponse.json({
        success: true,
        pronunciation: {
          original: text,
          phonetic: text.toLowerCase(),
          syllables: text.split(/(?=[A-ZÄÖÜ])/).join('-').toLowerCase(),
          tips: 'Klicken Sie auf das Lautsprecher-Symbol, um die Aussprache zu hören.',
          difficulty: 2
        }
      });
    }
  } catch (error: any) {
    console.error('Pronunciation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Fehler bei der Aussprache-Generierung'
    }, { status: 500 });
  }
}

// GET endpoint for quick lookups
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'de-DE';

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  // Return basic pronunciation data
  return NextResponse.json({
    success: true,
    pronunciation: {
      original: text,
      phonetic: text.toLowerCase(),
      syllables: text.split(/(?=[A-ZÄÖÜa-zäöü])/).filter(s => s.length > 0).slice(0, 4).join('-'),
      lang
    }
  });
}
