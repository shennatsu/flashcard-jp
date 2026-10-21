export function shouldPersistFolderPositions(
  storageReady: boolean,
  measuredCount: number,
  expectedCount: number,
): boolean {
  return storageReady && measuredCount === expectedCount;
}
