'use client';

import { Settings, Eye, Keyboard, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';

export const AccessibilityProPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();

  const highContrastModes = [
    { id: 'black-white', name: 'Schwarz auf Weiß', bg: '#ffffff', text: '#000000' },
    { id: 'white-black', name: 'Weiß auf Schwarz', bg: '#000000', text: '#ffffff' },
    { id: 'yellow-black', name: 'Gelb auf Schwarz', bg: '#000000', text: '#ffff00' },
    { id: 'black-yellow', name: 'Schwarz auf Gelb', bg: '#ffff00', text: '#000000' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Accessibility Pro
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-6">
            {/* Keyboard Navigation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Keyboard className="w-4 h-4" />
                      Tastaturnavigation
                    </Label>
                    <p className="text-xs text-muted-foreground">Volle Steuerung per Tastatur</p>
                  </div>
                  <Button
                    variant={settings.keyboardNavigationEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ keyboardNavigationEnabled: !settings.keyboardNavigationEnabled })}
                  >
                    {settings.keyboardNavigationEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
                {settings.keyboardNavigationEnabled && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2"><Badge variant="outline">→</Badge> Nächste Seite</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">←</Badge> Vorherige Seite</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">↑</Badge> Nach oben scrollen</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">↓</Badge> Nach unten scrollen</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">B</Badge> Lesezeichen</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">M</Badge> Menü</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">H</Badge> Startseite</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">ESC</Badge> Schließen</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High Contrast Pro */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium">High Contrast Pro</Label>
                    <p className="text-xs text-muted-foreground">Erhöhter Kontrast für bessere Lesbarkeit</p>
                  </div>
                  <Button
                    variant={settings.highContrastProEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ highContrastProEnabled: !settings.highContrastProEnabled })}
                  >
                    {settings.highContrastProEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
                {settings.highContrastProEnabled && (
                  <div className="grid grid-cols-2 gap-2">
                    {highContrastModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updateSettings({ highContrastProMode: mode.id as any })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.highContrastProMode === mode.id
                            ? 'border-primary'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: mode.bg, color: mode.text }}
                      >
                        <span className="text-sm font-medium">{mode.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reduced Motion Pro */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium">Reduced Motion Pro</Label>
                    <p className="text-xs text-muted-foreground">Animationen reduzieren oder deaktivieren</p>
                  </div>
                  <Button
                    variant={settings.reducedMotionProEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ reducedMotionProEnabled: !settings.reducedMotionProEnabled })}
                  >
                    {settings.reducedMotionProEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
                {settings.reducedMotionProEnabled && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Alle Animationen deaktivieren</Label>
                      <Button
                        variant={settings.disableAllAnimations ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ disableAllAnimations: !settings.disableAllAnimations })}
                      >
                        {settings.disableAllAnimations ? 'An' : 'Aus'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Parallax reduzieren</Label>
                      <Button
                        variant={settings.reduceParallax ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ reduceParallax: !settings.reduceParallax })}
                      >
                        {settings.reduceParallax ? 'An' : 'Aus'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced ARIA */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Verbesserte Screenreader-Unterstützung</Label>
                    <p className="text-xs text-muted-foreground">Optimierte ARIA-Labels für Screenreader</p>
                  </div>
                  <Button
                    variant={settings.enhancedAriaEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ enhancedAriaEnabled: !settings.enhancedAriaEnabled })}
                  >
                    {settings.enhancedAriaEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reading Mask Settings */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Focus className="w-4 h-4" />
                      Leseschablone
                    </Label>
                    <p className="text-xs text-muted-foreground">Zeilenweiser Fokus für bessere Konzentration</p>
                  </div>
                  <Button
                    variant={settings.readingMaskEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ readingMaskEnabled: !settings.readingMaskEnabled })}
                  >
                    {settings.readingMaskEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
                {settings.readingMaskEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Sichtbare Zeilen</Label>
                        <span className="text-xs text-muted-foreground">{settings.readingMaskLines}</span>
                      </div>
                      <Slider
                        value={[settings.readingMaskLines]}
                        onValueChange={([value]) => updateSettings({ readingMaskLines: value })}
                        min={1}
                        max={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Masken-Deckkraft</Label>
                        <span className="text-xs text-muted-foreground">{settings.readingMaskOpacity}%</span>
                      </div>
                      <Slider
                        value={[settings.readingMaskOpacity]}
                        onValueChange={([value]) => updateSettings({ readingMaskOpacity: value })}
                        min={20}
                        max={100}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
