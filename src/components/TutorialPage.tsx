import { Button } from "./ui/button";

export function TutorialPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">How to Play Sudoku</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">The Rules</h2>
          <p>The goal of Sudoku is to fill a 9x9 grid with numbers so that each row, column, and 3x3 section contain all of the digits from 1 to 9.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">XP System</h2>
          <p>You earn Experience Points (XP) for each puzzle you solve. The amount of XP you earn is based on the following:</p>
          <ul className="list-disc list-inside">
            <li><strong>Difficulty:</strong> Harder puzzles earn you more XP.</li>
            <li><strong>Time:</strong> The faster you solve the puzzle, the more XP you earn.</li>
            <li><strong>Hints:</strong> Using hints will reduce the amount of XP you earn.</li>
          </ul>
        </div>
      </div>

      <div className="mt-auto">
        <Button onClick={() => onNavigate('play')}>Back to Play</Button>
      </div>
    </div>
  );
}
