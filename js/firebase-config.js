// Firebase web app config for project sulong-4a43c (copied exactly from the Firebase Console).
const FIREBASE_CONFIG={
  apiKey:"AIzaSyDDJP8GG3pz6dxBIJlO4oXP4aIwuIeCA_M",
  authDomain:"sulong-civic.vercel.app",
  projectId:"sulong-4a43c",
  storageBucket:"sulong-4a43c.firebasestorage.app",
  messagingSenderId:"201911089619",
  appId:"1:201911089619:web:ebdaf553c24ad204d59726",
  measurementId:"G-PYZ9VLK429"
};

// Google Maps (full interactive map like maps.google.com). Optional: paste a Maps JavaScript API key here.
// If left empty, the Firebase key above is used (enable "Maps JavaScript API" in Google Cloud for project sulong-4a43c).
// const GOOGLE_MAPS_KEY="YOUR_KEY";

// The one Super Admin. This account (Google sign-in, or a verified email) is always the Super Admin.
// The same email is also written in firestore.rules (function owner) - keep both the same.
const SUPER_ADMIN_EMAIL="ronielnyke@gmail.com";

// Your own address. Google sign-in shows this domain. If it is not connected to Firebase yet,
// Google sign-in still works through the default domain above.
const AUTH_DOMAIN_OVERRIDE="sulong-civic.vercel.app";

// Every visitor is sent to this link, so the sign-in session and the address are always the same.
// Data is stored on Firebase servers, so it is the same on every device.
const CANONICAL_HOST="sulong-civic.vercel.app";

