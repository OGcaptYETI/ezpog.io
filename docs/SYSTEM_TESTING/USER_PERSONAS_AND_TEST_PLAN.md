# EZPOG System Testing - User Personas & Test Plan

## Overview
This document outlines the test personas and comprehensive test plan for validating CRUD operations, role-based access control, and data visibility across the EZPOG application.

---

## 🎯 Testing Strategy

### Super Admin Testing
- **Account:** admin@ezpog.io
- **Purpose:** Verify super admin portal, impersonation, and system-wide access
- **Status:** ✅ Fully functional

### Organization User Testing
- **Purpose:** Verify CRUD permissions, data visibility, and role-based access
- **Method:** Test as actual organization users with different roles
- **Focus:** Security boundaries and feature access

---

## 👥 Test Personas

### 1. Super Administrator
**Email:** `admin@ezpog.io`  
**Organization:** N/A (System-level)  
**Role:** N/A  
**System Role:** `super_admin`

**Permissions:**
- ✅ Access Super Admin portal
- ✅ Manage all organizations
- ✅ Manage all users across all orgs
- ✅ View system-wide analytics
- ✅ Configure system settings
- ✅ Impersonate any user
- ✅ Full CRUD on all resources

**Test Focus:**
- Super Admin portal functionality
- Cross-organization data access
- User impersonation mode
- System settings management
- Global analytics and reporting

---

### 2. Organization Admin
**Email:** `demoadmin@ezpog.io`  
**Organization:** Demo Organization  
**Role:** `admin`  
**System Role:** `user`

**Permissions:**
- ✅ Full CRUD on organization's projects
- ✅ Full CRUD on organization's products
- ✅ Full CRUD on organization's planograms
- ✅ Manage organization users (invite, edit, remove)
- ✅ Assign user roles within organization
- ✅ View organization analytics
- ✅ Manage field teams
- ✅ Configure organization settings
- ❌ Cannot access other organizations' data
- ❌ Cannot access Super Admin portal

**Test Cases:**
- [ ] Create a new project
- [ ] Edit existing project details
- [ ] Delete a project
- [ ] Create a new product
- [ ] Edit product catalog
- [ ] Delete a product
- [ ] Create a planogram
- [ ] Assign planogram to stores
- [ ] Delete a planogram
- [ ] Invite a new user to organization
- [ ] Edit user roles (promote/demote)
- [ ] Remove user from organization
- [ ] View organization analytics dashboard
- [ ] Create and manage field teams
- [ ] Verify cannot see other organization's data
- [ ] Verify cannot access `/super-admin` routes

---

### 3. Manager
**Email:** `demomanager@ezpog.io`  
**Organization:** Demo Organization  
**Role:** `manager`  
**System Role:** `user`

**Permissions:**
- ✅ View all organization projects
- ✅ Create new projects
- ✅ Edit projects they're assigned to
- ✅ Create and manage tasks
- ✅ Assign tasks to team members
- ✅ View all products and planograms
- ✅ Create products
- ✅ View organization analytics
- ❌ Cannot delete projects
- ❌ Cannot manage users (invite/edit/remove)
- ❌ Cannot delete products
- ❌ Cannot access other organizations' data

**Test Cases:**
- [ ] View projects dashboard
- [ ] Create a new project
- [ ] Edit a project they're assigned to
- [ ] Try to edit a project they're NOT assigned to (should fail)
- [ ] Try to delete a project (should fail)
- [ ] Create a task
- [ ] Assign task to team member
- [ ] Update task status
- [ ] Create a new product
- [ ] View product catalog
- [ ] Try to delete a product (should fail)
- [ ] View planograms library
- [ ] View analytics dashboard
- [ ] Try to invite a user (should fail or show error)
- [ ] Try to edit user roles (should fail)
- [ ] Verify cannot see other organization's data

---

### 4. Regular User
**Email:** `demouser@ezpog.io`  
**Organization:** Demo Organization  
**Role:** `user`  
**System Role:** `user`

**Permissions:**
- ✅ View projects they're a member of
- ✅ View tasks assigned to them
- ✅ Update tasks assigned to them
- ✅ View product catalog (read-only)
- ✅ View planograms (read-only)
- ✅ View their personal dashboard
- ❌ Cannot create projects
- ❌ Cannot delete projects
- ❌ Cannot create products
- ❌ Cannot edit products
- ❌ Cannot create planograms
- ❌ Cannot manage users
- ❌ Cannot access analytics

