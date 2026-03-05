import { motion } from 'framer-motion';
import Spotlight from '../ui/Spotlight';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Lightning Fast',
    description: 'Process and optimize prompts in milliseconds with our AI-powered engine. No more waiting around.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Real-time Analytics',
    description: 'Track performance metrics, token usage, and success rates with beautiful visualizations.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: 'Version Control',
    description: 'Every iteration is saved. Compare versions, roll back changes, and track your prompt evolution.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure by Default',
    description: 'Enterprise-grade security with end-to-end encryption. Your prompts never leave your control.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Team Collaboration',
    description: 'Share prompts, leave comments, and work together in real-time with your entire team.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    title: 'API Access',
    description: 'Integrate prompt optimization into your workflow with our comprehensive REST API.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section id="features" className="section relative border-t border-border">
      {/* Background Grid */}
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

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-0 -translate-x-1/2 w-[600px] h-[800px] bg-accent opacity-[0.08] blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Section Header */}
          <div className="section-header">
            <motion.div variants={itemVariants}>
              <span className="badge mb-4">Features</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="section-title">
              Everything you need to
              <br />
              <span className="text-gradient">master AI prompts</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="section-subtitle">
              Powerful features designed for AI engineers, prompt designers, and teams
              building the next generation of AI applications.
            </motion.p>
          </div>

          {/* Features Grid - Bento Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[180px]">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={
                  index === 0
                    ? 'md:col-span-2 lg:col-span-2'
                    : index === 3
                    ? 'md:col-span-2 lg:col-span-1'
                    : ''
                }
              >
                <Spotlight className="h-full cursor-pointer">
                  <div className="card card-hover p-6 h-full flex flex-col">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-surface border border-border mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-foreground-muted leading-relaxed flex-1">{feature.description}</p>
                  </div>
                </Spotlight>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 card p-8 lg:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge mb-4">Advanced</span>
              <h3 className="text-2xl lg:text-3xl font-semibold text-gradient mb-4">
                AI-Powered Suggestions
              </h3>
              <p className="text-foreground-muted mb-6 leading-relaxed">
                Our intelligent analyzer studies your prompts and suggests improvements based on
                millions of successful patterns. Get actionable recommendations to boost your
                AI response quality by up to 40%.
              </p>
              <ul className="space-y-3">
                {[
                  'Context optimization recommendations',
                  'Token efficiency analysis',
                  'Output format suggestions',
                  'Variable extraction hints',
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-foreground-muted"
                  >
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Code Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-2xl" />
              <div className="relative bg-background-elevated rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface/50">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-4 text-xs text-foreground-subtle">prompt-analysis.json</span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto">
                  <code className="text-foreground-muted">
                    <span className="text-accent">{'{'}</span>
                    <br />
                    <span className="text-accent ml-4">"score"</span>: <span className="text-emerald-400">94</span>,
                    <br />
                    <span className="text-accent ml-4">"suggestions"</span>: [
                    <br />
                    <span className="ml-8 text-foreground-subtle">{"// 3 improvements found"}</span>
                    <br />
                    <span className="ml-8">{"{ "}</span>
                    <span className="text-accent">"type"</span>: <span className="text-emerald-400">"context"</span>,
                    <br />
                    <span className="ml-12 text-accent">"impact"</span>: <span className="text-emerald-400">"+24%"</span>
                    <span className="ml-8">{" }"}</span>,
                    <br />
                    <span className="ml-8">{"{ "}</span>
                    <span className="text-accent">"type"</span>: <span className="text-blue-400">"format"</span>,
                    <br />
                    <span className="ml-12 text-accent">"impact"</span>: <span className="text-blue-400">"+18%"</span>
                    <span className="ml-8">{" }"}</span>
                    <br />
                    <span className="ml-4">]</span>
                    <br />
                    <span className="text-accent">{"}"}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
