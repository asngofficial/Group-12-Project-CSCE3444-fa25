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
  hidden?: boolean;
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
    id: 'classic-light',
    name: 'Classic Light',
    description: 'Internal use - high contrast for light mode',
    preview: '⬜',
    cellBorder: 'border-black',
    selectedCellBorder: 'border-blue-500',
    thickBorder: 'border-black',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    hidden: true
  },
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    description: 'Internal use - high contrast for dark mode',
    preview: '⬜',
    cellBorder: 'border-white',
    selectedCellBorder: 'border-blue-500',
    thickBorder: 'border-white',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    hidden: true
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
  },
  {
    id: 'ruby',
    name: 'Ruby Red',
    description: 'Passionate red shades',
    preview: '❤️',
    cellBorder: 'border-red-500',
    selectedCellBorder: 'border-red-600',
    thickBorder: 'border-red-500',
    glowColor: 'rgba(220, 38, 38, 0.25)'
  },
  {
    id: 'graphite',
    name: 'Graphite Gray',
    description: 'Sleek and modern gray',
    preview: '🌑',
    cellBorder: 'border-gray-500',
    selectedCellBorder: 'border-gray-600',
    thickBorder: 'border-gray-500',
    glowColor: 'rgba(107, 114, 128, 0.25)'
  },
  {
    id: 'lavender',
    name: 'Lavender Bliss',
    description: 'Soothing lavender tones',
    preview: '💜',
    cellBorder: 'border-violet-400',
    selectedCellBorder: 'border-violet-500',
    thickBorder: 'border-violet-400',
    glowColor: 'rgba(139, 92, 246, 0.25)'
  },
  {
    id: 'mint',
    name: 'Minty Fresh',
    description: 'Cool and refreshing mint',
    preview: '🍃',
    cellBorder: 'border-emerald-300',
    selectedCellBorder: 'border-emerald-400',
    thickBorder: 'border-emerald-300',
    glowColor: 'rgba(110, 231, 183, 0.25)'
  },
  {
    id: 'mocha',
    name: 'Mocha Brown',
    description: 'Rich and warm brown',
    preview: '☕',
    cellBorder: 'border-amber-800',
    selectedCellBorder: 'border-amber-900',
    thickBorder: 'border-amber-800',
    glowColor: 'rgba(146, 64, 14, 0.25)'
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    description: 'Bright and clear sky',
    preview: '☁️',
    cellBorder: 'border-sky-400',
    selectedCellBorder: 'border-sky-500',
    thickBorder: 'border-sky-400',
    glowColor: 'rgba(56, 189, 248, 0.25)'
  },
  {
    id: 'crimson',
    name: 'Crimson Night',
    description: 'Deep and mysterious red',
    preview: '🌹',
    cellBorder: 'border-rose-700',
    selectedCellBorder: 'border-rose-800',
    thickBorder: 'border-rose-700',
    glowColor: 'rgba(190, 18, 60, 0.25)'
  },
  {
    id: 'emerald',
    name: 'Emerald Isle',
    description: 'Lush and vibrant green',
    preview: '🍀',
    cellBorder: 'border-emerald-500',
    selectedCellBorder: 'border-emerald-600',
    thickBorder: 'border-emerald-500',
    glowColor: 'rgba(16, 185, 129, 0.25)'
  },
  {
    id: 'indigo',
    name: 'Indigo Dream',
    description: 'Deep and dreamy indigo',
    preview: '🌌',
    cellBorder: 'border-indigo-500',
    selectedCellBorder: 'border-indigo-600',
    thickBorder: 'border-indigo-500',
    glowColor: 'rgba(99, 102, 241, 0.25)'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk City',
    description: 'Futuristic and edgy',
    preview: '🌃',
    cellBorder: 'border-fuchsia-500',
    selectedCellBorder: 'border-fuchsia-600',
    thickBorder: 'border-fuchsia-500',
    glowColor: 'rgba(217, 70, 239, 0.25)'
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
            {boardStyles.filter(style => !style.hidden).map((style) => (
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
