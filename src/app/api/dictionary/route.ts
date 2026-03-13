import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    
    if (!word) {
      return NextResponse.json({ definition: 'Kein Wort angegeben.' });
    }

    const zai = await ZAI.create();
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Du bist ein Wörterbuch-Assistent. Gib eine kurze, präzise Definition des angefragten Wortes auf Deutsch. Falls das Wort mehrere Bedeutungen hat, liste die wichtigsten auf. Halte die Antwort kurz (maximal 2-3 Sätze).'
        },
        {
          role: 'user',
          content: `Was bedeutet das Wort "${word}"?`
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const definition = completion.choices[0]?.message?.content || 'Keine Definition gefunden.';
    
    return NextResponse.json({ definition });
  } catch (error) {
    console.error('Dictionary error:', error);
    return NextResponse.json({ 
      definition: 'Definition konnte nicht abgerufen werden.' 
    });
  }
}
