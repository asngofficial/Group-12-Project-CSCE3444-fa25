import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

export type BoardStyle = {
  id: string;
  name: string;
  description: string;
  preview: string;
  gridBg: string;
  cellBg: string;
  cellBorder: string;
  selectedCellBg: string;
  thickBorder: string;
};

export const boardStyles: BoardStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional black and white',
    preview: '⬜',
    gridBg: 'bg-foreground',
    cellBg: 'bg-background',
    cellBorder: 'border-border',
    selectedCellBg: 'bg-blue-100 border-blue-500',
    thickBorder: 'border-foreground'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calm blue tones',
    preview: '🌊',
    gridBg: 'bg-blue-900',
    cellBg: 'bg-blue-50',
    cellBorder: 'border-blue-200',
    selectedCellBg: 'bg-blue-200 border-blue-600',
    thickBorder: 'border-blue-900'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green vibes',
    preview: '🌲',
    gridBg: 'bg-green-900',
    cellBg: 'bg-green-50',
    cellBorder: 'border-green-200',
    selectedCellBg: 'bg-green-200 border-green-600',
    thickBorder: 'border-green-900'
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm orange hues',
    preview: '🌅',
    gridBg: 'bg-orange-900',
    cellBg: 'bg-orange-50',
    cellBorder: 'border-orange-200',
    selectedCellBg: 'bg-orange-200 border-orange-600',
    thickBorder: 'border-orange-900'
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Elegant purple theme',
    preview: '👑',
    gridBg: 'bg-purple-900',
    cellBg: 'bg-purple-50',
    cellBorder: 'border-purple-200',
    selectedCellBg: 'bg-purple-200 border-purple-600',
    thickBorder: 'border-purple-900'
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    description: 'Soft pink aesthetic',
    preview: '🌸',
    gridBg: 'bg-pink-900',
    cellBg: 'bg-pink-50',
    cellBorder: 'border-pink-200',
    selectedCellBg: 'bg-pink-200 border-pink-600',
    thickBorder: 'border-pink-900'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes',
    preview: '🌸',
    gridBg: 'bg-gray-800',
    cellBg: 'bg-gray-900',
    cellBorder: 'border-gray-700',
    selectedCellBg: 'bg-gray-700 border-gray-400',
    thickBorder: 'border-gray-600'
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Vibrant neon colors',
    preview: '⚡',
    gridBg: 'bg-cyan-600',
    cellBg: 'bg-gray-900',
    cellBorder: 'border-cyan-400',
    selectedCellBg: 'bg-cyan-900 border-cyan-300',
    thickBorder: 'border-cyan-400'
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
                <div className={`mt-2 ${style.gridBg} p-1 rounded`}>
                  <div className="grid grid-cols-3 gap-0">
                    {Array(9).fill(null).map((_, i) => (
                      <div
                        key={i}
                        className={`${style.cellBg} ${style.cellBorder} border aspect-square`}
                      />
                    ))}
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

