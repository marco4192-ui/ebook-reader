'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  ChevronLeft,
  Volume2,
  VolumeX,
  Check,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';

export const AudiobookPlayer = ({ book, onClose }: { book: Book; onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimeLeft, setSleepTimeLeft] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { updateBook } = useBookStore();

  // Initialize audio from book file
  useEffect(() => {
    if (!book.file) return;
    
    // Check if file is an audio format
    const isAudio = book.file.startsWith('data:audio') || 
                    book.file.endsWith('.mp3') || 
                    book.file.endsWith('.m4b') ||
                    book.file.endsWith('.m4a') ||
                    book.file.endsWith('.wav');
    
    if (isAudio) {
      audioRef.current = new Audio(book.file);
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [book.file]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          toast.error('Audio konnte nicht abgespielt werden');
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle playback rate change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sleep timer
  useEffect(() => {
    if (sleepTimeLeft === null || sleepTimeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setSleepTimeLeft((prev) => {
        if (prev && prev <= 1) {
          setIsPlaying(false);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [sleepTimeLeft]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(currentTime + 30, duration);
    }
    setCurrentTime(Math.min(currentTime + 30, duration));
  };
  
  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(currentTime - 15, 0);
    }
    setCurrentTime(Math.max(currentTime - 15, 0));
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const setSleep = (minutes: number) => {
    setSleepTimeLeft(minutes * 60);
    toast.info(`Sleep-Timer: ${minutes} Minuten`);
  };

  const formatAudioTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveProgress = () => {
    updateBook(book.id, { progress: (currentTime / duration) * 100 });
    toast.success('Fortschritt gespeichert!');
  };

  // Demo mode fallback if no audio file
  useEffect(() => {
    if (!audioRef.current && duration === 0) {
      setDuration(3600); // Demo: 1 hour
    }
  }, [duration]);

  // Demo playback simulation
  useEffect(() => {
    if (!audioRef.current && isPlaying) {
      const timer = setInterval(() => {
        setCurrentTime(t => Math.min(t + 1, duration));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, duration]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-background to-muted flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" onClick={onClose}><ChevronLeft className="w-5 h-5" /></Button>
        <div className="text-center flex-1">
          <h2 className="font-semibold truncate">{book.title}</h2>
          {book.author && <p className="text-sm text-muted-foreground">{book.author}</p>}
        </div>
        <Button variant="ghost" onClick={saveProgress}><Bookmark className="w-5 h-5" /></Button>
      </header>

      {/* Cover */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div animate={isPlaying ? { scale: [1, 1.02, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
          <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-2xl">
            {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full rounded-2xl object-cover" /> : <Headphones className="w-24 h-24 text-primary/40" />}
          </div>
        </motion.div>
      </div>

      {/* Sleep Timer Display */}
      {sleepTimeLeft !== null && (
        <div className="text-center text-sm text-muted-foreground">
          😴 Sleep-Timer: {formatAudioTime(sleepTimeLeft)}
          <Button variant="ghost" size="sm" onClick={() => setSleepTimeLeft(null)} className="ml-2">
            Abbrechen
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Slider 
            value={[currentTime]} 
            max={duration || 1} 
            step={1} 
            onValueChange={([v]) => seekTo(v)} 
            className="w-full" 
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatAudioTime(currentTime)}</span>
            <span>{formatAudioTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <Button variant="ghost" size="icon" onClick={skipBackward}>
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button size="lg" className="w-16 h-16 rounded-full" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={skipForward}>
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs text-muted-foreground">Speed:</span>
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <Button 
              key={rate} 
              variant={playbackRate === rate ? 'default' : 'outline'} 
              size="sm" 
              className="w-12 h-8 text-xs" 
              onClick={() => setPlaybackRate(rate)}
            >
              {rate}x
            </Button>
          ))}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 justify-center">
          <VolumeX className="w-4 h-4 text-muted-foreground" />
          <Slider 
            value={[volume * 100]} 
            max={100} 
            step={1} 
            onValueChange={([v]) => setVolume(v / 100)} 
            className="w-32" 
          />
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Sleep Timer Buttons */}
        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs text-muted-foreground mr-2">😴 Sleep:</span>
          {[5, 15, 30, 60].map((mins) => (
            <Button 
              key={mins} 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs" 
              onClick={() => setSleep(mins)}
            >
              {mins}min
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
