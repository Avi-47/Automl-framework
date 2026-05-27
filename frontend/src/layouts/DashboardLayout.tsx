import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/components/WorkspaceProvider';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { activeDataset, clearActiveDataset } = useWorkspace();

  return (
    <div className="min-h-screen bg-grid">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-80">
        <TopBar onMenuToggle={() => setMobileOpen((current) => !current)} />
        <main className="px-4 py-6 md:px-6 lg:px-8">
          {activeDataset ? (
            <div className="mb-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 md:flex md:items-center md:justify-between md:gap-4">
              <div className="space-y-1">
                <p className="font-semibold">Active uploaded dataset: {activeDataset.fileName}</p>
                <p className="text-emerald-100/80">
                  Experiment {activeDataset.upload.experiment_id} · {activeDataset.upload.row_count.toLocaleString()} rows · {activeDataset.upload.column_count} columns · {activeDataset.upload.task_type}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-0">
                <Badge variant="success">Persisted across tabs</Badge>
                <Button variant="outline" size="sm" onClick={clearActiveDataset} className="border-emerald-400/30 bg-transparent text-emerald-50 hover:bg-emerald-400/10">
                  Clear active dataset
                </Button>
              </div>
            </div>
          ) : null}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}