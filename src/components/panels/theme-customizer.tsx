'use client';

import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';

export const ThemeCustomizer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();

  const colorPresets = [
    { name: 'Klassisch', bg: '#ffffff', text: '#000000', accent: '#f59e0b' },
    { name: 'Dunkel', bg: '#1a1a1a', text: '#e5e5e5', accent: '#60a5fa' },
    { name: 'Sepia', bg: '#f4ecd8', text: '#5c4b37', accent: '#b8860b' },
    { name: 'Ozean', bg: '#e0f2fe', text: '#0c4a6e', accent: '#0284c7' },
    { name: 'Wald', bg: '#ecfdf5', text: '#14532d', accent: '#22c55e' },
    { name: 'Lavendel', bg: '#faf5ff', text: '#4c1d95', accent: '#a855f7' },
  ];

  const gradientPresets = [
    { name: 'Sonnenuntergang', start: '#fef3c7', end: '#fde68a' },
    { name: 'Ozean', start: '#dbeafe', end: '#bfdbfe' },
    { name: 'Wald', start: '#dcfce7', end: '#bbf7d0' },
    { name: 'Lavendel', start: '#f3e8ff', end: '#e9d5ff' },
    { name: 'Rose', start: '#ffe4e6', end: '#fecdd3' },
    { name: 'Nacht', start: '#1e293b', end: '#0f172a' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme-Anpassung
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-6">
            {/* Gradient Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Gradient-Hintergrund</Label>
                <p className="text-xs text-muted-foreground">Farbverlauf als Hintergrund</p>
              </div>
              <Button
                variant={settings.gradientThemeEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ gradientThemeEnabled: !settings.gradientThemeEnabled })}
              >
                {settings.gradientThemeEnabled ? 'An' : 'Aus'}
              </Button>
            </div>

            {/* Gradient Presets */}
            {settings.gradientThemeEnabled && (
              <div className="space-y-2">
                <Label className="text-sm">Gradient-Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateSettings({
                        gradientThemeStart: preset.start,
                        gradientThemeEnd: preset.end,
                      })}
                      className="p-2 rounded-lg border-2 border-transparent hover:border-primary transition-all"
                    >
                      <div
                        className="h-12 rounded mb-1"
                        style={{
                          background: `linear-gradient(to bottom, ${preset.start}, ${preset.end})`,
                        }}
                      />
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Gradient */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Startfarbe</Label>
                    <input
                      type="color"
                      value={settings.gradientThemeStart}
                      onChange={(e) => updateSettings({ gradientThemeStart: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Endfarbe</Label>
                    <input
                      type="color"
                      value={settings.gradientThemeEnd}
                      onChange={(e) => updateSettings({ gradientThemeEnd: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Gradient Direction */}
                <div className="space-y-2">
                  <Label className="text-xs">Richtung</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'to-right', label: 'Horizontal' },
                      { id: 'to-bottom', label: 'Vertikal' },
                      { id: 'diagonal', label: 'Diagonal' },
                    ].map((dir) => (
                      <Button
                        key={dir.id}
                        variant={settings.gradientThemeDirection === dir.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ gradientThemeDirection: dir.id as any })}
                      >
                        {dir.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Color Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Farbpresets</Label>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateSettings({
                      themeBackgroundColor: preset.bg,
                      themeTextColor: preset.text,
                      themeAccentColor: preset.accent,
                    })}
                    className="p-2 rounded-lg border-2 border-transparent hover:border-primary transition-all"
                  >
                    <div
                      className="h-12 rounded mb-1 relative"
                      style={{ backgroundColor: preset.bg }}
                    >
                      <div
                        className="absolute bottom-1 right-1 w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Eigene Farben</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Hintergrund</Label>
                  <input
                    type="color"
                    value={settings.themeBackgroundColor}
                    onChange={(e) => updateSettings({ themeBackgroundColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Textfarbe</Label>
                  <input
                    type="color"
                    value={settings.themeTextColor}
                    onChange={(e) => updateSettings({ themeTextColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Akzentfarbe</Label>
                  <input
                    type="color"
                    value={settings.themeAccentColor}
                    onChange={(e) => updateSettings({ themeAccentColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Markierungsfarbe</Label>
                  <input
                    type="color"
                    value={settings.themeHighlightColor}
                    onChange={(e) => updateSettings({ themeHighlightColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Margin Presets */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Seitenränder</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'minimal', label: 'Minimal' },
                  { id: 'balanced', label: 'Ausgewogen' },
                  { id: 'generous', label: 'Großzügig' },
                  { id: 'custom', label: 'Benutzerdefiniert' },
                ].map((preset) => (
                  <Button
                    key={preset.id}
                    variant={settings.marginPreset === preset.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ marginPreset: preset.id as any })}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {settings.marginPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Oben: {settings.customMarginTop}px</Label>
                    <Slider
                      value={[settings.customMarginTop]}
                      onValueChange={([value]) => updateSettings({ customMarginTop: value })}
                      min={0}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Unten: {settings.customMarginBottom}px</Label>
                    <Slider
                      value={[settings.customMarginBottom]}
                      onValueChange={([value]) => updateSettings({ customMarginBottom: value })}
                      min={0}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Links: {settings.customMarginLeft}px</Label>
                    <Slider
                      value={[settings.customMarginLeft]}
                      onValueChange={([value]) => updateSettings({ customMarginLeft: value })}
                      min={0}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Rechts: {settings.customMarginRight}px</Label>
                    <Slider
                      value={[settings.customMarginRight]}
                      onValueChange={([value]) => updateSettings({ customMarginRight: value })}
                      min={0}
                      max={60}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <Card>
              <CardContent className="p-4">
                <Label className="mb-3 block">Vorschau</Label>
                <div
                  className="h-40 rounded-lg p-4 transition-colors"
                  style={{
                    backgroundColor: settings.gradientThemeEnabled
                      ? undefined
                      : settings.themeBackgroundColor,
                    background: settings.gradientThemeEnabled
                      ? `linear-gradient(${settings.gradientThemeDirection === 'to-right' ? 'to right' : settings.gradientThemeDirection === 'diagonal' ? 'to bottom right' : 'to bottom'}, ${settings.gradientThemeStart}, ${settings.gradientThemeEnd})`
                      : undefined,
                    color: settings.themeTextColor,
                  }}
                >
                  <h4 className="font-bold mb-2" style={{ color: settings.themeAccentColor }}>
                    Beispielkapitel
                  </h4>
                  <p className="text-sm" style={{ color: settings.themeTextColor }}>
                    Dies ist ein Beispieltext, um die gewählten Farben zu testen. 
                    <span
                      className="px-1 rounded"
                      style={{ backgroundColor: settings.themeHighlightColor }}
                    >
                      Markierter Text
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
