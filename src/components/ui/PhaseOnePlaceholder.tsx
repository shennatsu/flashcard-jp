type PhaseOnePlaceholderProps = {
  readonly title: string;
};

export function PhaseOnePlaceholder({ title }: PhaseOnePlaceholderProps) {
  return (
    <main className="placeholder-main" aria-labelledby="placeholder-title">
      <section className="placeholder-main__content">
        <h1 id="placeholder-title">{title}</h1>
        <p>This foundation route is ready for a later phase.</p>
      </section>
    </main>
  );
}
