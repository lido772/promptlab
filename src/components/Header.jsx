export default function Header() {
  return (
    <header className="text-center py-16 px-5 bg-gradient-to-b from-surface/10 to-transparent border-b border-border mb-16">
      <div className="container">
        <h1 className="text-4xl md:text-5xl font-semibold mb-2.5 text-gradient">
          ✨ PromptUp
        </h1>
        <p className="text-foreground-muted text-base mt-2.5">
          Test, optimize & master your AI prompts
        </p>

        {/* History Toggle Button */}
        <div className="flex items-center justify-center gap-3 mt-4 min-h-10">
          <button
            onClick={() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary px-4 py-2 text-sm"
          >
            My History
          </button>
        </div>
      </div>
    </header>
  );
}
