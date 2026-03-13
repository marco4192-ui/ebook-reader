import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface SearchResult {
  bookId: string;
  bookTitle: string;
  author?: string;
  type: 'character' | 'location' | 'quote' | 'text' | 'cross_reference';
  text: string;
  context?: string;
  location?: string;
  page?: number;
  relevance: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      books, 
      searchType = 'all', // 'all' | 'characters' | 'locations' | 'quotes' | 'cross_references'
      includeContext = true 
    } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results: SearchResult[] = [];

    // Search through provided book contents
    if (books && Array.isArray(books)) {
      for (const book of books) {
        const { id, title, author, content } = book;
        
        if (!content) continue;

        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();

        // Text search - find all occurrences
        if (searchType === 'all' || searchType === 'text') {
          let index = 0;
          while ((index = lowerContent.indexOf(lowerQuery, index)) !== -1) {
            // Get context around the match
            const contextStart = Math.max(0, index - 100);
            const contextEnd = Math.min(content.length, index + query.length + 100);
            const context = content.substring(contextStart, contextEnd);

            results.push({
              bookId: id,
              bookTitle: title,
              author,
              type: 'text',
              text: query,
              context: includeContext ? `...${context}...` : undefined,
              location: `Position ${index}`,
              relevance: 1
            });

            index += query.length;
            
            // Limit results per book
            if (results.filter(r => r.bookId === id).length >= 10) break;
          }
        }

        // Character search - find names that match
        if (searchType === 'all' || searchType === 'characters') {
          const namePattern = new RegExp(`\\b[A-ZÄÖÜ][a-zäöüß]+\\b`, 'g');
          const names = content.match(namePattern) || [];
          const uniqueNames = [...new Set(names)];

          for (const name of uniqueNames) {
            if (name.toLowerCase().includes(lowerQuery)) {
              // Find context where this name appears
              const nameIndex = lowerContent.indexOf(name.toLowerCase());
              if (nameIndex !== -1) {
                const contextStart = Math.max(0, nameIndex - 80);
                const contextEnd = Math.min(content.length, nameIndex + name.length + 80);
                
                results.push({
                  bookId: id,
                  bookTitle: title,
                  author,
                  type: 'character',
                  text: name,
                  context: includeContext ? `...${content.substring(contextStart, contextEnd)}...` : undefined,
                  relevance: 2
                });
              }
            }
          }
        }

        // Quote search - find sentences that might be quotes
        if (searchType === 'all' || searchType === 'quotes') {
          // Look for quotation marks and filter by query
          const quotePattern = /["""„"]([^""""]+)[""""]|»([^«]+)«|«([^»]+)»/g;
          let match;
          while ((match = quotePattern.exec(content)) !== null) {
            const quoteText = match[1] || match[2] || match[3];
            if (quoteText && quoteText.toLowerCase().includes(lowerQuery)) {
              results.push({
                bookId: id,
                bookTitle: title,
                author,
                type: 'quote',
                text: quoteText,
                context: includeContext ? quoteText : undefined,
                relevance: 3
              });
            }
          }
        }

        // Location search - find potential place names
        if (searchType === 'all' || searchType === 'locations') {
          // Common location patterns in German
          const locationPatterns = [
            /in\s+([A-ZÄÖÜ][a-zäöüß]+)/g,
            /nach\s+([A-ZÄÖÜ][a-zäöüß]+)/g,
            /von\s+([A-ZÄÖÜ][a-zäöüß]+)/g,
            /in\s+der\s+([A-ZÄÖÜ][a-zäöüß]+)/g,
          ];

          for (const pattern of locationPatterns) {
            let locMatch;
            while ((locMatch = pattern.exec(content)) !== null) {
              const location = locMatch[1];
              if (location && location.toLowerCase().includes(lowerQuery)) {
                const locIndex = locMatch.index;
                const contextStart = Math.max(0, locIndex - 50);
                const contextEnd = Math.min(content.length, locIndex + location.length + 50);

                results.push({
                  bookId: id,
                  bookTitle: title,
                  author,
                  type: 'location',
                  text: location,
                  context: includeContext ? `...${content.substring(contextStart, contextEnd)}...` : undefined,
                  relevance: 1.5
                });
              }
            }
          }
        }
      }
    }

    // Sort by relevance and limit results
    results.sort((a, b) => b.relevance - a.relevance);
    const limitedResults = results.slice(0, 50);

    // Use AI to enhance cross-reference detection if requested
    if (searchType === 'cross_references' && books && books.length > 1) {
      try {
        const zai = await ZAI.create();
        
        const bookSummaries = books.map((b: any) => ({
          id: b.id,
          title: b.title,
          themes: b.content?.substring(0, 500) || ''
        }));

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `Du analysierst Bücher auf Querverbindungen. Suche nach gemeinsamen Themen, Motiven oder Referenzen.
Antworte als JSON-Array mit Objekten: { sourceBookId, targetBookId, connection, description }`
            },
            {
              role: 'user',
              content: `Finde Querverbindungen zwischen diesen Büchern zum Thema "${query}":
${JSON.stringify(bookSummaries)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        });

        const aiResponse = completion.choices[0]?.message?.content || '';
        
        try {
          const crossRefs = JSON.parse(aiResponse);
          if (Array.isArray(crossRefs)) {
            for (const ref of crossRefs) {
              results.push({
                bookId: ref.sourceBookId,
                bookTitle: books.find((b: any) => b.id === ref.sourceBookId)?.title || '',
                type: 'cross_reference',
                text: ref.connection,
                context: ref.description,
                relevance: 2.5
              });
            }
          }
        } catch {
          // AI response wasn't valid JSON, skip cross-references
        }
      } catch {
        // AI failed, continue without enhanced cross-references
      }
    }

    return NextResponse.json({
      success: true,
      results: limitedResults,
      total: results.length,
      query
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Fehler bei der Suche',
      results: []
    }, { status: 500 });
  }
}
