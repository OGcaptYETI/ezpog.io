# Planogram Canvas Technology Comparison

## Executive Summary

For EZPOG.io's planogram design module, you need to choose a canvas/rendering technology. This document compares the viable options for 2025.

---

## Quick Recommendation

**For MVP and Fast Development: React Flow (@xyflow/react)**
**For Maximum Control: Konva.js (modernized from existing code)**

---

## Option 1: React Flow / @xyflow/react ⭐ RECOMMENDED

### Overview
Modern library specifically designed for node-based layouts, diagrams, and spatial relationships.

### Pros
✅ **Modern Architecture** - Built for React, hooks-first  
✅ **Excellent TypeScript** - First-class TS support  
✅ **Built-in Features** - Minimap, controls, background grid, zoom/pan  
✅ **Performance** - Handles 1000+ nodes smoothly  
✅ **Active Development** - Regular updates, great community  
✅ **Great DX** - Intuitive API, excellent docs  
✅ **Customizable** - Custom nodes, edges, handles  
✅ **Accessibility** - Built-in keyboard navigation  
✅ **Plugin System** - Extensible architecture  

### Cons
❌ **Learning Curve** - Different mental model than traditional canvas  
❌ **Less Pixel Control** - Node-based, not pixel-perfect drawing  
❌ **Overkill for Simple** - May be too much for basic layouts  

### Best For
- **Relationship-based planograms** (fixtures connected to products)
- **Flow-based layouts** (product flow, category relationships)
- **Modular designs** (drag fixtures, auto-arrange products)
- **Collaborative editing** (built-in state management)

### Code Example
```typescript
import { ReactFlow, Node, Edge, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Define fixture as a node
const fixtureNode: Node = {
  id: 'fixture-1',
  type: 'fixture',
  position: { x: 100, y: 100 },
  data: {
    width: 48, // inches
    height: 72,
    shelves: 5,
    products: []
  }
};

// Custom fixture component
function FixtureNode({ data }) {
  return (
    <div className="fixture-node">
      <div className="fixture-header">{data.width}" x {data.height}"</div>
      {data.shelves.map((shelf, i) => (
        <ShelfRow key={i} shelf={shelf} />
      ))}
    </div>
  );
}

const nodeTypes = { fixture: FixtureNode };

function PlanogramCanvas() {
  const [nodes, setNodes] = useState([fixtureNode]);
  const [edges, setEdges] = useState([]);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
```

### Bundle Size
- Core: ~150KB (minified)
- With all plugins: ~200KB

### Learning Resources
- Official docs: https://reactflow.dev
- Examples: 50+ official examples
- Community: Very active Discord

---

## Option 2: Konva.js + React-Konva (Existing Code)

### Overview
Canvas library for 2D shapes and animations. Already implemented in PlanogramTool.

### Pros
✅ **Already Implemented** - Working code in PlanogramTool  
✅ **Pixel Perfect** - Exact control over rendering  
✅ **Performance** - Very fast, uses canvas API  
✅ **Flexible** - Can draw anything  
✅ **Good TypeScript** - Decent type definitions  
✅ **Mature** - Stable, well-tested  
✅ **Export** - Easy image/PDF export  

### Cons
❌ **More Boilerplate** - Manual event handling, state management  
❌ **Steeper Learning** - Canvas API knowledge needed  
❌ **Manual Everything** - Zoom, pan, selection all manual  
❌ **Migration Needed** - Code is in JS, needs TS conversion  
❌ **Less Modern** - Older patterns, not hooks-first  

### Best For
- **Precise layouts** - Exact measurements matter
- **Traditional planograms** - Grid-based, measured designs
- **Image export** - High-quality renders
- **Existing investment** - You already have working code

### Code Example (from existing PlanogramTool)
```javascript
import { Stage, Layer, Rect, Group } from 'react-konva';

function PlanogramCanvas({ fixture }) {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);
  
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.02;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setScale(newScale);
  };
  
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onWheel={handleWheel}
      scaleX={scale}
      scaleY={scale}
      ref={stageRef}
    >
      <Layer>
        <FixtureRenderer fixture={fixture} />
      </Layer>
    </Stage>
  );
}
```

### Bundle Size
- konva: ~200KB
- react-konva: ~20KB
- Total: ~220KB

### Migration Effort
- **Low** if keeping existing code
- **Medium** if converting to TypeScript
- **High** if refactoring architecture

---

## Option 3: Fabric.js + React

### Overview
Powerful canvas library with object model, similar to Konva but older.

### Pros
✅ **Very Mature** - 10+ years of development  
✅ **Rich Features** - Built-in shapes, filters, text  
✅ **Object Model** - Easy manipulation  
✅ **SVG Support** - Import/export SVG  
✅ **Large Community** - Lots of examples  

### Cons
❌ **React Integration** - Needs wrapper, not React-native  
❌ **Older API** - Pre-hooks patterns  
❌ **Bundle Size** - Larger than alternatives  
❌ **TypeScript** - Community types, not official  
❌ **Performance** - Slower than Konva for many objects  

### Best For
- **SVG workflows** - If you need SVG import/export
- **Rich text** - Advanced text rendering
- **Image manipulation** - Filters, effects

### Bundle Size
- ~300KB (larger than alternatives)

### Recommendation
⚠️ **Not recommended** - Konva is better for this use case

---

## Option 4: TldDraw

### Overview
Very modern, infinite canvas library with collaborative features.

### Pros
✅ **Cutting Edge** - Latest React patterns  
✅ **Beautiful UX** - Excellent user experience  
✅ **Collaborative** - Built-in multiplayer  
✅ **Infinite Canvas** - Zoom/pan out of box  
✅ **TypeScript First** - Excellent types  

