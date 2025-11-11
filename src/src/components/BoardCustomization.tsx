import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

export type BoardStyle = {
  id: string;
  name: string;
  description: string;
  preview: string;
  cellBorder: string;
  selectedCellBorder: string;
  thickBorder: string;
  glowColor: string;
};

export const boardStyles: BoardStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional style',
    preview: '⬜',
    cellBorder: 'border-border',
    selectedCellBorder: 'border-blue-500',
    thickBorder: 'border-border',
    glowColor: 'rgba(59, 130, 246, 0.15)'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calm blue tones',
    preview: '🌊',
    cellBorder: 'border-blue-500',
    selectedCellBorder: 'border-blue-600',
    thickBorder: 'border-blue-500',
    glowColor: 'rgba(37, 99, 235, 0.25)'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green vibes',
    preview: '🌲',
    cellBorder: 'border-green-500',
    selectedCellBorder: 'border-green-600',
    thickBorder: 'border-green-500',
    glowColor: 'rgba(22, 163, 74, 0.25)'
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm orange hues',
    preview: '🌅',
    cellBorder: 'border-orange-500',
    selectedCellBorder: 'border-orange-600',
    thickBorder: 'border-orange-500',
    glowColor: 'rgba(234, 88, 12, 0.25)'
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Elegant purple theme',
    preview: '👑',
    cellBorder: 'border-purple-500',
    selectedCellBorder: 'border-purple-600',
    thickBorder: 'border-purple-500',
    glowColor: 'rgba(147, 51, 234, 0.25)'
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    description: 'Soft pink aesthetic',
    preview: '🌸',
    cellBorder: 'border-pink-500',
    selectedCellBorder: 'border-pink-600',
    thickBorder: 'border-pink-500',
    glowColor: 'rgba(236, 72, 153, 0.25)'
  },
  {
    id: 'gold',
    name: 'Golden Glow',
    description: 'Luxurious gold accents',
    preview: '✨',
    cellBorder: 'border-yellow-500',
    selectedCellBorder: 'border-yellow-600',
    thickBorder: 'border-yellow-500',
    glowColor: 'rgba(234, 179, 8, 0.3)'
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Vibrant neon colors',
    preview: '⚡',
    cellBorder: 'border-cyan-500',
    selectedCellBorder: 'border-cyan-600',
    thickBorder: 'border-cyan-500',
    glowColor: 'rgba(6, 182, 212, 0.3)'
  }
];

type BoardCustomizationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle: string;
  onStyleChange: (styleId: string) => void;
};

export function BoardCustomization({ open, onOpenChange, currentStyle, onStyleChange }: BoardCustomizationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Customize Your Board</DialogTitle>
          <DialogDescription>
            Choose a style that matches your vibe
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 gap-3">
            {boardStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => onStyleChange(style.id)}
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${currentStyle === style.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                {currentStyle === style.id && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                
                <div className="text-3xl mb-2">{style.preview}</div>
                <div className="text-sm mb-1">{style.name}</div>
                <div className="text-xs text-muted-foreground">{style.description}</div>
                
                {/* Mini preview grid */}
                <div 
                  className="mt-2 p-1 rounded bg-background/50"
                  style={{
                    boxShadow: `0 0 20px ${style.glowColor}, 0 0 40px ${style.glowColor}`
                  }}
                >
                  <div className="grid grid-cols-3 gap-0">
                    {Array(9).fill(null).map((_, i) => {
                      const col = i % 3;
                      const row = Math.floor(i / 3);
                      const isTopEdge = row === 0;
                      const isBottomEdge = row === 2;
                      const isLeftEdge = col === 0;
                      const isRightEdge = col === 2;
                      
                      return (
                        <div
                          key={i}
                          className={`bg-card border aspect-square ${style.cellBorder}
                            ${isTopEdge ? `border-t-2 ${style.thickBorder}` : ''}
                            ${isBottomEdge ? `border-b-2 ${style.thickBorder}` : ''}
                            ${isLeftEdge ? `border-l-2 ${style.thickBorder}` : ''}
                            ${isRightEdge ? `border-r-2 ${style.thickBorder}` : ''}
                          `}
                        />
                      );
                    })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
