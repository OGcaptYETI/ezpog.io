import { useState, useEffect } from 'react';
import { MapPin, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import type { GeoHierarchyConfig } from '@/types';

interface GeoHierarchySettingsProps {
  currentConfig?: GeoHierarchyConfig;
  onSave: (config: GeoHierarchyConfig) => Promise<void>;
}

const DEFAULT_CONFIG: GeoHierarchyConfig = {
  level1Label: 'Region',
  level2Label: 'District',
  level3Label: 'Market Area',
  level4Label: 'Territory',
};

const PRESET_CONFIGS = [
  {
    name: 'Default (Region → District)',
    config: DEFAULT_CONFIG,
  },
  {
    name: 'Area → Region → Division → Territory',
    config: {
      level1Label: 'Area',
      level2Label: 'Region',
      level3Label: 'Division',
      level4Label: 'Territory',
    },
  },
  {
    name: 'Division → Region → District → Zone',
    config: {
      level1Label: 'Division',
      level2Label: 'Region',
      level3Label: 'District',
      level4Label: 'Zone',
    },
  },
  {
    name: 'Market → Territory → District → Store Group',
    config: {
      level1Label: 'Market',
      level2Label: 'Territory',
      level3Label: 'District',
      level4Label: 'Store Group',
    },
  },
];

export function GeoHierarchySettings({ currentConfig, onSave }: GeoHierarchySettingsProps) {
  const { showToast } = useToast();
  const [config, setConfig] = useState<GeoHierarchyConfig>(currentConfig || DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
    }
  }, [currentConfig]);

  const handleSave = async () => {
    // Validate all labels are filled
    if (!config.level1Label || !config.level2Label || !config.level3Label || !config.level4Label) {
      showToast('All hierarchy levels must have labels', 'error');
      return;
    }

    setSaving(true);
    try {
      await onSave(config);
      showToast('Geographic hierarchy updated successfully', 'success');
    } catch (error) {
      console.error('Error saving geo hierarchy:', error);
      showToast('Failed to update geographic hierarchy', 'error');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: GeoHierarchyConfig) => {
    setConfig(preset);
  };

  const resetToDefault = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Geographic Hierarchy</h2>
          <p className="text-sm text-gray-600">
            Customize the geographic territory labels for your organization
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>How it works:</strong> Define your company's geographic structure from largest to smallest.
          These labels will be used throughout the app for projects, stores, and reporting.
        </p>
        <p className="text-sm text-blue-900 mt-2">
          <strong>Example:</strong> Area → Region → Division → Territory
        </p>
      </div>

      {/* Preset Templates */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Quick Templates
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_CONFIGS.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset.config)}
              className="text-left p-3 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{preset.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {preset.config.level1Label} → {preset.config.level2Label} → {preset.config.level3Label} → {preset.config.level4Label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Configuration */}
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-900">
          Custom Hierarchy (Largest → Smallest)
        </label>

        {/* Level 1 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex-shrink-0">
            1
          </div>
          <input
            type="text"
            value={config.level1Label}
            onChange={(e) => setConfig({ ...config, level1Label: e.target.value })}
            placeholder="e.g., Region, Area, Division"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="text-gray-400 text-sm">(Largest)</span>
        </div>

        {/* Level 2 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex-shrink-0">
            2
          </div>
          <input
            type="text"
            value={config.level2Label}
            onChange={(e) => setConfig({ ...config, level2Label: e.target.value })}
            placeholder="e.g., District, Region, Market"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Level 3 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex-shrink-0">
            3
          </div>
          <input
            type="text"
            value={config.level3Label}
            onChange={(e) => setConfig({ ...config, level3Label: e.target.value })}
            placeholder="e.g., Market Area, Division, Zone"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Level 4 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex-shrink-0">
            4
          </div>
          <input
            type="text"
            value={config.level4Label}
            onChange={(e) => setConfig({ ...config, level4Label: e.target.value })}
            placeholder="e.g., Territory, Store Group, Cluster"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="text-gray-400 text-sm">(Smallest)</span>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Preview Hierarchy:</h4>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-medium">{config.level1Label || '(Level 1)'}</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium">{config.level2Label || '(Level 2)'}</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium">{config.level3Label || '(Level 3)'}</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium">{config.level4Label || '(Level 4)'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button onClick={resetToDefault} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
