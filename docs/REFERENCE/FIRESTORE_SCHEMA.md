# EZPOG.io Firestore Database Schema

**Version:** 2.0.0  
**Last Updated:** October 12, 2025  
**Based on:** Analysis of ezpog-io and PlanogramTool projects

---

## 📋 Collections Overview

```
firestore/
├── users/                      # User profiles and preferences
├── organizations/              # Organization/company data
│   └── members/               # Subcollection: Organization members
├── projects/                   # Project management
│   ├── tasks/                 # Subcollection: Project tasks
│   └── files/                 # Subcollection: Project files
├── tasks/                      # Global tasks (not project-specific)
├── products/                   # Product catalog
├── packaging-types/            # Product packaging types
├── categories/                 # Product categories
├── fixtures/                   # Fixture templates and designs
│   └── components/            # Subcollection: Fixture components
├── planograms/                 # Planogram designs
│   ├── versions/              # Subcollection: Version history
│   └── assignments/           # Subcollection: Store assignments
├── stores/                     # Store/location data
├── inventory/                  # Inventory management
│   └── items/                 # Subcollection: Inventory items by product
├── field-teams/                # Field merchandising teams
│   ├── members/               # Subcollection: Team members
│   └── visits/                # Subcollection: Store visits
├── reports/                    # Saved reports and configurations
├── notifications/              # User notifications
└── activity-log/               # System activity audit log
```

---

## 🔐 Collection: `users`

**Purpose:** User profiles, preferences, and authentication data

### Document Structure
```typescript
{
  uid: string;                    // Firebase Auth UID (document ID)
  email: string;                  // User email
  displayName: string;            // Full name
  photoURL: string | null;        // Profile photo URL
  organizationId: string;         // Reference to organization
  role: 'admin' | 'manager' | 'user' | 'field_team';
  
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
    language: string;             // Default: 'en'
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;              // Account status
}
```

### Indexes
```
- email (ASC)
- organizationId (ASC), role (ASC)
- organizationId (ASC), isActive (ASC)
```

---

## 🏢 Collection: `organizations`

**Purpose:** Company/organization data

### Document Structure
```typescript
{
  id: string;                     // Auto-generated
  name: string;                   // Organization name
  logoUrl: string | null;         // Company logo
  
  // Settings
  settings: {
    currency: string;             // Default: 'USD'
    timezone: string;             // Default: 'America/New_York'
    dateFormat: string;           // Default: 'MM/DD/YYYY'
    measurementUnit: 'inches' | 'cm';  // Default: 'inches'
  };
  
  // Subscription
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'trial' | 'expired';
    startDate: Timestamp;
    endDate: Timestamp;
    maxUsers: number;
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;              // User UID
}
```

### Subcollection: `organizations/{orgId}/members`
```typescript
{
  userId: string;                 // Reference to user
  role: 'admin' | 'manager' | 'user' | 'field_team';
  permissions: string[];          // Custom permissions
  addedAt: Timestamp;
  addedBy: string;                // User UID
}
```

---

## 📁 Collection: `projects`

**Purpose:** Project management and tracking

### Document Structure
```typescript
{
  id: string;                     // Auto-generated
  name: string;                   // Project name
  description: string | null;     // Project description
  
  // Classification
  category: string;               // Project category
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Ownership
  organizationId: string;         // Reference to organization
  createdBy: string;              // User UID
  owner: string;                  // Project owner name
  members: string[];              // Array of user UIDs
  
  // Timeline
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  completedAt: Timestamp | null;
  
  // Progress
  progress: number;               // 0-100
  tasksTotal: number;
  tasksCompleted: number;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;  // Custom fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Subcollection: `projects/{projectId}/tasks`
```typescript
{
  id: string;                     // Auto-generated
  title: string;
  description: string | null;
  
  // Status
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Assignment
  assignedTo: string[];           // Array of user UIDs
  createdBy: string;              // User UID
  
  // Timeline
  dueDate: Timestamp | null;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  
  // Attachments
  files: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Timestamp;
  }>;
  
  // Comments (stored separately for better performance)
  commentsCount: number;
  
  // Metadata
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Subcollection: `projects/{projectId}/files`
```typescript
{
  id: string;
  name: string;
  url: string;
  type: string;                   // MIME type
  size: number;                   // Bytes
  uploadedBy: string;             // User UID
  uploadedAt: Timestamp;
  description: string | null;
}
```

### Indexes
```
- organizationId (ASC), status (ASC), createdAt (DESC)
- organizationId (ASC), members (ARRAY), status (ASC)
- createdBy (ASC), status (ASC)
```

