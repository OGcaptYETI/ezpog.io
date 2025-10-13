import { useState, useCallback } from 'react';
import { ReactFlow, Background, BackgroundVariant, Controls, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import FixtureLibraryPanel from './panels/FixtureLibraryPanel';
import ProductLibraryPanel from './panels/ProductLibraryPanel';
import FixtureNodeV2 from './nodes/FixtureNodeV2';
import type { Fixture, Section, PlacedComponent, Product } from '@/types/planogram';
import { snapToGrid, snapToShelf, checkOverlap, isWithinBounds, snapToAdjacentProduct } from '../utils/snapHelpers';

// Mock data for demo
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola 12oz',
    brand: 'Coca-Cola',
    category: 'Beverages',
    imageUrl: '',
    dimensions: { width: 2.5, height: 5, depth: 2.5 },
  },
  {
    id: '2',
    name: 'Pepsi 12oz',
    brand: 'PepsiCo',
    category: 'Beverages',
    imageUrl: '',
    dimensions: { width: 2.5, height: 5, depth: 2.5 },
  },
  {
    id: '3',
    name: "Lay's Chips",
    brand: "Lay's",
    category: 'Snacks',
    imageUrl: '',
    dimensions: { width: 8, height: 12, depth: 3 },
  },
  {
    id: '4',
    name: 'Doritos',
    brand: 'Frito-Lay',
    category: 'Snacks',
    imageUrl: '',
    dimensions: { width: 8, height: 12, depth: 3 },
  },
];

const mockFixtures: Fixture[] = [
  {
    id: 'f1',
    name: '4-Shelf Gondola',
    sections: [
      {
        id: 's1',
        name: 'Main Section',
        width: 48,
        height: 72,
        headerHeight: 6,
        rowOffset: 2,
        rows: [
          { id: 'r1', height: 14 },
          { id: 'r2', height: 14 },
          { id: 'r3', height: 14 },
          { id: 'r4', height: 14 },
        ],
        components: [],
      },
    ],
  },
  {
    id: 'f2',
    name: '3-Shelf Endcap',
    sections: [
      {
        id: 's2',
        name: 'Endcap Section',
        width: 36,
        height: 60,
        headerHeight: 6,
        rowOffset: 2,
        rows: [
          { id: 'r1', height: 16 },
          { id: 'r2', height: 16 },
          { id: 'r3', height: 16 },
        ],
        components: [],
      },
    ],
  },
];

const nodeTypes = {
  fixture: FixtureNodeV2,
};

interface PlanogramDesignerProps {
  onBackToDashboard?: () => void;
}

