export default function CTASection() {
  const handleShareTwitter = () => {
    const text = 'Just discovered PromptUp - a free tool to test and optimize AI prompts. Works with ChatGPT, Claude, and more. promptup.cloud';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <section className="card p-10 text-center my-20">
      <h2 className="text-3xl font-semibold mb-4 text-gradient">Ready to Master Prompting?</h2>
      <p className="text-foreground-muted mb-8 text-base">Join 5,000+ users who've improved their AI workflow</p>

      {/* Instant-Gaming Affiliate Banner */}
      <div className="ad-banner-partner mb-5" id="ad-instant-gaming-banner">
        <div
          id="my-banner"
          style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="text-foreground-muted text-sm">Loading...</div>
        </div>
      </div>

      {/* Google AdSense Banner */}
      <div className="ad-banner" aria-label="Advertisement" style={{ minHeight: '90px' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minWidth: '200px' }}
          data-ad-client="ca-pub-5400335063218645"
          data-ad-slot="9162913100"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 text-left">
        <Feature
          icon="🎯"
          title="Instant Scoring"
          description="Get clarity scores for every prompt instantly"
        />
        <Feature
          icon="💡"
          title="AI Suggestions"
          description="Specific recommendations to improve results"
        />
        <Feature
          icon="📚"
          title="Prompt Library"
          description="Access 500+ proven prompts (coming soon)"
        />
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-xs mx-auto">
        <button onClick={handleShareTwitter} className="btn-secondary">
          Share on Twitter
        </button>
        <button className="btn-primary">Get Premium Access</button>
      </div>
    </section>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="p-4 bg-background-elevated rounded-lg border-l-2 border-accent">
      <div className="font-semibold mb-2 text-accent">{icon} {title}</div>
      <div className="text-sm text-foreground-muted">{description}</div>
    </div>
  );
}
