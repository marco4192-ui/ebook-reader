'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookIcon,
  Upload,
  Settings,
  List,
  X,
  BookOpen,
  Trash2,
  Search,
  Volume2,
  Target,
  Trophy,
  BarChart3,
  Edit3,
  Globe,
  Network,
  Eye,
  Star,
  Pin,
  Filter,
  Grid,
  Cloud,
  Palette,
  TrendingUp,
  Rss,
  Calendar,
  FolderTree,
  PiggyBank,
  Headphones,
  Shield,
  Music,
  Database,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore, type Book, getAllTags } from '@/lib/book-store';
import { toast } from 'sonner';

import { AccessibilityProPanel } from '@/components/panels/accessibility-pro-panel';
import { AchievementsPanel } from '@/components/panels/achievements-panel';
import { BookDetailPanel } from '@/components/panels/book-detail-panel';
import { BookmarkFoldersPanel } from '@/components/panels/bookmark-folders-panel';
import { CalibreConnectPanel } from '@/components/panels/calibre-connect-panel';
import { CloudSyncPanel } from '@/components/panels/cloud-sync-panel';
import { GoalTrackingPanel } from '@/components/panels/goal-tracking-panel';
import { GoodreadsPanel } from '@/components/panels/goodreads-panel';
import { GutenbergPanel } from '@/components/panels/gutenberg-panel';
import { KnowledgeGraph } from '@/components/panels/knowledge-graph';
import { NotionExportPanel } from '@/components/panels/notion-export-panel';
import { OnleihePanel } from '@/components/panels/onleihe-panel';
import { PDFExportPanel } from '@/components/panels/pdf-export-panel';
import { PocketImportPanel } from '@/components/panels/pocket-import-panel';
import { PrivacyDashboard } from '@/components/panels/privacy-dashboard';
import { ReadingHeatmap } from '@/components/panels/reading-heatmap';
import { ReadingJournalPanel } from '@/components/panels/reading-journal-panel';
import { ReadingListsWithDeadlinesPanel } from '@/components/panels/reading-lists-with-deadlines-panel';
import { ReadingSpeedChart } from '@/components/panels/reading-speed-chart';
import { SavingsPanel } from '@/components/panels/savings-panel';
import { SettingsPanel } from '@/components/panels/settings-panel';
import { SmartShelvesPanel } from '@/components/panels/smart-shelves-panel';
import { SpotifyPanel } from '@/components/panels/spotify-panel';
import { StatisticsPanel } from '@/components/panels/statistics-panel';
import { SyncStatusIndicator } from '@/components/panels/sync-status-indicator';
import { ThemeCustomizer } from '@/components/panels/theme-customizer';
import { VoiceCommandsPanel } from '@/components/panels/voice-commands-panel';
import { WeeklyDigestPanel } from '@/components/panels/weekly-digest-panel';
import { AmbientLightingPanel } from '@/components/reader/ambient-lighting-panel';
import { AmbientSoundPlayer } from '@/components/reader/ambient-sound-player';
import { CustomFontUploader } from '@/components/reader/custom-font-uploader';
import { EyeCareTimer } from '@/components/reader/eye-care-timer';
import { FormatIcon } from '@/components/reader/format-icon';
import { PageAnimationSelector } from '@/components/reader/page-animation-selector';
import { detectFormat, formatFileSize } from '@/lib/reading/format';
import { PodcastModePanel } from '@/components/panels/podcast-mode-panel';
import { RSSPanel } from '@/components/panels/rss-panel';

