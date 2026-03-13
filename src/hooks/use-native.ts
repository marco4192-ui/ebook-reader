'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

// Check if running in Capacitor native environment
export const isNative = () => {
  if (typeof window === 'undefined') return false;
  return typeof (window as unknown as { Capacitor?: unknown }).Capacitor !== 'undefined' && 
    (window as unknown as { Capacitor?: { isNative?: () => boolean } }).Capacitor?.isNative?.() === true;
};

export function useNativeFeatures() {
  // Use useMemo to compute native status once per render
  // This avoids the setState in useEffect issue
  const native = useMemo(() => isNative(), []);

  // Initialize native features
  useEffect(() => {
    if (!native) return;

    // Hide splash screen after app loads
    SplashScreen.hide().catch(() => {});

    // Set status bar style
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0a0a0a' }).catch(() => {});

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App came to foreground
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      }
    });

    // Handle back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    // Handle keyboard events
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });

    return () => {
      App.removeAllListeners().catch(() => {});
      Keyboard.removeAllListeners().catch(() => {});
    };
  }, [native]);

  // Haptic feedback
  const haptic = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!native) return;
    
    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      }[style];
      
      await Haptics.impact({ style: impactStyle });
    } catch {
      // Fallback to vibration API
      if (navigator.vibrate) {
        navigator.vibrate(style === 'heavy' ? 50 : style === 'medium' ? 30 : 10);
      }
    }
  }, [native]);

  // Share content
  const share = useCallback(async (options: {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }) => {
    if (native) {
      try {
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.title || 'Teilen',
        });
        return true;
      } catch {
        // Fall through to Web Share API
      }
    }

    // Web Share API fallback
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
          files: options.files,
        });
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }, [native]);

  // Save file to device
  const saveFile = useCallback(async (options: {
    path: string;
    data: string | Blob;
    encoding?: 'utf8' | 'base64';
  }) => {
    if (native) {
      try {
        if (typeof options.data === 'string') {
          await Filesystem.writeFile({
            path: options.path,
            data: options.data,
            directory: Directory.Documents,
            encoding: options.encoding === 'base64' ? undefined : Encoding.UTF8,
          });
        } else {
          // Convert Blob to base64
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(options.data as Blob);
          });
          
          await Filesystem.writeFile({
            path: options.path,
            data: base64.split(',')[1],
            directory: Directory.Documents,
          });
        }
        return true;
      } catch (error) {
        console.error('Save file error:', error);
        return false;
      }
    }

    // Web fallback - download file
    try {
      const url = typeof options.data === 'string' 
        ? URL.createObjectURL(new Blob([options.data]))
        : URL.createObjectURL(options.data);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = options.path.split('/').pop() || 'file';
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    }
  }, [native]);

  // Read file from device
  const readFile = useCallback(async (options: {
    path: string;
    encoding?: 'utf8' | 'base64';
  }) => {
    if (native) {
      try {
        const result = await Filesystem.readFile({
          path: options.path,
          directory: Directory.Documents,
          encoding: options.encoding === 'base64' ? undefined : Encoding.UTF8,
        });
        return result.data;
      } catch {
        return null;
      }
    }
    return null;
  }, [native]);

  // Delete file from device
  const deleteFile = useCallback(async (path: string) => {
    if (native) {
      try {
        await Filesystem.deleteFile({
          path,
          directory: Directory.Documents,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [native]);

  // List files in directory
  const listFiles = useCallback(async (path: string) => {
    if (native) {
      try {
        const result = await Filesystem.readdir({
          path,
          directory: Directory.Documents,
        });
        return result.files;
      } catch {
        return [];
      }
    }
    return [];
  }, [native]);

  return {
    native,
    haptic,
    share,
    saveFile,
    readFile,
    deleteFile,
    listFiles,
    isNative,
  };
}
