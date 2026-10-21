import assert from "node:assert/strict";
import test from "node:test";

import {
  filterColumnsByGroup,
  getColumnStorageKey,
  getInitialActiveGroups,
  getInitialActiveGroupsFromValue,
  getStorageSafely,
  getStoredValueSafely,
  groupEntriesIntoColumns,
  persistActiveGroups,
  serializeActiveGroups,
  toggleGroup,
  type GroupedColumn,
} from "./columnView.ts";

type Entry = {
  readonly id: string;
  readonly group: string;
};

const entries: readonly Entry[] = [
  { id: "a-1", group: "a" },
  { id: "ka-1", group: "ka" },
  { id: "a-2", group: "a" },
  { id: "sa-1", group: "sa" },
];

const groups = ["a", "ka", "sa"] as const;

function makeStorage(value: string | null): Storage {
  let storedValue = value;
  return {
    getItem: () => storedValue,
    setItem: (_key, nextValue) => {
      storedValue = nextValue;
    },
    removeItem: () => {
      storedValue = null;
    },
    clear: () => {
      storedValue = null;
    },
    key: () => null,
    length: storedValue === null ? 0 : 1,
  };
}

test("groups entries into first-seen columns without changing entry order", () => {
  const columns = groupEntriesIntoColumns(entries);

  assert.deepEqual(columns, [
    { group: "a", entries: [entries[0], entries[2]] },
    { group: "ka", entries: [entries[1]] },
    { group: "sa", entries: [entries[3]] },
  ] satisfies readonly GroupedColumn<Entry>[]);
});

test("filters columns by selected groups while retaining their original order", () => {
  const columns = groupEntriesIntoColumns(entries);

  assert.deepEqual(filterColumnsByGroup(columns, new Set(["sa", "a"])), [
    { group: "a", entries: [entries[0], entries[2]] },
    { group: "sa", entries: [entries[3]] },
  ]);
});

test("uses a script-and-set-specific storage key", () => {
  assert.equal(getColumnStorageKey("hiragana", "basic"), "flashcard-jp:characters:hiragana:basic:groups");
  assert.notEqual(
    getColumnStorageKey("hiragana", "basic"),
    getColumnStorageKey("katakana", "basic"),
  );
});

test("returns null when storage access is denied instead of throwing", () => {
  const storage = makeStorage(null);

  assert.equal(getStorageSafely(() => storage), storage);
  assert.equal(
    getStorageSafely(() => {
      throw new Error("storage denied");
    }),
    null,
  );
});

test("returns null when reading storage is denied instead of throwing", () => {
  assert.equal(
    getStoredValueSafely(
      () => ({
        getItem: () => {
          throw new Error("read denied");
        },
      }),
      "key",
    ),
    null,
  );
});

test("keeps persistence best-effort when writing storage is denied", () => {
  assert.doesNotThrow(() =>
    persistActiveGroups(
      {
        setItem: () => {
          throw new Error("write denied");
        },
      },
      "hiragana",
      "basic",
      groups,
      new Set(groups),
    ),
  );
});

test("defaults every known group to active when storage is empty or invalid", () => {
  assert.deepEqual(getInitialActiveGroups(null, "hiragana", "basic", groups), groups);
  assert.deepEqual(
    getInitialActiveGroups(makeStorage("not-json"), "hiragana", "basic", groups),
    groups,
  );
  assert.deepEqual(
    getInitialActiveGroups(makeStorage(JSON.stringify({ groups: ["a"] })), "hiragana", "basic", groups),
    groups,
  );
  assert.deepEqual(getInitialActiveGroupsFromValue(null, groups), groups);
  assert.deepEqual(getInitialActiveGroupsFromValue("not-json", groups), groups);
});

test("restores known groups and preserves an intentionally empty selection", () => {
  assert.deepEqual(
    getInitialActiveGroups(
      makeStorage(JSON.stringify(["sa", "unknown", "a"])),
      "hiragana",
      "basic",
      groups,
    ),
    ["a", "sa"],
  );
  assert.deepEqual(
    getInitialActiveGroupsFromValue(JSON.stringify([]), groups),
    [],
  );
});

test("serializes active groups in canonical group order and toggles one group", () => {
  assert.equal(serializeActiveGroups(groups, new Set(["sa", "a"])), '["a","sa"]');
  assert.deepEqual(toggleGroup(groups, new Set(groups), "ka"), ["a", "sa"]);
  assert.deepEqual(toggleGroup(groups, new Set(["a", "sa"]), "ka"), ["a", "ka", "sa"]);
});

test("persists only the known active groups under the script-and-set key", () => {
  let savedKey = "";
  let savedValue = "";
  const storage = {
    setItem: (key: string, value: string) => {
      savedKey = key;
      savedValue = value;
    },
  } as Pick<Storage, "setItem">;

  persistActiveGroups(storage, "katakana", "combination", groups, new Set(["sa", "a"]));

  assert.equal(savedKey, "flashcard-jp:characters:katakana:combination:groups");
  assert.equal(savedValue, '["a","sa"]');
});
