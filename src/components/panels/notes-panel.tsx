'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trash2, Plus, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';

export const NotesPanel = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { getNotes, addNote, updateNote, removeNote } = useBookStore();
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const bookNotes = getNotes(book.id);

  const handleAddNote = () => {
    if (newNote.title.trim()) {
      addNote({ bookId: book.id, title: newNote.title, content: newNote.content, linkedNoteIds: [], linkedBookIds: [], tags: [] });
      setNewNote({ title: '', content: '' });
      toast.success('Notiz erstellt!');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Edit3 className="w-5 h-5" />Notizen ({bookNotes.length})</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <Card className="mb-4">
            <CardContent className="p-3 space-y-2">
              <Input placeholder="Titel..." value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
              <Textarea placeholder="Notiz (Markdown)..." value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} className="min-h-[80px]" />
              <Button size="sm" className="w-full" onClick={handleAddNote}><Plus className="w-4 h-4 mr-1" />Notiz hinzufügen</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {bookNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{note.title}</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNote(note.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                  <div className="text-xs text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{note.content || 'Kein Inhalt'}</ReactMarkdown>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleDateString('de-DE')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
