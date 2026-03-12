import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { file, format, query } = await request.json();
    
    if (!file || !query) {
      return NextResponse.json({ results: [] });
    }

    const results: { text: string; location: string }[] = [];
    
    // For text-based formats, we can search directly
    if (format === 'txt' || format === 'md') {
      try {
        const base64 = file.split(',')[1];
        const content = atob(base64);
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              text: line.trim().substring(0, 200),
              location: index.toString(),
            });
          }
        });
      } catch {
        // Ignore decoding errors
      }
    }
    
    // Limit results to 20
    const limitedResults = results.slice(0, 20);
    
    return NextResponse.json({ results: limitedResults });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] });
  }
}
