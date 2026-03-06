import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const sidebarItems = [
  { icon: 'Dashboard', label: 'Dashboard', active: true },
  { icon: 'Prompts', label: 'Prompts', active: false },
  { icon: 'Analytics', label: 'Analytics', active: false },
  { icon: 'History', label: 'History', active: false },
  { icon: 'Settings', label: 'Settings', active: false },
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
  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const rotate = useTransform(scrollYProgress, [0, 1], [1, -1]);

  return (
    <section id="preview" className="section relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-deep to-transparent" />
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.08] blur-[120px] pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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

        <motion.div style={{ y, rotate }} className="mx-auto max-w-6xl">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-accent/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated/80 backdrop-blur-xl shadow-card">
              <div className="flex flex-col gap-3 border-b border-border bg-surface/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="hidden min-w-0 items-center gap-2 text-sm text-foreground-subtle sm:flex">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="truncate">promptup.app/dashboard</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5">
                    <div className="h-6 w-6 rounded-full bg-accent" />
                    <span className="text-sm text-foreground-muted">John D.</span>
                  </div>
                </div>
              </div>

              <div className="flex">
                <div className="hidden w-56 border-r border-border p-4 md:block">
                  <div className="mb-8 flex items-center gap-2 px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                      <span className="text-sm font-semibold text-white">P</span>
                    </div>
                    <span className="font-semibold text-foreground">PromptUp</span>
                  </div>

                  <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          item.active
                            ? 'border border-accent/30 bg-accent/20 text-foreground'
                            : 'text-foreground-muted hover:bg-surface hover:text-foreground'
                        }`}
                      >
                        {item.icon}
                      </div>
                    ))}
                  </nav>

                  <div className="mt-8 px-2">
                    <div className="card p-3">
                      <div className="mb-2 text-xs text-foreground-subtle">Monthly Usage</div>
                      <div className="mb-2 text-lg font-semibold text-foreground">8,437 / 10k</div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '84%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full bg-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 sm:p-6">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Your Prompts</h3>
                      <p className="text-sm text-foreground-muted">Manage and optimize your AI prompts</p>
                    </div>
                    <button className="btn-primary w-full px-4 py-2 text-sm sm:w-auto">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Prompt
                    </button>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
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
                        <div className="mb-1 text-sm text-foreground-muted">{stat.label}</div>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                          <span className="text-xs text-emerald-400">{stat.change}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="card overflow-hidden">
                    <div className="hidden grid-cols-12 gap-4 border-b border-border px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle md:grid">
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
                        className="grid grid-cols-1 gap-3 border-b border-border px-4 py-4 transition-colors duration-200 hover:bg-surface md:grid-cols-12 md:gap-4 md:items-center md:py-3"
                      >
                        <div className="md:col-span-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${index % 2 === 0 ? 'bg-accent/20' : 'bg-purple-500/20'}`}>
                              <span className="text-sm">P</span>
                            </div>
                            <div className="min-w-0">
                              <span className="block truncate font-medium text-foreground">{item.name}</span>
                              <span className="mt-1 block text-xs text-foreground-subtle md:hidden">{item.updated}</span>
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <span className="inline-flex items-center rounded bg-surface px-2 py-1 text-xs text-foreground-muted">
                            {item.model}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 max-w-[60px] flex-1 overflow-hidden rounded-full bg-surface">
                              <div
                                className={`h-full rounded-full ${
                                  parseInt(item.success, 10) > 90
                                    ? 'bg-emerald-500'
                                    : parseInt(item.success, 10) > 85
                                      ? 'bg-accent'
                                      : 'bg-yellow-500'
                                }`}
                                style={{ width: item.success }}
                              />
                            </div>
                            <span className="text-sm text-foreground-muted">{item.success}</span>
                          </div>
                        </div>
                        <div className="hidden text-sm text-foreground-muted md:block md:col-span-2">{item.updated}</div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <button className="rounded-lg p-1.5 transition-colors duration-200 hover:bg-surface">
                            <svg className="h-4 w-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button className="rounded-lg p-1.5 transition-colors duration-200 hover:bg-surface">
                            <svg className="h-4 w-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-4 top-1/4 hidden card p-3 shadow-xl lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="absolute -left-4 bottom-1/4 hidden card p-3 shadow-xl lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                  <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