---

## ✅ Collection: `tasks`

**Purpose:** Global tasks not tied to specific projects

### Document Structure
```typescript
{
  id: string;
  title: string;
  description: string | null;
  
  // Status
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Assignment
  organizationId: string;
  assignedTo: string[];           // Array of user UIDs
  createdBy: string;              // User UID
  
  // Timeline
  dueDate: Timestamp | null;
  completedAt: Timestamp | null;
  
  // Attachments
  files: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  
  // Metadata
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Indexes
```
- organizationId (ASC), status (ASC), dueDate (ASC)
- assignedTo (ARRAY), status (ASC)
- createdBy (ASC), status (ASC)
```

---

## 📦 Collection: `products`

**Purpose:** Product catalog and master data

### Document Structure
```typescript
{
  id: string;                     // Auto-generated
  productId: string;              // Custom product ID (optional)
  
  // Basic Info
  name: string;                   // Product name
  brand: string;                  // Brand name
  brandFamily: string | null;     // Brand family/line
  upc: string;                    // Universal Product Code
  
  // Classification
  category: string;               // Category name
  packagingTypeId: string;        // Reference to packaging-types
  
  // Dimensions
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: 'inches' | 'cm';
    weight: number | null;
    weightUnit: 'oz' | 'g' | null;
  } | null;
  
  // Visual
  imageUrl: string | null;        // Product image URL
  images: string[];               // Multiple images
  
  // Ownership
  organizationId: string;
  userId: string;                 // Creator user ID (for backward compatibility)
  
  // Metadata
  sku: string | null;             // Stock keeping unit
  description: string | null;
  tags: string[];
  metadata: Record<string, any>;  // Custom fields
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Indexes
```
- organizationId (ASC), category (ASC), name (ASC)
- organizationId (ASC), brand (ASC)
- upc (ASC)
- userId (ASC), createdAt (DESC)
```

---

## 📏 Collection: `packaging-types`

**Purpose:** Product packaging type definitions

