import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const term = searchParams.get('term');
  const lang = searchParams.get('lang') || 'de';

  if (!term) {
    return NextResponse.json({ error: 'Term is required' }, { status: 400 });
  }

  try {
    const zai = await ZAI.create();

    // Use AI to get Wikipedia-like information about the term
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Du bist ein hilfreicher Assistent, der kurze, prägnante Erklärungen zu Begriffen liefert.
Antworte in ${lang === 'de' ? 'Deutsch' : 'Englisch'}.
Formatiere die Antwort als JSON mit folgenden Feldern:
- title: Der Begriff
- summary: Eine kurze Zusammenfassung (2-3 Sätze)
- details: Weitere Details wenn relevant (optional)
- relatedTerms: Verwandte Begriffe (optional, als Array)
- source: "Wikipedia-ähnliche KI-Antwort"

Halte die Antworten bildungsorientiert und sachlich.`
        },
        {
          role: 'user',
          content: `Erkläre den Begriff "${term}" kurz und prägnant.`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Try to parse as JSON, if not create a structured response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        title: term,
        summary: responseText,
        source: 'KI-Antwort'
      };
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Wikipedia lookup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Nachschlagen des Begriffs',
      data: {
        title: term,
        summary: 'Leider konnte keine Information gefunden werden.',
        source: 'Fehler'
      }
    }, { status: 500 });
  }
}
