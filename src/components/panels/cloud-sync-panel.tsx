'use client';

import { useState } from 'react';
import { X, Clock, RefreshCw, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const CloudSyncPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { cloudSyncStatus, setCloudSyncStatus, syncWithCloud, autoSyncEnabled, toggleAutoSync } = useBookStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const cloudProviders = [
    { id: 'google_drive', name: 'Google Drive', icon: '☁️' },
    { id: 'dropbox', name: 'Dropbox', icon: '📦' },
    { id: 'oneDrive', name: 'OneDrive', icon: '🔷' },
  ] as const;

  const handleConnect = async (provider: typeof cloudProviders[number]['id']) => {
    // Simulate connection
    setCloudSyncStatus({ provider, connected: true });
    toast.info('Verbindungsstatus simuliert – Cloud-Sync ist eine geplante Funktion.');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const success = await syncWithCloud();
    if (success) {
      toast.info('Synchronisation simuliert – keine Daten wurden übertragen.');
    } else {
      toast.error('Synchronisation fehlgeschlagen');
    }
    setIsSyncing(false);
  };

  const handleDisconnect = () => {
    setCloudSyncStatus({ provider: 'none', connected: false, lastSync: undefined });
    toast.info('Cloud-Verbindung getrennt');
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return 'Nie';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Gerade eben';
    if (minutes < 60) return `Vor ${minutes} Min`;
    if (hours < 24) return `Vor ${hours} Std`;
    return `Vor ${days} Tagen`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Cloud-Synchronisation
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Cloud-Synchronisation ist eine geplante Funktion. Es gibt noch keinen Sync-Server – Verbindungsstatus und Synchronisation sind simuliert." />
        <div className="mt-6 space-y-6">
          {/* Current Status */}
          <Card className={`${cloudSyncStatus.connected ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/20' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {cloudSyncStatus.connected ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <Cloud className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {cloudProviders.find(p => p.id === cloudSyncStatus.provider)?.icon}{' '}
                          {cloudProviders.find(p => p.id === cloudSyncStatus.provider)?.name || 'Verbunden'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Letzte Synchronisation: {formatLastSync(cloudSyncStatus.lastSync)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <CloudOff className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Nicht verbunden</p>
                        <p className="text-xs text-muted-foreground">Wählen Sie einen Cloud-Anbieter</p>
                      </div>
                    </>
                  )}
                </div>
                {cloudSyncStatus.connected && (
                  <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cloud Providers */}
          {!cloudSyncStatus.connected && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Cloud-Anbieter wählen</Label>
              <div className="grid grid-cols-3 gap-3">
                {cloudProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2"
                    onClick={() => handleConnect(provider.id)}
                  >
                    <span className="text-2xl">{provider.icon}</span>
                    <span className="text-xs">{provider.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Sync Actions */}
          {cloudSyncStatus.connected && (
            <div className="space-y-4">
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Synchronisiere...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Jetzt synchronisieren
                  </>
                )}
              </Button>

              {/* Auto-sync toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Auto-Sync</p>
                    <p className="text-xs text-muted-foreground">Automatisch synchronisieren</p>
                  </div>
                </div>
                <Button
                  variant={autoSyncEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleAutoSync}
                >
                  {autoSyncEnabled ? 'An' : 'Aus'}
                </Button>
              </div>
            </div>
          )}

          {/* Sync Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Hinweis</p>
                  <p>Ihre Bücher und Lesezeichen werden sicher in der Cloud gespeichert und können auf allen Ihren Geräten synchronisiert werden.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
