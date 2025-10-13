import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import FixtureNode from './nodes/FixtureNode';
import ProductNode from './nodes/ProductNode';
import { Button } from '@/shared/components/ui/button';
import { Plus, Save, Download, Trash2 } from 'lucide-react';

const nodeTypes = {
  fixture: FixtureNode,
  product: ProductNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'fixture',
    position: { x: 100, y: 100 },
    data: {
      label: '4-Shelf Gondola',
      width: 200,
      height: 300,
      shelves: 4,
      color: '#3b82f6',
    },
  },
  {
    id: '2',
    type: 'fixture',
    position: { x: 400, y: 100 },
    data: {
      label: 'Endcap Display',
      width: 180,
      height: 250,
      shelves: 3,
      color: '#10b981',
    },
  },
  {
    id: '3',
    type: 'product',
    position: { x: 120, y: 450 },
    data: {
      name: 'Cola 12oz',
      brand: 'Coca-Cola',
      width: 60,
      height: 80,
      facings: 3,
    },
  },
  {
    id: '4',
    type: 'product',
    position: { x: 300, y: 450 },
    data: {
      name: 'Chips',
      brand: "Lay's",
      width: 70,
      height: 90,
      facings: 2,
    },
  },
];

const initialEdges: Edge[] = [];

export default function PlanogramCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(5);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addFixture = () => {
    const newNode: Node = {
      id: `${nodeId}`,
      type: 'fixture',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 },
      data: {
        label: `Fixture ${nodeId}`,
        width: 200,
        height: 280,
        shelves: 4,
        color: '#8b5cf6',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  };

  const addProduct = () => {
    const newNode: Node = {
      id: `${nodeId}`,
      type: 'product',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 400 },
      data: {
        name: `Product ${nodeId}`,
        brand: 'Brand Name',
        width: 60,
        height: 80,
        facings: 1,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  };

  const clearCanvas = () => {
    if (confirm('Clear all fixtures and products?')) {
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
    <div className="w-full h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <h2 className="text-lg font-semibold mr-4">Planogram Designer</h2>
        
        <Button onClick={addFixture} size="sm" variant="default">
          <Plus className="w-4 h-4 mr-1" />
          Add Fixture
        </Button>
        
        <Button onClick={addProduct} size="sm" variant="secondary">
          <Plus className="w-4 h-4 mr-1" />
          Add Product
        </Button>

        <div className="flex-1" />

        <Button onClick={savePlanogram} size="sm" variant="default">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>

        <Button onClick={() => alert('Export feature coming soon!')} size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>

        <Button onClick={clearCanvas} size="sm" variant="destructive">
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
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
          className="bg-gray-50"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'fixture') return '#3b82f6';
              if (node.type === 'product') return '#10b981';
              return '#gray';
            }}
            className="bg-white border border-gray-300"
          />
        </ReactFlow>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-t px-4 py-2 flex items-center gap-6 text-sm text-gray-600">
        <div>
          <span className="font-semibold">{nodes.filter(n => n.type === 'fixture').length}</span> Fixtures
        </div>
        <div>
          <span className="font-semibold">{nodes.filter(n => n.type === 'product').length}</span> Products
        </div>
        <div>
          <span className="font-semibold">{edges.length}</span> Connections
        </div>
        <div className="flex-1" />
        <div className="text-xs text-gray-400">
          💡 Drag items to move • Click to select • Scroll to zoom
        </div>
      </div>
    </div>
  );
}