### Cons
❌ **Opinionated** - Hard to customize deeply  
❌ **Newer** - Less proven, smaller community  
❌ **Bundle Size** - Larger (~400KB)  
❌ **Overkill** - More than needed for planograms  

### Best For
- **Collaborative design** - Multiple users editing
- **Whiteboard-style** - Freeform layouts
- **Modern UX** - Want cutting-edge feel

### Recommendation
⚠️ **Interesting but overkill** - Too much for planograms

---

## Option 5: HTML5 Canvas + Custom (DIY)

### Overview
Build your own using native Canvas API.

### Pros
✅ **Full Control** - No library constraints  
✅ **Lightweight** - No dependencies  
✅ **Custom** - Exactly what you need  

### Cons
❌ **Time Consuming** - Months of development  
❌ **Reinventing Wheel** - Zoom, pan, selection, etc.  
❌ **Maintenance** - You own all the bugs  
❌ **Not Recommended** - Use a library  

### Recommendation
❌ **Don't do this** - Use an existing library

---

## Decision Matrix

| Criteria | React Flow | Konva | Fabric | TldDraw | Custom |
|----------|-----------|-------|--------|---------|--------|
| **Development Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **TypeScript Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Pixel Precision** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Built-in Features** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| **Learning Curve** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Community/Docs** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | N/A |
| **Bundle Size** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintenance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **Existing Code** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐ |

---

## Use Case Analysis

### Scenario 1: Traditional Retail Planogram
**Requirements:**
- Precise measurements (inches/cm)
- Grid-based shelf layouts
- Product facings with exact dimensions
- Print-ready output

**Best Choice:** **Konva.js** ⭐
- Pixel-perfect control
- Easy export to images/PDF
- Existing code works well for this

### Scenario 2: Modern, Flexible Planogram
**Requirements:**
- Drag-and-drop fixtures
- Auto-arrange products
- Relationship visualization
- Collaborative editing

**Best Choice:** **React Flow** ⭐
- Modern UX patterns
- Built-in features
- Faster development

### Scenario 3: Hybrid Approach
**Requirements:**
- Both traditional and modern
- Flexibility to switch
- Future-proof

**Best Choice:** **React Flow with custom nodes** ⭐
- Start modern, can add precision later
- Easier to maintain
- Better for team collaboration

---

## Recommendation for EZPOG.io

### Phase 1 (MVP): React Flow
**Why:**
- Faster to market (2-3 weeks vs 6-8 weeks)
- Modern UX that users expect
- Built-in features reduce development
- Easier to hire developers familiar with it
- Better for future features (collaboration, AI suggestions)

**Implementation:**
```typescript
// Custom fixture node for React Flow
const FixtureNode = ({ data }) => {
  return (
    <div className="fixture-container">
      <Handle type="target" position={Position.Top} />
      
      <div className="fixture-body">
        <div className="fixture-dimensions">
          {data.width}" × {data.height}"
        </div>
        
        {data.shelves.map((shelf, idx) => (
          <Shelf
            key={idx}
            shelf={shelf}
            onProductDrop={handleProductDrop}
          />
        ))}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
```

### Phase 2 (Enhancement): Add Konva for Precision
**Why:**
- Some customers need exact measurements
- Export high-quality images
- Compliance documentation

**Implementation:**
- Use React Flow for editing
- Use Konva for export/rendering
- Best of both worlds

---

## Migration Path from Existing Konva Code

If you choose React Flow but want to preserve existing work:

### Step 1: Extract Business Logic
```typescript
// Extract fixture calculations (reusable)
export function calculateShelfPositions(fixture) {
  // This logic works regardless of rendering library
  const shelves = [];
  const spacing = fixture.height / fixture.shelfCount;
  
  for (let i = 0; i < fixture.shelfCount; i++) {
    shelves.push({
      y: i * spacing,
      products: []
    });
  }
  
  return shelves;
}
```

### Step 2: Create Adapters
```typescript
// Konva data → React Flow nodes
export function konvaFixtureToReactFlowNode(konvaFixture) {
  return {
    id: konvaFixture.id,
    type: 'fixture',
    position: { x: konvaFixture.x, y: konvaFixture.y },
    data: {
      width: konvaFixture.attrs.width,
      height: konvaFixture.attrs.height,
      shelves: konvaFixture.children
    }
  };
}
```

### Step 3: Parallel Implementation
- Keep Konva code for export
- Use React Flow for editing
- Share data models

---

## Final Recommendation

### For EZPOG.io Platform: **React Flow (@xyflow/react)**

**Rationale:**
1. **Speed to Market** - 60% faster development
2. **Modern UX** - Meets 2025 user expectations
3. **Maintainability** - Easier to find developers
4. **Scalability** - Built for complex scenarios
5. **Future-Proof** - Active development, modern patterns
6. **Competitive Edge** - Better UX than Blue Yonder

**Implementation Timeline:**
- Week 1-2: Basic canvas with fixtures
- Week 3-4: Product placement and drag-drop
- Week 5-6: Advanced features (auto-arrange, templates)
- Week 7-8: Export and polish

**Fallback Plan:**
- If React Flow doesn't meet precision needs
- Add Konva rendering layer for export
- Use existing PlanogramTool code as reference

---

## Next Steps

1. **Prototype** - Build quick proof-of-concept with React Flow
2. **Test** - Validate with sample planograms
3. **Decide** - Commit or pivot to Konva
4. **Implement** - Full feature development

**Want me to build a React Flow prototype to test the concept?**
