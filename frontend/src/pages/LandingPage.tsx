import { ArrowRight, Brain, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { landingStats, landingFeatures, howItWorks, pricingPlans } from '@/data/mockMlData';
import { SectionHeader } from '@/components/SectionHeader';

const iconMap = { Brain, Sparkles, ShieldCheck, Layers3 };

export function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-80" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-6 md:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300/80">AutoML Control Room</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Premium AI dashboard for CSV intelligence</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="outline">
              <Link to="/upload">Open dashboard</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit">
              AI AutoML platform for modern teams
            </Badge>
            <div className="space-y-5">
              <h2 className="max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">
                Turn CSV data into a <span className="text-gradient">production-style AI workflow</span>.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Upload a dataset, simulate AutoML, compare candidate models, tune with Optuna, and export polished reports from one futuristic control room.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/upload">
                  Start with CSV
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/training">View live training</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {landingStats.map((stat) => (
                <Card key={stat.label} className="hover:-translate-y-1 transition-transform duration-300">
                  <CardContent className="space-y-2 p-0">
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-semibold text-white">
                      <AnimatedCounter value={stat.value} />
                      {stat.suffix}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
            <div className="absolute -left-8 top-6 h-20 w-20 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -right-10 top-1/2 h-24 w-24 rounded-full bg-fuchsia-400/20 blur-3xl" />
            <Card className="relative overflow-hidden border-white/10 p-0 shadow-glow">
              <div className="border-b border-white/10 bg-white/5 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs uppercase tracking-[0.28em] text-slate-400">AI dashboard preview</span>
                </div>
              </div>
              <CardContent className="space-y-4 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="glass-soft rounded-2xl p-4">
                    <p className="text-sm text-slate-400">Best model</p>
                    <p className="mt-2 text-2xl font-semibold text-white">XGBoost</p>
                    <p className="mt-1 text-sm text-emerald-300">98.4% accuracy</p>
                  </div>
                  <div className="glass-soft rounded-2xl p-4">
                    <p className="text-sm text-slate-400">Optuna trials</p>
                    <p className="mt-2 text-2xl font-semibold text-white">5 completed</p>
                    <p className="mt-1 text-sm text-cyan-300">Best params locked</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Model uplift</span>
                    <span className="text-cyan-300">+7.2%</span>
                  </div>
                  <div className="mt-4 h-40 rounded-2xl bg-gradient-to-br from-cyan-400/10 via-indigo-400/10 to-fuchsia-400/10 p-4">
                    <div className="flex h-full items-end gap-3">
                      {[38, 48, 56, 69, 74, 87].map((height, index) => (
                        <motion.div
                          key={height}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: index * 0.08, duration: 0.5 }}
                          className="flex-1 rounded-t-2xl bg-gradient-to-t from-cyan-400 to-fuchsia-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="space-y-8 py-10">
          <SectionHeader
            eyebrow="Features"
            title="Everything a premium AI startup dashboard should feel like"
            description="Built as a polished mock product with a glassmorphism shell, responsive layout, and motion-first presentation."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {landingFeatures.map((feature, index) => {
              const Icon = iconMap[feature.icon as keyof typeof iconMap] ?? Sparkles;

              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
                  <Card className="h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow">
                    <CardContent className="space-y-4 p-0">
                      <div className="inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm leading-7 text-slate-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="space-y-8 py-10">
          <SectionHeader eyebrow="Workflow" title="How it works" description="A single-flow experience that feels like a real AutoML product from upload to report export." />
          <div className="grid gap-5 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <Card key={step.title} className="relative overflow-hidden">
                <div className="absolute right-4 top-4 text-4xl font-bold text-white/10">0{index + 1}</div>
                <CardContent className="space-y-3 p-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Step {index + 1}</p>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="text-sm leading-7 text-slate-300">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-8 py-10">
          <SectionHeader eyebrow="Pricing" title="Flexible plans for demos, teams, and enterprise dashboards" />
          <div className="grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={plan.featured ? 'border-cyan-400/30 shadow-glow' : ''}>
                <CardContent className="space-y-5 p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                    </div>
                    {plan.featured ? <Badge>Popular</Badge> : null}
                  </div>
                  <p className="text-4xl font-semibold text-white">{plan.price}</p>
                  <ul className="space-y-3 text-sm text-slate-300">
                    {plan.features.map((feature) => <li key={feature}>• {feature}</li>)}
                  </ul>
                  <Button className="w-full" variant={plan.featured ? 'default' : 'outline'}>Choose plan</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 AutoML Control Room. Built as a frontend-only mock AI SaaS experience.</p>
          <div className="flex gap-4">
            <Link to="/upload" className="transition hover:text-white">Dashboard</Link>
            <Link to="/training" className="transition hover:text-white">Training</Link>
            <Link to="/reports" className="transition hover:text-white">Reports</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}