import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface AnalysisResult {
  difficulty: number;
  readabilityScore: number;
  vocabularyComplexity: string;
  estimatedReadingTime: number;
  keyThemes: string[];
  moodAnalysis: {
    overall: string;
    breakdown: { emotion: string; percentage: number }[];
  };
  emotionCurve: { position: number; emotion: string; intensity: number }[];
}

export async function POST(request: NextRequest) {
  try {
    const { text, bookTitle, author } = await request.json();
    
    if (!text) {
      return NextResponse.json({ 
        analysis: null,
        error: 'Kein Text zur Analyse bereitgestellt.' 
      });
    }

    const zai = await ZAI.create();
    
    // Calculate word count and reading time
    const words = text.split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(words / 200); // ~200 words per minute

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Du bist ein Experte für Textanalyse. Analysiere den gegebenen Text und gib ein JSON-Objekt zurück (ohne Markdown-Formatierung, nur das reine JSON).

Das JSON muss genau folgende Struktur haben:
{
  "difficulty": <Zahl 1-10, wobei 1 sehr einfach und 10 sehr schwierig ist>,
  "readabilityScore": <Zahl 0-100, wobei höher besser lesbar ist>,
  "vocabularyComplexity": "<einfach | mittel | schwierig | sehr schwierig>",
  "keyThemes": ["Thema1", "Thema2", "Thema3"],
  "moodAnalysis": {
    "overall": "<Hauptstimmung des Textes>",
    "breakdown": [
      {"emotion": "Emotion1", "percentage": Zahl},
      {"emotion": "Emotion2", "percentage": Zahl}
    ]
  },
  "emotionCurve": [
    {"position": 0, "emotion": "Emotion", "intensity": Zahl},
    {"position": 25, "emotion": "Emotion", "intensity": Zahl},
    {"position": 50, "emotion": "Emotion", "intensity": Zahl},
    {"position": 75, "emotion": "Emotion", "intensity": Zahl},
    {"position": 100, "emotion": "Emotion", "intensity": Zahl}
  ]
}

Analysiere den Text auf:
- Schwierigkeitsgrad basierend auf Satzlänge, Wortschatz, Komplexität
- Lesbarkeit nach gängigen Metriken
- Wortschatz-Komplexität
- Wichtige Themen und Motive
- Emotionale Stimmung und deren Verlauf im Text`
        },
        {
          role: 'user',
          content: `Analysiere folgenden Text:\n\n${text.substring(0, 8000)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    let analysis: AnalysisResult;
    
    try {
      const responseText = completion.choices[0]?.message?.content || '{}';
      // Clean up potential markdown formatting
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsedAnalysis = JSON.parse(cleanedResponse);
      
      analysis = {
        ...parsedAnalysis,
        estimatedReadingTime
      };
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Fallback analysis
      analysis = {
        difficulty: 5,
        readabilityScore: 50,
        vocabularyComplexity: 'mittel',
        estimatedReadingTime,
        keyThemes: ['Analyse nicht verfügbar'],
        moodAnalysis: {
          overall: 'Neutral',
          breakdown: [{ emotion: 'Neutral', percentage: 100 }]
        },
        emotionCurve: [
          { position: 0, emotion: 'Neutral', intensity: 50 },
          { position: 25, emotion: 'Neutral', intensity: 50 },
          { position: 50, emotion: 'Neutral', intensity: 50 },
          { position: 75, emotion: 'Neutral', intensity: 50 },
          { position: 100, emotion: 'Neutral', intensity: 50 }
        ]
      };
    }
    
    return NextResponse.json({ 
      analysis,
      metadata: {
        wordCount: words,
        characterCount: text.length,
        bookTitle,
        author
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      analysis: null,
      error: 'Fehler bei der Analyse. Bitte versuchen Sie es später erneut.' 
    });
  }
}
