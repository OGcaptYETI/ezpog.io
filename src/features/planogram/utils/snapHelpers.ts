// Snap and collision detection helpers

import { INCH_TO_PIXEL, GRID_SIZE } from '@/types/planogram';
import type { PlacedComponent, Row } from '@/types/planogram';

/**
 * Snap position to grid
 */
export function snapToGrid(value: number): number {
  const gridPixels = GRID_SIZE * INCH_TO_PIXEL;
  return Math.round(value / gridPixels) * gridPixels;
}

/**
 * Get row boundaries for shelf snapping
 * NOTE: Returns boundaries relative to content area (Y=0 at top of first shelf)
 */
export function getRowBoundaries(rows: Row[], headerHeight: number, rowOffset: number): Array<{ start: number; end: number; rowIndex: number }> {
  const boundaries: Array<{ start: number; end: number; rowIndex: number }> = [];
  // Start at 0 since we're relative to content area, not whole fixture
  let currentY = 0;
  
  rows.forEach((row, index) => {
    const rowHeight = row.height * INCH_TO_PIXEL;
    boundaries.push({
      start: currentY,
      end: currentY + rowHeight,
      rowIndex: index,
    });
    currentY += rowHeight;
  });
  
  return boundaries;
}

/**
 * Snap product to nearest shelf base
 */
export function snapToShelf(
  y: number,
  productHeight: number,
  rows: Row[],
  headerHeight: number,
  rowOffset: number
): { y: number; rowIndex: number } {
  const boundaries = getRowBoundaries(rows, headerHeight, rowOffset);
  const productHeightPx = productHeight * INCH_TO_PIXEL;
  
  // Find which shelf the product should snap to
  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    const shelfBase = boundary.end;
    
    // Check if product center is within this shelf's range
    const productCenter = y + productHeightPx / 2;
    if (productCenter >= boundary.start && productCenter <= boundary.end) {
      // Snap to shelf base (product sits on top of shelf)
      return {
        y: shelfBase - productHeightPx,
        rowIndex: boundary.rowIndex,
      };
    }
  }
  
  // Default to first shelf if no match
  return {
    y: boundaries[0]?.end - productHeightPx || 0,
    rowIndex: 0,
  };
}

/**
 * Check if product overlaps with existing components
 */
export function checkOverlap(
  x: number,
  y: number,
  width: number,
  height: number,
  facings: number,
  components: PlacedComponent[],
  excludeId?: string
): boolean {
  const widthPx = width * INCH_TO_PIXEL * facings;
  const heightPx = height * INCH_TO_PIXEL;
  
  for (const comp of components) {
    if (excludeId && comp.id === excludeId) continue;
    
    const compWidthPx = comp.dimensions.width * INCH_TO_PIXEL * comp.facings;
    const compHeightPx = comp.dimensions.height * INCH_TO_PIXEL;
    
    // AABB collision detection
    if (
      x < comp.x + compWidthPx &&
      x + widthPx > comp.x &&
      y < comp.y + compHeightPx &&
      y + heightPx > comp.y
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate if product fits within section bounds
 */
export function isWithinBounds(
  x: number,
  y: number,
  productWidth: number,
  productHeight: number,
  facings: number,
  sectionWidth: number,
  sectionHeight: number,
  headerHeight: number,
  rowOffset: number
): boolean {
  const widthPx = productWidth * INCH_TO_PIXEL * facings;
  const heightPx = productHeight * INCH_TO_PIXEL;
  const maxX = sectionWidth * INCH_TO_PIXEL;
  const maxY = (sectionHeight - headerHeight - rowOffset) * INCH_TO_PIXEL;
  
  return (
    x >= 0 &&
    y >= 0 &&
    x + widthPx <= maxX &&
    y + heightPx <= maxY
  );
}

/**
 * Calculate shelf capacity
 */
export function calculateShelfCapacity(
  shelfWidth: number,
  components: PlacedComponent[],
  rowIndex: number
): { used: number; available: number; percentage: number } {
  const totalWidth = shelfWidth * INCH_TO_PIXEL;
  
  const usedWidth = components
    .filter(c => c.rowIndex === rowIndex)
    .reduce((sum, c) => sum + (c.dimensions.width * INCH_TO_PIXEL * c.facings), 0);
  
  return {
    used: usedWidth / INCH_TO_PIXEL,
    available: (totalWidth - usedWidth) / INCH_TO_PIXEL,
    percentage: (usedWidth / totalWidth) * 100,
  };
}

/**
 * Auto-arrange products on shelf (left to right)
 */
export function autoArrangeShelf(
  components: PlacedComponent[],
  rowIndex: number,
  shelfY: number
): PlacedComponent[] {
  const shelfComponents = components.filter(c => c.rowIndex === rowIndex);
  let currentX = 0;
  
  return shelfComponents.map(comp => ({
    ...comp,
    x: currentX,
    y: shelfY,
  })).map(comp => {
    currentX += comp.dimensions.width * INCH_TO_PIXEL * comp.facings;
    return comp;
  });
}

/**
 * Snap product to adjacent products (magnetize to nearby items)
 * Returns adjusted x position if close to another product
 */
export function snapToAdjacentProduct(
  x: number,
  y: number,
  productWidth: number,
  productHeight: number,
  facings: number,
  components: PlacedComponent[],
  snapThreshold: number = 20, // pixels
  excludeId?: string
): number {
  const productWidthPx = productWidth * INCH_TO_PIXEL * facings;
  const productHeightPx = productHeight * INCH_TO_PIXEL;
  
  // Find products on the same vertical level (same Y or overlapping Y)
  const nearbyComponents = components.filter(comp => {
    if (excludeId && comp.id === excludeId) return false;
    
    const compHeightPx = comp.dimensions.height * INCH_TO_PIXEL;
    const yOverlap = !(y + productHeightPx < comp.y || y > comp.y + compHeightPx);
    
    return yOverlap;
  });
  
  let bestSnapX = x;
  let minDistance = Infinity;
  
  for (const comp of nearbyComponents) {
    const compWidthPx = comp.dimensions.width * INCH_TO_PIXEL * comp.facings;
    
    // Check snap to left edge (align to right of existing product)
    const snapToRightEdge = comp.x + compWidthPx;
    const distanceToRight = Math.abs(x - snapToRightEdge);
    
    if (distanceToRight < snapThreshold && distanceToRight < minDistance) {
      bestSnapX = snapToRightEdge;
      minDistance = distanceToRight;
    }
    
    // Check snap to right edge (align to left of existing product)
    const snapToLeftEdge = comp.x - productWidthPx;
    const distanceToLeft = Math.abs(x - snapToLeftEdge);
    
    if (distanceToLeft < snapThreshold && distanceToLeft < minDistance) {
      bestSnapX = snapToLeftEdge;
      minDistance = distanceToLeft;
    }
  }
  
  return bestSnapX;
}
