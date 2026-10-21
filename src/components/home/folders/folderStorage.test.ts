import assert from "node:assert/strict";
import test from "node:test";

import { shouldPersistFolderPositions } from "./folderStoragePolicy.ts";

test("does not persist folder positions before storage hydration", () => {
  assert.equal(shouldPersistFolderPositions(false, 7, 7), false);
});

test("persists folder positions only after every folder is measured", () => {
  assert.equal(shouldPersistFolderPositions(true, 6, 7), false);
  assert.equal(shouldPersistFolderPositions(true, 7, 7), true);
});
