'use client';

import { useState } from 'react';
import { Trash2, Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const ThemeCreator = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { customThemes, addCustomTheme, removeCustomTheme, applyCustomTheme, settings, updateSettings } = useBookStore();
  const [newTheme, setNewTheme] = useState({
    name: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#f59e0b',
  });
  const [previewTheme, setPreviewTheme] = useState<typeof newTheme | null>(null);

  const handleAddTheme = () => {
    if (newTheme.name.trim()) {
      addCustomTheme({
        name: newTheme.name.trim(),
        backgroundColor: newTheme.backgroundColor,
        textColor: newTheme.textColor,
        accentColor: newTheme.accentColor,
      });
      setNewTheme({
        name: '',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        accentColor: '#f59e0b',
      });
      toast.success('Theme gespeichert!');
    }
  };

  const handleApplyTheme = (themeId: string) => {
    applyCustomTheme(themeId);
    toast.success('Theme angewendet!');
  };

  const presetThemes = [
    { name: 'Papier', backgroundColor: '#f5f0e6', textColor: '#3d3d3d', accentColor: '#8b4513' },
    { name: 'Nacht', backgroundColor: '#1a1a2e', textColor: '#e0e0e0', accentColor: '#4a9eff' },
    { name: 'Sepia', backgroundColor: '#f4ecd8', textColor: '#5c4b37', accentColor: '#8b6914' },
    { name: 'Mint', backgroundColor: '#e8f5e9', textColor: '#1b5e20', accentColor: '#4caf50' },
    { name: 'Lavendel', backgroundColor: '#f3e5f5', textColor: '#4a148c', accentColor: '#9c27b0' },
    { name: 'Ozean', backgroundColor: '#e3f2fd', textColor: '#0d47a1', accentColor: '#2196f3' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme Creator
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          <div className="space-y-6">
            {/* Create New Theme */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Neues Theme erstellen</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Name</Label>
                    <Input
                      placeholder="Theme-Name..."
                      value={newTheme.name}
                      onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">Hintergrund</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTheme.backgroundColor}
                          onChange={(e) => setNewTheme({ ...newTheme, backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newTheme.backgroundColor}
                          onChange={(e) => setNewTheme({ ...newTheme, backgroundColor: e.target.value })}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Text</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTheme.textColor}
                          onChange={(e) => setNewTheme({ ...newTheme, textColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newTheme.textColor}
                          onChange={(e) => setNewTheme({ ...newTheme, textColor: e.target.value })}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Akzent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTheme.accentColor}
                          onChange={(e) => setNewTheme({ ...newTheme, accentColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newTheme.accentColor}
                          onChange={(e) => setNewTheme({ ...newTheme, accentColor: e.target.value })}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: newTheme.backgroundColor,
                      color: newTheme.textColor,
                    }}
                  >
                    <h4 className="font-semibold mb-2">Vorschau</h4>
                    <p className="text-sm mb-2">
                      Dies ist ein Beispieltext, um das Theme zu sehen. Lorem ipsum dolor sit amet.
                    </p>
                    <Button size="sm" style={{ backgroundColor: newTheme.accentColor, color: '#fff' }}>
                      Akzent-Farbe
                    </Button>
                  </div>

                  <Button onClick={handleAddTheme} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Theme speichern
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preset Themes */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Vorlagen</h3>
                <div className="grid grid-cols-3 gap-3">
                  {presetThemes.map((preset) => (
                    <button
                      key={preset.name}
                      className="rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => setNewTheme(preset)}
                    >
                      <div
                        className="h-16 p-2"
                        style={{ backgroundColor: preset.backgroundColor, color: preset.textColor }}
                      >
                        <p className="text-xs font-medium">{preset.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Saved Themes */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Gespeicherte Themes ({customThemes.length})</h3>
                {customThemes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {customThemes.map((theme) => (
                      <Card key={theme.id} className="overflow-hidden">
                        <div
                          className="h-20 p-3"
                          style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
                        >
                          <p className="font-medium text-sm">{theme.name}</p>
                        </div>
                        <CardContent className="p-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleApplyTheme(theme.id)}
                          >
                            Anwenden
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCustomTheme(theme.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine gespeicherten Themes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
