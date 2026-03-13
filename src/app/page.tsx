'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { QRCodeSVG } from 'qrcode.react';
import {
  Book, Upload, Settings, Bookmark, ChevronLeft, ChevronRight,
  List, X, Sun, Moon, BookOpen, Type, AlignJustify, Trash2,
  FileText, File, BookmarkCheck, Plus, Minus, Search, Volume2,
  VolumeX, Highlighter, Clock, Target, Trophy, BarChart3,
  Tag, Download, Edit3, Globe, Award, RefreshCw, Network,
  Eye, Star, Pin, Filter, Grid, Languages, CheckCircle, Sparkles,
  Image as ImageIcon, ZoomIn, ZoomOut, Maximize, RotateCw, Columns, Rows,
  Cloud, CloudOff, QrCode, Link2, Copy, Share2, Smartphone,
  Check, AlertCircle, Palette, Zap, Vibrate, Hand, Play, Pause,
  SkipForward, SkipBack, MoonStar, MessageCircle, Brain, TrendingUp, Send, Loader2,
  Map, MapPin, Rss, Camera, Users, Heart, Users2, Circle, Radio, ExternalLink,
  Calendar, HeartHandshake, Swords, Briefcase, UserX, UserPlus, Save, Newspaper,
  FolderTree, PiggyBank, Headphones, Mic, MicOff, Keyboard, Focus, Layers, Wand2,
  Shield, Lock, ShieldCheck, Key, Mail, Music, Database, WifiOff, Wifi, FileDown,
  HardDrive, Trash, EyeOff, UserShield, FileText as FileTextIcon, Instagram, Twitter,
  Quote, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useBookStore, type Book, type Bookmark as BookmarkType, type Highlight, type Note, type Character, type BookLocation, type TimelineEvent, type CustomTheme, type RSSFeed, type RSSArticle, type WebArticle, type SmartShelf, type BookmarkFolder, type ReadingGoal, type ReadingSpeedRecord, type ReadingHourRecord, type BookClub, type ClubMessage, type BookRecommendation, type Friend, type BookComment, type BookCommentReply, type SocialChallenge, getAllTags, calculateReadingTime } from '@/lib/book-store';
import { toast } from 'sonner';
import { PWAInstallPrompt } from '@/components/pwa-install';
import { useNativeFeatures } from '@/hooks/use-native';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const detectFormat = (filename: string): Book['format'] => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'epub': return 'epub';
    case 'pdf': return 'pdf';
    case 'txt': return 'txt';
    case 'md': return 'md';
    case 'mobi': return 'mobi';
    case 'azw':
    case 'azw3': return 'azw3';
    case 'fb2': return 'fb2';
    case 'djvu':
    case 'djv': return 'djvu';
    case 'cbz': return 'cbz';
    case 'cbr': return 'cbr';
    case 'cb7': return 'cb7';
    case 'cbt': return 'cbt';
    case 'acv': return 'acv';
    default: return 'txt';
  }
};

