# Firebase Migration & Consolidation Plan

## Overview

Consolidate two separate Firebase projects into one unified backend for EZPOG.io platform.

**Current State:**
- `ezpog-io-test` (ezpog-io app)
- `planogramtool` (PlanogramTool app)

**Target State:**
- `ezpog-io-production` (unified platform)

---

## Migration Strategy

### Phase 1: Preparation (Week 1)

#### 1.1 Audit Current Data

**ezpog-io-test Collections:**
```
users/
projects/
tasks/
products/
packagingTypes/
categories/
notifications/
settings/
```

**planogramtool Collections:**
```
users/
projects/
products/
fixtures/
components/
planograms/
packagingTypes/
categories/
```

#### 1.2 Identify Overlaps and Conflicts

| Collection | ezpog-io | planogramtool | Action |
|------------|----------|---------------|--------|
| users | ✓ | ✓ | Merge, deduplicate |
| projects | ✓ | ✓ | Merge with type flag |
| products | ✓ | ✓ | Merge, prefer richer data |
| fixtures | ✗ | ✓ | Import all |
| components | ✗ | ✓ | Import all |
| planograms | ✗ | ✓ | Import all |
| tasks | ✓ | ✗ | Import all |
| notifications | ✓ | ✗ | Import all |

#### 1.3 Export All Data

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export ezpog-io-test
firebase --project ezpog-io-test firestore:export ./exports/ezpog-io-test

# Export planogramtool
firebase --project planogramtool firestore:export ./exports/planogramtool
```

---

### Phase 2: New Firebase Project Setup (Week 1)

#### 2.1 Create New Project

1. Go to Firebase Console
2. Create new project: `ezpog-io-production`
3. Enable services:
   - ✓ Authentication
   - ✓ Firestore Database
   - ✓ Storage
   - ✓ Hosting
   - ✓ Cloud Functions (optional)
   - ✓ Analytics (optional)

#### 2.2 Configure Authentication

**Enable Auth Methods:**
- ✓ Email/Password
- ✓ Google (optional)
- ✓ Microsoft (optional for enterprise)

**Settings:**
```javascript
// Authorized domains
- localhost
- ezpog.io
- app.ezpog.io
- *.ezpog.io
```

#### 2.3 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function hasOrgAccess(orgId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Organizations
    match /organizations/{orgId} {
      allow read: if hasOrgAccess(orgId);
      allow write: if hasOrgAccess(orgId);
      
      match /members/{memberId} {
        allow read: if hasOrgAccess(orgId);
        allow write: if hasOrgAccess(orgId);
      }
    }
    
    // Projects
    match /projects/{projectId} {
      allow read: if isAuthenticated() && 
        resource.data.organizationId in request.auth.token.organizations;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        request.auth.uid in resource.data.members;
      
      match /tasks/{taskId} {
        allow read, write: if isAuthenticated();
      }
    }
    
    // Products (organization-scoped)
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow write: if hasOrgAccess(resource.data.organizationId);
    }
    
    // Fixtures (organization-scoped)
    match /fixtures/{fixtureId} {
      allow read: if isAuthenticated();
      allow write: if hasOrgAccess(resource.data.organizationId);
    }
    
    // Planograms
    match /planograms/{planogramId} {
      allow read: if isAuthenticated();
      allow write: if hasOrgAccess(resource.data.organizationId);
      
      match /versions/{versionId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
      }
    }
    
    // Inventory
    match /inventory/{locationId} {
      allow read: if isAuthenticated();
      allow write: if hasOrgAccess(resource.data.organizationId);
      
      match /items/{itemId} {
        allow read, write: if isAuthenticated();
      }
    }
    
    // Field Teams
    match /field-teams/{teamId} {
      allow read: if isAuthenticated();
      allow write: if hasOrgAccess(resource.data.organizationId);
      
      match /visits/{visitId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isOwner(resource.data.userId);
      }
    }
    
    // Shared reference data (read-only for most users)
    match /packaging-types/{typeId} {
      allow read: if isAuthenticated();
      allow write: if request.auth.token.admin == true;
    }
    
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

#### 2.4 Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // User uploads
    match /users/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Organization uploads
    match /organizations/{orgId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Product images
    match /products/{productId}/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if isAuthenticated();
    }
    
    // Planogram exports
    match /planograms/{planogramId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Field team photos
    match /field-visits/{visitId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

#### 2.5 Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "planograms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

### Phase 3: Data Transformation (Week 2)

#### 3.1 Create Migration Scripts

**Script Structure:**
```
migration-scripts/
├── 01-export-data.js
├── 02-transform-users.js
├── 03-transform-projects.js
├── 04-transform-products.js
├── 05-transform-fixtures.js
├── 06-transform-planograms.js
├── 07-import-data.js
└── utils/
    ├── firestore-helpers.js
    └── data-validators.js