**Test Cases:**
- [ ] View dashboard (should show limited, relevant data)
- [ ] View projects (should only see projects they're member of)
- [ ] Try to create a project (should fail or be hidden)
- [ ] View task list
- [ ] Update status of task assigned to them
- [ ] Try to update task NOT assigned to them (should fail)
- [ ] View product catalog
- [ ] Try to create a product (should fail or be hidden)
- [ ] Try to edit a product (should fail or be hidden)
- [ ] View planograms library
- [ ] Try to create a planogram (should fail or be hidden)
- [ ] Try to access analytics (should fail or be hidden)
- [ ] Try to access user management (should fail or be hidden)
- [ ] Verify cannot see other organization's data

---

### 5. Field Team Member
**Email:** `demofieldteam@ezpog.io`  
**Organization:** Demo Organization  
**Role:** `field_team`  
**System Role:** `user`

**Permissions:**
- ✅ View assigned planograms
- ✅ Check in/out of store locations
- ✅ Upload visit photos
- ✅ Submit compliance reports
- ✅ View store assignments
- ✅ Update visit status
- ❌ Cannot edit planograms
- ❌ Cannot create/edit products
- ❌ Cannot create/edit projects
- ❌ Cannot manage users
- ❌ Cannot access analytics

**Test Cases:**
- [ ] View field teams dashboard
- [ ] View assigned stores
- [ ] Check in to a store location
- [ ] Upload visit photos
- [ ] Submit compliance report
- [ ] View assigned planogram
- [ ] Update visit status
- [ ] Try to edit planogram (should fail or be hidden)
- [ ] Try to edit product (should fail or be hidden)
- [ ] Try to create a project (should fail or be hidden)
- [ ] Try to access analytics (should fail)
- [ ] Verify cannot see other organization's data

---

## 🔐 Security Test Cases

### Cross-Organization Isolation
- [ ] User from Demo Org cannot see Acme Corp's data
- [ ] User from Acme Corp cannot see Demo Org's data
- [ ] Organization filters work correctly on all pages
- [ ] Direct URL access to other org's resources returns 403/404

### Role-Based Access Control
- [ ] Regular user cannot access admin functions
- [ ] Manager cannot delete projects
- [ ] Field team cannot edit products
- [ ] All role restrictions enforced on API level (not just UI)

### Data Visibility
- [ ] Users only see projects they're members of
- [ ] Users only see tasks assigned to them or their projects
- [ ] Dashboard stats only show user's relevant data
- [ ] Search results filtered by organization

### Authentication & Authorization
- [ ] Unauthenticated users redirected to login
- [ ] JWT tokens expire correctly
- [ ] Firestore rules enforce permissions
- [ ] Super admin can impersonate without breaking security

---

## 📋 Functional Test Cases

### Projects
- [ ] Create project with all fields
- [ ] Edit project details
- [ ] Add/remove project members
- [ ] Change project status
- [ ] Delete project (admin only)
- [ ] Filter projects by status
- [ ] Search projects by name
- [ ] View project details page

### Products
- [ ] Create product with all fields
- [ ] Upload product image
- [ ] Edit product details
- [ ] Update product dimensions
- [ ] Delete product (admin only)
- [ ] Filter products by category
- [ ] Filter products by brand
- [ ] Search products by name/SKU
- [ ] Bulk import products

### Planograms
- [ ] Create new planogram
- [ ] Edit planogram details
- [ ] Assign planogram to stores
- [ ] Change planogram status
- [ ] Delete planogram (admin only)
- [ ] Filter planograms by status
- [ ] Search planograms
- [ ] View planogram designer

### Users (Admin Only)
- [ ] Invite new user
- [ ] Edit user profile
- [ ] Change user role
- [ ] Change user organization
- [ ] Suspend user account
- [ ] Reactivate user account
- [ ] Delete user
- [ ] Resend invitation

### Field Teams
- [ ] Create field team
- [ ] Edit team details
- [ ] Assign team members
- [ ] Assign stores to team
- [ ] View team activity
- [ ] Deactivate team

### Analytics
- [ ] View dashboard statistics
- [ ] Filter by date range
- [ ] Export reports
- [ ] View user activity
- [ ] View organization metrics

---

## 🧪 Testing Workflow

### 1. Setup Test Users
**Via Super Admin Panel:**
1. Login as `admin@ezpog.io`
2. Navigate to `/super-admin/users`
3. Click "Invite User" for each persona
4. Fill in details (name, email, org, role)
5. Copy invitation links
6. Open invitation links in incognito windows
7. Complete signup for each user

### 2. Multi-User Testing
**Use browser profiles to test simultaneously:**
- **Chrome Profile 1:** Super Admin (admin@ezpog.io)
- **Chrome Profile 2:** Org Admin (demoadmin@ezpog.io)
- **Incognito Window 1:** Manager (manager@ezpog.io)
- **Incognito Window 2:** Regular User (user@ezpog.io)
- **Incognito Window 3:** Field Team (fieldteam@ezpog.io)

### 3. Test Execution
1. Start with Super Admin tests
2. Create test data (orgs, projects, products)
3. Test each persona in order (admin → manager → user → field team)
4. Verify permissions at each level
5. Test cross-org isolation
6. Test edge cases and error handling

### 4. Real-Time Testing
1. Have two users logged in simultaneously
2. User A creates a project
3. User B should see update in real-time
4. Test live updates across all features

---

## ✅ Success Criteria

### Security
- ✅ All Firestore rules enforced correctly
- ✅ No cross-organization data leaks
- ✅ Role-based access working as expected
- ✅ Super admin can impersonate without issues

### Functionality
- ✅ All CRUD operations work for authorized users
- ✅ All CRUD operations fail for unauthorized users
- ✅ Data persistence across page refreshes
- ✅ Real-time updates working correctly

### User Experience
- ✅ Appropriate UI elements shown/hidden based on role
- ✅ Clear error messages for unauthorized actions
- ✅ Smooth navigation and page transitions
- ✅ Responsive design works on all screen sizes

### Performance
- ✅ Pages load within 2 seconds
- ✅ No unnecessary re-renders
- ✅ Efficient Firestore queries (no full collection scans)
- ✅ Images and assets optimized

---

## 🐛 Bug Tracking

### High Priority
- [ ] _List critical bugs here_

### Medium Priority
- [ ] _List important bugs here_

### Low Priority
- [ ] _List minor issues here_

### Enhancements
- [ ] _List feature requests here_

---

## 📊 Test Results Template

### Test Session: [Date]
**Tester:** [Name]  
**Persona:** [Which user]  
**Build:** [Commit hash or version]

| Test Case | Status | Notes |
|-----------|--------|-------|
| [Feature] | ✅/❌ | [Details] |

**Overall Result:** ✅ Pass / ❌ Fail  
**Issues Found:** [Count]  
**Blocker Issues:** [Count]

---

## 📝 Notes

- Always test in both Chrome and Firefox for compatibility
- Test on mobile devices (responsive design)
- Clear browser cache between major test runs
- Use Chrome DevTools to simulate different network conditions
- Check browser console for errors
- Monitor Firestore usage to prevent quota issues
- Document all bugs with screenshots and reproduction steps

# Test Credentials (LOCAL ONLY - DO NOT COMMIT)

## Super Admin
- **Email:** admin@ezpog.io
- **Password:** [your password]
- **Access:** Full system access, Super Admin portal

---

## Demo Organization - Test Users

### Organization Admin
- **Email:** demoadmin@ezpog.io
- **Password:** Test123!
- **Role:** admin
- **Org:** Demo Organization
- **Access:** Full CRUD on org resources, user management

### Manager
- **Email:** manager@ezpog.io
- **Password:** Test123!
- **Role:** manager
- **Org:** Demo Organization
- **Access:** Create/edit projects, manage tasks, limited delete

### Regular User
- **Email:** user@ezpog.io
- **Password:** Test123!
- **Role:** user
- **Org:** Demo Organization
- **Access:** View-only, update assigned tasks

### Field Team
- **Email:** fieldteam@ezpog.io
- **Password:** Test123!
- **Role:** field_team
- **Org:** Demo Organization
- **Access:** Check-in/out, upload photos, view assigned planograms

---

## Quick Login URLs
- **Super Admin Portal:** http://localhost:5173/super-admin/users
- **User Dashboard:** http://localhost:5173/dashboard
- **Login Page:** http://localhost:5173/login

---

**Note:** These are test accounts only. Never use weak passwords in production!---

**Last Updated:** October 12, 2025  
**Next Review:** After major feature additions


