/**
 * Core application types
 */

import { Timestamp } from "firebase/firestore";

/**
 * User types
 */
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  organizationId: string;
  
  // System-level role (platform access)
  systemRole: SystemRole;
  
  // Organization-level role (deprecated, use organizationRole)
  role: UserRole;
  
  // Organization-specific role and permissions
  organizationRole?: OrganizationRole;
  
  status: UserStatus;
  invitedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences?: UserPreferences;
}

export type SystemRole = "super_admin" | "admin" | "user";
export type UserRole = "admin" | "manager" | "user" | "field_team";
export type UserStatus = "active" | "suspended" | "pending";

export interface OrganizationRole {
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  notifications?: boolean;
  emailUpdates?: boolean;
}

/**
 * Organization types
 */
export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  adminId: string; // Primary admin user ID
  plan: OrganizationPlan;
  status: OrganizationStatus;
  createdBy: string; // Super admin who created it
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings?: OrganizationSettings;
  metadata?: Record<string, unknown>;
  // Additional organizational details
  industry?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export type OrganizationPlan = "free" | "pro" | "enterprise";
export type OrganizationStatus = "active" | "trial" | "suspended";

export interface OrganizationSettings {
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  features?: string[];
  maxUsers?: number;
  geoHierarchy?: GeoHierarchyConfig;
  customStoreFields?: CustomFieldDefinition[];
}

export interface GeoHierarchyConfig {
  level1Label: string;  // e.g., "Area", "Region", "Division"
  level2Label: string;  // e.g., "Region", "District", "Territory"
  level3Label: string;  // e.g., "Division", "Market", "Zone"
  level4Label: string;  // e.g., "Territory", "Store Group", "Cluster"
}

export interface CustomFieldDefinition {
  id: string;
  name: string;           // Internal name: "customerPriority"
  label: string;          // Display name: "Customer Priority"
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];     // For select type
  required?: boolean;
  createdAt?: Timestamp;
}

/**
 * Role and Permission types
 */
export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  permissions: string[];
  isCustom: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
  description?: string;
}

export type PermissionAction = "create" | "read" | "update" | "delete" | "manage";

/**
 * Project types - POG Execution & Reset Management
 */
export interface Project {
  // Core Identification
  id: string;
  organizationId: string;
  projectId: string;             // User-defined project code
  
  // Basic Information
  name: string;
  description?: string;
  projectType: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Timeline
  startDate: Timestamp;
  targetEndDate: Timestamp;
  actualEndDate?: Timestamp;
  milestones?: ProjectMilestone[];
  
  // Financial
  estimatedBudget?: number;
  actualBudget?: number;
  estimatedLaborHours?: number;
  actualLaborHours?: number;
  currency: string;              // USD, CAD, etc.
  
  // Scope
  chainName?: string;
  chainType?: 'corporate' | 'independent';
  region?: string;
  district?: string;
  
  // Store Management
  stores: ProjectStore[];
  totalStores: number;
  completedStores: number;
  inProgressStores: number;
  
  // Team
  teamMembers: ProjectMember[];
  createdBy: string;             // User ID
  createdByName: string;         // User display name
  
  // Metadata
  tags?: string[];
  notes?: string;
  attachments?: string[];
  
  // System Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completionPercentage: number;
}

export type ProjectType = 
  | 'reset'                // Full store reset
  | 'refresh'              // Minor updates
  | 'new_store'            // New store setup
  | 'seasonal'             // Seasonal changeover
  | 'remodel'              // Store renovation
  | 'compliance_check'     // Audit/verification
  | 'emergency';           // Urgent fixes

export type ProjectStatus = 
  | 'draft'                // Being planned
  | 'planning'             // Awaiting approval
  | 'active'               // In execution
  | 'on_hold'              // Temporarily paused
  | 'completed'            // Successfully finished
  | 'cancelled';           // Terminated

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectMilestone {
  id: string;
  name: string;
  targetDate: Timestamp;
  completed: boolean;
  completedDate?: Timestamp;
}

