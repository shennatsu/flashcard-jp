"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

import { DraggableFolder } from "./DraggableFolder";
import {
  folderDefinitions,
  initialFolderPositions,
  type FolderId,
  type FolderPositionMap,
} from "./folders/folderData";
import {
  normalizedToPosition,
  positionToNormalized,
  type Point,
  type PositionBounds,
} from "./folders/folderGeometry";
import { readFolderPositions, writeFolderPositions } from "./folders/folderStorage";
import { shouldPersistFolderPositions } from "./folders/folderStoragePolicy";
import styles from "./folders/FolderField.module.css";

export type FolderFieldProps = {
  className?: string;
  style?: CSSProperties;
  resetLabel?: string;
};

type FolderMeasurements = {
  basePosition: Point;
  bounds: PositionBounds;
};

type Measurements = Partial<Record<FolderId, FolderMeasurements>>;

const defaultReducedMotion = false;

export function FolderField({ className, style, resetLabel = "Tidy up" }: FolderFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const folderRefs = useRef<Partial<Record<FolderId, HTMLDivElement | null>>>({});
  const [positions, setPositions] = useState<FolderPositionMap>(initialFolderPositions);
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [reducedMotion, setReducedMotion] = useState(defaultReducedMotion);
  const [topFolderId, setTopFolderId] = useState<FolderId>("folder-07");
  const [resetSignal, setResetSignal] = useState(0);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const savedPositions = readFolderPositions();
    const loadTimer = window.setTimeout(() => {
      setPositions((currentPositions) => savedPositions ?? currentPositions);
      setStorageReady(true);
    }, 0);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);
    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => {
      if (loadTimer !== null) {
        window.clearTimeout(loadTimer);
      }
      mediaQuery.removeEventListener("change", updateReducedMotion);
    };
  }, []);

  const measureFolders = useCallback(() => {
    const fieldElement = fieldRef.current;
    if (fieldElement === null) {
      return;
    }

    const nextMeasurements: Measurements = {};
    for (const definition of folderDefinitions) {
      const folderElement = folderRefs.current[definition.id];
      if (folderElement === null || folderElement === undefined) {
        continue;
      }

      const bounds = {
        maxX: Math.max(0, fieldElement.clientWidth - folderElement.offsetWidth),
        maxY: Math.max(0, fieldElement.clientHeight - folderElement.offsetHeight),
      };
      nextMeasurements[definition.id] = {
        basePosition: normalizedToPosition(positions[definition.id], bounds),
        bounds,
      };
    }

    setMeasurements(nextMeasurements);
  }, [positions]);

  useEffect(() => {
    measureFolders();
    const fieldElement = fieldRef.current;
    if (fieldElement === null || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureFolders);
      return () => window.removeEventListener("resize", measureFolders);
    }

    const observer = new ResizeObserver(measureFolders);
    observer.observe(fieldElement);
    return () => observer.disconnect();
  }, [measureFolders]);

  useEffect(() => {
    if (
      !shouldPersistFolderPositions(
        storageReady,
        Object.keys(measurements).length,
        folderDefinitions.length,
      )
    ) {
      return;
    }

    writeFolderPositions(positions);
  }, [measurements, positions, storageReady]);

  const registerElement = useCallback((id: FolderId, element: HTMLDivElement | null) => {
    folderRefs.current[id] = element;
  }, []);

  const handleGrab = useCallback((id: FolderId) => {
    setTopFolderId(id);
  }, []);

  const handlePositionCommit = useCallback(
    (id: FolderId, absolutePosition: Point) => {
      const measurement = measurements[id];
      if (measurement === undefined) {
        return;
      }

      const nextPosition = positionToNormalized(absolutePosition, measurement.bounds);
      setPositions((currentPositions) => ({
        ...currentPositions,
        [id]: nextPosition,
      }));
    },
    [measurements],
  );

  const handleReset = useCallback(() => {
    setPositions(initialFolderPositions);
    setTopFolderId("folder-07");
    setResetSignal((signal) => signal + 1);
  }, []);

  const fieldClassName = useMemo(
    () => [styles.field, styles.absoluteField, className].filter(Boolean).join(" "),
    [className],
  );

  return (
    <div
      ref={fieldRef}
      className={fieldClassName}
      style={style}
      role="group"
      aria-label="Decorative folders"
    >
      <button type="button" className={styles.resetButton} onClick={handleReset}>
        {resetLabel}
      </button>
      {folderDefinitions.map((definition, index) => {
        const measurement = measurements[definition.id];
        return (
          <DraggableFolder
            key={definition.id}
            definition={definition}
            position={positions[definition.id]}
            basePosition={measurement?.basePosition ?? null}
            bounds={measurement?.bounds ?? null}
            fieldRef={fieldRef as RefObject<HTMLDivElement | null>}
            registerElement={registerElement}
            onGrab={handleGrab}
            onPositionCommit={handlePositionCommit}
            reducedMotion={reducedMotion}
            resetSignal={resetSignal}
            zIndex={definition.id === topFolderId ? folderDefinitions.length + 1 : index + 1}
          />
        );
      })}
    </div>
  );
}
