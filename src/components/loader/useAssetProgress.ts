"use client";

import { useEffect, useMemo, useState } from "react";

export const DEFAULT_LOADER_IMAGE_SOURCES = [
  "/paper/footer-grass@2x.webp",
  "/paper/footer-paper@2x.webp",
  "/folders/folder-01@2x.webp",
  "/folders/folder-02@2x.webp",
  "/folders/folder-03@2x.webp",
  "/folders/folder-04@2x.webp",
  "/folders/folder-05@2x.webp",
  "/folders/folder-06@2x.webp",
  "/folders/folder-07@2x.webp",
] as const;

export const DEFAULT_LOADER_FONT_FAMILIES = [
  "Josefin Sans",
  "Noto Sans JP",
  "Silkscreen",
] as const;

export type AssetProgressOptions = {
  readonly imageSources?: readonly string[];
  readonly fontFamilies?: readonly string[];
};

export type AssetProgress = {
  readonly failed: number;
  readonly loaded: number;
  readonly progress: number;
  readonly ready: boolean;
  readonly total: number;
};

type ProgressState = {
  readonly failed: number;
  readonly key: string;
  readonly loaded: number;
  readonly total: number;
};

function uniqueStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function isImageDecodeAvailable(
  image: HTMLImageElement,
): image is HTMLImageElement & { decode: () => Promise<void> } {
  return typeof image.decode === "function";
}

export const ASSET_TIMEOUT_MS = 3000;
const IMAGE_DECODE_FALLBACK_MS = 750;

function preloadImage(source: string, complete: (success: boolean) => void): () => void {
  const image = new window.Image();
  let settled = false;
  let assetTimeout: number | null = null;
  let decodeFallbackTimer: number | null = null;

  const clearTimers = () => {
    if (assetTimeout !== null) {
      window.clearTimeout(assetTimeout);
      assetTimeout = null;
    }
    if (decodeFallbackTimer !== null) {
      window.clearTimeout(decodeFallbackTimer);
      decodeFallbackTimer = null;
    }
  };

  const finish = (success: boolean) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimers();
    complete(success);
  };

  const handleLoad = () => {
    if (!isImageDecodeAvailable(image)) {
      finish(true);
      return;
    }

    // Some browsers keep decode() pending for an Image created only for
    // preloading even after load/naturalWidth are valid. Do not let that
    // optional readiness refinement block the whole page indefinitely.
    decodeFallbackTimer = window.setTimeout(
      () => finish(true),
      IMAGE_DECODE_FALLBACK_MS,
    );
    void image.decode().then(
      () => finish(true),
      () => finish(false),
    );
  };

  assetTimeout = window.setTimeout(() => finish(false), ASSET_TIMEOUT_MS);
  image.onload = handleLoad;
  image.onerror = () => finish(false);
  image.src = source;

  if (image.complete) {
    if (image.naturalWidth > 0) {
      handleLoad();
    } else {
      finish(false);
    }
  }

  return () => {
    image.onload = null;
    image.onerror = null;
    clearTimers();
  };
}

function loadFont(
  family: string,
  complete: (success: boolean) => void,
): () => void {
  let cancelled = false;
  let settled = false;
  let assetTimeout: number | null = null;
  const finish = (success: boolean) => {
    if (cancelled || settled) {
      return;
    }
    settled = true;
    if (assetTimeout !== null) {
      window.clearTimeout(assetTimeout);
      assetTimeout = null;
    }
    complete(success);
  };

  assetTimeout = window.setTimeout(() => finish(false), ASSET_TIMEOUT_MS);
  try {
    const fontLoad = document.fonts.load(`1em "${family.replaceAll('"', "")}"`);
    void Promise.all([document.fonts.ready, fontLoad]).then(
      () => finish(true),
      () => finish(false),
    );
  } catch {
    finish(false);
  }

  return () => {
    cancelled = true;
    if (assetTimeout !== null) {
      window.clearTimeout(assetTimeout);
      assetTimeout = null;
    }
  };
}

export function useAssetProgress(options: AssetProgressOptions = {}): AssetProgress {
  const imageSources = useMemo(
    () => uniqueStrings(options.imageSources ?? DEFAULT_LOADER_IMAGE_SOURCES),
    [options.imageSources],
  );
  const fontFamilies = useMemo(
    () => uniqueStrings(options.fontFamilies ?? DEFAULT_LOADER_FONT_FAMILIES),
    [options.fontFamilies],
  );
  const imageKey = imageSources.join("\u0000");
  const fontKey = fontFamilies.join("\u0000");
  const total = imageSources.length + fontFamilies.length;
  const progressKey = `${imageKey}\u0001${fontKey}`;
  const [state, setState] = useState<ProgressState>({
    failed: 0,
    key: progressKey,
    loaded: 0,
    total,
  });

  useEffect(() => {
    let active = true;
    let loaded = 0;
    let failed = 0;
    const cleanups: Array<() => void> = [];

    const complete = (success: boolean) => {
      if (!active) {
        return;
      }
      loaded += 1;
      if (!success) {
        failed += 1;
      }
      setState({ failed, key: progressKey, loaded, total });
    };

    if (total === 0) {
      return () => {
        active = false;
      };
    }

    for (const source of imageSources) {
      cleanups.push(preloadImage(source, complete));
    }

    for (const family of fontFamilies) {
      cleanups.push(loadFont(family, complete));
    }

    if (typeof document.fonts !== "undefined") {
      void document.fonts.ready.catch(() => undefined);
    }

    return () => {
      active = false;
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [fontKey, imageKey, imageSources, fontFamilies, progressKey, total]);

  const currentState = state.key === progressKey
    ? state
    : { failed: 0, key: progressKey, loaded: 0, total };
  const progress = total === 0 ? 1 : Math.min(1, currentState.loaded / total);
  return {
    failed: currentState.failed,
    loaded: currentState.loaded,
    progress,
    ready: total === 0 || currentState.loaded >= total,
    total,
  };
}
