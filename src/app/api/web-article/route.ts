import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ArticleData {
  title: string;
  content: string;
  textContent: string;
  author?: string;
  source?: string;
  publishedDate?: string;
}

// Extract readable content from HTML using AI
async function extractContent(html: string, url: string): Promise<ArticleData> {
  try {
    const zai = await ZAI.create();
    
    // Remove scripts, styles, and other non-content elements
    const cleanHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Use AI to extract the main content
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Du bist ein Experten-Tool zum Extrahieren von Artikeln. Extrahiere den Hauptinhalt aus dem folgenden Text. Gib nur den extrahierten Artikeltext zurück ohne Einleitung. Strukturiere den Text mit Absätzen.'
        },
        {
          role: 'user',
          content: `Extrahiere den Hauptartikelinhalt aus diesem Text von ${url}:\n\n${cleanHtml.substring(0, 8000)}`
        }
      ],
    });
    
    const extractedContent = completion.choices[0]?.message?.content || cleanHtml.substring(0, 5000);
    
    // Extract title from HTML
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Ohne Titel';
    
    // Extract author if available
    const authorMatch = html.match(/<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i) ||
                        html.match(/<meta[^>]*property="article:author"[^>]*content="([^"]*)"[^>]*>/i);
    const author = authorMatch ? authorMatch[1] : undefined;
    
    // Extract source (site name)
    const sourceMatch = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i);
    const source = sourceMatch ? sourceMatch[1] : new URL(url).hostname;
    
    // Extract published date
    const dateMatch = html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i) ||
                      html.match(/<time[^>]*datetime="([^"]*)"[^>]*>/i);
    const publishedDate = dateMatch ? dateMatch[1] : undefined;
    
    return {
      title,
      content: extractedContent,
      textContent: extractedContent,
      author,
      source,
      publishedDate,
    };
    
  } catch (error) {
    console.error('Content extraction error:', error);
    // Fallback: return cleaned HTML
    const cleanText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : 'Ohne Titel',
      content: cleanText.substring(0, 10000),
      textContent: cleanText.substring(0, 10000),
      source: new URL(url).hostname,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; eBookReader/1.0; +https://example.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch webpage' }, { status: response.status });
    }
    
    const html = await response.text();
    const article = await extractContent(html, url);
    
    return NextResponse.json({ article });
    
  } catch (error) {
    console.error('Web article fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
