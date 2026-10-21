import type {
  KanaColumn,
  KanaEntry,
  KanaSet,
  KanaTable,
  KanaTables,
  Script,
} from "./contracts.ts";

type KanaSpec = Readonly<{
  id: string;
  char: string;
  romaji: readonly string[];
  group: string;
  set: KanaSet;
}>;

function defineSpec(
  set: KanaSet,
  group: string,
  id: string,
  char: string,
  ...romaji: string[]
): KanaSpec {
  return Object.freeze({
    id,
    char,
    romaji: Object.freeze(romaji),
    group,
    set,
  });
}

const kanaSpecsBySet: Readonly<Record<KanaSet, readonly KanaSpec[]>> = Object.freeze({
  basic: Object.freeze([
    defineSpec("basic", "a", "a", "あ", "a"),
    defineSpec("basic", "a", "i", "い", "i"),
    defineSpec("basic", "a", "u", "う", "u"),
    defineSpec("basic", "a", "e", "え", "e"),
    defineSpec("basic", "a", "o", "お", "o"),

    defineSpec("basic", "ka", "ka", "か", "ka"),
    defineSpec("basic", "ka", "ki", "き", "ki"),
    defineSpec("basic", "ka", "ku", "く", "ku"),
    defineSpec("basic", "ka", "ke", "け", "ke"),
    defineSpec("basic", "ka", "ko", "こ", "ko"),

    defineSpec("basic", "sa", "sa", "さ", "sa"),
    defineSpec("basic", "sa", "shi", "し", "shi", "si"),
    defineSpec("basic", "sa", "su", "す", "su"),
    defineSpec("basic", "sa", "se", "せ", "se"),
    defineSpec("basic", "sa", "so", "そ", "so"),

    defineSpec("basic", "ta", "ta", "た", "ta"),
    defineSpec("basic", "ta", "chi", "ち", "chi", "ti"),
    defineSpec("basic", "ta", "tsu", "つ", "tsu", "tu"),
    defineSpec("basic", "ta", "te", "て", "te"),
    defineSpec("basic", "ta", "to", "と", "to"),

    defineSpec("basic", "na", "na", "な", "na"),
    defineSpec("basic", "na", "ni", "に", "ni"),
    defineSpec("basic", "na", "nu", "ぬ", "nu"),
    defineSpec("basic", "na", "ne", "ね", "ne"),
    defineSpec("basic", "na", "no", "の", "no"),

    defineSpec("basic", "ha", "ha", "は", "ha"),
    defineSpec("basic", "ha", "hi", "ひ", "hi"),
    defineSpec("basic", "ha", "fu", "ふ", "fu", "hu"),
    defineSpec("basic", "ha", "he", "へ", "he"),
    defineSpec("basic", "ha", "ho", "ほ", "ho"),

    defineSpec("basic", "ma", "ma", "ま", "ma"),
    defineSpec("basic", "ma", "mi", "み", "mi"),
    defineSpec("basic", "ma", "mu", "む", "mu"),
    defineSpec("basic", "ma", "me", "め", "me"),
    defineSpec("basic", "ma", "mo", "も", "mo"),

    defineSpec("basic", "ya", "ya", "や", "ya"),
    defineSpec("basic", "ya", "yu", "ゆ", "yu"),
    defineSpec("basic", "ya", "yo", "よ", "yo"),

    defineSpec("basic", "ra", "ra", "ら", "ra"),
    defineSpec("basic", "ra", "ri", "り", "ri"),
    defineSpec("basic", "ra", "ru", "る", "ru"),
    defineSpec("basic", "ra", "re", "れ", "re"),
    defineSpec("basic", "ra", "ro", "ろ", "ro"),

    defineSpec("basic", "wa", "wa", "わ", "wa"),
    defineSpec("basic", "wa", "wo", "を", "wo", "o"),
    defineSpec("basic", "n", "n", "ん", "n", "nn"),
  ]),
  dakuten: Object.freeze([
    defineSpec("dakuten", "g", "ga", "が", "ga"),
    defineSpec("dakuten", "g", "gi", "ぎ", "gi"),
    defineSpec("dakuten", "g", "gu", "ぐ", "gu"),
    defineSpec("dakuten", "g", "ge", "げ", "ge"),
    defineSpec("dakuten", "g", "go", "ご", "go"),

    defineSpec("dakuten", "z", "za", "ざ", "za"),
    defineSpec("dakuten", "z", "ji", "じ", "ji", "zi"),
    defineSpec("dakuten", "z", "zu", "ず", "zu"),
    defineSpec("dakuten", "z", "ze", "ぜ", "ze"),
    defineSpec("dakuten", "z", "zo", "ぞ", "zo"),

    defineSpec("dakuten", "d", "da", "だ", "da"),
    defineSpec("dakuten", "d", "di", "ぢ", "ji", "di"),
    defineSpec("dakuten", "d", "du", "づ", "zu", "du"),
    defineSpec("dakuten", "d", "de", "で", "de"),
    defineSpec("dakuten", "d", "do", "ど", "do"),

    defineSpec("dakuten", "b", "ba", "ば", "ba"),
    defineSpec("dakuten", "b", "bi", "び", "bi"),
    defineSpec("dakuten", "b", "bu", "ぶ", "bu"),
    defineSpec("dakuten", "b", "be", "べ", "be"),
    defineSpec("dakuten", "b", "bo", "ぼ", "bo"),

    defineSpec("dakuten", "p", "pa", "ぱ", "pa"),
    defineSpec("dakuten", "p", "pi", "ぴ", "pi"),
    defineSpec("dakuten", "p", "pu", "ぷ", "pu"),
    defineSpec("dakuten", "p", "pe", "ぺ", "pe"),
    defineSpec("dakuten", "p", "po", "ぽ", "po"),
  ]),
  combination: Object.freeze([
    defineSpec("combination", "ka", "kya", "きゃ", "kya"),
    defineSpec("combination", "ka", "kyu", "きゅ", "kyu"),
    defineSpec("combination", "ka", "kyo", "きょ", "kyo"),

    defineSpec("combination", "sa", "sha", "しゃ", "sha", "sya"),
    defineSpec("combination", "sa", "shu", "しゅ", "shu", "syu"),
    defineSpec("combination", "sa", "sho", "しょ", "sho", "syo"),

    defineSpec("combination", "ta", "cha", "ちゃ", "cha", "cya", "tya"),
    defineSpec("combination", "ta", "chu", "ちゅ", "chu", "cyu", "tyu"),
    defineSpec("combination", "ta", "cho", "ちょ", "cho", "cyo", "tyo"),

    defineSpec("combination", "na", "nya", "にゃ", "nya"),
    defineSpec("combination", "na", "nyu", "にゅ", "nyu"),
    defineSpec("combination", "na", "nyo", "にょ", "nyo"),

    defineSpec("combination", "ha", "hya", "ひゃ", "hya"),
    defineSpec("combination", "ha", "hyu", "ひゅ", "hyu"),
    defineSpec("combination", "ha", "hyo", "ひょ", "hyo"),

    defineSpec("combination", "ma", "mya", "みゃ", "mya"),
    defineSpec("combination", "ma", "myu", "みゅ", "myu"),
    defineSpec("combination", "ma", "myo", "みょ", "myo"),

    defineSpec("combination", "ra", "rya", "りゃ", "rya"),
    defineSpec("combination", "ra", "ryu", "りゅ", "ryu"),
    defineSpec("combination", "ra", "ryo", "りょ", "ryo"),

    defineSpec("combination", "g", "gya", "ぎゃ", "gya"),
    defineSpec("combination", "g", "gyu", "ぎゅ", "gyu"),
    defineSpec("combination", "g", "gyo", "ぎょ", "gyo"),

    defineSpec("combination", "z", "ja", "じゃ", "ja", "jya", "zya"),
    defineSpec("combination", "z", "ju", "じゅ", "ju", "jyu", "zyu"),
    defineSpec("combination", "z", "jo", "じょ", "jo", "jyo", "zyo"),

    defineSpec("combination", "b", "bya", "びゃ", "bya"),
    defineSpec("combination", "b", "byu", "びゅ", "byu"),
    defineSpec("combination", "b", "byo", "びょ", "byo"),

    defineSpec("combination", "p", "pya", "ぴゃ", "pya"),
    defineSpec("combination", "p", "pyu", "ぴゅ", "pyu"),
    defineSpec("combination", "p", "pyo", "ぴょ", "pyo"),
  ]),
});

