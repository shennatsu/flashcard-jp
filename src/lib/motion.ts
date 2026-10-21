import type { Transition, Variants } from "motion/react";

export const motionDurations = {
  quick: 0.18,
  standard: 0.24,
  relaxed: 0.34,
  loaderExit: 0.32,
} as const;

export const easeOutTransition: Transition = {
  duration: motionDurations.standard,
  ease: [0.22, 1, 0.36, 1],
};

export const easeInOutTransition: Transition = {
  duration: motionDurations.relaxed,
  ease: [0.65, 0, 0.35, 1],
};

export const softSpringTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
  mass: 0.7,
};

export const folderSpringTransition: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 18,
  mass: 1,
};

export const pressTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.6,
};

export const reducedMotionTransition: Transition = {
  duration: 0.16,
  ease: "easeOut",
};

export const pageStaggerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...easeOutTransition,
      staggerChildren: 0.05,
    },
  },
};

export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: easeOutTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: {
      ...easeOutTransition,
      duration: motionDurations.quick,
    },
  },
};

export const cardSwapVariants: Variants = {
  initial: {
    opacity: 0,
    x: 18,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: easeOutTransition,
  },
  exit: {
    opacity: 0,
    x: -18,
    transition: {
      ...easeInOutTransition,
      duration: motionDurations.standard,
    },
  },
};

export const loaderExitVariants: Variants = {
  visible: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
    transition: {
      ...easeOutTransition,
      duration: motionDurations.loaderExit,
    },
  },
};

export const reducedMotionVariants: Variants = {
  visible: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
    transition: reducedMotionTransition,
  },
};

export const easeOut = easeOutTransition;
export const easeInOut = easeInOutTransition;
export const softSpring = softSpringTransition;
export const folderSpring = folderSpringTransition;
export const press = pressTransition;
export const reducedMotion = reducedMotionTransition;
export const pageStagger = pageStaggerVariants;
export const dropdown = dropdownVariants;
export const cardSwap = cardSwapVariants;
export const loaderExit = loaderExitVariants;

export const motionTransitions = {
  easeOut,
  easeInOut,
  softSpring,
  folderSpring,
  press,
  reduced: reducedMotion,
} as const;

export const motionVariants = {
  pageStagger,
  dropdown,
  cardSwap,
  loaderExit,
  reducedMotion: reducedMotionVariants,
} as const;

export const motionPresets = {
  durations: motionDurations,
  transitions: motionTransitions,
  variants: motionVariants,
} as const;
