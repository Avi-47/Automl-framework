import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WorkspaceProvider } from '@/components/WorkspaceProvider';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LandingPage } from '@/pages/LandingPage';
import { UploadDatasetPage } from '@/pages/UploadDatasetPage';
import { TrainingDashboardPage } from '@/pages/TrainingDashboardPage';
import { VisualizationDashboardPage } from '@/pages/VisualizationDashboardPage';
import { PredictionPage } from '@/pages/PredictionPage';
import { ReportsPage } from '@/pages/ReportsPage';

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={100}>
        <ToastProvider>
          <WorkspaceProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route element={<DashboardLayout />}>
                <Route path="/upload" element={<UploadDatasetPage />} />
                <Route path="/training" element={<TrainingDashboardPage />} />
                <Route path="/visualizations" element={<VisualizationDashboardPage />} />
                <Route path="/predictions" element={<PredictionPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
            </Routes>
          </WorkspaceProvider>
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}