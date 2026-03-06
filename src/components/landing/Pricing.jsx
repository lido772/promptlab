import { motion } from 'framer-motion';
import { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals exploring prompt engineering',
    price: { monthly: 0, yearly: 0 },
    features: [
      { name: '50 prompts per month', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'GPT-3.5 access', included: true },
      { name: 'Community support', included: true },
      { name: 'Version history (7 days)', included: true },
      { name: 'GPT-4 access', included: false },
      { name: 'API access', included: false },
      { name: 'Team collaboration', included: false },
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For professionals building AI-powered products',
    price: { monthly: 29, yearly: 24 },
    features: [
      { name: 'Unlimited prompts', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'All models (GPT-4, Claude)', included: true },
      { name: 'Priority support', included: true },
      { name: 'Version history (90 days)', included: true },
      { name: 'API access', included: true },
      { name: 'Custom templates', included: true },
      { name: 'Team collaboration', included: false },
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For teams with advanced security and scaling needs',
    price: { monthly: 99, yearly: 79 },
    features: [
      { name: 'Unlimited everything', included: true },
      { name: 'Custom analytics reports', included: true },
      { name: 'All models + fine-tuning', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Unlimited version history', included: true },
      { name: 'Advanced API access', included: true },
      { name: 'SSO & advanced security', included: true },
      { name: 'Unlimited team members', included: true },
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="section relative overflow-hidden border-t border-border">
      {/* Background Elements */}
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
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="section-header">
            <span className="badge mb-4">Pricing</span>
            <h2 className="section-title">
              Simple, transparent
              <br />
              <span className="text-gradient">pricing for everyone</span>
            </h2>
            <p className="section-subtitle">
              Start free, scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className={`text-sm font-medium ${!yearly ? 'text-foreground' : 'text-foreground-muted'}`}>
              Monthly
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                yearly ? 'bg-accent' : 'bg-surface'
              }`}
            >
              <motion.span
                className="absolute top-1 w-5 h-5 bg-foreground rounded-full shadow-md"
                animate={{ left: yearly ? 'calc(100% - 24px)' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium ${yearly ? 'text-foreground' : 'text-foreground-muted'}`}>
              Yearly
            </span>
            <span className="ml-1 px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
              Save 17%
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {plan.highlighted && (
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent rounded-full text-foreground text-sm font-medium shadow-glow"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Most Popular
                  </motion.div>
                )}

                <div
                  className={`card p-8 h-full ${plan.highlighted ? 'border-accent' : ''}`}
                >
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-foreground-muted text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold text-foreground">
                        ${yearly ? plan.price.yearly : plan.price.monthly}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-foreground-muted">/month</span>
                      )}
                    </div>
                    {plan.price.monthly > 0 && yearly && (
                      <p className="text-sm text-foreground-muted mt-1">
                        Billed annually (${plan.price.yearly * 12}/year)
                      </p>
                    )}
                    {plan.price.monthly === 0 && (
                      <p className="text-sm text-foreground-muted mt-1">Forever free</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-start gap-3">
                        {feature.included ? <CheckIcon /> : <XIcon />}
                        <span
                          className={`text-sm ${feature.included ? 'text-foreground-muted' : 'text-foreground-subtle'}`}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {plan.highlighted ? (
                    <motion.button
                      className="btn-primary w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                    </motion.button>
                  ) : (
                    <motion.button
                      className="btn-secondary w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-foreground-muted"
          >
            {[
              { icon: '🔒', text: 'Secure payments' },
              { icon: '↩️', text: 'Cancel anytime' },
              { icon: '💬', text: '24/7 support' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
