import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const sidebarItems = [
  { icon: '📊', label: 'Dashboard', active: true },
  { icon: '⚡', label: 'Prompts', active: false },
  { icon: '📈', label: 'Analytics', active: false },
  { icon: '🔄', label: 'History', active: false },
  { icon: '⚙️', label: 'Settings', active: false },
];

const promptItems = [
  { name: 'Code Review Assistant', model: 'GPT-4', success: '94%', updated: '2m ago' },
  { name: 'Blog Post Generator', model: 'Claude 3', success: '89%', updated: '1h ago' },
  { name: 'Data Analyzer', model: 'GPT-4', success: '97%', updated: '3h ago' },
  { name: 'Email Drafter', model: 'GPT-3.5', success: '91%', updated: '5h ago' },
];

export default function Preview() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);
  const rotate = useTransform(scrollYProgress, [0, 1], [2, -2]);

  return (
    <section id="preview" className="section relative overflow-hidden border-t border-border">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-deep to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent opacity-[0.08] blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="section-header">
            <span className="badge mb-4">Preview</span>
            <h2 className="section-title">
              A workspace designed
              <br />
              <span className="text-gradient">for prompt engineers</span>
            </h2>
            <p className="section-subtitle">
              Beautiful interface, powerful features. Everything you need to build
              production-ready AI prompts.
            </p>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          style={{ y, rotate }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-8 bg-accent/20 blur-3xl rounded-[3rem]" />

            {/* Main Dashboard */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-background-elevated/80 backdrop-blur-xl shadow-card">
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center gap-2 text-foreground-subtle text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>promptup.app/dashboard</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-accent" />
                    <span className="text-sm text-foreground-muted">John D.</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex">
                {/* Sidebar */}
                <div className="w-56 border-r border-border p-4 hidden md:block">
                  <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">P</span>
                    </div>
                    <span className="font-semibold text-foreground">PromptUp</span>
                  </div>

                  <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          item.active
                            ? 'bg-accent/20 text-foreground border border-accent/30'
                            : 'text-foreground-muted hover:text-foreground hover:bg-surface'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    ))}
                  </nav>

                  <div className="mt-auto pt-8 px-2">
                    <div className="card p-3">
                      <div className="text-xs text-foreground-subtle mb-2">Monthly Usage</div>
                      <div className="text-lg font-semibold text-foreground mb-2">8,437 / 10k</div>
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '84%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-accent rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                  {/* Page Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Your Prompts</h3>
                      <p className="text-sm text-foreground-muted">Manage and optimize your AI prompts</p>
                    </div>
                    <button className="btn-primary text-sm px-4 py-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Prompt
                    </button>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Prompts', value: '247', change: '+12%' },
                      { label: 'Avg Score', value: '91%', change: '+3%' },
                      { label: 'Tokens Used', value: '2.4M', change: '+8%' },
                      { label: 'This Month', value: '$84', change: '+23%' },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                        className="card p-4"
                      >
                        <div className="text-sm text-foreground-muted mb-1">{stat.label}</div>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                          <span className="text-xs text-emerald-400">{stat.change}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Prompt List */}
                  <div className="card overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs text-foreground-subtle uppercase tracking-wider">
                      <div className="col-span-4">Prompt Name</div>
                      <div className="col-span-2">Model</div>
                      <div className="col-span-2">Success Rate</div>
                      <div className="col-span-2">Last Updated</div>
                      <div className="col-span-2" />
                    </div>

                    {promptItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border hover:bg-surface transition-colors duration-200 items-center"
                      >
                        <div className="col-span-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${index % 2 === 0 ? 'bg-accent/20' : 'bg-purple-500/20'} flex items-center justify-center`}>
                              <span className="text-sm">⚡</span>
                            </div>
                            <span className="text-foreground font-medium">{item.name}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-surface text-foreground-muted text-xs">
                            {item.model}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden max-w-[60px]">
                              <div
                                className={`h-full rounded-full ${
                                  parseInt(item.success) > 90
                                    ? 'bg-emerald-500'
                                    : parseInt(item.success) > 85
                                    ? 'bg-accent'
                                    : 'bg-yellow-500'
                                }`}
                                style={{ width: item.success }}
                              />
                            </div>
                            <span className="text-sm text-foreground-muted">{item.success}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm text-foreground-muted">{item.updated}</div>
                        <div className="col-span-2 flex items-center gap-2">
                          <button className="p-1.5 hover:bg-surface rounded-lg transition-colors duration-200">
                            <svg className="w-4 h-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button className="p-1.5 hover:bg-surface rounded-lg transition-colors duration-200">
                            <svg className="w-4 h-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-4 top-1/4 card p-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-foreground-subtle">Optimization</div>
                  <div className="text-sm font-semibold text-foreground">+24% better</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -left-4 bottom-1/4 card p-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-foreground-subtle">Response Time</div>
                  <div className="text-sm font-semibold text-foreground">0.8s avg</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
