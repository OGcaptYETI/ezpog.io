# Firestore Implementation Progress

**Date:** October 12, 2025  
**Status:** In Progress - Foundation Complete

---

## ✅ Completed

### 1. **Firestore Service Layer** 
**Location:** `src/services/firestore/`

#### ✅ Planogram Service (`planograms.ts`)
- `createPlanogram()` - Create new planogram with full canvas data
- `getPlanogram()` - Load planogram by ID
- `getPlanogramsByOrganization()` - List all planograms for org
- `updatePlanogram()` - Update planogram metadata
- `updatePlanogramCanvas()` - Save canvas state (nodes, edges, fixtures, products)
- `deletePlanogram()` - Soft delete (archive)
- `hardDeletePlanogram()` - Permanent delete
- `approvePlanogram()` - Approval workflow
- `assignPlanogramToStores()` - Store assignment

**Key Features:**
- Full React Flow state persistence
- Fixture ID associations (fixes multi-fixture bug!)
- Product placement with fixture/section IDs
- Version tracking ready
- Store assignments

#### ✅ Fixture Service (`fixtures.ts`)
- `createFixture()` - Create new fixture template
- `getFixture()` - Load fixture by ID
- `getFixturesByOrganization()` - List fixtures
- `getFixtureTemplates()` - Get public templates
- `updateFixture()` - Update fixture
- `deleteFixture()` - Delete fixture
- `duplicateFixture()` - Clone fixture

**Key Features:**
- Template system
- Component-based structure (shelves, pegs, etc.)
- Organization-scoped
- Public/private sharing

#### ✅ Product Service (`products.ts`)
- `createProduct()` - Add new product
- `getProduct()` - Load product by ID
- `getProductByUPC()` - Search by barcode
- `getProductsByOrganization()` - List products
- `getProductsByBrand()` - Filter by brand
- `searchProducts()` - Search by name/UPC/SKU
- `updateProduct()` - Update product
- `deleteProduct()` - Delete product
- `bulkCreateProducts()` - Batch import
- `getProductCategories()` - List all categories
- `getProductBrands()` - List all brands

**Key Features:**
- UPC lookup
- Category/brand filtering
- Search functionality (client-side, can upgrade to Algolia)
- Bulk operations
- Metadata support

---

### 2. **React Hook** 
**Location:** `src/hooks/usePlanogramFirestore.ts`

#### ✅ Features:
- Load single planogram
- Load all planograms for organization
- Create new planogram
- Update planogram
- Save canvas state
- Delete planogram
- Loading states
- Error handling

**Usage:**
```typescript
const {
  planogram,
  planograms,
  loading,
  error,
  loadPlanogram,
  savePlanogram,
  saveCanvas,
} = usePlanogramFirestore(planogramId);
```

---

## 🔧 Multi-Fixture Bug Fix

### **Problem:**
Products didn't know which fixture they belonged to. When moving products between fixtures, they would jump to the wrong fixture.

### **Solution:**
New data structure with explicit IDs:

```typescript
// Before (broken):
{
  components: [{
    id: "product-1",
    productId: "prod-123",
    x: 100,
    y: 200
  }]
}

// After (fixed):
{
  fixtures: [{
    id: "fixture-node-1",          // React Flow node ID
    fixtureId: "fixture-template-a" // Reference to fixtures collection
  }],
  products: [{
    id: "product-1",
    productId: "prod-123",
    fixtureId: "fixture-node-1",   // ✅ Explicit fixture association
    sectionId: "section-1",         // ✅ Explicit section
    position: { x: 100, y: 200 },
    shelfLevel: 2                   // ✅ Explicit shelf
  }]
}
```

**Benefits:**
- ✅ Products know their fixture
- ✅ Products know their section
- ✅ Products know their shelf
- ✅ Can move products between fixtures safely
- ✅ Can query products by fixture
- ✅ Can validate placement rules

---

## 📊 Data Structure

