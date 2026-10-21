"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";

import { easeOutTransition, reducedMotionTransition } from "@/lib/motion";

export const TITLE_SCRAMBLE_TEXT = "にほん";
export const KANA_POOL =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん" +
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

const CYCLES_PER_CHARACTER = 3;
const DEFAULT_TICK_MS = 90;

export type TitleScrambleProps = {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly tickMs?: number;
};

function randomKana(previous: string): string {
  if (KANA_POOL.length < 2) {
    return KANA_POOL;
  }

  let next = previous;
  while (next === previous) {
    const index = Math.floor(Math.random() * KANA_POOL.length);
    next = KANA_POOL[index] ?? KANA_POOL[0] ?? "あ";
  }
  return next;
}

function scrambleFrame(resolvedCount: number, previous: string): string {
  return [...TITLE_SCRAMBLE_TEXT]
    .map((character, index) =>
      index < resolvedCount ? character : randomKana(previous[index] ?? character),
    )
    .join("");
}

export function TitleScramble({
  className,
  style,
  tickMs = DEFAULT_TICK_MS,
}: TitleScrambleProps) {
  const reducedMotion = useReducedMotion() === true;
  const [displayText, setDisplayText] = useState(TITLE_SCRAMBLE_TEXT);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let tick = 0;
    let previous = TITLE_SCRAMBLE_TEXT;
    const safeTickMs = Math.max(40, tickMs);
    let intervalTimer: number | undefined;

    const update = () => {
      const resolvedCount = Math.min(
        TITLE_SCRAMBLE_TEXT.length,
        Math.floor(tick / CYCLES_PER_CHARACTER),
      );
      const next = scrambleFrame(resolvedCount, previous);
      previous = next;
      setDisplayText(next);
      tick += 1;

      if (resolvedCount >= TITLE_SCRAMBLE_TEXT.length) {
        if (intervalTimer !== undefined) {
          window.clearInterval(intervalTimer);
        }
        setDisplayText(TITLE_SCRAMBLE_TEXT);
      }
    };

    const kickoffTimer = window.setTimeout(() => {
      update();
      intervalTimer = window.setInterval(update, safeTickMs);
    }, 0);

    return () => {
      window.clearTimeout(kickoffTimer);
      if (intervalTimer !== undefined) {
        window.clearInterval(intervalTimer);
      }
    };
  }, [reducedMotion, tickMs]);

  return (
    <motion.span
      aria-label={TITLE_SCRAMBLE_TEXT}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "inline-block",
        minWidth: "3em",
        ...style,
      }}
      transition={reducedMotion ? reducedMotionTransition : easeOutTransition}
    >
      <span aria-hidden="true" lang="ja">
        {reducedMotion ? TITLE_SCRAMBLE_TEXT : displayText}
      </span>
    </motion.span>
  );
}
