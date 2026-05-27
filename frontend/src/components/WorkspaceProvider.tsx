import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { UploadResponse } from '@/services/automlApi';

type ActiveDataset = {
  fileName: string;
  uploadedAt: string;
  upload: UploadResponse;
};

type WorkspaceContextValue = {
  activeDataset: ActiveDataset | null;
  setActiveDataset: (dataset: ActiveDataset) => void;
  clearActiveDataset: () => void;
};

const STORAGE_KEY = 'automl-active-dataset';
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readStoredDataset() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ActiveDataset;
  } catch {
    return null;
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeDataset, setActiveDatasetState] = useState<ActiveDataset | null>(() => readStoredDataset());

  useEffect(() => {
    if (!activeDataset) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activeDataset));
  }, [activeDataset]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      activeDataset,
      setActiveDataset: (dataset: ActiveDataset) => setActiveDatasetState(dataset),
      clearActiveDataset: () => setActiveDatasetState(null),
    }),
    [activeDataset],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }

  return context;
}