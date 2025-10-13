import { useState, useEffect } from 'react';
import {
  PlanogramData,
  getPlanogram,
  getPlanogramsByOrganization,
  createPlanogram,
  updatePlanogram,
  updatePlanogramCanvas,
  deletePlanogram,
} from '@/services/firestore/planograms';

/**
 * Hook for managing planogram Firestore operations
 */
export function usePlanogramFirestore(planogramId?: string) {
  const [planogram, setPlanogram] = useState<PlanogramData | null>(null);
  const [planograms, setPlanograms] = useState<PlanogramData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load single planogram
  useEffect(() => {
    if (planogramId) {
      loadPlanogram(planogramId);
    }
  }, [planogramId]);

  const loadPlanogram = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlanogram(id);
      setPlanogram(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading planogram:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanogramsByOrganization = async (organizationId: string, status?: PlanogramData['status']) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlanogramsByOrganization(organizationId, status);
      setPlanograms(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading planograms:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePlanogram = async (data: Omit<PlanogramData, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const id = await createPlanogram(data);
      return id;
    } catch (err) {
      setError(err as Error);
      console.error('Error creating planogram:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlanogramData = async (id: string, data: Partial<PlanogramData>) => {
    setLoading(true);
    setError(null);
    try {
      await updatePlanogram(id, data);
      await loadPlanogram(id);
    } catch (err) {
      setError(err as Error);
      console.error('Error updating planogram:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveCanvas = async (
    id: string,
    canvasData: PlanogramData['canvasData'],
    fixtures: PlanogramData['fixtures'],
    products: PlanogramData['products']
  ) => {
    setLoading(true);
    setError(null);
    try {
      await updatePlanogramCanvas(id, canvasData, fixtures, products);
    } catch (err) {
      setError(err as Error);
      console.error('Error saving canvas:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePlanogram = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletePlanogram(id);
      setPlanogram(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting planogram:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    planogram,
    planograms,
    loading,
    error,
    loadPlanogram,
    loadPlanogramsByOrganization,
    savePlanogram,
    updatePlanogramData,
    saveCanvas,
    removePlanogram,
  };
}
