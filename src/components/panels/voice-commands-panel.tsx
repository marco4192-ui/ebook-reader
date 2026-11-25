'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Volume2,
  VolumeX,
  Check,
  AlertCircle,
  Play,
  Pause,
  Mic,
  MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const VoiceCommandsPanel = ({ open, onOpenChange, onCommand }: { open: boolean; onOpenChange: (open: boolean) => void; onCommand?: (command: string) => void }) => {
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
