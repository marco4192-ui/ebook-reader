'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';

export const QRExportPanel = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { generateQRData, qrSyncData } = useBookStore();
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && book) {
      const data = generateQRData(book.id);
      setQrData(data);
    }
  }, [open, book, generateQRData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    toast.success('Daten in Zwischenablage kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSyncData = () => {
    try {
      const parsed = JSON.parse(qrData);
      return parsed;
    } catch {
      return null;
    }
  };

  const syncInfo = formatSyncData();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            QR-Code Export
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col items-center gap-6">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl shadow-lg">
            {qrData && (
              <QRCodeSVG 
                value={qrData} 
                size={200}
                level="M"
                includeMargin={true}
              />
            )}
          </div>

          {/* Info */}
          <Card className="w-full max-w-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span>Scannen Sie den QR-Code mit einem anderen Gerät</span>
              </div>
              {syncInfo && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Buch:</strong> {syncInfo.book?.title}</p>
                  <p><strong>Fortschritt:</strong> {Math.round(syncInfo.book?.progress || 0)}%</p>
                  {syncInfo.book?.author && <p><strong>Autor:</strong> {syncInfo.book.author}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Copy Button */}
          <Button onClick={copyToClipboard} variant="outline" className="w-full max-w-sm">
            {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Kopiert!' : 'Daten kopieren'}
          </Button>

          {/* Last sync info */}
          {qrSyncData && (
            <p className="text-xs text-muted-foreground">
              Letzte Synchronisation: {new Date(qrSyncData.lastSync).toLocaleString('de-DE')}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