### Document Structure
```typescript
{
  id: string;
  name: string;                   // e.g., "Bottle", "Can", "Box"
  description: string | null;
  
  // Default dimensions
  defaultDimensions: {
    width: number;
    height: number;
    depth: number;
    unit: 'inches' | 'cm';
  } | null;
  
  // Ownership
  organizationId: string;
  isGlobal: boolean;              // Available to all orgs
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🏷️ Collection: `categories`

**Purpose:** Product category hierarchy

### Document Structure
```typescript
{
  id: string;
  name: string;
  parentId: string | null;        // For hierarchical categories
  level: number;                  // 0 = root, 1 = child, etc.
  
  // Ownership
  organizationId: string;
  
  // Display
  order: number;                  // Sort order
  icon: string | null;            // Icon name/URL
  color: string | null;           // Hex color
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🏗️ Collection: `fixtures`

**Purpose:** Fixture templates and designs

### Document Structure
```typescript
{
  id: string;
  name: string;
  type: 'shelf' | 'endcap' | 'cooler' | 'peg' | 'basket' | 'custom';
  
  // Dimensions
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: 'inches' | 'cm';
  };
  
  // Components (shelves, pegs, etc.)
  components: Array<{
    id: string;
    type: 'shelf' | 'peg' | 'basket' | 'divider';
    position: {
      x: number;
      y: number;
      z: number | null;
    };
    dimensions: {
      width: number;
      height: number | null;
      depth: number | null;
    };
    capacity: number | null;      // Max products
    angle: number | null;         // Tilt angle
  }>;
  
  // Configuration
  shelves: number | null;         // Number of shelves
  shelfSpacing: number | null;    // Distance between shelves
  
  // Ownership
  organizationId: string;
  createdBy: string;              // User UID
  isTemplate: boolean;            // Available as template
  isPublic: boolean;              // Shared with organization
  
  // Visual
  imageUrl: string | null;
  thumbnailUrl: string | null;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Indexes
```
- organizationId (ASC), type (ASC)
- organizationId (ASC), isTemplate (ASC)
- createdBy (ASC)
```

---

## 🎨 Collection: `planograms`

**Purpose:** Planogram designs and layouts

### Document Structure
```typescript
{
  id: string;
  name: string;
  description: string | null;
  
  // Status
  status: 'draft' | 'in_review' | 'approved' | 'active' | 'archived';
  version: number;                // Current version
  
  // Canvas Data
  canvasData: {
    width: number;
    height: number;
    scale: number;
    backgroundColor: string | null;
    
    // React Flow specific
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: Record<string, any>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type: string | null;
    }>;
  };
  
  // Fixtures
  fixtures: Array<{
    id: string;
    fixtureId: string;            // Reference to fixtures collection
    position: { x: number; y: number };
    rotation: number | null;
    scale: number | null;
    data: Record<string, any>;
  }>;
  
  // Products
  products: Array<{
    id: string;
    productId: string;            // Reference to products collection
    fixtureId: string;            // Which fixture it's on
    position: { x: number; y: number };
    facings: number;              // Number of facings
    shelfLevel: number | null;    // Which shelf (0-indexed)
    rotation: number | null;
    data: Record<string, any>;
  }>;
  
  // Store Assignments
  storeAssignments: string[];     // Array of store IDs
  
  // Ownership
  organizationId: string;
  createdBy: string;              // User UID
  
  // Approval
  approvedBy: string | null;      // User UID
  approvedAt: Timestamp | null;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Subcollection: `planograms/{planogramId}/versions`
```typescript
{
  id: string;
  version: number;
  canvasData: object;             // Full canvas snapshot
  fixtures: Array<object>;
  products: Array<object>;
  
  // Change tracking
  changedBy: string;              // User UID
  changeNote: string | null;
  changedAt: Timestamp;
}
```

### Subcollection: `planograms/{planogramId}/assignments`
```typescript
{
  id: string;
  storeId: string;                // Reference to stores
  assignedBy: string;             // User UID
  assignedAt: Timestamp;
  effectiveDate: Timestamp | null;
  expiryDate: Timestamp | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}
```

### Indexes
```
- organizationId (ASC), status (ASC), updatedAt (DESC)
- organizationId (ASC), createdBy (ASC)
- storeAssignments (ARRAY), status (ASC)
```

---

## 🏪 Collection: `stores`

**Purpose:** Store/location data

### Document Structure
```typescript
{
  id: string;
  name: string;
  storeNumber: string | null;
  
  // Location
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  
  // Classification
  type: 'store' | 'warehouse' | 'distribution_center';
  format: string | null;          // Store format/size
  region: string | null;
  
  // Contact
  phone: string | null;
  email: string | null;
  manager: string | null;
  
  // Ownership
  organizationId: string;
  
  // Status
  isActive: boolean;
  openDate: Timestamp | null;
  closeDate: Timestamp | null;
  
  // Metadata
  metadata: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Indexes
```
- organizationId (ASC), isActive (ASC)
- organizationId (ASC), region (ASC)
- storeNumber (ASC)
```

---

## 📊 Collection: `inventory`

**Purpose:** Inventory tracking by location

### Document Structure
```typescript
{
  id: string;                     // Format: {storeId}_{productId}
  storeId: string;                // Reference to stores
  productId: string;              // Reference to products
  organizationId: string;
  
  // Quantities
  quantity: number;
  reorderPoint: number | null;
  maxStock: number | null;
  
  // Status
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  
  // Tracking
  lastCounted: Timestamp | null;
  lastRestocked: Timestamp | null;
  lastUpdated: Timestamp;
  
  // Metadata
  notes: string | null;
  metadata: Record<string, any>;
}
```

### Indexes
```
- organizationId (ASC), storeId (ASC)
- organizationId (ASC), status (ASC)
- productId (ASC), storeId (ASC)
```

---

## 👥 Collection: `field-teams`

**Purpose:** Field merchandising team management

### Document Structure
```typescript
{
  id: string;
  name: string;
  description: string | null;
  
  // Territory
  territory: string | null;
  assignedStores: string[];       // Array of store IDs
  
  // Ownership
  organizationId: string;
  managerId: string | null;       // User UID
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Subcollection: `field-teams/{teamId}/members`
```typescript
{
  userId: string;                 // Reference to user
  role: 'lead' | 'member';
  joinedAt: Timestamp;
  isActive: boolean;
}
```

### Subcollection: `field-teams/{teamId}/visits`
```typescript
{
  id: string;
  userId: string;                 // Team member
  storeId: string;                // Store visited
  
  // Visit details
  checkInTime: Timestamp;
  checkOutTime: Timestamp | null;
  duration: number | null;        // Minutes
  
  // Documentation
  photos: Array<{
    url: string;
    caption: string | null;
    timestamp: Timestamp;
  }>;
  
  notes: string | null;
  
  // Compliance
  complianceData: {
    planogramId: string | null;
    complianceScore: number | null;  // 0-100
    issues: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  } | null;
  
  // Location
  location: {
    latitude: number;
    longitude: number;
  } | null;
  
  // Metadata
  createdAt: Timestamp;
}
```

### Indexes
```
- organizationId (ASC), isActive (ASC)
- assignedStores (ARRAY)
```

---

## 📈 Collection: `reports`

**Purpose:** Saved report configurations

### Document Structure
```typescript
{
  id: string;
  name: string;
  description: string | null;
  
  // Type
  type: 'project_status' | 'task_summary' | 'product_usage' | 
        'planogram_compliance' | 'inventory_status' | 
        'field_team_activity' | 'custom';
  
  // Configuration
  configuration: {
    filters: Record<string, any>;
    groupBy: string[];
    sortBy: string | null;
    columns: string[];
    dateRange: {
      start: Timestamp | null;
      end: Timestamp | null;
    } | null;
  };
  
  // Schedule
  schedule: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek: number | null;     // 0-6 for weekly
    dayOfMonth: number | null;    // 1-31 for monthly
    time: string | null;          // HH:MM format
    recipients: string[];         // Email addresses
  } | null;
  
  // Ownership
  organizationId: string;
  createdBy: string;              // User UID
  
  // Metadata
  lastRun: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🔔 Collection: `notifications`

**Purpose:** User notifications

### Document Structure
```typescript
{
  id: string;
  userId: string;                 // Recipient
  
  // Content
  type: 'task_assigned' | 'task_completed' | 'project_update' | 
        'planogram_approved' | 'mention' | 'system';
  title: string;
  message: string;
  
  // Action
  actionUrl: string | null;       // Link to related item
  actionLabel: string | null;     // Button text
  
  // Status
  read: boolean;
  readAt: Timestamp | null;
  
  // Metadata
  metadata: Record<string, any>;
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
}
```

### Indexes
```
- userId (ASC), read (ASC), createdAt (DESC)
- userId (ASC), type (ASC)
```

---

## 📝 Collection: `activity-log`

**Purpose:** System activity audit trail

### Document Structure
```typescript
{
  id: string;
  
  // Actor
  userId: string;
  userName: string;
  organizationId: string;
  
  // Action
  action: string;                 // e.g., 'create', 'update', 'delete'
  resource: string;               // e.g., 'project', 'product', 'planogram'
  resourceId: string;
  
  // Details
  changes: {
    before: Record<string, any> | null;
    after: Record<string, any> | null;
  } | null;
  
  // Context
  ipAddress: string | null;
  userAgent: string | null;
  
  // Metadata
  timestamp: Timestamp;
}
```

### Indexes
```
- organizationId (ASC), timestamp (DESC)
- userId (ASC), timestamp (DESC)
- resource (ASC), resourceId (ASC), timestamp (DESC)
```

---

## 🔍 Composite Indexes Summary

### Critical Indexes
```javascript
// Projects
projects: [
  ['organizationId', 'ASC'], ['status', 'ASC'], ['createdAt', 'DESC']
]

// Tasks
tasks: [
  ['organizationId', 'ASC'], ['status', 'ASC'], ['dueDate', 'ASC']
]

// Products
products: [
  ['organizationId', 'ASC'], ['category', 'ASC'], ['name', 'ASC']
]

// Planograms
planograms: [
  ['organizationId', 'ASC'], ['status', 'ASC'], ['updatedAt', 'DESC']
]

// Inventory
inventory: [
  ['organizationId', 'ASC'], ['storeId', 'ASC']
]

// Notifications
notifications: [
  ['userId', 'ASC'], ['read', 'ASC'], ['createdAt', 'DESC']
]
```

---

## 📊 Data Size Estimates

### Per Organization (Average)
- **Users:** 10-50 documents
- **Projects:** 50-200 documents
- **Tasks:** 500-2000 documents
- **Products:** 1000-10000 documents
- **Planograms:** 100-500 documents
- **Fixtures:** 50-200 documents
- **Stores:** 10-100 documents
- **Inventory:** 10000-100000 documents (largest)
- **Notifications:** 1000-5000 documents

### Storage Estimates
- **Small Org:** ~100 MB
- **Medium Org:** ~500 MB - 2 GB
- **Large Org:** ~5-20 GB

---

## 🔐 Security Considerations

1. **All collections** require authentication
2. **Organization-scoped** data uses organizationId
3. **User-scoped** data uses userId
4. **Role-based access** enforced in security rules
5. **Sensitive data** (passwords, API keys) never stored
6. **Audit logging** for compliance

---

**Next Step:** Create Firestore Security Rules based on this schema
