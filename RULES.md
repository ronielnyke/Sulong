# SULONG Firebase rules

SULONG uses only Firebase Authentication and Cloud Firestore, so it runs on the free **Spark plan**. Firebase Storage is not used (it needs the paid Blaze plan). Evidence photos are saved in Firestore, in the `photos` collection.

## Publish the rules
Option A (one command):
```
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```
Option B: Firebase Console > Firestore Database > Rules, paste the block below, then Publish.

## firestore.rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signed(){ return request.auth != null; }
    function profile(){ return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function hasProfile(){ return exists(/databases/$(database)/documents/users/$(request.auth.uid)); }
    // The role counts only when the account is active (approved).
    function role(){ return signed() && hasProfile() && profile().get('status','active') == 'active' ? profile().role : 'none'; }
    function isAdmin(){ return role() == 'Super Admin'; }

    match /users/{uid} {
      allow read: if signed() && (request.auth.uid == uid || isAdmin());
      allow create: if signed() && request.auth.uid == uid && (
        (request.resource.data.role == 'Super Admin' && request.resource.data.status == 'active' && !exists(/databases/$(database)/documents/meta/setup)) ||
        (request.resource.data.role in ['LGU Admin','Project Manager','Inspector'] && request.resource.data.status == 'pending') ||
        (request.resource.data.role == 'Public User' && request.resource.data.status == 'active'));
      allow update, delete: if isAdmin();
    }
    match /meta/setup {
      allow read: if true;
      allow create: if signed() && !exists(/databases/$(database)/documents/meta/setup);
    }
    match /projects/{id} {
      allow read: if true;
      allow create: if role() in ['Super Admin','LGU Admin','Project Manager'];
      allow update: if role() in ['Super Admin','LGU Admin','Project Manager','Inspector'];
      allow delete: if role() in ['Super Admin','LGU Admin'];
    }
    match /photos/{id} {
      // Staff can always see evidence photos. The public sees a photo only after the project is verified.
      allow read: if role() in ['Super Admin','LGU Admin','Project Manager','Inspector']
        || (resource.data.pid is string
            && exists(/databases/$(database)/documents/projects/$(resource.data.pid))
            && get(/databases/$(database)/documents/projects/$(resource.data.pid)).data.get('verified', null) != null
            && get(/databases/$(database)/documents/projects/$(resource.data.pid)).data.verified.ok == true);
      allow create: if role() in ['Super Admin','LGU Admin','Project Manager','Inspector']
        && request.resource.data.keys().hasOnly(['pid','data','at','by'])
        && request.resource.data.data is string
        && request.resource.data.data.size() < 600000;
      allow update: if false;
      allow delete: if role() in ['Super Admin','LGU Admin'];
    }
    match /audit/{id} {
      allow read: if role() in ['Super Admin','LGU Admin','Project Manager','Inspector'];
      allow create: if role() in ['Super Admin','LGU Admin','Project Manager','Inspector'];
    }
  }
}
```
