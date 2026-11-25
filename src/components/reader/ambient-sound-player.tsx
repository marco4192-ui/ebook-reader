'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const ambientSounds = [
  { id: 'rain', name: 'Regen', icon: '🌧️', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3' },
  { id: 'cafe', name: 'Café', icon: '☕', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_7c5e3d9a42.mp3' },
  { id: 'forest', name: 'Wald', icon: '🌲', url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_5f1f804c29.mp3' },
  { id: 'ocean', name: 'Ozean', icon: '🌊', url: 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_58b31b83c1.mp3' },
  { id: 'fire', name: 'Kaminfeuer', icon: '🔥', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39a0f9a0.mp3' },
];

export const AmbientSoundPlayer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = settings.ambientSoundVolume / 100;
  }, [settings.ambientSoundVolume]);

  const playSound = (soundId: string) => {
    const sound = ambientSounds.find(s => s.id === soundId);
    if (sound && audioRef.current) {
      audioRef.current.src = sound.url;
      audioRef.current.play().catch(() => toast.error('Audio konnte nicht abgespielt werden'));
      setIsPlaying(true);
      updateSettings({ ambientSoundType: soundId as any, ambientSoundEnabled: true });
    }
  };

  const stopSound = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
    updateSettings({ ambientSoundEnabled: false, ambientSoundType: 'none' });
  };

  const togglePlay = () => {
    if (isPlaying) stopSound();
    else if (settings.ambientSoundType !== 'none') playSound(settings.ambientSoundType);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[50vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Volume2 className="w-5 h-5" />Ambient Sounds</SheetTitle></SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-5 gap-3">
            {ambientSounds.map((sound) => (
              <button key={sound.id} onClick={() => playSound(sound.id)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${settings.ambientSoundType === sound.id ? 'border-primary bg-primary/10' : 'border-transparent bg-muted hover:bg-muted/80'}`}>
                <span className="text-2xl mb-2">{sound.icon}</span>
                <span className="text-xs font-medium">{sound.name}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Volume2 className="w-4 h-4" />Lautstärke: {settings.ambientSoundVolume}%</Label>
            <Slider value={[settings.ambientSoundVolume]} onValueChange={([value]) => updateSettings({ ambientSoundVolume: value })} max={100} step={5} />
          </div>
          <Button onClick={togglePlay} variant={isPlaying ? 'destructive' : 'default'} className="w-full">
            {isPlaying ? <><VolumeX className="w-4 h-4 mr-2" />Stopp</> : <><Volume2 className="w-4 h-4 mr-2" />Wiedergeben</>}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
