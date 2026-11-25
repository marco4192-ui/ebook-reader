'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const TimelinePanel = ({ bookId, open, onOpenChange }: { bookId: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { timelineEvents, addTimelineEvent, removeTimelineEvent, getTimelineEvents } = useBookStore();
  const [newEvent, setNewEvent] = useState({ title: '', description: '', chapter: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const bookEvents = getTimelineEvents(bookId).sort((a, b) => a.order - b.order);

  const handleAddEvent = () => {
    if (newEvent.title.trim()) {
      addTimelineEvent({
        bookId,
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        chapter: newEvent.chapter.trim() || undefined,
        order: bookEvents.length,
      });
      setNewEvent({ title: '', description: '', chapter: '' });
      setShowAddForm(false);
      toast.success('Ereignis hinzugefügt!');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Zeitstrahl ({bookEvents.length} Ereignisse)
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Button onClick={() => setShowAddForm(true)} className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Ereignis hinzufügen
          </Button>

          <ScrollArea className="h-[calc(100vh-280px)]">
            {bookEvents.length > 0 ? (
              <div className="relative pl-8">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary/30" />

                <div className="space-y-4">
                  {bookEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-5 top-4 w-4 h-4 rounded-full bg-primary border-2 border-background" />

                      <Card className="ml-4">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{event.title}</h4>
                                {event.chapter && (
                                  <Badge variant="outline" className="text-xs">
                                    {event.chapter}
                                  </Badge>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeTimelineEvent(event.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Noch keine Ereignisse</p>
                <p className="text-sm text-muted-foreground">Fügen Sie wichtige Ereignisse aus dem Buch hinzu</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Add Event Form */}
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
                    <h3 className="font-semibold">Neues Ereignis</h3>
                    <Input
                      placeholder="Titel..."
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                    <Input
                      placeholder="Kapitel (optional)..."
                      value={newEvent.chapter}
                      onChange={(e) => setNewEvent({ ...newEvent, chapter: e.target.value })}
                    />
                    <Textarea
                      placeholder="Beschreibung (optional)..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                        Abbrechen
                      </Button>
                      <Button className="flex-1" onClick={handleAddEvent}>
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
