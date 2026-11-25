'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, MoonStar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';

export const AmbientLightingPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return { name: 'Morgen', color: '#fff5e6', icon: Sun };
    if (hour >= 12 && hour < 18) return { name: 'Nachmittag', color: '#ffffff', icon: Sun };
    if (hour >= 18 && hour < 21) return { name: 'Abend', color: '#ffecd2', icon: MoonStar };
    return { name: 'Nacht', color: '#1a1a2e', icon: Moon };
  };

  const timeOfDay = getTimeOfDay();

  const presetColors = [
    { id: 'warm', name: 'Warm', color: '#fff5e6' },
    { id: 'cool', name: 'Kühl', color: '#f0f8ff' },
    { id: 'sepia', name: 'Sepia', color: '#f4ecd8' },
    { id: 'night', name: 'Nacht', color: '#1a1a2e' },
    { id: 'green', name: 'Beruhigend', color: '#e8f5e9' },
    { id: 'rose', name: 'Rose', color: '#fff0f5' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Ambiente Beleuchtung
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Current Time */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktuelle Zeit</p>
                  <p className="text-2xl font-bold">{currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-sm">{timeOfDay.name}</p>
                </div>
                <timeOfDay.icon className="w-16 h-16 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Ambiente Beleuchtung aktivieren</Label>
              <p className="text-xs text-muted-foreground">Bildschirmfarbe passt sich der Tageszeit an</p>
            </div>
            <Button
              variant={settings.ambientLightingEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ ambientLightingEnabled: !settings.ambientLightingEnabled })}
            >
              {settings.ambientLightingEnabled ? 'An' : 'Aus'}
            </Button>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label className="text-sm">Modus</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={settings.ambientLightingMode === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ ambientLightingMode: 'auto' })}
              >
                Automatisch
              </Button>
              <Button
                variant={settings.ambientLightingMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ ambientLightingMode: 'manual' })}
              >
                Manuell
              </Button>
            </div>
          </div>

          {/* Color Presets (Manual Mode) */}
          {settings.ambientLightingMode === 'manual' && (
            <div className="space-y-2">
              <Label className="text-sm">Farbpresets</Label>
              <div className="grid grid-cols-3 gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateSettings({ ambientLightingColor: preset.color })}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      settings.ambientLightingColor === preset.color
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full mb-2"
                      style={{ backgroundColor: preset.color, border: '1px solid #e5e7eb' }}
                    />
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Intensität</Label>
              <span className="text-xs text-muted-foreground">{settings.ambientLightingIntensity}%</span>
            </div>
            <Slider
              value={[settings.ambientLightingIntensity]}
              onValueChange={([value]) => updateSettings({ ambientLightingIntensity: value })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Preview */}
          <Card>
            <CardContent className="p-4">
              <Label className="mb-3 block">Vorschau</Label>
              <div
                className="h-32 rounded-lg transition-colors"
                style={{
                  backgroundColor: settings.ambientLightingMode === 'auto'
                    ? timeOfDay.color
                    : settings.ambientLightingColor,
                  opacity: settings.ambientLightingIntensity / 100 + 0.3,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
