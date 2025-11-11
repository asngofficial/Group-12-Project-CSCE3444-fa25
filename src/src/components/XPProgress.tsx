import { useEffect, useState } from "react";
import { motion } from "motion/react";

type XPProgressProps = {
  currentXP: number;
  currentLevel: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
};

// Linear progression: each level requires 1000 XP
const XP_PER_LEVEL = 1000;

export function XPProgress({ 
  currentXP, 
  currentLevel, 
  showLabel = true, 
  size = "md",
  animate = false 
}: XPProgressProps) {
  const [displayXP, setDisplayXP] = useState(currentXP);

  // Calculate XP progress for current level
  const xpForCurrentLevel = (currentLevel - 1) * XP_PER_LEVEL;
  const xpForNextLevel = currentLevel * XP_PER_LEVEL;
  const currentLevelXP = currentXP - xpForCurrentLevel;
  const progressPercent = (currentLevelXP / XP_PER_LEVEL) * 100;

  // Animate XP changes
  useEffect(() => {
    if (animate && currentXP !== displayXP) {
      // Animate from displayXP to currentXP
      const duration = 1000; // 1 second
      const startTime = Date.now();
      const startXP = displayXP;
      const deltaXP = currentXP - startXP;

      const animateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        const newXP = Math.floor(startXP + deltaXP * eased);
        
        setDisplayXP(newXP);

        if (progress < 1) {
          requestAnimationFrame(animateValue);
        }
      };

      requestAnimationFrame(animateValue);
    } else {
      setDisplayXP(currentXP);
    }
  }, [currentXP, animate]);

  const displayCurrentLevelXP = displayXP - xpForCurrentLevel;
  const displayProgressPercent = Math.min(
    (displayCurrentLevelXP / XP_PER_LEVEL) * 100,
    100
  );

  // Size configurations
  const sizeClasses = {
    sm: {
      height: "h-2.5",
      text: "text-xs",
      gap: "gap-1"
    },
    md: {
      height: "h-4",
      text: "text-sm",
      gap: "gap-2"
    },
    lg: {
      height: "h-5",
      text: "text-base",
      gap: "gap-2"
    }
  };

  const config = sizeClasses[size];

  return (
    <div className={`w-full ${config.gap}`}>
      {showLabel && (
        <div className={`flex items-center justify-between ${config.text} text-muted-foreground`}>
          <span>Level {currentLevel}</span>
          <span>
            {Math.floor(displayCurrentLevelXP).toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP
          </span>
        </div>
      )}
      
      <div className={`w-full bg-muted rounded-full overflow-hidden ${config.height}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: animate ? 0 : `${displayProgressPercent}%` }}
          animate={{ width: `${displayProgressPercent}%` }}
          transition={{ 
            duration: animate ? 1 : 0.3,
            ease: "easeOut"
          }}
        />
      </div>

      {showLabel && (
        <div className={`text-right ${config.text} text-muted-foreground`}>
          <span className="text-xs">
            {Math.floor(XP_PER_LEVEL - displayCurrentLevelXP).toLocaleString()} XP to Level {currentLevel + 1}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// Helper function to award XP and calculate new level
export function awardXP(currentXP: number, xpToAdd: number): { newXP: number; newLevel: number; leveledUp: boolean } {
  const oldLevel = calculateLevel(currentXP);
  const newXP = currentXP + xpToAdd;
  const newLevel = calculateLevel(newXP);
  
  return {
    newXP,
    newLevel,
    leveledUp: newLevel > oldLevel
  };
}
