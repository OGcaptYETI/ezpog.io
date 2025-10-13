import { createContext, useContext } from 'react';

interface PlanogramContextType {
  // Placeholder property to satisfy TypeScript
  // TODO: Replace with actual state management properties
  _placeholder?: never;
}

const PlanogramContext = createContext<PlanogramContextType | undefined>(undefined);

export function usePlanogram() {
  const context = useContext(PlanogramContext);
  if (context === undefined) {
    throw new Error('usePlanogram must be used within a PlanogramProvider');
  }
  return context;
}

export { PlanogramContext };
