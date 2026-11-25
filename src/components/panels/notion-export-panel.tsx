'use client';

import { useState } from 'react';
import {
  FileText,
  Highlighter,
  Target,
  Download,
  Edit3,
  RefreshCw,
  Filter,
  Layers,
  FileText as FileTextIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const NotionExportPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { notes, highlights, books } = useBookStore();
  const [target, setTarget] = useState<'notion' | 'obsidian' | 'markdown'>('markdown');
  const [exporting, setExporting] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string>('all');

  const handleExport = async () => {
    setExporting(true);
    
    const filteredNotes = selectedBook === 'all' ? notes : notes.filter(n => n.bookId === selectedBook);
    const filteredHighlights = selectedBook === 'all' ? highlights : highlights.filter(h => h.bookId === selectedBook);

    // Generate markdown content
    let markdown = `# eBook Reader Export\n\n`;
    markdown += `**Exportiert am:** ${new Date().toLocaleDateString('de-DE')}\n\n`;
    
    markdown += `## Notizen\n\n`;
    filteredNotes.forEach(note => {
      const book = books.find(b => b.id === note.bookId);
      markdown += `### ${note.title}\n`;
      if (book) markdown += `*Buch: ${book.title}*\n\n`;
      markdown += `${note.content}\n\n---\n\n`;
    });

    markdown += `## Markierungen\n\n`;
    filteredHighlights.forEach(h => {
      const book = books.find(b => b.id === h.bookId);
      markdown += `> "${h.text}"\n`;
      if (book) markdown += `— ${book.title}\n`;
      if (h.note) markdown += `*Notiz: ${h.note}*\n`;
      markdown += `\n`;
    });

    // Download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebook-export-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
    toast.info('Export simuliert – Notion-API ist eine geplante Funktion.');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Notizen exportieren
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Der Notion-Export ist eine geplante Funktion. Es existiert noch keine Notion-API-Anbindung." />
        <div className="mt-6 space-y-6">
          {/* Target Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'notion', label: 'Notion', icon: <Layers className="w-5 h-5" /> },
              { id: 'obsidian', label: 'Obsidian', icon: <FileText className="w-5 h-5" /> },
              { id: 'markdown', label: 'Markdown', icon: <FileTextIcon className="w-5 h-5" /> },
            ].map((t) => (
              <Card 
                key={t.id}
                className={`cursor-pointer transition-all ${target === t.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setTarget(t.id as typeof target)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">{t.icon}</div>
                  <h4 className="font-medium text-sm">{t.label}</h4>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Book Filter */}
          <div className="space-y-2">
            <Label>Buch auswählen</Label>
            <select 
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full p-2 border rounded-lg bg-background"
            >
              <option value="all">Alle Bücher</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Edit3 className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{selectedBook === 'all' ? notes.length : notes.filter(n => n.bookId === selectedBook).length}</p>
                <p className="text-xs text-muted-foreground">Notizen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Highlighter className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold">{selectedBook === 'all' ? highlights.length : highlights.filter(h => h.bookId === selectedBook).length}</p>
                <p className="text-xs text-muted-foreground">Markierungen</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleExport} disabled={exporting} className="w-full">
            {exporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exportieren
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
