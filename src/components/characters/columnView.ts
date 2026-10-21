export type GroupedColumn<Entry> = {
  readonly group: string;
  readonly entries: readonly Entry[];
};

type GroupedEntry = {
  readonly group: string;
};

export function groupEntriesIntoColumns<Entry extends GroupedEntry>(
  entries: readonly Entry[],
): readonly GroupedColumn<Entry>[] {
  const columns = new Map<string, Entry[]>();

  for (const entry of entries) {
    const column = columns.get(entry.group);
    if (column === undefined) {
      columns.set(entry.group, [entry]);
    } else {
      column.push(entry);
    }
  }

  return Array.from(columns, ([group, columnEntries]) => ({
    group,
    entries: columnEntries,
  }));
}

export function filterColumnsByGroup<Entry>(
  columns: readonly GroupedColumn<Entry>[],
  activeGroups: ReadonlySet<string>,
): readonly GroupedColumn<Entry>[] {
  return columns.filter((column) => activeGroups.has(column.group));
}

export function getColumnStorageKey(script: string, set: string): string {
  return `flashcard-jp:characters:${script}:${set}:groups`;
}

export function getStorageSafely(getStorage: () => Storage): Storage | null {
  try {
    return getStorage();
  } catch {
    return null;
  }
}

export function getStoredValueSafely(
  getStorage: () => Pick<Storage, "getItem"> | null,
  key: string,
): string | null {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function getInitialActiveGroupsFromValue(
  storedValue: string | null,
  groups: readonly string[],
): readonly string[] {
  if (storedValue === null) {
    return [...groups];
  }

  let stored: unknown;
  try {
    stored = JSON.parse(storedValue) as unknown;
  } catch {
    return [...groups];
  }

  if (!Array.isArray(stored) || !stored.every((group): group is string => typeof group === "string")) {
    return [...groups];
  }

  if (stored.length === 0) {
    return [];
  }

  const activeGroups = groups.filter((group) => stored.includes(group));
  return activeGroups.length > 0 ? activeGroups : [...groups];
}

export function getInitialActiveGroups(
  storage: Pick<Storage, "getItem"> | null,
  script: string,
  set: string,
  groups: readonly string[],
): readonly string[] {
  if (storage === null) {
    return [...groups];
  }

  try {
    return getInitialActiveGroupsFromValue(
      storage.getItem(getColumnStorageKey(script, set)),
      groups,
    );
  } catch {
    return [...groups];
  }
}

export function serializeActiveGroups(
  groups: readonly string[],
  activeGroups: ReadonlySet<string>,
): string {
  return JSON.stringify(groups.filter((group) => activeGroups.has(group)));
}

export function persistActiveGroups(
  storage: Pick<Storage, "setItem"> | null,
  script: string,
  set: string,
  groups: readonly string[],
  activeGroups: ReadonlySet<string>,
): void {
  if (storage === null) {
    return;
  }

  try {
    storage.setItem(
      getColumnStorageKey(script, set),
      serializeActiveGroups(groups, activeGroups),
    );
  } catch {
    // Storage can be unavailable or full; the UI state remains usable.
  }
}

export function toggleGroup<Group extends string>(
  groups: readonly Group[],
  activeGroups: ReadonlySet<Group>,
  group: Group,
): readonly Group[] {
  const nextActiveGroups = new Set(activeGroups);
  if (nextActiveGroups.has(group)) {
    nextActiveGroups.delete(group);
  } else {
    nextActiveGroups.add(group);
  }

  return groups.filter((candidate) => nextActiveGroups.has(candidate));
}
