// src/lib/achievements.ts

import { Trophy, Star, Zap, Users, Award, Clock, Moon, Wind, Target } from 'lucide-react';

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
} as const;

export type AchievementName = keyof typeof ACHIEVEMENTS_DEFINITIONS;
