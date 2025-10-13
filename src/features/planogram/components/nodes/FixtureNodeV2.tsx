import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { INCH_TO_PIXEL } from '@/types/planogram';
import type { Section, PlacedComponent } from '@/types/planogram';
import { Pencil } from 'lucide-react';

export interface FixtureNodeData {
  name: string;
  section: Section;
  onProductDrop?: (product: PlacedComponent) => void;
  onProductMove?: (productId: string, x: number, y: number) => void;
  onSectionNameChange?: (newName: string) => void;
}

function FixtureNodeV2({ data, selected }: NodeProps) {
  const fixtureData = data as unknown as FixtureNodeData;
  const { name, section } = fixtureData;
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const sectionWidthPx = section.width * INCH_TO_PIXEL;
  const sectionHeightPx = section.height * INCH_TO_PIXEL;
  const headerHeightPx = section.headerHeight * INCH_TO_PIXEL;
  const rowOffsetPx = section.rowOffset * INCH_TO_PIXEL;

  // Calculate total content height
  const contentHeight = sectionHeightPx - headerHeightPx - rowOffsetPx;

  // Calculate row positions RELATIVE TO CONTENT AREA (not whole fixture)
  // Content area starts at 0 since it's already offset by header + rowOffset
  let currentY = 0;
  const rowPositions = section.rows.map((row) => {
    const rowHeight = row.height * INCH_TO_PIXEL;
    const y = currentY;
    currentY += rowHeight;
    return { y, height: rowHeight };
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only show drop zone if dragging from product library (not moving existing products)
    if (!draggedProduct) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    // Check if actually leaving the fixture
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    // Get product data from drag event
    const productData = e.dataTransfer.getData('application/json');
    if (productData && fixtureData.onProductDrop) {
      const product = JSON.parse(productData);
      
      // Get the content area element for accurate positioning
      const contentElement = e.currentTarget.querySelector('[data-fixture-content]') as HTMLElement;
      if (!contentElement) return;
      
      const contentRect = contentElement.getBoundingClientRect();
      
      // Calculate drop position relative to the content area (where products are rendered)
      // Center the product on the cursor
      const productWidthPx = product.dimensions.width * INCH_TO_PIXEL;
      const productHeightPx = product.dimensions.height * INCH_TO_PIXEL;
      
      const x = e.clientX - contentRect.left - (productWidthPx / 2);
      const y = e.clientY - contentRect.top - (productHeightPx / 2);
      
      fixtureData.onProductDrop({
        ...product,
        x,
        y,
        rowIndex: 0, // Will be calculated by snap helper
      });
    }
  };

  const handleProductDragStart = (e: React.MouseEvent, productId: string, currentX: number, currentY: number) => {
    // CRITICAL: Stop propagation to prevent React Flow from dragging the fixture
    e.stopPropagation();
    e.preventDefault();
    
    // Get the content area to calculate relative position
    const productElement = e.currentTarget as HTMLElement;
    const contentElement = document.querySelector('[data-fixture-content]') as HTMLElement;
    
    if (!contentElement) return;
    
    const contentRect = contentElement.getBoundingClientRect();
    
    // Calculate where we clicked WITHIN the content area
    const clickX = e.clientX - contentRect.left;
    const clickY = e.clientY - contentRect.top;
    
    // Offset is: where we clicked - where product currently is
    setDragOffset({
      x: clickX - currentX,
      y: clickY - currentY,
    });
    
    setDraggedProduct(productId);
    
    // Disable React Flow dragging while we're dragging a product
    const fixtureNode = productElement.closest('.react-flow__node');
    if (fixtureNode) {
      fixtureNode.classList.add('nodrag');
    }
  };

  const handleContentMouseMove = (e: React.MouseEvent) => {
    if (!draggedProduct || e.buttons !== 1) return;
    e.stopPropagation();
    e.preventDefault();
    
    // Get mouse position relative to content area
    const contentRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate product's top-left position (mouse position - offset from product corner)
    const x = e.clientX - contentRect.left - dragOffset.x;
    const y = e.clientY - contentRect.top - dragOffset.y;
    
    if (fixtureData.onProductMove) {
      fixtureData.onProductMove(draggedProduct, x, y);
    }
  };

  const handleContentMouseUp = () => {
    if (draggedProduct) {
      setDraggedProduct(null);
      
      // Re-enable React Flow dragging
      const fixtureNode = document.querySelector('.react-flow__node.nodrag');
      if (fixtureNode) {
        fixtureNode.classList.remove('nodrag');
      }
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (fixtureData.onSectionNameChange && editedName.trim()) {
      fixtureData.onSectionNameChange(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditedName(name);
      setIsEditingName(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 shadow-lg transition-all ${
        selected ? 'border-blue-500 shadow-xl' : 'border-gray-300'
      } ${isDragOver ? 'border-green-500 bg-green-50' : ''}`}
      style={{
        width: `${sectionWidthPx}px`,
        height: `${sectionHeightPx}px`,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      {/* Fixture Header */}
      <div
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-t-lg flex items-center justify-between"
        style={{ height: `${headerHeightPx}px` }}
      >
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className="bg-white text-blue-900 px-2 py-1 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span>{name}</span>
            <button
              onClick={handleNameEdit}
              className="opacity-0 hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
        <span className="text-xs opacity-80">
          {section.width}" × {section.height}"
        </span>
      </div>

      {/* Row Offset Space */}
      {rowOffsetPx > 0 && (
        <div
          style={{ height: `${rowOffsetPx}px` }}
          className="bg-gray-50 border-b border-gray-200"
        />
      )}

      {/* Shelves/Rows */}
      <div 
        className="relative" 
        style={{ height: `${contentHeight}px` }}
        data-fixture-content
        onMouseMove={handleContentMouseMove}
        onMouseUp={handleContentMouseUp}
        onMouseLeave={handleContentMouseUp}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent ${INCH_TO_PIXEL - 1}px, #cbd5e0 ${INCH_TO_PIXEL - 1}px, #cbd5e0 ${INCH_TO_PIXEL}px),
              repeating-linear-gradient(90deg, transparent, transparent ${INCH_TO_PIXEL - 1}px, #cbd5e0 ${INCH_TO_PIXEL - 1}px, #cbd5e0 ${INCH_TO_PIXEL}px)
            `,
          }}
        />

        {/* Shelf Lines */}
        {rowPositions.map((row, index) => (
          <div
            key={index}
            className="absolute w-full border-b-2 border-gray-400"
            style={{
              top: `${row.y + row.height}px`,
            }}
          >
            <div className="absolute right-2 -top-5 text-xs text-gray-500 bg-white px-1 rounded">
              Shelf {index + 1} ({section.rows[index].height}")
            </div>
          </div>
        ))}

        {/* Placed Products */}
        {section.components.map((component) => (
          <div
            key={component.id}
            className={`nodrag absolute border-2 bg-blue-50 rounded shadow-sm hover:shadow-md transition-all cursor-move select-none ${
              draggedProduct === component.id 
                ? 'border-green-500 shadow-lg opacity-80' 
                : 'border-blue-400 hover:border-blue-600'
            }`}
            style={{
              left: `${component.x}px`,
              top: `${component.y}px`,
              width: `${component.dimensions.width * INCH_TO_PIXEL * component.facings}px`,
              height: `${component.dimensions.height * INCH_TO_PIXEL}px`,
              zIndex: draggedProduct === component.id ? 1000 : 1,
            }}
            onMouseDown={(e) => handleProductDragStart(e, component.id, component.x, component.y)}
          >
            {component.imageUrl ? (
              <img
                src={component.imageUrl}
                alt={component.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-1 text-xs">
                <div className="font-semibold truncate w-full text-center">
                  {component.name}
                </div>
                <div className="text-gray-500 truncate w-full text-center">
                  {component.brand}
                </div>
                {component.facings > 1 && (
                  <div className="text-blue-600 font-bold mt-1">
                    {component.facings}x
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Drop Zone Indicator */}
        {isDragOver && (
          <div className="absolute inset-0 border-4 border-dashed border-green-500 bg-green-100 bg-opacity-20 flex items-center justify-center">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
              Drop Product Here
            </div>
          </div>
        )}
      </div>

      {/* Dimensions Footer */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
        {section.rows.length} Shelves • {section.components.length} Products
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default memo(FixtureNodeV2);
