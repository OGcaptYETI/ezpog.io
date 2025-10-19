# Firebase Setup Guide for EZPOG.io

**Complete step-by-step guide to set up Firebase for production**

---

## 📋 Prerequisites

- Google account
- Firebase CLI installed: `npm install -g firebase-tools`
- Project files ready (firestore.rules, firestore.indexes.json)

---

## 🚀 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. Visit https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**

### 1.2 Configure Project
1. **Project name:** `ezpog-io-production`
2. **Project ID:** Will be auto-generated (e.g., `ezpog-io-production-a1b2c`)
3. **Google Analytics:** 
   - Enable (recommended for tracking)
   - Choose or create Analytics account
4. Click **"Create project"**
5. Wait for project creation (~30 seconds)

---

## 🔐 Step 2: Enable Authentication

### 2.1 Navigate to Authentication
1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**

### 2.2 Enable Sign-in Methods
1. Click **"Sign-in method"** tab
2. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle **"Enable"**
   - Toggle **"Email link (passwordless sign-in)"** if desired
   - Click **"Save"**

### 2.3 Optional: Enable Additional Providers
- **Google:** For social login
- **Microsoft:** For enterprise customers
- **Phone:** For SMS authentication

### 2.4 Configure Settings
1. Click **"Settings"** tab
2. **Authorized domains:** Add your domains
   - `localhost` (already added)
   - `ezpog.io`
   - `app.ezpog.io`
   - Any other domains you'll use

---

## 💾 Step 3: Set Up Firestore Database

### 3.1 Create Database
1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. **Location:** Choose closest to your users
   - US: `us-central1` or `us-east1`
   - Europe: `europe-west1`
   - Asia: `asia-southeast1`
4. **Security rules:** Start in **"production mode"**
   - We'll upload custom rules next
5. Click **"Enable"**

### 3.2 Upload Security Rules
```bash
# Login to Firebase CLI
firebase login

# Initialize Firebase in your project
cd c:\Users\Ben\EZPOG_IO_v1\ezpog-io-v2
firebase init firestore

# Select:
# - Use existing project: ezpog-io-production
# - Firestore rules file: firestore.rules
# - Firestore indexes file: firestore.indexes.json

# Deploy rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 3.3 Verify Rules
1. In Firebase Console, go to **Firestore Database**
2. Click **"Rules"** tab
3. Verify your rules are deployed
4. Click **"Publish"** if needed

---

## 📦 Step 4: Set Up Storage

### 4.1 Create Storage Bucket
1. Click **"Storage"** in left sidebar
2. Click **"Get started"**
3. **Security rules:** Start in **"production mode"**
4. **Location:** Same as Firestore
5. Click **"Done"**

### 4.2 Configure Storage Rules
1. Click **"Rules"** tab
2. Replace with production rules:

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
    
    // User profile images
    match /users/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && 
                      request.resource.size < 5 * 1024 * 1024 && // 5MB limit
                      request.resource.contentType.matches('image/.*');
    }
    
    // Organization files
    match /organizations/{orgId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
                      request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    // Product images
    match /products/{productId}/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && 
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
    
    // Planogram exports
    match /planograms/{planogramId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
                      request.resource.size < 20 * 1024 * 1024; // 20MB for PDFs
    }
    
    // Task files
    match /taskFiles/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
                      request.resource.size < 10 * 1024 * 1024;
    }
    
    // Field visit photos
    match /field-visits/{visitId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

3. Click **"Publish"**

---

## 🔧 Step 5: Get Firebase Configuration

### 5.1 Register Web App
1. In Firebase Console, click **gear icon** → **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click **web icon** `</>`
4. **App nickname:** `EZPOG.io Web App`
5. **Firebase Hosting:** Check if you want hosting (optional)
6. Click **"Register app"**

### 5.2 Copy Configuration
You'll see a `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "ezpog-io-production.firebaseapp.com",
  projectId: "ezpog-io-production",
  storageBucket: "ezpog-io-production.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123XYZ"
};
```

### 5.3 Create .env File
Create `.env` in project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=ezpog-io-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ezpog-io-production
VITE_FIREBASE_STORAGE_BUCKET=ezpog-io-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ

# Application
VITE_APP_NAME=EZPOG.io
VITE_APP_VERSION=2.0.0
```

### 5.4 Add .env to .gitignore
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

