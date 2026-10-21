"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  loaderExitVariants,
  motionDurations,
  reducedMotionTransition,
  reducedMotionVariants,
} from "@/lib/motion";

import {
  ASSET_TIMEOUT_MS,
  useAssetProgress,
  type AssetProgressOptions,
} from "./useAssetProgress";

const DEFAULT_MIN_DISPLAY_MS = 800;
const MANIFEST_URL = "/ascii/manifest.json";
const FALLBACK_FRAME = [
  "",
  "                  .  .  .",
  "             .  .  loading  .  .",
  "                  .  .  .",
  "",
].join("\n");

export type AsciiLoaderProps = AssetProgressOptions & {
  readonly className?: string;
  readonly minDisplayMs?: number;
  readonly onComplete?: () => void;
};

type AsciiFrame = {
  readonly progress: number;
  readonly text: string;
};

type AsciiManifest = {
  readonly columns: number;
  readonly frames: readonly {
    readonly file: string;
    readonly progress: number;
  }[];
  readonly rows: number;
  readonly version: 1;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isManifest(value: unknown): value is AsciiManifest {
  if (!isRecord(value) || value.version !== 1) {
    return false;
  }

  if (
    typeof value.columns !== "number" ||
    typeof value.rows !== "number" ||
    !Array.isArray(value.frames) ||
    value.frames.length === 0
  ) {
    return false;
  }

  return value.frames.every(
    (frame: unknown): frame is { file: string; progress: number } =>
      isRecord(frame) &&
      typeof frame.file === "string" &&
      typeof frame.progress === "number" &&
      Number.isFinite(frame.progress),
  );
}

function frameForProgress(frames: readonly AsciiFrame[], progress: number): AsciiFrame {
  return frames.reduce((closest, frame) => {
    const closestDistance = Math.abs(closest.progress - progress);
    const frameDistance = Math.abs(frame.progress - progress);
    return frameDistance < closestDistance ? frame : closest;
  }, frames[0] ?? { progress: 0, text: FALLBACK_FRAME });
}

async function fetchFrames(signal: AbortSignal): Promise<AsciiFrame[]> {
  const manifestResponse = await fetch(MANIFEST_URL, { signal });
  if (!manifestResponse.ok) {
    throw new Error(`Unable to load ASCII manifest (${manifestResponse.status}).`);
  }

  const manifestValue: unknown = await manifestResponse.json();
  if (!isManifest(manifestValue)) {
    throw new Error("The ASCII manifest has an unsupported shape.");
  }

  const frames = await Promise.all(
    manifestValue.frames.map(async (entry) => {
      const response = await fetch(entry.file, { signal });
      if (!response.ok) {
        throw new Error(`Unable to load ASCII frame (${response.status}).`);
      }
      return {
        progress: Math.min(1, Math.max(0, entry.progress)),
        text: await response.text(),
      } satisfies AsciiFrame;
    }),
  );

  return frames.length > 0 ? frames : [{ progress: 0, text: FALLBACK_FRAME }];
}

function loaderStyle(): CSSProperties {
  return {
    alignItems: "center",
    backgroundColor: "var(--fc-canvas, #eae9e5)",
    color: "var(--fc-ink, #000000)",
    display: "flex",
    inset: 0,
    isolation: "isolate",
    justifyContent: "center",
    overflow: "hidden",
    position: "fixed",
    zIndex: 100,
  };
}

const frameStyle: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "clamp(4px, 1.35vw, 14px)",
  lineHeight: 1.1,
  margin: 0,
  maxWidth: "100vw",
  minHeight: "35.2em",
  overflow: "hidden",
  textAlign: "left",
  whiteSpace: "pre",
};

const statusStyle: CSSProperties = {
  bottom: "clamp(1.25rem, 4vw, 3rem)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "0.75rem",
  left: "50%",
  letterSpacing: "0.08em",
  position: "absolute",
  textTransform: "uppercase",
  transform: "translateX(-50%)",
};

export function AsciiLoader({
  className,
  minDisplayMs = DEFAULT_MIN_DISPLAY_MS,
  onComplete,
  ...progressOptions
}: AsciiLoaderProps) {
  const assetProgress = useAssetProgress(progressOptions);
  const reducedMotion = useReducedMotion() === true;
  const [frames, setFrames] = useState<readonly AsciiFrame[]>([
    { progress: 0, text: FALLBACK_FRAME },
  ]);
  const [framesReady, setFramesReady] = useState(false);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const completedRef = useRef(false);
  const frame = useMemo(
    () => frameForProgress(frames, assetProgress.progress),
    [assetProgress.progress, frames],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const frameTimeout = window.setTimeout(() => controller.abort(), ASSET_TIMEOUT_MS);

    void fetchFrames(controller.signal)
      .then((loadedFrames) => {
        if (active) {
          setFrames(loadedFrames);
        }
      })
      .catch(() => {
        // The static fallback keeps the loader usable if an optional frame is missing.
      })
      .finally(() => {
        window.clearTimeout(frameTimeout);
        if (active) {
          setFramesReady(true);
        }
      });

    return () => {
      active = false;
      window.clearTimeout(frameTimeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const duration = Math.max(DEFAULT_MIN_DISPLAY_MS, minDisplayMs);
    const timer = window.setTimeout(() => setMinimumElapsed(true), duration);
    return () => window.clearTimeout(timer);
  }, [minDisplayMs]);

  const readyToExit = assetProgress.ready && framesReady && minimumElapsed;

  useEffect(() => {
    if (!readyToExit) {
      return;
    }

    const exitDuration = reducedMotion
      ? Number(reducedMotionTransition.duration ?? 0)
      : motionDurations.loaderExit;
    const dismissTimer = window.setTimeout(() => {
      if (completedRef.current) {
        return;
      }
      completedRef.current = true;
      setDismissed(true);
      onComplete?.();
    }, Math.max(0, exitDuration * 1000) + 50);

    return () => window.clearTimeout(dismissTimer);
  }, [onComplete, readyToExit, reducedMotion]);

  if (dismissed) {
    return null;
  }

  const variants: Variants = reducedMotion ? reducedMotionVariants : loaderExitVariants;
  const percentage = Math.round(assetProgress.progress * 100);
  const status = assetProgress.ready
    ? "Ready"
    : `Loading ${percentage}%`;

  return (
    <motion.div
      aria-busy={!assetProgress.ready}
      aria-label={status}
      aria-live="polite"
      className={className}
      initial="visible"
      role="status"
      style={loaderStyle()}
      animate={readyToExit ? "hidden" : "visible"}
      variants={variants}
    >
      <pre aria-hidden="true" style={frameStyle}>
        {frame.text}
      </pre>
      <span aria-hidden="true" style={statusStyle}>
        {status}
      </span>
    </motion.div>
  );
}

export { DEFAULT_MIN_DISPLAY_MS as MIN_LOADER_DISPLAY_MS };
export { useAssetProgress } from "./useAssetProgress";
export type {
  AssetProgress,
  AssetProgressOptions,
} from "./useAssetProgress";
