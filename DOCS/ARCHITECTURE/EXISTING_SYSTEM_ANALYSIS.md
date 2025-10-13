# 🔍 Existing EZPOG System - Comprehensive Analysis

**Date:** October 12, 2025  
**Purpose:** Document existing planogram tools to guide v2 development  
**Sources:** ezpog-io & EZPOG.io_PlanogramTool projects

---

## 📊 System Architecture Overview

### Technology Stack (Old)
- **Canvas Library:** Konva.js (React-Konva)
- **State Management:** Redux Toolkit
- **Drag & Drop:** react-dnd
- **Database:** Firebase Firestore
- **UI Framework:** Material-UI + TailwindCSS

### Technology Stack (New - v2)
- **Canvas Library:** React Flow (modern, better for nested structures)
- **State Management:** React Context + Hooks (simpler, more maintainable)
- **Drag & Drop:** Native React Flow (built-in)
- **Database:** Firebase Firestore (same)
- **UI Framework:** TailwindCSS v4 + shadcn/ui

---

## 🏗️ Core Data Models

### 1. **Fixture** (Container)
```typescript
interface Fixture {
  id: string;
  name: string;
  sections: Section[];  // Multiple sections per fixture
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Key Insight:** Fixtures are **containers** with multiple sections. Each section is like a separate shelf unit.

---

### 2. **Section** (Shelf Unit)
```typescript
interface Section {
  id: string;
  name: string;
  width: number;          // in inches
  height: number;         // in inches
  headerHeight: number;   // Space for section label
  rowOffset: number;      // Space before first shelf
  rows: Row[];            // Individual shelves
  components: Component[]; // Products/items placed on shelves
}
```

**Key Insight:** Sections have:
- **Physical dimensions** (width × height in inches)
- **Header space** for labels
- **Multiple rows** (shelves) with individual heights
- **Components** (products) positioned within

---

### 3. **Row** (Individual Shelf)
```typescript
interface Row {
  height: number;  // Shelf height in inches
  // Rows stack vertically within a section
}
```

**Key Insight:** Rows define shelf spacing. Products snap to shelf bases.

---

### 4. **Component** (Product/Item on Shelf)
```typescript
interface Component {
  id: string;
  name: string;
  type: string;           // 'product', 'shelf', 'peg', etc.
  width: number;          // in inches
  height: number;         // in inches
  depth: number;          // in inches
  facingCount: number;    // How many facings (duplicates)
  imageURL?: string;      // Product image
  x: number;              // Position within section (pixels)
  y: number;              // Position within section (pixels)
}
```

**Key Insight:** Components are:
- **Positioned** with x/y coordinates within section
- **Sized** with real dimensions (inches)
- **Facing-aware** (one product = multiple facings)
- **Image-based** for visual representation

---

### 5. **Product** (Product Library)
```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  packagingTypeId: string;
  imageURL?: string;
  barcode?: string;
  sku?: string;
  dimensions: {
    width: number;   // inches
    height: number;  // inches
    depth: number;   // inches
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Key Insight:** Products are in a **library** separate from planograms. They get "placed" as components.

---

### 6. **Packaging Type**
```typescript
interface PackagingType {
  id: string;
  name: string;          // 'Can', 'Bottle', 'Box', 'Bag', etc.
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
}
```

**Key Insight:** Reusable templates for common package sizes.

---

### 7. **Category**
```typescript
interface Category {
  id: string;
  name: string;
  parentId?: string;  // For hierarchical categories
}
```

---

### 8. **Planogram** (Complete Design)
```typescript
interface Planogram {
  id: string;
  name: string;
  fixtureId: string;      // Reference to fixture design
  placedProducts: PlacedProduct[];
  storeAssignments: string[];  // Store IDs
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 9. **PlacedProduct** (Product Instance in Planogram)
```typescript
interface PlacedProduct {
  productId: string;
  componentId: string;    // Which component (shelf position)
  facingNumber: number;   // Which facing (1, 2, 3...)
  sectionName: string;
  componentName: string;
}
```

**Key Insight:** Products are **assigned to facings** on components. One component can have multiple facings.

---

## 🎨 Canvas System Architecture

### Coordinate System
```
INCH_TO_PIXEL = 10  // Conversion factor
CANVAS_PADDING = 50 // Border padding

Real World (inches) → Screen (pixels)
- 12" width → 120px width
- 6" height → 60px height
```

### Rendering Hierarchy
```
Stage (Konva)
└── Layer
    └── FixtureRenderer
        └── Section (for each section)
            ├── FixtureHeader (section label)
            ├── Ruler (measurements)
            ├── Grid (dot grid for alignment)
            ├── Rows (shelf lines)
            └── Components
                └── ComponentRenderer
                    ├── Image (product image)
                    └── FacingCells (clickable areas)
```

---

## 🔧 Key Features Implemented

### 1. **Fixture Design Workflow**
```
1. Create Fixture (name it)
2. Add Sections (tabs)
   - Set dimensions (W×H)
   - Set header height
   - Define rows (shelves)
3. Drag Components onto sections
   - Snap to grid
   - Snap to shelf base
   - Check overlap
4. Compile Fixture
5. Save to library
```

**Files:**
- `FixtureDesignPage.js` - Main fixture designer
- `SectionCanvas.js` - Canvas for each section
- `FixtureSetupModal.js` - Section configuration

---

### 2. **Component Design Workflow**
```
1. Create Component
   - Name, type
   - Dimensions (W×H×D)
   - Facing count
   - Upload image
2. Save to library
3. Reuse in fixtures
```

**Files:**
- `ComponentDesignPage.js` - Component manager
- `ComponentCreationModal.js` - Component form
- `ComponentList.js` - Library view

---

### 3. **Planogram Design Workflow**
```
1. Select Fixture from library
2. View fixture on canvas
3. Select Product from sidebar
4. Click Facing on component
5. Product assigned to facing
6. Export/Save planogram
```

**Files:**
- `PlanogramPage.js` - Main planogram designer
- `PlanogramCanvas.js` - Konva canvas
- `ProductList.js` - Product sidebar
- `FacingCell.js` - Clickable facing areas

---

### 4. **Product Management**
```
1. Add Products
   - Name, brand, category
   - Dimensions
   - Packaging type
   - Image
2. Filter/Search
3. Tile or Table view
4. Assign to planograms
```

**Files:**
- `ProductManagementPage.js` - Product CRUD
- `ProductForm.js` - Product creation
- `ProductCard.js` - Tile view
- `ProductTableView.js` - Table view

---

## 🎯 Critical Features to Replicate

### 1. **Snap-to-Grid System**
```javascript
// From SectionCanvas.js
const snappedX = Math.round(localX / INCH_TO_PIXEL) * INCH_TO_PIXEL;

// Snap to shelf base
for (let i = 0; i < rowBoundaries.length; i++) {
  const boundary = rowBoundaries[i];
  if (snappedY >= boundary.start && snappedY <= boundary.end) {
    snappedY = boundary.end - draggedItem.component.height * INCH_TO_PIXEL;
    break;
  }
}
```

**Why:** Products must align to shelves and grid for realistic placement.

---

### 2. **Overlap Detection**
```javascript
// From SectionCanvas.js
const checkOverlap = (x, y, width, height) => {
  const components = section.components || [];
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    if (
      x < compX + compWidth &&
      x + width > compX &&
      y < compY + compHeight &&
      y + height > compY
    ) {
      return true;
    }
  }
  return false;
};
```

**Why:** Prevent products from overlapping on shelves.

---

### 3. **Facing System**
```javascript
// From ComponentRenderer.js
const facingWidth = scaledWidth / facingCount;