export interface ProjectMember {
  userId: string;
  displayName: string;
  email: string;
  role: 'manager' | 'coordinator' | 'field_team';
  assignedStores?: string[];     // Store IDs
}

export interface ProjectStore {
  // Store Identification
  storeId: string;
  storeName: string;
  storeNumber?: string;
  
  // Location
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Chain Hierarchy
  chainName: string;
  chainType: 'corporate' | 'independent';
  district?: string;
  region?: string;
  marketArea?: string;
  
  // Store Characteristics
  storeFormat: string;           // Small, Standard, Large
  squareFootage?: number;
  fixtureCount?: number;
  layout?: string;
  
  // Contact Information
  storeManager?: string;
  phoneNumber?: string;
  email?: string;
  
  // Schematic Assignment
  schematicId?: string;
  schematicName?: string;
  schematicVersion?: number;
  resetRequired: boolean;
  lastResetDate?: Timestamp;
  
  // Execution Tracking
  status: StoreStatus;
  assignedTeam?: string[];       // User IDs
  scheduledDate?: Timestamp;
  scheduledTimeWindow?: string;
  startedDate?: Timestamp;
  completedDate?: Timestamp;
  
  // Verification & Compliance
  beforePhotos?: string[];
  afterPhotos?: string[];
  executionNotes?: string;
  issuesReported?: StoreIssue[];
  verifiedProducts: boolean;
  complianceScore?: number;
  
  // Performance Metrics
  estimatedDuration?: number;    // Hours
  actualDuration?: number;       // Hours
  laborCost?: number;
  
  // Routing
  distanceFromPrevious?: number; // Miles
  estimatedTravelTime?: number;  // Minutes
  routeOrder?: number;
}

export type StoreStatus = 
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'rescheduled'
  | 'skipped';

export interface StoreIssue {
  id: string;
  type: 'missing_product' | 'damaged_fixture' | 'access_denied' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  reportedDate: Timestamp;
  resolved: boolean;
  resolution?: string;
  photos?: string[];
}

/**
 * Task types
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignedTo?: string[];
  createdBy: string;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
  attachments?: Attachment[];
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Product types
 */
export interface Product {
  // Core Identification
  id: string;
  organizationId: string;
  productId: string;          // User-defined product ID/SKU
  upc: string;               // Universal Product Code
  ean?: string;              // European Article Number
  gtin?: string;             // Global Trade Item Number
  
  // Basic Information
  name: string;
  description?: string;
  brand: string;
  brandFamily?: string;
  manufacturer?: string;
  company?: string;
  
  // Categorization
  category: string;
  subCategory?: string;
  department?: string;
  segment?: string;          // Market segment: Food & Beverage, Health & Beauty, etc.
  
  // Packaging & Dimensions
  packagingTypeId?: string;
  packagingType?: string;    // Bottle, Can, Box, etc.
  unitSize?: number;
  unitOfMeasure?: string;    // oz, ml, g, kg, etc.
  unitsPerCase?: number;
  palletQuantity?: number;   // Cases per pallet
  caseDimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;            // inches or cm
  };
  palletDimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;            // inches or cm
  };
  weight?: number;
  weightUnit?: string;       // lbs, kg, etc.
  palletWeight?: number;
  palletWeightUnit?: string; // lbs, kg, ton, etc.
  
  // Legacy dimensions support
  dimensions?: ProductDimensions;
  
  // Pricing
  retailPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  currency?: string;         // USD, EUR, etc.
  taxRate?: number;          // Tax rate percentage
  
  // Images & Media
  imageUrl?: string;         // Product image (for tiles/directory)
  skuImageUrl?: string;      // SKU image (for fixtures)
  thumbnailUrl?: string;
  additionalImages?: string[];
  
  // Compliance & Regulatory
  ingredients?: string;
  allergens?: string[];
  nutritionFacts?: Record<string, unknown>;
  certifications?: string[]; // Organic, Kosher, Halal, etc.
  warnings?: string[];       // Tobacco warnings, age restrictions, etc.
  
  // Inventory & Status
  inStock?: boolean;
  stockLevel?: number;
  reorderPoint?: number;
  minimumOrderQuantity?: number;
  leadTimeDays?: number;
  status?: 'active' | 'inactive' | 'discontinued';
  
  // Metadata
  userId?: string;           // Creator user ID
  createdBy?: string;        // Creator name
  createdAt: Timestamp;
  updatedAt: Timestamp;
  projects?: string[];       // Associated project IDs
  tags?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
}

