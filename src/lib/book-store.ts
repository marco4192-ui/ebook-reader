import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Bookmark {
  id: string;
  bookId: string;
  title: string;
  location: string;
  page?: number;
  cfi?: string;
  createdAt: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  note?: string;
  location: string;
  cfi?: string;
  page?: number;
  createdAt: number;
}

export interface Note {
  id: string;
  bookId: string;
  title: string;
  content: string; // Markdown content
  location?: string;
  page?: number;
  linkedNoteIds: string[]; // Links to other notes
  linkedBookIds: string[]; // Links to other books
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CrossReference {
  id: string;
  sourceBookId: string;
  sourceLocation: string;
  targetBookId: string;
  targetLocation?: string;
  note?: string;
  createdAt: number;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: number;
  endTime?: number;
  pagesRead: number;
  duration: number;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalPagesRead: number;
  totalReadingTime: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate?: string;
  dailyStats: Record<string, { pages: number; time: number }>;
}

export interface ReadingChallenge {
  id: string;
  title: string;
  type: 'books' | 'pages' | 'time' | 'streak';
  target: number;
  current: number;
  startDate: number;
  endDate?: number;
  completed: boolean;
}

export interface ReadingList {
  id: string;
  name: string;
  description?: string;
  bookIds: string[];
  createdAt: number;
  deadline?: number;
  color?: string;
}

// Book Club
export interface BookClub {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  bookIds: string[];
  createdBy: string;
}

// Club Message
export interface ClubMessage {
  id: string;
  clubId: string;
  userId: string;
  userName: string;
  content: string;
  bookId?: string;
  location?: string;
  createdAt: number;
}

// Character for character network
export interface Character {
  id: string;
  bookId: string;
  name: string;
  aliases?: string[];
  description?: string;
  relationships: { characterId: string; type: 'family' | 'friend' | 'enemy' | 'lover' | 'colleague' | 'other' }[];
}

// Audiobook position
export interface AudioPosition {
  bookId: string;
  currentTime: number;
  duration: number;
}

// RSS Feed
export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  lastFetched?: number;
}

// Article from RSS
export interface RSSArticle {
  id: string;
  feedId: string;
  title: string;
  content: string;
  url: string;
  publishedAt: number;
  savedAt?: number;
}

// Timeline Event for books
export interface TimelineEvent {
  id: string;
  bookId: string;
  title: string;
  description?: string;
  chapter?: string;
  location?: string;
  timestamp?: number; // In-book timestamp or position
  order: number; // Order in the timeline
  createdAt: number;
}

// Location mentioned in book
export interface BookLocation {
  id: string;
  bookId: string;
  name: string;
  description?: string;
  coordinates?: { lat: number; lng: number };
  mentions: number;
  firstMention?: string;
  createdAt: number;
}

// Custom Theme
export interface CustomTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  createdAt: number;
}

// Web Article saved as book
export interface WebArticle {
  id: string;
  title: string;
  url: string;
  content: string;
  author?: string;
  publishedAt?: number;
  savedAt: number;
  source?: string;
}

// Reading goal
export interface ReadingGoal {
  id: string;
  type: 'books' | 'pages' | 'time' | 'streak';
  target: number;
  current: number;
  year: number;
  startDate: number;
}

// Smart shelf
export interface SmartShelf {
  id: string;
  name: string;
  rule: 'unread' | 'in_progress' | 'completed' | 'favorites' | 'recently_added' | 'long_books' | 'short_books' | 'genre';
  genreFilter?: string;
  color: string;
  bookIds: string[];
}

// QR Sync data
export interface QRSyncData {
  deviceId: string;
  deviceName: string;
  lastSync: number;
  syncToken?: string;
}

// Reading speed record
export interface ReadingSpeedRecord {
  date: string;
  wpm: number;
  pagesRead: number;
  timeSpent: number;
}

// Bookmark folder
export interface BookmarkFolder {
  id: string;
  name: string;
  color: string;
  bookmarkIds: string[];
  createdAt: number;
}

// Smart shelf
export interface SmartShelf {
  id: string;
  name: string;
  rule: 'unread' | 'in_progress' | 'completed' | 'favorites' | 'recently_added' | 'long_books' | 'short_books' | 'genre' | 'custom';
  genreFilter?: string;
  customRule?: {
    field: 'progress' | 'rating' | 'pages' | 'addedAt' | 'lastRead';
    operator: 'equals' | 'greater' | 'less' | 'between';
    value: any;
  };
  color: string;
  icon?: string;
  bookIds: string[];
  createdAt: number;
}

// Reading goal
export interface ReadingGoal {
  id: string;
  type: 'books' | 'pages' | 'time' | 'streak';
  target: number;
  current: number;
  year: number;
  startDate: number;
  deadline?: number;
}

// Reading session hour record for heatmap
export interface ReadingHourRecord {
  hour: number;
  day: number; // 0-6 for day of week
  minutes: number;
}

// Cloud sync status
export interface CloudSyncStatus {
  provider: 'google_drive' | 'dropbox' | 'oneDrive' | 'none';
  connected: boolean;
  lastSync?: number;
  accessToken?: string;
}

// Book recommendation
export interface BookRecommendation {
  id: string;
  bookId: string;
  title: string;
  author?: string;
  reason: string;
  score: number;
  source: 'ai' | 'similar_readers' | 'genre';
  cover?: string;
}

// Friend for social features
export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  booksRead: number;
  currentBook?: string;
  streak: number;
}

// Book comment at specific location
export interface BookComment {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  location: string;
  page?: number;
  chapter?: string;
  createdAt: number;
  likes: number;
  replies: BookCommentReply[];
}

export interface BookCommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

// Social challenge with friends
export interface SocialChallenge extends ReadingChallenge {
  friendIds: string[];
  leaderboard: { userId: string; userName: string; progress: number; rank: number }[];
  isShared: boolean;
}

// Mood/Emotion record
export interface MoodRecord {
  bookId: string;
  location: string;
  mood: 'happy' | 'sad' | 'exciting' | 'calm' | 'tense' | 'romantic' | 'mysterious';
  intensity: number;
  note?: string;
}

