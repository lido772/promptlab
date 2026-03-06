import { motion } from 'framer-motion';

export default function Hero({ onStartClick }) {
  return (
    <section className="relative min-h-[100svh] md:min-h-screen flex items-start justify-center overflow-hidden pt-24 pb-12 md:items-center md:pt-0 md:pb-0">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0a0a0f] via-[#050506] to-[#020203]" />

      {/* Animated Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-4 top-12 h-64 rounded-full bg-accent/15 blur-3xl md:hidden" />
        <div className="absolute top-0 left-1/2 hidden h-[1400px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.25] blur-[150px] animate-float md:block" />
        <div className="absolute top-1/4 left-0 hidden h-[800px] w-[600px] -translate-x-1/4 rounded-full bg-purple-600 opacity-[0.15] blur-[120px] animate-float-delayed md:block" />
        <div className="absolute top-1/3 right-0 hidden h-[700px] w-[500px] translate-x-1/4 rounded-full bg-indigo-500 opacity-[0.12] blur-[100px] animate-float md:block" />
        <div className="absolute bottom-0 left-1/2 hidden h-[600px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-accent opacity-[0.10] blur-[100px] animate-glow-pulse md:block" />
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
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex max-w-full items-center gap-2"
          >
            <span className="badge max-w-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="truncate">Now with GPT-4 Turbo Support</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-gradient sm:text-5xl md:text-6xl lg:text-7xl"
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
            className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-foreground-muted sm:text-lg md:mb-10 md:text-xl"
          >
            The intelligent prompt engineering platform that helps you craft,
            test, and optimize AI prompts with real-time analytics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10 flex flex-col items-stretch justify-center gap-3 sm:mb-12 sm:flex-row sm:items-center"
          >
            <motion.button
              onClick={onStartClick}
              className="btn-primary px-6 py-4 text-base sm:px-8 sm:text-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Building Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
            <motion.button
              className="btn-secondary px-6 py-4 text-base sm:px-8 sm:text-lg"
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
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 opacity-40 lg:gap-12">
              {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma'].map((company) => (
                <span key={company} className="text-base font-semibold text-foreground-muted sm:text-lg">
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
          className="mx-auto mt-12 max-w-5xl lg:mt-24"
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
                <div className="hidden flex-1 justify-center sm:flex">
                  <div className="flex gap-6 text-xs text-foreground-muted">
                    <span className="text-foreground">Prompts</span>
                    <span>Analytics</span>
                    <span>Settings</span>
                  </div>
                </div>
              </div>

              {/* Mock Content */}
              <div className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  {/* Stats Cards */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="card p-4 animate-float"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      <div className="text-xl font-semibold text-gradient sm:text-2xl">
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
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
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
