// src/lib/achievements.ts

import { Trophy, Star, Zap, Users, Award, Clock, Moon, Wind, Target, Sunrise, Utensils, Calendar, BarChart4, Medal, ChevronsUp, HelpCircle, FilePenLine, Globe, BrainCircuit } from 'lucide-react';

export const ACHIEVEMENTS_DEFINITIONS = {
  SPEED_DEMON: {
    name: "Speed Demon",
    description: "Complete a puzzle in under 2 minutes.",
    icon: Zap,
  },
  PUZZLE_MASTER: {
    name: "Puzzle Master",
    description: "Solve 50 puzzles.",
    icon: Trophy,
  },
  ZERO_MISTAKES: {
    name: "Zero Mistakes",
    description: "Complete a puzzle with zero mistakes.",
    icon: Star,
  },
  STREAK_SOLVER: {
    name: "Streak Solver",
    description: "Complete 5 puzzles in a row.",
    icon: Wind,
  },
  MARATHON_MIND: {
    name: "Marathon Mind",
    description: "Play for over an hour in a single session.",
    icon: Clock,
  },
  SOCIAL_BUTTERFLY: {
    name: "Social Butterfly",
    description: "Add 5 friends.",
    icon: Users,
  },
  CHALLENGER: {
    name: "Challenger",
    description: "Win a challenge against a friend.",
    icon: Award,
  },
  NIGHT_OWL: {
    name: "Night Owl",
    description: "Solve a puzzle between 2 AM and 5 AM.",
    icon: Moon,
  },
  SPEED_CHALLENGER: {
    name: "Speed Challenger",
    description: "Win a multiplayer race.",
    icon: Zap,
  },
  PERFECTIONIST: {
    name: "Perfectionist",
    description: "Complete all achievements.",
    icon: Target,
  },
  EARLY_BIRD: {
    name: "Early Bird",
    description: "Solve a puzzle between 5 AM and 8 AM.",
    icon: Sunrise,
  },
  LUNCHTIME_LEARNER: {
    name: "Lunchtime Learner",
    description: "Solve a puzzle during lunchtime (12 PM - 1 PM).",
    icon: Utensils,
  },
  WEEKEND_WARRIOR: {
    name: "Weekend Warrior",
    description: "Solve 10 puzzles on a weekend.",
    icon: Calendar,
  },
  DIFFICULTY_DOMINATOR: {
    name: "Difficulty Dominator",
    description: "Complete a puzzle on each difficulty level.",
    icon: BarChart4,
  },
  FIRST_WIN: {
    name: "First Win",
    description: "Win your first game.",
    icon: Medal,
  },
  COMEBACK_KING: {
    name: "Comeback King",
    description: "Win a game after being behind.",
    icon: ChevronsUp,
  },
  HINT_HELPER: {
    name: "Hint Helper",
    description: "Use 50 hints.",
    icon: HelpCircle,
  },
  NOTE_TAKER: {
    name: "Note Taker",
    description: "Place 100 notes.",
    icon: FilePenLine,
  },
  GLOBAL_GURU: {
    name: "Global Guru",
    description: "Reach the top 10 on the leaderboard.",
    icon: Globe,
  },
  PUZZLE_PRO: {
    name: "Puzzle Pro",
    description: "Solve 100 puzzles.",
    icon: BrainCircuit,
  },
} as const;

export type AchievementName = keyof typeof ACHIEVEMENTS_DEFINITIONS;
