"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import {
  getKanaColumns,
  type KanaSet,
  type Script,
} from "@/lib/kana";

import {
  filterColumnsByGroup,
  getColumnStorageKey,
  getInitialActiveGroupsFromValue,
  getStorageSafely,
  getStoredValueSafely,
  persistActiveGroups,
  toggleGroup,
} from "./columnView";
import styles from "./CharactersPage.module.css";

const displayedSets = ["basic", "combination", "dakuten"] as const satisfies readonly KanaSet[];

const setLabels: Record<KanaSet, string> = {
  basic: "Basic",
  combination: "Combination",
  dakuten: "Dakuten",
};

const scriptLabels: Record<Script, { english: string; japanese: string }> = {
  hiragana: { english: "Hiragana", japanese: "ひらがな" },
  katakana: { english: "Katakana", japanese: "カタカナ" },
};

type CharactersPageProps = {
  readonly script: Script;
};

type OptimisticGroupsByKey = Readonly<Record<string, readonly string[]>>;

export function CharactersPage({ script }: CharactersPageProps) {
  const [selectedSet, setSelectedSet] = useState<KanaSet>("basic");
  const columns = useMemo(() => getKanaColumns(script, selectedSet), [script, selectedSet]);
  const groups = useMemo(() => columns.map((column) => column.group), [columns]);
  const storageKey = getColumnStorageKey(script, selectedSet);
  const storage = getStorageSafely(() => window.localStorage);
  const subscribeToStorage = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    return () => window.removeEventListener("storage", onStoreChange);
  }, []);
  const getStoredGroups = useCallback(
    () => getStoredValueSafely(() => storage, storageKey),
    [storage, storageKey],
  );
  const storedGroups = useSyncExternalStore(subscribeToStorage, getStoredGroups, () => null);
  const restoredGroups = getInitialActiveGroupsFromValue(storedGroups, groups);
  const [optimisticGroupsByKey, setOptimisticGroupsByKey] = useState<OptimisticGroupsByKey>({});
  const activeGroups = optimisticGroupsByKey[storageKey] ?? restoredGroups;

  const setActiveGroups = (nextGroups: readonly string[]) => {
    setOptimisticGroupsByKey((previous) => ({
      ...previous,
      [storageKey]: nextGroups,
    }));
    persistActiveGroups(
      storage,
      script,
      selectedSet,
      groups,
      new Set(nextGroups),
    );
  };

  const visibleColumns = useMemo(
    () => filterColumnsByGroup(columns, new Set(activeGroups)),
    [activeGroups, columns],
  );
  const { english, japanese } = scriptLabels[script];

  return (
    <main className={styles.main} aria-labelledby="characters-title">
      <div className={styles.content}>
        <h1 id="characters-title" className={styles.title}>
          {english} Flash Cards <span className={styles.titleKana} lang="ja">{japanese}</span>
        </h1>

        <div className={styles.navigationRow}>
          <nav className={styles.segmentGroup} aria-label="Practice mode">
            <Link
              className={`${styles.segment} ${styles.segmentActive}`}
              href={`/${script}/characters`}
              aria-current="page"
            >
              Characters
            </Link>
            <Link
              className={styles.segment}
              href={`/${script}/words`}
              aria-label={`${english} Words, placeholder route`}
            >
              Words
            </Link>
          </nav>

          <div className={styles.segmentGroup} role="group" aria-label="Character set">
            {displayedSets.map((set) => {
              const isActive = selectedSet === set;
              return (
                <button
                  key={set}
                  className={`${styles.segment} ${isActive ? styles.segmentActive : ""}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedSet(set)}
                >
                  {setLabels[set]}
                </button>
              );
            })}
          </div>
        </div>

        <p className={styles.setDescription} aria-live="polite">
          {setLabels[selectedSet]} characters · {columns.reduce((count, column) => count + column.entries.length, 0)} cards
        </p>

        <section className={styles.grid} aria-label={`${setLabels[selectedSet]} ${english} characters`}>
          {columns.map((column) => {
            const isGroupActive = activeGroups.includes(column.group);

            return (
              <section className={styles.column} key={column.group} aria-label={`${column.group} group`}>
                <button
                  className={`${styles.columnToggle} ${isGroupActive ? styles.columnToggleActive : ""}`}
                  type="button"
                  aria-label={`${isGroupActive ? "Hide" : "Show"} ${column.group} group`}
                  aria-pressed={isGroupActive}
                  onClick={() =>
                    setActiveGroups(toggleGroup(groups, new Set(activeGroups), column.group))
                  }
                >
                  <span className={styles.toggleKnob} aria-hidden="true" />
                </button>

                {isGroupActive && (
                  <div className={styles.entries}>
                    {column.entries.map((entry) => (
                      <article className={styles.entry} key={entry.id}>
                        <span className={`${styles.character} font-kana-ui`} lang="ja">{entry.char}</span>
                        <span className={styles.romaji}>{entry.romaji[0]}</span>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </section>

        {visibleColumns.length === 0 && (
          <p className={styles.emptyState}>
            No groups selected. Choose a group toggle to show its characters.
          </p>
        )}
      </div>
    </main>
  );
}
