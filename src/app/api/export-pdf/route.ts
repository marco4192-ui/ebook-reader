import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

interface Highlight {
  id: string;
  bookId: string;
  text: string;
  color: string;
  note?: string;
  location: string;
  createdAt: number;
}

interface Book {
  id: string;
  title: string;
  author?: string;
}

interface Note {
  id: string;
  bookId: string;
  title: string;
  content: string;
  createdAt: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, bookTitle, bookAuthor } = body;

    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;

    const checkPageBreak = () => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
    };

    const addTitle = (title: string) => {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, yPosition);
      yPosition += lineHeight * 2;
    };

    const addSubtitle = (subtitle: string) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, margin, yPosition);
      yPosition += lineHeight * 1.5;
      doc.setTextColor(0, 0, 0);
    };

    const addText = (text: string, maxWidth: number = 170) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        checkPageBreak();
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    };

    const addDivider = () => {
      yPosition += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, 190, yPosition);
      yPosition += 10;
    };

    switch (type) {
      case 'highlights': {
        addTitle('Lesezeichen & Markierungen');
        if (bookTitle) {
          addSubtitle(`Buch: ${bookTitle}${bookAuthor ? ` von ${bookAuthor}` : ''}`);
        }
        addSubtitle(`Exportiert am: ${new Date().toLocaleDateString('de-DE')}`);
        addDivider();

        const highlights = data as (Highlight & { bookTitle?: string })[];
        highlights.forEach((highlight, index) => {
          checkPageBreak();
          
          // Color indicator
          const colors: Record<string, [number, number, number]> = {
            yellow: [255, 235, 59],
            green: [76, 175, 80],
            blue: [33, 150, 243],
            pink: [233, 30, 99],
            purple: [156, 39, 176],
          };
          const color = colors[highlight.color] || colors.yellow;
          doc.setFillColor(...color);
          doc.rect(margin, yPosition - 3, 3, 6, 'F');
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`Markierung ${index + 1}`, margin + 6, yPosition);
          yPosition += lineHeight;
          
          if (highlight.bookTitle) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(highlight.bookTitle, margin + 6, yPosition);
            doc.setTextColor(0, 0, 0);
            yPosition += lineHeight;
          }
          
          addText(`"${highlight.text}"`);
          
          if (highlight.note) {
            doc.setFont('helvetica', 'italic');
            addText(`Notiz: ${highlight.note}`);
          }
          
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(new Date(highlight.createdAt).toLocaleDateString('de-DE'), margin, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += lineHeight * 1.5;
        });
        break;
      }

      case 'journal': {
        addTitle('Lese-Journal');
        addSubtitle(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`);
        addDivider();

        const journalData = data as {
          books: Book[];
          highlights: Highlight[];
          notes: Note[];
          stats: {
            totalBooks: number;
            totalPages: number;
            totalHighlights: number;
            totalNotes: number;
            readingStreak: number;
          };
        };

        // Statistics
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Lesestatistiken', margin, yPosition);
        yPosition += lineHeight * 1.5;

        const stats = [
          `Bücher insgesamt: ${journalData.stats.totalBooks}`,
          `Gelesene Seiten: ${journalData.stats.totalPages}`,
          `Markierungen: ${journalData.stats.totalHighlights}`,
          `Notizen: ${journalData.stats.totalNotes}`,
          `Aktuelle Lesestreak: ${journalData.stats.readingStreak} Tage`,
        ];

        stats.forEach((stat) => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${stat}`, margin + 5, yPosition);
          yPosition += lineHeight;
        });

        addDivider();

        // Recent Books
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Kürzlich gelesene Bücher', margin, yPosition);
        yPosition += lineHeight * 1.5;

        journalData.books.slice(0, 10).forEach((book) => {
          checkPageBreak();
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${book.title}${book.author ? ` (${book.author})` : ''}`, margin + 5, yPosition);
          yPosition += lineHeight;
        });

        addDivider();

        // Highlights Summary
        if (journalData.highlights.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Wichtige Zitate', margin, yPosition);
          yPosition += lineHeight * 1.5;

          journalData.highlights.slice(0, 15).forEach((highlight, index) => {
            checkPageBreak();
            addText(`${index + 1}. "${highlight.text}"`);
            yPosition += 3;
          });
        }
        break;
      }

      case 'quote-card': {
        addTitle('Lese-Postkarte');
        addDivider();
        
        const quote = data as { text: string; author?: string; bookTitle?: string };
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'italic');
        const lines = doc.splitTextToSize(`"${quote.text}"`, 160);
        lines.forEach((line: string) => {
          checkPageBreak();
          doc.text(line, margin + 10, yPosition);
          yPosition += lineHeight * 1.2;
        });
        
        yPosition += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        if (quote.author || quote.bookTitle) {
          doc.text(`— ${quote.author || ''}${quote.bookTitle ? `, "${quote.bookTitle}"` : ''}`, margin + 10, yPosition);
        }
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'PDF export failed' }, { status: 500 });
  }
}