export interface Achievement {
  id: string;
  type: 'first_book' | 'streak_7' | 'streak_30' | 'pages_100' | 'pages_1000' | 'books_10' | 'highlighter' | 'note_taker' | 'night_owl' | 'early_bird' | 'speed_reader' | 'social_butterfly' | 'cloud_master' | 'genre_explorer' | 'marathon_reader' | 'early_adopter';
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

// Feature 13: Content Enhancement Types
export interface Quote {
  id: string;
  bookId: string;
  bookTitle: string;
  author?: string;
  text: string;
  context?: string;
  location?: string;
  page?: number;
  tags: string[];
  note?: string;
  isFavorite: boolean;
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizResult {
  id: string;
  bookId: string;
  chapter?: string;
  questions: QuizQuestion[];
  answers: number[];
  score: number;
  totalQuestions: number;
  completedAt: number;
}

// Feature 14: Smart Reading Assistant Types
export interface ReadingFlowData {
  sessionId: string;
  bookId: string;
  startTime: number;
  pauses: { time: number; duration: number; position: number }[];
  speedVariations: { time: number; wpm: number; position: number }[];
  scrollPattern: 'smooth' | 'jumpy' | 'steady';
  averageWPM: number;
  totalPauseTime: number;
  focusScore: number; // 0-100
}

export interface SmartReminder {
  id: string;
  enabled: boolean;
  preferredTimes: string[]; // e.g., ['08:00', '20:00']
  reminderMessage: string;
  lastReminder?: number;
  streakDays: number;
  adaptiveEnabled: boolean;
}

export interface FocusModeSession {
  id: string;
  bookId: string;
  startTime: number;
  endTime?: number;
  currentLine?: number;
  blurIntensity: number;
  highlightIntensity: number;
}

export interface PomodoroSession {
  id: string;
  bookId: string;
  startTime: number;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  completedPomodoros: number;
  status: 'work' | 'break' | 'idle';
  totalReadingTime: number;
}

// Feature 16: Advanced Search Types
export interface GlobalSearchResult {
  id: string;
  bookId: string;
  bookTitle: string;
  author?: string;
  type: 'character' | 'location' | 'quote' | 'text' | 'cross_reference';
  text: string;
  context?: string;
  location?: string;
  page?: number;
  relevance: number;
}

// Extended Pomodoro Session for storage
export interface PomodoroSession {
  id: string;
  bookId: string;
  startTime: number;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  completedPomodoros: number;
  status: 'work' | 'break' | 'idle';
  totalReadingTime: number;
  endTime?: number;
}

// Book location for search
export interface BookLocation {
  id: string;
  bookId: string;
  name: string;
  description?: string;
  coordinates?: { lat: number; lng: number };
  mentions: number;
  firstMention?: string;
  createdAt: number;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  cover?: string;
  format: 'epub' | 'pdf' | 'txt' | 'md' | 'mobi' | 'azw3' | 'fb2' | 'djvu' | 'cbz' | 'cbr' | 'cb7' | 'cbt' | 'acv';
  file: string;
  fileSize: number;
  addedAt: number;
  lastRead?: number;
  progress: number;
  currentLocation?: string;
  currentPage?: number;
  totalPages?: number;
  tags: string[];
  category?: string;
  series?: string;
  seriesIndex?: number;
  estimatedReadingTime?: number;
  wordCount?: number;
  rating?: number; // 1-5 stars
  notes?: string; // User notes about the book
  isPinned?: boolean;
  isFromGutenberg?: boolean;
  gutenbergId?: number;
  // Comic/Manga specific
  isManga?: boolean; // true for right-to-left reading
  totalPagesCount?: number;
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia' | 'night' | 'custom';
  textAlign: 'left' | 'justify';
  marginSize: 'small' | 'medium' | 'large';
  ttsSpeed: number;
  ttsVoice: string;
  // Accessibility
  dyslexiaFont: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  bionicReading: boolean; // Bold first letters for faster reading
  hapticFeedback: boolean;
  gestureNavigation: boolean;
  // Eye Care
  eyeCareEnabled: boolean;
  eyeCareInterval: number; // minutes
  lastEyeCareReminder?: number;
  // Ambient Sound
  ambientSoundEnabled: boolean;
  ambientSoundType: 'rain' | 'cafe' | 'forest' | 'ocean' | 'fire' | 'none';
  ambientSoundVolume: number;
  // Comic/Manga Settings
  comicViewMode: 'single' | 'double' | 'vertical' | 'webtoon';
  comicReadingDirection: 'ltr' | 'rtl'; // left-to-right or right-to-left
  comicFitMode: 'fit-width' | 'fit-height' | 'fit-screen' | 'original';
  // Night Mode (Red filter)
  nightModeEnabled: boolean;
  nightModeIntensity: number; // 0-100
  // Speed Reading (RSVP)
  speedReadingWPM: number; // Words per minute
  speedReadingEnabled: boolean;
  // Custom Theme Colors
  customBackgroundColor?: string;
  customTextColor?: string;
  customAccentColor?: string;

  // === Feature 12: Erweitertes Lese-Erlebnis ===
  // Page Animation
  pageAnimation: 'none' | 'flip' | 'slide' | 'curl' | 'fade';
  pageAnimationSpeed: number; // milliseconds
  // Ambient Lighting
  ambientLightingEnabled: boolean;
  ambientLightingMode: 'auto' | 'manual';
  ambientLightingColor: string; // hex color
  ambientLightingIntensity: number; // 0-100
  // Parallax Background
  parallaxEnabled: boolean;
  parallaxBackground: 'none' | 'stars' | 'forest' | 'ocean' | 'mountains' | 'library';
  parallaxIntensity: number; // 0-100
  // Genre Theme
  genreThemeEnabled: boolean;
  bookGenre?: string;
  // Paper Texture
  paperTexture: 'none' | 'old-paper' | 'parchment' | 'newsprint' | 'vellum';
  paperTextureOpacity: number; // 0-100

  // === Feature 17: Ultimative Anpassung ===
  // Custom Fonts
  customFonts: { name: string; url: string; id: string }[];
  // Advanced Theme
  themeBackgroundColor: string;
  themeTextColor: string;
  themeAccentColor: string;
  themeHighlightColor: string;
  themeBorderColor: string;
  // Margin Presets
  marginPreset: 'minimal' | 'balanced' | 'generous' | 'custom';
  customMarginTop: number;
  customMarginBottom: number;
  customMarginLeft: number;
  customMarginRight: number;
  // Reading Mask
  readingMaskEnabled: boolean;
  readingMaskLines: number; // number of lines to show
  readingMaskOpacity: number; // 0-100
  readingMaskColor: string;
  // Gradient Theme
  gradientThemeEnabled: boolean;
  gradientThemeStart: string;
  gradientThemeEnd: string;
  gradientThemeDirection: 'to-right' | 'to-bottom' | 'diagonal';

  // === Feature 19: Accessibility Pro ===
  // Voice Commands
  voiceCommandsEnabled: boolean;
  voiceCommandsLanguage: string;
  // Screen Reader Optimization
  enhancedAriaEnabled: boolean;
  // Keyboard Navigation
  keyboardNavigationEnabled: boolean;
  // High Contrast Pro
  highContrastProEnabled: boolean;
  highContrastProMode: 'black-white' | 'white-black' | 'yellow-black' | 'black-yellow';
  // Reduced Motion Pro
  reducedMotionProEnabled: boolean;
  disableAllAnimations: boolean;
  reduceParallax: boolean;
}

interface BookStore {
  books: Book[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];
  crossReferences: CrossReference[];
  readingSessions: ReadingSession[];
  readingStats: ReadingStats;
  challenges: ReadingChallenge[];
  readingLists: ReadingList[];
  achievements: Achievement[];
  currentBook: Book | null;
  settings: ReaderSettings;
  searchQuery: string;
  selectedTags: string[];
  selectedCategory: string | null;

  // Cloud sync state
  qrSyncData: QRSyncData | null;
  cloudSyncStatus: CloudSyncStatus;
  autoSyncEnabled: boolean;

  // Social features state
  bookClubs: BookClub[];
  clubMessages: ClubMessage[];
  recommendations: BookRecommendation[];
  friends: Friend[];
  bookComments: BookComment[];
  socialChallenges: SocialChallenge[];

  // Feature 8: Organisation & Verwaltung
  smartShelves: SmartShelf[];
  bookmarkFolders: BookmarkFolder[];
  readingGoals: ReadingGoal[];
  readingSpeedRecords: ReadingSpeedRecord[];
  readingHourRecords: ReadingHourRecord[];
  
  // Interactive Features
  characters: Character[];
  locations: BookLocation[];
  timelineEvents: TimelineEvent[];
  customThemes: CustomTheme[];
  
  // Content Discovery
  rssFeeds: RSSFeed[];
  rssArticles: RSSArticle[];
  webArticles: WebArticle[];

  // Feature 13: Content Enhancement
  quotes: Quote[];
  quizResults: QuizResult[];

  // Feature 14: Smart Reading Assistant
  readingFlowData: ReadingFlowData[];
  smartReminders: SmartReminder[];
  focusModeSessions: FocusModeSession[];
  pomodoroSessions: PomodoroSession[];
  currentPomodoro: PomodoroSession | null;

  // Feature 16: Advanced Search
  globalSearchResults: GlobalSearchResult[];
  searchHistory: string[];
  
  // Book actions
  addBook: (book: Omit<Book, 'id' | 'addedAt' | 'progress' | 'tags'>) => string;
  removeBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  setCurrentBook: (book: Book | null) => void;
  updateProgress: (bookId: string, progress: number, location?: string, page?: number) => void;
  addTagToBook: (bookId: string, tag: string) => void;
  removeTagFromBook: (bookId: string, tag: string) => void;
  setCategory: (bookId: string, category: string) => void;
  setSeries: (bookId: string, series: string, index: number) => void;
  rateBook: (bookId: string, rating: number) => void;
  togglePin: (bookId: string) => void;
  
  // Bookmark actions
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => string;
  removeBookmark: (id: string) => void;
  getBookmarks: (bookId: string) => Bookmark[];
  
  // Highlight actions
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => string;
  updateHighlight: (id: string, updates: Partial<Highlight>) => void;
  removeHighlight: (id: string) => void;
  getHighlights: (bookId: string) => Highlight[];
  
  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;
  getNotes: (bookId: string) => Note[];
  linkNotes: (noteId: string, targetNoteId: string) => void;
  linkNoteToBook: (noteId: string, bookId: string) => void;
  
  // Cross-reference actions
  addCrossReference: (ref: Omit<CrossReference, 'id' | 'createdAt'>) => string;
  removeCrossReference: (id: string) => void;
  getCrossReferences: (bookId: string) => CrossReference[];
  
