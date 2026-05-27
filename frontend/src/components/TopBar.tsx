import { Bell, Menu, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TopBarProps = {
  onMenuToggle: () => void;
};

export function TopBar({ onMenuToggle }: TopBarProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={onMenuToggle} aria-label="Open navigation">
          <Menu size={18} />
        </Button>

        <div className="hidden flex-1 items-center gap-3 md:flex">
          <div className="relative max-w-md flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search models, trials, metrics..." className="pl-10" />
          </div>
          <Link to="/upload" className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 xl:inline-flex">
            Import dataset
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Notifications">
                <Bell size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Training logs are updating in the background.</TooltipContent>
          </Tooltip>
          <ThemeToggle />
          <Link to="/" className="hidden rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 md:inline-flex">
            Landing
          </Link>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            {location.pathname.replace('/', '').replace('-', ' ').toUpperCase() || 'DASHBOARD'}
          </span>
        </div>
      </div>
    </header>
  );
}