```

#### 3.2 User Migration Script

```javascript
// 02-transform-users.js
import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';

// Load exported data
const ezpogUsers = JSON.parse(readFileSync('./exports/ezpog-io-test/users.json'));
const planogramUsers = JSON.parse(readFileSync('./exports/planogramtool/users.json'));

// Merge users (deduplicate by email)
const userMap = new Map();

// Process ezpog users
ezpogUsers.forEach(user => {
  userMap.set(user.email, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: user.createdAt,
    source: 'ezpog-io',
    organizations: [user.organizationId || 'default'],
    preferences: user.preferences || {},
    role: user.role || 'user'
  });
});

// Merge planogram users
planogramUsers.forEach(user => {
  if (userMap.has(user.email)) {
    // User exists, merge data
    const existing = userMap.get(user.email);
    existing.organizations = [...new Set([...existing.organizations, user.organizationId || 'default'])];
    existing.source = 'both';
  } else {
    // New user from planogram
    userMap.set(user.email, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      source: 'planogramtool',
      organizations: [user.organizationId || 'default'],
      preferences: user.preferences || {},
      role: user.role || 'user'
    });
  }
});

// Save transformed data
const transformedUsers = Array.from(userMap.values());
writeFileSync('./transformed/users.json', JSON.stringify(transformedUsers, null, 2));

console.log(`Merged ${transformedUsers.length} users from ${ezpogUsers.length + planogramUsers.length} total`);
```

#### 3.3 Product Migration Script

```javascript
// 04-transform-products.js
import { readFileSync, writeFileSync } from 'fs';

const ezpogProducts = JSON.parse(readFileSync('./exports/ezpog-io-test/products.json'));
const planogramProducts = JSON.parse(readFileSync('./exports/planogramtool/products.json'));

const productMap = new Map();

// Helper to create product key
function getProductKey(product) {
  return product.upc || `${product.name}-${product.brand}`.toLowerCase();
}

// Process ezpog products
ezpogProducts.forEach(product => {
  const key = getProductKey(product);
  productMap.set(key, {
    id: product.id,
    name: product.name,
    brand: product.brand,
    brandFamily: product.brandFamily,
    upc: product.upc,
    category: product.category,
    packagingTypeId: product.packagingTypeId,
    dimensions: product.dimensions || {},
    imageUrl: product.imageUrl,
    organizationId: product.organizationId || 'default',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    source: 'ezpog-io',
    metadata: {
      ezpogId: product.id
    }
  });
});

// Merge planogram products
planogramProducts.forEach(product => {
  const key = getProductKey(product);
  
  if (productMap.has(key)) {
    // Product exists, merge additional data
    const existing = productMap.get(key);
    existing.metadata.planogramId = product.id;
    existing.source = 'both';
    
    // Prefer richer data
    if (product.dimensions && !existing.dimensions.width) {
      existing.dimensions = product.dimensions;
    }
    if (product.imageUrl && !existing.imageUrl) {
      existing.imageUrl = product.imageUrl;
    }
  } else {
    // New product from planogram
    productMap.set(key, {
      id: product.id,
      name: product.name,
      brand: product.brand,
      brandFamily: product.brandFamily,
      upc: product.upc,
      category: product.category,
      packagingTypeId: product.packagingTypeId,
      dimensions: product.dimensions || {},
      imageUrl: product.imageUrl,
      organizationId: product.organizationId || 'default',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      source: 'planogramtool',
      metadata: {
        planogramId: product.id
      }
    });
  }
});

const transformedProducts = Array.from(productMap.values());
writeFileSync('./transformed/products.json', JSON.stringify(transformedProducts, null, 2));

console.log(`Merged ${transformedProducts.length} products`);
```

#### 3.4 Fixture Migration Script

```javascript
// 05-transform-fixtures.js
import { readFileSync, writeFileSync } from 'fs';

// Fixtures only exist in planogramtool
const planogramFixtures = JSON.parse(readFileSync('./exports/planogramtool/fixtures.json'));

const transformedFixtures = planogramFixtures.map(fixture => ({
  id: fixture.id,
  name: fixture.name,
  type: fixture.type,
  dimensions: {
    width: fixture.width,
    height: fixture.height,
    depth: fixture.depth
  },
  components: fixture.components || [],
  shelves: fixture.shelves || [],
  organizationId: fixture.organizationId || 'default',
  isTemplate: fixture.isTemplate || false,
  createdAt: fixture.createdAt,
  updatedAt: fixture.updatedAt,
  createdBy: fixture.createdBy,
  metadata: {
    originalId: fixture.id,
    source: 'planogramtool'
  }
}));

writeFileSync('./transformed/fixtures.json', JSON.stringify(transformedFixtures, null, 2));

