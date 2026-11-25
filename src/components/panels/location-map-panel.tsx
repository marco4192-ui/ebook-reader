'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, Plus, MapIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore, type BookLocation } from '@/lib/book-store';
import { toast } from 'sonner';

export const LocationMapPanel = ({ bookId, open, onOpenChange }: { bookId: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { locations, addLocation, removeLocation, getLocations } = useBookStore();
  const [selectedLocation, setSelectedLocation] = useState<BookLocation | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const bookLocations = getLocations(bookId);

  const handleAddLocation = () => {
    if (newLocationName.trim()) {
      addLocation({
        bookId,
        name: newLocationName.trim(),
      });
      setNewLocationName('');
      setShowAddForm(false);
      toast.success('Ort hinzugefügt!');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-primary" />
            Ortskarte ({bookLocations.length} Orte)
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100%-80px)] mt-4 gap-4">
          {/* Location List */}
          <div className="w-72 flex flex-col">
            <Button onClick={() => setShowAddForm(true)} className="mb-3">
              <Plus className="w-4 h-4 mr-2" />
              Ort hinzufügen
            </Button>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {bookLocations.map((loc) => (
                  <Card
                    key={loc.id}
                    className={`cursor-pointer transition-all ${selectedLocation?.id === loc.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedLocation(loc)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{loc.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLocation(loc.id);
                            if (selectedLocation?.id === loc.id) setSelectedLocation(null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      {loc.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{loc.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {loc.mentions} Erwähnungen
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Map Placeholder */}
          <div className="flex-1 relative bg-muted/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {bookLocations.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Placeholder map with location markers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20" />
                  {bookLocations.map((loc, i) => {
                    // Distribute locations across the map area
                    const cols = Math.ceil(Math.sqrt(bookLocations.length));
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    const x = 20 + (col * (80 / cols)) + Math.random() * 10;
                    const y = 20 + (row * (60 / Math.ceil(bookLocations.length / cols))) + Math.random() * 10;

                    return (
                      <div
                        key={loc.id}
                        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all ${selectedLocation?.id === loc.id ? 'scale-125' : ''}`}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={() => setSelectedLocation(loc)}
                      >
                        <div className={`p-2 rounded-full ${selectedLocation?.id === loc.id ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] text-center mt-1 font-medium bg-background/80 px-1 rounded whitespace-nowrap">
                          {loc.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Orte</p>
                  <p className="text-sm">Fügen Sie Orte hinzu, die im Buch erwähnt werden</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          {selectedLocation && (
            <div className="w-72 border-l pl-4">
              <h3 className="font-semibold mb-3">{selectedLocation.name}</h3>
              {selectedLocation.description && (
                <p className="text-sm text-muted-foreground mb-4">{selectedLocation.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedLocation.mentions} Erwähnungen</Badge>
                </div>
                {selectedLocation.firstMention && (
                  <p className="text-xs text-muted-foreground">
                    Erste Erwähnung: {selectedLocation.firstMention}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Location Form */}
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
                    <h3 className="font-semibold">Neuer Ort</h3>
                    <Input
                      placeholder="Name des Ortes..."
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                        Abbrechen
                      </Button>
                      <Button className="flex-1" onClick={handleAddLocation}>
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
