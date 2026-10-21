import assert from "node:assert/strict";
import test from "node:test";

import {
  KANA_SETS,
  SCRIPTS,
  getKanaColumns,
  getKanaEntries,
  type KanaSet,
} from "./index.ts";

const expectedCounts: Record<KanaSet, number> = {
  basic: 46,
  dakuten: 25,
  combination: 33,
};

const expectedBasicGroups = [
  "a",
  "ka",
  "sa",
  "ta",
  "na",
  "ha",
  "ma",
  "ya",
  "ra",
  "wa",
  "n",
] as const;

const expectedCombinationGroups = [
  "ka",
  "sa",
  "ta",
  "na",
  "ha",
  "ma",
  "ra",
  "g",
  "z",
  "b",
  "p",
] as const;

for (const script of SCRIPTS) {
  test(`${script} has the canonical count for every set`, () => {
    for (const set of KANA_SETS) {
      assert.equal(getKanaEntries(script, set).length, expectedCounts[set]);
    }
  });

  test(`${script} declares every entry in exactly one set`, () => {
    const entries = KANA_SETS.flatMap((set) =>
      getKanaEntries(script, set).map((entry) => {
        assert.equal(entry.script, script);
        assert.equal(entry.set, set);
        return entry;
      }),
    );

    assert.equal(entries.length, 104);
    assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
    assert.equal(new Set(entries.map((entry) => entry.char)).size, entries.length);
    assert.ok(entries.every((entry) => /^[a-z0-9-]+$/.test(entry.id)));
  });

  test(`${script} exposes stable grouped columns`, () => {
    const basicColumns = getKanaColumns(script, "basic");
    const combinationColumns = getKanaColumns(script, "combination");

    assert.deepEqual(
      basicColumns.map((column) => column.group),
      expectedBasicGroups,
    );
    assert.deepEqual(
      combinationColumns.map((column) => column.group),
      expectedCombinationGroups,
    );

    for (const set of KANA_SETS) {
      const columns = getKanaColumns(script, set);
      const flattened = columns.flatMap((column) => column.entries);
      assert.deepEqual(flattened, getKanaEntries(script, set));
      assert.equal(new Set(columns.map((column) => column.group)).size, columns.length);
    }
  });
}

test("retrieves the canonical entries by script and set", () => {
  for (const script of SCRIPTS) {
    for (const set of KANA_SETS) {
      assert.equal(getKanaEntries(script, set)[0]?.script, script);
      assert.equal(getKanaEntries(script, set)[0]?.set, set);
    }
  }
});

test("contains the accepted alternate spellings in both scripts", () => {
  const requiredVariants = [
    ["し", "shi", "si"],
    ["ち", "chi", "ti"],
    ["つ", "tsu", "tu"],
    ["ふ", "fu", "hu"],
    ["じ", "ji", "zi"],
  ] as const;

  for (const script of SCRIPTS) {
    const entries = KANA_SETS.flatMap((set) => getKanaEntries(script, set));
    for (const [hiragana, canonical, alternate] of requiredVariants) {
      const char = script === "hiragana"
        ? hiragana
        : String.fromCodePoint(hiragana.codePointAt(0)! + 0x60);
      const entry = entries.find((candidate) => candidate.char === char);
      assert.ok(entry, `missing ${script} entry for ${char}`);
      assert.ok(entry.romaji.includes(canonical));
      assert.ok(entry.romaji.includes(alternate));
    }
  }
});
