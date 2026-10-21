export type Script = "hiragana" | "katakana";
export const SCRIPTS = Object.freeze(["hiragana", "katakana"] as const);

export type KanaSet = "basic" | "dakuten" | "combination";
export const KANA_SETS = Object.freeze(["basic", "dakuten", "combination"] as const);

export type KanaEntry = Readonly<{
  id: string;
  script: Script;
  char: string;
  romaji: readonly string[];
  group: string;
  set: KanaSet;
}>;

export type KanaColumn = Readonly<{
  group: string;
  entries: readonly KanaEntry[];
}>;

export type KanaTable = Readonly<Record<KanaSet, readonly KanaEntry[]>>;
export type KanaTables = Readonly<Record<Script, KanaTable>>;
