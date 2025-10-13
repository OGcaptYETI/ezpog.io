import type { ReactNode } from 'react';
import { PlanogramContext } from './usePlanogramHook';

interface PlanogramProviderProps {
  children: ReactNode;
}

export function PlanogramProvider({ children }: PlanogramProviderProps) {
  // Add planogram state management here
  const value = {};

  return (
    <PlanogramContext.Provider value={value}>
      {children}
    </PlanogramContext.Provider>
  );
}
