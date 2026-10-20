export default function HomePage() {
  return (
    <main className="home-main" aria-labelledby="home-title">
      <section className="home-hero">
        <h1 id="home-title" className="home-hero__title">
          <span>Flash Card!</span>
          <span className="home-hero__kana font-kana-ui" lang="ja">
            にほん
          </span>
        </h1>
        <p className="home-hero__copy">
          This was created because the creator wanted to learn Japanese. And is trying to slowly
          rediscover the joy of the creative process while recovering.
        </p>
      </section>
    </main>
  );
}
