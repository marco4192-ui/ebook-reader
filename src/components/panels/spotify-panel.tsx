'use client';

import { useState } from 'react';
import { CheckCircle, Sparkles, Play, Pause, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const SpotifyPanel = ({ open, onOpenChange, mood }: { open: boolean; onOpenChange: (open: boolean) => void; mood?: string }) => {
  const [connected, setConnected] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Mock playlists based on mood
  const playlists: Record<string, { name: string; tracks: number; image: string }[]> = {
    happy: [
      { name: 'Gute Laune Mix', tracks: 25, image: '🎵' },
      { name: 'Sommer Hits', tracks: 40, image: '🌞' },
    ],
    sad: [
      { name: 'Melancholie', tracks: 30, image: '🌧️' },
      { name: 'Klavier & Streicher', tracks: 20, image: '🎹' },
    ],
    exciting: [
      { name: 'Epic Reading', tracks: 35, image: '⚔️' },
      { name: 'Adventure Soundtrack', tracks: 45, image: '🏔️' },
    ],
    calm: [
      { name: 'Lese-Fokus', tracks: 50, image: '📚' },
      { name: 'Ambient', tracks: 60, image: '🌌' },
    ],
    romantic: [
      { name: 'Romantische Klassiker', tracks: 28, image: '💕' },
      { name: 'Love Songs', tracks: 33, image: '💗' },
    ],
    mysterious: [
      { name: 'Dark Ambient', tracks: 25, image: '🌑' },
      { name: 'Mystery Soundtrack', tracks: 30, image: '🔮' },
    ],
  };

  const currentMood = mood || 'calm';
  const suggestedPlaylists = playlists[currentMood] || playlists.calm;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-green-500" />
            Spotify
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Die Spotify-Integration ist eine geplante Funktion. Wiedergabe-Steuerung und Playlists sind simuliert." />
        <div className="mt-6 space-y-6">
          {!connected ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h4 className="font-medium mb-2">Mit Spotify verbinden</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Passende Musik zu Ihrer Stimmung beim Lesen.
                </p>
                <Button onClick={() => { setConnected(true); toast.info('Simulierte Verbindung – Spotify-Integration ist geplant.'); }}>
                  <Music className="w-4 h-4 mr-2" />
                  Mit Spotify verbinden
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Verbunden</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPlaying(!playing)}>
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Empfohlen für "{currentMood}" Stimmung
                  </h4>
                  <div className="space-y-2">
                    {suggestedPlaylists.map((playlist, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                        <span className="text-2xl">{playlist.image}</span>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{playlist.name}</h5>
                          <p className="text-xs text-muted-foreground">{playlist.tracks} Titel</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => toast.info('Wiedergabe simuliert – keine echte Spotify-Anbindung.')}>
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(playlists).slice(0, 6).map(([moodKey, [playlist]]) => (
                  <Button key={moodKey} variant="outline" size="sm" className="capitalize">
                    {moodKey}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
