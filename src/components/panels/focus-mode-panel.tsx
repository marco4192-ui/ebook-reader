'use client';

import { Eye, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export const FocusModePanel = ({
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