export type ProductSegment = 
  | 'food-beverage' 
  | 'health-beauty' 
  | 'household' 
  | 'pharmaceuticals' 
  | 'pet-products' 
  | 'tobacco' 
  | 'alternative-products' 
  | 'wellness';

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
  unit: "inches" | "cm";
}

export interface PackagingType {
  id: string;
  name: string;
  description?: string;
  defaultDimensions?: ProductDimensions;
  organizationId: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  weight?: number;
  weightUnit?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  organizationId: string;
  description?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Planogram types
 */
export interface Planogram {
  id: string;
  name: string;
  description?: string;
  status: PlanogramStatus;
  organizationId: string;
  createdBy: string;
  fixtures: PlanogramFixture[];
  products: PlacedProduct[];
  canvasData?: CanvasData;
  storeAssignments?: string[];
  version: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PlanogramStatus = "draft" | "in_review" | "approved" | "active" | "archived";

export interface PlanogramFixture {
  id: string;
  fixtureId: string;
  position: Position;
  rotation?: number;
  data?: Record<string, unknown>;
}

export interface PlacedProduct {
  id: string;
  productId: string;
  fixtureId: string;
  position: Position;
  facings: number;
  shelfLevel?: number;
  data?: Record<string, unknown>;
}

export interface Position {
  x: number;
  y: number;
}

export interface CanvasData {
  width: number;
  height: number;
  scale: number;
  nodes?: unknown[];
  edges?: unknown[];
}

/**
 * Fixture types
 */
export interface Fixture {
  id: string;
  name: string;
  type: FixtureType;
  dimensions: FixtureDimensions;
  components: FixtureComponent[];
  organizationId: string;
  isTemplate: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FixtureType = "shelf" | "endcap" | "cooler" | "peg" | "basket" | "custom";

export interface FixtureDimensions {
  width: number;
  height: number;
  depth: number;
  unit: "inches" | "cm";
}

export interface FixtureComponent {
  id: string;
  type: "shelf" | "peg" | "basket" | "divider";
  position: Position;
  dimensions: {
    width: number;
    height?: number;
    depth?: number;
  };
  capacity?: number;
}

/**
 * Inventory types
 */
export interface InventoryLocation {
  id: string;
  name: string;
  address?: string;
  organizationId: string;
  type: "store" | "warehouse" | "distribution_center";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InventoryItem {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  reorderPoint?: number;
  lastUpdated: Timestamp;
}

/**
 * Field Team types
 */
export interface FieldTeam {
  id: string;
  name: string;
  organizationId: string;
  members: string[];
  territory?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FieldVisit {
  id: string;
  teamId: string;
  userId: string;
  locationId: string;
  checkInTime: Timestamp;
  checkOutTime?: Timestamp;
  photos?: string[];
  notes?: string;
  complianceData?: Record<string, unknown>;
  createdAt: Timestamp;
}

/**
 * Report types
 */
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  organizationId: string;
  createdBy: string;
  configuration: ReportConfiguration;
  schedule?: ReportSchedule;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ReportType = 
  | "project_status"
  | "task_summary"
  | "product_usage"
  | "planogram_compliance"
  | "inventory_status"
  | "field_team_activity"
  | "custom";

export interface ReportConfiguration {
  filters?: Record<string, unknown>;
  groupBy?: string[];
  sortBy?: string;
  columns?: string[];
}

export interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  enabled: boolean;
}

/**
 * Notification types
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
}

export type NotificationType = 
  | "task_assigned"
  | "task_completed"
  | "project_update"
  | "planogram_approved"
  | "mention"
  | "system";

/**
 * Audit Log types
 */
export interface AuditLog {
  id: string;
  userId: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

/**
 * Common utility types
 */
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Timestamp;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