console.log(`Transformed ${transformedFixtures.length} fixtures`);
```

---

### Phase 4: Import to New Project (Week 2)

#### 4.1 Import Script

```javascript
// 07-import-data.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize new Firebase project
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ezpog-io-production.firebaseio.com'
});

const db = admin.firestore();

async function importCollection(collectionName, dataFile) {
  const data = JSON.parse(readFileSync(dataFile));
  const batch = db.batch();
  let count = 0;
  
  for (const doc of data) {
    const docRef = db.collection(collectionName).doc(doc.id);
    batch.set(docRef, doc);
    count++;
    
    // Firestore batch limit is 500
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Imported ${count} documents to ${collectionName}`);
    }
  }
  
  await batch.commit();
  console.log(`Completed import of ${count} documents to ${collectionName}`);
}

async function runImport() {
  try {
    await importCollection('users', './transformed/users.json');
    await importCollection('products', './transformed/products.json');
    await importCollection('fixtures', './transformed/fixtures.json');
    await importCollection('projects', './transformed/projects.json');
    await importCollection('planograms', './transformed/planograms.json');
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runImport();
```

---

### Phase 5: Update Application Code (Week 3)

#### 5.1 New Firebase Config

```typescript
// src/services/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### 5.2 Environment Variables

```env
# .env.production
VITE_FIREBASE_API_KEY=your-new-api-key
VITE_FIREBASE_AUTH_DOMAIN=ezpog-io-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ezpog-io-production
VITE_FIREBASE_STORAGE_BUCKET=ezpog-io-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

---

### Phase 6: Testing & Validation (Week 3)

#### 6.1 Validation Checklist

- [ ] All users can authenticate
- [ ] User data is accessible
- [ ] Projects load correctly
- [ ] Products display properly
- [ ] Fixtures are available
- [ ] Planograms render correctly
- [ ] File uploads work
- [ ] Image URLs are valid
- [ ] Security rules are enforced
- [ ] Performance is acceptable

#### 6.2 Test Queries

```typescript
// Test user access
const userDoc = await getDoc(doc(db, 'users', userId));
console.log('User data:', userDoc.data());

// Test products query
const productsQuery = query(
  collection(db, 'products'),
  where('organizationId', '==', orgId),
  limit(10)
);
const productsSnapshot = await getDocs(productsQuery);
console.log('Products count:', productsSnapshot.size);

// Test planograms
const planogramsQuery = query(
  collection(db, 'planograms'),
  where('organizationId', '==', orgId)
);
const planogramsSnapshot = await getDocs(planogramsQuery);
console.log('Planograms count:', planogramsSnapshot.size);
```

---

### Phase 7: Cutover (Week 4)

#### 7.1 Pre-Cutover

1. **Freeze old databases** (read-only mode)
2. **Final data sync** (any last-minute changes)
3. **Backup everything**
4. **Test rollback procedure**

#### 7.2 Cutover Steps

1. **Update DNS** (if applicable)
2. **Deploy new application** with new Firebase config
3. **Monitor for errors**
4. **Verify critical paths**
5. **Notify users** of migration

#### 7.3 Post-Cutover

1. **Monitor for 48 hours**
2. **Fix any issues**
3. **Keep old projects running** (read-only) for 30 days
4. **Archive old data**
5. **Decommission old projects** after 90 days

---

## Rollback Plan

If migration fails:

1. **Revert DNS** (if changed)
2. **Deploy old application** version
3. **Re-enable old Firebase projects**
4. **Investigate issues**
5. **Fix and retry**

---

## Cost Estimation

### Current Costs (2 projects)
- ezpog-io-test: ~$X/month
- planogramtool: ~$Y/month
- **Total: ~$(X+Y)/month**

### New Costs (1 project)
- ezpog-io-production: ~$(X+Y-Z)/month
- **Savings: ~$Z/month** (reduced overhead)

### Firebase Pricing Tiers
- **Spark (Free):** Good for development
- **Blaze (Pay-as-you-go):** Recommended for production
  - Firestore: $0.06/100K reads, $0.18/100K writes
  - Storage: $0.026/GB
  - Bandwidth: $0.12/GB

---

## Timeline Summary

| Week | Phase | Tasks |
|------|-------|-------|
| 1 | Preparation | Audit, export, create new project |
| 2 | Transformation | Transform and import data |
| 3 | Integration | Update code, test thoroughly |
| 4 | Cutover | Deploy and monitor |

**Total: 4 weeks**

---

## Next Steps

1. **Approve migration plan**
2. **Create new Firebase project**
3. **Run data export**
4. **Begin transformation scripts**
5. **Test in staging environment**
6. **Schedule cutover date**

**Ready to begin? Let me know and I can help with the migration scripts!**
