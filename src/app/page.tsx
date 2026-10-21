"use client";

import { useState } from "react";

import { AsciiBackground } from "@/components/home/AsciiBackground";
import { FolderField } from "@/components/home/FolderField";
import { TitleScramble } from "@/components/home/TitleScramble";
import { AsciiLoader } from "@/components/loader";

export default function HomePage() {
  const [loaderComplete, setLoaderComplete] = useState(false);

  return (
    <>
      {!loaderComplete && <AsciiLoader onComplete={() => setLoaderComplete(true)} />}
      <main className="home-main" aria-labelledby="home-title">
        <AsciiBackground />
        <section className="home-hero">
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">Japanese practice, filed by hand</p>
            <h1 id="home-title" className="home-hero__title">
              <span>Flash Card!</span>
              <TitleScramble className="home-hero__kana font-kana-ui" />
            </h1>
            <p className="home-hero__copy">
              This was created because the creator wanted to learn Japanese. And is trying to slowly
              rediscover the joy of the creative process while recovering.
            </p>
          </div>
        </section>
        <FolderField className="home-folder-field" />
      </main>
    </>
  );
}
