import { LayoutDashboard, Upload, Sparkles, ChartNoAxesCombined, Brain, FileText, PanelLeftClose } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { navItems } from '@/data/mockMlData';
import { cn } from '@/utils/cn';

const iconMap = {
  Upload,
  Sparkles,
  ChartNoAxesCombined,
  Brain,
  FileText,
};

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          'glass fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-white/10 p-5 transition-transform duration-300 lg:translate-x-0 lg:rounded-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">AutoML</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Control Room</h1>
          </div>
          <Badge variant="success">Live</Badge>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Pipeline status</span>
            <span className="text-emerald-300">98%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" />
          </div>
          <p className="mt-3 text-xs text-slate-400">XGBoost tuned, report ready, predictions available.</p>
        </div>

        <nav className="mt-6 flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-white/10',
                    isActive ? 'bg-white/10 text-white shadow-glow' : 'text-slate-300',
                  )
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-fuchsia-400/10 p-4">
          <p className="text-sm font-semibold text-white">Model ready for export</p>
          <p className="mt-2 text-sm text-slate-300">Artifacts, metrics, and predictions are all available in the reports panel.</p>
          <Button className="mt-4 w-full" variant="glass" onClick={onClose}>
            <PanelLeftClose size={16} />
            Collapse
          </Button>
        </div>
      </aside>

      {mobileOpen ? <button type="button" aria-label="Close sidebar" className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={onClose} /> : null}
    </>
  );
}