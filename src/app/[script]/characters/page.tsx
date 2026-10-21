import { notFound } from "next/navigation";

import { CharactersPage } from "@/components/characters/CharactersPage";
import type { Script } from "@/lib/kana";

type CharactersPageProps = {
  readonly params: Promise<{ script: string }>;
};

const scripts = ["hiragana", "katakana"] as const satisfies readonly Script[];

export function generateStaticParams(): Array<{ script: Script }> {
  return scripts.map((script) => ({ script }));
}

export default async function CharactersRoute({ params }: CharactersPageProps) {
  const { script } = await params;
  if (!scripts.includes(script as Script)) {
    notFound();
  }

  return <CharactersPage script={script as Script} />;
}
