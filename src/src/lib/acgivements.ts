// achievements.ts

export const ACHIEVEMENTS = {
    SPEED_DEMON: "Speed Demon",
    PUZZLE_MASTER: "Puzzle Master",
    ZERO_MISTAKES: "Zero Mistakes",
    STREAK_SOLVER: "Streak Solver",
    MARATHON_MIND: "Marathon Mind",
    SOCIAL_BUTTERFLY: "Social Butterfly",
    CHALLENGER: "Challenger",
    CREATOR: "Creator",
    PUZZLE_POPULAR: "Puzzle Popular",
    NIGHT_OWL: "Night Owl",
    SPEED_CHALLENGER: "Speed Challenger",
    PERFECTIONIST: "Perfectionist",
  } as const;
  
  export type Achievement = typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS];