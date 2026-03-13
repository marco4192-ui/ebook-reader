import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chapterContent, chapterTitle } = await request.json();

    if (!chapterContent) {
      return NextResponse.json({ error: 'Kein Inhalt angegeben' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Du bist ein Quiz-Generator für Buchkapitel. Erstelle 5 Multiple-Choice-Verständnisfragen.
Antworte als JSON-Array mit Objekten:
{
  "id": "unique-id",
  "question": "Die Frage",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Erklärung warum das richtig ist"
}`,
        },
        {
          role: 'user',
          content: `Erstelle ein Verständnisquiz für folgendes Kapitel${chapterTitle ? ` "${chapterTitle}"` : ''}:\n\n${chapterContent.substring(0, 3000)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    
    // Parse JSON from response
    let questions;
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      questions = [];
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: 'Fehler beim Generieren des Quiz' }, { status: 500 });
  }
}
