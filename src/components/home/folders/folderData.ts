import type { NormalizedPoint } from "./folderGeometry";

export type FolderId =
  | "folder-01"
  | "folder-02"
  | "folder-03"
  | "folder-04"
  | "folder-05"
  | "folder-06"
  | "folder-07";

export type FolderDefinition = {
  id: FolderId;
  src: `/folders/${FolderId}.webp`;
  width: number;
  height: number;
  initialPosition: NormalizedPoint;
  rotation: number;
  entranceDelay: number;
};

export const folderDefinitions: readonly FolderDefinition[] = [
  {
    id: "folder-01",
    src: "/folders/folder-01.webp",
    width: 552,
    height: 455,
    initialPosition: { x: 0.03, y: 0.07 },
    rotation: -7,
    entranceDelay: 0,
  },
  {
    id: "folder-02",
    src: "/folders/folder-02.webp",
    width: 533,
    height: 430,
    initialPosition: { x: 0.67, y: 0.02 },
    rotation: 6,
    entranceDelay: 0.04,
  },
  {
    id: "folder-03",
    src: "/folders/folder-03.webp",
    width: 519,
    height: 432,
    initialPosition: { x: 0.33, y: 0.16 },
    rotation: -3,
    entranceDelay: 0.08,
  },
  {
    id: "folder-04",
    src: "/folders/folder-04.webp",
    width: 396,
    height: 326,
    initialPosition: { x: 0.78, y: 0.41 },
    rotation: -9,
    entranceDelay: 0.12,
  },
  {
    id: "folder-05",
    src: "/folders/folder-05.webp",
    width: 362,
    height: 299,
    initialPosition: { x: 0.08, y: 0.5 },
    rotation: 7,
    entranceDelay: 0.16,
  },
  {
    id: "folder-06",
    src: "/folders/folder-06.webp",
    width: 424,
    height: 342,
    initialPosition: { x: 0.45, y: 0.56 },
    rotation: -5,
    entranceDelay: 0.2,
  },
  {
    id: "folder-07",
    src: "/folders/folder-07.webp",
    width: 328,
    height: 236,
    initialPosition: { x: 0.69, y: 0.75 },
    rotation: 5,
    entranceDelay: 0.24,
  },
];

export type FolderPositionMap = Record<FolderId, NormalizedPoint>;

export const initialFolderPositions: FolderPositionMap = Object.fromEntries(
  folderDefinitions.map((folder) => [folder.id, folder.initialPosition]),
) as FolderPositionMap;

export const folderIds = folderDefinitions.map((folder) => folder.id);

export const folderStorageKey = "flashcard-jp:home-folder-positions:v1";