  // Reading session actions
  startReadingSession: (bookId: string) => string;
  endReadingSession: (sessionId: string, pagesRead: number) => void;
  
  // Stats actions
  updateReadingStats: (pages: number, time: number) => void;
  
  // Challenge actions
  addChallenge: (challenge: Omit<ReadingChallenge, 'id' | 'current' | 'completed'>) => string;
  updateChallenge: (id: string, progress: number) => void;
  removeChallenge: (id: string) => void;
  
  // Reading list actions
  addReadingList: (list: Omit<ReadingList, 'id' | 'createdAt'>) => string;
  updateReadingList: (id: string, updates: Partial<ReadingList>) => void;
  removeReadingList: (id: string) => void;
  addBookToList: (listId: string, bookId: string) => void;
  removeBookFromList: (listId: string, bookId: string) => void;
  
  // Achievement actions
  checkAchievements: () => void;
  unlockAchievement: (type: Achievement['type']) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  
  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedCategory: (category: string | null) => void;
  
  // Export/Import
  exportData: () => string;
  importData: (data: string) => boolean;
  
  // Cloud sync actions
  setQRSyncData: (data: QRSyncData | null) => void;
  setCloudSyncStatus: (status: Partial<CloudSyncStatus>) => void;
  toggleAutoSync: () => void;
  syncWithCloud: () => Promise<boolean>;
  generateQRData: (bookId: string) => string;
  importFromQRData: (data: string) => boolean;

  // Smart Shelf actions
  addSmartShelf: (shelf: Omit<SmartShelf, 'id' | 'createdAt' | 'bookIds'>) => string;
  updateSmartShelf: (id: string, updates: Partial<SmartShelf>) => void;
  removeSmartShelf: (id: string) => void;
  refreshSmartShelves: () => void;

  // Bookmark Folder actions
  addBookmarkFolder: (folder: Omit<BookmarkFolder, 'id' | 'createdAt' | 'bookmarkIds'>) => string;
  updateBookmarkFolder: (id: string, updates: Partial<BookmarkFolder>) => void;
  removeBookmarkFolder: (id: string) => void;
  moveBookmarkToFolder: (bookmarkId: string, folderId: string | null) => void;

  // Reading Goal actions
  addReadingGoal: (goal: Omit<ReadingGoal, 'id' | 'current'>) => string;
  updateReadingGoal: (id: string, updates: Partial<ReadingGoal>) => void;
  removeReadingGoal: (id: string) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;

  // Reading Speed Record actions
  addReadingSpeedRecord: (record: ReadingSpeedRecord) => void;

  // Reading Hour Record actions (for heatmap)
  addReadingHourRecord: (hour: number, day: number, minutes: number) => void;

  // Character actions
  addCharacter: (character: Omit<Character, 'id'>) => string;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  getCharacters: (bookId: string) => Character[];
  addCharacterRelationship: (characterId: string, targetId: string, type: Character['relationships'][0]['type']) => void;
  
  // Location actions
  addLocation: (location: Omit<BookLocation, 'id' | 'createdAt' | 'mentions'>) => string;
  updateLocation: (id: string, updates: Partial<BookLocation>) => void;
  removeLocation: (id: string) => void;
  getLocations: (bookId: string) => BookLocation[];
  
  // Timeline actions
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'createdAt'>) => string;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  removeTimelineEvent: (id: string) => void;
  getTimelineEvents: (bookId: string) => TimelineEvent[];
  
  // Custom Theme actions
  addCustomTheme: (theme: Omit<CustomTheme, 'id' | 'createdAt'>) => string;
  removeCustomTheme: (id: string) => void;
  applyCustomTheme: (id: string) => void;
  
  // RSS actions
  addRSSFeed: (feed: Omit<RSSFeed, 'id'>) => string;
  removeRSSFeed: (id: string) => void;
  updateRSSFeed: (id: string, updates: Partial<RSSFeed>) => void;
  addRSSArticle: (article: Omit<RSSArticle, 'id'>) => string;
  removeRSSArticle: (id: string) => void;
  saveRSSArticleAsBook: (articleId: string) => void;
  
  // Web Article actions
  addWebArticle: (article: Omit<WebArticle, 'id' | 'savedAt'>) => string;
  removeWebArticle: (id: string) => void;
  saveWebArticleAsBook: (id: string) => void;

  // Social features - Book Clubs
  addBookClub: (club: Omit<BookClub, 'id'>) => string;
  updateBookClub: (id: string, updates: Partial<BookClub>) => void;
  removeBookClub: (id: string) => void;
  joinBookClub: (clubId: string, userId: string) => void;
  leaveBookClub: (clubId: string, userId: string) => void;
  getBookClubs: () => BookClub[];

  // Social features - Club Messages
  addClubMessage: (message: Omit<ClubMessage, 'id' | 'createdAt'>) => string;
  getClubMessages: (clubId: string) => ClubMessage[];

  // Social features - Recommendations
  addRecommendation: (rec: Omit<BookRecommendation, 'id'>) => string;
  removeRecommendation: (id: string) => void;
  getRecommendations: () => BookRecommendation[];
  generateAIRecommendations: (bookId: string) => Promise<void>;

  // Social features - Friends
  addFriend: (friend: Omit<Friend, 'id'>) => string;
  removeFriend: (id: string) => void;
  getFriends: () => Friend[];

  // Social features - Comments
  addBookComment: (comment: Omit<BookComment, 'id' | 'createdAt' | 'likes' | 'replies'>) => string;
  removeBookComment: (id: string) => void;
  likeBookComment: (id: string) => void;
  addCommentReply: (commentId: string, reply: Omit<BookCommentReply, 'id' | 'createdAt'>) => void;
  getBookComments: (bookId: string) => BookComment[];

  // Social features - Challenges
  addSocialChallenge: (challenge: Omit<SocialChallenge, 'id' | 'current' | 'completed' | 'leaderboard'>) => string;
  updateSocialChallengeProgress: (id: string, progress: number) => void;
  removeSocialChallenge: (id: string) => void;
  shareChallenge: (id: string) => void;
  getSocialChallenges: () => SocialChallenge[];

  // Character actions
  addCharacter: (character: Omit<Character, 'id'>) => string;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  getCharacters: (bookId: string) => Character[];
  addCharacterRelationship: (characterId: string, targetId: string, type: Character['relationships'][0]['type']) => void;

  // Location actions
  addLocation: (location: Omit<BookLocation, 'id' | 'createdAt' | 'mentions'>) => string;
  updateLocation: (id: string, updates: Partial<BookLocation>) => void;
  removeLocation: (id: string) => void;
  getLocations: (bookId: string) => BookLocation[];

  // Timeline actions
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'createdAt'>) => string;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  removeTimelineEvent: (id: string) => void;
  getTimelineEvents: (bookId: string) => TimelineEvent[];

  // Custom Theme actions
  addCustomTheme: (theme: Omit<CustomTheme, 'id' | 'createdAt'>) => string;
  removeCustomTheme: (id: string) => void;
  applyCustomTheme: (id: string) => void;

  // RSS actions
  addRSSFeed: (feed: Omit<RSSFeed, 'id'>) => string;
  removeRSSFeed: (id: string) => void;
  updateRSSFeed: (id: string, updates: Partial<RSSFeed>) => void;
  addRSSArticle: (article: Omit<RSSArticle, 'id'>) => string;
  removeRSSArticle: (id: string) => void;
  saveRSSArticleAsBook: (articleId: string) => string;

  // Web Article actions
  addWebArticle: (article: Omit<WebArticle, 'id' | 'savedAt'>) => string;
  removeWebArticle: (id: string) => void;
  saveWebArticleAsBook: (id: string) => string;

  // Feature 13: Content Enhancement actions
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => string;
  removeQuote: (id: string) => void;
  toggleQuoteFavorite: (id: string) => void;
  getQuotes: (bookId?: string) => Quote[];
  addQuizResult: (result: Omit<QuizResult, 'id'>) => string;
  getQuizResults: (bookId: string) => QuizResult[];

  // Feature 14: Smart Reading Assistant actions
  startReadingFlowSession: (bookId: string) => string;
  recordPause: (sessionId: string, position: number, duration: number) => void;
  recordSpeedVariation: (sessionId: string, position: number, wpm: number) => void;
  endReadingFlowSession: (sessionId: string) => void;
  getReadingFlowData: (bookId: string) => ReadingFlowData[];
  
