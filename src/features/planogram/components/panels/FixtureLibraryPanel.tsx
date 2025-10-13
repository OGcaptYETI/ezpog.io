import { useState } from 'react';
import { Search, Box, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { Fixture } from '@/types/planogram';

interface FixtureLibraryPanelProps {
  fixtures: Fixture[];
  onFixtureSelect?: (fixture: Fixture) => void;
  onCreateNew?: () => void;
}

export default function FixtureLibraryPanel({ 
  fixtures, 
  onFixtureSelect,
  onCreateNew 
}: FixtureLibraryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFixtures = fixtures.filter(fixture =>
    fixture.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Box className="w-5 h-5" />
          Fixture Library
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search fixtures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Create New Button */}
        <Button onClick={onCreateNew} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create New Fixture
        </Button>
      </div>

      {/* Fixture List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs text-gray-500 mb-3">
          {filteredFixtures.length} fixtures • Click to add to canvas
        </div>

        <div className="space-y-3">
          {filteredFixtures.map(fixture => (
            <div
              key={fixture.id}
              onClick={() => onFixtureSelect?.(fixture)}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-sm">{fixture.name}</div>
                <Box className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <div>{fixture.sections.length} Section{fixture.sections.length !== 1 ? 's' : ''}</div>
                <div>
                  {fixture.sections.reduce((sum, s) => sum + s.rows.length, 0)} Total Shelves
                </div>
                <div className="flex gap-2 mt-2">
                  {fixture.sections.map((section) => (
                    <div
                      key={section.id}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      {section.width}" × {section.height}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFixtures.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">No fixtures found</p>
            <Button onClick={onCreateNew} size="sm" variant="outline">
              Create Your First Fixture
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