export default function PlanogramDesigner({ onBackToDashboard }: PlanogramDesignerProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeId, setNodeId] = useState(1);
  const [activePanel, setActivePanel] = useState<'fixtures' | 'products'>('fixtures');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds) as Edge[]);
    },
    []
  );

  const handleFixtureSelect = (fixture: Fixture) => {
    // Add fixture to canvas
    fixture.sections.forEach((section, index) => {
      const currentNodeId = `fixture-${nodeId + index}`;
      const newNode = {
        id: currentNodeId,
        type: 'fixture',
        position: { x: 100 + index * 500, y: 100 },
        data: {
          name: section.name,
          section: section,
          onProductDrop: (product: PlacedComponent) => {
            handleProductDrop(currentNodeId, product, section);
          },
          onProductMove: (productId: string, x: number, y: number) => {
            handleProductMove(currentNodeId, productId, x, y);
          },
          onSectionNameChange: (newName: string) => {
            handleSectionNameChange(currentNodeId, newName);
          },
        },
      };
      setNodes((nds) => [...nds, newNode]);
    });
    setNodeId((id) => id + fixture.sections.length);
  };

  const handleProductDrop = (nodeId: string, product: PlacedComponent, section: Section) => {
    // Apply snapping logic only if snap is enabled
    let snappedX = snapEnabled ? snapToGrid(product.x) : product.x;
    const { y: snappedY, rowIndex } = snapEnabled 
      ? snapToShelf(
          product.y,
          product.dimensions.height,
          section.rows,
          section.headerHeight,
          section.rowOffset
        )
      : { y: product.y, rowIndex: 0 };
    
    // Apply snap-to-adjacent-product if snap is enabled
    if (snapEnabled) {
      snappedX = snapToAdjacentProduct(
        snappedX,
        snappedY,
        product.dimensions.width,
        product.dimensions.height,
        product.facings,
        section.components
      );
    }

    // Check if within bounds
    if (!isWithinBounds(
      snappedX,
      snappedY,
      product.dimensions.width,
      product.dimensions.height,
      product.facings,
      section.width,
      section.height,
      section.headerHeight,
      section.rowOffset
    )) {
      alert('Product does not fit within fixture bounds!');
      return;
    }

    // Check for overlap
    if (checkOverlap(
      snappedX,
      snappedY,
      product.dimensions.width,
      product.dimensions.height,
      product.facings,
      section.components
    )) {
      alert('Product overlaps with existing items!');
      return;
    }

    // Add product to section with unique ID
    const updatedProduct: PlacedComponent = {
      ...product,
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: snappedX,
      y: snappedY,
      rowIndex,
    };

    // Update node data - APPEND to existing components
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => {
        if (node.id === nodeId) {
          const currentSection = node.data.section as Section;
          const updatedSection = {
            ...currentSection,
            components: [...currentSection.components, updatedProduct], // APPEND, don't replace
          };
          return {
            ...node,
            data: {
              ...node.data,
              section: updatedSection,
              onProductDrop: node.data.onProductDrop,
              onProductMove: node.data.onProductMove,
              onSectionNameChange: node.data.onSectionNameChange,
            },
          };
        }
        return node;
      })
    );
  };

  const handleProductMove = (nodeId: string, productId: string, x: number, y: number) => {
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => {
        if (node.id === nodeId) {
          const section = node.data.section as Section;
          const movingProduct = section.components.find(c => c.id === productId);
          
          if (!movingProduct) return node;
          
          // Apply snapping only if enabled
          let snappedX = snapEnabled ? snapToGrid(x) : x;
          const { y: snappedY, rowIndex } = snapEnabled
            ? snapToShelf(
                y,
                movingProduct.dimensions.height,
                section.rows,
                section.headerHeight,
                section.rowOffset
              )
            : { y, rowIndex: 0 };
          
          // Apply snap-to-adjacent-product if snap is enabled
          if (snapEnabled) {
            snappedX = snapToAdjacentProduct(
              snappedX,
              snappedY,
              movingProduct.dimensions.width,
              movingProduct.dimensions.height,
              movingProduct.facings,
              section.components,
              20, // snap threshold in pixels
              productId // exclude self from snapping
            );
          }

          const updatedComponents = section.components.map(comp =>
            comp.id === productId
              ? { ...comp, x: snappedX, y: snappedY, rowIndex }
              : comp
          );

          return {
            ...node,
            data: {
              ...node.data,
              section: {
                ...section,
                components: updatedComponents,
              },
              onProductDrop: node.data.onProductDrop,
              onProductMove: node.data.onProductMove,
              onSectionNameChange: node.data.onSectionNameChange,
            },
          };
        }
        return node;
      })
    );
  };

  const handleSectionNameChange = (nodeId: string, newName: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              name: newName,
            },
          };
        }
        return node;
      })
    );
  };

  const clearCanvas = () => {
    if (confirm('Clear all fixtures?')) {
      setNodes([]);
      setEdges([]);
    }
  };

  const savePlanogram = () => {
    const planogramData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    console.log('Saving planogram:', planogramData);
    alert('Planogram saved! (Check console for data)');
  };

  return (
    <div className="w-full h-screen flex">
      {/* Collapsible Sidebar */}
      <div 
        className={`bg-white border-r transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-0' : 'w-80'
        } overflow-hidden`}
        style={{ minWidth: sidebarCollapsed ? '0' : '320px' }}
      >
        {/* Library Panel Content */}
        <div className="flex-1 overflow-hidden">
          {activePanel === 'fixtures' ? (
            <FixtureLibraryPanel
              fixtures={mockFixtures}
              onFixtureSelect={handleFixtureSelect}
              onCreateNew={() => alert('Create fixture modal coming soon!')}
            />
          ) : (
            <ProductLibraryPanel
              products={mockProducts}
            />
          )}
        </div>
        
        {/* Back to Dashboard Button */}
        {onBackToDashboard && (
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={onBackToDashboard}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm flex-nowrap overflow-x-auto">
          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            {sidebarCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>

          <h2 className="text-lg font-semibold whitespace-nowrap flex-shrink-0">Planogram Designer</h2>

          <div className="h-6 w-px bg-gray-300 flex-shrink-0" />

          {/* Panel Tabs */}
          {!sidebarCollapsed && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                className={`px-3 py-1 text-sm rounded border whitespace-nowrap ${
                  activePanel === 'fixtures'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setActivePanel('fixtures')}
              >
                Fixtures
              </button>
              <button
                className={`px-3 py-1 text-sm rounded border whitespace-nowrap ${
                  activePanel === 'products'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setActivePanel('products')}
              >
                Products
              </button>
            </div>
          )}

          <div className="flex-1 min-w-[20px]" />

          {/* Snap Toggle */}
          <button
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`px-3 py-1 text-sm rounded border flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
              snapEnabled
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-gray-50 text-gray-700 border-gray-300'
            }`}
            title="Toggle grid and shelf snapping"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden sm:inline">Snap: {snapEnabled ? 'ON' : 'OFF'}</span>
            <span className="sm:hidden">{snapEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={savePlanogram} 
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
            >
              Save
            </button>

            <button 
              onClick={() => alert('Export feature coming soon!')} 
              className="px-3 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              Export
            </button>

            <button 
              onClick={clearCanvas} 
              className="px-3 py-1 text-sm rounded border border-red-300 bg-white text-red-700 hover:bg-red-50 whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={true}
            nodesConnectable={false}
            nodesFocusable={true}
            panOnDrag={true}
            panOnScroll={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            selectNodesOnDrag={false}
            className="bg-gray-50"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={() => '#3b82f6'}
              className="bg-white border border-gray-300"
            />
          </ReactFlow>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-t px-4 py-2 flex items-center gap-6 text-sm text-gray-600">
          <div>
            <span className="font-semibold">{nodes.length}</span> Fixtures
          </div>
          <div>
            <span className="font-semibold">
              {nodes.reduce((sum, n) => {
                const section = (n.data as { section?: Section }).section;
                return sum + (section?.components?.length || 0);
              }, 0)}
            </span>{' '}
            Products Placed
          </div>
          <div className="flex-1" />
          <div className="text-xs text-gray-400">
            💡 Click fixture from library • Drag products onto shelves • Scroll to zoom
          </div>
        </div>
      </div>
    </div>
  );
}