export const LibraryView = ({ onOpenBook }: { onOpenBook: (book: Book) => void }) => {
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
  const [showPodcast, setShowPodcast] = useState(false);
  const [showRSS, setShowRSS] = useState(false);
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
  const [showOnleihe, setShowOnleihe] = useState(false);

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
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      // Dateien sequenziell und abwartend verarbeiten – vorher endete
      // setIsUploading(false) bereits vor den asynchronen onload-Callbacks
      // (Race-Condition: Upload-Anzeige verschwand zu früh, Fehler wurden verschluckt)
      for (const file of Array.from(files)) {
        try {
          const format = detectFormat(file.name);
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          const title = file.name.replace(/\.[^/.]+$/, '');
          addBook({ title, format, file: base64, fileSize: file.size });
          toast.success(`"${title}" wurde hinzugefügt`);
        } catch { toast.error(`Fehler beim Laden von ${file.name}`); }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [addBook]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      <EyeCareTimer />
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <BookIcon className="w-5 h-5 text-white" />
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
                    {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><BookIcon className="w-16 h-16 text-amber-600/40" /></div>}
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

      {/* Optimiertes Bottom-Menü */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
        <div className="flex justify-around items-center h-14">
          {/* Wichtigste Funktionen direkt sichtbar */}
          <Button variant="ghost" size="sm" onClick={() => setShowStats(true)} className="flex flex-col items-center gap-0.5 h-auto py-1.5">
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px]">Statistik</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowGutenberg(true)} className="flex flex-col items-center gap-0.5 h-auto py-1.5">
            <Globe className="w-5 h-5" />
            <span className="text-[10px]">Bücher</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowThemeCustomizer(true)} className="flex flex-col items-center gap-0.5 h-auto py-1.5">
            <Palette className="w-5 h-5" />
            <span className="text-[10px]">Thema</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="flex flex-col items-center gap-0.5 h-auto py-1.5">
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Mehr</span>
          </Button>
        </div>
      </nav>

      {/* Mehr-Menü als Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="bottom" className="h-[75vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Alle Funktionen
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-100px)] mt-4">
            {/* Kategorie: Lesen & Lernen */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Lesen & Lernen</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowAchievements(true); }}>
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px]">Erfolge</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowKnowledgeGraph(true); }}>
                  <Network className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px]">Wissen</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowAccessibilityPro(true); }}>
                  <Eye className="w-5 h-5 text-green-500" />
                  <span className="text-[10px]">Barrierefr.</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowGoals(true); }}>
                  <Target className="w-5 h-5 text-pink-500" />
                  <span className="text-[10px]">Ziele</span>
                </Button>
              </div>
            </div>

            {/* Kategorie: Organisation */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Organisation</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowSmartShelves(true); }}>
                  <FolderTree className="w-5 h-5 text-cyan-500" />
                  <span className="text-[10px]">Regale</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowReadingLists(true); }}>
                  <List className="w-5 h-5 text-indigo-500" />
                  <span className="text-[10px]">Leselisten</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowOnleihe(true); }}>
                  <BookIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px]">Onleihe</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowGoodreads(true); }}>
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  <span className="text-[10px]">Goodreads</span>
                </Button>
              </div>
            </div>

            {/* Kategorie: Statistiken */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Statistiken</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowHeatmap(true); }}>
                  <Calendar className="w-5 h-5 text-rose-500" />
                  <span className="text-[10px]">Heatmap</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowSpeedChart(true); }}>
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  <span className="text-[10px]">Geschw.</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowSavings(true); }}>
                  <PiggyBank className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px]">Ersparnis</span>
                </Button>
              </div>
            </div>

            {/* Kategorie: Audio & KI */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Audio & KI</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowAmbient(true); }}>
                  <Volume2 className="w-5 h-5 text-violet-500" />
                  <span className="text-[10px]">Ambient</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowSpotify(true); }}>
                  <Music className="w-5 h-5 text-green-600" />
                  <span className="text-[10px]">Spotify</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowPodcast(true); }}>
                  <Headphones className="w-5 h-5 text-fuchsia-500" />
                  <span className="text-[10px]">Podcast</span>
                </Button>
              </div>
            </div>

            {/* Kategorie: Import & Export */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Import & Export</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowPDFExport(true); }}>
                  <FileDown className="w-5 h-5 text-red-500" />
                  <span className="text-[10px]">PDF Export</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowCalibre(true); }}>
                  <Database className="w-5 h-5 text-purple-500" />
                  <span className="text-[10px]">Calibre</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowCloudSync(true); }}>
                  <Cloud className="w-5 h-5 text-sky-500" />
                  <span className="text-[10px]">Cloud</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowRSS(true); }}>
                  <Rss className="w-5 h-5 text-yellow-500" />
                  <span className="text-[10px]">RSS</span>
                </Button>
              </div>
            </div>

            {/* Kategorie: Datenschutz */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Datenschutz</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => { setShowSettings(false); setShowPrivacy(true); }}>
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px]">Privatsphäre</span>
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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
      <PodcastModePanel open={showPodcast} onOpenChange={setShowPodcast} />
      <RSSPanel open={showRSS} onOpenChange={setShowRSS} />
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
      <OnleihePanel open={showOnleihe} onOpenChange={setShowOnleihe} />
      <NotionExportPanel open={showNotionExport} onOpenChange={setShowNotionExport} />
      <SpotifyPanel open={showSpotify} onOpenChange={setShowSpotify} />

      {/* Feature 20: Privatsphäre & Performance */}
      <PrivacyDashboard open={showPrivacy} onOpenChange={setShowPrivacy} />

      {selectedBook && <BookDetailPanel book={selectedBook} open={!!selectedBook} onOpenChange={() => setSelectedBook(null)} />}
    </div>
  );
};
