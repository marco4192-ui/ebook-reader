'use client';

import { useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const ExportImportPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { exportData, importData } = useBookStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebook-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportiert!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (importData(event.target?.result as string)) { toast.success('Importiert!'); onOpenChange(false); }
        else { toast.error('Import fehlgeschlagen'); }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Download className="w-5 h-5" />Export / Import</SheetTitle></SheetHeader>
        <div className="space-y-6 mt-6">
          <Card><CardContent className="p-4"><h4 className="font-medium mb-2">Daten exportieren</h4><p className="text-sm text-muted-foreground mb-4">Exportiert alle Bücher, Lesezeichen, Markierungen und Notizen.</p><Button onClick={handleExport} className="w-full"><Download className="w-4 h-4 mr-2" />Exportieren</Button></CardContent></Card>
          <Card><CardContent className="p-4"><h4 className="font-medium mb-2">Daten importieren</h4><p className="text-sm text-muted-foreground mb-4">Stellen Sie ein Backup wieder her.</p><input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" /><Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full"><Upload className="w-4 h-4 mr-2" />Importieren</Button></CardContent></Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
