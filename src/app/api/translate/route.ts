import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const languageNames: Record<string, string> = {
  de: 'Deutsch',
  en: 'Englisch',
  fr: 'Französisch',
  es: 'Spanisch',
  it: 'Italienisch',
  pt: 'Portugiesisch',
  nl: 'Niederländisch',
  ru: 'Russisch',
  zh: 'Chinesisch',
  ja: 'Japanisch',
  ko: 'Koreanisch',
  ar: 'Arabisch',
  pl: 'Polnisch',
  sv: 'Schwedisch',
  fi: 'Finnisch',
};

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage } = await request.json();
    
    if (!text || !targetLanguage) {
      return NextResponse.json({ 
        translatedText: 'Kein Text oder Zielsprache angegeben.' 
      });
    }

    const zai = await ZAI.create();
    
    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    const sourceLangName = sourceLanguage ? (languageNames[sourceLanguage] || sourceLanguage) : 'automatisch erkannt';

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Du bist ein professioneller Übersetzer. Übersetze den gegebenen Text ${sourceLanguage ? `vom ${sourceLangName}` : 'aus der erkannten Sprache'} ins ${targetLangName}. 
Gib nur die Übersetzung zurück, ohne Erklärungen oder zusätzliche Kommentare. 
Behalte den Stil und Ton des Originals bei.
Wenn der Text bereits in der Zielsprache ist, gib ihn unverändert zurück.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translatedText = completion.choices[0]?.message?.content || 'Übersetzung fehlgeschlagen.';
    
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ 
      translatedText: 'Fehler beim Übersetzen. Bitte versuchen Sie es später erneut.' 
    });
  }
}
