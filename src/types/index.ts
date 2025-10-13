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
}

export type OrganizationPlan = "free" | "pro" | "enterprise";
export type OrganizationStatus = "active" | "trial" | "suspended";

export interface OrganizationSettings {
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  features?: string[];
  maxUsers?: number;
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
 * Project types
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  organizationId: string;
  createdBy: string;
  members: string[];
  startDate?: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, unknown>;
}

export type ProjectStatus = "active" | "completed" | "on_hold" | "archived";

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
  id: string;
  name: string;
  brand: string;
  brandFamily?: string;
  upc: string;
  category: string;
  packagingTypeId: string;
  dimensions?: ProductDimensions;
  imageUrl?: string;
  organizationId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, unknown>;
}

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
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  organizationId: string;
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