function toKatakana(char: string): string {
  return Array.from(char, (character) => {
    const codePoint = character.codePointAt(0)!;
    return codePoint >= 0x3041 && codePoint <= 0x3096
      ? String.fromCodePoint(codePoint + 0x60)
      : character;
  }).join("");
}

function createEntries(script: Script, set: KanaSet): readonly KanaEntry[] {
  return Object.freeze(
    kanaSpecsBySet[set].map((spec) =>
      Object.freeze({
        id: `${script}-${spec.set}-${spec.id}`,
        script,
        char: script === "hiragana" ? spec.char : toKatakana(spec.char),
        romaji: spec.romaji,
        group: spec.group,
        set: spec.set,
      }),
    ),
  );
}

function createTable(script: Script): KanaTable {
  return Object.freeze({
    basic: createEntries(script, "basic"),
    dakuten: createEntries(script, "dakuten"),
    combination: createEntries(script, "combination"),
  });
}

export const kanaTables: KanaTables = Object.freeze({
  hiragana: createTable("hiragana"),
  katakana: createTable("katakana"),
});

export const hiragana = kanaTables.hiragana;
export const katakana = kanaTables.katakana;

export function getKanaEntries(script: Script, set: KanaSet): readonly KanaEntry[] {
  return kanaTables[script][set];
}

export function getKanaColumns(script: Script, set: KanaSet): readonly KanaColumn[] {
  const entriesByGroup = new Map<string, KanaEntry[]>();

  for (const entry of getKanaEntries(script, set)) {
    const groupEntries = entriesByGroup.get(entry.group);
    if (groupEntries) {
      groupEntries.push(entry);
    } else {
      entriesByGroup.set(entry.group, [entry]);
    }
  }

  return Object.freeze(
    Array.from(entriesByGroup, ([group, entries]) =>
      Object.freeze({
        group,
        entries: Object.freeze(entries),
      }),
    ),
  );
}
