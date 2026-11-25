'use client';

import { useRef } from 'react';
import { Upload, List, X, Type, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const CustomFontUploader = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['.ttf', '.otf', '.woff', '.woff2'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(`.${ext}`)) {
      toast.error('Bitte laden Sie eine TTF, OTF, WOFF oder WOFF2 Datei hoch');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const fontName = file.name.replace(/\.[^/.]+$/, '');
      const fontId = `custom-font-${Date.now()}`;

      // Add to custom fonts
      const newFonts = [...settings.customFonts, { name: fontName, url: base64, id: fontId }];
      updateSettings({ customFonts: newFonts });
      toast.success(`Schriftart "${fontName}" hinzugefügt!`);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCustomFont = (fontId: string) => {
    const newFonts = settings.customFonts.filter(f => f.id !== fontId);
    updateSettings({ customFonts: newFonts });
    toast.success('Schriftart entfernt');
  };

  const applyCustomFont = (fontId: string) => {
    const font = settings.customFonts.find(f => f.id === fontId);
    if (font) {
      updateSettings({ fontFamily: font.name });
      toast.success(`Schriftart "${font.name}" angewendet`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Eigene Schriftarten
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Upload */}
          <Card>
            <CardContent className="p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFontUpload}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  Laden Sie Ihre eigenen Schriftarten hoch (TTF, OTF, WOFF, WOFF2)
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schriftart hochladen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Fonts List */}
          {settings.customFonts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ihre Schriftarten</Label>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {settings.customFonts.map((font) => (
                    <Card key={font.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Type className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{font.name}</p>
                            <p className="text-xs text-muted-foreground">Benutzerdefiniert</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyCustomFont(font.id)}
                          >
                            Anwenden
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeCustomFont(font.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Default Fonts */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Standard-Schriftarten</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'Georgia, serif', label: 'Georgia' },
                { value: 'system-ui, sans-serif', label: 'System' },
                { value: 'Times New Roman, serif', label: 'Times' },
                { value: 'Arial, sans-serif', label: 'Arial' },
              ].map((font) => (
                <Button
                  key={font.value}
                  variant={settings.fontFamily === font.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ fontFamily: font.value })}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