---

## 🧪 Step 6: Test Connection

### 6.1 Start Dev Server
```bash
npm run dev
```

### 6.2 Test Authentication
1. Open http://localhost:5173
2. Try to sign up a test user
3. Check Firebase Console → Authentication → Users
4. Verify user appears

### 6.3 Test Firestore
1. Create a test document
2. Check Firebase Console → Firestore Database
3. Verify document appears

---

## 📊 Step 7: Set Up Indexes (Automated)

Indexes are automatically created from `firestore.indexes.json` when you deploy.

### Manual Index Creation (if needed)
1. Go to **Firestore Database** → **Indexes** tab
2. Click **"Create index"**
3. Add fields as specified in `firestore.indexes.json`

### Monitor Index Creation
- Indexes take 5-15 minutes to build
- Check **"Indexes"** tab for status
- Green checkmark = ready
- Yellow spinner = building

---

## 🔐 Step 8: Security Checklist

### 8.1 Verify Security Rules
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Test unauthorized access (should fail)
- [ ] Test authorized access (should succeed)

### 8.2 Configure CORS (if needed)
```bash
# Create cors.json
{
  "origin": ["https://ezpog.io", "https://app.ezpog.io"],
  "method": ["GET", "POST", "PUT", "DELETE"],
  "maxAgeSeconds": 3600
}

# Apply CORS
gsutil cors set cors.json gs://ezpog-io-production.appspot.com
```

### 8.3 Set Up Billing Alerts
1. Go to **Project settings** → **Usage and billing**
2. Click **"Details & settings"**
3. Set up budget alerts:
   - Alert at 50% of budget
   - Alert at 90% of budget
   - Alert at 100% of budget

---

## 📈 Step 9: Enable Analytics (Optional)

### 9.1 Configure Google Analytics
1. Go to **Analytics** in Firebase Console
2. Link to Google Analytics property
3. Enable data sharing settings

### 9.2 Add Analytics to App
Already included in Firebase SDK initialization.

---

## 🚀 Step 10: Production Deployment

### 10.1 Firebase Hosting (Optional)
```bash
# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### 10.2 Custom Domain (Optional)
1. Go to **Hosting** → **Add custom domain**
2. Follow DNS configuration steps
3. Wait for SSL certificate (automatic)

---

## 🔍 Step 11: Monitoring & Maintenance

### 11.1 Set Up Monitoring
1. **Performance Monitoring:**
   - Go to **Performance** in Firebase Console
   - Enable performance monitoring
   - Add SDK to app

2. **Crashlytics:**
   - Go to **Crashlytics**
   - Enable crash reporting
   - Add SDK to app

### 11.2 Regular Maintenance
- [ ] Review security rules monthly
- [ ] Check usage and costs weekly
- [ ] Update indexes as queries evolve
- [ ] Backup data regularly
- [ ] Monitor error logs

---

## 📋 Verification Checklist

Before going live, verify:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Security rules deployed and tested
- [ ] Indexes deployed and built
- [ ] Storage configured with rules
- [ ] Configuration added to .env
- [ ] .env added to .gitignore
- [ ] Test user can sign up
- [ ] Test user can sign in
- [ ] Test data can be written to Firestore
- [ ] Test data can be read from Firestore
- [ ] Test file upload to Storage
- [ ] Billing alerts configured
- [ ] Team members have access

---

## 🆘 Troubleshooting

### Issue: "Permission denied" errors
**Solution:** Check security rules, ensure user is authenticated

### Issue: "Index required" errors
**Solution:** Deploy indexes: `firebase deploy --only firestore:indexes`

### Issue: "Storage CORS error"
**Solution:** Configure CORS for storage bucket

### Issue: "Auth domain not authorized"
**Solution:** Add domain to authorized domains in Authentication settings

### Issue: Slow queries
**Solution:** Check if composite indexes are needed

---

## 📚 Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started
- **Storage Security Rules:** https://firebase.google.com/docs/storage/security
- **Firebase CLI Reference:** https://firebase.google.com/docs/cli

---

## ✅ Next Steps

After Firebase is set up:

1. **Test authentication flow**
2. **Create seed data** (test products, fixtures, etc.)
3. **Build React Flow prototype** (Option C)
4. **Continue with Week 1 tasks**

---

**Firebase setup complete! Ready to build the application.** 🎉
