import { NextRequest, NextResponse } from 'next/server';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  content?: string;
  pubDate?: string;
}

// Parse RSS feed XML
function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Simple regex-based parsing for RSS feeds
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi);
  
  if (itemMatches) {
    for (const item of itemMatches) {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const linkMatch = item.match(/<link>(.*?)<\/link>/i);
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i);
      const contentMatch = item.match(/<content:encoded><!\[CDATA\[(.*?)\]\]><\/content:encoded>|<content>(.*?)<\/content>/i);
      const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/i);
      
      items.push({
        title: titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : 'Ohne Titel',
        link: linkMatch ? linkMatch[1].trim() : '',
        description: descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '',
        content: contentMatch ? (contentMatch[1] || contentMatch[2] || '').trim() : undefined,
        pubDate: dateMatch ? dateMatch[1].trim() : undefined,
      });
    }
  }
  
  // Also try Atom format
  const entryMatches = xml.match(/<entry>([\s\S]*?)<\/entry>/gi);
  if (entryMatches) {
    for (const entry of entryMatches) {
      const titleMatch = entry.match(/<title>(.*?)<\/title>/i);
      const linkMatch = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i);
      const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/i);
      const contentMatch = entry.match(/<content[^>]*>(.*?)<\/content>/i);
      const dateMatch = entry.match(/<published>(.*?)<\/published>/i);
      
      items.push({
        title: titleMatch ? titleMatch[1].trim() : 'Ohne Titel',
        link: linkMatch ? linkMatch[1].trim() : '',
        description: summaryMatch ? summaryMatch[1].trim() : '',
        content: contentMatch ? contentMatch[1].trim() : undefined,
        pubDate: dateMatch ? dateMatch[1].trim() : undefined,
      });
    }
  }
  
  return items;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, feedId } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Fetch the RSS feed
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; eBookReader/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch RSS feed' }, { status: response.status });
    }
    
    const xml = await response.text();
    const articles = parseRSS(xml);
    
    return NextResponse.json({
      articles: articles.map(article => ({
        ...article,
        feedId,
      })),
    });
    
  } catch (error) {
    console.error('RSS fetch error:', error);
    return NextResponse.json({ error: 'Failed to parse RSS feed' }, { status: 500 });
  }
}
