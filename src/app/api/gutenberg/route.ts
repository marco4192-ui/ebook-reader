import { NextRequest, NextResponse } from 'next/server';

interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string }[];
  formats: { [key: string]: string };
  subjects: string[];
  languages: string[];
  download_count: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const languages = searchParams.get('languages') || 'de,en';
    
    // Use Gutenberg API
    const baseUrl = 'https://gutendex.com/books';
    const params = new URLSearchParams({
      page: page.toString(),
      languages: languages,
      mime_type: 'text/html',
    });
    
    if (search) {
      params.set('search', search);
    }
    
    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Gutenberg');
    }
    
    const data = await response.json();
    
    // Format the books
    const books = data.results.map((book: GutenbergBook) => ({
      id: book.id,
      title: book.title,
      author: book.authors[0]?.name || 'Unbekannt',
      cover: book.formats['image/jpeg'] || null,
      formats: {
        html: book.formats['text/html'],
        epub: book.formats['application/epub+zip'],
        txt: book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'],
      },
      subjects: book.subjects,
      languages: book.languages,
      popularity: book.download_count,
    }));
    
    return NextResponse.json({
      books,
      count: data.count,
      next: data.next,
      previous: data.previous,
    });
  } catch (error) {
    console.error('Gutenberg API error:', error);
    return NextResponse.json({ 
      books: [], 
      count: 0, 
      error: 'Fehler beim Laden der Bücher' 
    });
  }
}
