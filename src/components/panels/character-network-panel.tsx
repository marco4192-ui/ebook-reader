'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useBookStore, type Character } from '@/lib/book-store';
import { toast } from 'sonner';

export const relationshipColors: Record<string, string> = {
  family: 'stroke-rose-500',
  friend: 'stroke-green-500',
  enemy: 'stroke-red-500',
  lover: 'stroke-pink-500',
  colleague: 'stroke-blue-500',
  other: 'stroke-gray-500',
};

export const relationshipLabels: Record<string, string> = {
  family: 'Familie',
  friend: 'Freund',
  enemy: 'Feind',
  lover: 'Liebe',
  colleague: 'Kollege',
  other: 'Sonstige',
};

export const CharacterNetworkPanel = ({ bookId, open, onOpenChange }: { bookId: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { characters, addCharacter, updateCharacter, removeCharacter, addCharacterRelationship, getCharacters } = useBookStore();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterDescription, setNewCharacterDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const bookCharacters = getCharacters(bookId);

  const handleAddCharacter = () => {
    if (newCharacterName.trim()) {
      addCharacter({
        bookId,
        name: newCharacterName.trim(),
        description: newCharacterDescription.trim() || undefined,
        relationships: [],
      });
      setNewCharacterName('');
      setNewCharacterDescription('');
      setShowAddForm(false);
      toast.success('Charakter hinzugefügt!');
    }
  };

  // Calculate positions for visual graph
  const getPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total;
    const radius = 120;
    const centerX = 200;
    const centerY = 200;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Charakter-Netzwerk ({bookCharacters.length} Charaktere)
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100%-80px)] mt-4 gap-4">
          {/* Character List */}
          <div className="w-64 flex flex-col">
            <Button onClick={() => setShowAddForm(true)} className="mb-3">
              <UserPlus className="w-4 h-4 mr-2" />
              Charakter hinzufügen
            </Button>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {bookCharacters.map((char) => (
                  <Card
                    key={char.id}
                    className={`cursor-pointer transition-all ${selectedCharacter?.id === char.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedCharacter(char)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{char.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCharacter(char.id);
                            if (selectedCharacter?.id === char.id) setSelectedCharacter(null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      {char.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{char.description}</p>
                      )}
                      {char.relationships.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {char.relationships.slice(0, 3).map((rel, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {relationshipLabels[rel.type]}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Visual Graph */}
          <div className="flex-1 relative bg-muted/30 rounded-lg overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              {/* Draw relationships */}
              {bookCharacters.map((char, i) => {
                const pos1 = getPosition(i, bookCharacters.length);
                return char.relationships.map((rel) => {
                  const targetIndex = bookCharacters.findIndex((c) => c.id === rel.characterId);
                  if (targetIndex === -1) return null;
                  const pos2 = getPosition(targetIndex, bookCharacters.length);
                  return (
                    <line
                      key={`${char.id}-${rel.characterId}`}
                      x1={pos1.x}
                      y1={pos1.y}
                      x2={pos2.x}
                      y2={pos2.y}
                      className={`${relationshipColors[rel.type]} stroke-2`}
                      strokeWidth="2"
                      strokeDasharray={rel.type === 'enemy' ? '5,5' : undefined}
                    />
                  );
                });
              })}
              {/* Draw character nodes */}
              {bookCharacters.map((char, i) => {
                const pos = getPosition(i, bookCharacters.length);
                return (
                  <g
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="25"
                      fill={selectedCharacter?.id === char.id ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill={selectedCharacter?.id === char.id ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
                      fontSize="10"
                      fontWeight="500"
                    >
                      {char.name.substring(0, 8)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {bookCharacters.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Charaktere</p>
                  <p className="text-sm">Fügen Sie Charaktere hinzu, um das Netzwerk zu sehen</p>
                </div>
              </div>
            )}
          </div>

          {/* Character Details */}
          {selectedCharacter && (
            <div className="w-72 border-l pl-4">
              <h3 className="font-semibold mb-3">{selectedCharacter.name}</h3>
              {selectedCharacter.description && (
                <p className="text-sm text-muted-foreground mb-4">{selectedCharacter.description}</p>
              )}

              <Label className="text-sm font-medium mb-2 block">Beziehungen</Label>
              <ScrollArea className="h-40 mb-4">
                <div className="space-y-2">
                  {selectedCharacter.relationships.map((rel, i) => {
                    const targetChar = bookCharacters.find((c) => c.id === rel.characterId);
                    if (!targetChar) return null;
                    return (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{relationshipLabels[rel.type]}</Badge>
                          <span className="text-sm">{targetChar.name}</span>
                        </div>
                      </div>
                    );
                  })}
                  {selectedCharacter.relationships.length === 0 && (
                    <p className="text-xs text-muted-foreground">Keine Beziehungen</p>
                  )}
                </div>
              </ScrollArea>

              <Label className="text-sm font-medium mb-2 block">Beziehung hinzufügen</Label>
              <div className="space-y-2">
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  onChange={(e) => {
                    const targetId = e.target.value;
                    if (targetId && targetId !== selectedCharacter.id) {
                      // Default to 'friend' type
                      addCharacterRelationship(selectedCharacter.id, targetId, 'friend');
                      toast.success('Beziehung hinzugefügt!');
                    }
                  }}
                >
                  <option value="">Charakter auswählen...</option>
                  {bookCharacters
                    .filter((c) => c.id !== selectedCharacter.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Add Character Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="w-80">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold">Neuer Charakter</h3>
                    <Input
                      placeholder="Name..."
                      value={newCharacterName}
                      onChange={(e) => setNewCharacterName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Beschreibung (optional)..."
                      value={newCharacterDescription}
                      onChange={(e) => setNewCharacterDescription(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                        Abbrechen
                      </Button>
                      <Button className="flex-1" onClick={handleAddCharacter}>
                        Hinzufügen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};