// Render facings as cells
{Array.from({ length: facingCount }).map((_, index) => (
  <FacingCell
    key={index}
    x={index * facingWidth}
    width={facingWidth}
    facingNumber={index + 1}
    onClick={onFacingClick}
  />
))}
```

**Why:** One product can have multiple facings (e.g., 3 cans of Coke side-by-side).

---

### 4. **Zoom & Pan**
```javascript
// From PlanogramCanvas.js
const handleWheel = (e) => {
  const scaleBy = 1.02;
  const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
  setStageScale(newScale);
  // Adjust position to zoom toward mouse
};
```

**Why:** Large planograms need zoom/pan for usability.

---

### 5. **Real Dimensions**
```javascript
// Everything uses inches
width: 12,    // 12 inches
height: 6,    // 6 inches
depth: 4,     // 4 inches

// Convert to pixels for rendering
const scaledWidth = width * INCH_TO_PIXEL;
```

**Why:** Retail planograms use real-world measurements.

---

## 🚫 What NOT to Copy (React Flow Handles Better)

### 1. **Manual Drag & Drop**
❌ Old: react-dnd + manual position calculation  
✅ New: React Flow built-in drag & drop

### 2. **Flat Node Structure**
❌ Old: All components in one array, manual parent tracking  
✅ New: React Flow parent nodes (fixtures contain products)

### 3. **Manual Zoom/Pan**
❌ Old: Custom wheel handler + position state  
✅ New: React Flow built-in controls

### 4. **Redux for Everything**
❌ Old: Redux for all state (overkill)  
✅ New: Context for auth, local state for canvas

### 5. **Konva Complexity**
❌ Old: Manual Stage/Layer/Group management  
✅ New: React Flow abstracts canvas complexity

---

## 🎨 UI/UX Patterns to Keep

### 1. **Tabbed Section Editor**
- Each section is a tab
- Edit/Duplicate/Delete buttons per section
- Visual feedback for active section

### 2. **Fixture Library Cards**
- Grid of saved fixtures
- Click to open
- Delete button (X) on hover
- Preview thumbnail

### 3. **Product Sidebar**
- Scrollable product list
- Search and filters
- Drag to canvas

### 4. **Tile vs Table View**
- Toggle between views
- Tile for visual browsing
- Table for data management

### 5. **Modal Forms**
- Section setup modal
- Component creation modal
- Product detail modal

---

## 📐 Dimension System

### Units
- **Storage:** Inches (database)
- **Display:** Inches with conversion to pixels
- **Conversion:** 1 inch = 10 pixels (configurable)

### Typical Sizes
```
Gondola Section:
- Width: 48" (4 feet)
- Height: 72" (6 feet)
- Depth: 18"

