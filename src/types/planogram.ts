// Core planogram types based on existing system analysis

export interface Dimensions {
  width: number;   // inches
  height: number;  // inches
  depth: number;   // inches
}

export interface Row {
  id: string;
  height: number;  // inches - vertical space for this shelf
}

export interface Section {
  id: string;
  name: string;
  width: number;          // inches
  height: number;         // inches
  headerHeight: number;   // inches - space for section label
  rowOffset: number;      // inches - space before first shelf
  rows: Row[];
  components: PlacedComponent[];
}

export interface Fixture {
  id: string;
  name: string;
  sections: Section[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlacedComponent {
  id: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl?: string;
  dimensions: Dimensions;
  facings: number;        // How many side-by-side
  x: number;              // Position in pixels (within section)
  y: number;              // Position in pixels (within section)
  rowIndex: number;       // Which shelf/row
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  dimensions: Dimensions;
  packagingTypeId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PackagingType {
  id: string;
  name: string;
  defaultDimensions: Dimensions;
}

export interface Planogram {
  id: string;
  name: string;
  fixtureId: string;
  fixture?: Fixture;
  placedProducts: PlacedComponent[];
  storeAssignments: string[];
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Canvas constants
export const INCH_TO_PIXEL = 10;  // Conversion factor
export const CANVAS_PADDING = 50;  // Border padding in pixels
export const GRID_SIZE = 1;        // Grid spacing in inches