### **Planogram Document:**
```typescript
{
  id: "pog-abc123",
  name: "Beverage Aisle Layout",
  status: "draft",
  version: 1,
  
  canvasData: {
    width: 2000,
    height: 1000,
    scale: 1,
    nodes: [...],  // React Flow nodes
    edges: [...]   // React Flow edges
  },
  
  fixtures: [
    {
      id: "fixture-node-1",           // Unique on canvas
      fixtureId: "4-shelf-gondola",   // Template reference
      position: { x: 100, y: 100 },
      data: { /* section details */ }
    }
  ],
  
  products: [
    {
      id: "product-instance-1",
      productId: "coca-cola-12oz",    // Product catalog reference
      fixtureId: "fixture-node-1",    // ✅ Which fixture
      sectionId: "section-main",      // ✅ Which section
      position: { x: 50, y: 200 },    // Position within section
      facings: 3,                     // Number of facings
      shelfLevel: 2,                  // ✅ Which shelf (0-indexed)
      data: { /* cached product info */ }
    }
  ],
  
  organizationId: "org-xyz",
  createdBy: "user-123",
  createdAt: "2025-10-12T19:00:00Z",
  updatedAt: "2025-10-12T20:15:00Z"
}
```

---

## 🎯 Integration Plan

### **Step 1: Update PlanogramDesigner** 
Add Firestore save functionality:

```typescript
const { saveCanvas } = usePlanogramFirestore(planogramId);

const handleSave = async () => {
  const canvasData = {
    width: 2000,
    height: 1000,
    scale: 1,
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data
    })),
    edges: []
  };
  
  const fixtures = nodes.map(n => ({
    id: n.id,
    fixtureId: n.data.fixtureTemplateId,
    position: n.position,
    data: n.data.section
  }));
  
  const products = nodes.flatMap(n => 
    n.data.section.components.map(c => ({
      id: c.id,
      productId: c.productId,
      fixtureId: n.id,           // ✅ Associate with fixture
      sectionId: n.data.section.id,
      position: { x: c.x, y: c.y },
      facings: c.facings,
      shelfLevel: c.rowIndex,
      data: c
    }))
  );
  
  await saveCanvas(planogramId, canvasData, fixtures, products);
};
```

### **Step 2: Update Product Drop Logic**
Track fixture ID when dropping products:

```typescript
const handleProductDrop = (nodeId, product, section) => {
  const updatedProduct = {
    ...product,
    fixtureId: nodeId,          // ✅ Store which fixture
    sectionId: section.id,       // ✅ Store which section
    rowIndex: snappedRowIndex    // ✅ Store which shelf
  };
  
  // Rest of logic...
};
```

### **Step 3: Update Product Move Logic**
Maintain fixture association when moving:

```typescript
const handleProductMove = (nodeId, productId, x, y) => {
  // Product already knows its fixtureId
  // Just update position within same fixture
  const product = findProduct(productId);
  
  if (product.fixtureId === nodeId) {
    // Moving within same fixture - OK
    updatePosition(productId, x, y);
  } else {
    // Moving to different fixture - need to validate
    validateMove(product, nodeId, x, y);
  }
};
```

---

## 📋 Next Steps

### **Immediate (Tonight):**
- [ ] Update `PlanogramDesigner` to use Firestore services
- [ ] Add "Save" button that persists to Firestore
- [ ] Add fixture ID tracking to product drops
- [ ] Test multi-fixture scenario

### **This Week:**
- [ ] Add "Load" functionality to resume editing
- [ ] Add planogram list view
- [ ] Add version history
- [ ] Add auto-save (debounced)

### **Later:**
- [ ] Real-time collaboration (Firestore listeners)
- [ ] Conflict resolution
- [ ] Undo/redo with Firestore
- [ ] Export functionality

---

## 🧪 Testing Checklist

- [ ] Create planogram
- [ ] Save planogram
- [ ] Load planogram
- [ ] Update planogram
- [ ] Delete planogram
- [ ] Add multiple fixtures
- [ ] Drop products on different fixtures
- [ ] Move products within same fixture
- [ ] Move products between fixtures
- [ ] Verify fixture associations persist
- [ ] Test with authentication
- [ ] Test with organization scoping

---

## 🔐 Security Notes

All services respect:
- ✅ Authentication required
- ✅ Organization-scoped access
- ✅ User permissions (will be enforced by security rules)
- ✅ Timestamps auto-managed

**Security rules are already deployed** in `firestore.rules`

---

## 📚 Files Created

```
src/
├── services/
│   └── firestore/
│       ├── planograms.ts    ✅ Complete
│       ├── fixtures.ts      ✅ Complete
│       ├── products.ts      ✅ Complete
│       └── index.ts         ✅ Complete
└── hooks/
    └── usePlanogramFirestore.ts  ✅ Complete
```

---

**Status:** Foundation complete, ready for integration! 🚀