Shelf:
- Height: 12-18" spacing
- Depth: 12-18"

Products:
- Can: 2.5" W × 5" H
- Bottle: 3" W × 9" H
- Box: 8" W × 12" H × 6" D
```

---

## 🔄 Data Flow

### Fixture Design Flow
```
1. User creates fixture
2. Adds sections with dimensions
3. Drags components onto sections
4. Components snap to grid/shelves
5. Fixture saved to Firestore
6. Available in fixture library
```

### Planogram Design Flow
```
1. User selects fixture from library
2. Fixture rendered on canvas
3. User selects product from sidebar
4. Clicks facing on component
5. Product assigned to facing
6. Planogram saved with product assignments
7. Can be assigned to stores
```

---

## 🎯 V2 Enhancement Goals

### What to Improve

1. **Better Nested Structure**
   - React Flow parent nodes for fixtures
   - Products as child nodes within fixtures
   - Visual hierarchy

2. **Modern Drag & Drop**
   - Smooth animations
   - Visual feedback
   - Drop zones

3. **Real-time Collaboration** (Future)
   - Multiple users editing
   - Live cursors
   - Change tracking

4. **Better Product Placement**
   - Auto-arrange products
   - Smart spacing
   - Capacity warnings

5. **Export Options**
   - PDF with measurements
   - Image export
   - CSV product list
   - Store-specific versions

6. **Mobile Support**
   - Touch-friendly
   - Responsive canvas
   - Simplified UI

---

## 🏆 Key Takeaways

### ✅ Must Have Features

1. **Fixture Library**
   - Save/load fixtures
   - Reusable templates
   - Section-based design

2. **Product Library**
   - Full CRUD
   - Categories & packaging types
   - Image support
   - Search & filter

3. **Snap System**
   - Grid snapping
   - Shelf snapping
   - Overlap prevention

4. **Facing System**
   - Multiple facings per product
   - Visual representation
   - Click to assign

5. **Real Dimensions**
   - Inch-based measurements
   - Accurate scaling
   - Rulers/guides

6. **Zoom & Pan**
   - Mouse wheel zoom
   - Drag to pan
   - Fit to view

### 🎨 UI Patterns

1. **Three-Tab System**
   - Fixture Design
   - Component Design
   - Planogram Design

2. **Library + Canvas Layout**
   - Sidebar with items
   - Main canvas area
   - Properties panel

3. **Modal Workflows**
   - Setup modals
   - Detail modals
   - Confirmation dialogs

### 📊 Data Architecture

1. **Separation of Concerns**
   - Fixtures (templates)
   - Products (library)
   - Planograms (instances)
   - Components (placed items)

2. **Hierarchical Structure**
   - Fixture → Sections → Rows → Components
   - Clear parent-child relationships

3. **Reusability**
   - Fixtures are templates
   - Products are reusable
   - Components can be duplicated

---

## 🚀 Implementation Priority

### Phase 1: Core Canvas (Week 2-3)
1. React Flow setup with custom nodes
2. Fixture node (container)
3. Product node (child)
4. Snap-to-grid system
5. Basic drag & drop

### Phase 2: Fixture Designer (Week 4-5)
1. Section configuration
2. Row/shelf setup
3. Dimension inputs
4. Save to library
5. Load from library

### Phase 3: Product System (Week 6-7)
1. Product CRUD
2. Category management
3. Packaging types
4. Image upload
5. Search & filter

### Phase 4: Planogram Designer (Week 8-10)
1. Fixture selection
2. Product placement
3. Facing assignment
4. Save planogram
5. Store assignment

### Phase 5: Export & Polish (Week 11-12)
1. PDF export
2. Image export
3. Data export
4. Print layouts
5. UI polish

---

## 📝 Notes

### Why React Flow is Better

1. **Built-in Features**
   - Drag & drop
   - Zoom & pan
   - Mini-map
   - Controls
   - Edge connections

2. **Parent-Child Nodes**
   - Natural nesting
   - Automatic positioning
   - Visual hierarchy

3. **Performance**
   - Optimized rendering
   - Virtual scrolling
   - Efficient updates

4. **Modern API**
   - React hooks
   - TypeScript support
   - Better DX

### Migration Strategy

1. **Keep Data Models** - They work well
2. **Replace Canvas** - Konva → React Flow
3. **Simplify State** - Redux → Context/Hooks
4. **Enhance UX** - Modern interactions
5. **Add Features** - Collaboration, export, mobile

---

**This analysis provides the foundation for building EZPOG.io v2 with modern technology while preserving the robust features of the existing system.** 🎉
