'use client';

import { BookOpen, Clock, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';

import { pageAnimations } from '@/lib/reading/reading-styles';

export const PageAnimationSelector = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Seitenanimationen
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Animation Types */}
          <div className="grid grid-cols-5 gap-3">
            {pageAnimations.map((anim) => (
              <button
                key={anim.id}
                onClick={() => updateSettings({ pageAnimation: anim.id as any })}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  settings.pageAnimation === anim.id
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent bg-muted hover:bg-muted/80'
                }`}
              >
                <anim.icon className={`w-8 h-8 mb-2 ${settings.pageAnimation === anim.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-medium">{anim.name}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{anim.description}</span>
              </button>
            ))}
          </div>

          {/* Animation Speed */}
          <Card>
            <CardContent className="p-4">
              <Label className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" />
                Animationsgeschwindigkeit: {settings.pageAnimationSpeed}ms
              </Label>
              <Slider
                value={[settings.pageAnimationSpeed]}
                onValueChange={([value]) => updateSettings({ pageAnimationSpeed: value })}
                min={100}
                max={800}
                step={50}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Schnell</span>
                <span>Langsam</span>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardContent className="p-4">
              <Label className="mb-3 block">Vorschau</Label>
              <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-amber-600/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Tippen Sie im Reader, um die Animation zu sehen</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
