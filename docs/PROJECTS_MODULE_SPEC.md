# EZPOG Projects Module - Technical Specification

**Version:** 1.0  
**Date:** October 19, 2025  
**Status:** Planning Phase  

---

## Overview

### Purpose
The Projects Module is a comprehensive POG (Planogram) Execution & Reset Management System designed for retail merchandising operations. It enables project managers to orchestrate store resets, manage field teams, track schematic execution, and ensure compliance across multiple retail locations.

### Core Concept
- **Projects** = Reset/Refresh initiatives across multiple retail locations
- **Store Lists** = Each project contains multiple store locations with individual tracking
- **Schematics** = Product assortments/planogram designs assigned to stores
- **Execution Tracking** = Field team visits, route optimization, completion verification

### Key Innovation - "Reset Flag" System
When a schematic is edited, the system automatically:
1. Identifies all projects using that schematic ID
2. Finds all stores assigned that schematic ID
3. Sets `resetRequired: true` flag on affected stores
4. Notifies project managers and field teams
5. Generates new tasks for re-execution

---

## Business Requirements

### User Permissions
| Role | Create Projects | Edit Projects | View Projects | Execute Tasks |
|------|----------------|---------------|---------------|---------------|
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Manager** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **User** | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **Field Team** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |

### Key Requirements
1. **Multi-Store Management**: Projects can contain hundreds of stores
2. **Chain Hierarchy Support**: Both corporate chains and independent stores
3. **Schematic Versioning**: Track changes and trigger reset flags
4. **Route Optimization**: Field teams need efficient multi-stop routes
5. **Photo Verification**: Before/after photos with notes required
6. **Product Verification**: Confirm physical products are present at location
7. **Calendar Integration**: Export schedules to Google Calendar/Outlook
8. **Real-time Status**: Live updates on project progress

### Data Sources
- **Store Database**: Pre-existing CSV with all US C-store locations
- **Chain Hierarchy**: Corporate and independent store classifications
- **Schematics**: Product assortments from Planograms module
- **Products**: Product catalog from Products module

---

## Module Architecture

### 1. Projects Module (Primary Focus)
**Purpose:** High-level project management & orchestration

### 2. Stores Module (To Be Built)
**Purpose:** Central store directory & location data

### 3. Planograms Module (Already Exists - Enhance)
**Purpose:** Schematic design & product assortments

### 4. Field Teams Module (Already Exists - Enhance)
**Purpose:** Task execution, navigation, compliance

### 5. Calendar/Scheduling (Integrated into Projects)
**Purpose:** Timeline visualization & scheduling

---

## Build Phases

### Phase 1: Core Projects Module (7.5 hours)
**Start Now**

#### 1A: Project Foundation (2 hours)
- Firestore schema and TypeScript types
- CRUD service functions
- Security rules
- RBAC enforcement

#### 1B: Projects List Page (1.5 hours)
- Grid/List view
- Search and filtering
- Sort options
- Project cards

#### 1C: Create Project Modal (2 hours)
- Multi-tab modal
- Basic Info, Timeline, Scope, Team tabs
- Form validation
- Toast notifications

#### 1D: Project Detail Page (2 hours)
- Overview dashboard
- Progress visualizations
- Activity feed
- Edit/delete actions

### Phase 2: Store Management Integration (4.5 hours)
- CSV import functionality
- Store list management
- Bulk actions
- Store detail panels

### Phase 3: Routing & Field Execution (6 hours)
- Google Maps integration
- Route optimization
- Field team task interface
- Photo capture and verification

### Phase 4: Calendar & Scheduling (3.5 hours)
- Internal calendar views
- External calendar integration (iCal, Google Calendar)
- Notification system

### Phase 5: Schematic Linking & Reset Flags (3.5 hours)
- Schematic assignment UI
- Cloud Function for change detection
- Reset flag indicators
- Version tracking

**Total Development Time: ~25 hours (3-4 days)**

---

## Technical Stack

### Frontend
- React 18 + TypeScript
- React Router v6
- TailwindCSS
- @react-google-maps/api
- PapaParse (CSV)
- date-fns

### Backend
- Firebase Firestore
- Firebase Storage
- Firebase Auth
- Firebase Cloud Functions

### APIs
- Google Maps Platform
- Google Calendar API

---

## Next Steps

See additional documentation:
- `PROJECTS_DATA_MODEL.md` - Complete schema definitions
- `PROJECTS_FEATURES.md` - Detailed feature specifications
- `PROJECTS_USER_STORIES.md` - User stories and workflows

---

**Ready to begin Phase 1A implementation.**
