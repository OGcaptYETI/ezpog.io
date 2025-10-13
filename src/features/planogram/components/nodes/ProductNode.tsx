import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Package } from 'lucide-react';

export interface ProductNodeData {
  name: string;
  brand: string;
  imageUrl?: string;
  width: number;
  height: number;
  facings: number;
}

function ProductNode({ data, selected }: NodeProps) {
  const { name, brand, imageUrl, width, height, facings } = data as unknown as ProductNodeData;

  return (
    <div
      className={`bg-white rounded-lg border-2 shadow-md transition-all ${
        selected ? 'border-green-500 shadow-xl' : 'border-gray-300'
      }`}
      style={{
        width: `${width * facings}px`,
        height: `${height}px`,
      }}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="p-2 flex flex-col items-center justify-center h-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-16 object-contain mb-1"
          />
        ) : (
          <Package className="w-8 h-8 text-gray-400 mb-1" />
        )}
        
        <div className="text-xs font-semibold text-center truncate w-full">
          {name}
        </div>
        <div className="text-xs text-gray-500 truncate w-full text-center">
          {brand}
        </div>
        
        {facings > 1 && (
          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1">
            {facings}x
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}

export default memo(ProductNode);
