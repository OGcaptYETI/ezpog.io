/**
 * Application-wide constants
 */

export const APP_NAME = "EZPOG.io";
export const APP_VERSION = "2.0.0";

/**
 * Route paths
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/:id",
  TASKS: "/tasks",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  PLANOGRAM: "/planogram",
  PLANOGRAM_DESIGN: "/planogram/:id",
  INVENTORY: "/inventory",
  FIELD_TEAMS: "/field-teams",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

/**
 * Project statuses
 */
export const PROJECT_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ON_HOLD: "on_hold",
  ARCHIVED: "archived",
} as const;

/**
 * Task statuses
 */
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
} as const;

/**
 * Task priorities
 */
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  FIELD_TEAM: "field_team",
} as const;

/**
 * Planogram statuses
 */
export const PLANOGRAM_STATUS = {
  DRAFT: "draft",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  FULL: "MMMM d, yyyy",
  SHORT: "MMM d, yyyy",
  NUMERIC: "MM/dd/yyyy",
  TIME: "h:mm a",
  DATETIME: "MMM d, yyyy h:mm a",
} as const;

/**
 * File upload limits
 */
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ACCEPTED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;
