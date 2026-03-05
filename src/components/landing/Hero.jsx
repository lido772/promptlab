import { motion } from 'framer-motion';

const words = ['Smarter', 'Faster', 'Better'];

export default function Hero({ onStartClick }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0a0a0f] via-[#050506] to-[#020203]" />

      {/* Animated Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary blob - Top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[1400px] bg-accent opacity-[0.25] blur-[150px] animate-float rounded-full" />

        {/* Secondary blob - Left side */}
        <div className="absolute top-1/4 left-0 -translate-x-1/4 w-[600px] h-[800px] bg-purple-600 opacity-[0.15] blur-[120px] animate-float-delayed rounded-full" />

        {/* Tertiary blob - Right side */}
        <div className="absolute top-1/3 right-0 translate-x-1/4 w-[500px] h-[700px] bg-indigo-500 opacity-[0.12] blur-[100px] animate-float rounded-full" />

        {/* Bottom accent - Pulsing */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[600px] bg-accent opacity-[0.10] blur-[100px] animate-glow-pulse rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="container relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="badge">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Now with GPT-4 Turbo Support
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gradient mb-6 leading-tight tracking-tight"
          >
            Build AI Prompts
            <br />
            <span className="text-accent-gradient">10x Faster</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground-muted mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            The intelligent prompt engineering platform that helps you craft,
            test, and optimize AI prompts with real-time analytics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.button
              onClick={onStartClick}
              className="btn-primary text-lg px-8 py-4"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Building Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
            <motion.button
              className="btn-secondary text-lg px-8 py-4"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-sm text-foreground-subtle">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12 opacity-40">
              {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma'].map((company) => (
                <span key={company} className="text-lg font-semibold text-foreground-muted">
                  {company}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 lg:mt-24 max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Glow behind */}
            <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-3xl" />

            {/* Dashboard Mockup */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-background-elevated/80 backdrop-blur-xl shadow-card">
              {/* Window Controls */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex gap-6 text-xs text-foreground-muted">
                    <span className="text-foreground">Prompts</span>
                    <span>Analytics</span>
                    <span>Settings</span>
                  </div>
                </div>
              </div>

              {/* Mock Content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Stats Cards */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="card p-4 animate-float"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      <div className="text-2xl font-semibold text-gradient">
                        {i === 1 ? '2.4K' : i === 2 ? '94%' : '847'}
                      </div>
                      <div className="text-sm text-foreground-muted mt-1">
                        {i === 1 ? 'Total Prompts' : i === 2 ? 'Success Rate' : 'Optimizations'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prompt Preview */}
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm text-foreground-muted">Recent Prompt</span>
                  </div>
                  <div className="h-24 bg-gradient-to-r from-surface to-transparent rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-foreground-subtle">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-border flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-foreground-subtle" />
        </motion.div>
      </motion.div>
    </section>
  );
}
