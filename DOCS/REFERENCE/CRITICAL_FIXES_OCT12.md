# Critical Fixes - October 12, 2025

## Issues Fixed

### 1. ✅ **Header Layout Fixed**
**Problem:** Toolbar elements were overlapping and wrapping

**Solution:**
- Added `flex-nowrap` to toolbar container
- Added `flex-shrink-0` to all toolbar elements
- Added `whitespace-nowrap` to prevent text wrapping
- Added `overflow-x-auto` for horizontal scroll on small screens
- Added `min-w-[20px]` to flex spacer

**Result:** Clean, non-overlapping header that scales properly

---

### 2. ✅ **Product Shelf Alignment Fixed**  
**Problem:** Products were "flying around" the fixture, not respecting shelf boundaries

**Root Cause:**
- Shelf line positions were calculated including header + rowOffset
- Product positions were relative to content area (which already accounts for header/offset)
- Mismatch caused products to appear in wrong vertical positions

**Solution:**
```typescript
// OLD (WRONG):
let currentY = headerHeightPx + rowOffsetPx; // Started below header
const rowPositions = section.rows.map((row) => {
  const y = currentY;
  currentY += row.height * INCH_TO_PIXEL;
  return { y, height: row.height * INCH_TO_PIXEL };
});

// NEW (CORRECT):
let currentY = 0; // Start at 0 relative to content area
const rowPositions = section.rows.map((row) => {
  const rowHeight = row.height * INCH_TO_PIXEL;
  const y = currentY;
  currentY += rowHeight;
  return { y, height: rowHeight };
});
```

**Files Changed:**
- `src/features/planogram/components/nodes/FixtureNodeV2.tsx`
- `src/features/planogram/utils/snapHelpers.ts`

**Result:** Products now snap correctly to shelf bases

---

### 3. ✅ **Collapsible Sidebar Implemented**
**Features:**
- Toggle button in toolbar (hamburger icon)
- Smooth animation (300ms transition)
- Collapses from 320px to 0px
- Panel tabs hide when collapsed
- More design space for user

---

### 4. ✅ **Snap Toggle Control Added**
**Features:**
- ON/OFF button in toolbar
- Green highlight when enabled
- Disables all snapping when OFF:
  - No grid snap
  - No shelf snap  
  - No product magnetization
- Free placement when disabled

---

### 5. ✅ **Product Drag Alignment Fixed**
**Problem:** Products appeared offset from cursor on drop

**Solution:**
```typescript
// Center product on cursor
const productWidthPx = product.dimensions.width * INCH_TO_PIXEL;
const productHeightPx = product.dimensions.height * INCH_TO_PIXEL;

const x = e.clientX - contentRect.left - (productWidthPx / 2);
const y = e.clientY - contentRect.top - (productHeightPx / 2);
```

**Result:** Products drop exactly where you see them

---

### 6. ✅ **Snap-to-Adjacent-Product Added**
**Feature:** Products magnetize to nearby products (20px threshold)

**Implementation:**
```typescript
export function snapToAdjacentProduct(
  x: number,
  y: number,
  productWidth: number,
  productHeight: number,
  facings: number,
  components: PlacedComponent[],
  snapThreshold: number = 20,
  excludeId?: string
): number
```

**Result:** Creates tight, organized layouts automatically

---

## Coordinate System

### **CRITICAL Understanding:**

```
Fixture Structure:
┌─────────────────────────┐
│  Header (6" = 60px)     │ ← Fixed header area
├─────────────────────────┤
│  Row Offset (2" = 20px) │ ← Space before first shelf
├─────────────────────────┤
│                         │
│  Content Area           │ ← Y=0 starts HERE
│  (Products placed here) │    Products use coordinates
│                         │    relative to this area
│  Shelf 1 (14" = 140px)  │
│  ├──Products here───────│
│  Shelf 2 (14" = 140px)  │
│  ├──Products here───────│
│  Shelf 3 (14" = 140px)  │
│  ├──Products here───────│
│  Shelf 4 (14" = 140px)  │
│  ├──Products here───────│
│                         │
└─────────────────────────┘
```

### Key Points:
1. **Content area** is the `<div data-fixture-content>` element
2. **All product coordinates** (x, y) are relative to content area top-left
3. **Shelf lines** are drawn at cumulative heights: 140px, 280px, 420px, 560px
4. **Products snap** to shelf bases (e.g., Y = 140px - product height)

---

## Data Structure

### Current Implementation:
```typescript
Fixture (React Flow Node)
└── Section
    ├── rows: Row[] (shelf definitions)
    └── components: PlacedComponent[] (products on fixture)
```

### Planned Enhancement:
```typescript
Firestore Structure:
└── planograms/{planogramId}
    ├── fixtures: Array<{
    │     fixtureId: string
    │     position: {x, y}
    │     sections: Section[]
    │   }>
    └── products: Array<{
          id: string
          productId: string (reference to products collection)
          fixtureId: string
          sectionId: string
          shelfIndex: number
          position: {x, y}
          facings: number
        }>
```

---

## Remaining Issues

### 1. **Products Need Shelf Association**
Currently products store their Y position but don't explicitly know which shelf they're on. Need to:
- Add `shelfId` or `shelfIndex` to PlacedComponent
- Update on drop and move
- Use for better organization

### 2. **Local State vs Firestore**
**Recommendation:** Use local state during editing, batch save to Firestore

**Implementation Plan:**
```typescript
// Local editing (fast, no network calls)
const [nodes, setNodes] = useState<Node[]>([]);

// Save to Firestore (user clicks Save)
const savePlanogram = async () => {
  const planogramData = {
    fixtures: nodes.map(extractFixtureData),
    products: nodes.flatMap(extractProductsData),
    timestamp: serverTimestamp()
  };
  
  await setDoc(doc(db, 'planograms', planogramId), planogramData);
};

// For real-time collaboration (future feature):
// Use Firestore listeners + conflict resolution
```

---

## Testing Checklist

- [x] Header doesn't wrap or overlap
- [x] Sidebar collapses/expands smoothly
- [x] Products snap to correct shelf positions
- [x] Products drop centered on cursor
- [x] Products magnetize to adjacent products
- [x] Snap toggle works (ON/OFF)
- [ ] Products save with correct shelf association
- [ ] Multiple users can edit (future)

---

## Files Modified

1. `src/main.tsx` - Added React Flow CSS
2. `src/App.tsx` - Fixed Back to Dashboard button position
3. `src/features/planogram/components/PlanogramDesigner.tsx` 
   - Fixed header layout
   - Added sidebar collapse
   - Added snap toggle
   - Added snap-to-product logic
4. `src/features/planogram/components/nodes/FixtureNodeV2.tsx`
   - Fixed coordinate system
   - Fixed shelf line rendering
   - Fixed product drop positioning
5. `src/features/planogram/utils/snapHelpers.ts`
   - Updated row boundaries calculation
   - Added snapToAdjacentProduct function

---

## Next Steps

1. **Add explicit shelf association** to products
2. **Implement Firestore save** (batch operation)
3. **Add product editing** (change facings, delete, etc.)
4. **Add fixture customization** (add/remove shelves)
5. **Implement export** (PDF, images)

---

Last Updated: October 12, 2025, 6:55 PM