  addSmartReminder: (reminder: Omit<SmartReminder, 'id'>) => string;
  updateSmartReminder: (id: string, updates: Partial<SmartReminder>) => void;
  removeSmartReminder: (id: string) => void;
  
  startFocusModeSession: (bookId: string, blurIntensity: number, highlightIntensity: number) => string;
  endFocusModeSession: (sessionId: string) => void;
  
  startPomodoroSession: (bookId: string, workDuration: number, breakDuration: number) => string;
  updatePomodoroStatus: (sessionId: string, status: PomodoroSession['status']) => void;
  completePomodoro: (sessionId: string) => void;
  getPomodoroSessions: (bookId: string) => PomodoroSession[];

  // Feature 16: Advanced Search actions
  searchAllBooks: (query: string, type?: 'all' | 'characters' | 'locations' | 'quotes' | 'text') => Promise<GlobalSearchResult[]>;
  addSearchToHistory: (query: string) => void;
  clearSearchHistory: () => void;
  getSearchHistory: () => string[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'Georgia, serif',
  theme: 'light',
  textAlign: 'justify',
  marginSize: 'medium',
  ttsSpeed: 1,
  ttsVoice: '',
  dyslexiaFont: false,
  highContrast: false,
  reduceMotion: false,
  colorBlindMode: 'none',
  bionicReading: false,
  hapticFeedback: false,
  gestureNavigation: false,
  eyeCareEnabled: true,
  eyeCareInterval: 20,
  ambientSoundEnabled: false,
  ambientSoundType: 'none',
  ambientSoundVolume: 50,
  // Comic/Manga defaults
  comicViewMode: 'single',
  comicReadingDirection: 'ltr',
  comicFitMode: 'fit-width',
  // Night Mode (Red filter)
  nightModeEnabled: false,
  nightModeIntensity: 50,
  // Speed Reading (RSVP)
  speedReadingWPM: 300,
  speedReadingEnabled: false,
  // Custom Theme Colors
  customBackgroundColor: '#ffffff',
  customTextColor: '#000000',
  customAccentColor: '#f59e0b',

  // === Feature 12: Erweitertes Lese-Erlebnis ===
  pageAnimation: 'slide',
  pageAnimationSpeed: 300,
  ambientLightingEnabled: false,
  ambientLightingMode: 'auto',
  ambientLightingColor: '#fff5e6',
  ambientLightingIntensity: 20,
  parallaxEnabled: false,
  parallaxBackground: 'none',
  parallaxIntensity: 30,
  genreThemeEnabled: false,
  paperTexture: 'none',
  paperTextureOpacity: 30,

  // === Feature 17: Ultimative Anpassung ===
  customFonts: [],
  themeBackgroundColor: '#ffffff',
  themeTextColor: '#000000',
  themeAccentColor: '#f59e0b',
  themeHighlightColor: '#fef08a',
  themeBorderColor: '#e5e7eb',
  marginPreset: 'balanced',
  customMarginTop: 20,
  customMarginBottom: 20,
  customMarginLeft: 20,
  customMarginRight: 20,
  readingMaskEnabled: false,
  readingMaskLines: 3,
  readingMaskOpacity: 80,
  readingMaskColor: '#000000',
  gradientThemeEnabled: false,
  gradientThemeStart: '#fef3c7',
  gradientThemeEnd: '#fde68a',
  gradientThemeDirection: 'to-bottom',

  // === Feature 19: Accessibility Pro ===
  voiceCommandsEnabled: false,
  voiceCommandsLanguage: 'de-DE',
  enhancedAriaEnabled: false,
  keyboardNavigationEnabled: true,
  highContrastProEnabled: false,
  highContrastProMode: 'black-white',
  reducedMotionProEnabled: false,
  disableAllAnimations: false,
  reduceParallax: false,
};

const defaultStats: ReadingStats = {
  totalBooksRead: 0,
  totalPagesRead: 0,
  totalReadingTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  dailyStats: {},
};

const defaultAchievements: Achievement[] = [
  { id: 'first_book', type: 'first_book', title: 'Erstes Buch', description: 'Erstes Buch vollständig gelesen', icon: '📚' },
  { id: 'streak_7', type: 'streak_7', title: 'Wochen-Streak', description: '7 Tage in Folge gelesen', icon: '🔥' },
  { id: 'streak_30', type: 'streak_30', title: 'Monats-Streak', description: '30 Tage in Folge gelesen', icon: '⚡' },
  { id: 'pages_100', type: 'pages_100', title: 'Seiten-Leser', description: '100 Seiten gelesen', icon: '📖' },
  { id: 'pages_1000', type: 'pages_1000', title: 'Bücherwurm', description: '1000 Seiten gelesen', icon: '🐛' },
  { id: 'books_10', type: 'books_10', title: 'Bücher-Sammler', description: '10 Bücher gelesen', icon: '🏆' },
  { id: 'highlighter', type: 'highlighter', title: 'Markierer', description: '50 Textstellen markiert', icon: '🖍️' },
  { id: 'note_taker', type: 'note_taker', title: 'Notizen-Macher', description: '20 Notizen erstellt', icon: '📝' },
  { id: 'night_owl', type: 'night_owl', title: 'Nachteule', description: 'Nachts gelesen (22-5 Uhr)', icon: '🦉' },
  { id: 'early_bird', type: 'early_bird', title: 'Frühaufsteher', description: 'Morgens gelesen (5-7 Uhr)', icon: '🐦' },
];

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      books: [],
      bookmarks: [],
      highlights: [],
      notes: [],
      crossReferences: [],
      readingSessions: [],
      readingStats: defaultStats,
      challenges: [],
      readingLists: [],
      achievements: defaultAchievements,
      currentBook: null,
      settings: defaultSettings,
      searchQuery: '',
      selectedTags: [],
      selectedCategory: null,

      // Cloud sync state
      qrSyncData: null,
      cloudSyncStatus: { provider: 'none', connected: false },
      autoSyncEnabled: false,

      // Social features state
      bookClubs: [],
      clubMessages: [],
      recommendations: [],
      friends: [],
      bookComments: [],
      socialChallenges: [],

      // Feature 8: Organisation & Verwaltung
      smartShelves: [],
      bookmarkFolders: [],
      readingGoals: [],
      readingSpeedRecords: [],
      readingHourRecords: [],

      // Interactive Features
      characters: [],
      locations: [],
      timelineEvents: [],
      customThemes: [],

      // Content Discovery
      rssFeeds: [],
      rssArticles: [],
      webArticles: [],

      // Feature 13: Content Enhancement
      quotes: [],
      quizResults: [],

      // Feature 14: Smart Reading Assistant
      readingFlowData: [],
      smartReminders: [],
      focusModeSessions: [],
      pomodoroSessions: [],
      currentPomodoro: null,

      // Feature 16: Advanced Search
      globalSearchResults: [],
      searchHistory: [],

      addBook: (book) => {
        const id = generateId();
        const newBook: Book = {
          ...book,
          id,
          addedAt: Date.now(),
          progress: 0,
          tags: [],
        };
        set((state) => ({ books: [...state.books, newBook] }));
        return id;
      },

