import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { getOrganization } from '@/services/firestore/organizations';
import type { GeoHierarchyConfig } from '@/types';

// Default labels if organization hasn't customized
const DEFAULT_GEO_LABELS: GeoHierarchyConfig = {
  level1Label: 'Region',
  level2Label: 'District',
  level3Label: 'Market Area',
  level4Label: 'Territory',
};

export function useGeoLabels() {
  const { user } = useAuth();
  const [geoLabels, setGeoLabels] = useState<GeoHierarchyConfig>(DEFAULT_GEO_LABELS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGeoLabels();
  }, [user?.organizationId]);

  const loadGeoLabels = async () => {
    if (!user?.organizationId) {
      setGeoLabels(DEFAULT_GEO_LABELS);
      setLoading(false);
      return;
    }

    try {
      const org = await getOrganization(user.organizationId);
      if (org?.settings?.geoHierarchy) {
        setGeoLabels(org.settings.geoHierarchy);
      } else {
        setGeoLabels(DEFAULT_GEO_LABELS);
      }
    } catch (error) {
      console.error('Error loading geo labels:', error);
      setGeoLabels(DEFAULT_GEO_LABELS);
    } finally {
      setLoading(false);
    }
  };

  return {
    geoLabels,
    loading,
    // Helper to get a specific level
    getLabel: (level: 1 | 2 | 3 | 4) => {
      const key = `level${level}Label` as keyof GeoHierarchyConfig;
      return geoLabels[key];
    },
  };
}
