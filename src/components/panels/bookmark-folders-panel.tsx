'use client';

import { useState } from 'react';
import { Bookmark, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const BookmarkFoldersPanel = ({ bookId, open, onOpenChange }: { bookId?: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { bookmarks, bookmarkFolders, addBookmarkFolder, removeBookmarkFolder, updateBookmarkFolder, moveBookmarkToFolder } = useBookStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#f59e0b');

  const folderColors = [
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Blau', value: '#3b82f6' },
    { name: 'Grün', value: '#22c55e' },
    { name: 'Rot', value: '#ef4444' },
    { name: 'Lila', value: '#a855f7' },
    { name: 'Cyan', value: '#06b6d4' },
  ];

  const filteredBookmarks = bookId ? bookmarks.filter((b) => b.bookId === bookId) : bookmarks;

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addBookmarkFolder({ name: newFolderName, color: newFolderColor });
    setNewFolderName('');
    toast.success('Ordner erstellt!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Lesezeichen-Ordner
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Create New Folder */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neuen Ordner erstellen</h4>
              <Input
                placeholder="Ordnername..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="space-y-2">
                <Label className="text-xs">Farbe</Label>
                <div className="flex gap-2">
                  {folderColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-6 h-6 rounded-full border-2 ${newFolderColor === color.value ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewFolderColor(color.value)}
                    />
                  ))}
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={handleAddFolder}>
                <Plus className="w-4 h-4 mr-1" /> Erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Folders */}
          <div className="space-y-3">
            {bookmarkFolders.map((folder) => {
              const folderBookmarks = filteredBookmarks.filter((b) => folder.bookmarkIds.includes(b.id));
              return (
                <Card key={folder.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className="font-medium text-sm">{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {folderBookmarks.length}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeBookmarkFolder(folder.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {folderBookmarks.slice(0, 3).map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="text-xs p-2 rounded bg-muted/50 flex items-center justify-between"
                        >
                          <span className="truncate">{bookmark.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => moveBookmarkToFolder(bookmark.id, null)}
                          >
                            <X className="w-2 h-2" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Unorganized Bookmarks */}
          <Card className="mt-4">
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-2">Nicht zugeordnet</h4>
              <div className="space-y-1">
                {filteredBookmarks
                  .filter((b) => !bookmarkFolders.some((f) => f.bookmarkIds.includes(b.id)))
                  .slice(0, 5)
                  .map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="text-xs p-2 rounded bg-muted/50 flex items-center justify-between"
                    >
                      <span className="truncate">{bookmark.title}</span>
                      <select
                        className="text-xs border rounded px-1 py-0.5"
                        onChange={(e) => {
                          if (e.target.value) {
                            moveBookmarkToFolder(bookmark.id, e.target.value);
                          }
                        }}
                        value=""
                      >
                        <option value="">Verschieben...</option>
                        {bookmarkFolders.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
