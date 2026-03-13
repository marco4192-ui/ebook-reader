import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { bookContent, question, bookTitle, author } = await request.json();
    
    if (!question) {
      return NextResponse.json({ response: 'Keine Frage gestellt.' });
    }

    const zai = await ZAI.create();
    
    const systemPrompt = `Du bist ein hilfreicher Leseassistent, der Fragen zu Büchern beantwortet. 
Du sprichst Deutsch und gibst detaillierte, aber prägnante Antworten.
${bookTitle ? `Das Buch heißt "${bookTitle}"${author ? ` von ${author}` : ''}.` : ''}`;

    const userPrompt = bookContent 
      ? `Hier ist ein Auszug aus dem Buch:\n\n${bookContent.substring(0, 4000)}\n\nFrage: ${question}`
      : question;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ 
      response: 'Fehler beim Verarbeiten der Anfrage. Bitte versuchen Sie es später erneut.' 
    });
  }
}