      removeBook: (id) => {
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          bookmarks: state.bookmarks.filter((b) => b.bookId !== id),
          highlights: state.highlights.filter((h) => h.bookId !== id),
          notes: state.notes.filter((n) => n.bookId !== id),
          crossReferences: state.crossReferences.filter((r) => r.sourceBookId !== id && r.targetBookId !== id),
          readingSessions: state.readingSessions.filter((s) => s.bookId !== id),
          currentBook: state.currentBook?.id === id ? null : state.currentBook,
        }));
      },

      updateBook: (id, updates) => {
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
          currentBook: state.currentBook?.id === id ? { ...state.currentBook, ...updates } : state.currentBook,
        }));
      },

      setCurrentBook: (book) => {
        set({ currentBook: book });
        if (book) {
          get().updateBook(book.id, { lastRead: Date.now() });
        }
      },

      updateProgress: (bookId, progress, location, page) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId
              ? { ...b, progress, currentLocation: location, currentPage: page, lastRead: Date.now() }
              : b
          ),
          currentBook:
            state.currentBook?.id === bookId
              ? { ...state.currentBook, progress, currentLocation: location, currentPage: page }
              : state.currentBook,
        }));
        
        // Check achievements
        if (progress >= 100) {
          get().unlockAchievement('first_book');
        }
      },

      addTagToBook: (bookId, tag) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId && !b.tags.includes(tag) ? { ...b, tags: [...b.tags, tag] } : b
          ),
        }));
      },

      removeTagFromBook: (bookId, tag) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, tags: b.tags.filter((t) => t !== tag) } : b
          ),
        }));
      },

      setCategory: (bookId, category) => {
        get().updateBook(bookId, { category });
      },

      setSeries: (bookId, series, index) => {
        get().updateBook(bookId, { series, seriesIndex: index });
      },

      rateBook: (bookId, rating) => {
        get().updateBook(bookId, { rating });
      },

      togglePin: (bookId) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, isPinned: !b.isPinned } : b
          ),
        }));
      },

      addBookmark: (bookmark) => {
        const id = generateId();
        const newBookmark: Bookmark = { ...bookmark, id, createdAt: Date.now() };
        set((state) => ({ bookmarks: [...state.bookmarks, newBookmark] }));
        return id;
      },

      removeBookmark: (id) => {
        set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) }));
      },

      getBookmarks: (bookId) => get().bookmarks.filter((b) => b.bookId === bookId),

      addHighlight: (highlight) => {
        const id = generateId();
        const newHighlight: Highlight = { ...highlight, id, createdAt: Date.now() };
        set((state) => ({ highlights: [...state.highlights, newHighlight] }));
        
        // Check highlighter achievement
        if (get().highlights.length >= 50) {
          get().unlockAchievement('highlighter');
        }
        return id;
      },

      updateHighlight: (id, updates) => {
        set((state) => ({
          highlights: state.highlights.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      removeHighlight: (id) => {
        set((state) => ({ highlights: state.highlights.filter((h) => h.id !== id) }));
      },

      getHighlights: (bookId) => get().highlights.filter((h) => h.bookId === bookId),

      addNote: (note) => {
        const id = generateId();
        const now = Date.now();
        const newNote: Note = { ...note, id, createdAt: now, updatedAt: now };
        set((state) => ({ notes: [...state.notes, newNote] }));
        
        // Check note taker achievement
        if (get().notes.length >= 20) {
          get().unlockAchievement('note_taker');
        }
        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
          ),
        }));
      },

      removeNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
      },

      getNotes: (bookId) => get().notes.filter((n) => n.bookId === bookId),

      linkNotes: (noteId, targetNoteId) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId && !n.linkedNoteIds.includes(targetNoteId)
              ? { ...n, linkedNoteIds: [...n.linkedNoteIds, targetNoteId] }
              : n
          ),
        }));
      },

      linkNoteToBook: (noteId, bookId) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId && !n.linkedBookIds.includes(bookId)
              ? { ...n, linkedBookIds: [...n.linkedBookIds, bookId] }
              : n
          ),
        }));
      },

      addCrossReference: (ref) => {
        const id = generateId();
        const newRef: CrossReference = { ...ref, id, createdAt: Date.now() };
        set((state) => ({ crossReferences: [...state.crossReferences, newRef] }));
        return id;
      },

      removeCrossReference: (id) => {
        set((state) => ({ crossReferences: state.crossReferences.filter((r) => r.id !== id) }));
      },

      getCrossReferences: (bookId) =>
        get().crossReferences.filter((r) => r.sourceBookId === bookId || r.targetBookId === bookId),

      startReadingSession: (bookId) => {
        const id = generateId();
        const session: ReadingSession = {
          id,
          bookId,
          startTime: Date.now(),
          pagesRead: 0,
          duration: 0,
        };
        set((state) => ({ readingSessions: [...state.readingSessions, session] }));
        
        // Check time-based achievements
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 5) {
          get().unlockAchievement('night_owl');
        } else if (hour >= 5 && hour < 7) {
          get().unlockAchievement('early_bird');
        }
        
        return id;
      },

      endReadingSession: (sessionId, pagesRead) => {
        const session = get().readingSessions.find((s) => s.id === sessionId);
        if (session) {
          const duration = Math.floor((Date.now() - session.startTime) / 1000);
          set((state) => ({
            readingSessions: state.readingSessions.map((s) =>
              s.id === sessionId ? { ...s, endTime: Date.now(), pagesRead, duration } : s
            ),
          }));
          get().updateReadingStats(pagesRead, duration);
        }
      },

      updateReadingStats: (pages, time) => {
        const today = new Date().toISOString().split('T')[0];
        const lastReadDate = get().readingStats.lastReadDate;
        
        let newStreak = get().readingStats.currentStreak;
        if (lastReadDate) {
          const lastDate = new Date(lastReadDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;
        } else {
          newStreak = 1;
        }

        set((state) => ({
          readingStats: {
            ...state.readingStats,
            totalPagesRead: state.readingStats.totalPagesRead + pages,
            totalReadingTime: state.readingStats.totalReadingTime + time,
            currentStreak: newStreak,
            longestStreak: Math.max(state.readingStats.longestStreak, newStreak),
            lastReadDate: today,
            dailyStats: {
              ...state.readingStats.dailyStats,
              [today]: {
                pages: (state.readingStats.dailyStats[today]?.pages || 0) + pages,
                time: (state.readingStats.dailyStats[today]?.time || 0) + time,
              },
            },
          },
        }));

        // Check achievements
        const stats = get().readingStats;
        if (newStreak >= 7) get().unlockAchievement('streak_7');
        if (newStreak >= 30) get().unlockAchievement('streak_30');
        if (stats.totalPagesRead >= 100) get().unlockAchievement('pages_100');
        if (stats.totalPagesRead >= 1000) get().unlockAchievement('pages_1000');
        if (get().books.filter(b => b.progress >= 100).length >= 10) {
          get().unlockAchievement('books_10');
        }
      },

      addChallenge: (challenge) => {
        const id = generateId();
        const newChallenge: ReadingChallenge = { ...challenge, id, current: 0, completed: false };
        set((state) => ({ challenges: [...state.challenges, newChallenge] }));
        return id;
      },

      updateChallenge: (id, progress) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === id ? { ...c, current: progress, completed: progress >= c.target } : c
          ),
        }));
      },

      removeChallenge: (id) => {
        set((state) => ({ challenges: state.challenges.filter((c) => c.id !== id) }));
      },

      addReadingList: (list) => {
        const id = generateId();
        const newList: ReadingList = { ...list, id, createdAt: Date.now() };
        set((state) => ({ readingLists: [...state.readingLists, newList] }));
        return id;
      },

      updateReadingList: (id, updates) => {
        set((state) => ({
          readingLists: state.readingLists.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      removeReadingList: (id) => {
        set((state) => ({ readingLists: state.readingLists.filter((l) => l.id !== id) }));
      },

      addBookToList: (listId, bookId) => {
        set((state) => ({
          readingLists: state.readingLists.map((l) =>
            l.id === listId && !l.bookIds.includes(bookId)
              ? { ...l, bookIds: [...l.bookIds, bookId] }
              : l
          ),
        }));
      },

      removeBookFromList: (listId, bookId) => {
        set((state) => ({
          readingLists: state.readingLists.map((l) =>
            l.id === listId ? { ...l, bookIds: l.bookIds.filter((id) => id !== bookId) } : l
          ),
        }));
      },

      checkAchievements: () => {
        const state = get();
        // Auto-check all achievement conditions
      },

      unlockAchievement: (type) => {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.type === type && !a.unlockedAt ? { ...a, unlockedAt: Date.now() } : a
          ),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }));
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      exportData: () => {
        const state = get();
        return JSON.stringify({
          books: state.books,
          bookmarks: state.bookmarks,
          highlights: state.highlights,
          notes: state.notes,
          crossReferences: state.crossReferences,
          readingStats: state.readingStats,
          challenges: state.challenges,
          readingLists: state.readingLists,
          achievements: state.achievements,
          settings: state.settings,
          exportedAt: Date.now(),
        });
      },

      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (data.books) {
            set({
              books: data.books,
              bookmarks: data.bookmarks || [],
              highlights: data.highlights || [],
              notes: data.notes || [],
              crossReferences: data.crossReferences || [],
              readingStats: data.readingStats || defaultStats,
              challenges: data.challenges || [],
              readingLists: data.readingLists || [],
              achievements: data.achievements || defaultAchievements,
              settings: data.settings || defaultSettings,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      // Cloud sync actions
      setQRSyncData: (data) => set({ qrSyncData: data }),

      setCloudSyncStatus: (status) => {
        set((state) => ({
          cloudSyncStatus: { ...state.cloudSyncStatus, ...status },
        }));
      },

      toggleAutoSync: () => {
        set((state) => ({ autoSyncEnabled: !state.autoSyncEnabled }));
      },

      syncWithCloud: async () => {
        // Simulate cloud sync - in production, this would connect to actual cloud storage
        const status = get().cloudSyncStatus;
        if (!status.connected) {
          return false;
        }
        
        // Update last sync time
        set((state) => ({
          cloudSyncStatus: { ...state.cloudSyncStatus, lastSync: Date.now() },
        }));
        
        // In a real implementation, this would sync data with the cloud provider
        return true;
      },

      generateQRData: (bookId) => {
        const book = get().books.find(b => b.id === bookId);
        if (!book) return '';
        
        const qrData = {
          type: 'ebook-sync',
          version: 1,
          book: {
            title: book.title,
            author: book.author,
            format: book.format,
            progress: book.progress,
            currentLocation: book.currentLocation,
            currentPage: book.currentPage,
            tags: book.tags,
            rating: book.rating,
          },
          deviceId: get().qrSyncData?.deviceId || generateId(),
          timestamp: Date.now(),
        };
        
        return JSON.stringify(qrData);
      },

      importFromQRData: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type !== 'ebook-sync' || !parsed.book) {
            return false;
          }
          
          // Update QR sync data
          set({
            qrSyncData: {
              deviceId: parsed.deviceId,
              deviceName: 'Externes Gerät',
              lastSync: parsed.timestamp,
            },
          });
          
          return true;
        } catch {
          return false;
        }
      },

      // Character actions
      addCharacter: (character) => {
        const id = generateId();
        set((state) => ({ characters: [...state.characters, { ...character, id }] }));
        return id;
      },

      updateCharacter: (id, updates) => {
        set((state) => ({
          characters: state.characters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      removeCharacter: (id) => {
        set((state) => ({ characters: state.characters.filter((c) => c.id !== id) }));
      },

      getCharacters: (bookId) => get().characters.filter((c) => c.bookId === bookId),

      addCharacterRelationship: (characterId, targetId, type) => {
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === characterId
              ? {
                  ...c,
                  relationships: [
                    ...c.relationships.filter((r) => r.characterId !== targetId),
                    { characterId: targetId, type },
                  ],
                }
              : c
          ),
        }));
      },

      // Location actions
      addLocation: (location) => {
        const id = generateId();
        set((state) => ({
          locations: [...state.locations, { ...location, id, createdAt: Date.now(), mentions: 1 }],
        }));
        return id;
      },

      updateLocation: (id, updates) => {
        set((state) => ({
          locations: state.locations.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      removeLocation: (id) => {
        set((state) => ({ locations: state.locations.filter((l) => l.id !== id) }));
      },

      getLocations: (bookId) => get().locations.filter((l) => l.bookId === bookId),

      // Timeline actions
      addTimelineEvent: (event) => {
        const id = generateId();
        set((state) => ({
          timelineEvents: [...state.timelineEvents, { ...event, id, createdAt: Date.now() }],
        }));
        return id;
      },

      updateTimelineEvent: (id, updates) => {
        set((state) => ({
          timelineEvents: state.timelineEvents.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      removeTimelineEvent: (id) => {
        set((state) => ({ timelineEvents: state.timelineEvents.filter((e) => e.id !== id) }));
      },

      getTimelineEvents: (bookId) => get().timelineEvents.filter((e) => e.bookId === bookId),

      // Custom Theme actions
      addCustomTheme: (theme) => {
        const id = generateId();
        set((state) => ({
          customThemes: [...state.customThemes, { ...theme, id, createdAt: Date.now() }],
        }));
        return id;
      },

      removeCustomTheme: (id) => {
        set((state) => ({ customThemes: state.customThemes.filter((t) => t.id !== id) }));
      },

      applyCustomTheme: (id) => {
        const theme = get().customThemes.find((t) => t.id === id);
        if (theme) {
          set((state) => ({
            settings: {
              ...state.settings,
              theme: 'custom',
              customBackgroundColor: theme.backgroundColor,
              customTextColor: theme.textColor,
              customAccentColor: theme.accentColor,
            },
          }));
        }
      },

      // RSS actions
      addRSSFeed: (feed) => {
        const id = generateId();
        set((state) => ({ rssFeeds: [...state.rssFeeds, { ...feed, id }] }));
        return id;
      },

      removeRSSFeed: (id) => {
        set((state) => ({
          rssFeeds: state.rssFeeds.filter((f) => f.id !== id),
          rssArticles: state.rssArticles.filter((a) => a.feedId !== id),
        }));
      },

      updateRSSFeed: (id, updates) => {
        set((state) => ({
          rssFeeds: state.rssFeeds.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }));
      },

      addRSSArticle: (article) => {
        const id = generateId();
        set((state) => ({ rssArticles: [...state.rssArticles, { ...article, id }] }));
        return id;
      },

      removeRSSArticle: (id) => {
        set((state) => ({ rssArticles: state.rssArticles.filter((a) => a.id !== id) }));
      },

      saveRSSArticleAsBook: (articleId) => {
        const article = get().rssArticles.find((a) => a.id === articleId);
        if (article) {
          const bookId = get().addBook({
            title: article.title,
            format: 'txt',
            file: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(article.content)))}`,
            fileSize: article.content.length,
          });
          return bookId;
        }
        return '';
      },

      // Web Article actions
      addWebArticle: (article) => {
        const id = generateId();
        set((state) => ({
          webArticles: [...state.webArticles, { ...article, id, savedAt: Date.now() }],
        }));
        return id;
      },

      removeWebArticle: (id) => {
        set((state) => ({ webArticles: state.webArticles.filter((a) => a.id !== id) }));
      },

      saveWebArticleAsBook: (id) => {
        const article = get().webArticles.find((a) => a.id === id);
        if (article) {
          const bookId = get().addBook({
            title: article.title,
            author: article.author,
            format: 'txt',
            file: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(article.content)))}`,
            fileSize: article.content.length,
          });
          return bookId;
        }
        return '';
      },

      // Smart Shelf actions
      addSmartShelf: (shelf) => {
        const id = generateId();
        const newShelf: SmartShelf = {
          ...shelf,
          id,
          createdAt: Date.now(),
          bookIds: [],
        };
        set((state) => ({ smartShelves: [...state.smartShelves, newShelf] }));
        get().refreshSmartShelves();
        return id;
      },

      updateSmartShelf: (id, updates) => {
        set((state) => ({
          smartShelves: state.smartShelves.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
        get().refreshSmartShelves();
      },

      removeSmartShelf: (id) => {
        set((state) => ({ smartShelves: state.smartShelves.filter((s) => s.id !== id) }));
      },

      refreshSmartShelves: () => {
        const books = get().books;
        set((state) => ({
          smartShelves: state.smartShelves.map((shelf) => {
            let matchingBookIds: string[] = [];

            switch (shelf.rule) {
              case 'unread':
                matchingBookIds = books.filter((b) => b.progress === 0).map((b) => b.id);
                break;
              case 'in_progress':
                matchingBookIds = books.filter((b) => b.progress > 0 && b.progress < 100).map((b) => b.id);
                break;
              case 'completed':
                matchingBookIds = books.filter((b) => b.progress >= 100).map((b) => b.id);
                break;
              case 'favorites':
                matchingBookIds = books.filter((b) => b.rating && b.rating >= 4).map((b) => b.id);
                break;
              case 'recently_added':
                const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                matchingBookIds = books.filter((b) => b.addedAt >= oneWeekAgo).map((b) => b.id);
                break;
              case 'long_books':
                matchingBookIds = books.filter((b) => (b.wordCount || 0) > 100000).map((b) => b.id);
                break;
              case 'short_books':
                matchingBookIds = books.filter((b) => (b.wordCount || 0) < 30000 && (b.wordCount || 0) > 0).map((b) => b.id);
                break;
              case 'genre':
                if (shelf.genreFilter) {
                  matchingBookIds = books.filter((b) => b.tags.includes(shelf.genreFilter!)).map((b) => b.id);
                }
                break;
              case 'custom':
                if (shelf.customRule) {
                  matchingBookIds = books.filter((b) => {
                    const field = shelf.customRule!.field;
                    const operator = shelf.customRule!.operator;
                    const value = shelf.customRule!.value;
                    const bookValue = b[field as keyof Book];

                    if (bookValue === undefined) return false;

                    switch (operator) {
                      case 'equals':
                        return bookValue === value;
                      case 'greater':
                        return (bookValue as number) > value;
                      case 'less':
                        return (bookValue as number) < value;
                      case 'between':
                        return (bookValue as number) >= value[0] && (bookValue as number) <= value[1];
                      default:
                        return false;
                    }
                  }).map((b) => b.id);
                }
                break;
            }

            return { ...shelf, bookIds: matchingBookIds };
          }),
        }));
      },

      // Bookmark Folder actions
      addBookmarkFolder: (folder) => {
        const id = generateId();
        const newFolder: BookmarkFolder = {
          ...folder,
          id,
          createdAt: Date.now(),
          bookmarkIds: [],
        };
        set((state) => ({ bookmarkFolders: [...state.bookmarkFolders, newFolder] }));
        return id;
      },

      updateBookmarkFolder: (id, updates) => {
        set((state) => ({
          bookmarkFolders: state.bookmarkFolders.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
      },

      removeBookmarkFolder: (id) => {
        set((state) => ({ bookmarkFolders: state.bookmarkFolders.filter((f) => f.id !== id) }));
      },

      moveBookmarkToFolder: (bookmarkId, folderId) => {
        set((state) => ({
          bookmarkFolders: state.bookmarkFolders.map((f) => ({
            ...f,
            bookmarkIds: f.bookmarkIds.filter((id) => id !== bookmarkId),
          })),
        }));
        if (folderId) {
          set((state) => ({
            bookmarkFolders: state.bookmarkFolders.map((f) =>
              f.id === folderId && !f.bookmarkIds.includes(bookmarkId)
                ? { ...f, bookmarkIds: [...f.bookmarkIds, bookmarkId] }
                : f
            ),
          }));
        }
      },

      // Reading Goal actions
      addReadingGoal: (goal) => {
        const id = generateId();
        const newGoal: ReadingGoal = {
          ...goal,
          id,
          current: 0,
        };
        set((state) => ({ readingGoals: [...state.readingGoals, newGoal] }));
        return id;
      },

      updateReadingGoal: (id, updates) => {
        set((state) => ({
          readingGoals: state.readingGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },

      removeReadingGoal: (id) => {
        set((state) => ({ readingGoals: state.readingGoals.filter((g) => g.id !== id) }));
      },

      updateGoalProgress: (goalId, progress) => {
        set((state) => ({
          readingGoals: state.readingGoals.map((g) =>
            g.id === goalId ? { ...g, current: Math.min(progress, g.target) } : g
          ),
        }));
      },

      // Reading Speed Record actions
      addReadingSpeedRecord: (record) => {
        set((state) => {
          const existing = state.readingSpeedRecords.find((r) => r.date === record.date);
          if (existing) {
            return {
              readingSpeedRecords: state.readingSpeedRecords.map((r) =>
                r.date === record.date
                  ? {
                      ...r,
                      wpm: Math.round((r.wpm + record.wpm) / 2),
                      pagesRead: r.pagesRead + record.pagesRead,
                      timeSpent: r.timeSpent + record.timeSpent,
                    }
                  : r
              ),
            };
          }
          return { readingSpeedRecords: [...state.readingSpeedRecords, record] };
        });
      },

      // Reading Hour Record actions (for heatmap)
      addReadingHourRecord: (hour, day, minutes) => {
        set((state) => {
          const existing = state.readingHourRecords.find(
            (r) => r.hour === hour && r.day === day
          );
          if (existing) {
            return {
              readingHourRecords: state.readingHourRecords.map((r) =>
                r.hour === hour && r.day === day
                  ? { ...r, minutes: r.minutes + minutes }
                  : r
              ),
            };
          }
          return {
            readingHourRecords: [...state.readingHourRecords, { hour, day, minutes }],
          };
        });
      },

      // Social features - Book Clubs
      addBookClub: (club) => {
        const id = generateId();
        set((state) => ({ bookClubs: [...state.bookClubs, { ...club, id }] }));
        return id;
      },

      updateBookClub: (id, updates) => {
        set((state) => ({
          bookClubs: state.bookClubs.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      removeBookClub: (id) => {
        set((state) => ({
          bookClubs: state.bookClubs.filter((c) => c.id !== id),
          clubMessages: state.clubMessages.filter((m) => m.clubId !== id),
        }));
      },

      joinBookClub: (clubId, userId) => {
        set((state) => ({
          bookClubs: state.bookClubs.map((c) =>
            c.id === clubId && !c.memberIds.includes(userId)
              ? { ...c, memberIds: [...c.memberIds, userId] }
              : c
          ),
        }));
      },

      leaveBookClub: (clubId, userId) => {
        set((state) => ({
          bookClubs: state.bookClubs.map((c) =>
            c.id === clubId ? { ...c, memberIds: c.memberIds.filter((id) => id !== userId) } : c
          ),
        }));
      },

      getBookClubs: () => get().bookClubs,

      // Social features - Club Messages
      addClubMessage: (message) => {
        const id = generateId();
        set((state) => ({
          clubMessages: [...state.clubMessages, { ...message, id, createdAt: Date.now() }],
        }));
        return id;
      },

      getClubMessages: (clubId) => get().clubMessages.filter((m) => m.clubId === clubId),

      // Social features - Recommendations
      addRecommendation: (rec) => {
        const id = generateId();
        set((state) => ({ recommendations: [...state.recommendations, { ...rec, id }] }));
        return id;
      },

      removeRecommendation: (id) => {
        set((state) => ({ recommendations: state.recommendations.filter((r) => r.id !== id) }));
      },

      getRecommendations: () => get().recommendations,

      generateAIRecommendations: async (bookId) => {
        const book = get().books.find((b) => b.id === bookId);
        if (!book) return;

        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookTitle: book.title, author: book.author, forRecommendations: true }),
          });
          const data = await response.json();

          if (data.recommendations) {
            data.recommendations.forEach((rec: { title: string; author: string; reason: string; score: number }) => {
              get().addRecommendation({
                bookId: '',
                title: rec.title,
                author: rec.author,
                reason: rec.reason,
                score: rec.score,
                source: 'ai',
              });
            });
          }
        } catch (error) {
          console.error('Failed to generate recommendations:', error);
        }
      },

      // Social features - Friends
      addFriend: (friend) => {
        const id = generateId();
        set((state) => ({ friends: [...state.friends, { ...friend, id }] }));
        return id;
      },

      removeFriend: (id) => {
        set((state) => ({ friends: state.friends.filter((f) => f.id !== id) }));
      },

      getFriends: () => get().friends,

      // Social features - Comments
      addBookComment: (comment) => {
        const id = generateId();
        set((state) => ({
          bookComments: [...state.bookComments, { ...comment, id, createdAt: Date.now(), likes: 0, replies: [] }],
        }));
        return id;
      },

      removeBookComment: (id) => {
        set((state) => ({ bookComments: state.bookComments.filter((c) => c.id !== id) }));
      },

      likeBookComment: (id) => {
        set((state) => ({
          bookComments: state.bookComments.map((c) =>
            c.id === id ? { ...c, likes: c.likes + 1 } : c
          ),
        }));
      },

      addCommentReply: (commentId, reply) => {
        set((state) => ({
          bookComments: state.bookComments.map((c) =>
            c.id === commentId
              ? { ...c, replies: [...c.replies, { ...reply, id: generateId(), createdAt: Date.now() }] }
              : c
          ),
        }));
      },

      getBookComments: (bookId) => get().bookComments.filter((c) => c.bookId === bookId),

      // Social features - Challenges
      addSocialChallenge: (challenge) => {
        const id = generateId();
        set((state) => ({
          socialChallenges: [...state.socialChallenges, { ...challenge, id, current: 0, completed: false, leaderboard: [] }],
        }));
        return id;
      },

      updateSocialChallengeProgress: (id, progress) => {
        set((state) => ({
          socialChallenges: state.socialChallenges.map((c) =>
            c.id === id ? { ...c, current: progress, completed: progress >= c.target } : c
          ),
        }));
      },

      removeSocialChallenge: (id) => {
        set((state) => ({ socialChallenges: state.socialChallenges.filter((c) => c.id !== id) }));
      },

      shareChallenge: (id) => {
        set((state) => ({
          socialChallenges: state.socialChallenges.map((c) =>
            c.id === id ? { ...c, isShared: true } : c
          ),
        }));
      },

      getSocialChallenges: () => get().socialChallenges,

      // Feature 13: Content Enhancement actions
      addQuote: (quote) => {
        const id = generateId();
        set((state) => ({
          quotes: [...state.quotes, { ...quote, id, createdAt: Date.now() }],
        }));
        return id;
      },

      removeQuote: (id) => {
        set((state) => ({ quotes: state.quotes.filter((q) => q.id !== id) }));
      },

      toggleQuoteFavorite: (id) => {
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
          ),
        }));
      },

      getQuotes: (bookId) => {
        if (bookId) {
          return get().quotes.filter((q) => q.bookId === bookId);
        }
        return get().quotes;
      },

      addQuizResult: (result) => {
        const id = generateId();
        set((state) => ({
          quizResults: [...state.quizResults, { ...result, id }],
        }));
        return id;
      },

      getQuizResults: (bookId) => get().quizResults.filter((r) => r.bookId === bookId),

      // Feature 14: Smart Reading Assistant actions
      startReadingFlowSession: (bookId) => {
        const id = generateId();
        const session: ReadingFlowData = {
          sessionId: id,
          bookId,
          startTime: Date.now(),
          pauses: [],
          speedVariations: [],
          scrollPattern: 'steady',
          averageWPM: 0,
          totalPauseTime: 0,
          focusScore: 100,
        };
        set((state) => ({
          readingFlowData: [...state.readingFlowData, session],
        }));
        return id;
      },

      recordPause: (sessionId, position, duration) => {
        set((state) => ({
          readingFlowData: state.readingFlowData.map((s) =>
            s.sessionId === sessionId
              ? {
                  ...s,
                  pauses: [...s.pauses, { time: Date.now(), position, duration }],
                  totalPauseTime: s.totalPauseTime + duration,
                  focusScore: Math.max(0, s.focusScore - (duration > 30 ? 5 : 2)),
                }
              : s
          ),
        }));
      },

      recordSpeedVariation: (sessionId, position, wpm) => {
        set((state) => ({
          readingFlowData: state.readingFlowData.map((s) =>
            s.sessionId === sessionId
              ? {
                  ...s,
                  speedVariations: [...s.speedVariations, { time: Date.now(), wpm, position }],
                  averageWPM: Math.round(
                    (s.averageWPM * s.speedVariations.length + wpm) / (s.speedVariations.length + 1)
                  ),
                }
              : s
          ),
        }));
      },

      endReadingFlowSession: (sessionId) => {
        // Session is complete, just keep it in history
      },

      getReadingFlowData: (bookId) => get().readingFlowData.filter((d) => d.bookId === bookId),

      addSmartReminder: (reminder) => {
        const id = generateId();
        set((state) => ({
          smartReminders: [...state.smartReminders, { ...reminder, id }],
        }));
        return id;
      },

      updateSmartReminder: (id, updates) => {
        set((state) => ({
          smartReminders: state.smartReminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      removeSmartReminder: (id) => {
        set((state) => ({ smartReminders: state.smartReminders.filter((r) => r.id !== id) }));
      },

      startFocusModeSession: (bookId, blurIntensity, highlightIntensity) => {
        const id = generateId();
        const session: FocusModeSession = {
          id,
          bookId,
          startTime: Date.now(),
          blurIntensity,
          highlightIntensity,
        };
        set((state) => ({
          focusModeSessions: [...state.focusModeSessions, session],
        }));
        return id;
      },

      endFocusModeSession: (sessionId) => {
        set((state) => ({
          focusModeSessions: state.focusModeSessions.map((s) =>
            s.id === sessionId ? { ...s, endTime: Date.now() } : s
          ),
        }));
      },

      startPomodoroSession: (bookId, workDuration, breakDuration) => {
        const id = generateId();
        const session: PomodoroSession = {
          id,
          bookId,
          startTime: Date.now(),
          workDuration,
          breakDuration,
          completedPomodoros: 0,
          status: 'work',
          totalReadingTime: 0,
        };
        set((state) => ({
          pomodoroSessions: [...state.pomodoroSessions, session],
          currentPomodoro: session,
        }));
        return id;
      },

      updatePomodoroStatus: (sessionId, status) => {
        set((state) => ({
          pomodoroSessions: state.pomodoroSessions.map((s) =>
            s.id === sessionId ? { ...s, status } : s
          ),
          currentPomodoro:
            state.currentPomodoro?.id === sessionId
              ? { ...state.currentPomodoro, status }
              : state.currentPomodoro,
        }));
      },

      completePomodoro: (sessionId) => {
        set((state) => ({
          pomodoroSessions: state.pomodoroSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  completedPomodoros: s.completedPomodoros + 1,
                  totalReadingTime: s.totalReadingTime + s.workDuration,
                  status: 'break' as const,
                }
              : s
          ),
          currentPomodoro: state.currentPomodoro?.id === sessionId
            ? {
                ...state.currentPomodoro,
                completedPomodoros: state.currentPomodoro.completedPomodoros + 1,
                totalReadingTime: state.currentPomodoro.totalReadingTime + state.currentPomodoro.workDuration,
                status: 'break' as const,
              }
            : state.currentPomodoro,
        }));
      },

      getPomodoroSessions: (bookId) => get().pomodoroSessions.filter((s) => s.bookId === bookId),

      // Feature 16: Advanced Search actions
      searchAllBooks: async (query, type = 'all') => {
        const books = get().books;
        const results: GlobalSearchResult[] = [];

        // For each book, we would need the content - for now we search in titles, authors, tags
        for (const book of books) {
          const searchFields = [
            book.title.toLowerCase(),
            (book.author || '').toLowerCase(),
            book.tags.join(' ').toLowerCase(),
          ];
          const searchText = searchFields.join(' ');
          const lowerQuery = query.toLowerCase();

          if (searchText.includes(lowerQuery)) {
            results.push({
              id: generateId(),
              bookId: book.id,
              bookTitle: book.title,
              author: book.author,
              type: 'text',
              text: query,
              context: `${book.title}${book.author ? ` von ${book.author}` : ''}`,
              relevance: 1,
            });
          }

          // Search in highlights
          const highlights = get().getHighlights(book.id);
          for (const highlight of highlights) {
            if (highlight.text.toLowerCase().includes(lowerQuery)) {
              results.push({
                id: generateId(),
                bookId: book.id,
                bookTitle: book.title,
                author: book.author,
                type: 'quote',
                text: highlight.text,
                context: highlight.note,
                location: highlight.location,
                relevance: 2,
              });
            }
          }

          // Search in notes
          const notes = get().getNotes(book.id);
          for (const note of notes) {
            if (
              note.title.toLowerCase().includes(lowerQuery) ||
              note.content.toLowerCase().includes(lowerQuery)
            ) {
              results.push({
                id: generateId(),
                bookId: book.id,
                bookTitle: book.title,
                author: book.author,
                type: 'text',
                text: note.title,
                context: note.content.substring(0, 200),
                relevance: 1.5,
              });
            }
          }

          // Search in characters
          const characters = get().getCharacters(book.id);
          for (const char of characters) {
            if (char.name.toLowerCase().includes(lowerQuery)) {
              results.push({
                id: generateId(),
                bookId: book.id,
                bookTitle: book.title,
                author: book.author,
                type: 'character',
                text: char.name,
                context: char.description,
                relevance: 2,
              });
            }
          }

          // Search in locations
          const locations = get().getLocations(book.id);
          for (const loc of locations) {
            if (loc.name.toLowerCase().includes(lowerQuery)) {
              results.push({
                id: generateId(),
                bookId: book.id,
                bookTitle: book.title,
                author: book.author,
                type: 'location',
                text: loc.name,
                context: loc.description,
                relevance: 1.5,
              });
            }
          }
        }

        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);
        
        set({ globalSearchResults: results });
        return results;
      },

      addSearchToHistory: (query) => {
        set((state) => {
          const newHistory = [query, ...state.searchHistory.filter((h) => h !== query)].slice(0, 20);
          return { searchHistory: newHistory };
        });
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      getSearchHistory: () => get().searchHistory,
    }),
    { name: 'ebook-reader-storage-v3' }
  )
);

export const calculateReadingTime = (wordCount: number, wordsPerMinute: number = 200): number => {
  return Math.ceil(wordCount / wordsPerMinute);
};

export const getAllTags = (books: Book[]): string[] => {
  const tags = new Set<string>();
  books.forEach((book) => book.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags);
};

export const getAllCategories = (books: Book[]): string[] => {
  const categories = new Set<string>();
  books.forEach((book) => {
    if (book.category) categories.add(book.category);
  });
  return Array.from(categories);
};
