import { PageWrapper } from "./PageWrapper";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { HelpCircle } from "lucide-react";

type FAQPageProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function FAQPage({ onNavigate, currentPage }: FAQPageProps) {
  return (
    <PageWrapper onNavigate={onNavigate} currentPage={currentPage}>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl">How to Play Sudoku</h1>
            </div>

            {/* The Rules */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">The Rules</h2>
              <p className="text-muted-foreground leading-relaxed">
                The goal of Sudoku is to fill a 9×9 grid with numbers so that each row, column, and 3×3 section contain all of the digits from 1 to 9.
              </p>
            </Card>

            {/* XP System */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">XP System</h2>
              <p className="text-muted-foreground mb-4">
                You earn Experience Points (XP) for each puzzle you solve. The amount of XP you earn is based on the following:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <div>
                    <strong>Difficulty:</strong> Harder puzzles earn you more XP.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <div>
                    <strong>Time:</strong> The faster you solve the puzzle, the more XP you earn.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <div>
                    <strong>Hints:</strong> Using hints will reduce the amount of XP you earn.
                  </div>
                </li>
              </ul>
            </Card>

            {/* Back button */}
            <Button 
              className="w-full md:w-auto"
              onClick={() => onNavigate('explore')}
            >
              Back to Play
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
