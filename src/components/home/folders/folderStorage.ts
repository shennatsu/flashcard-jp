import {
  folderIds,
  folderStorageKey,
  type FolderPositionMap,
} from "./folderData";
import type { NormalizedPoint } from "./folderGeometry";

function isNormalizedPoint(value: unknown): value is NormalizedPoint {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const point = value as Record<string, unknown>;
  return (
    typeof point.x === "number" &&
    Number.isFinite(point.x) &&
    point.x >= 0 &&
    point.x <= 1 &&
    typeof point.y === "number" &&
    Number.isFinite(point.y) &&
    point.y >= 0 &&
    point.y <= 1
  );
}

export function parseFolderPositions(raw: string | null): FolderPositionMap | null {
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const values = parsed as Record<string, unknown>;
    const positions = {} as FolderPositionMap;
    for (const id of folderIds) {
      if (!isNormalizedPoint(values[id])) {
        return null;
      }

      const point = values[id] as NormalizedPoint;
      positions[id] = { x: point.x, y: point.y };
    }

    return positions;
  } catch {
    return null;
  }
}

export function readFolderPositions(): FolderPositionMap | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseFolderPositions(window.localStorage.getItem(folderStorageKey));
  } catch {
    return null;
  }
}

export function writeFolderPositions(positions: FolderPositionMap): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(folderStorageKey, JSON.stringify(positions));
  } catch {
    // Private browsing and storage quotas should not block decorative folders.
  }
}
