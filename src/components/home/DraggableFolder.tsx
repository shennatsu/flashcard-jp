"use client";

import Image from "next/image";
import {
  animate,
  motion,
  useAnimationControls,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

import { folderSpringTransition, pressTransition } from "@/lib/motion";

import type { FolderDefinition, FolderId } from "./folders/folderData";
import {
  DRAG_THRESHOLD_PX,
  normalizedToPosition,
  updatePositionFromOffset,
  type Point,
  type PositionBounds,
} from "./folders/folderGeometry";
import styles from "./folders/FolderField.module.css";

export type DraggableFolderProps = {
  definition: FolderDefinition;
  position: Point;
  basePosition: Point | null;
  bounds: PositionBounds | null;
  fieldRef: RefObject<HTMLDivElement | null>;
  registerElement: (id: FolderId, element: HTMLDivElement | null) => void;
  onGrab: (id: FolderId) => void;
  onPositionCommit: (id: FolderId, absolutePosition: Point) => void;
  reducedMotion: boolean;
  resetSignal: number;
  zIndex: number;
};

const clampTilt = (velocity: number) => Math.min(11, Math.max(-11, velocity * 3.5));

export function DraggableFolder({
  definition,
  position,
  basePosition,
  bounds,
  fieldRef,
  registerElement,
  onGrab,
  onPositionCommit,
  reducedMotion,
  resetSignal,
  zIndex,
}: DraggableFolderProps) {
  const dragControls = useDragControls();
  const tapControls = useAnimationControls();
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const rotation = useMotionValue(definition.rotation);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const pendingCommitRef = useRef(false);
  const fallbackCommitTimerRef = useRef<number | null>(null);

  const clearFallbackCommit = useCallback(() => {
    if (fallbackCommitTimerRef.current !== null) {
      window.clearTimeout(fallbackCommitTimerRef.current);
      fallbackCommitTimerRef.current = null;
    }
  }, []);

  const commitPosition = useCallback(() => {
    if (!pendingCommitRef.current) {
      return;
    }

    const fieldElement = fieldRef.current;
    const folderElement = elementRef.current;
    const liveBounds =
      bounds ??
      (fieldElement !== null && folderElement !== null
        ? {
            maxX: Math.max(0, fieldElement.clientWidth - folderElement.offsetWidth),
            maxY: Math.max(0, fieldElement.clientHeight - folderElement.offsetHeight),
          }
        : null);

    if (liveBounds === null) {
      return;
    }

    const liveBasePosition = basePosition ?? normalizedToPosition(position, liveBounds);
    const nextPosition = updatePositionFromOffset(
      liveBasePosition,
      { x: dragX.get(), y: dragY.get() },
      liveBounds,
    );

    pendingCommitRef.current = false;
    clearFallbackCommit();
    onPositionCommit(definition.id, nextPosition);
    dragX.set(0);
    dragY.set(0);
  }, [
    basePosition,
    bounds,
    clearFallbackCommit,
    definition.id,
    dragX,
    dragY,
    fieldRef,
    onPositionCommit,
    position,
  ]);

  useEffect(() => {
    if (resetSignal === 0) {
      return;
    }

    clearFallbackCommit();
    dragControls.cancel();
    tapControls.stop();
    isDraggingRef.current = false;
    didDragRef.current = false;
    pendingCommitRef.current = false;
    dragX.set(0);
    dragY.set(0);
    rotation.set(definition.rotation);
  }, [
    clearFallbackCommit,
    definition.rotation,
    dragControls,
    dragX,
    dragY,
    resetSignal,
    rotation,
    tapControls,
  ]);

  useEffect(() => {
    return () => clearFallbackCommit();
  }, [clearFallbackCommit]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    clearFallbackCommit();
    didDragRef.current = false;
    onGrab(definition.id);
    dragControls.start(event, { distanceThreshold: DRAG_THRESHOLD_PX });
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    didDragRef.current = true;
    pendingCommitRef.current = true;
    tapControls.stop();
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (reducedMotion) {
      return;
    }

    rotation.set(definition.rotation + clampTilt(info.velocity.x));
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    if (reducedMotion) {
      rotation.set(definition.rotation);
      commitPosition();
      return;
    }

    void animate(rotation, definition.rotation, folderSpringTransition);

    fallbackCommitTimerRef.current = window.setTimeout(commitPosition, 1600);
  };

  const handleTap = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    if (reducedMotion || isDraggingRef.current) {
      return;
    }

    void tapControls.start({
      y: [0, -7, 2, 0],
      rotate: [0, -2.5, 2, 0],
      transition: pressTransition,
    });
  };

  const handleElementRef = (element: HTMLDivElement | null) => {
    elementRef.current = element;
    registerElement(definition.id, element);
  };

  const left = basePosition === null ? `${position.x * 100}%` : `${basePosition.x}px`;
  const top = basePosition === null ? `${position.y * 100}%` : `${basePosition.y}px`;

  return (
    <motion.div
      ref={handleElementRef}
      className={`${styles.folder} ${reducedMotion ? styles.folderReduced : ""} ${basePosition === null ? styles.folderPending : ""}`}
      style={{
        left,
        top,
        x: dragX,
        y: dragY,
        rotate: rotation,
        zIndex,
        animationDelay: `${definition.entranceDelay}s`,
      }}
      tabIndex={-1}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={fieldRef}
      dragElastic={reducedMotion ? 0 : 0.08}
      dragMomentum={!reducedMotion}
      dragTransition={
        reducedMotion
          ? undefined
          : { power: 0.35, timeConstant: 280, bounceStiffness: 520, bounceDamping: 26 }
      }
      onPointerDown={handlePointerDown}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onDragTransitionEnd={commitPosition}
      onTap={handleTap}
      aria-hidden="true"
      data-folder-id={definition.id}
    >
      <motion.div className={styles.folderArt} animate={tapControls}>
        <Image
          className={styles.folderImage}
          src={definition.src}
          alt=""
          width={definition.width}
          height={definition.height}
          sizes="(max-width: 44rem) 30vw, 14rem"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}
