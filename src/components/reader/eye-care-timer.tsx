'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBookStore } from '@/lib/book-store';

export const EyeCareTimer = () => {
  const { settings, updateSettings } = useBookStore();
  const [timeRemaining, setTimeRemaining] = useState(settings.eyeCareInterval * 60);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (!settings.eyeCareEnabled) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { setShowReminder(true); return settings.eyeCareInterval * 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.eyeCareEnabled, settings.eyeCareInterval]);

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {settings.eyeCareEnabled && (
        <div className="fixed top-16 right-2 z-40 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs flex items-center gap-2">
          <Eye className="w-3 h-3" />
          <span>{formatTimeRemaining(timeRemaining)}</span>
        </div>
      )}
      <AnimatePresence>
        {showReminder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <Card className="w-full max-w-sm">
                <CardContent className="p-6 text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-bold mb-2">Zeit für eine Pause! 👀</h3>
                  <p className="text-muted-foreground mb-4">Schauen Sie 20 Sekunden lang auf etwas, das mindestens 6 Meter entfernt ist.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => updateSettings({ eyeCareEnabled: false })}>Deaktivieren</Button>
                    <Button className="flex-1" onClick={() => setShowReminder(false)}>Verstanden</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
