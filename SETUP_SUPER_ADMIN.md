# Setup Super Admin

## Update Your User Role in Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `ezpog-5c2b6`
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Find your user document (your UID)
6. Edit the document and add/update:
   ```
   systemRole: "super_admin"
   ```
7. Save the document

## Your User ID
Check the browser console after logging in - it will show your UID.

Or run this in browser console:
```javascript
firebase.auth().currentUser.uid
```

## After Update
Once you've updated your role in Firebase, refresh the app and you'll have Super Admin access!
