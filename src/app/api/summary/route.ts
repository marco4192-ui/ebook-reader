import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ summary: 'Kein Text bereitgestellt.' });
    }

    const zai = await ZAI.create();
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Du bist ein hilfreicher Assistent, der Texte auf Deutsch zusammenfasst. Fasse den folgenden Text kurz und prägnant zusammen (maximal 3-4 Sätze). Strukturiere die Zusammenfassung mit Aufzählungspunkten wenn sinnvoll.'
        },
        {
          role: 'user',
          content: `Bitte fasse folgenden Text zusammen:\n\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content || 'Zusammenfassung konnte nicht generiert werden.';
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json({ 
      summary: 'Fehler beim Generieren der Zusammenfassung. Bitte versuchen Sie es später erneut.' 
    });
  }
}
