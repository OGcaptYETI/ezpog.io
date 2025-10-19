# Projects Module - User Stories & Workflows

Complete user stories for all roles in the Projects module.

---

## User Personas

### 1. Project Manager (Admin/Manager Role)
**Responsibilities:**
- Create and plan reset projects
- Assign stores and schematics
- Schedule field team visits
- Monitor project progress
- Review completion photos
- Handle issues and escalations

### 2. Field Team Member (Field Team Role)
**Responsibilities:**
- View assigned stores
- Navigate to store locations
- Execute resets per schematic
- Take before/after photos
- Verify product presence
- Report issues

### 3. Buyer/Category Manager (Manager Role)
**Responsibilities:**
- Update schematics
- Review project outcomes
- Make strategic decisions
- Approve budgets

### 4. Store Operations (User Role)
**Responsibilities:**
- View project status
- Track store completion
- Read-only access

---

## User Stories

### Project Manager Stories

#### Story 1: Create New Reset Project
**As a** Project Manager  
**I want to** create a new reset project for Q1 2026 Spring Refresh  
**So that** I can organize the execution across 500 stores  

**Acceptance Criteria:**
- Can enter project name, description, type
- Can set start and end dates
- Can assign team members
- Can save as draft or activate immediately
- Receives confirmation toast on success

**Workflow:**
1. Navigate to Projects page
2. Click "New Project" button
3. Fill Basic Info tab (name, type, dates)
4. Add team members in Team tab
5. Click "Save & Activate"
6. Project appears in list with "Active" status

---

#### Story 2: Import Store List from CSV
**As a** Project Manager  
**I want to** import 500 stores from my Excel spreadsheet  
**So that** I don't have to manually enter each store  

**Acceptance Criteria:**
- Can upload CSV file
- Can map CSV columns to store fields
- See validation errors before import
- Import completes with progress indicator
- Can download error report if some fail

**Workflow:**
1. Open project in edit mode
2. Go to Stores tab
3. Click "Import from CSV"
4. Drag-and-drop CSV file
5. Map columns (StoreID → Store ID, Address → Address, etc.)
6. Review preview of first 5 rows
7. Click "Import 500 Stores"
8. Watch progress bar
9. See success message: "485 stores imported, 15 errors"
10. Download error CSV to fix issues

---

#### Story 3: Assign Schematic to Multiple Stores
**As a** Project Manager  
**I want to** assign "Spring Refresh POG v2.1" to all Standard format stores  
**So that** field teams know which layout to execute  

**Acceptance Criteria:**
- Can filter stores by format
- Can select multiple stores
- Can assign schematic in bulk
- Each store shows assigned schematic name
- Product list populates automatically

**Workflow:**
1. Open project detail page
2. Go to Stores list
3. Filter by Store Format = "Standard"
4. Select all filtered stores (checkbox)
5. Click "Assign Schematic" bulk action
6. Choose "Spring Refresh POG v2.1" from dropdown
7. Confirm assignment
8. See schematic name appear on all selected stores

---

#### Story 4: Schedule Field Team Visits
**As a** Project Manager  
**I want to** schedule John Smith to visit 15 stores next week  
**So that** he has a clear task list and calendar  

**Acceptance Criteria:**
- Can select field team member
- Can assign specific stores to member
- Can set date and time window
- System checks for scheduling conflicts
- Field team receives notification

**Workflow:**
1. Open project detail
2. Go to Calendar view
3. Select week of March 10-14
4. Click on Monday March 10
5. See list of unscheduled stores
6. Select 5 stores for Monday
7. Assign to "John Smith"
8. Set time window "9am-5pm"
9. Repeat for Tuesday-Friday
10. Click "Save Schedule"
11. John receives email: "15 stores scheduled for next week"

---

#### Story 5: Review Completed Store Execution
**As a** Project Manager  
**I want to** review the before/after photos from Store #42  
**So that** I can verify the reset was done correctly  

**Acceptance Criteria:**
- Can view before/after photos side-by-side
- Can read field team notes
- Can see product verification checklist
- Can approve or flag for redo

**Workflow:**
1. Open project detail
2. Filter stores by Status = "Completed"
3. Click on Store #42
4. Expand store detail panel
5. View Before photos (3 images)
6. View After photos (3 images)
7. Read notes: "All products present. Shelves cleaned."
8. Check product verification: 24/24 products verified
9. Click "Approve" or "Flag for Redo"

---

### Field Team Member Stories

#### Story 6: View My Assigned Stores
**As a** Field Team Member  
**I want to** see all stores assigned to me this week  
**So that** I can plan my route  

**Acceptance Criteria:**
- Can filter by date range
- Stores sorted by scheduled date
- Shows distance from current location
- Shows store address and schematic name

