# Projects Module - Data Model

Complete TypeScript interfaces and schemas for the Projects module.

---

## Project Schema

```typescript
interface Project {
  // Core Identification
  id: string;                          // Firestore document ID
  organizationId: string;              // Multi-tenant support
  projectId: string;                   // User-defined project code
  
  // Basic Information
  name: string;
  description?: string;
  projectType: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Timeline
  startDate: Date;
  targetEndDate: Date;
  actualEndDate?: Date;
  milestones?: Milestone[];
  
  // Financial
  estimatedBudget?: number;
  actualBudget?: number;
  estimatedLaborHours?: number;
  actualLaborHours?: number;
  currency: string;
  
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
  createdBy: string;
  createdByName: string;
  
  // Metadata
  tags?: string[];
  notes?: string;
  attachments?: string[];
  
  // System Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completionPercentage: number;
}

type ProjectType = 
  | 'reset'              // Full store reset
  | 'refresh'            // Minor updates
  | 'new_store'          // New store setup
  | 'seasonal'           // Seasonal changeover
  | 'remodel'            // Store renovation
  | 'compliance_check'   // Audit/verification
  | 'emergency';         // Urgent fixes

type ProjectStatus = 
  | 'draft'
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Milestone {
  id: string;
  name: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
}

interface ProjectMember {
  userId: string;
  displayName: string;
  email: string;
  role: 'manager' | 'coordinator' | 'field_team';
  assignedStores?: string[];
}
```

---

## ProjectStore Schema

```typescript
interface ProjectStore {
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
  storeFormat: string;
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
  lastResetDate?: Date;
  
  // Execution Tracking
  status: StoreStatus;
  assignedTeam?: string[];
  scheduledDate?: Date;
  scheduledTimeWindow?: string;
  startedDate?: Date;
  completedDate?: Date;
  
  // Verification & Compliance
  beforePhotos?: string[];
  afterPhotos?: string[];
  executionNotes?: string;
  issuesReported?: Issue[];
  verifiedProducts: boolean;
  complianceScore?: number;
  
  // Performance Metrics
  estimatedDuration?: number;
  actualDuration?: number;
  laborCost?: number;
  
  // Routing
  distanceFromPrevious?: number;
  estimatedTravelTime?: number;
  routeOrder?: number;
}

type StoreStatus = 
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'rescheduled'
  | 'skipped';

interface Issue {
  id: string;
  type: 'missing_product' | 'damaged_fixture' | 'access_denied' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  reportedDate: Date;
  resolved: boolean;
  resolution?: string;
  photos?: string[];
}
```

---

## Relationships

```
PROJECT (1) ──────── (many) PROJECT_STORES
                              │
                              ├─── (1) STORE (from Stores module)
                              │
                              └─── (1) SCHEMATIC (from Planograms module)
                                        │
                                        └─── (many) PRODUCTS

PROJECT (1) ──────── (many) PROJECT_MEMBERS
                              │
                              └─── (1) USER
```

---

## Firestore Collection Structure

```
/organizations/{orgId}/projects/{projectId}
  - Project document with all fields
  - stores: array of ProjectStore objects (embedded)
  - teamMembers: array of ProjectMember objects (embedded)

/organizations/{orgId}/stores/{storeId}
  - Master store directory (separate collection)
  - Referenced by projectStores via storeId

/schematics/{schematicId}
  - Planogram/schematic documents
  - Referenced by projectStores via schematicId

/users/{userId}
  - User documents
  - Referenced by projectMembers via userId
```

---

## CSV Import Format

Example store CSV format:

```csv
StoreID,StoreName,StoreNumber,Address,City,State,ZipCode,ChainName,ChainType,Format,District,Region,Lat,Lng
001,Store Alpha,1234,123 Main St,Austin,TX,78701,7-Eleven,corporate,Standard,Central,Southwest,30.2672,-97.7431
002,Store Beta,,456 Oak Ave,Dallas,TX,75201,Independent,independent,Small,North,Southwest,32.7767,-96.7970
003,Store Gamma,5678,789 Elm Rd,Houston,TX,77001,Circle K,corporate,Large,Gulf,Southwest,29.7604,-95.3698
```

Required fields: StoreID, StoreName, Address, City, State, ZipCode, ChainName, ChainType
Optional fields: All others
