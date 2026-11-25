'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Sun,
  Moon,
  BookOpen,
  Type,
  AlignJustify,
  Volume2,
  Eye,
  Palette,
  Zap,
  Vibrate,
  Hand,
  MoonStar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';

export const SettingsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const fontFamilies = [
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'system-ui, sans-serif', label: 'System' },
    { value: 'Times New Roman, serif', label: 'Times' },
    { value: 'Arial, sans-serif', label: 'Arial' },
  ];

  const colorBlindModes = [
    { value: 'none', label: 'Normal', description: 'Keine Anpassung' },
    { value: 'protanopia', label: 'Protanopie', description: 'Rot-Blindheit' },
    { value: 'deuteranopia', label: 'Deuteranopie', description: 'Grün-Blindheit' },
    { value: 'tritanopia', label: 'Tritanopie', description: 'Blau-Blindheit' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80 overflow-y-auto">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Einstellungen</SheetTitle></SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'sepia'] as const).map((theme) => (
                <Button key={theme} variant={settings.theme === theme ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ theme })} className="flex flex-col h-auto py-2">
                  {theme === 'light' && <Sun className="w-4 h-4 mb-1" />}
                  {theme === 'dark' && <Moon className="w-4 h-4 mb-1" />}
                  {theme === 'sepia' && <BookOpen className="w-4 h-4 mb-1" />}
                  <span className="text-xs">{theme === 'light' ? 'Hell' : theme === 'dark' ? 'Dunkel' : 'Sepia'}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2"><Eye className="w-4 h-4" />Barrierefreiheit</h4>
            
            {/* Dyslexia Font */}
            <div className="flex items-center justify-between">
              <div><Label className="text-sm">Dyslexie-Font</Label><p className="text-xs text-muted-foreground">Optimiert für Legastheniker</p></div>
              <Button variant={settings.dyslexiaFont ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ dyslexiaFont: !settings.dyslexiaFont })}>{settings.dyslexiaFont ? 'Aktiv' : 'Inaktiv'}</Button>
            </div>

            {/* Bionic Reading */}
            <div className="flex items-center justify-between">
              <div><Label className="text-sm flex items-center gap-1"><Zap className="w-3 h-3" />Bionic Reading</Label><p className="text-xs text-muted-foreground">Erste Buchstaben hervorheben</p></div>
              <Button variant={settings.bionicReading ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ bionicReading: !settings.bionicReading })}>{settings.bionicReading ? 'Aktiv' : 'Inaktiv'}</Button>
            </div>

            {/* Color Blind Mode */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1"><Palette className="w-3 h-3" />Farbenblind-Modus</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorBlindModes.map((mode) => (
                  <Button
                    key={mode.value}
                    variant={settings.colorBlindMode === mode.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ colorBlindMode: mode.value as any })}
                    className="flex flex-col h-auto py-2"
                  >
                    <span className="text-xs font-medium">{mode.label}</span>
                    <span className="text-[10px] text-muted-foreground">{mode.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between">
              <div><Label className="text-sm flex items-center gap-1"><Vibrate className="w-3 h-3" />Haptisches Feedback</Label><p className="text-xs text-muted-foreground">Vibration beim Blättern</p></div>
              <Button variant={settings.hapticFeedback ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}>{settings.hapticFeedback ? 'An' : 'Aus'}</Button>
            </div>

            {/* Gesture Navigation */}
            <div className="flex items-center justify-between">
              <div><Label className="text-sm flex items-center gap-1"><Hand className="w-3 h-3" />Gesten-Navigation</Label><p className="text-xs text-muted-foreground">Wischen/Schütteln zum Blättern</p></div>
              <Button variant={settings.gestureNavigation ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ gestureNavigation: !settings.gestureNavigation })}>{settings.gestureNavigation ? 'An' : 'Aus'}</Button>
            </div>

            {/* Eye Care Timer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div><Label className="text-sm">Augenpflege-Timer</Label><p className="text-xs text-muted-foreground">20-20-20 Regel</p></div>
                <Button variant={settings.eyeCareEnabled ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ eyeCareEnabled: !settings.eyeCareEnabled })}>{settings.eyeCareEnabled ? 'An' : 'Aus'}</Button>
              </div>
              {settings.eyeCareEnabled && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Intervall:</Label>
                  <Slider value={[settings.eyeCareInterval]} onValueChange={([value]) => updateSettings({ eyeCareInterval: value })} min={5} max={60} step={5} className="flex-1" />
                  <span className="text-xs">{settings.eyeCareInterval}min</span>
                </div>
              )}
            </div>
          </div>

          {/* Night Mode Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2"><MoonStar className="w-4 h-4" />Nachtlesemodus</h4>
            <div className="flex items-center justify-between">
              <div><Label className="text-sm">Rotfilter aktivieren</Label><p className="text-xs text-muted-foreground">Reduziert blaues Licht</p></div>
              <Button variant={settings.nightModeEnabled ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ nightModeEnabled: !settings.nightModeEnabled })}>{settings.nightModeEnabled ? 'An' : 'Aus'}</Button>
            </div>
            {settings.nightModeEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Intensität:</Label>
                  <span className="text-xs">{settings.nightModeIntensity}%</span>
                </div>
                <Slider
                  value={[settings.nightModeIntensity]}
                  onValueChange={([value]) => updateSettings({ nightModeIntensity: value })}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>
            )}
          </div>

          {/* Speed Reading Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />Speed Reading</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Wörter pro Minute:</Label>
                <span className="text-xs font-medium">{settings.speedReadingWPM} WPM</span>
              </div>
              <Slider
                value={[settings.speedReadingWPM]}
                onValueChange={([value]) => updateSettings({ speedReadingWPM: value })}
                min={100}
                max={600}
                step={25}
              />
              <p className="text-xs text-muted-foreground">RSVP-Modus zeigt ein Wort nach dem anderen</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium"><Type className="w-4 h-4" />Schriftgröße: {settings.fontSize}px</Label>
            <Slider value={[settings.fontSize]} onValueChange={([value]) => updateSettings({ fontSize: value })} min={12} max={32} step={1} />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium"><AlignJustify className="w-4 h-4" />Zeilenhöhe: {settings.lineHeight}</Label>
            <Slider value={[settings.lineHeight * 10]} onValueChange={([value]) => updateSettings({ lineHeight: value / 10 })} min={12} max={25} step={1} />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Schriftart</Label>
            <div className="grid grid-cols-2 gap-2">
              {fontFamilies.map((font) => (
                <Button key={font.value} variant={settings.fontFamily === font.value ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ fontFamily: font.value })} style={{ fontFamily: font.value }}>{font.label}</Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" />Vorlesefunktion</h4>
            <div className="space-y-2">
              <Label className="text-xs">Geschwindigkeit: {settings.ttsSpeed}x</Label>
              <Slider value={[settings.ttsSpeed * 10]} onValueChange={([value]) => updateSettings({ ttsSpeed: value / 10 })} min={5} max={20} step={1} />
            </div>
            {voices.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Stimme</Label>
                <select className="w-full border rounded-md p-2 text-sm" value={settings.ttsVoice} onChange={(e) => updateSettings({ ttsVoice: e.target.value })}>
                  <option value="">Standard</option>
                  {voices.filter(v => v.lang.startsWith('de') || v.lang.startsWith('en')).map((voice) => (<option key={voice.name} value={voice.name}>{voice.name}</option>))}
                </select>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