**Workflow:**
1. Navigate to "My Tasks" page
2. Filter: "This Week"
3. See list of 15 stores
4. Each store card shows:
   - Store name and address
   - Scheduled date: "Monday, March 10, 9am-12pm"
   - Distance: "12 miles away"
   - Schematic: "Spring Refresh POG v2.1"
   - "Navigate" button

---

#### Story 7: Navigate to Store Location
**As a** Field Team Member  
**I want to** get turn-by-turn directions to Store #42  
**So that** I can find the location easily  

**Acceptance Criteria:**
- Can click "Navigate" button
- Opens Google Maps with directions
- Route starts from my current location
- Can see estimated arrival time

**Workflow:**
1. On "My Tasks" page
2. Click "Navigate" on Store #42
3. System detects current location
4. Opens Google Maps app (or web)
5. Route displayed: "12.3 miles, 18 minutes"
6. Click "Start" in Google Maps

---

#### Story 8: Execute Store Reset with Photos
**As a** Field Team Member  
**I want to** complete the reset at Store #42 and document with photos  
**So that** my manager knows the work is done  

**Acceptance Criteria:**
- Can check in with GPS timestamp
- Can capture before photos
- Can view schematic during execution
- Can verify each product
- Can capture after photos
- Can check out and mark complete

**Workflow:**
1. Arrive at Store #42
2. Open EZPOG app
3. Go to Store #42 execution page
4. Click "Check In" (GPS + timestamp captured)
5. Take 3 before photos (empty shelves)
6. View schematic reference (split screen)
7. Start placing products per schematic
8. Check off each product in verification list:
   - ☑ Coca-Cola 12oz Can (present)
   - ☑ Pepsi 12oz Can (present)
   - ☑ Dr. Pepper 12oz Can (present)
   - ... (21 more products)
9. Take 3 after photos (completed reset)
10. Add notes: "All products present. Shelves cleaned and organized."
11. Click "Mark Complete"
12. Store status changes to "Completed"
13. Manager receives notification

---

#### Story 9: Report Issue During Execution
**As a** Field Team Member  
**I want to** report that Product X is missing from Store #42  
**So that** my manager can send the missing product  

**Acceptance Criteria:**
- Can report issue from execution page
- Can select issue type and severity
- Can add description and photo
- Manager receives immediate notification

**Workflow:**
1. During execution at Store #42
2. Realize "Coca-Cola Zero Sugar 12oz" is missing
3. Click "Report Issue"
4. Select issue type: "Missing Product"
5. Select severity: "Medium"
6. Enter description: "Coca-Cola Zero Sugar 12oz is out of stock. Cannot complete reset."
7. Take photo of empty cooler section
8. Click "Submit Issue"
9. Manager receives alert: "Issue reported at Store #42"
10. Can continue execution with other products

---

### Category Manager Stories

#### Story 10: Update Schematic and Trigger Reset Flags
**As a** Category Manager  
**I want to** update "Spring Refresh POG v2.1" to add a new product  
**So that** all stores get the updated assortment  

**Acceptance Criteria:**
- Can edit schematic in Planograms module
- System detects change automatically
- All affected stores get reset flag
- Project managers receive notification

**Workflow:**
1. Go to Planograms module
2. Open "Spring Refresh POG v2.1"
3. Add new product: "Coca-Cola Cherry 12oz"
4. Click "Save Changes"
5. System increments version to v2.2
6. Cloud Function detects change
7. Finds 3 active projects using this schematic
8. Finds 287 stores across those projects
9. Sets resetRequired = true on all 287 stores
10. Sends email to project managers:
    "Schematic Spring Refresh POG v2.1 was updated. 287 stores require re-visit."
11. Project managers see 🚩 flag on affected stores

---

## Workflow Diagrams

### Project Lifecycle

```
Draft → Planning → Active → Completed
  ↓        ↓         ↓          ↓
Cancel   Cancel   On Hold    Archive
                     ↓
                  Active
```

### Store Execution Lifecycle

```
Pending → Scheduled → In Progress → Completed
                            ↓
                         Failed
                            ↓
                       Rescheduled
                            ↓
                        Scheduled
```

### Reset Flag Workflow

```
Schematic Updated
        ↓
Cloud Function Triggered
        ↓
Find All Projects Using Schematic
        ↓
Find All Stores in Those Projects
        ↓
Set resetRequired = true
        ↓
Notify Project Managers
        ↓
Field Teams Re-Execute
        ↓
Mark Complete → Clear Reset Flag
```

---

## Integration Points

### With Products Module
- View product details from schematic
- Check product availability
- Link to product images

### With Planograms Module
- Reference schematics by ID
- View schematic preview
- Detect schematic changes

### With Field Teams Module
- Generate task lists
- Track execution progress
- Capture compliance data

### With Stores Module (Future)
- Import store directory
- View store details
- Map store locations

### External Integrations
- **Google Maps:** Navigation and routing
- **Google Calendar:** Schedule export
- **Email/SMS:** Notifications
- **Photo Storage:** Firebase Storage
