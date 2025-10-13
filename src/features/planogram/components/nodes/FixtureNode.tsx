import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export interface FixtureNodeData {
  label: string;
  width: number;
  height: number;
  shelves: number;
  color?: string;
}

function FixtureNode({ data, selected }: NodeProps) {
  const { label, width, height, shelves, color = '#3b82f6' } = data as unknown as FixtureNodeData;

  return (
    <div
      className={`bg-white rounded-lg border-2 shadow-lg transition-all ${
        selected ? 'border-blue-500 shadow-xl' : 'border-gray-300'
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Handle for connecting */}
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      {/* Fixture Header */}
      <div
        className="px-3 py-2 rounded-t-lg text-white font-semibold text-sm"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>

      {/* Shelves */}
      <div className="p-2 space-y-1">
        {Array.from({ length: shelves }).map((_, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded bg-gray-50 p-2 text-xs text-gray-500 text-center hover:bg-gray-100 transition-colors"
          >
            Shelf {index + 1}
          </div>
        ))}
      </div>

      {/* Dimensions Label */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-400 bg-white px-1 rounded">
        {width}×{height}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default memo(FixtureNode);
