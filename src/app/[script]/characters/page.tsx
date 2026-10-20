import { notFound } from "next/navigation";

import { PhaseOnePlaceholder } from "@/components/ui/PhaseOnePlaceholder";

type Script = "hiragana" | "katakana";

type CharactersPageProps = {
  readonly params: Promise<{ script: string }>;
};

const scripts: readonly Script[] = ["hiragana", "katakana"];

export function generateStaticParams(): Array<{ script: Script }> {
  return scripts.map((script) => ({ script }));
}

export default async function CharactersPage({ params }: CharactersPageProps) {
  const { script } = await params;
  if (!scripts.includes(script as Script)) {
    notFound();
  }

  const label = script === "hiragana" ? "Hiragana" : "Katakana";
  return <PhaseOnePlaceholder title={`${label} Characters`} />;
}