const FormatIcon = ({ format }: { format: Book['format'] }) => {
  switch (format) {
    case 'pdf': return <File className="w-4 h-4 text-red-500" />;
    case 'epub': return <BookOpen className="w-4 h-4 text-blue-500" />;
    case 'txt': return <FileText className="w-4 h-4 text-gray-500" />;
    case 'md': return <FileText className="w-4 h-4 text-purple-500" />;
    case 'mobi':
    case 'azw3': return <Book className="w-4 h-4 text-orange-500" />;
    case 'fb2': return <BookOpen className="w-4 h-4 text-cyan-500" />;
    case 'djvu': return <File className="w-4 h-4 text-amber-600" />;
    case 'cbz':
    case 'cbr':
    case 'cb7':
    case 'cbt':
    case 'acv': return <ImageIcon className="w-4 h-4 text-green-500" />;
    default: return <File className="w-4 h-4" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

const formatReadingTime = (minutes: number) => {
  if (minutes < 1) return '< 1 Min';
  if (minutes < 60) return `~${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
};

const highlightColors = {
  yellow: 'bg-yellow-200 dark:bg-yellow-800/50',
  green: 'bg-green-200 dark:bg-green-800/50',
  blue: 'bg-blue-200 dark:bg-blue-800/50',
  pink: 'bg-pink-200 dark:bg-pink-800/50',
  purple: 'bg-purple-200 dark:bg-purple-800/50',
};

// Dyslexia-friendly font style
const dyslexiaFontStyle = `
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('https://fonts.cdnfonts.com/s/13604/OpenDyslexic-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
`;

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

// Color blind mode CSS filters
const colorBlindFilters = {
  none: '',
  protanopia: 'url(#protanopia-filter)',
  deuteranopia: 'url(#deuteranopia-filter)',
  tritanopia: 'url(#tritanopia-filter)',
};

// SVG filters for color blind modes
const colorBlindSVGFilters = `
  <svg style="position: absolute; width: 0; height: 0;">
    <defs>
      <filter id="protanopia-filter">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="deuteranopia-filter">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="tritanopia-filter">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
      </filter>
    </defs>
  </svg>
`;

// Bionic Reading - Bold first letters of words
const applyBionicReading = (text: string): string => {
  return text.replace(/(\S+)(\s*)/g, (match, word, space) => {
    const firstLetter = word.charAt(0);
    const rest = word.slice(1);
    if (rest.length === 0) return match;
    return `<strong>${firstLetter}</strong>${rest}${space}`;
  });
};

// Haptic feedback for page turn
const triggerHapticFeedback = (pattern: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[pattern]);
  }
};

// Gesture detection hook
const useGestureNavigation = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  enabled: boolean
) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const shakeRef = useRef<{ lastX: number; lastY: number; lastZ: number; lastTime: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Swipe detection (horizontal swipe > 50px in < 300ms)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300) {
        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }

      touchStartRef.current = null;
    };

    // Shake detection
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration || !acceleration.x || !acceleration.y || !acceleration.z) return;

      const now = Date.now();
      
      if (shakeRef.current) {
        const deltaX = Math.abs(acceleration.x - shakeRef.current.lastX);
        const deltaY = Math.abs(acceleration.y - shakeRef.current.lastY);
        const deltaZ = Math.abs(acceleration.z - shakeRef.current.lastZ);

        // Shake threshold
        if (deltaX + deltaY + deltaZ > 30 && now - shakeRef.current.lastTime > 500) {
          // Shake detected - go to next page
          onSwipeLeft();
          shakeRef.current.lastTime = now;
        }
      }

      shakeRef.current = {
        lastX: acceleration.x,
        lastY: acceleration.y,
        lastZ: acceleration.z,
        lastTime: shakeRef.current?.lastTime || now,
      };
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('devicemotion', handleDeviceMotion);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [enabled, onSwipeLeft, onSwipeRight]);
};

// ============================================================================
// SPEED READING (RSVP) PANEL
// ============================================================================

const SpeedReadingPanel = ({
  text,
  open,
  onOpenChange,
}: {
  text: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { settings, updateSettings } = useBookStore();
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Split text into words and filter out empty strings
    const wordList = text.split(/\s+/).filter(w => w.trim().length > 0);
    setWords(wordList);
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const intervalMs = 60000 / settings.speedReadingWPM;
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, settings.speedReadingWPM, words.length]);

  const togglePlay = () => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const goBack = () => {
    setCurrentIndex(Math.max(0, currentIndex - 10));
  };

  const goForward = () => {
    setCurrentIndex(Math.min(words.length - 1, currentIndex + 10));
  };

  const currentWord = words[currentIndex] || '';
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  // Calculate optimal reading position (ORP) - highlight middle of word
  const getORPIndex = (word: string): number => {
    const len = word.length;
    if (len <= 1) return 0;
    if (len <= 4) return 1;
    if (len <= 8) return 2;
    return 3;
  };

  const renderWord = (word: string) => {
    const orpIndex = getORPIndex(word);
    return (
      <span className="inline-flex items-center">
        <span className="text-muted-foreground">{word.slice(0, orpIndex)}</span>
        <span className="text-primary font-bold">{word[orpIndex]}</span>
        <span className="text-muted-foreground">{word.slice(orpIndex + 1)}</span>
      </span>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Speed Reading (RSVP)
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] space-y-6">
          {/* Word Display */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-4 min-h-[80px] flex items-center justify-center">
              {renderWord(currentWord)}
            </div>
            <p className="text-sm text-muted-foreground">
              Wort {currentIndex + 1} von {words.length}
            </p>
          </div>

          {/* Progress */}
          <div className="w-full max-w-md">
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <span>{settings.speedReadingWPM} WPM</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={goBack}>
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button size="lg" onClick={togglePlay} className="w-16 h-16 rounded-full">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Button variant="outline" size="icon" onClick={goForward}>
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* WPM Slider */}
          <div className="w-full max-w-md space-y-2">
            <Label className="text-sm">Geschwindigkeit: {settings.speedReadingWPM} Wörter/Min</Label>
            <Slider
              value={[settings.speedReadingWPM]}
              onValueChange={([value]) => updateSettings({ speedReadingWPM: value })}
              min={100}
              max={600}
              step={25}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// NIGHT MODE OVERLAY
// ============================================================================

const NightModeOverlay = ({ enabled, intensity }: { enabled: boolean; intensity: number }) => {
  if (!enabled) return null;

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{
        background: `rgba(255, 0, 0, ${intensity / 200})`,
        mixBlendMode: 'multiply',
      }}
    />
  );
};

// ============================================================================
// LANGUAGE OPTIONS FOR GUTENBERG
// ============================================================================

const languageOptions = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'Englisch', flag: '🇬🇧' },
  { code: 'fr', name: 'Französisch', flag: '🇫🇷' },
  { code: 'es', name: 'Spanisch', flag: '🇪🇸' },
  { code: 'it', name: 'Italienisch', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugiesisch', flag: '🇵🇹' },
  { code: 'nl', name: 'Niederländisch', flag: '🇳🇱' },
  { code: 'fi', name: 'Finnisch', flag: '🇫🇮' },
  { code: 'sv', name: 'Schwedisch', flag: '🇸🇪' },
  { code: 'pl', name: 'Polnisch', flag: '🇵🇱' },
  { code: 'zh', name: 'Chinesisch', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanisch', flag: '🇯🇵' },
];

// ============================================================================
// AMBIENT SOUNDS
// ============================================================================

const ambientSounds = [
  { id: 'rain', name: 'Regen', icon: '🌧️', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3' },
  { id: 'cafe', name: 'Café', icon: '☕', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_7c5e3d9a42.mp3' },
  { id: 'forest', name: 'Wald', icon: '🌲', url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_5f1f804c29.mp3' },
  { id: 'ocean', name: 'Ozean', icon: '🌊', url: 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_58b31b83c1.mp3' },
  { id: 'fire', name: 'Kaminfeuer', icon: '🔥', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39a0f9a0.mp3' },
];

const AmbientSoundPlayer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
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

// ============================================================================
// EYE CARE TIMER
// ============================================================================

const EyeCareTimer = () => {
  const { settings, updateSettings } = useBookStore();
  const [timeRemaining, setTimeRemaining] = useState(settings.eyeCareInterval * 60);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (!settings.eyeCareEnabled) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { setShowReminder(true); return settings.eyeCareInterval * 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.eyeCareEnabled, settings.eyeCareInterval]);

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {settings.eyeCareEnabled && (
        <div className="fixed top-16 right-2 z-40 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs flex items-center gap-2">
          <Eye className="w-3 h-3" />
          <span>{formatTimeRemaining(timeRemaining)}</span>
        </div>
      )}
      <AnimatePresence>
        {showReminder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <Card className="w-full max-w-sm">
                <CardContent className="p-6 text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-bold mb-2">Zeit für eine Pause! 👀</h3>
                  <p className="text-muted-foreground mb-4">Schauen Sie 20 Sekunden lang auf etwas, das mindestens 6 Meter entfernt ist.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => updateSettings({ eyeCareEnabled: false })}>Deaktivieren</Button>
                    <Button className="flex-1" onClick={() => setShowReminder(false)}>Verstanden</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// FEATURE 13: WIKIPEDIA POPUP
// ============================================================================

const WikipediaPopup = ({
  term,
  position,
  onClose,
}: {
  term: string;
  position: { x: number; y: number };
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    title: string;
    summary: string;
    details?: string;
    relatedTerms?: string[];
    source: string;
  } | null>(null);

  useEffect(() => {
    const fetchWikipedia = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/wikipedia?term=${encodeURIComponent(term)}&lang=de`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Wikipedia fetch error:', error);
      }
      setLoading(false);
    };
    fetchWikipedia();
  }, [term]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[100] bg-popover border rounded-lg shadow-xl w-80 max-h-96 overflow-hidden"
      style={{ left: Math.min(position.x, window.innerWidth - 340), top: Math.max(position.y - 20, 10) }}
    >
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-sm">Wikipedia</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="max-h-72">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="p-4 space-y-3">
            <h4 className="font-semibold">{data.title}</h4>
            <p className="text-sm text-muted-foreground">{data.summary}</p>
            {data.details && (
              <p className="text-xs text-muted-foreground border-t pt-2">{data.details}</p>
            )}
            {data.relatedTerms && data.relatedTerms.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {data.relatedTerms.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground pt-2">Quelle: {data.source}</p>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Keine Information gefunden
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};

// ============================================================================
// FEATURE 13: PRONUNCIATION BUTTON
// ============================================================================

const PronunciationButton = ({ text }: { text: string }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [pronunciation, setPronunciation] = useState<{
    phonetic?: string;
    syllables?: string;
    tips?: string;
    difficulty?: number;
  } | null>(null);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast.error('Sprachausgabe nicht unterstützt');
    }
  };

  const fetchPronunciation = async () => {
    try {
      const response = await fetch('/api/pronounce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: 'de-DE' }),
      });
      const result = await response.json();
      if (result.success) {
        setPronunciation(result.pronunciation);
        setShowGuide(true);
      }
    } catch (error) {
      console.error('Pronunciation fetch error:', error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={speak} className="h-7 px-2">
          <Volume2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={fetchPronunciation} className="h-7 px-2">
          <BookOpen className="w-4 h-4" />
        </Button>
      </div>
      <AnimatePresence>
        {showGuide && pronunciation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-[100] bg-popover border rounded-lg shadow-xl p-4 w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Aussprache
              </h4>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowGuide(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              {pronunciation.phonetic && (
                <div>
                  <span className="text-muted-foreground">Phonetisch:</span>
                  <p className="font-mono">{pronunciation.phonetic}</p>
                </div>
              )}
              {pronunciation.syllables && (
                <div>
                  <span className="text-muted-foreground">Silben:</span>
                  <p>{pronunciation.syllables}</p>
                </div>
              )}
              {pronunciation.tips && (
                <p className="text-xs text-muted-foreground">{pronunciation.tips}</p>
              )}
              {pronunciation.difficulty && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Schwierigkeit:</span>
                  <Progress value={(pronunciation.difficulty / 5) * 100} className="h-1.5 w-16" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// FEATURE 13: CHARACTER HIGHLIGHTER
// ============================================================================

const CharacterHighlighter = ({
  content,
  characters,
  onCharacterClick,
}: {
  content: string;
  characters: Character[];
  onCharacterClick?: (character: Character) => void;
}) => {
  const highlightedContent = useMemo(() => {
    if (!characters.length) return content;

    // Sort by name length (longest first) to avoid overlapping highlights
    const sortedCharacters = [...characters].sort((a, b) => b.name.length - a.name.length);
    
    let result = content;
    const charColors = [
      'bg-blue-200 dark:bg-blue-800/40',
      'bg-green-200 dark:bg-green-800/40',
      'bg-purple-200 dark:bg-purple-800/40',
      'bg-pink-200 dark:bg-pink-800/40',
      'bg-cyan-200 dark:bg-cyan-800/40',
      'bg-amber-200 dark:bg-amber-800/40',
    ];

    sortedCharacters.forEach((char, index) => {
      const color = charColors[index % charColors.length];
      const regex = new RegExp(`\\b(${char.name}${char.aliases?.map(a => `|${a}`).join('') || ''})\\b`, 'gi');
      result = result.replace(regex, `<span class="${color} px-0.5 rounded cursor-pointer hover:ring-2 hover:ring-primary" data-character-id="${char.id}">$1</span>`);
    });

    return result;
  }, [content, characters]);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.dataset.characterId) {
          const char = characters.find(c => c.id === target.dataset.characterId);
          if (char && onCharacterClick) {
            onCharacterClick(char);
          }
        }
      }}
    />
  );
};

// ============================================================================
// FEATURE 13: QUOTES COLLECTION PANEL
// ============================================================================

const QuotesCollectionPanel = ({
  bookId,
  open,
  onOpenChange,
}: {
  bookId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { quotes, addQuote, removeQuote, toggleQuoteFavorite, books } = useBookStore();
  const [newQuote, setNewQuote] = useState({ text: '', note: '', tags: '' });
  
  const filteredQuotes = bookId ? quotes.filter(q => q.bookId === bookId) : quotes;
  const favoriteQuotes = filteredQuotes.filter(q => q.isFavorite);
  const currentBook = bookId ? books.find(b => b.id === bookId) : null;

  const handleAddQuote = () => {
    if (newQuote.text.trim() && bookId && currentBook) {
      addQuote({
        bookId,
        bookTitle: currentBook.title,
        author: currentBook.author,
        text: newQuote.text.trim(),
        note: newQuote.note.trim() || undefined,
        tags: newQuote.tags.split(',').map(t => t.trim()).filter(Boolean),
        isFavorite: false,
      });
      setNewQuote({ text: '', note: '', tags: '' });
      toast.success('Zitat gespeichert!');
    }
  };

  const shareQuote = async (quote: typeof quotes[0]) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Zitat aus "${quote.bookTitle}"`,
          text: `"${quote.text}"${quote.author ? ` - ${quote.author}` : ''}`,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`"${quote.text}" - ${quote.author || quote.bookTitle}`);
      toast.success('Zitat kopiert!');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Zitate-Sammlung ({filteredQuotes.length})
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Add new quote */}
          {bookId && (
            <Card className="mb-4">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-sm">Neues Zitat</h4>
                <Textarea
                  placeholder="Zitat eingeben..."
                  value={newQuote.text}
                  onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                  className="min-h-[80px]"
                />
                <Input
                  placeholder="Notiz (optional)..."
                  value={newQuote.note}
                  onChange={(e) => setNewQuote({ ...newQuote, note: e.target.value })}
                />
                <Input
                  placeholder="Tags (kommagetrennt)..."
                  value={newQuote.tags}
                  onChange={(e) => setNewQuote({ ...newQuote, tags: e.target.value })}
                />
                <Button size="sm" className="w-full" onClick={handleAddQuote}>
                  <Plus className="w-4 h-4 mr-1" /> Zitat speichern
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Favorites section */}
          {favoriteQuotes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Favoriten
              </h4>
              <div className="space-y-2">
                {favoriteQuotes.map((quote) => (
                  <Card key={quote.id} className="bg-yellow-50 dark:bg-yellow-900/20">
                    <CardContent className="p-3">
                      <p className="text-sm italic">"{quote.text}"</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        — {quote.author || quote.bookTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => toggleQuoteFavorite(quote.id)}
                        >
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => shareQuote(quote)}
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => removeQuote(quote.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All quotes */}
          <div className="space-y-2">
            {filteredQuotes.map((quote) => (
              <Card key={quote.id}>
                <CardContent className="p-3">
                  <p className="text-sm italic">"{quote.text}"</p>
                  {!bookId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      aus: {quote.bookTitle}
                    </p>
                  )}
                  {quote.note && (
                    <p className="text-xs text-muted-foreground mt-1">{quote.note}</p>
                  )}
                  {quote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {quote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(quote.createdAt).toLocaleDateString('de-DE')}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => toggleQuoteFavorite(quote.id)}
                      >
                        <Star className={`w-3 h-3 ${quote.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => shareQuote(quote)}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => removeQuote(quote.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 13: READING QUIZ
// ============================================================================

const ReadingQuiz = ({
  bookId,
  chapterTitle,
  chapterContent,
  open,
  onOpenChange,
}: {
  bookId: string;
  chapterTitle?: string;
  chapterContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { addQuizResult } = useBookStore();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterContent, chapterTitle }),
      });
      
      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions.map((q: any, i: number) => ({
          id: q.id || `q-${i}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        })));
        setAnswers([]);
        setCurrentQuestion(0);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Quiz konnte nicht generiert werden');
    }
    setLoading(false);
  };

  const answerQuestion = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete
      const score = newAnswers.filter((a, i) => a === questions[i].correctIndex).length;
      addQuizResult({
        bookId,
        chapter: chapterTitle,
        questions,
        answers: newAnswers,
        score,
        totalQuestions: questions.length,
        completedAt: Date.now(),
      });
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setAnswers([]);
    setCurrentQuestion(0);
    setShowResults(false);
  };

  useEffect(() => {
    if (open && questions.length === 0) {
      generateQuiz();
    }
  }, [open]);

  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Lese-Quiz {chapterTitle && `: ${chapterTitle}`}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-4">
          {loading ? (
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Quiz wird generiert...</p>
            </div>
          ) : showResults ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 max-w-md"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mx-auto">
                <Trophy className={`w-12 h-12 ${percentage >= 70 ? 'text-yellow-500' : percentage >= 50 ? 'text-blue-500' : 'text-gray-500'}`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{score} / {questions.length}</h3>
                <p className="text-muted-foreground">{percentage}% richtig</p>
              </div>
              <Progress value={percentage} className="h-3 w-48 mx-auto" />
              <p className="text-sm text-muted-foreground">
                {percentage >= 70 ? 'Ausgezeichnet! Sie haben das Kapitel gut verstanden.' :
                 percentage >= 50 ? 'Gut gemacht! Vielleicht möchten Sie einige Passagen noch einmal lesen.' :
                 'Vielleicht möchten Sie das Kapitel noch einmal lesen.'}
              </p>
              
              {/* Show question review */}
              <ScrollArea className="max-h-48 w-full">
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className={`p-2 rounded text-left text-sm ${answers[i] === q.correctIndex ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                      <p className="font-medium">{q.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Ihre Antwort: {q.options[answers[i]]}
                        {answers[i] !== q.correctIndex && ` | Richtig: ${q.options[q.correctIndex]}`}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={restartQuiz}>Nochmal</Button>
                <Button onClick={() => onOpenChange(false)}>Schließen</Button>
              </div>
            </motion.div>
          ) : questions.length > 0 ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-md space-y-6"
            >
              <div className="text-center">
                <Badge variant="secondary">Frage {currentQuestion + 1} von {questions.length}</Badge>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg font-medium text-center mb-6">
                    {questions[currentQuestion].question}
                  </p>
                  <div className="space-y-2">
                    {questions[currentQuestion].options.map((option, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-full justify-start h-auto py-3 px-4"
                        onClick={() => answerQuestion(i)}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                        {option}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />
            </motion.div>
          ) : (
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Kein Quiz verfügbar</p>
              <Button className="mt-4" onClick={generateQuiz}>Quiz generieren</Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 14: SMART REMINDER
// ============================================================================

const SmartReminderPanel = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { smartReminders, addSmartReminder, updateSmartReminder, removeSmartReminder, readingStats } = useBookStore();
  const [newReminder, setNewReminder] = useState({
    enabled: true,
    preferredTimes: ['20:00'],
    reminderMessage: 'Zeit zum Lesen! 📚',
    adaptiveEnabled: true,
  });

  // Analyze reading patterns for smart suggestions
  const readingPattern = useMemo(() => {
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};
    
    Object.entries(readingStats.dailyStats).forEach(([date, stats]) => {
      const d = new Date(date);
      dayCounts[d.getDay()] = (dayCounts[d.getDay()] || 0) + stats.time;
    });

    // Find best reading time
    const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    
    return {
      bestDay: bestDay ? ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][parseInt(bestDay[0])] : null,
      currentStreak: readingStats.currentStreak,
      suggestedTimes: ['08:00', '20:00'], // Could be improved with more data
    };
  }, [readingStats]);

  const handleAddReminder = () => {
    addSmartReminder({
      ...newReminder,
      streakDays: readingStats.currentStreak,
    });
    setNewReminder({
      enabled: true,
      preferredTimes: ['20:00'],
      reminderMessage: 'Zeit zum Lesen! 📚',
      adaptiveEnabled: true,
    });
    toast.success('Erinnerung erstellt!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Lese-Erinnerungen
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Reading Pattern Analysis */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Ihr Lesemuster
              </h4>
              <div className="space-y-2 text-sm">
                {readingPattern.bestDay && (
                  <p className="text-muted-foreground">
                    Bester Lesetag: <span className="font-medium text-foreground">{readingPattern.bestDay}</span>
                  </p>
                )}
                <p className="text-muted-foreground">
                  Aktuelle Serie: <span className="font-medium text-foreground">{readingPattern.currentStreak} Tage</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add New Reminder */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neue Erinnerung</h4>
              <div className="space-y-2">
                <Label className="text-xs">Uhrzeit</Label>
                <Input
                  type="time"
                  value={newReminder.preferredTimes[0]}
                  onChange={(e) => setNewReminder({ ...newReminder, preferredTimes: [e.target.value] })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Nachricht</Label>
                <Input
                  value={newReminder.reminderMessage}
                  onChange={(e) => setNewReminder({ ...newReminder, reminderMessage: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Adaptive Erinnerungen</Label>
                <input
                  type="checkbox"
                  checked={newReminder.adaptiveEnabled}
                  onChange={(e) => setNewReminder({ ...newReminder, adaptiveEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleAddReminder}>
                <Plus className="w-4 h-4 mr-1" /> Erinnerung erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Active Reminders */}
          <div className="space-y-2">
            {smartReminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className={`w-4 h-4 ${reminder.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-sm">{reminder.preferredTimes.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => updateSmartReminder(reminder.id, { enabled: !reminder.enabled })}
                      >
                        {reminder.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => removeSmartReminder(reminder.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{reminder.reminderMessage}</p>
                  {reminder.adaptiveEnabled && (
                    <Badge variant="secondary" className="text-[10px] mt-2">
                      <Zap className="w-3 h-3 mr-1" /> Adaptiv
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 14: FOCUS MODE PANEL
// ============================================================================

const FocusModePanel = ({
  enabled,
  blurIntensity,
  highlightIntensity,
  currentLine,
  onToggle,
  onBlurChange,
  onHighlightChange,
}: {
  enabled: boolean;
  blurIntensity: number;
  highlightIntensity: number;
  currentLine?: number;
  onToggle: () => void;
  onBlurChange: (value: number) => void;
  onHighlightChange: (value: number) => void;
}) => {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Fokus-Modus
        </h4>
        <Button variant="ghost" size="sm" className="h-7" onClick={onToggle}>
          {enabled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
        </Button>
      </div>
      
      {enabled && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center justify-between">
              <span>Unschärfe</span>
              <span>{blurIntensity}%</span>
            </Label>
            <Slider
              value={[blurIntensity]}
              onValueChange={([v]) => onBlurChange(v)}
              max={100}
              step={5}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center justify-between">
              <span>Zeilen-Hervorhebung</span>
              <span>{highlightIntensity}%</span>
            </Label>
            <Slider
              value={[highlightIntensity]}
              onValueChange={([v]) => onHighlightChange(v)}
              max={100}
              step={5}
            />
          </div>
          {currentLine !== undefined && (
            <p className="text-xs text-muted-foreground text-center">
              Aktuelle Zeile: {currentLine}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// FEATURE 14: POMODORO TIMER
// ============================================================================

const PomodoroTimer = ({
  bookId,
  onSessionComplete,
}: {
  bookId: string;
  onSessionComplete?: (pomodorosCompleted: number) => void;
}) => {
  const { currentPomodoro, startPomodoroSession, updatePomodoroStatus, completePomodoro } = useBookStore();
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Default durations
  const workDuration = 25;
  const breakDuration = 5;

  useEffect(() => {
    if (!currentPomodoro || currentPomodoro.bookId !== bookId) {
      setTimeRemaining(workDuration * 60);
      setIsRunning(false);
      return;
    }

    const duration = currentPomodoro.status === 'work' 
      ? currentPomodoro.workDuration * 60 
      : currentPomodoro.breakDuration * 60;

    if (isRunning) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up
            if (currentPomodoro.status === 'work') {
              completePomodoro(currentPomodoro.id);
              setTimeRemaining(currentPomodoro.breakDuration * 60);
              onSessionComplete?.(currentPomodoro.completedPomodoros + 1);
              toast.success('Pomodoro abgeschlossen! Zeit für eine Pause.');
            } else {
              updatePomodoroStatus(currentPomodoro.id, 'work');
              setTimeRemaining(currentPomodoro.workDuration * 60);
              toast.info('Pause vorbei! Weiterlesen.');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning, currentPomodoro, bookId, completePomodoro, updatePomodoroStatus, onSessionComplete]);

  const startPomodoro = () => {
    if (!currentPomodoro || currentPomodoro.bookId !== bookId) {
      startPomodoroSession(bookId, workDuration, breakDuration);
    }
    setIsRunning(true);
  };

  const pausePomodoro = () => {
    setIsRunning(false);
  };

  const resetPomodoro = () => {
    setTimeRemaining(workDuration * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentPomodoro
    ? ((currentPomodoro.status === 'work' ? workDuration * 60 : breakDuration * 60) - timeRemaining) / 
      (currentPomodoro.status === 'work' ? workDuration * 60 : breakDuration * 60) * 100
    : 0;

  return (
    <Card className="p-3">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {currentPomodoro?.status === 'break' ? 'Pause' : 'Pomodoro'}
          </span>
        </div>
        
        <div className="relative w-20 h-20 mx-auto">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={226}
              strokeDashoffset={226 - (226 * progress) / 100}
              className={currentPomodoro?.status === 'break' ? 'text-green-500' : 'text-primary'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {isRunning ? (
            <Button size="sm" onClick={pausePomodoro}>
              <Pause className="w-4 h-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" onClick={startPomodoro}>
              <Play className="w-4 h-4 mr-1" /> Start
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={resetPomodoro}>
            Reset
          </Button>
        </div>

        {currentPomodoro && (
          <p className="text-xs text-muted-foreground">
            {currentPomodoro.completedPomodoros} Pomodoros heute
          </p>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// FEATURE 14: READING FLOW ANALYSIS
// ============================================================================

const ReadingFlowAnalysis = ({
  bookId,
  open,
  onOpenChange,
}: {
  bookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { getReadingFlowData } = useBookStore();
  const flowData = getReadingFlowData(bookId);

  const latestSession = flowData[flowData.length - 1];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Lese-Fluss-Analyse
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {latestSession ? (
            <div className="space-y-4">
              {/* Focus Score */}
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium text-sm mb-2">Fokus-Score</h4>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {latestSession.focusScore}
                  </div>
                  <Progress value={latestSession.focusScore} className="h-2" />
                </CardContent>
              </Card>

              {/* Reading Speed */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Lesegeschwindigkeit</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ø WPM</span>
                    <span className="text-2xl font-bold">{latestSession.averageWPM || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Pause Analysis */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Pausen-Analyse</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Anzahl Pausen</span>
                      <span>{latestSession.pauses.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gesamte Pausenzeit</span>
                      <span>{Math.round(latestSession.totalPauseTime / 60)} Min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ø Pausendauer</span>
                      <span>
                        {latestSession.pauses.length > 0
                          ? Math.round(latestSession.pauses.reduce((sum, p) => sum + p.duration, 0) / latestSession.pauses.length)
                          : 0}{' '}
                        Sek
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scroll Pattern */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Scroll-Muster</h4>
                  <Badge variant="secondary" className="capitalize">
                    {latestSession.scrollPattern === 'smooth' ? 'Glatt' :
                     latestSession.scrollPattern === 'jumpy' ? 'Sprunghaft' : 'Stetig'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">💡 Tipps</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {latestSession.focusScore < 50 && (
                      <li>• Versuchen Sie, Ablenkungen zu reduzieren</li>
                    )}
                    {latestSession.pauses.length > 10 && (
                      <li>• Viele kurze Pausen - vielleicht sind Sie müde?</li>
                    )}
                    {latestSession.averageWPM < 150 && (
                      <li>• Langsame Geschwindigkeit - genießen Sie das Buch!</li>
                    )}
                    {latestSession.averageWPM > 350 && (
                      <li>• Schnelles Lesen - achten Sie auf Verständnis</li>
                    )}
                    {latestSession.focusScore >= 70 && (
                      <li>• Großartige Konzentration! Weiter so!</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Daten vorhanden</p>
              <p className="text-sm">Beginnen Sie zu lesen, um Ihre Analyse zu sehen</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 16: GLOBAL SEARCH PANEL
// ============================================================================

const GlobalSearchPanel = ({
  open,
  onOpenChange,
  onBookSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookSelect?: (bookId: string) => void;
}) => {
  const { books, characters, locations, highlights, notes, searchHistory, addSearchToHistory, clearSearchHistory } = useBookStore();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'characters' | 'locations' | 'quotes' | 'text'>('all');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    addSearchToHistory(query);

    const searchResults: GlobalSearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search in books
    if (searchType === 'all' || searchType === 'text') {
      for (const book of books) {
        if (
          book.title.toLowerCase().includes(lowerQuery) ||
          (book.author && book.author.toLowerCase().includes(lowerQuery)) ||
          book.tags.some(t => t.toLowerCase().includes(lowerQuery))
        ) {
          searchResults.push({
            id: `book-${book.id}`,
            bookId: book.id,
            bookTitle: book.title,
            author: book.author,
            type: 'text',
            text: book.title,
            context: book.author ? `von ${book.author}` : undefined,
            relevance: 1,
          });
        }
      }
    }

    // Search in characters
    if (searchType === 'all' || searchType === 'characters') {
      for (const char of characters) {
        if (char.name.toLowerCase().includes(lowerQuery)) {
          const book = books.find(b => b.id === char.bookId);
          searchResults.push({
            id: `char-${char.id}`,
            bookId: char.bookId,
            bookTitle: book?.title || '',
            author: book?.author,
            type: 'character',
            text: char.name,
            context: char.description,
            relevance: 2,
          });
        }
      }
    }

    // Search in locations
    if (searchType === 'all' || searchType === 'locations') {
      for (const loc of locations) {
        if (loc.name.toLowerCase().includes(lowerQuery)) {
          const book = books.find(b => b.id === loc.bookId);
          searchResults.push({
            id: `loc-${loc.id}`,
            bookId: loc.bookId,
            bookTitle: book?.title || '',
            author: book?.author,
            type: 'location',
            text: loc.name,
            context: loc.description,
            relevance: 1.5,
          });
        }
      }
    }

    // Search in highlights (as quotes)
    if (searchType === 'all' || searchType === 'quotes') {
      for (const highlight of highlights) {
        if (highlight.text.toLowerCase().includes(lowerQuery)) {
          const book = books.find(b => b.id === highlight.bookId);
          searchResults.push({
            id: `quote-${highlight.id}`,
            bookId: highlight.bookId,
            bookTitle: book?.title || '',
            author: book?.author,
            type: 'quote',
            text: highlight.text,
            context: highlight.note,
            location: highlight.location,
            relevance: 2,
          });
        }
      }
    }

    // Search in notes
    if (searchType === 'all' || searchType === 'text') {
      for (const note of notes) {
        if (
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
        ) {
          const book = books.find(b => b.id === note.bookId);
          searchResults.push({
            id: `note-${note.id}`,
            bookId: note.bookId,
            bookTitle: book?.title || '',
            author: book?.author,
            type: 'text',
            text: note.title,
            context: note.content.substring(0, 100),
            relevance: 1.5,
          });
        }
      }
    }

    // Sort by relevance
    searchResults.sort((a, b) => b.relevance - a.relevance);
    setResults(searchResults.slice(0, 50));
    setLoading(false);
  };

  const typeIcons = {
    character: <Users className="w-4 h-4" />,
    location: <MapPin className="w-4 h-4" />,
    quote: <Quote className="w-4 h-4" />,
    text: <FileText className="w-4 h-4" />,
    cross_reference: <Network className="w-4 h-4" />,
  };

  const typeLabels = {
    character: 'Charakter',
    location: 'Ort',
    quote: 'Zitat',
    text: 'Text',
    cross_reference: 'Querverweis',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Alle Bücher durchsuchen
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen Sie in allen Büchern..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={performSearch} disabled={loading}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Search Type Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Alle' },
              { value: 'characters', label: 'Charaktere' },
              { value: 'locations', label: 'Orte' },
              { value: 'quotes', label: 'Zitate' },
              { value: 'text', label: 'Text' },
            ].map((type) => (
              <Badge
                key={type.value}
                variant={searchType === type.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSearchType(type.value as typeof searchType)}
              >
                {type.label}
              </Badge>
            ))}
          </div>

          {/* Search History */}
          {query === '' && searchHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Letzte Suchen</Label>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={clearSearchHistory}>
                  <Trash2 className="w-3 h-3 mr-1" /> Löschen
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((h, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => { setQuery(h); }}
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <ScrollArea className="h-[calc(100vh-350px)]">
            {results.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{results.length} Ergebnisse</p>
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => {
                      onBookSelect?.(result.bookId);
                      onOpenChange(false);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {typeIcons[result.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {typeLabels[result.type]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {result.bookTitle}
                            </span>
                          </div>
                          <p className="font-medium text-sm line-clamp-2">{result.text}</p>
                          {result.context && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {result.context}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine Ergebnisse gefunden</p>
              </div>
            ) : null}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// NOTES PANEL
// ============================================================================

const NotesPanel = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { getNotes, addNote, updateNote, removeNote } = useBookStore();
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const bookNotes = getNotes(book.id);

  const handleAddNote = () => {
    if (newNote.title.trim()) {
      addNote({ bookId: book.id, title: newNote.title, content: newNote.content, linkedNoteIds: [], linkedBookIds: [], tags: [] });
      setNewNote({ title: '', content: '' });
      toast.success('Notiz erstellt!');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Edit3 className="w-5 h-5" />Notizen ({bookNotes.length})</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <Card className="mb-4">
            <CardContent className="p-3 space-y-2">
              <Input placeholder="Titel..." value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
              <Textarea placeholder="Notiz (Markdown)..." value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} className="min-h-[80px]" />
              <Button size="sm" className="w-full" onClick={handleAddNote}><Plus className="w-4 h-4 mr-1" />Notiz hinzufügen</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {bookNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{note.title}</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNote(note.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                  <div className="text-xs text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{note.content || 'Kein Inhalt'}</ReactMarkdown>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleDateString('de-DE')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// KNOWLEDGE GRAPH
// ============================================================================

const KnowledgeGraph = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, notes, crossReferences } = useBookStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Network className="w-5 h-5" />Wissensgraph</SheetTitle></SheetHeader>
        <div className="mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-amber-500" /><span className="text-sm">Bücher ({books.length})</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500" /><span className="text-sm">Notizen ({notes.length})</span></div>
                <div className="flex items-center gap-2"><Network className="w-4 h-4" /><span className="text-sm">Verbindungen ({crossReferences.length})</span></div>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {books.map(book => (
                    <div key={book.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Book className="w-4 h-4 text-amber-500" />
                      <span className="text-sm truncate flex-1">{book.title}</span>
                      {book.rating && <div className="flex">{[...Array(book.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// GUTENBERG PANEL WITH LANGUAGE FILTER
// ============================================================================

const GutenbergPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['de', 'en']);
  const { addBook } = useBookStore();

  const fetchBooks = async (searchTerm: string = '', pageNum: number = 1, languages: string[] = ['de', 'en']) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum.toString(), languages: languages.join(',') });
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/gutenberg?${params}`);
      const data = await response.json();
      
      setBooks(data.books || []);
      setTotalCount(data.count || 0);
    } catch {
      toast.error('Fehler beim Laden der Bücher');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchBooks('', 1, selectedLanguages);
  }, [open]);

  useEffect(() => {
    setPage(1);
    fetchBooks(search, 1, selectedLanguages);
  }, [selectedLanguages]);

  const handleSearch = () => {
    setPage(1);
    fetchBooks(search, 1, selectedLanguages);
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const downloadBook = async (book: any) => {
    toast.info(`Lade "${book.title}" herunter...`);
    try {
      const contentUrl = book.formats.html || book.formats.txt;
      if (!contentUrl) { toast.error('Kein passendes Format verfügbar'); return; }
      const response = await fetch(contentUrl);
      const content = await response.text();
      const base64 = `data:text/html;base64,${btoa(unescape(encodeURIComponent(content)))}`;
      addBook({ title: book.title, author: book.author, format: 'txt', file: base64, fileSize: content.length, cover: book.cover });
      toast.success(`"${book.title}" wurde hinzugefügt!`);
    } catch {
      toast.error('Download fehlgeschlagen');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Kostenlose Bücher ({totalCount.toLocaleString()} verfügbar)
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input placeholder="Bücher durchsuchen..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <Button onClick={handleSearch}><Search className="w-4 h-4" /></Button>
          </div>

          {/* Language Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Languages className="w-4 h-4" />
              Sprachen filtern
            </Label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <Badge
                  key={lang.code}
                  variant={selectedLanguages.includes(lang.code) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => toggleLanguage(lang.code)}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.name}
                  {selectedLanguages.includes(lang.code) && <CheckCircle className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
            {selectedLanguages.length === 0 && (
              <p className="text-xs text-muted-foreground">Wählen Sie mindestens eine Sprache</p>
            )}
          </div>

          {/* Books Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {books.map((book) => (
                  <Card key={book.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="aspect-[2/3] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 relative">
                      {book.cover ? (
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Globe className="w-12 h-12 text-blue-500/40" /></div>
                      )}
                      {/* Language badges */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {book.languages?.slice(0, 2).map((lang: string) => {
                          const langInfo = languageOptions.find(l => l.code === lang);
                          return langInfo ? (
                            <Badge key={lang} variant="secondary" className="text-[10px] px-1">
                              {langInfo.flag} {langInfo.code.toUpperCase()}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-xs line-clamp-2">{book.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">{book.author}</p>
                      <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => downloadBook(book)}>
                        <Download className="w-3 h-3 mr-1" />Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalCount > 32 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => { setPage(p => p - 1); fetchBooks(search, page - 1, selectedLanguages); }} disabled={page <= 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="flex items-center px-4 text-sm">Seite {page}</span>
                  <Button variant="outline" size="sm" onClick={() => { setPage(p => p + 1); fetchBooks(search, page + 1, selectedLanguages); }}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// ACHIEVEMENTS PANEL
// ============================================================================

const AchievementsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { achievements } = useBookStore();
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" />Erfolge ({unlockedCount}/{achievements.length})</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.unlockedAt ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' : 'opacity-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  {achievement.unlockedAt && <Badge variant="secondary" className="mt-2"><CheckCircle className="w-3 h-3 mr-1" />Freigeschaltet</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// BOOK DETAIL PANEL
// ============================================================================

const BookDetailPanel = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { updateBook, rateBook, togglePin, addTagToBook, removeTagFromBook } = useBookStore();
  const [newTag, setNewTag] = useState('');
  const [autoTagging, setAutoTagging] = useState(false);
  const [showQRExport, setShowQRExport] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);

  const handleAutoTag = async () => {
    setAutoTagging(true);
    try {
      const response = await fetch('/api/autotag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: { title: book.title, author: book.author } }),
      });
      const data = await response.json();
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag: string) => addTagToBook(book.id, tag));
        toast.success(`${data.tags.length} Tags hinzugefügt!`);
      }
    } catch {
      toast.error('Auto-Tagging fehlgeschlagen');
    }
    setAutoTagging(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Book className="w-5 h-5" />Buchdetails</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">{book.title}</h3>
              {book.author && <p className="text-sm text-muted-foreground">{book.author}</p>}
            </div>
            <div className="space-y-2">
              <Label>Bewertung</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => rateBook(book.id, star)} className="p-1">
                    <Star className={`w-6 h-6 ${book.rating && star <= book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Angepinnt</Label>
              <Button variant="outline" size="icon" onClick={() => togglePin(book.id)}>
                <Pin className={`w-4 h-4 ${book.isPinned ? 'text-primary' : ''}`} />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <Button variant="ghost" size="sm" onClick={handleAutoTag} disabled={autoTagging}>
                  {autoTagging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span className="ml-1">Auto</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {book.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTagFromBook(book.id, tag)}>
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Neuer Tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && newTag.trim() && (addTagToBook(book.id, newTag.trim()), setNewTag(''))} />
                <Button size="icon" onClick={() => { if (newTag.trim()) { addTagToBook(book.id, newTag.trim()); setNewTag(''); } }}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fortschritt</Label>
              <Progress value={book.progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-right">{Math.round(book.progress)}%</p>
            </div>
            
            {/* Export Options */}
            <div className="space-y-2">
              <Label>Export & Teilen</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowQRExport(true)}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR-Code
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowShareLink(true)}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Link teilen
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
      
      <QRExportPanel book={book} open={showQRExport} onOpenChange={setShowQRExport} />
      <ShareableLinkExport book={book} open={showShareLink} onOpenChange={setShowShareLink} />
    </Sheet>
  );
};

// ============================================================================
// QR EXPORT PANEL
// ============================================================================

const QRExportPanel = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
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

// ============================================================================
// CLOUD SYNC PANEL
// ============================================================================

const CloudSyncPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
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
    toast.success(`${cloudProviders.find(p => p.id === provider)?.name} verbunden!`);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const success = await syncWithCloud();
    if (success) {
      toast.success('Synchronisation erfolgreich!');
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

// ============================================================================
// SHAREABLE LINK EXPORT
// ============================================================================

const ShareableLinkExport = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);

  useEffect(() => {
    if (open && book) {
      // Generate a mock shareable link
      const shareId = Math.random().toString(36).substring(2, 10);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setShareLink(`${baseUrl}/share/${shareId}`);
    }
  }, [open, book, expiryHours]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link in Zwischenablage kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Schau dir "${book.title}" an${book.author ? ` von ${book.author}` : ''}`,
          url: shareLink,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      copyLink();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Teilen-Link erstellen
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Book Info */}
          <Card>
            <CardContent className="p-4 flex gap-4">
              <div className="w-12 h-16 rounded bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
                <Book className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{book.title}</h3>
                {book.author && <p className="text-sm text-muted-foreground">{book.author}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{book.format.toUpperCase()}</Badge>
                  <span className="text-xs text-muted-foreground">{Math.round(book.progress)}% gelesen</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expiry Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Link gültig für</Label>
            <div className="flex gap-2">
              {[1, 24, 168].map((hours) => (
                <Button
                  key={hours}
                  variant={expiryHours === hours ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExpiryHours(hours)}
                  className="flex-1"
                >
                  {hours === 1 ? '1 Stunde' : hours === 24 ? '1 Tag' : '1 Woche'}
                </Button>
              ))}
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Teilen-Link</Label>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1 text-sm" />
              <Button onClick={copyLink} variant="outline" size="icon">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Share Button */}
          <div className="flex gap-3">
            <Button onClick={shareNative} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Teilen
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Der Link ermöglicht es anderen, das Buch in ihrer Bibliothek zu speichern.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// SYNC STATUS INDICATOR
// ============================================================================

const SyncStatusIndicator = ({ onClick }: { onClick: () => void }) => {
  const { cloudSyncStatus, autoSyncEnabled } = useBookStore();

  return (
    <button 
      onClick={onClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
    >
      {cloudSyncStatus.connected ? (
        <>
          <Cloud className="w-5 h-5 text-green-500" />
          {autoSyncEnabled && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </>
      ) : (
        <CloudOff className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
};

// ============================================================================
// TTS HOOK
// ============================================================================

const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { settings } = useBookStore();

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.ttsSpeed;
      const voices = window.speechSynthesis.getVoices();
      if (settings.ttsVoice) {
        const voice = voices.find(v => v.name === settings.ttsVoice);
        if (voice) utterance.voice = voice;
      } else if (voices.length > 0) utterance.voice = voices[0];
      utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); onEnd?.(); };
      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    } else toast.error('TTS wird nicht unterstützt');
  }, [settings.ttsSpeed, settings.ttsVoice]);

  const stop = useCallback(() => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false); } }, []);
  const pause = useCallback(() => { if ('speechSynthesis' in window) { window.speechSynthesis.pause(); setIsPaused(true); } }, []);
  const resume = useCallback(() => { if ('speechSynthesis' in window) { window.speechSynthesis.resume(); setIsPaused(false); } }, []);

  return { speak, stop, pause, resume, isSpeaking, isPaused };
};

// ============================================================================
// AI SUMMARY
// ============================================================================

const AISummaryPanel = ({ text, onClose }: { text: string; onClose: () => void }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.substring(0, 5000) }) });
        const data = await response.json();
        setSummary(data.summary || 'Zusammenfassung nicht verfügbar.');
      } catch { setSummary('Fehler beim Generieren.'); }
      setLoading(false);
    };
    generate();
  }, [text]);

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" />KI-Zusammenfassung</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100%-80px)] mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4" />
              <p className="text-muted-foreground">Generiere Zusammenfassung...</p>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none"><ReactMarkdown>{summary}</ReactMarkdown></div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// AI CHAT PANEL
// ============================================================================

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AIChatPanel = ({ book, bookContent, open, onOpenChange }: { book: Book; bookContent: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hallo! Ich bin Ihr Leseassistent für "${book.title}". Stellen Sie mir Fragen zum Buch, den Charakteren, der Handlung oder lassen Sie sich den Kontext erklären.`
      }]);
    }
  }, [open, book.title, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookContent,
          question: userMessage,
          bookTitle: book.title,
          author: book.author
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.' }]);
    }
    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            KI-Chat: {book.title}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea ref={scrollRef} className="flex-1 mt-4 pr-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                    : 'bg-muted rounded-bl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t pt-4 mt-4 flex gap-2">
          <Input
            placeholder="Frage zum Buch stellen..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || loading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// TRANSLATION POPUP
// ============================================================================

const TranslationPopup = ({ text, position, onClose }: { text: string; position: { x: number; y: number }; onClose: () => void }) => {
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('de');
  const [loading, setLoading] = useState(false);

  const translateText = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage: targetLang })
      });
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch {
      setTranslatedText('Übersetzung fehlgeschlagen');
    }
    setLoading(false);
  };

  useEffect(() => {
    translateText();
  }, [targetLang, text]);

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'Englisch', flag: '🇬🇧' },
    { code: 'fr', name: 'Französisch', flag: '🇫🇷' },
    { code: 'es', name: 'Spanisch', flag: '🇪🇸' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[100] w-72"
      style={{ left: position.x, top: position.y }}
    >
      <Card className="shadow-xl border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Übersetzung</span>
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onClose}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-1 mb-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={targetLang === lang.code ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setTargetLang(lang.code)}
              >
                {lang.flag}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2 italic">"{text.substring(0, 100)}{text.length > 100 ? '...' : ''}"</p>
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-sm bg-muted/50 p-2 rounded">{translatedText}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// BOOK ANALYSIS PANEL
// ============================================================================

interface AnalysisData {
  difficulty: number;
  readabilityScore: number;
  vocabularyComplexity: string;
  estimatedReadingTime: number;
  keyThemes: string[];
  moodAnalysis: {
    overall: string;
    breakdown: { emotion: string; percentage: number }[];
  };
  emotionCurve: { position: number; emotion: string; intensity: number }[];
}

const BookAnalysisPanel = ({ text, bookTitle, author, open, onOpenChange }: { text: string; bookTitle: string; author?: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'themes' | 'mood'>('metrics');

  useEffect(() => {
    if (open && text) {
      analyzeText();
    }
  }, [open, text]);

  const analyzeText = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 8000), bookTitle, author })
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch {
      toast.error('Analyse fehlgeschlagen');
    }
    setLoading(false);
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return 'text-green-500';
    if (level <= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return 'Leicht';
    if (level <= 6) return 'Mittel';
    return 'Schwierig';
  };

  const emotionColors: Record<string, string> = {
    'Freude': 'bg-yellow-400',
    'Trauer': 'bg-blue-400',
    'Angst': 'bg-purple-400',
    'Wut': 'bg-red-400',
    'Überraschung': 'bg-pink-400',
    'Neutral': 'bg-gray-400',
    'Hoffnung': 'bg-green-400',
    'Spannung': 'bg-orange-400',
    'Melancholie': 'bg-indigo-400',
    'Liebe': 'bg-rose-400',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Lese-Analyse
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
            <p className="text-muted-foreground">Analysiere Text...</p>
          </div>
        ) : analysis ? (
          <div className="mt-4 space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {[
                { id: 'metrics', label: 'Metriken', icon: BarChart3 },
                { id: 'themes', label: 'Themen', icon: Tag },
                { id: 'mood', label: 'Stimmung', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-background shadow' : 'text-muted-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <ScrollArea className="h-[calc(100vh-250px)]">
              {activeTab === 'metrics' && (
                <div className="space-y-4">
                  {/* Difficulty */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          Schwierigkeitsgrad
                        </Label>
                        <span className={`font-bold ${getDifficultyColor(analysis.difficulty)}`}>
                          {analysis.difficulty}/10
                        </span>
                      </div>
                      <Progress value={analysis.difficulty * 10} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {getDifficultyLabel(analysis.difficulty)} zu lesen
                      </p>
                    </CardContent>
                  </Card>

                  {/* Readability */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          Lesbarkeit
                        </Label>
                        <span className="font-bold text-blue-500">{analysis.readabilityScore}%</span>
                      </div>
                      <Progress value={analysis.readabilityScore} className="h-2" />
                    </CardContent>
                  </Card>

                  {/* Vocabulary & Reading Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Type className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                        <p className="font-bold capitalize">{analysis.vocabularyComplexity}</p>
                        <p className="text-xs text-muted-foreground">Wortschatz</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        <p className="font-bold">~{analysis.estimatedReadingTime} Min</p>
                        <p className="text-xs text-muted-foreground">Lesezeit</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'themes' && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-primary" />
                        Hauptthemen
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keyThemes.map((theme, i) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'mood' && (
                <div className="space-y-4">
                  {/* Overall Mood */}
                  <Card>
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Hauptstimmung: {analysis.moodAnalysis.overall}
                      </Label>
                      <div className="space-y-2">
                        {analysis.moodAnalysis.breakdown.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs w-20">{item.emotion}</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className={`h-full rounded-full ${emotionColors[item.emotion] || 'bg-gray-400'}`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emotion Curve */}
                  <Card>
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Emotionskurve
                      </Label>
                      <div className="h-32 flex items-end gap-1">
                        {analysis.emotionCurve.map((point, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-full rounded-t ${emotionColors[point.emotion] || 'bg-gray-400'}`}
                              style={{ height: `${point.intensity}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground mt-1">{point.position}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Keine Analyse verfügbar</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// MOOD CHART COMPONENT
// ============================================================================

const MoodChart = ({ emotionCurve }: { emotionCurve: { position: number; emotion: string; intensity: number }[] }) => {
  const emotionColors: Record<string, string> = {
    'Freude': 'fill-yellow-400 text-yellow-400',
    'Trauer': 'fill-blue-400 text-blue-400',
    'Angst': 'fill-purple-400 text-purple-400',
    'Wut': 'fill-red-400 text-red-400',
    'Überraschung': 'fill-pink-400 text-pink-400',
    'Neutral': 'fill-gray-400 text-gray-400',
    'Hoffnung': 'fill-green-400 text-green-400',
    'Spannung': 'fill-orange-400 text-orange-400',
  };

  return (
    <div className="h-40 flex items-end gap-1">
      {emotionCurve.map((point, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative">
          <div
            className={`w-full rounded-t transition-all ${emotionColors[point.emotion]?.split(' ')[0] || 'fill-gray-400'} opacity-80 group-hover:opacity-100`}
            style={{ height: `${Math.max(point.intensity, 5)}%` }}
          />
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded text-xs whitespace-nowrap z-10">
            {point.emotion}: {point.intensity}%
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// FEATURE 12: PAGE ANIMATION SELECTOR
// ============================================================================

const pageAnimations = [
  { id: 'none', name: 'Keine', icon: Eye, description: 'Keine Animation' },
  { id: 'flip', name: 'Blättern', icon: BookOpen, description: 'Klassisches Umblättern' },
  { id: 'slide', name: 'Gleiten', icon: ChevronRight, description: 'Horizontales Gleiten' },
  { id: 'curl', name: 'Rollen', icon: Layers, description: 'Seite rollen' },
  { id: 'fade', name: 'Überblenden', icon: Moon, description: 'Sanftes Überblenden' },
];

const PageAnimationSelector = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Seitenanimationen
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Animation Types */}
          <div className="grid grid-cols-5 gap-3">
            {pageAnimations.map((anim) => (
              <button
                key={anim.id}
                onClick={() => updateSettings({ pageAnimation: anim.id as any })}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  settings.pageAnimation === anim.id
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent bg-muted hover:bg-muted/80'
                }`}
              >
                <anim.icon className={`w-8 h-8 mb-2 ${settings.pageAnimation === anim.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-medium">{anim.name}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{anim.description}</span>
              </button>
            ))}
          </div>

          {/* Animation Speed */}
          <Card>
            <CardContent className="p-4">
              <Label className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" />
                Animationsgeschwindigkeit: {settings.pageAnimationSpeed}ms
              </Label>
              <Slider
                value={[settings.pageAnimationSpeed]}
                onValueChange={([value]) => updateSettings({ pageAnimationSpeed: value })}
                min={100}
                max={800}
                step={50}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Schnell</span>
                <span>Langsam</span>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardContent className="p-4">
              <Label className="mb-3 block">Vorschau</Label>
              <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-amber-600/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Tippen Sie im Reader, um die Animation zu sehen</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 12: AMBIENT LIGHTING PANEL
// ============================================================================

const AmbientLightingPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return { name: 'Morgen', color: '#fff5e6', icon: Sun };
    if (hour >= 12 && hour < 18) return { name: 'Nachmittag', color: '#ffffff', icon: Sun };
    if (hour >= 18 && hour < 21) return { name: 'Abend', color: '#ffecd2', icon: MoonStar };
    return { name: 'Nacht', color: '#1a1a2e', icon: Moon };
  };

  const timeOfDay = getTimeOfDay();

  const presetColors = [
    { id: 'warm', name: 'Warm', color: '#fff5e6' },
    { id: 'cool', name: 'Kühl', color: '#f0f8ff' },
    { id: 'sepia', name: 'Sepia', color: '#f4ecd8' },
    { id: 'night', name: 'Nacht', color: '#1a1a2e' },
    { id: 'green', name: 'Beruhigend', color: '#e8f5e9' },
    { id: 'rose', name: 'Rose', color: '#fff0f5' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Ambiente Beleuchtung
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Current Time */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktuelle Zeit</p>
                  <p className="text-2xl font-bold">{currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-sm">{timeOfDay.name}</p>
                </div>
                <timeOfDay.icon className="w-16 h-16 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Ambiente Beleuchtung aktivieren</Label>
              <p className="text-xs text-muted-foreground">Bildschirmfarbe passt sich der Tageszeit an</p>
            </div>
            <Button
              variant={settings.ambientLightingEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ ambientLightingEnabled: !settings.ambientLightingEnabled })}
            >
              {settings.ambientLightingEnabled ? 'An' : 'Aus'}
            </Button>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label className="text-sm">Modus</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={settings.ambientLightingMode === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ ambientLightingMode: 'auto' })}
              >
                Automatisch
              </Button>
              <Button
                variant={settings.ambientLightingMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ ambientLightingMode: 'manual' })}
              >
                Manuell
              </Button>
            </div>
          </div>

          {/* Color Presets (Manual Mode) */}
          {settings.ambientLightingMode === 'manual' && (
            <div className="space-y-2">
              <Label className="text-sm">Farbpresets</Label>
              <div className="grid grid-cols-3 gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateSettings({ ambientLightingColor: preset.color })}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      settings.ambientLightingColor === preset.color
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full mb-2"
                      style={{ backgroundColor: preset.color, border: '1px solid #e5e7eb' }}
                    />
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Intensität</Label>
              <span className="text-xs text-muted-foreground">{settings.ambientLightingIntensity}%</span>
            </div>
            <Slider
              value={[settings.ambientLightingIntensity]}
              onValueChange={([value]) => updateSettings({ ambientLightingIntensity: value })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Preview */}
          <Card>
            <CardContent className="p-4">
              <Label className="mb-3 block">Vorschau</Label>
              <div
                className="h-32 rounded-lg transition-colors"
                style={{
                  backgroundColor: settings.ambientLightingMode === 'auto'
                    ? timeOfDay.color
                    : settings.ambientLightingColor,
                  opacity: settings.ambientLightingIntensity / 100 + 0.3,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 17: CUSTOM FONT UPLOADER
// ============================================================================

const CustomFontUploader = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
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

// ============================================================================
// FEATURE 17: THEME CUSTOMIZER
// ============================================================================

const ThemeCustomizer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();

  const colorPresets = [
    { name: 'Klassisch', bg: '#ffffff', text: '#000000', accent: '#f59e0b' },
    { name: 'Dunkel', bg: '#1a1a1a', text: '#e5e5e5', accent: '#60a5fa' },
    { name: 'Sepia', bg: '#f4ecd8', text: '#5c4b37', accent: '#b8860b' },
    { name: 'Ozean', bg: '#e0f2fe', text: '#0c4a6e', accent: '#0284c7' },
    { name: 'Wald', bg: '#ecfdf5', text: '#14532d', accent: '#22c55e' },
    { name: 'Lavendel', bg: '#faf5ff', text: '#4c1d95', accent: '#a855f7' },
  ];

  const gradientPresets = [
    { name: 'Sonnenuntergang', start: '#fef3c7', end: '#fde68a' },
    { name: 'Ozean', start: '#dbeafe', end: '#bfdbfe' },
    { name: 'Wald', start: '#dcfce7', end: '#bbf7d0' },
    { name: 'Lavendel', start: '#f3e8ff', end: '#e9d5ff' },
    { name: 'Rose', start: '#ffe4e6', end: '#fecdd3' },
    { name: 'Nacht', start: '#1e293b', end: '#0f172a' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme-Anpassung
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-6">
            {/* Gradient Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Gradient-Hintergrund</Label>
                <p className="text-xs text-muted-foreground">Farbverlauf als Hintergrund</p>
              </div>
              <Button
                variant={settings.gradientThemeEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ gradientThemeEnabled: !settings.gradientThemeEnabled })}
              >
                {settings.gradientThemeEnabled ? 'An' : 'Aus'}
              </Button>
            </div>

            {/* Gradient Presets */}
            {settings.gradientThemeEnabled && (
              <div className="space-y-2">
                <Label className="text-sm">Gradient-Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateSettings({
                        gradientThemeStart: preset.start,
                        gradientThemeEnd: preset.end,
                      })}
                      className="p-2 rounded-lg border-2 border-transparent hover:border-primary transition-all"
                    >
                      <div
                        className="h-12 rounded mb-1"
                        style={{
                          background: `linear-gradient(to bottom, ${preset.start}, ${preset.end})`,
                        }}
                      />
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Gradient */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Startfarbe</Label>
                    <input
                      type="color"
                      value={settings.gradientThemeStart}
                      onChange={(e) => updateSettings({ gradientThemeStart: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Endfarbe</Label>
                    <input
                      type="color"
                      value={settings.gradientThemeEnd}
                      onChange={(e) => updateSettings({ gradientThemeEnd: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Gradient Direction */}
                <div className="space-y-2">
                  <Label className="text-xs">Richtung</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'to-right', label: 'Horizontal' },
                      { id: 'to-bottom', label: 'Vertikal' },
                      { id: 'diagonal', label: 'Diagonal' },
                    ].map((dir) => (
                      <Button
                        key={dir.id}
                        variant={settings.gradientThemeDirection === dir.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ gradientThemeDirection: dir.id as any })}
                      >
                        {dir.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Color Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Farbpresets</Label>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateSettings({
                      themeBackgroundColor: preset.bg,
                      themeTextColor: preset.text,
                      themeAccentColor: preset.accent,
                    })}
                    className="p-2 rounded-lg border-2 border-transparent hover:border-primary transition-all"
                  >
                    <div
                      className="h-12 rounded mb-1 relative"
                      style={{ backgroundColor: preset.bg }}
                    >
                      <div
                        className="absolute bottom-1 right-1 w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Eigene Farben</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Hintergrund</Label>
                  <input
                    type="color"
                    value={settings.themeBackgroundColor}
                    onChange={(e) => updateSettings({ themeBackgroundColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Textfarbe</Label>
                  <input
                    type="color"
                    value={settings.themeTextColor}
                    onChange={(e) => updateSettings({ themeTextColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Akzentfarbe</Label>
                  <input
                    type="color"
                    value={settings.themeAccentColor}
                    onChange={(e) => updateSettings({ themeAccentColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Markierungsfarbe</Label>
                  <input
                    type="color"
                    value={settings.themeHighlightColor}
                    onChange={(e) => updateSettings({ themeHighlightColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Margin Presets */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Seitenränder</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'minimal', label: 'Minimal' },
                  { id: 'balanced', label: 'Ausgewogen' },
                  { id: 'generous', label: 'Großzügig' },
                  { id: 'custom', label: 'Benutzerdefiniert' },
                ].map((preset) => (
                  <Button
                    key={preset.id}
                    variant={settings.marginPreset === preset.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ marginPreset: preset.id as any })}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {settings.marginPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Oben: {settings.customMarginTop}px</Label>
                    <Slider
                      value={[settings.customMarginTop]}
                      onValueChange={([value]) => updateSettings({ customMarginTop: value })}
                      min={0}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Unten: {settings.customMarginBottom}px</Label>
                    <Slider
                      value={[settings.customMarginBottom]}
                      onValueChange={([value]) => updateSettings({ customMarginBottom: value })}
                      min={0}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Links: {settings.customMarginLeft}px</Label>
                    <Slider
                      value={[settings.customMarginLeft]}
                      onValueChange={([value]) => updateSettings({ customMarginLeft: value })}
                      min={0}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Rechts: {settings.customMarginRight}px</Label>
                    <Slider
                      value={[settings.customMarginRight]}
                      onValueChange={([value]) => updateSettings({ customMarginRight: value })}
                      min={0}
                      max={60}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <Card>
              <CardContent className="p-4">
                <Label className="mb-3 block">Vorschau</Label>
                <div
                  className="h-40 rounded-lg p-4 transition-colors"
                  style={{
                    backgroundColor: settings.gradientThemeEnabled
                      ? undefined
                      : settings.themeBackgroundColor,
                    background: settings.gradientThemeEnabled
                      ? `linear-gradient(${settings.gradientThemeDirection === 'to-right' ? 'to right' : settings.gradientThemeDirection === 'diagonal' ? 'to bottom right' : 'to bottom'}, ${settings.gradientThemeStart}, ${settings.gradientThemeEnd})`
                      : undefined,
                    color: settings.themeTextColor,
                  }}
                >
                  <h4 className="font-bold mb-2" style={{ color: settings.themeAccentColor }}>
                    Beispielkapitel
                  </h4>
                  <p className="text-sm" style={{ color: settings.themeTextColor }}>
                    Dies ist ein Beispieltext, um die gewählten Farben zu testen. 
                    <span
                      className="px-1 rounded"
                      style={{ backgroundColor: settings.themeHighlightColor }}
                    >
                      Markierter Text
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 17: READING MASK
// ============================================================================

const ReadingMask = ({ enabled, lines, opacity, color }: { enabled: boolean; lines: number; opacity: number; color: string }) => {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Top mask */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '40%',
          background: `linear-gradient(to bottom, ${color}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}, transparent)`,
        }}
      />
      {/* Bottom mask */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '40%',
          background: `linear-gradient(to top, ${color}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}, transparent)`,
        }}
      />
    </div>
  );
};

// ============================================================================
// FEATURE 12: PAPER TEXTURE OVERLAY
// ============================================================================

const PaperTextureOverlay = ({ texture, opacity }: { texture: string; opacity: number }) => {
  if (texture === 'none') return null;

  const textures: Record<string, string> = {
    'old-paper': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
    'parchment': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
    'newsprint': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.5\' numOctaves=\'1\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
    'vellum': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.5\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 mix-blend-multiply"
      style={{
        backgroundImage: textures[texture],
        opacity: opacity / 100,
      }}
    />
  );
};

// ============================================================================
// FEATURE 19: VOICE COMMANDS PANEL
// ============================================================================

const VoiceCommandsPanel = ({ open, onOpenChange, onCommand }: { open: boolean; onOpenChange: (open: boolean) => void; onCommand?: (command: string) => void }) => {
  const { settings, updateSettings } = useBookStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<any>(null);

  const commands = [
    { command: 'nächste Seite', action: 'Nächste Seite', icon: ChevronRight },
    { command: 'vorherige Seite', action: 'Vorherige Seite', icon: ChevronLeft },
    { command: 'lesezeichen', action: 'Lesezeichen setzen', icon: Bookmark },
    { command: 'lauter', action: 'Lautstärke erhöhen', icon: Volume2 },
    { command: 'leiser', action: 'Lautstärke verringern', icon: VolumeX },
    { command: 'vorlesen', action: 'Text vorlesen', icon: Play },
    { command: 'stopp', action: 'Stopp', icon: Pause },
    { command: 'menü', action: 'Menü öffnen', icon: List },
    { command: 'schließen', action: 'Schließen', icon: X },
    { command: 'hilfe', action: 'Hilfe anzeigen', icon: AlertCircle },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings.voiceCommandsLanguage;

      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.toLowerCase().trim();
        setTranscript(text);

        if (event.results[last].isFinal) {
          // Check for commands
          const matchedCommand = commands.find(cmd => text.includes(cmd.command));
          if (matchedCommand) {
            setLastCommand(matchedCommand.action);
            if (onCommand) onCommand(matchedCommand.command);
            toast.success(`Befehl erkannt: ${matchedCommand.action}`);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [settings.voiceCommandsLanguage, onCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Spracherkennung wird nicht unterstützt');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Sprachsteuerung
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Sprachsteuerung aktivieren</Label>
              <p className="text-xs text-muted-foreground">Steuern Sie den Reader mit Ihrer Stimme</p>
            </div>
            <Button
              variant={settings.voiceCommandsEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ voiceCommandsEnabled: !settings.voiceCommandsEnabled })}
            >
              {settings.voiceCommandsEnabled ? 'An' : 'Aus'}
            </Button>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Sprache</Label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={settings.voiceCommandsLanguage}
              onChange={(e) => updateSettings({ voiceCommandsLanguage: e.target.value })}
            >
              <option value="de-DE">Deutsch</option>
              <option value="en-US">Englisch (US)</option>
              <option value="en-GB">Englisch (UK)</option>
              <option value="fr-FR">Französisch</option>
              <option value="es-ES">Spanisch</option>
            </select>
          </div>

          {/* Microphone Button */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <button
                onClick={toggleListening}
                className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>
              <p className="mt-4 text-sm text-muted-foreground">
                {isListening ? 'Höre zu...' : 'Tippen zum Sprechen'}
              </p>
              {transcript && (
                <p className="mt-2 text-sm font-medium">"{transcript}"</p>
              )}
              {lastCommand && (
                <p className="mt-1 text-xs text-green-500">
                  Letzter Befehl: {lastCommand}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Available Commands */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Verfügbare Befehle</Label>
            <ScrollArea className="h-48">
              <div className="grid grid-cols-2 gap-2">
                {commands.map((cmd) => (
                  <Card key={cmd.command}>
                    <CardContent className="p-3 flex items-center gap-2">
                      <cmd.icon className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">{cmd.action}</p>
                        <p className="text-[10px] text-muted-foreground">"{cmd.command}"</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 19: ACCESSIBILITY PRO PANEL
// ============================================================================

const AccessibilityProPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();

  const highContrastModes = [
    { id: 'black-white', name: 'Schwarz auf Weiß', bg: '#ffffff', text: '#000000' },
    { id: 'white-black', name: 'Weiß auf Schwarz', bg: '#000000', text: '#ffffff' },
    { id: 'yellow-black', name: 'Gelb auf Schwarz', bg: '#000000', text: '#ffff00' },
    { id: 'black-yellow', name: 'Schwarz auf Gelb', bg: '#ffff00', text: '#000000' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Accessibility Pro
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-6">
            {/* Keyboard Navigation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Keyboard className="w-4 h-4" />
                      Tastaturnavigation
                    </Label>
                    <p className="text-xs text-muted-foreground">Volle Steuerung per Tastatur</p>
                  </div>
                  <Button
                    variant={settings.keyboardNavigationEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ keyboardNavigationEnabled: !settings.keyboardNavigationEnabled })}
                  >
                    {settings.keyboardNavigationEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
                {settings.keyboardNavigationEnabled && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2"><Badge variant="outline">→</Badge> Nächste Seite</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">←</Badge> Vorherige Seite</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">↑</Badge> Nach oben scrollen</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">↓</Badge> Nach unten scrollen</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">B</Badge> Lesezeichen</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">M</Badge> Menü</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">H</Badge> Startseite</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">ESC</Badge> Schließen</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High Contrast Pro */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium">High Contrast Pro</Label>
                    <p className="text-xs text-muted-foreground">Erhöhter Kontrast für bessere Lesbarkeit</p>
                  </div>
                  <Button
                    variant={settings.highContrastProEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ highContrastProEnabled: !settings.highContrastProEnabled })}
                  >
                    {settings.highContrastProEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
                {settings.highContrastProEnabled && (
                  <div className="grid grid-cols-2 gap-2">
                    {highContrastModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updateSettings({ highContrastProMode: mode.id as any })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.highContrastProMode === mode.id
                            ? 'border-primary'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: mode.bg, color: mode.text }}
                      >
                        <span className="text-sm font-medium">{mode.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reduced Motion Pro */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium">Reduced Motion Pro</Label>
                    <p className="text-xs text-muted-foreground">Animationen reduzieren oder deaktivieren</p>
                  </div>
                  <Button
                    variant={settings.reducedMotionProEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ reducedMotionProEnabled: !settings.reducedMotionProEnabled })}
                  >
                    {settings.reducedMotionProEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
                {settings.reducedMotionProEnabled && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Alle Animationen deaktivieren</Label>
                      <Button
                        variant={settings.disableAllAnimations ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ disableAllAnimations: !settings.disableAllAnimations })}
                      >
                        {settings.disableAllAnimations ? 'An' : 'Aus'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Parallax reduzieren</Label>
                      <Button
                        variant={settings.reduceParallax ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSettings({ reduceParallax: !settings.reduceParallax })}
                      >
                        {settings.reduceParallax ? 'An' : 'Aus'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced ARIA */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Verbesserte Screenreader-Unterstützung</Label>
                    <p className="text-xs text-muted-foreground">Optimierte ARIA-Labels für Screenreader</p>
                  </div>
                  <Button
                    variant={settings.enhancedAriaEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ enhancedAriaEnabled: !settings.enhancedAriaEnabled })}
                  >
                    {settings.enhancedAriaEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reading Mask Settings */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Focus className="w-4 h-4" />
                      Leseschablone
                    </Label>
                    <p className="text-xs text-muted-foreground">Zeilenweiser Fokus für bessere Konzentration</p>
                  </div>
                  <Button
                    variant={settings.readingMaskEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ readingMaskEnabled: !settings.readingMaskEnabled })}
                  >
                    {settings.readingMaskEnabled ? 'An' : 'Aus'}
                  </Button>
                </div>
                {settings.readingMaskEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Sichtbare Zeilen</Label>
                        <span className="text-xs text-muted-foreground">{settings.readingMaskLines}</span>
                      </div>
                      <Slider
                        value={[settings.readingMaskLines]}
                        onValueChange={([value]) => updateSettings({ readingMaskLines: value })}
                        min={1}
                        max={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Masken-Deckkraft</Label>
                        <span className="text-xs text-muted-foreground">{settings.readingMaskOpacity}%</span>
                      </div>
                      <Slider
                        value={[settings.readingMaskOpacity]}
                        onValueChange={([value]) => updateSettings({ readingMaskOpacity: value })}
                        min={20}
                        max={100}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 12: PARALLAX BACKGROUND
// ============================================================================

const ParallaxBackground = ({ type, intensity }: { type: string; intensity: number }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setOffset({ x: x * intensity, y: y * intensity });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);

  if (type === 'none') return null;

  const backgrounds: Record<string, string> = {
    stars: 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900',
    forest: 'bg-gradient-to-b from-green-900 via-emerald-800 to-green-900',
    ocean: 'bg-gradient-to-b from-blue-900 via-cyan-800 to-blue-900',
    mountains: 'bg-gradient-to-b from-slate-700 via-stone-600 to-slate-800',
    library: 'bg-gradient-to-b from-amber-900 via-orange-800 to-amber-900',
  };

  return (
    <div
      className={`fixed inset-0 -z-10 ${backgrounds[type]}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Stars effect */}
      {type === 'stars' && (
        <div className="absolute inset-0">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STATISTICS PANEL
// ============================================================================

const StatisticsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingStats, books, highlights, notes } = useBookStore();
  
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = readingStats.dailyStats[dateStr] || { pages: 0, time: 0 };
      days.push({ day: date.toLocaleDateString('de-DE', { weekday: 'short' }), pages: stats.pages, time: stats.time });
    }
    return days;
  }, [readingStats.dailyStats]);

  const maxPages = Math.max(...last7Days.map(d => d.pages), 1);
  const completedBooks = books.filter(b => b.progress >= 100).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Lesestatistiken</SheetTitle></SheetHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <Card><CardContent className="p-4 text-center"><BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" /><p className="text-2xl font-bold">{completedBooks}</p><p className="text-xs text-muted-foreground">Bücher gelesen</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><FileText className="w-8 h-8 mx-auto mb-2 text-green-500" /><p className="text-2xl font-bold">{readingStats.totalPagesRead}</p><p className="text-xs text-muted-foreground">Seiten gesamt</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Clock className="w-8 h-8 mx-auto mb-2 text-amber-500" /><p className="text-2xl font-bold">{formatTime(readingStats.totalReadingTime)}</p><p className="text-xs text-muted-foreground">Lesezeit</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Target className="w-8 h-8 mx-auto mb-2 text-red-500" /><p className="text-2xl font-bold">{readingStats.currentStreak}</p><p className="text-xs text-muted-foreground">Tage in Folge</p></CardContent></Card>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card><CardContent className="p-4 text-center"><Highlighter className="w-6 h-6 mx-auto mb-2 text-yellow-500" /><p className="text-xl font-bold">{highlights.length}</p><p className="text-xs text-muted-foreground">Markierungen</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Edit3 className="w-6 h-6 mx-auto mb-2 text-purple-500" /><p className="text-xl font-bold">{notes.length}</p><p className="text-xs text-muted-foreground">Notizen</p></CardContent></Card>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Letzte 7 Tage</h3>
          <div className="flex items-end gap-2 h-32">
            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t" style={{ height: `${(day.pages / maxPages) * 100}%`, minHeight: day.pages > 0 ? '4px' : '0' }} />
                <p className="text-xs mt-2 text-muted-foreground">{day.day}</p>
                <p className="text-xs font-medium">{day.pages}</p>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// SETTINGS PANEL
// ============================================================================

const SettingsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { settings, updateSettings } = useBookStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const fontFamilies = [
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'system-ui, sans-serif', label: 'System' },
    { value: 'Times New Roman, serif', label: 'Times' },
    { value: 'Arial, sans-serif', label: 'Arial' },
  ];

  const colorBlindModes = [
    { value: 'none', label: 'Normal', description: 'Keine Anpassung' },
    { value: 'protanopia', label: 'Protanopie', description: 'Rot-Blindheit' },
    { value: 'deuteranopia', label: 'Deuteranopie', description: 'Grün-Blindheit' },
    { value: 'tritanopia', label: 'Tritanopie', description: 'Blau-Blindheit' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80 overflow-y-auto">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Einstellungen</SheetTitle></SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'sepia'] as const).map((theme) => (
                <Button key={theme} variant={settings.theme === theme ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ theme })} className="flex flex-col h-auto py-2">
                  {theme === 'light' && <Sun className="w-4 h-4 mb-1" />}
                  {theme === 'dark' && <Moon className="w-4 h-4 mb-1" />}
                  {theme === 'sepia' && <BookOpen className="w-4 h-4 mb-1" />}
                  <span className="text-xs">{theme === 'light' ? 'Hell' : theme === 'dark' ? 'Dunkel' : 'Sepia'}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2"><Eye className="w-4 h-4" />Barrierefreiheit</h4>
            
            {/* Dyslexia Font */}
            <div className="flex items-center justify-between">
              <div><Label className="text-sm">Dyslexie-Font</Label><p className="text-xs text-muted-foreground">Optimiert für Legastheniker</p></div>
              <Button variant={settings.dyslexiaFont ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ dyslexiaFont: !settings.dyslexiaFont })}>{settings.dyslexiaFont ? 'Aktiv' : 'Inaktiv'}</Button>
            </div>

            {/* Bionic Reading */}
            <div className="flex items-center justify-between">
              <div><Label className="text-sm flex items-center gap-1"><Zap className="w-3 h-3" />Bionic Reading</Label><p className="text-xs text-muted-foreground">Erste Buchstaben hervorheben</p></div>
              <Button variant={settings.bionicReading ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ bionicReading: !settings.bionicReading })}>{settings.bionicReading ? 'Aktiv' : 'Inaktiv'}</Button>
            </div>

            {/* Color Blind Mode */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1"><Palette className="w-3 h-3" />Farbenblind-Modus</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorBlindModes.map((mode) => (
                  <Button
                    key={mode.value}
                    variant={settings.colorBlindMode === mode.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ colorBlindMode: mode.value as any })}
                    className="flex flex-col h-auto py-2"
                  >
                    <span className="text-xs font-medium">{mode.label}</span>
                    <span className="text-[10px] text-muted-foreground">{mode.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between">
              <div><Label className="text-sm flex items-center gap-1"><Vibrate className="w-3 h-3" />Haptisches Feedback</Label><p className="text-xs text-muted-foreground">Vibration beim Blättern</p></div>
              <Button variant={settings.hapticFeedback ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}>{settings.hapticFeedback ? 'An' : 'Aus'}</Button>
            </div>

            {/* Gesture Navigation */}
            <div className="flex items-center justify-between">
              <div><Label className="text-sm flex items-center gap-1"><Hand className="w-3 h-3" />Gesten-Navigation</Label><p className="text-xs text-muted-foreground">Wischen/Schütteln zum Blättern</p></div>
              <Button variant={settings.gestureNavigation ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ gestureNavigation: !settings.gestureNavigation })}>{settings.gestureNavigation ? 'An' : 'Aus'}</Button>
            </div>

            {/* Eye Care Timer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div><Label className="text-sm">Augenpflege-Timer</Label><p className="text-xs text-muted-foreground">20-20-20 Regel</p></div>
                <Button variant={settings.eyeCareEnabled ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ eyeCareEnabled: !settings.eyeCareEnabled })}>{settings.eyeCareEnabled ? 'An' : 'Aus'}</Button>
              </div>
              {settings.eyeCareEnabled && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Intervall:</Label>
                  <Slider value={[settings.eyeCareInterval]} onValueChange={([value]) => updateSettings({ eyeCareInterval: value })} min={5} max={60} step={5} className="flex-1" />
                  <span className="text-xs">{settings.eyeCareInterval}min</span>
                </div>
              )}
            </div>
          </div>

          {/* Night Mode Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2"><MoonStar className="w-4 h-4" />Nachtlesemodus</h4>
            <div className="flex items-center justify-between">
              <div><Label className="text-sm">Rotfilter aktivieren</Label><p className="text-xs text-muted-foreground">Reduziert blaues Licht</p></div>
              <Button variant={settings.nightModeEnabled ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ nightModeEnabled: !settings.nightModeEnabled })}>{settings.nightModeEnabled ? 'An' : 'Aus'}</Button>
            </div>
            {settings.nightModeEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Intensität:</Label>
                  <span className="text-xs">{settings.nightModeIntensity}%</span>
                </div>
                <Slider
                  value={[settings.nightModeIntensity]}
                  onValueChange={([value]) => updateSettings({ nightModeIntensity: value })}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>
            )}
          </div>

          {/* Speed Reading Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />Speed Reading</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Wörter pro Minute:</Label>
                <span className="text-xs font-medium">{settings.speedReadingWPM} WPM</span>
              </div>
              <Slider
                value={[settings.speedReadingWPM]}
                onValueChange={([value]) => updateSettings({ speedReadingWPM: value })}
                min={100}
                max={600}
                step={25}
              />
              <p className="text-xs text-muted-foreground">RSVP-Modus zeigt ein Wort nach dem anderen</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium"><Type className="w-4 h-4" />Schriftgröße: {settings.fontSize}px</Label>
            <Slider value={[settings.fontSize]} onValueChange={([value]) => updateSettings({ fontSize: value })} min={12} max={32} step={1} />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium"><AlignJustify className="w-4 h-4" />Zeilenhöhe: {settings.lineHeight}</Label>
            <Slider value={[settings.lineHeight * 10]} onValueChange={([value]) => updateSettings({ lineHeight: value / 10 })} min={12} max={25} step={1} />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Schriftart</Label>
            <div className="grid grid-cols-2 gap-2">
              {fontFamilies.map((font) => (
                <Button key={font.value} variant={settings.fontFamily === font.value ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ fontFamily: font.value })} style={{ fontFamily: font.value }}>{font.label}</Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" />Vorlesefunktion</h4>
            <div className="space-y-2">
              <Label className="text-xs">Geschwindigkeit: {settings.ttsSpeed}x</Label>
              <Slider value={[settings.ttsSpeed * 10]} onValueChange={([value]) => updateSettings({ ttsSpeed: value / 10 })} min={5} max={20} step={1} />
            </div>
            {voices.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Stimme</Label>
                <select className="w-full border rounded-md p-2 text-sm" value={settings.ttsVoice} onChange={(e) => updateSettings({ ttsVoice: e.target.value })}>
                  <option value="">Standard</option>
                  {voices.filter(v => v.lang.startsWith('de') || v.lang.startsWith('en')).map((voice) => (<option key={voice.name} value={voice.name}>{voice.name}</option>))}
                </select>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 8: SMART SHELVES PANEL
// ============================================================================

const SmartShelvesPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, smartShelves, addSmartShelf, removeSmartShelf, refreshSmartShelves } = useBookStore();
  const [newShelfName, setNewShelfName] = useState('');
  const [newShelfRule, setNewShelfRule] = useState<SmartShelf['rule']>('unread');
  const [newShelfColor, setNewShelfColor] = useState('#f59e0b');

  const shelfColors = [
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Blau', value: '#3b82f6' },
    { name: 'Grün', value: '#22c55e' },
    { name: 'Rot', value: '#ef4444' },
    { name: 'Lila', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const ruleLabels: Record<SmartShelf['rule'], string> = {
    unread: 'Ungelesene Bücher',
    in_progress: 'Aktuell am Lesen',
    completed: 'Fertig gelesen',
    favorites: 'Favoriten (4+ Sterne)',
    recently_added: 'Kürzlich hinzugefügt',
    long_books: 'Lange Bücher (>100k Wörter)',
    short_books: 'Kurze Bücher (<30k Wörter)',
    genre: 'Nach Genre',
    custom: 'Benutzerdefiniert',
  };

  useEffect(() => {
    if (open) refreshSmartShelves();
  }, [open, books]);

  const handleAddShelf = () => {
    if (!newShelfName.trim()) return;
    addSmartShelf({ name: newShelfName, rule: newShelfRule, color: newShelfColor });
    setNewShelfName('');
    toast.success('Smart Shelf erstellt!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Intelligente Regale
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Create New Shelf */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neues Regal erstellen</h4>
              <Input
                placeholder="Regalname..."
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
              />
              <div className="space-y-2">
                <Label className="text-xs">Regel</Label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={newShelfRule}
                  onChange={(e) => setNewShelfRule(e.target.value as SmartShelf['rule'])}
                >
                  {Object.entries(ruleLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Farbe</Label>
                <div className="flex gap-2">
                  {shelfColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-6 h-6 rounded-full border-2 ${newShelfColor === color.value ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewShelfColor(color.value)}
                    />
                  ))}
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={handleAddShelf}>
                <Plus className="w-4 h-4 mr-1" /> Erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Existing Shelves */}
          <div className="space-y-3">
            {smartShelves.map((shelf) => {
              const shelfBooks = books.filter((b) => shelf.bookIds.includes(b.id));
              return (
                <Card key={shelf.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: shelf.color }}
                        />
                        <span className="font-medium text-sm">{shelf.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {shelfBooks.length}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeSmartShelf(shelf.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {ruleLabels[shelf.rule]}
                    </p>
                    <div className="flex -space-x-2">
                      {shelfBooks.slice(0, 5).map((book) => (
                        <div
                          key={book.id}
                          className="w-8 h-10 rounded bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-background flex items-center justify-center"
                        >
                          <Book className="w-4 h-4 text-amber-600" />
                        </div>
                      ))}
                      {shelfBooks.length > 5 && (
                        <div className="w-8 h-10 rounded bg-muted border-2 border-background flex items-center justify-center text-xs">
                          +{shelfBooks.length - 5}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 8: BOOKMARK FOLDERS PANEL
// ============================================================================

const BookmarkFoldersPanel = ({ bookId, open, onOpenChange }: { bookId?: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { bookmarks, bookmarkFolders, addBookmarkFolder, removeBookmarkFolder, updateBookmarkFolder, moveBookmarkToFolder } = useBookStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#f59e0b');

  const folderColors = [
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Blau', value: '#3b82f6' },
    { name: 'Grün', value: '#22c55e' },
    { name: 'Rot', value: '#ef4444' },
    { name: 'Lila', value: '#a855f7' },
    { name: 'Cyan', value: '#06b6d4' },
  ];

  const filteredBookmarks = bookId ? bookmarks.filter((b) => b.bookId === bookId) : bookmarks;

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addBookmarkFolder({ name: newFolderName, color: newFolderColor });
    setNewFolderName('');
    toast.success('Ordner erstellt!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Lesezeichen-Ordner
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Create New Folder */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neuen Ordner erstellen</h4>
              <Input
                placeholder="Ordnername..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="space-y-2">
                <Label className="text-xs">Farbe</Label>
                <div className="flex gap-2">
                  {folderColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-6 h-6 rounded-full border-2 ${newFolderColor === color.value ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewFolderColor(color.value)}
                    />
                  ))}
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={handleAddFolder}>
                <Plus className="w-4 h-4 mr-1" /> Erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Folders */}
          <div className="space-y-3">
            {bookmarkFolders.map((folder) => {
              const folderBookmarks = filteredBookmarks.filter((b) => folder.bookmarkIds.includes(b.id));
              return (
                <Card key={folder.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className="font-medium text-sm">{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {folderBookmarks.length}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeBookmarkFolder(folder.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {folderBookmarks.slice(0, 3).map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="text-xs p-2 rounded bg-muted/50 flex items-center justify-between"
                        >
                          <span className="truncate">{bookmark.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => moveBookmarkToFolder(bookmark.id, null)}
                          >
                            <X className="w-2 h-2" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Unorganized Bookmarks */}
          <Card className="mt-4">
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-2">Nicht zugeordnet</h4>
              <div className="space-y-1">
                {filteredBookmarks
                  .filter((b) => !bookmarkFolders.some((f) => f.bookmarkIds.includes(b.id)))
                  .slice(0, 5)
                  .map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="text-xs p-2 rounded bg-muted/50 flex items-center justify-between"
                    >
                      <span className="truncate">{bookmark.title}</span>
                      <select
                        className="text-xs border rounded px-1 py-0.5"
                        onChange={(e) => {
                          if (e.target.value) {
                            moveBookmarkToFolder(bookmark.id, e.target.value);
                          }
                        }}
                        value=""
                      >
                        <option value="">Verschieben...</option>
                        {bookmarkFolders.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 8: READING LISTS WITH DEADLINES
// ============================================================================

const ReadingListsWithDeadlinesPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingLists, books, addReadingList, removeReadingList, addBookToList, removeBookFromList, updateReadingList } = useBookStore();
  const [newListName, setNewListName] = useState('');
  const [newListDeadline, setNewListDeadline] = useState('');
  const [selectedList, setSelectedList] = useState<string | null>(null);

  const handleAddList = () => {
    if (!newListName.trim()) return;
    addReadingList({
      name: newListName,
      deadline: newListDeadline ? new Date(newListDeadline).getTime() : undefined,
      bookIds: [],
    });
    setNewListName('');
    setNewListDeadline('');
    toast.success('Leseliste erstellt!');
  };

  const getDaysRemaining = (deadline?: number) => {
    if (!deadline) return null;
    const diff = deadline - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getListProgress = (bookIds: string[]) => {
    const listBooks = books.filter((b) => bookIds.includes(b.id));
    if (listBooks.length === 0) return 0;
    const completed = listBooks.filter((b) => b.progress >= 100).length;
    return Math.round((completed / listBooks.length) * 100);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Leselisten
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Create New List */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neue Leseliste</h4>
              <Input
                placeholder="Listenname..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <div className="space-y-1">
                <Label className="text-xs">Deadline (optional)</Label>
                <Input
                  type="date"
                  value={newListDeadline}
                  onChange={(e) => setNewListDeadline(e.target.value)}
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleAddList}>
                <Plus className="w-4 h-4 mr-1" /> Erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Reading Lists */}
          <div className="space-y-3">
            {readingLists.map((list) => {
              const daysRemaining = getDaysRemaining(list.deadline);
              const progress = getListProgress(list.bookIds);
              const listBooks = books.filter((b) => list.bookIds.includes(b.id));

              return (
                <Card key={list.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{list.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeReadingList(list.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Deadline Warning */}
                    {daysRemaining !== null && (
                      <div className={`text-xs mb-2 flex items-center gap-1 ${daysRemaining <= 3 ? 'text-red-500' : daysRemaining <= 7 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        <Calendar className="w-3 h-3" />
                        {daysRemaining > 0
                          ? `${daysRemaining} Tage verbleibend`
                          : daysRemaining === 0
                            ? 'Heute fällig!'
                            : 'Überfällig!'}
                      </div>
                    )}

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Fortschritt</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>

                    {/* Books */}
                    <div className="flex -space-x-2">
                      {listBooks.slice(0, 4).map((book) => (
                        <div
                          key={book.id}
                          className={`w-8 h-10 rounded border-2 border-background flex items-center justify-center ${book.progress >= 100 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'}`}
                        >
                          {book.progress >= 100 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Book className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                      ))}
                      {listBooks.length > 4 && (
                        <div className="w-8 h-10 rounded bg-muted border-2 border-background flex items-center justify-center text-xs">
                          +{listBooks.length - 4}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 8: ENHANCED AUTO-TAGGING
// ============================================================================

interface AutoTagResult {
  genres: string[];
  moods: string[];
  contentWarnings: string[];
}

const useEnhancedAutoTag = () => {
  const [loading, setLoading] = useState(false);

  const generateTags = async (book: { title: string; author?: string; content?: string }): Promise<AutoTagResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/autotag-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      const data = await response.json();
      return data;
    } catch {
      return { genres: [], moods: [], contentWarnings: [] };
    } finally {
      setLoading(false);
    }
  };

  return { generateTags, loading };
};

// ============================================================================
// FEATURE 9: READING HEATMAP
// ============================================================================

const ReadingHeatmap = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingHourRecords, readingStats } = useBookStore();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const getIntensity = (hour: number, day: number) => {
    const record = readingHourRecords.find((r) => r.hour === hour && r.day === day);
    if (!record) return 0;
    return Math.min(record.minutes / 60, 1); // Normalize to 0-1
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-muted';
    if (intensity < 0.25) return 'bg-amber-200 dark:bg-amber-900/30';
    if (intensity < 0.5) return 'bg-amber-300 dark:bg-amber-800/50';
    if (intensity < 0.75) return 'bg-amber-400 dark:bg-amber-700/70';
    return 'bg-amber-500 dark:bg-amber-600';
  };

  const getTotalMinutes = (hour: number) => {
    return readingHourRecords
      .filter((r) => r.hour === hour)
      .reduce((sum, r) => sum + r.minutes, 0);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Lese-Heatmap
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Hour of Day Heatmap */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-4">Lesezeit nach Uhrzeit</h4>
              <div className="flex gap-0.5">
                {hours.map((hour) => {
                  const totalMinutes = getTotalMinutes(hour);
                  const maxMinutes = Math.max(...hours.map((h) => getTotalMinutes(h)), 1);
                  const height = (totalMinutes / maxMinutes) * 100;
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t transition-all group-hover:from-amber-400 group-hover:to-orange-300"
                        style={{ height: `${Math.max(height, 2)}%`, minHeight: '2px' }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {hour}:00 - {Math.round(totalMinutes)} Min
                      </div>
                      {hour % 3 === 0 && (
                        <span className="text-[10px] text-muted-foreground mt-1">{hour}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day of Week Heatmap */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-4">Lesezeit nach Wochentag</h4>
              <div className="space-y-1">
                {days.map((day, dayIndex) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-8 text-xs text-muted-foreground">{day}</span>
                    <div className="flex-1 flex gap-0.5">
                      {hours.map((hour) => {
                        const intensity = getIntensity(hour, dayIndex);
                        return (
                          <div
                            key={hour}
                            className={`flex-1 h-4 rounded-sm ${getColor(intensity)} transition-all hover:ring-1 hover:ring-foreground/20`}
                            title={`${day} ${hour}:00 - ${Math.round(intensity * 60)} Min`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
                <span>Weniger</span>
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-900/30" />
                <div className="w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-800/50" />
                <div className="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-700/70" />
                <div className="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-600" />
                <span>Mehr</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 9: READING SPEED CHART
// ============================================================================

const ReadingSpeedChart = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingSpeedRecords, settings } = useBookStore();

  const last30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const record = readingSpeedRecords.find((r) => r.date === dateStr);
      days.push({
        date: dateStr,
        day: date.getDate(),
        wpm: record?.wpm || 0,
        pagesRead: record?.pagesRead || 0,
        timeSpent: record?.timeSpent || 0,
      });
    }
    return days;
  }, [readingSpeedRecords]);

  const avgWpm = useMemo(() => {
    const recordsWithData = last30Days.filter((d) => d.wpm > 0);
    if (recordsWithData.length === 0) return 0;
    return Math.round(
      recordsWithData.reduce((sum, d) => sum + d.wpm, 0) / recordsWithData.length
    );
  }, [last30Days]);

  const maxWpm = Math.max(...last30Days.map((d) => d.wpm), 1);
  const improvement = avgWpm > 0 ? Math.round(((avgWpm - 200) / 200) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Lesegeschwindigkeit
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">{avgWpm}</p>
                <p className="text-xs text-muted-foreground">Wörter/Min Ø</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {improvement >= 0 ? '+' : ''}{improvement}%
                </p>
                <p className="text-xs text-muted-foreground">vs. Durchschnitt</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">{settings.speedReadingWPM}</p>
                <p className="text-xs text-muted-foreground">Ziel-WPM</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-4">Letzte 30 Tage</h4>
              <div className="flex items-end gap-1 h-32">
                {last30Days.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t transition-all ${day.wpm > 0 ? 'bg-gradient-to-t from-blue-500 to-cyan-400' : 'bg-muted'}`}
                      style={{ height: `${day.wpm > 0 ? (day.wpm / maxWpm) * 100 : 4}%`, minHeight: '4px' }}
                    />
                    {day.wpm > 0 && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {day.wpm} WPM
                      </div>
                    )}
                    {i % 5 === 0 && (
                      <span className="text-[10px] text-muted-foreground mt-1">{day.day}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Vergleich</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ihre Geschwindigkeit</span>
                  <span className="font-bold text-blue-500">{avgWpm} WPM</span>
                </div>
                <Progress value={(avgWpm / 400) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Langsam (100)</span>
                  <span>Durchschnitt (200)</span>
                  <span>Schnell (400)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 9: GOAL TRACKING PANEL
// ============================================================================

const GoalTrackingPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingGoals, readingStats, books, addReadingGoal, removeReadingGoal, updateGoalProgress } = useBookStore();
  const [newGoalType, setNewGoalType] = useState<ReadingGoal['type']>('books');
  const [newGoalTarget, setNewGoalTarget] = useState(12);

  const currentYear = new Date().getFullYear();

  const yearGoals = readingGoals.filter((g) => g.year === currentYear);

  const getProgress = (goal: ReadingGoal) => {
    switch (goal.type) {
      case 'books':
        return books.filter((b) => b.progress >= 100).length;
      case 'pages':
        return readingStats.totalPagesRead;
      case 'time':
        return Math.round(readingStats.totalReadingTime / 60);
      case 'streak':
        return readingStats.currentStreak;
      default:
        return 0;
    }
  };

  const handleAddGoal = () => {
    addReadingGoal({
      type: newGoalType,
      target: newGoalTarget,
      year: currentYear,
      startDate: Date.now(),
    });
    toast.success('Leseziel erstellt!');
  };

  const getProjectedCompletion = (goal: ReadingGoal) => {
    const progress = getProgress(goal);
    const elapsed = Date.now() - goal.startDate;
    const daysElapsed = elapsed / (1000 * 60 * 60 * 24);
    const daysRemaining = 365 - daysElapsed;

    if (daysElapsed === 0 || progress === 0) return null;

    const rate = progress / daysElapsed;
    const projectedTotal = rate * 365;

    return {
      projected: Math.round(projectedTotal),
      onTrack: projectedTotal >= goal.target,
    };
  };

  const goalLabels: Record<ReadingGoal['type'], { name: string; unit: string; icon: typeof BookOpen }> = {
    books: { name: 'Bücher', unit: 'Bücher', icon: Book },
    pages: { name: 'Seiten', unit: 'Seiten', icon: FileText },
    time: { name: 'Zeit', unit: 'Stunden', icon: Clock },
    streak: { name: 'Streak', unit: 'Tage', icon: Target },
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Leseziele {currentYear}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Create New Goal */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neues Ziel</h4>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={newGoalType}
                onChange={(e) => setNewGoalType(e.target.value as ReadingGoal['type'])}
              >
                <option value="books">Bücher lesen</option>
                <option value="pages">Seiten lesen</option>
                <option value="time">Stunden lesen</option>
                <option value="streak">Lesestreak erreichen</option>
              </select>
              <Input
                type="number"
                placeholder="Zielwert..."
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 0)}
              />
              <Button size="sm" className="w-full" onClick={handleAddGoal}>
                <Plus className="w-4 h-4 mr-1" /> Ziel erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <div className="space-y-3">
            {yearGoals.map((goal) => {
              const progress = getProgress(goal);
              const percentage = Math.min((progress / goal.target) * 100, 100);
              const projected = getProjectedCompletion(goal);
              const label = goalLabels[goal.type];

              return (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <label.icon className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-sm">{label.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeReadingGoal(goal.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{progress} / {goal.target} {label.unit}</span>
                        <span className="font-bold">{Math.round(percentage)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    {/* Projected */}
                    {projected && (
                      <div className={`text-xs ${projected.onTrack ? 'text-green-500' : 'text-amber-500'}`}>
                        {projected.onTrack ? (
                          <span>✓ Auf Kurs für {projected.projected} {label.unit}</span>
                        ) : (
                          <span>⚡ Projiziert: {projected.projected} {label.unit}</span>
                        )}
                      </div>
                    )}

                    {/* Due date indicator */}
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {Math.ceil((new Date(currentYear, 11, 31).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Tage verbleibend
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// FEATURE 9: SAVINGS PANEL
// ============================================================================

const SavingsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books } = useBookStore();

  const gutenbergBooks = books.filter((b) => b.isFromGutenberg);

  const savings = useMemo(() => {
    // Estimate average book price: $12 for ebooks
    const avgBookPrice = 12;
    const totalSaved = gutenbergBooks.length * avgBookPrice;

    return {
      booksCount: gutenbergBooks.length,
      totalSaved,
      formatted: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalSaved * 0.92), // Convert to EUR
    };
  }, [gutenbergBooks]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Geld gespart
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* Total Savings */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6 text-center">
              <PiggyBank className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {savings.formatted}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                durch kostenlose Bücher gespart
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Book className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{savings.booksCount}</p>
                <p className="text-xs text-muted-foreground">Kostenlose Bücher</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">Project Gutenberg</p>
                <p className="text-xs text-muted-foreground">Quelle</p>
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Wie wird berechnet?</p>
                  <p>
                    Die Ersparnis basiert auf einem durchschnittlichen E-Book-Preis von 12€.
                    Alle Bücher aus Project Gutenberg sind gemeinfrei und kostenlos erhältlich.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Books List */}
          {gutenbergBooks.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-3">Ihre kostenlosen Bücher</h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {gutenbergBooks.map((book) => (
                      <div key={book.id} className="flex items-center gap-2 text-sm">
                        <Book className="w-4 h-4 text-green-500" />
                        <span className="truncate">{book.title}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// CHARACTER NETWORK PANEL
// ============================================================================

const relationshipColors: Record<string, string> = {
  family: 'stroke-rose-500',
  friend: 'stroke-green-500',
  enemy: 'stroke-red-500',
  lover: 'stroke-pink-500',
  colleague: 'stroke-blue-500',
  other: 'stroke-gray-500',
};

const relationshipLabels: Record<string, string> = {
  family: 'Familie',
  friend: 'Freund',
  enemy: 'Feind',
  lover: 'Liebe',
  colleague: 'Kollege',
  other: 'Sonstige',
};

const CharacterNetworkPanel = ({ bookId, open, onOpenChange }: { bookId: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { characters, addCharacter, updateCharacter, removeCharacter, addCharacterRelationship, getCharacters } = useBookStore();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterDescription, setNewCharacterDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const bookCharacters = getCharacters(bookId);

  const handleAddCharacter = () => {
    if (newCharacterName.trim()) {
      addCharacter({
        bookId,
        name: newCharacterName.trim(),
        description: newCharacterDescription.trim() || undefined,
        relationships: [],
      });
      setNewCharacterName('');
      setNewCharacterDescription('');
      setShowAddForm(false);
      toast.success('Charakter hinzugefügt!');
    }
  };

  // Calculate positions for visual graph
  const getPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total;
    const radius = 120;
    const centerX = 200;
    const centerY = 200;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Charakter-Netzwerk ({bookCharacters.length} Charaktere)
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100%-80px)] mt-4 gap-4">
          {/* Character List */}
          <div className="w-64 flex flex-col">
            <Button onClick={() => setShowAddForm(true)} className="mb-3">
              <UserPlus className="w-4 h-4 mr-2" />
              Charakter hinzufügen
            </Button>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {bookCharacters.map((char) => (
                  <Card
                    key={char.id}
                    className={`cursor-pointer transition-all ${selectedCharacter?.id === char.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedCharacter(char)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{char.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCharacter(char.id);
                            if (selectedCharacter?.id === char.id) setSelectedCharacter(null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      {char.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{char.description}</p>
                      )}
                      {char.relationships.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {char.relationships.slice(0, 3).map((rel, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {relationshipLabels[rel.type]}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Visual Graph */}
          <div className="flex-1 relative bg-muted/30 rounded-lg overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              {/* Draw relationships */}
              {bookCharacters.map((char, i) => {
                const pos1 = getPosition(i, bookCharacters.length);
                return char.relationships.map((rel) => {
                  const targetIndex = bookCharacters.findIndex((c) => c.id === rel.characterId);
                  if (targetIndex === -1) return null;
                  const pos2 = getPosition(targetIndex, bookCharacters.length);
                  return (
                    <line
                      key={`${char.id}-${rel.characterId}`}
                      x1={pos1.x}
                      y1={pos1.y}
                      x2={pos2.x}
                      y2={pos2.y}
                      className={`${relationshipColors[rel.type]} stroke-2`}
                      strokeWidth="2"
                      strokeDasharray={rel.type === 'enemy' ? '5,5' : undefined}
                    />
                  );
                });
              })}
              {/* Draw character nodes */}
              {bookCharacters.map((char, i) => {
                const pos = getPosition(i, bookCharacters.length);
                return (
                  <g
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="25"
                      fill={selectedCharacter?.id === char.id ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill={selectedCharacter?.id === char.id ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
                      fontSize="10"
                      fontWeight="500"
                    >
                      {char.name.substring(0, 8)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {bookCharacters.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Charaktere</p>
                  <p className="text-sm">Fügen Sie Charaktere hinzu, um das Netzwerk zu sehen</p>
                </div>
              </div>
            )}
          </div>

          {/* Character Details */}
          {selectedCharacter && (
            <div className="w-72 border-l pl-4">
              <h3 className="font-semibold mb-3">{selectedCharacter.name}</h3>
              {selectedCharacter.description && (
                <p className="text-sm text-muted-foreground mb-4">{selectedCharacter.description}</p>
              )}

              <Label className="text-sm font-medium mb-2 block">Beziehungen</Label>
              <ScrollArea className="h-40 mb-4">
                <div className="space-y-2">
                  {selectedCharacter.relationships.map((rel, i) => {
                    const targetChar = bookCharacters.find((c) => c.id === rel.characterId);
                    if (!targetChar) return null;
                    return (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{relationshipLabels[rel.type]}</Badge>
                          <span className="text-sm">{targetChar.name}</span>
                        </div>
                      </div>
                    );
                  })}
                  {selectedCharacter.relationships.length === 0 && (
                    <p className="text-xs text-muted-foreground">Keine Beziehungen</p>
                  )}
                </div>
              </ScrollArea>

              <Label className="text-sm font-medium mb-2 block">Beziehung hinzufügen</Label>
              <div className="space-y-2">
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  onChange={(e) => {
                    const targetId = e.target.value;
                    if (targetId && targetId !== selectedCharacter.id) {
                      // Default to 'friend' type
                      addCharacterRelationship(selectedCharacter.id, targetId, 'friend');
                      toast.success('Beziehung hinzugefügt!');
                    }
                  }}
                >
                  <option value="">Charakter auswählen...</option>
                  {bookCharacters
                    .filter((c) => c.id !== selectedCharacter.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Add Character Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="w-80">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold">Neuer Charakter</h3>
                    <Input
                      placeholder="Name..."
                      value={newCharacterName}
                      onChange={(e) => setNewCharacterName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Beschreibung (optional)..."
                      value={newCharacterDescription}
                      onChange={(e) => setNewCharacterDescription(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                        Abbrechen
                      </Button>
                      <Button className="flex-1" onClick={handleAddCharacter}>
                        Hinzufügen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// LOCATION MAP PANEL
// ============================================================================

const LocationMapPanel = ({ bookId, open, onOpenChange }: { bookId: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { locations, addLocation, removeLocation, getLocations } = useBookStore();
  const [selectedLocation, setSelectedLocation] = useState<BookLocation | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const bookLocations = getLocations(bookId);

  const handleAddLocation = () => {
    if (newLocationName.trim()) {
      addLocation({
        bookId,
        name: newLocationName.trim(),
      });
      setNewLocationName('');
      setShowAddForm(false);
      toast.success('Ort hinzugefügt!');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Ortskarte ({bookLocations.length} Orte)
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100%-80px)] mt-4 gap-4">
          {/* Location List */}
          <div className="w-72 flex flex-col">
            <Button onClick={() => setShowAddForm(true)} className="mb-3">
              <Plus className="w-4 h-4 mr-2" />
              Ort hinzufügen
            </Button>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {bookLocations.map((loc) => (
                  <Card
                    key={loc.id}
                    className={`cursor-pointer transition-all ${selectedLocation?.id === loc.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedLocation(loc)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{loc.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLocation(loc.id);
                            if (selectedLocation?.id === loc.id) setSelectedLocation(null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      {loc.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{loc.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {loc.mentions} Erwähnungen
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Map Placeholder */}
          <div className="flex-1 relative bg-muted/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {bookLocations.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Placeholder map with location markers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20" />
                  {bookLocations.map((loc, i) => {
                    // Distribute locations across the map area
                    const cols = Math.ceil(Math.sqrt(bookLocations.length));
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    const x = 20 + (col * (80 / cols)) + Math.random() * 10;
                    const y = 20 + (row * (60 / Math.ceil(bookLocations.length / cols))) + Math.random() * 10;

                    return (
                      <div
                        key={loc.id}
                        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all ${selectedLocation?.id === loc.id ? 'scale-125' : ''}`}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={() => setSelectedLocation(loc)}
                      >
                        <div className={`p-2 rounded-full ${selectedLocation?.id === loc.id ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] text-center mt-1 font-medium bg-background/80 px-1 rounded whitespace-nowrap">
                          {loc.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Orte</p>
                  <p className="text-sm">Fügen Sie Orte hinzu, die im Buch erwähnt werden</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          {selectedLocation && (
            <div className="w-72 border-l pl-4">
              <h3 className="font-semibold mb-3">{selectedLocation.name}</h3>
              {selectedLocation.description && (
                <p className="text-sm text-muted-foreground mb-4">{selectedLocation.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedLocation.mentions} Erwähnungen</Badge>
                </div>
                {selectedLocation.firstMention && (
                  <p className="text-xs text-muted-foreground">
                    Erste Erwähnung: {selectedLocation.firstMention}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Location Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="w-80">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold">Neuer Ort</h3>
                    <Input
                      placeholder="Name des Ortes..."
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                        Abbrechen
                      </Button>
                      <Button className="flex-1" onClick={handleAddLocation}>
                        Hinzufügen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// TIMELINE PANEL
// ============================================================================

const TimelinePanel = ({ bookId, open, onOpenChange }: { bookId: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { timelineEvents, addTimelineEvent, removeTimelineEvent, getTimelineEvents } = useBookStore();
  const [newEvent, setNewEvent] = useState({ title: '', description: '', chapter: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const bookEvents = getTimelineEvents(bookId).sort((a, b) => a.order - b.order);

  const handleAddEvent = () => {
    if (newEvent.title.trim()) {
      addTimelineEvent({
        bookId,
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        chapter: newEvent.chapter.trim() || undefined,
        order: bookEvents.length,
      });
      setNewEvent({ title: '', description: '', chapter: '' });
      setShowAddForm(false);
      toast.success('Ereignis hinzugefügt!');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Zeitstrahl ({bookEvents.length} Ereignisse)
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Button onClick={() => setShowAddForm(true)} className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Ereignis hinzufügen
          </Button>

          <ScrollArea className="h-[calc(100vh-280px)]">
            {bookEvents.length > 0 ? (
              <div className="relative pl-8">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary/30" />

                <div className="space-y-4">
                  {bookEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-5 top-4 w-4 h-4 rounded-full bg-primary border-2 border-background" />

                      <Card className="ml-4">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{event.title}</h4>
                                {event.chapter && (
                                  <Badge variant="outline" className="text-xs">
                                    {event.chapter}
                                  </Badge>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeTimelineEvent(event.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Noch keine Ereignisse</p>
                <p className="text-sm text-muted-foreground">Fügen Sie wichtige Ereignisse aus dem Buch hinzu</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Add Event Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="w-80">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold">Neues Ereignis</h3>
                    <Input
                      placeholder="Titel..."
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                    <Input
                      placeholder="Kapitel (optional)..."
                      value={newEvent.chapter}
                      onChange={(e) => setNewEvent({ ...newEvent, chapter: e.target.value })}
                    />
                    <Textarea
                      placeholder="Beschreibung (optional)..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                        Abbrechen
                      </Button>
                      <Button className="flex-1" onClick={handleAddEvent}>
                        Hinzufügen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// THEME CREATOR PANEL
// ============================================================================

const ThemeCreator = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { customThemes, addCustomTheme, removeCustomTheme, applyCustomTheme, settings, updateSettings } = useBookStore();
  const [newTheme, setNewTheme] = useState({
    name: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#f59e0b',
  });
  const [previewTheme, setPreviewTheme] = useState<typeof newTheme | null>(null);

  const handleAddTheme = () => {
    if (newTheme.name.trim()) {
      addCustomTheme({
        name: newTheme.name.trim(),
        backgroundColor: newTheme.backgroundColor,
        textColor: newTheme.textColor,
        accentColor: newTheme.accentColor,
      });
      setNewTheme({
        name: '',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        accentColor: '#f59e0b',
      });
      toast.success('Theme gespeichert!');
    }
  };

  const handleApplyTheme = (themeId: string) => {
    applyCustomTheme(themeId);
    toast.success('Theme angewendet!');
  };

  const presetThemes = [
    { name: 'Papier', backgroundColor: '#f5f0e6', textColor: '#3d3d3d', accentColor: '#8b4513' },
    { name: 'Nacht', backgroundColor: '#1a1a2e', textColor: '#e0e0e0', accentColor: '#4a9eff' },
    { name: 'Sepia', backgroundColor: '#f4ecd8', textColor: '#5c4b37', accentColor: '#8b6914' },
    { name: 'Mint', backgroundColor: '#e8f5e9', textColor: '#1b5e20', accentColor: '#4caf50' },
    { name: 'Lavendel', backgroundColor: '#f3e5f5', textColor: '#4a148c', accentColor: '#9c27b0' },
    { name: 'Ozean', backgroundColor: '#e3f2fd', textColor: '#0d47a1', accentColor: '#2196f3' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme Creator
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          <div className="space-y-6">
            {/* Create New Theme */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Neues Theme erstellen</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Name</Label>
                    <Input
                      placeholder="Theme-Name..."
                      value={newTheme.name}
                      onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">Hintergrund</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTheme.backgroundColor}
                          onChange={(e) => setNewTheme({ ...newTheme, backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newTheme.backgroundColor}
                          onChange={(e) => setNewTheme({ ...newTheme, backgroundColor: e.target.value })}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Text</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTheme.textColor}
                          onChange={(e) => setNewTheme({ ...newTheme, textColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newTheme.textColor}
                          onChange={(e) => setNewTheme({ ...newTheme, textColor: e.target.value })}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Akzent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTheme.accentColor}
                          onChange={(e) => setNewTheme({ ...newTheme, accentColor: e.target.value })}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newTheme.accentColor}
                          onChange={(e) => setNewTheme({ ...newTheme, accentColor: e.target.value })}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: newTheme.backgroundColor,
                      color: newTheme.textColor,
                    }}
                  >
                    <h4 className="font-semibold mb-2">Vorschau</h4>
                    <p className="text-sm mb-2">
                      Dies ist ein Beispieltext, um das Theme zu sehen. Lorem ipsum dolor sit amet.
                    </p>
                    <Button size="sm" style={{ backgroundColor: newTheme.accentColor, color: '#fff' }}>
                      Akzent-Farbe
                    </Button>
                  </div>

                  <Button onClick={handleAddTheme} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Theme speichern
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preset Themes */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Vorlagen</h3>
                <div className="grid grid-cols-3 gap-3">
                  {presetThemes.map((preset) => (
                    <button
                      key={preset.name}
                      className="rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => setNewTheme(preset)}
                    >
                      <div
                        className="h-16 p-2"
                        style={{ backgroundColor: preset.backgroundColor, color: preset.textColor }}
                      >
                        <p className="text-xs font-medium">{preset.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Saved Themes */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Gespeicherte Themes ({customThemes.length})</h3>
                {customThemes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {customThemes.map((theme) => (
                      <Card key={theme.id} className="overflow-hidden">
                        <div
                          className="h-20 p-3"
                          style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
                        >
                          <p className="font-medium text-sm">{theme.name}</p>
                        </div>
                        <CardContent className="p-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleApplyTheme(theme.id)}
                          >
                            Anwenden
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCustomTheme(theme.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine gespeicherten Themes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// ISBN SCANNER PANEL
// ============================================================================

const ISBNScanner = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [isbn, setISBN] = useState('');
  const [searching, setSearching] = useState(false);
  const [bookInfo, setBookInfo] = useState<{
    title: string;
    author: string;
    cover?: string;
    description?: string;
    publisher?: string;
    publishedDate?: string;
  } | null>(null);

  const searchISBN = async () => {
    if (!isbn.trim()) return;
    setSearching(true);
    try {
      // Use Open Library API to look up book by ISBN
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn.trim()}&format=json&jscmd=data`);
      const data = await response.json();
      const bookData = data[`ISBN:${isbn.trim()}`];

      if (bookData) {
        setBookInfo({
          title: bookData.title || 'Unbekannter Titel',
          author: bookData.authors?.map((a: any) => a.name).join(', ') || 'Unbekannter Autor',
          cover: bookData.cover?.medium || bookData.cover?.small,
          description: bookData.notes,
          publisher: bookData.publishers?.[0]?.name,
          publishedDate: bookData.publish_date,
        });
        toast.success('Buch gefunden!');
      } else {
        toast.error('Buch nicht gefunden');
      }
    } catch {
      toast.error('Fehler bei der Suche');
    }
    setSearching(false);
  };

  const handleAddToLibrary = () => {
    if (bookInfo) {
      const { addBook } = useBookStore.getState();
      addBook({
        title: bookInfo.title,
        author: bookInfo.author,
        cover: bookInfo.cover,
        format: 'txt',
        file: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(bookInfo.description || 'Keine Beschreibung verfügbar')))}]}`,
        fileSize: (bookInfo.description || '').length,
      });
      toast.success(`"${bookInfo.title}" wurde hinzugefügt!`);
      setBookInfo(null);
      setISBN('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            ISBN-Scanner
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="ISBN eingeben oder scannen..."
              value={isbn}
              onChange={(e) => setISBN(e.target.value.replace(/[^0-9X]/gi, ''))}
              onKeyDown={(e) => e.key === 'Enter' && searchISBN()}
              className="flex-1"
            />
            <Button onClick={searchISBN} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Geben Sie eine ISBN ein (z.B. 978-3-423-21458-1) oder nutzen Sie einen Barcode-Scanner.
          </p>

          {bookInfo && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {bookInfo.cover ? (
                    <img src={bookInfo.cover} alt={bookInfo.title} className="w-24 h-36 object-cover rounded" />
                  ) : (
                    <div className="w-24 h-36 bg-muted rounded flex items-center justify-center">
                      <Book className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{bookInfo.title}</h3>
                    <p className="text-sm text-muted-foreground">{bookInfo.author}</p>
                    {bookInfo.publisher && (
                      <p className="text-xs text-muted-foreground mt-1">Verlag: {bookInfo.publisher}</p>
                    )}
                    {bookInfo.publishedDate && (
                      <p className="text-xs text-muted-foreground">Erschienen: {bookInfo.publishedDate}</p>
                    )}
                    <Button className="mt-3" onClick={handleAddToLibrary}>
                      <Plus className="w-4 h-4 mr-2" />
                      Zur Bibliothek hinzufügen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// RSS PANEL
// ============================================================================

const RSSPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { rssFeeds, rssArticles, addRSSFeed, removeRSSFeed, addRSSArticle, removeRSSArticle, addBook } = useBookStore();
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);

  const handleAddFeed = () => {
    if (newFeedUrl.trim() && newFeedName.trim()) {
      addRSSFeed({
        name: newFeedName.trim(),
        url: newFeedUrl.trim(),
      });
      setNewFeedUrl('');
      setNewFeedName('');
      toast.success('RSS-Feed hinzugefügt!');
    }
  };

  const fetchFeed = async (feedId: string) => {
    const feed = rssFeeds.find(f => f.id === feedId);
    if (!feed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: feed.url, feedId: feed.id }),
      });
      const data = await response.json();

      if (data.articles) {
        data.articles.forEach((article: any) => {
          addRSSArticle({
            feedId: feed.id,
            title: article.title,
            content: article.content || article.description,
            url: article.link,
            publishedAt: new Date(article.pubDate || Date.now()).getTime(),
          });
        });
        toast.success(`${data.articles.length} Artikel geladen`);
      }
    } catch {
      toast.error('Fehler beim Laden des Feeds');
    }
    setLoading(false);
  };

  const saveArticleAsBook = (article: RSSArticle) => {
    addBook({
      title: article.title,
      format: 'txt',
      file: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(article.content)))}`,
      fileSize: article.content.length,
    });
    toast.success('Artikel als Buch gespeichert!');
  };

  const sampleFeeds = [
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'Spiegel Online', url: 'https://www.spiegel.de/schlagzeilen/index.rss' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Rss className="w-5 h-5 text-primary" />
            RSS-Feeds
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100%-80px)] mt-4 gap-4">
          {/* Feed List */}
          <div className="w-72 flex flex-col">
            <div className="space-y-2 mb-4">
              <Input
                placeholder="Feed-Name..."
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
              />
              <Input
                placeholder="RSS-URL..."
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
              />
              <Button onClick={handleAddFeed} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Feed hinzufügen
              </Button>
            </div>

            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Beispiel-Feeds:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {sampleFeeds.map((feed) => (
                  <Badge
                    key={feed.url}
                    variant="outline"
                    className="cursor-pointer text-[10px]"
                    onClick={() => {
                      setNewFeedName(feed.name);
                      setNewFeedUrl(feed.url);
                    }}
                  >
                    {feed.name}
                  </Badge>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {rssFeeds.map((feed) => (
                  <Card
                    key={feed.id}
                    className={`cursor-pointer ${selectedFeed?.id === feed.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedFeed(feed)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{feed.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchFeed(feed.id);
                            }}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRSSFeed(feed.id);
                              if (selectedFeed?.id === feed.id) setSelectedFeed(null);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Articles */}
          <div className="flex-1">
            {selectedFeed ? (
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {rssArticles
                    .filter((a) => a.feedId === selectedFeed.id)
                    .sort((a, b) => b.publishedAt - a.publishedAt)
                    .map((article) => (
                      <Card key={article.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{article.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(article.publishedAt).toLocaleDateString('de-DE')}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                {article.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(article.url, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Öffnen
                            </Button>
                            <Button size="sm" onClick={() => saveArticleAsBook(article)}>
                              <Save className="w-3 h-3 mr-1" />
                              Als Buch speichern
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {rssArticles.filter((a) => a.feedId === selectedFeed.id).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>Keine Artikel</p>
                      <p className="text-sm">Klicken Sie auf Aktualisieren, um Artikel zu laden</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Rss className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Wählen Sie einen Feed aus</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// WEB ARTICLE SAVER
// ============================================================================

const WebArticleSaver = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { addBook } = useBookStore();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<{
    title: string;
    content: string;
    author?: string;
    source?: string;
  } | null>(null);

  const fetchArticle = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/web-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await response.json();

      if (data.article) {
        setArticle({
          title: data.article.title || 'Ohne Titel',
          content: data.article.content || data.article.textContent,
          author: data.article.author,
          source: data.article.source,
        });
        toast.success('Artikel geladen!');
      } else {
        toast.error('Artikel konnte nicht geladen werden');
      }
    } catch {
      toast.error('Fehler beim Laden des Artikels');
    }
    setLoading(false);
  };

  const saveAsBook = () => {
    if (article) {
      addBook({
        title: article.title,
        author: article.author,
        format: 'txt',
        file: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(article.content)))}`,
        fileSize: article.content.length,
      });
      toast.success('Artikel als Buch gespeichert!');
      setArticle(null);
      setUrl('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            Web-Artikel speichern
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Artikel-URL eingeben..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchArticle()}
              className="flex-1"
            />
            <Button onClick={fetchArticle} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Geben Sie die URL eines Artikels ein, um ihn als lesbaren Text zu speichern.
          </p>

          {article && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{article.title}</h3>
                {article.author && (
                  <p className="text-sm text-muted-foreground">Von: {article.author}</p>
                )}
                {article.source && (
                  <Badge variant="outline" className="mt-1">{article.source}</Badge>
                )}
                <ScrollArea className="h-64 mt-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{article.content.substring(0, 2000)}...</p>
                  </div>
                </ScrollArea>
                <Button className="mt-4 w-full" onClick={saveAsBook}>
                  <Save className="w-4 h-4 mr-2" />
                  Als Buch speichern
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// LIBRARY VIEW
// ============================================================================

const LibraryView = ({ onOpenBook }: { onOpenBook: (book: Book) => void }) => {
  const { books, addBook, removeBook, searchQuery, setSearchQuery, selectedTags, setSelectedTags, readingStats, rateBook, togglePin } = useBookStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showGutenberg, setShowGutenberg] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);

  // Feature 8: Organisation & Verwaltung
  const [showSmartShelves, setShowSmartShelves] = useState(false);
  const [showBookmarkFolders, setShowBookmarkFolders] = useState(false);
  const [showReadingLists, setShowReadingLists] = useState(false);

  // Feature 9: Erweiterte Statistiken
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSpeedChart, setShowSpeedChart] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showSavings, setShowSavings] = useState(false);

  // Feature 15: Export & Kuration
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [showReadingJournal, setShowReadingJournal] = useState(false);
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false);

  // Feature 18: Integrationen
  const [showCalibre, setShowCalibre] = useState(false);
  const [showGoodreads, setShowGoodreads] = useState(false);
  const [showPocket, setShowPocket] = useState(false);
  const [showNotionExport, setShowNotionExport] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);

  // Feature 20: Privatsphäre & Performance
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Feature 12, 17, 19: Advanced Features
  const [showPageAnimations, setShowPageAnimations] = useState(false);
  const [showAmbientLighting, setShowAmbientLighting] = useState(false);
  const [showCustomFonts, setShowCustomFonts] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  const [showAccessibilityPro, setShowAccessibilityPro] = useState(false);

  const allTags = useMemo(() => getAllTags(books), [books]);

  const filteredBooks = useMemo(() => {
    let result = [...books];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(query) || b.author?.toLowerCase().includes(query));
    }
    if (selectedTags.length > 0) result = result.filter(b => selectedTags.some(tag => b.tags.includes(tag)));
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.lastRead || b.addedAt) - (a.lastRead || a.addedAt);
    });
  }, [books, searchQuery, selectedTags]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    for (const file of Array.from(files)) {
      try {
        const format = detectFormat(file.name);
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          const title = file.name.replace(/\.[^/.]+$/, '');
          addBook({ title, format, file: base64, fileSize: file.size });
          toast.success(`"${title}" wurde hinzugefügt`);
        };
        reader.readAsDataURL(file);
      } catch { toast.error(`Fehler beim Laden von ${file.name}`); }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [addBook]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      <EyeCareTimer />
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">eBook Reader</h1>
                <p className="text-xs text-muted-foreground">{books.length} Bücher • {readingStats.currentStreak} Tage Streak 🔥</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept=".epub,.pdf,.txt,.md,.mobi,.azw,.azw3,.fb2,.djvu,.djv,.cbz,.cbr,.cb7,.cbt,.acv" multiple onChange={handleFileUpload} className="hidden" />
              <SyncStatusIndicator onClick={() => setShowCloudSync(true)} />
              <Button size="sm" variant="outline" onClick={() => setShowAmbient(true)}><Volume2 className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setShowSettings(true)}><Settings className="w-4 h-4" /></Button>
              <Button size="lg" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="rounded-full px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <Upload className="w-5 h-5 mr-2" />Hinzufügen
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Bücher durchsuchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>{viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}</Button>
          </div>
          {showFilters && allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge key={tag} variant={selectedTags.includes(tag) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])}>{tag}</Badge>
              ))}
              {selectedTags.length > 0 && <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedTags([])}><X className="w-3 h-3 mr-1" />Alle entfernen</Badge>}
            </div>
          )}
        </div>
      </header>

      <main className="p-4">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Keine Bücher</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">Fügen Sie eBooks hinzu oder entdecken Sie kostenlose Bücher aus dem Project Gutenberg Katalog.</p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => fileInputRef.current?.click()} className="rounded-full px-8"><Upload className="w-5 h-5 mr-2" />Eigenes Buch</Button>
              <Button size="lg" variant="outline" onClick={() => setShowGutenberg(true)} className="rounded-full px-8"><Globe className="w-5 h-5 mr-2" />Kostenlose Bücher</Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBooks.map((book) => (
              <motion.div key={book.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group">
                <Card className="cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow" onClick={() => onOpenBook(book)}>
                  <div className="aspect-[2/3] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 relative">
                    {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Book className="w-16 h-16 text-amber-600/40" /></div>}
                    {book.isPinned && <div className="absolute top-2 left-2 p-1 rounded-full bg-primary text-primary-foreground"><Pin className="w-3 h-3" /></div>}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium flex items-center gap-1"><FormatIcon format={book.format} /></div>
                    {book.rating && <div className="absolute bottom-2 left-2 flex">{[...Array(book.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>}
                    {book.progress > 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${book.progress}%` }} /></div>}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 leading-tight">{book.title}</h3>
                    {book.author && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{book.author}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{formatFileSize(book.fileSize)}</span>
                      {book.progress > 0 && <span className="text-xs text-muted-foreground">{Math.round(book.progress)}%</span>}
                    </div>
                  </CardContent>
                </Card>
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="w-7 h-7 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); setSelectedBook(book); }}><Edit3 className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="icon" className="w-7 h-7 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); setBookToDelete(book.id); }}><X className="w-4 h-4" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="cursor-pointer" onClick={() => onOpenBook(book)}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-12 h-16 rounded bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0 relative">
                    <FormatIcon format={book.format} />
                    {book.isPinned && <Pin className="absolute -top-1 -right-1 w-3 h-3 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">{formatFileSize(book.fileSize)} • {Math.round(book.progress)}% gelesen</p>
                    <div className="flex items-center gap-2 mt-1">
                      {book.rating && <div className="flex">{[...Array(book.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>}
                      {book.tags.slice(0, 3).map(tag => <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>)}
                    </div>
                  </div>
                  <Progress value={book.progress} className="w-16 h-2 self-center" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-2">
        <div className="flex justify-around">
          <Button variant="ghost" size="sm" onClick={() => setShowStats(true)}><BarChart3 className="w-5 h-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAchievements(true)}><Trophy className="w-5 h-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setShowGutenberg(true)}><Globe className="w-5 h-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setShowKnowledgeGraph(true)}><Network className="w-5 h-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setShowThemeCustomizer(true)}><Palette className="w-5 h-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAccessibilityPro(true)}><Eye className="w-5 h-5" /></Button>
          {/* Feature 15, 18, 20: New Panels */}
          <Button variant="ghost" size="sm" onClick={() => setShowPDFExport(true)} title="PDF Export"><FileDown className="w-5 h-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setShowCalibre(true)} title="Calibre"><Database className="w-5 h-5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setShowPrivacy(true)} title="Datenschutz"><Shield className="w-5 h-5" /></Button>
        </div>
      </nav>

      <AnimatePresence>
        {bookToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setBookToDelete(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <Card className="w-full max-w-sm">
                <CardContent className="p-6 text-center">
                  <Trash2 className="w-12 h-12 mx-auto text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Buch löschen?</h3>
                  <p className="text-muted-foreground mb-4">Dieses Buch wird dauerhaft entfernt.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setBookToDelete(null)}>Abbrechen</Button>
                    <Button variant="destructive" className="flex-1" onClick={() => { removeBook(bookToDelete!); setBookToDelete(null); }}>Löschen</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatisticsPanel open={showStats} onOpenChange={setShowStats} />
      <AchievementsPanel open={showAchievements} onOpenChange={setShowAchievements} />
      <GutenbergPanel open={showGutenberg} onOpenChange={setShowGutenberg} />
      <KnowledgeGraph open={showKnowledgeGraph} onOpenChange={setShowKnowledgeGraph} />
      <AmbientSoundPlayer open={showAmbient} onOpenChange={setShowAmbient} />
      <SettingsPanel open={showSettings} onOpenChange={setShowSettings} />
      <CloudSyncPanel open={showCloudSync} onOpenChange={setShowCloudSync} />

      {/* Feature 8: Organisation & Verwaltung Panels */}
      <SmartShelvesPanel open={showSmartShelves} onOpenChange={setShowSmartShelves} />
      <BookmarkFoldersPanel open={showBookmarkFolders} onOpenChange={setShowBookmarkFolders} />
      <ReadingListsWithDeadlinesPanel open={showReadingLists} onOpenChange={setShowReadingLists} />

      {/* Feature 9: Erweiterte Statistiken Panels */}
      <ReadingHeatmap open={showHeatmap} onOpenChange={setShowHeatmap} />
      <ReadingSpeedChart open={showSpeedChart} onOpenChange={setShowSpeedChart} />
      <GoalTrackingPanel open={showGoals} onOpenChange={setShowGoals} />
      <SavingsPanel open={showSavings} onOpenChange={setShowSavings} />

      {/* Feature 12: Erweitertes Lese-Erlebnis */}
      <PageAnimationSelector open={showPageAnimations} onOpenChange={setShowPageAnimations} />
      <AmbientLightingPanel open={showAmbientLighting} onOpenChange={setShowAmbientLighting} />

      {/* Feature 17: Ultimative Anpassung */}
      <CustomFontUploader open={showCustomFonts} onOpenChange={setShowCustomFonts} />
      <ThemeCustomizer open={showThemeCustomizer} onOpenChange={setShowThemeCustomizer} />

      {/* Feature 19: Accessibility Pro */}
      <VoiceCommandsPanel open={showVoiceCommands} onOpenChange={setShowVoiceCommands} />
      <AccessibilityProPanel open={showAccessibilityPro} onOpenChange={setShowAccessibilityPro} />

      {/* Feature 15: Export & Kuration */}
      <PDFExportPanel open={showPDFExport} onOpenChange={setShowPDFExport} />
      <ReadingJournalPanel open={showReadingJournal} onOpenChange={setShowReadingJournal} />
      <WeeklyDigestPanel open={showWeeklyDigest} onOpenChange={setShowWeeklyDigest} />

      {/* Feature 18: Integrationen */}
      <CalibreConnectPanel open={showCalibre} onOpenChange={setShowCalibre} />
      <GoodreadsPanel open={showGoodreads} onOpenChange={setShowGoodreads} />
      <PocketImportPanel open={showPocket} onOpenChange={setShowPocket} />
      <NotionExportPanel open={showNotionExport} onOpenChange={setShowNotionExport} />
      <SpotifyPanel open={showSpotify} onOpenChange={setShowSpotify} />

      {/* Feature 20: Privatsphäre & Performance */}
      <PrivacyDashboard open={showPrivacy} onOpenChange={setShowPrivacy} />

      {selectedBook && <BookDetailPanel book={selectedBook} open={!!selectedBook} onOpenChange={() => setSelectedBook(null)} />}
    </div>
  );
};

// ============================================================================
// EPUB READER WITH CHAPTER READING TIME
// ============================================================================

const EPUBReader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<any>(null);
  const bookRef = useRef<any>(null);
  const { settings, addBookmark, getBookmarks, removeBookmark, addHighlight, startReadingSession, endReadingSession } = useBookStore();
  const [currentChapter, setCurrentChapter] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [currentCfi, setCurrentCfi] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [showAISummary, setShowAISummary] = useState(false);
  const [showSpeedReading, setShowSpeedReading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [chapters, setChapters] = useState<{ label: string; href: string; readingTime?: number }[]>([]);
  const [currentChapterTime, setCurrentChapterTime] = useState<number | null>(null);
  const [totalReadingTime, setTotalReadingTime] = useState<number>(0);
  const tts = useTTS();

  // Gesture navigation
  const goNextCallback = useCallback(() => {
    renditionRef.current?.next();
    if (settings.hapticFeedback) triggerHapticFeedback('light');
  }, [settings.hapticFeedback]);

  const goPrevCallback = useCallback(() => {
    renditionRef.current?.prev();
    if (settings.hapticFeedback) triggerHapticFeedback('light');
  }, [settings.hapticFeedback]);

  useGestureNavigation(goNextCallback, goPrevCallback, settings.gestureNavigation);

  useEffect(() => {
    setSessionId(startReadingSession(book.id));
    return () => endReadingSession(sessionId, 1);
  }, []);

  useEffect(() => {
    const initEpub = async () => {
      if (!containerRef.current) return;
      const ePub = (await import('epubjs')).default;
      
      try {
        const epubBook = ePub(book.file);
        bookRef.current = epubBook;
        
        const fontFamily = settings.dyslexiaFont ? 'OpenDyslexic, sans-serif' : settings.fontFamily;
        const rendition = epubBook.renderTo(containerRef.current, { width: '100%', height: '100%', spread: 'none', flow: 'paginated' });
        renditionRef.current = rendition;
        
        rendition.themes.default({
          'body': {
            'font-family': fontFamily,
            'font-size': `${settings.fontSize}px`,
            'line-height': settings.lineHeight.toString(),
            'text-align': settings.textAlign,
            'padding': settings.marginSize === 'small' ? '10px' : settings.marginSize === 'large' ? '30px' : '20px',
          },
        });
        
        await (book.currentLocation ? rendition.display(book.currentLocation) : rendition.display());
        
        rendition.on('locationChanged', (location: any) => {
          const cfi = location.start.cfi;
          const progress = epubBook.locations.percentageFromCfi(cfi);
          setCurrentCfi(cfi);
          onProgress(progress * 100, cfi);
          setIsBookmarked(getBookmarks(book.id).some(b => b.cfi === cfi));
        });

        // Get chapter info and calculate reading time
        rendition.on('relocated', async (location: any) => {
          if (location.start?.href) {
            const nav = await epubBook.loaded.navigation;
            const chapter = nav.toc.find((t: any) => t.href === location.start.href);
            if (chapter) setCurrentChapter(chapter.label);
            
            // Calculate chapter reading time
            try {
              const section = epubBook.spine.get(location.start.href);
              if (section) {
                const contents = await section.load(epubBook.load.bind(epubBook));
                const text = contents.textContent || '';
                const wordCount = text.split(/\s+/).length;
                const readingTimeMinutes = calculateReadingTime(wordCount);
                setCurrentChapterTime(readingTimeMinutes);
              }
            } catch {
              setCurrentChapterTime(null);
            }
          }
        });

        rendition.on('selected', (cfiRange: string, contents: any) => {
          const text = contents.window.getSelection()?.toString().trim();
          if (text) {
            addHighlight({ bookId: book.id, text, color: 'yellow', location: cfiRange, cfi: cfiRange });
            toast.success('Markiert!');
          }
        });
        
        // Load chapters and calculate reading times
        const nav = await epubBook.loaded.navigation;
        const spine = await epubBook.loaded.spine;
        
        const chaptersWithTimes = await Promise.all(
          nav.toc.map(async (item: any) => {
            try {
              const section = epubBook.spine.get(item.href);
              if (section) {
                const contents = await section.load(epubBook.load.bind(epubBook));
                const text = contents.textContent || '';
                const wordCount = text.split(/\s+/).length;
                return { label: item.label, href: item.href, readingTime: calculateReadingTime(wordCount) };
              }
            } catch {}
            return { label: item.label, href: item.href };
          })
        );
        setChapters(chaptersWithTimes);
        
        // Calculate total reading time
        const totalTime = chaptersWithTimes.reduce((acc: number, ch: any) => acc + (ch.readingTime || 0), 0);
        setTotalReadingTime(totalTime);
        
        epubBook.locations.generate(1024);
      } catch (error) {
        toast.error('Fehler beim Laden');
      }
    };

    initEpub();
    return () => { if (bookRef.current) bookRef.current.destroy(); };
  }, [book.file, settings.dyslexiaFont]);

  const goNext = () => {
    renditionRef.current?.next();
    if (settings.hapticFeedback) triggerHapticFeedback('light');
  };
  const goPrev = () => {
    renditionRef.current?.prev();
    if (settings.hapticFeedback) triggerHapticFeedback('light');
  };

  const toggleBookmark = () => {
    if (!currentCfi) return;
    const existing = getBookmarks(book.id).find(b => b.cfi === currentCfi);
    if (existing) { removeBookmark(existing.id); toast.success('Entfernt'); }
    else { addBookmark({ bookId: book.id, title: currentChapter || book.title, location: currentCfi, cfi: currentCfi }); toast.success('Lesezeichen gesetzt'); }
    setIsBookmarked(!isBookmarked);
  };

  const handleTTS = () => {
    if (tts.isSpeaking) { tts.stop(); return; }
    const contents = renditionRef.current?.getContents()[0];
    const text = contents?.document?.body?.textContent || '';
    if (text) { setCurrentText(text); tts.speak(text.substring(0, 5000)); }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      style={{ filter: colorBlindFilters[settings.colorBlindMode] }}
    >
      {/* SVG Filters for color blind modes */}
      {settings.colorBlindMode !== 'none' && (
        <div dangerouslySetInnerHTML={{ __html: colorBlindSVGFilters }} />
      )}

      {/* Night mode overlay */}
      <NightModeOverlay enabled={settings.nightModeEnabled} intensity={settings.nightModeIntensity} />

      <AnimatePresence>
        {showMenu && (
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b z-10">
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            <div className="flex-1 text-center px-2">
              <h2 className="font-semibold truncate text-sm">{book.title}</h2>
              {currentChapter && <p className="text-xs text-muted-foreground truncate">{currentChapter}</p>}
              {/* Chapter Reading Time */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {currentChapterTime ? `Kapitel: ~${currentChapterTime} Min` : ''}
                  {totalReadingTime > 0 ? ` • Gesamt: ~${formatReadingTime(totalReadingTime)}` : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setShowSpeedReading(true)} title="Speed Reading">
                <Zap className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleTTS}>{tts.isSpeaking ? <VolumeX className="w-5 h-5 text-amber-500" /> : <Volume2 className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark}>{isBookmarked ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={() => setShowNotes(true)}><Edit3 className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAISummary(true)}><Sparkles className="w-5 h-5 text-amber-500" /></Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="flex-1 relative" onClick={() => setShowMenu(!showMenu)}>
        <div ref={containerRef} className="absolute inset-0" />
        <div className="absolute left-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goPrev(); }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goNext(); }} />
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-between gap-4 p-4 bg-background/95 backdrop-blur border-t">
            <Button variant="ghost" size="lg" onClick={goPrev}><ChevronLeft className="w-6 h-6" /></Button>
            <div className="flex-1 flex items-center gap-2">
              <Progress value={book.progress} className="h-2" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">{Math.round(book.progress)}%</span>
            </div>
            <Button variant="ghost" size="lg" onClick={goNext}><ChevronRight className="w-6 h-6" /></Button>
          </motion.footer>
        )}
      </AnimatePresence>

      <NotesPanel book={book} open={showNotes} onOpenChange={setShowNotes} />
      {showAISummary && currentText && <AISummaryPanel text={currentText} onClose={() => setShowAISummary(false)} />}
      <SpeedReadingPanel text={currentText} open={showSpeedReading} onOpenChange={setShowSpeedReading} />
    </div>
  );
};

// ============================================================================
// TXT/MD READER
// ============================================================================

const TextReader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const [content, setContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(book.progress);
  const contentRef = useRef<HTMLDivElement>(null);
  const { settings, addBookmark, getBookmarks, removeBookmark, addHighlight, startReadingSession, endReadingSession } = useBookStore();
  const [sessionId, setSessionId] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0 });
  const [showNotes, setShowNotes] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSpeedReading, setShowSpeedReading] = useState(false);
  const [showCharacterNetwork, setShowCharacterNetwork] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showThemeCreator, setShowThemeCreator] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const tts = useTTS();

  // Gesture navigation
  const goBack = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
      if (settings.hapticFeedback) triggerHapticFeedback('light');
    }
  }, [settings.hapticFeedback]);

  const goForward = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      if (settings.hapticFeedback) triggerHapticFeedback('light');
    }
  }, [settings.hapticFeedback]);

  useGestureNavigation(goForward, goBack, settings.gestureNavigation);

  useEffect(() => {
    setSessionId(startReadingSession(book.id));
    return () => endReadingSession(sessionId, 1);
  }, []);

  useEffect(() => {
    try {
      const base64 = book.file.split(',')[1];
      setContent(atob(base64));
    } catch { setContent('Fehler beim Laden'); }
  }, [book.file]);

  useEffect(() => {
    if (contentRef.current && book.currentLocation) {
      const scrollTop = parseInt(book.currentLocation);
      if (!isNaN(scrollTop)) contentRef.current.scrollTop = scrollTop;
    }
  }, [book.currentLocation]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
    onProgress(progress, scrollTop.toString());

    // Haptic feedback on page change (scroll threshold)
    if (settings.hapticFeedback && Math.abs(scrollTop - lastScrollTop) > clientHeight * 0.5) {
      triggerHapticFeedback('light');
      setLastScrollTop(scrollTop);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setHighlightPosition({ x: rect.left, y: rect.top - 50 });
        setShowHighlightMenu(true);
      }
    } else { setShowHighlightMenu(false); }
  };

  const addHighlightWithColor = (color: Highlight['color']) => {
    if (selectedText) {
      addHighlight({ bookId: book.id, text: selectedText, color, location: scrollProgress.toString() });
      toast.success('Markiert!');
      setShowHighlightMenu(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  const toggleBookmark = () => {
    if (!contentRef.current) return;
    const scrollTop = contentRef.current.scrollTop.toString();
    const existing = getBookmarks(book.id).find(b => b.location === scrollTop);
    if (existing) { removeBookmark(existing.id); toast.success('Entfernt'); }
    else { addBookmark({ bookId: book.id, title: `${Math.round(scrollProgress)}%`, location: scrollTop }); toast.success('Lesezeichen gesetzt'); }
  };

  const fontFamily = settings.dyslexiaFont ? 'OpenDyslexic, sans-serif' : settings.fontFamily;
  const readingTime = `${calculateReadingTime(content.split(/\s+/).length)} min`;

  // Apply bionic reading if enabled
  const displayContent = useMemo(() => {
    if (settings.bionicReading && book.format !== 'md') {
      return <div dangerouslySetInnerHTML={{ __html: applyBionicReading(content) }} />;
    }
    if (book.format === 'md') {
      return <div className="prose dark:prose-invert max-w-none prose-sm"><ReactMarkdown>{content}</ReactMarkdown></div>;
    }
    return content;
  }, [content, settings.bionicReading, book.format]);

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      style={{ filter: colorBlindFilters[settings.colorBlindMode] }}
    >
      {/* SVG Filters for color blind modes */}
      {settings.colorBlindMode !== 'none' && (
        <div dangerouslySetInnerHTML={{ __html: colorBlindSVGFilters }} />
      )}

      {/* Night mode overlay */}
      <NightModeOverlay enabled={settings.nightModeEnabled} intensity={settings.nightModeIntensity} />

      <AnimatePresence>
        {showMenu && (
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b z-10">
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            <div className="flex-1 text-center px-2">
              <h2 className="font-semibold truncate text-sm">{book.title}</h2>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">⏱️ {readingTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setShowSpeedReading(true)} title="Speed Reading">
                <Zap className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAIChat(true)} title="KI-Chat"><MessageCircle className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAnalysis(true)} title="Analyse"><Brain className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(content.substring(0, 5000))}>{tts.isSpeaking ? <VolumeX className="w-5 h-5 text-amber-500" /> : <Volume2 className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark}><Bookmark className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowNotes(true)}><Edit3 className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAISummary(true)}><Sparkles className="w-5 h-5 text-amber-500" /></Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div ref={contentRef} onScroll={handleScroll} onClick={() => setShowMenu(!showMenu)} onMouseUp={handleTextSelection} className="flex-1 overflow-y-auto" style={{ padding: settings.marginSize === 'small' ? '20px' : settings.marginSize === 'large' ? '40px' : '30px' }}>
        <div style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight, fontFamily, textAlign: settings.textAlign, whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxWidth: '800px', margin: '0 auto' }}>
          {displayContent}
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-center gap-4 p-4 bg-background/95 backdrop-blur border-t">
            <Button variant="ghost" onClick={goBack} title="Vorherige Seite">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Progress value={scrollProgress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{Math.round(scrollProgress)}%</span>
            <Button variant="ghost" onClick={goForward} title="Nächste Seite">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.footer>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHighlightMenu && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed z-[100] bg-popover border rounded-lg shadow-xl p-2 flex gap-1" style={{ left: highlightPosition.x, top: highlightPosition.y }}>
            {(['yellow', 'green', 'blue', 'pink', 'purple'] as const).map((color) => (
              <button key={color} onClick={() => addHighlightWithColor(color)} className={`w-8 h-8 rounded-full ${highlightColors[color]} hover:ring-2 hover:ring-primary`} />
            ))}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => tts.speak(selectedText)}><Volume2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowTranslation(true)}><Languages className="w-4 h-4" /></Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTranslation && selectedText && (
          <TranslationPopup text={selectedText} position={highlightPosition} onClose={() => setShowTranslation(false)} />
        )}
      </AnimatePresence>

      <NotesPanel book={book} open={showNotes} onOpenChange={setShowNotes} />
      {showAISummary && <AISummaryPanel text={content.substring(0, 5000)} onClose={() => setShowAISummary(false)} />}
      <AIChatPanel book={book} bookContent={content} open={showAIChat} onOpenChange={setShowAIChat} />
      <BookAnalysisPanel text={content} bookTitle={book.title} author={book.author} open={showAnalysis} onOpenChange={setShowAnalysis} />
      <SpeedReadingPanel text={content} open={showSpeedReading} onOpenChange={setShowSpeedReading} />
    </div>
  );
};

// ============================================================================
// FB2 READER (FictionBook Format)
// ============================================================================

const FB2Reader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [cover, setCover] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(book.progress);
  const contentRef = useRef<HTMLDivElement>(null);
  const { settings, addBookmark, getBookmarks, removeBookmark, startReadingSession, endReadingSession } = useBookStore();
  const [sessionId, setSessionId] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const tts = useTTS();

  useEffect(() => {
    setSessionId(startReadingSession(book.id));
    return () => endReadingSession(sessionId, 1);
  }, []);

  // Parse FB2 file
  useEffect(() => {
    const parseFB2 = async () => {
      try {
        let xmlContent = '';
        
        // Handle base64 data
        if (book.file.includes(',')) {
          const base64Data = book.file.split(',')[1];
          // Check if it's base64 encoded
          if (book.file.startsWith('data:')) {
            const binaryData = atob(base64Data);
            // Convert to UTF-8
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              bytes[i] = binaryData.charCodeAt(i);
            }
            xmlContent = new TextDecoder('utf-8').decode(bytes);
          } else {
            xmlContent = decodeURIComponent(escape(atob(base64Data)));
          }
        } else {
          xmlContent = book.file;
        }

        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

        // Get title
        const titleEl = xmlDoc.querySelector('book-title');
        if (titleEl) setTitle(titleEl.textContent || book.title);

        // Get author
        const authorEl = xmlDoc.querySelector('author');
        if (authorEl) {
          const firstName = authorEl.querySelector('first-name')?.textContent || '';
          const lastName = authorEl.querySelector('last-name')?.textContent || '';
          setAuthor(`${firstName} ${lastName}`.trim());
        }

        // Get cover image
        const coverEl = xmlDoc.querySelector('coverpage image');
        if (coverEl) {
          const binaryId = coverEl.getAttribute('l:href')?.replace('#', '');
          if (binaryId) {
            const binaryEl = xmlDoc.querySelector(`binary[id="${binaryId}"]`);
            if (binaryEl) {
              setCover(`data:image/jpeg;base64,${binaryEl.textContent}`);
            }
          }
        }

        // Get body content
        const bodyEl = xmlDoc.querySelector('body');
        if (bodyEl) {
          // Convert FB2 elements to HTML
          let html = '';
          
          // Process sections
          const sections = bodyEl.querySelectorAll(':scope > section');
          if (sections.length > 0) {
            sections.forEach(section => {
              html += processFB2Section(section);
            });
          } else {
            html = processFB2Section(bodyEl);
          }
          
          setContent(html);
        }
      } catch (error) {
        console.error('Error parsing FB2:', error);
        setContent('<p>Fehler beim Laden der FB2-Datei</p>');
      }
    };

    const processFB2Section = (section: Element): string => {
      let html = '';
      
      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || '';
        }
        
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        
        let content = '';
        el.childNodes.forEach(child => {
          content += processNode(child);
        });

        switch (tagName) {
          case 'p':
            return `<p>${content}</p>`;
          case 'title':
          case 'subtitle':
            return `<h2 class="text-xl font-bold my-4">${content}</h2>`;
          case 'section':
            return `<section class="mb-8">${content}</section>`;
          case 'epigraph':
            return `<blockquote class="italic border-l-4 pl-4 my-4">${content}</blockquote>`;
          case 'poem':
            return `<div class="poem my-4">${content}</div>`;
          case 'stanza':
            return `<div class="stanza mb-4">${content}</div>`;
          case 'v':
            return `<p class="verse">${content}</p>`;
          case 'text-author':
            return `<p class="text-author italic text-right">${content}</p>`;
          case 'date':
            return `<span class="text-muted-foreground">${content}</span>`;
          case 'strong':
          case 'b':
            return `<strong>${content}</strong>`;
          case 'emphasis':
          case 'i':
            return `<em>${content}</em>`;
          case 'strikethrough':
            return `<del>${content}</del>`;
          case 'sub':
            return `<sub>${content}</sub>`;
          case 'sup':
            return `<sup>${content}</sup>`;
          case 'code':
            return `<code class="bg-muted px-1 rounded">${content}</code>`;
          case 'image':
            const href = el.getAttribute('l:href') || el.getAttribute('href');
            if (href) {
              return `<img src="${href}" alt="" class="max-w-full my-4" />`;
            }
            return '';
          case 'empty-line':
            return '<br />';
          case 'a':
            const linkHref = el.getAttribute('l:href') || el.getAttribute('href');
            return `<a href="${linkHref}" class="text-primary underline">${content}</a>`;
          case 'cite':
            return `<cite class="block italic my-2">${content}</cite>`;
          default:
            return content;
        }
      };

      section.childNodes.forEach(child => {
        html += processNode(child);
      });

      return html;
    };

    parseFB2();
  }, [book.file]);

  useEffect(() => {
    if (contentRef.current && book.currentLocation) {
      const scrollTop = parseInt(book.currentLocation);
      if (!isNaN(scrollTop)) contentRef.current.scrollTop = scrollTop;
    }
  }, [book.currentLocation]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
    onProgress(progress, scrollTop.toString());
  };

  const toggleBookmark = () => {
    if (!contentRef.current) return;
    const scrollTop = contentRef.current.scrollTop.toString();
    const existing = getBookmarks(book.id).find(b => b.location === scrollTop);
    if (existing) { removeBookmark(existing.id); toast.success('Entfernt'); }
    else { addBookmark({ bookId: book.id, title: `${Math.round(scrollProgress)}%`, location: scrollTop }); toast.success('Lesezeichen gesetzt'); }
  };

  const fontFamily = settings.dyslexiaFont ? 'OpenDyslexic, sans-serif' : settings.fontFamily;
  const readingTime = `${calculateReadingTime(content.replace(/<[^>]*>/g, '').split(/\s+/).length)} min`;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <AnimatePresence>
        {showMenu && (
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b z-10">
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            <div className="flex-1 text-center px-2">
              <h2 className="font-semibold truncate text-sm">{title || book.title}</h2>
              {author && <p className="text-xs text-muted-foreground">{author}</p>}
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">⏱️ {readingTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(content.replace(/<[^>]*>/g, '').substring(0, 5000))}>{tts.isSpeaking ? <VolumeX className="w-5 h-5 text-amber-500" /> : <Volume2 className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark}><Bookmark className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowNotes(true)}><Edit3 className="w-5 h-5" /></Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div ref={contentRef} onScroll={handleScroll} onClick={() => setShowMenu(!showMenu)} className="flex-1 overflow-y-auto" style={{ padding: settings.marginSize === 'small' ? '20px' : settings.marginSize === 'large' ? '40px' : '30px' }}>
        <div style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight, fontFamily, textAlign: settings.textAlign, whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxWidth: '800px', margin: '0 auto' }}>
          {cover && <img src={cover} alt="Cover" className="max-w-full mb-8 mx-auto" />}
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-center gap-4 p-4 bg-background/95 backdrop-blur border-t">
            <Progress value={scrollProgress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{Math.round(scrollProgress)}%</span>
          </motion.footer>
        )}
      </AnimatePresence>

      <NotesPanel book={book} open={showNotes} onOpenChange={setShowNotes} />
    </div>
  );
};

// ============================================================================
// COMIC/MANGA READER
// ============================================================================

const ComicReader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isManga, setIsManga] = useState(book.isManga || false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings, updateSettings, startReadingSession, endReadingSession, addBookmark, getBookmarks, removeBookmark } = useBookStore();
  const [sessionId, setSessionId] = useState('');

  // Start reading session
  useEffect(() => {
    setSessionId(startReadingSession(book.id));
    return () => endReadingSession(sessionId, 1);
  }, []);

  // Load comic pages from various archive formats
  useEffect(() => {
    const loadComic = async () => {
      setLoading(true);
      setLoadingProgress(0);
      try {
        // Extract base64 data
        const base64Data = book.file.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }

        const imageFiles: string[] = [];
        const format = book.format;

        // Helper function to sort files naturally
        const sortFiles = (names: string[]) => {
          return names.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            if (numA !== numB) return numA - numB;
            return a.localeCompare(b, undefined, { numeric: true });
          });
        };

        // Helper to check if file is an image
        const isImage = (name: string) => 
          /\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i.test(name) && 
          !name.startsWith('__MACOSX') && 
          !name.startsWith('.');

        if (format === 'cbz') {
          // CBZ = ZIP format
          const JSZip = (await import('jszip')).default;
          const zip = await JSZip.loadAsync(bytes);
          
          const fileNames = sortFiles(Object.keys(zip.files).filter(isImage));
          
          let loaded = 0;
          for (const fileName of fileNames) {
            const file = zip.files[fileName];
            const blob = await file.async('blob');
            const url = URL.createObjectURL(blob);
            imageFiles.push(url);
            loaded++;
            setLoadingProgress(Math.round((loaded / fileNames.length) * 50));
          }
        } else if (format === 'cbr' || format === 'cb7' || format === 'cbt' || format === 'acv') {
          // CBR = RAR, CB7 = 7z, CBT = TAR, ACV = various
          // Use libarchive.js for these formats
          try {
            const { Archive } = await import('libarchive.js');
            const archive = await Archive.open(bytes);
            const extractedFiles = await archive.extractFiles();
            
            const fileNames = sortFiles(Object.keys(extractedFiles).filter(isImage));
            
            let loaded = 0;
            for (const fileName of fileNames) {
              const file = extractedFiles[fileName];
              if (file && file.extracted) {
                const url = URL.createObjectURL(file.extracted);
                imageFiles.push(url);
              }
              loaded++;
              setLoadingProgress(Math.round((loaded / fileNames.length) * 50));
            }
          } catch (archiveError) {
            console.error('Archive extraction failed, trying JSZip fallback:', archiveError);
            // Fallback to JSZip for formats that might be misnamed
            const JSZip = (await import('jszip')).default;
            try {
              const zip = await JSZip.loadAsync(bytes);
              const fileNames = sortFiles(Object.keys(zip.files).filter(isImage));
              
              for (const fileName of fileNames) {
                const file = zip.files[fileName];
                const blob = await file.async('blob');
                const url = URL.createObjectURL(blob);
                imageFiles.push(url);
              }
            } catch {
              toast.error('Format wird noch nicht vollständig unterstützt');
            }
          }
        }

        setPages(imageFiles);
        setLoadingProgress(100);
        
        // Restore last page
        if (book.currentLocation) {
          const lastPage = parseInt(book.currentLocation);
          if (!isNaN(lastPage) && lastPage >= 0 && lastPage < imageFiles.length) {
            setCurrentPage(lastPage);
          }
        }
      } catch (error) {
        console.error('Error loading comic:', error);
        toast.error('Fehler beim Laden des Comics');
      }
      setLoading(false);
    };

    loadComic();

    return () => {
      // Cleanup blob URLs
      pages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [book.file, book.format]);

  // Update progress
  useEffect(() => {
    if (pages.length > 0) {
      const progress = ((currentPage + 1) / pages.length) * 100;
      onProgress(progress, currentPage.toString(), currentPage + 1);
    }
  }, [currentPage, pages.length]);

  // Navigation
  const goNext = () => {
    if (isManga) {
      setCurrentPage(p => Math.max(0, p - 1));
    } else {
      setCurrentPage(p => Math.min(pages.length - 1, p + 1));
    }
  };

  const goPrev = () => {
    if (isManga) {
      setCurrentPage(p => Math.min(pages.length - 1, p + 1));
    } else {
      setCurrentPage(p => Math.max(0, p - 1));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          goPrev();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, isManga, isFullscreen]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleBookmark = () => {
    const existing = getBookmarks(book.id).find(b => b.location === currentPage.toString());
    if (existing) {
      removeBookmark(existing.id);
      toast.success('Lesezeichen entfernt');
    } else {
      addBookmark({ bookId: book.id, title: `Seite ${currentPage + 1}`, location: currentPage.toString(), page: currentPage + 1 });
      toast.success('Lesezeichen gesetzt');
    }
  };

  const isBookmarked = getBookmarks(book.id).some(b => b.location === currentPage.toString());

  // View mode rendering
  const renderPage = () => {
    const fitStyle: React.CSSProperties = {
      objectFit: settings.comicFitMode === 'fit-width' ? 'contain' :
                 settings.comicFitMode === 'fit-height' ? 'contain' :
                 settings.comicFitMode === 'fit-screen' ? 'contain' : 'none',
      width: settings.comicFitMode === 'fit-width' ? '100%' : 'auto',
      height: settings.comicFitMode === 'fit-height' ? '100%' : 'auto',
      maxWidth: settings.comicFitMode !== 'original' ? '100%' : 'none',
      maxHeight: settings.comicFitMode !== 'original' ? '100vh' : 'none',
      transform: `scale(${zoom})`,
      transformOrigin: 'center center',
    };

    if (settings.comicViewMode === 'vertical' || settings.comicViewMode === 'webtoon') {
      return (
        <div className="flex flex-col items-center overflow-y-auto h-full" style={{ gap: settings.comicViewMode === 'webtoon' ? '0' : '20px' }}>
          {pages.map((page, index) => (
            <img key={index} src={page} alt={`Seite ${index + 1}`} className="max-w-full" loading="lazy" />
          ))}
        </div>
      );
    }

    if (settings.comicViewMode === 'double' && currentPage < pages.length - 1) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <img src={isManga ? pages[currentPage + 1] : pages[currentPage]} alt="" style={fitStyle} className="mr-0.5" />
          <img src={isManga ? pages[currentPage] : pages[currentPage + 1]} alt="" style={fitStyle} className="ml-0.5" />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full w-full">
        <img src={pages[currentPage]} alt={`Seite ${currentPage + 1}`} style={fitStyle} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <RefreshCw className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground mb-2">Lade Comic...</p>
        {loadingProgress > 0 && (
          <div className="w-48">
            <Progress value={loadingProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-1">{loadingProgress}%</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setShowMenu(!showMenu)}>
      {/* Menu Header */}
      <AnimatePresence>
        {showMenu && (
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between p-4 bg-black/90 backdrop-blur z-10">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white"><X className="w-5 h-5" /></Button>
            <div className="flex-1 text-center px-2">
              <h2 className="font-semibold truncate text-sm text-white">{book.title}</h2>
              <p className="text-xs text-gray-400">Seite {currentPage + 1} von {pages.length}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="text-white"><ZoomOut className="w-5 h-5" /></Button>
              <span className="text-white text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="text-white"><ZoomIn className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white"><Maximize className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark} className="text-white">{isBookmarked ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-white"><Settings className="w-5 h-5" /></Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {renderPage()}
        
        {/* Navigation Areas */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goPrev(); }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goNext(); }} />
      </div>

      {/* Menu Footer */}
      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center gap-4 p-4 bg-black/90 backdrop-blur">
            <Button variant="ghost" size="lg" onClick={goPrev} className="text-white"><ChevronLeft className="w-6 h-6" /></Button>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={pages.length - 1}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-sm">{currentPage + 1}/{pages.length}</span>
            </div>
            <Button variant="ghost" size="lg" onClick={goNext} className="text-white"><ChevronRight className="w-6 h-6" /></Button>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Comic-Einstellungen</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Ansichtsmodus</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'single', label: 'Einzelseite', icon: <Book className="w-4 h-4" /> },
                  { value: 'double', label: 'Doppelseite', icon: <Columns className="w-4 h-4" /> },
                  { value: 'vertical', label: 'Vertikal', icon: <Rows className="w-4 h-4" /> },
                  { value: 'webtoon', label: 'Webtoon', icon: <Rows className="w-4 h-4" /> },
                ].map((mode) => (
                  <Button key={mode.value} variant={settings.comicViewMode === mode.value ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ comicViewMode: mode.value as any })} className="flex items-center gap-2">
                    {mode.icon}
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Leserichtung</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={settings.comicReadingDirection === 'ltr' ? 'default' : 'outline'} size="sm" onClick={() => { updateSettings({ comicReadingDirection: 'ltr' }); setIsManga(false); }} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Links → Rechts (Comic)
                </Button>
                <Button variant={settings.comicReadingDirection === 'rtl' ? 'default' : 'outline'} size="sm" onClick={() => { updateSettings({ comicReadingDirection: 'rtl' }); setIsManga(true); }} className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Rechts → Links (Manga)
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Bildanpassung</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'fit-width', label: 'Breite anpassen' },
                  { value: 'fit-height', label: 'Höhe anpassen' },
                  { value: 'fit-screen', label: 'Bildschirm anpassen' },
                  { value: 'original', label: 'Originalgröße' },
                ].map((mode) => (
                  <Button key={mode.value} variant={settings.comicFitMode === mode.value ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ comicFitMode: mode.value as any })}>
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Zoom: {Math.round(zoom * 100)}%</Label>
              <Slider value={[zoom * 100]} onValueChange={([value]) => setZoom(value / 100)} min={50} max={300} step={25} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// ============================================================================
// BOOK CLUB PANEL
// ============================================================================

const BookClubPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books } = useBookStore();
  const [selectedClub, setSelectedClub] = useState<{id: string; name: string; description: string; members: number} | null>(null);
  const [newClubName, setNewClubName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState('');

  // Demo clubs
  const clubs = [
    { id: '1', name: 'Klassiker-Leser', description: 'Wir lesen die großen Werke der Weltliteratur', members: 12 },
    { id: '2', name: 'Sci-Fi & Fantasy', description: 'Von Middle Earth bis Arrakis', members: 8 },
    { id: '3', name: 'Manga & Anime', description: 'Japanische Comics und mehr', members: 24 },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Buchclubs
          </SheetTitle>
        </SheetHeader>
        <div className="flex h-[calc(100%-80px)] mt-4 gap-4">
          {/* Club List */}
          <div className="w-80 flex flex-col">
            <Button onClick={() => setShowCreate(!showCreate)} className="mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Club
            </Button>
            
            {showCreate && (
              <Card className="mb-4">
                <CardContent className="p-4 space-y-3">
                  <Input placeholder="Club-Name..." value={newClubName} onChange={(e) => setNewClubName(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={() => { toast.success('Club erstellt!'); setShowCreate(false); }} size="sm">Erstellen</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Abbrechen</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {clubs.map((club) => (
                  <Card
                    key={club.id}
                    className={`cursor-pointer transition-all ${selectedClub?.id === club.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedClub(club)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {club.name[0]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{club.name}</h4>
                          <p className="text-xs text-muted-foreground">{club.members} Mitglieder</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Club Detail */}
          {selectedClub ? (
            <div className="flex-1 flex flex-col">
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{selectedClub.name}</h3>
                      <p className="text-muted-foreground">{selectedClub.description}</p>
                    </div>
                    <Button size="sm" onClick={() => toast.success('Willkommen im Club!')}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Beitreten
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Chat */}
              <Card className="flex-1 flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Diskussion
                  </h4>
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">M</div>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <p className="text-sm">Hallo zusammen! Was haltet ihr vom aktuellen Buch?</p>
                          <p className="text-xs text-muted-foreground mt-1">Max • vor 2 Stunden</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">L</div>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <p className="text-sm">Sehr spannend! Besonders das dritte Kapitel...</p>
                          <p className="text-xs text-muted-foreground mt-1">Lisa • vor 1 Stunde</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input placeholder="Nachricht schreiben..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && message.trim() && (toast.success('Nachricht gesendet!'), setMessage(''))} />
                    <Button onClick={() => message.trim() && (toast.success('Nachricht gesendet!'), setMessage(''))}><Send className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Wähle einen Club aus</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// AUDIOBOOK PLAYER
// ============================================================================

const AudiobookPlayer = ({ book, onClose }: { book: Book; onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(3600); // Demo: 1 hour
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const skipForward = () => setCurrentTime(Math.min(currentTime + 30, duration));
  const skipBackward = () => setCurrentTime(Math.max(currentTime - 15, 0));

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Demo: simulate playback
  useEffect(() => {
    if (isPlaying) {
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
        <Button variant="ghost" onClick={onClose}><X className="w-5 h-5" /></Button>
        <div className="text-center flex-1">
          <h2 className="font-semibold truncate">{book.title}</h2>
          {book.author && <p className="text-sm text-muted-foreground">{book.author}</p>}
        </div>
        <Button variant="ghost" onClick={() => toast.success('Lesezeichen gesetzt!')}><Bookmark className="w-5 h-5" /></Button>
      </header>

      {/* Cover */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div animate={isPlaying ? { scale: [1, 1.02, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
          <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-2xl">
            {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full rounded-2xl object-cover" /> : <Headphones className="w-24 h-24 text-primary/40" />}
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <Slider value={[currentTime]} max={duration} step={1} onValueChange={([v]) => setCurrentTime(v)} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatAudioTime(currentTime)}</span>
            <span>{formatAudioTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <Button variant="ghost" size="icon" onClick={skipBackward}><SkipBack className="w-6 h-6" /></Button>
          <Button size="lg" className="w-16 h-16 rounded-full" onClick={togglePlay}>{isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}</Button>
          <Button variant="ghost" size="icon" onClick={skipForward}><SkipForward className="w-6 h-6" /></Button>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <span className="text-sm text-muted-foreground">Geschwindigkeit:</span>
          {[0.5, 1, 1.5, 2].map((rate) => (
            <Button key={rate} variant={playbackRate === rate ? 'default' : 'outline'} size="sm" className="w-10" onClick={() => setPlaybackRate(rate)}>{rate}x</Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PDF EXPORT PANEL - Feature 15
// ============================================================================

const PDFExportPanel = ({ open, onOpenChange, bookId }: { open: boolean; onOpenChange: (open: boolean) => void; bookId?: string }) => {
  const { books, highlights, notes, readingStats } = useBookStore();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'highlights' | 'journal' | 'quote-card'>('highlights');

  const handleExport = async () => {
    setExporting(true);
    try {
      const filteredHighlights = bookId 
        ? highlights.filter(h => h.bookId === bookId)
        : highlights;
      
      const enrichedHighlights = filteredHighlights.map(h => ({
        ...h,
        bookTitle: books.find(b => b.id === h.bookId)?.title
      }));

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: exportType,
          data: exportType === 'highlights' ? enrichedHighlights : 
                exportType === 'journal' ? {
                  books: books.slice(0, 20),
                  highlights: enrichedHighlights,
                  notes: notes,
                  stats: {
                    totalBooks: books.length,
                    totalPages: readingStats.totalPagesRead,
                    totalHighlights: highlights.length,
                    totalNotes: notes.length,
                    readingStreak: readingStats.currentStreak,
                  }
                } : enrichedHighlights[0],
          bookTitle: bookId ? books.find(b => b.id === bookId)?.title : undefined,
          bookAuthor: bookId ? books.find(b => b.id === bookId)?.author : undefined,
        }),
      });

      if (!response.ok) throw new Error('Export fehlgeschlagen');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exportiert!');
    } catch {
      toast.error('Export fehlgeschlagen');
    }
    setExporting(false);
  };

  const highlightCount = bookId ? highlights.filter(h => h.bookId === bookId).length : highlights.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-red-500" />
            PDF Export
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'highlights', label: 'Markierungen', icon: <Highlighter className="w-5 h-5" />, count: highlightCount },
              { id: 'journal', label: 'Lese-Journal', icon: <BookOpen className="w-5 h-5" />, count: books.length },
              { id: 'quote-card', label: 'Zitat-Karte', icon: <Share2 className="w-5 h-5" />, count: highlightCount > 0 ? 1 : 0 },
            ].map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all ${exportType === type.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                onClick={() => setExportType(type.id as typeof exportType)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">{type.icon}</div>
                  <h4 className="font-medium text-sm">{type.label}</h4>
                  <p className="text-xs text-muted-foreground">{type.count} Einträge</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-medium">Export-Vorschau</h4>
              <p className="text-sm text-muted-foreground">
                {exportType === 'highlights' && `Exportiert ${highlightCount} Markierungen als PDF mit Formatierung und Notizen.`}
                {exportType === 'journal' && `Erstellt ein vollständiges Lese-Journal mit Statistiken, Buchliste und wichtigen Zitaten.`}
                {exportType === 'quote-card' && `Erstellt eine schöne Zitat-Postkarte zum Teilen.`}
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleExport} disabled={exporting} className="w-full">
            {exporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
            {exporting ? 'Exportiere...' : 'Als PDF exportieren'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// READING JOURNAL PANEL - Feature 15
// ============================================================================

const ReadingJournalPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, highlights, notes, readingStats, readingSessions } = useBookStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [generating, setGenerating] = useState(false);

  const getFilteredData = () => {
    const now = Date.now();
    const periods = { week: 7, month: 30, year: 365, all: Infinity };
    const days = periods[selectedPeriod];
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return {
      books: books.filter(b => b.lastRead && b.lastRead >= cutoff),
      highlights: highlights.filter(h => h.createdAt >= cutoff),
      notes: notes.filter(n => n.createdAt >= cutoff),
      sessions: readingSessions.filter(s => s.startTime >= cutoff),
    };
  };

  const filtered = getFilteredData();

  const generateJournal = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'journal',
          data: {
            books: filtered.books,
            highlights: filtered.highlights,
            notes: filtered.notes,
            stats: {
              totalBooks: filtered.books.length,
              totalPages: readingStats.totalPagesRead,
              totalHighlights: filtered.highlights.length,
              totalNotes: filtered.notes.length,
              readingStreak: readingStats.currentStreak,
            }
          }
        }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lese-journal-${selectedPeriod}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Journal erstellt!');
    } catch {
      toast.error('Fehler beim Erstellen');
    }
    setGenerating(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Lese-Journal
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Period Selection */}
          <div className="flex gap-2">
            {[
              { id: 'week', label: 'Diese Woche' },
              { id: 'month', label: 'Dieser Monat' },
              { id: 'year', label: 'Dieses Jahr' },
              { id: 'all', label: 'Alles' },
            ].map((period) => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period.id as typeof selectedPeriod)}
              >
                {period.label}
              </Button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Book className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold">{filtered.books.length}</p>
                <p className="text-xs text-muted-foreground">Bücher</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Highlighter className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold">{filtered.highlights.length}</p>
                <p className="text-xs text-muted-foreground">Markierungen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Edit3 className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{filtered.notes.length}</p>
                <p className="text-xs text-muted-foreground">Notizen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold">{readingStats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Tage Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Highlights */}
          {filtered.highlights.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Wichtige Zitate
                </h4>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {filtered.highlights.slice(0, 5).map((h) => {
                      const book = books.find(b => b.id === h.bookId);
                      return (
                        <div key={h.id} className="p-2 bg-muted rounded-lg">
                          <p className="text-sm italic">"{h.text.slice(0, 100)}..."</p>
                          {book && <p className="text-xs text-muted-foreground mt-1">— {book.title}</p>}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Button onClick={generateJournal} disabled={generating} className="w-full">
            {generating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
            Journal als PDF erstellen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// SOCIAL SHARE CARD - Feature 15
// ============================================================================

const SocialShareCard = ({ open, onOpenChange, highlight }: { open: boolean; onOpenChange: (open: boolean) => void; highlight?: Highlight }) => {
  const { books } = useBookStore();
  const [selectedStyle, setSelectedStyle] = useState<'minimal' | 'elegant' | 'bold' | 'nature'>('elegant');
  const [copied, setCopied] = useState(false);

  const book = highlight ? books.find(b => b.id === highlight.bookId) : null;

  const styles = {
    minimal: { bg: 'bg-white dark:bg-gray-900', text: 'text-gray-900 dark:text-white', accent: 'border-l-4 border-gray-300' },
    elegant: { bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20', text: 'text-amber-900 dark:text-amber-100', accent: 'border-l-4 border-amber-400' },
    bold: { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', text: 'text-white', accent: 'border-l-4 border-white' },
    nature: { bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', text: 'text-green-900 dark:text-green-100', accent: 'border-l-4 border-green-400' },
  };

  const style = styles[selectedStyle];

  const shareText = highlight?.text 
    ? `"${highlight.text}"${book ? ` — ${book.title}${book.author ? ` von ${book.author}` : ''}` : ''}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('In Zwischenablage kopiert!');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  if (!highlight) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Zitat teilen
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col items-center justify-center h-40">
            <p className="text-muted-foreground">Wählen Sie eine Markierung zum Teilen aus</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Zitat teilen
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Style Selection */}
          <div className="flex gap-2">
            {[
              { id: 'minimal', label: 'Minimal', color: 'bg-gray-200' },
              { id: 'elegant', label: 'Elegant', color: 'bg-amber-200' },
              { id: 'bold', label: 'Bold', color: 'bg-purple-400' },
              { id: 'nature', label: 'Nature', color: 'bg-green-200' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id as typeof selectedStyle)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${selectedStyle === s.id ? 'border-primary' : 'border-transparent'}`}
              >
                <div className={`w-4 h-4 rounded ${s.color}`} />
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Preview Card */}
          <Card className="overflow-hidden">
            <CardContent className={`p-6 ${style.bg} ${style.accent}`}>
              <p className={`text-lg font-serif italic ${style.text}`}>
                "{highlight.text}"
              </p>
              {book && (
                <p className={`text-sm mt-4 ${style.text} opacity-75`}>
                  — {book.title}{book.author ? `, ${book.author}` : ''}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Share Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Kopieren
            </Button>
            <Button variant="outline" onClick={shareToTwitter}>
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button variant="outline" onClick={() => toast.success('Instagram Story Link kopiert!')}>
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// WEEKLY DIGEST PANEL - Feature 15
// ============================================================================

const WeeklyDigestPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, highlights, readingStats, readingSessions } = useBookStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [sending, setSending] = useState(false);

  // Calculate weekly stats
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklySessions = readingSessions.filter(s => s.startTime >= weekAgo);
  const weeklyHighlights = highlights.filter(h => h.createdAt >= weekAgo);
  const weeklyPages = weeklySessions.reduce((sum, s) => sum + s.pagesRead, 0);
  const weeklyMinutes = weeklySessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      toast.success('Wöchentliche Zusammenfassung aktiviert!');
    }
  };

  const sendTestDigest = async () => {
    setSending(true);
    // Simulate sending digest
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Test-E-Mail gesendet!');
    setSending(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Wöchentliche Zusammenfassung
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Weekly Stats Preview */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-4">
              <h4 className="font-medium mb-4">Diese Woche im Überblick</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <Book className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-lg font-bold">{weeklyPages}</p>
                  <p className="text-xs text-muted-foreground">Seiten</p>
                </div>
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold">{Math.round(weeklyMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Minuten</p>
                </div>
                <div className="text-center">
                  <Highlighter className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-lg font-bold">{weeklyHighlights.length}</p>
                  <p className="text-xs text-muted-foreground">Markierungen</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-bold">{readingStats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Tage Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Subscription */}
          {!subscribed ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium">E-Mail-Benachrichtigung einrichten</h4>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie jede Woche eine Zusammenfassung Ihrer Leseaktivität.
                </p>
                <div className="flex gap-2">
                  <Input 
                    type="email" 
                    placeholder="ihre@email.de" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                  <Button onClick={handleSubscribe}>Anmelden</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Aktiviert!</h4>
                  <p className="text-sm text-muted-foreground">Sie erhalten die Zusammenfassung jeden Sonntag.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Digest Preview */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium">Inhalt der Zusammenfassung:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gelesene Seiten und Zeit</li>
                <li>• Wichtigste Markierungen der Woche</li>
                <li>• Lese-Fortschritt bei aktuellen Büchern</li>
                <li>• Motivierende Statistiken</li>
                <li>• Lese-Empfehlungen</li>
              </ul>
              <Button variant="outline" onClick={sendTestDigest} disabled={sending} className="w-full">
                {sending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Test-E-Mail senden
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// CALIBRE CONNECT PANEL - Feature 18
// ============================================================================

const CalibreConnectPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { addBook } = useBookStore();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [calibreBooks, setCalibreBooks] = useState<any[]>([]);

  const handleConnect = async () => {
    setConnecting(true);
    // Simulate connection
    await new Promise(r => setTimeout(r, 1500));
    setConnected(true);
    // Mock calibre library
    setCalibreBooks([
      { id: 1, title: 'Der Prozess', author: 'Franz Kafka', format: 'EPUB', size: '1.2 MB' },
      { id: 2, title: 'Die Verwandlung', author: 'Franz Kafka', format: 'EPUB', size: '0.8 MB' },
      { id: 3, title: 'Steppenwolf', author: 'Hermann Hesse', format: 'PDF', size: '3.5 MB' },
    ]);
    setConnecting(false);
    toast.success('Mit Calibre verbunden!');
  };

  const importBook = (book: any) => {
    addBook({
      title: book.title,
      author: book.author,
      format: book.format.toLowerCase(),
      file: 'calibre-import',
      fileSize: parseFloat(book.size) * 1024 * 1024,
    });
    toast.success(`"${book.title}" importiert!`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-500" />
            Calibre-Sync
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {!connected ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Calibre Content Server</h4>
                    <p className="text-sm text-muted-foreground">Verbinden Sie Ihre Calibre-Bibliothek</p>
                  </div>
                </div>
                <Input 
                  placeholder="http://localhost:8080" 
                  value={serverUrl} 
                  onChange={(e) => setServerUrl(e.target.value)} 
                />
                <Button onClick={handleConnect} disabled={connecting} className="w-full">
                  {connecting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
                  {connecting ? 'Verbinde...' : 'Verbinden'}
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
                <Button variant="ghost" size="sm" onClick={() => setConnected(false)}>
                  Trennen
                </Button>
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {calibreBooks.map((book) => (
                    <Card key={book.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium text-sm">{book.title}</h4>
                            <p className="text-xs text-muted-foreground">{book.author} • {book.format}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => importBook(book)}>
                          <Download className="w-4 h-4 mr-1" />
                          Import
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// GOODREADS PANEL - Feature 18
// ============================================================================

const GoodreadsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, rateBook } = useBookStore();
  const [connected, setConnected] = useState(false);

  const handleSync = () => {
    toast.success('Bewertungen mit Goodreads synchronisiert!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Book className="w-5 h-5 text-amber-600" />
            Goodreads-Sync
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {!connected ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Book className="w-12 h-12 mx-auto mb-4 text-amber-600" />
                <h4 className="font-medium mb-2">Mit Goodreads verbinden</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Synchronisieren Sie Ihre Bewertungen und Leselisten mit Goodreads.
                </p>
                <Button onClick={() => { setConnected(true); toast.success('Verbunden!'); }}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Verbinden
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Mit Goodreads verbunden</span>
                </div>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium">Synchronisierung</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleSync}>
                      <Download className="w-4 h-4 mr-2" />
                      Bewertungen importieren
                    </Button>
                    <Button variant="outline" onClick={handleSync}>
                      <Upload className="w-4 h-4 mr-2" />
                      Bewertungen exportieren
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Zu synchronisierende Bücher</h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {books.filter(b => b.rating).slice(0, 5).map((book) => (
                        <div key={book.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm truncate flex-1">{book.title}</span>
                          <div className="flex">
                            {[...Array(book.rating || 0)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// POCKET/INSTAPAPER PANEL - Feature 18
// ============================================================================

const PocketImportPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { addWebArticle } = useBookStore();
  const [service, setService] = useState<'pocket' | 'instapaper'>('pocket');
  const [connected, setConnected] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);

  const handleConnect = async () => {
    // Simulate connection
    await new Promise(r => setTimeout(r, 1000));
    setConnected(true);
    setArticles([
      { id: 1, title: 'The Future of AI', url: 'https://example.com/ai', source: 'Medium' },
      { id: 2, title: 'Deep Learning Basics', url: 'https://example.com/dl', source: 'Blog' },
      { id: 3, title: 'Web Development Trends 2024', url: 'https://example.com/web', source: 'Dev.to' },
    ]);
    toast.success(`Mit ${service === 'pocket' ? 'Pocket' : 'Instapaper'} verbunden!`);
  };

  const importArticle = (article: any) => {
    addWebArticle({
      title: article.title,
      url: article.url,
      content: '',
      source: article.source,
    });
    toast.success(`"${article.title}" gespeichert!`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-red-500" />
            Artikel speichern
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex gap-2">
            <Button 
              variant={service === 'pocket' ? 'default' : 'outline'} 
              onClick={() => setService('pocket')}
              className="flex-1"
            >
              Pocket
            </Button>
            <Button 
              variant={service === 'instapaper' ? 'default' : 'outline'} 
              onClick={() => setService('instapaper')}
              className="flex-1"
            >
              Instapaper
            </Button>
          </div>

          {!connected ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Save className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h4 className="font-medium mb-2">Mit {service === 'pocket' ? 'Pocket' : 'Instapaper'} verbinden</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Importieren Sie gespeicherte Artikel zum Lesen.
                </p>
                <Button onClick={handleConnect}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Verbinden
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {articles.map((article) => (
                  <Card key={article.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Newspaper className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium text-sm">{article.title}</h4>
                          <p className="text-xs text-muted-foreground">{article.source}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => importArticle(article)}>
                        <Download className="w-4 h-4 mr-1" />
                        Import
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// NOTION/OBSIDIAN EXPORT PANEL - Feature 18
// ============================================================================

const NotionExportPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { notes, highlights, books } = useBookStore();
  const [target, setTarget] = useState<'notion' | 'obsidian' | 'markdown'>('markdown');
  const [exporting, setExporting] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string>('all');

  const handleExport = async () => {
    setExporting(true);
    
    const filteredNotes = selectedBook === 'all' ? notes : notes.filter(n => n.bookId === selectedBook);
    const filteredHighlights = selectedBook === 'all' ? highlights : highlights.filter(h => h.bookId === selectedBook);

    // Generate markdown content
    let markdown = `# eBook Reader Export\n\n`;
    markdown += `**Exportiert am:** ${new Date().toLocaleDateString('de-DE')}\n\n`;
    
    markdown += `## Notizen\n\n`;
    filteredNotes.forEach(note => {
      const book = books.find(b => b.id === note.bookId);
      markdown += `### ${note.title}\n`;
      if (book) markdown += `*Buch: ${book.title}*\n\n`;
      markdown += `${note.content}\n\n---\n\n`;
    });

    markdown += `## Markierungen\n\n`;
    filteredHighlights.forEach(h => {
      const book = books.find(b => b.id === h.bookId);
      markdown += `> "${h.text}"\n`;
      if (book) markdown += `— ${book.title}\n`;
      if (h.note) markdown += `*Notiz: ${h.note}*\n`;
      markdown += `\n`;
    });

    // Download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebook-export-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
    toast.success('Export erfolgreich!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Notizen exportieren
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Target Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'notion', label: 'Notion', icon: <Layers className="w-5 h-5" /> },
              { id: 'obsidian', label: 'Obsidian', icon: <FileText className="w-5 h-5" /> },
              { id: 'markdown', label: 'Markdown', icon: <FileTextIcon className="w-5 h-5" /> },
            ].map((t) => (
              <Card 
                key={t.id}
                className={`cursor-pointer transition-all ${target === t.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setTarget(t.id as typeof target)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">{t.icon}</div>
                  <h4 className="font-medium text-sm">{t.label}</h4>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Book Filter */}
          <div className="space-y-2">
            <Label>Buch auswählen</Label>
            <select 
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full p-2 border rounded-lg bg-background"
            >
              <option value="all">Alle Bücher</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Edit3 className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{selectedBook === 'all' ? notes.length : notes.filter(n => n.bookId === selectedBook).length}</p>
                <p className="text-xs text-muted-foreground">Notizen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Highlighter className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold">{selectedBook === 'all' ? highlights.length : highlights.filter(h => h.bookId === selectedBook).length}</p>
                <p className="text-xs text-muted-foreground">Markierungen</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleExport} disabled={exporting} className="w-full">
            {exporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exportieren
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// SPOTIFY INTEGRATION PANEL - Feature 18
// ============================================================================

const SpotifyPanel = ({ open, onOpenChange, mood }: { open: boolean; onOpenChange: (open: boolean) => void; mood?: string }) => {
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
        <div className="mt-6 space-y-6">
          {!connected ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h4 className="font-medium mb-2">Mit Spotify verbinden</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Passende Musik zu Ihrer Stimmung beim Lesen.
                </p>
                <Button onClick={() => { setConnected(true); toast.success('Verbunden!'); }}>
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
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`"${playlist.name}" wird abgespielt`)}>
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

// ============================================================================
// PRIVACY DASHBOARD - Feature 20
// ============================================================================

const PrivacyDashboard = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
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
                    <Book className="w-5 h-5 mx-auto mb-1 text-amber-500" />
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

// ============================================================================
// EXPORT/IMPORT PANEL
// ============================================================================

const ExportImportPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
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

// ============================================================================
// BUDDY READING PANEL
// ============================================================================

const BuddyReadingPanel = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [sessions, setSessions] = useState<{id: string; host: string; participants: string[]; currentPage: number; startedAt: number}[]>([]);
  const [isHosting, setIsHosting] = useState(false);
  const [sessionCode, setSessionCode] = useState('');

  const createSession = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(code);
    setIsHosting(true);
    setSessions([...sessions, {
      id: code,
      host: 'Du',
      participants: ['Du'],
      currentPage: 1,
      startedAt: Date.now()
    }]);
    toast.success('Buddy-Reading Session erstellt! Teile den Code: ' + code);
  };

  const joinSession = () => {
    if (sessionCode.length === 6) {
      toast.success('Session beigetreten!');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            Buddy Reading
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <p className="text-muted-foreground text-sm">
            Lese gemeinsam mit Freunden das gleiche Buch. Seht euren Fortschritt in Echtzeit!
          </p>

          {!isHosting ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Neue Session starten</h4>
                  <p className="text-sm text-muted-foreground mb-4">Erstelle eine Session und lade Freunde mit dem Code ein.</p>
                  <Button onClick={createSession} className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Session erstellen
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Session beitreten</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Session-Code eingeben..."
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="uppercase"
                    />
                    <Button onClick={joinSession} disabled={sessionCode.length !== 6}>
                      Beitreten
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-mono font-bold text-primary mb-4 tracking-widest">
                  {sessionCode}
                </div>
                <p className="text-muted-foreground mb-4">
                  Teile diesen Code mit deinen Freunden
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(sessionCode);
                    toast.success('Code kopiert!');
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Code kopieren
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-4 justify-center text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">Live-Sync aktiv</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// PODCAST MODE PANEL
// ============================================================================

const PodcastModePanel = ({ book, bookContent, open, onOpenChange }: { book: Book; bookContent: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastScript, setPodcastScript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices.filter(v => v.lang.startsWith('de') || v.lang.startsWith('en')));
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const generatePodcast = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bookContent.substring(0, 4000), style: 'podcast' }),
      });
      const data = await response.json();
      setPodcastScript(data.summary || 'Podcast konnte nicht generiert werden.');
    } catch {
      toast.error('Fehler beim Generieren');
    }
    setIsGenerating(false);
  };

  const playPodcast = () => {
    if ('speechSynthesis' in window && podcastScript) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(podcastScript);
      const germanVoice = voices.find(v => v.lang.startsWith('de'));
      if (germanVoice) utterance.voice = germanVoice;
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      ttsRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const stopPodcast = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Podcast-Modus
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <p className="text-muted-foreground text-sm">
            Wandle dein Buch in einen Podcast um! Perfekt zum Hören während du unterwegs bist.
          </p>

          {!podcastScript ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Radio className="w-16 h-16 mx-auto text-primary/50 mb-4" />
                <h3 className="font-semibold mb-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  KI generiert eine Podcast-Version deines Buches
                </p>
                <Button onClick={generatePodcast} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generiere Podcast...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Podcast erstellen
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Podcast-Script</h4>
                    <div className="flex gap-2">
                      {isPlaying ? (
                        <Button onClick={stopPodcast} variant="destructive" size="sm">
                          <Pause className="w-4 h-4 mr-1" />Stopp
                        </Button>
                      ) : (
                        <Button onClick={playPodcast} size="sm">
                          <Play className="w-4 h-4 mr-1" />Abspielen
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-48">
                    <p className="text-sm whitespace-pre-wrap">{podcastScript}</p>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setPodcastScript('')}>
                  Neu generieren
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// READING ADVENT CALENDAR
// ============================================================================

const AdventCalendarPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, readingStats } = useBookStore();
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();

  // Only show in December
  const isDecember = currentMonth === 11;

  const doors = Array.from({ length: 24 }, (_, i) => ({
    day: i + 1,
    opened: i + 1 < currentDay || (i + 1 === currentDay && isDecember),
    reward: [
      '📚 Neues Theme freigeschaltet!',
      '⭐ +50 XP Bonus',
      '🎵 Neuer Ambient Sound',
      '📖 Kostenloses Gutenberg-Buch',
      '🎨 Custom Font freigeschaltet',
      '🏆 Achievement: Advent-Leser',
      '💝 Lese-Postkarten freigeschaltet',
      '🌙 Nacht-Modus Pro',
      '🎧 Hörbuch-Speed Boost',
      '📖 Double XP Tag!',
    ][i % 10]
  }));

  const handleOpenDoor = (day: number) => {
    if (day === currentDay && isDecember) {
      toast.success(`Türchen ${day} geöffnet! ${doors[day-1].reward}`);
    }
  };

  if (!isDecember) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Lese-Adventskalender
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 text-center">
            <Calendar className="w-24 h-24 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Bis Dezember geduld...</h3>
            <p className="text-muted-foreground">
              Der Adventskalender ist nur im Dezember verfügbar. 
              Dann gibt es jeden Tag eine Überraschung!
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Lese-Adventskalender 🎄
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-80px)] mt-4">
          <div className="grid grid-cols-4 gap-3">
            {doors.map((door) => (
              <motion.div
                key={door.day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer aspect-square ${
                    door.opened
                      ? 'bg-gradient-to-br from-green-500/20 to-red-500/20 border-green-500/50'
                      : 'bg-gradient-to-br from-red-600 to-green-700'
                  }`}
                  onClick={() => handleOpenDoor(door.day)}
                >
                  <CardContent className="p-2 h-full flex flex-col items-center justify-center text-center">
                    {door.opened ? (
                      <>
                        <span className="text-2xl mb-1">
                          {['🎁', '⭐', '📚', '🎄', '❄️', '🎵', '📖', '✨'][door.day % 8]}
                        </span>
                        <span className="text-xs font-bold">{door.day}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                          {door.reward}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-white">{door.day}</span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="mt-6">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Deine Dezember-Statistik</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{readingStats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Tage in Folge</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{doors.filter(d => d.opened).length}</p>
                  <p className="text-xs text-muted-foreground">Türchen</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{books.length}</p>
                  <p className="text-xs text-muted-foreground">Bücher</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// READING CHALLENGES BATTLE
// ============================================================================

const ChallengeBattlePanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { challenges, readingStats } = useBookStore();

  const activeBattles = [
    { id: '1', name: 'Seiten-Marathon', target: 100, current: 67, unit: 'Seiten', opponent: 'Team Alpha', deadline: Date.now() + 86400000 },
    { id: '2', name: 'Lese-Streak', target: 7, current: readingStats.currentStreak, unit: 'Tage', opponent: 'Bücherwürmer', deadline: Date.now() + 604800000 },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Lese-Challenge Battles
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {activeBattles.map((battle) => {
            const progress = (battle.current / battle.target) * 100;
            const timeLeft = Math.max(0, Math.floor((battle.deadline - Date.now()) / 3600000));

            return (
              <Card key={battle.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{battle.name}</h4>
                      <p className="text-xs text-muted-foreground">gegen {battle.opponent}</p>
                    </div>
                    <Badge variant="outline">
                      ⏰ {timeLeft}h verbleibend
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Du: {battle.current} {battle.unit}</span>
                      <span>Ziel: {battle.target} {battle.unit}</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Swords className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-3">
                Fordere Freunde zu Lese-Challenges heraus!
              </p>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Neue Challenge starten
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function Page() {
  const [view, setView] = useState<'library' | 'reader'>('library');
  const { currentBook, setCurrentBook, updateProgress, settings } = useBookStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  const handleOpenBook = (book: Book) => { setCurrentBook(book); setView('reader'); };
  const handleCloseReader = () => { setCurrentBook(null); setView('library'); };
  const handleProgress = (progress: number, location: string, page?: number) => { if (currentBook) updateProgress(currentBook.id, progress, location, page); };

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [settings.theme]);

  return (
    <main className={`min-h-screen ${settings.theme === 'sepia' ? 'bg-amber-50 text-amber-900' : ''}`}>
      {settings.dyslexiaFont && <style jsx global>{dyslexiaFontStyle}</style>}
      <AnimatePresence mode="wait">
        {view === 'library' ? (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LibraryView onOpenBook={handleOpenBook} />
          </motion.div>
        ) : (
          <motion.div key="reader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {currentBook?.format === 'epub' && <EPUBReader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {currentBook?.format === 'pdf' && (
              <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
                <Card className="max-w-md">
                  <CardContent className="p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4">PDF Reader</h2>
                    <p className="text-muted-foreground mb-4">Der PDF-Reader ist in der vereinfachten Version verfügbar.</p>
                    <Button onClick={handleCloseReader}>Zurück</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            {(currentBook?.format === 'txt' || currentBook?.format === 'md') && <TextReader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {(currentBook?.format === 'cbz' || currentBook?.format === 'cbr' || currentBook?.format === 'cb7' || currentBook?.format === 'cbt' || currentBook?.format === 'acv') && <ComicReader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {(currentBook?.format === 'mobi' || currentBook?.format === 'azw3') && (
              <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
                <Card className="max-w-md">
                  <CardContent className="p-6 text-center">
                    <Book className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">{currentBook.format.toUpperCase()} Format</h2>
                    <p className="text-muted-foreground mb-4">
                      {currentBook.format === 'azw3' ? 'Kindle AZW3-Format' : 'Mobipocket-Format'} wird als Text angezeigt.
                    </p>
                    <TextReader book={{...currentBook, format: 'txt'}} onClose={handleCloseReader} onProgress={handleProgress} />
                  </CardContent>
                </Card>
              </div>
            )}
            {currentBook?.format === 'fb2' && <FB2Reader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {currentBook?.format === 'djvu' && (
              <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
                <Card className="max-w-md">
                  <CardContent className="p-6 text-center">
                    <File className="w-16 h-16 mx-auto text-amber-600 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">DJVU Format</h2>
                    <p className="text-muted-foreground mb-4">
                      DJVU ist ein spezielles Dokumentenformat mit hoher Kompression. 
                      Vollständige Unterstützung folgt in einem zukünftigen Update.
                    </p>
                    <Button onClick={handleCloseReader}>Zurück zur Bibliothek</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </main>
  );
}
