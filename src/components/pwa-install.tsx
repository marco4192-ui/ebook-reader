'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check for iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
      !(window as unknown as { MSStream?: boolean }).MSStream;
    setIsIOS(iOS);

    // Check if dismissed recently (7 days)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      setIsDismissed(true);
    }

    // Listen for install prompt
    const handleInstallable = () => {
      const deferredPrompt = (window as unknown as { deferredInstallPrompt?: BeforeInstallPromptEvent }).deferredInstallPrompt;
      if (deferredPrompt) {
        setInstallPrompt(deferredPrompt);
        setShowPrompt(true);
      }
    };

    // Check if already available
    handleInstallable();

    window.addEventListener('pwa-installable', handleInstallable);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Install error:', error);
    }

    setInstallPrompt(null);
  }, [installPrompt]);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  // Don't show if already installed or dismissed
  if (isStandalone || isDismissed) return null;

  return (
    <>
      {/* Floating Install Button */}
      {installPrompt && !showPrompt && (
        <Button
          onClick={() => setShowPrompt(true)}
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Download className="w-5 h-5" />
        </Button>
      )}

      {/* Install Dialog */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              App installieren
            </DialogTitle>
            <DialogDescription>
              Installiere eBook Reader Pro für die beste Erfahrung mit Offline-Zugriff und schnellerer Leistung.
            </DialogDescription>
          </DialogHeader>

          {isIOS ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>So installierst du die App auf iOS:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Tippe auf das Teilen-Symbol <span className="inline-block">⬆️</span> unten</li>
                <li>Scrolle nach unten und tippe auf "Zum Home-Bildschirm"</li>
                <li>Tippe auf "Hinzufügen" oben rechts</li>
              </ol>
              <Button variant="outline" className="w-full" onClick={dismissPrompt}>
                Verstanden
              </Button>
            </div>
          ) : installPrompt ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={dismissPrompt}>
                <X className="w-4 h-4 mr-2" />
                Später
              </Button>
              <Button className="flex-1" onClick={handleInstall}>
                <Download className="w-4 h-4 mr-2" />
                Installieren
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>Die App kann über deinen Browser installiert werden.</p>
              <p>Schau im Menü deines Browsers nach "App installieren" oder "Zum Startbildschirm hinzufügen".</p>
              <Button variant="outline" className="w-full" onClick={dismissPrompt}>
                Verstanden
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
