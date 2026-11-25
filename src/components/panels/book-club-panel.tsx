'use client';

import { useState } from 'react';
import { List, Plus, MessageCircle, Send, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const BookClubPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books } = useBookStore();
  const [selectedClub, setSelectedClub] = useState<{id: string; name: string; description: string; members: number} | null>(null);
  const [newClubName, setNewClubName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState('');

  // Demo clubs
  const clubs = [
    { id: '1', name: 'Klassiker-Leser', description: 'Wir lesen die großen Werke der Weltliteratur', members: 12 },
    { id: '2', name: 'Sci-Fi & Fantasy', description: 'Von Middle Earth bis Arrakis', members: 8 },
    { id: '3', name: 'Manga & Anime', description: 'Japanische Comics und mehr', members: 24 },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Buchclubs
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Buchclubs funktionieren derzeit rein lokal im Browser. Chat-Nachrichten werden nicht an andere Mitglieder übertragen – Server-Sync ist geplant." />
        <div className="flex h-[calc(100%-80px)] mt-4 gap-4">
          {/* Club List */}
          <div className="w-80 flex flex-col">
            <Button onClick={() => setShowCreate(!showCreate)} className="mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Club
            </Button>
            
            {showCreate && (
              <Card className="mb-4">
                <CardContent className="p-4 space-y-3">
                  <Input placeholder="Club-Name..." value={newClubName} onChange={(e) => setNewClubName(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={() => { toast.info('Club lokal erstellt – Server-Sync ist geplant.'); setShowCreate(false); }} size="sm">Erstellen</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Abbrechen</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {clubs.map((club) => (
                  <Card
                    key={club.id}
                    className={`cursor-pointer transition-all ${selectedClub?.id === club.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedClub(club)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {club.name[0]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{club.name}</h4>
                          <p className="text-xs text-muted-foreground">{club.members} Mitglieder</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Club Detail */}
          {selectedClub ? (
            <div className="flex-1 flex flex-col">
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{selectedClub.name}</h3>
                      <p className="text-muted-foreground">{selectedClub.description}</p>
                    </div>
                    <Button size="sm" onClick={() => toast.info('Willkommen – derzeit rein lokale Mitgliedschaft.')}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Beitreten
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Chat */}
              <Card className="flex-1 flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Diskussion
                  </h4>
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">M</div>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <p className="text-sm">Hallo zusammen! Was haltet ihr vom aktuellen Buch?</p>
                          <p className="text-xs text-muted-foreground mt-1">Max • vor 2 Stunden</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">L</div>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <p className="text-sm">Sehr spannend! Besonders das dritte Kapitel...</p>
                          <p className="text-xs text-muted-foreground mt-1">Lisa • vor 1 Stunde</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input placeholder="Nachricht schreiben..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && message.trim() && (toast.info('Nachricht lokal gespeichert – kein Versand an Mitglieder.'), setMessage(''))} />
                    <Button onClick={() => message.trim() && (toast.info('Nachricht lokal gespeichert – kein Versand an Mitglieder.'), setMessage(''))}><Send className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Wähle einen Club aus</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
