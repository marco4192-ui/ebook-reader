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

// Helper functions to check state (called only on client)
const checkIsStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
};

const checkIsIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && 
    !(window as unknown as { MSStream?: boolean }).MSStream;
};

const checkIsDismissed = (): boolean => {
  if (typeof window === 'undefined') return false;
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  return dismissed ? Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000 : false;
};

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
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
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  // Don't show if already installed or dismissed (client-side check)
  if (typeof window === 'undefined') return null;
  if (checkIsStandalone() || checkIsDismissed()) return null;

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

          {checkIsIOS() ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>So installierst du die App auf iOS:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Tippe auf das Teilen-Symbol <span className="inline-block">⬆️</span> unten</li>
                <li>Scrolle nach unten und tippe auf &quot;Zum Home-Bildschirm&quot;</li>
                <li>Tippe auf &quot;Hinzufügen&quot; oben rechts</li>
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
              <p>Schau im Menü deines Browsers nach &quot;App installieren&quot; oder &quot;Zum Startbildschirm hinzufügen&quot;.</p>
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
