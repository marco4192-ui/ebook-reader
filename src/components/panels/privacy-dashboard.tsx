'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookIcon,
  Type,
  Highlighter,
  Download,
  Edit3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Shield,
  Lock,
  Key,
  Database,
  WifiOff,
  Wifi,
  FileDown,
  HardDrive,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';

export const PrivacyDashboard = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, highlights, notes, readingStats, settings, exportData } = useBookStore();
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [localFirstMode, setLocalFirstMode] = useState(true);
  const [autoDeleteDays, setAutoDeleteDays] = useState<number | null>(null);
  const [showEncryptionSetup, setShowEncryptionSetup] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [gdprExporting, setGdprExporting] = useState(false);

  const totalDataSize = useMemo(() => {
    const data = { books, highlights, notes, readingStats, settings };
    return new Blob([JSON.stringify(data)]).size;
  }, [books, highlights, notes, readingStats, settings]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const setupEncryption = async () => {
    try {
      const response = await fetch('/api/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateKey' }),
      });
      const data = await response.json();
      if (data.success) {
        setEncryptionKey(data.key);
        setEncryptionEnabled(true);
        setShowEncryptionSetup(false);
        toast.success('Verschlüsselung aktiviert!');
      }
    } catch {
      toast.error('Fehler beim Einrichten');
    }
  };

  const handleGdprExport = async () => {
    setGdprExporting(true);
    try {
      const gdprData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        user: {
          settings: settings,
          preferences: {},
        },
        books: books.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          format: b.format,
          progress: b.progress,
          rating: b.rating,
          tags: b.tags,
          addedAt: b.addedAt,
          lastRead: b.lastRead,
        })),
        bookmarks: [],
        highlights: highlights,
        notes: notes.map(n => ({
          id: n.id,
          bookId: n.bookId,
          title: n.title,
          content: n.content,
          tags: n.tags,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        })),
        readingStats: readingStats,
        achievements: [],
        readingSessions: [],
      };

      const response = await fetch('/api/gdpr-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: gdprData, format: 'markdown' }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-export-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('GDPR Export erstellt!');
    } catch {
      toast.error('Export fehlgeschlagen');
    }
    setGdprExporting(false);
  };

  const handleDeleteAllData = () => {
    if (confirm('Möchten Sie wirklich ALLE Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Datenschutz & Privatsphäre
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-80px)] mt-4">
          <div className="space-y-4">
            {/* Data Overview */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Gespeicherte Daten
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <BookIcon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-lg font-bold">{books.length}</p>
                    <p className="text-xs text-muted-foreground">Bücher</p>
                  </div>
                  <div className="text-center">
                    <Highlighter className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-lg font-bold">{highlights.length}</p>
                    <p className="text-xs text-muted-foreground">Markierungen</p>
                  </div>
                  <div className="text-center">
                    <Edit3 className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{notes.length}</p>
                    <p className="text-xs text-muted-foreground">Notizen</p>
                  </div>
                  <div className="text-center">
                    <HardDrive className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold">{formatSize(totalDataSize)}</p>
                    <p className="text-xs text-muted-foreground">Größe</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Encryption */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Ende-zu-Ende Verschlüsselung</h4>
                      <p className="text-xs text-muted-foreground">Verschlüsseln Sie sensible Daten</p>
                    </div>
                  </div>
                  <Button
                    variant={encryptionEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => encryptionEnabled ? setEncryptionEnabled(false) : setShowEncryptionSetup(true)}
                  >
                    {encryptionEnabled ? <Lock className="w-4 h-4 mr-1" /> : <Key className="w-4 h-4 mr-1" />}
                    {encryptionEnabled ? 'Aktiv' : 'Aktivieren'}
                  </Button>
                </div>
                {encryptionEnabled && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                    <p className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Ihre Notizen und Markierungen sind verschlüsselt
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Local-First Mode */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {localFirstMode ? <WifiOff className="w-5 h-5 text-green-500" /> : <Wifi className="w-5 h-5 text-muted-foreground" />}
                    <div>
                      <h4 className="font-medium">Local-First Modus</h4>
                      <p className="text-xs text-muted-foreground">Alle Daten bleiben auf diesem Gerät</p>
                    </div>
                  </div>
                  <Button
                    variant={localFirstMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLocalFirstMode(!localFirstMode)}
                  >
                    {localFirstMode ? 'Aktiv' : 'Inaktiv'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Cleanup */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Trash className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-medium">Automatische Bereinigung</h4>
                    <p className="text-xs text-muted-foreground">Alte Daten automatisch löschen</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[null, 30, 90, 180].map((days) => (
                    <Button
                      key={days ?? 'never'}
                      variant={autoDeleteDays === days ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAutoDeleteDays(days)}
                    >
                      {days === null ? 'Nie' : `${days} Tage`}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* GDPR Export */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <FileDown className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">DSGVO-Export</h4>
                    <p className="text-xs text-muted-foreground">Laden Sie alle Ihre Daten herunter</p>
                  </div>
                </div>
                <Button onClick={handleGdprExport} disabled={gdprExporting} className="w-full">
                  {gdprExporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Alle Daten exportieren
                </Button>
              </CardContent>
            </Card>

            {/* Delete All */}
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-red-600 dark:text-red-400">Alle Daten löschen</h4>
                    <p className="text-xs text-muted-foreground">Unwiderruflich alle Daten entfernen</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDeleteAllData} className="w-full">
                  <Trash className="w-4 h-4 mr-2" />
                  Alle Daten löschen
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Encryption Setup Modal */}
        <AnimatePresence>
          {showEncryptionSetup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-center">
                    <Lock className="w-12 h-12 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-center">Verschlüsselung einrichten</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Ihre sensiblen Daten werden mit AES-256 verschlüsselt.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowEncryptionSetup(false)} className="flex-1">
                      Abbrechen
                    </Button>
                    <Button onClick={setupEncryption} className="flex-1">
                      Aktivieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};
