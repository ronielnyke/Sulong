# SULONG – Project Recovery & Intelligence Platform

A static website (HTML, CSS and JavaScript) with Firebase for sign-in and data. It runs on the **free Firebase Spark plan** and is deployed on **Vercel** at https://sulong-civic.vercel.app

## 1. Firebase setup (once, about 5 minutes)
The Firebase config for project `sulong-4a43c` is already in `js/firebase-config.js`.
1. **Authentication > Sign-in method:** enable **Email/Password** and **Google**.
2. **Authentication > Settings > Authorized domains:** add `sulong-civic.vercel.app`.
3. **Firestore Database:** click Create database (production mode, choose a location near you).
4. **Firestore Database > Rules:** paste the contents of `firestore.rules` and click **Publish** (see `RULES.md`, or run `firebase deploy --only firestore:rules`).

## 2. Deploy on Vercel
1. Put this folder in a GitHub repository (the files `index.html`, `vercel.json`, `api/`, `js/`, `css/` must be at the top level).
2. On vercel.com: **Add New > Project**, import the repository, and name the project `sulong-civic`. Leave the Framework Preset on **Other**. Leave Build Command and Output Directory empty. Click **Deploy**.
3. If `sulong-civic.vercel.app` is taken, use another name and update `CANONICAL_HOST` and `AUTH_DOMAIN_OVERRIDE` in `js/firebase-config.js`, and add the new domain to Firebase Authorized domains.
(Or use the Vercel CLI: `npm i -g vercel`, then `vercel --prod` inside this folder.)

## 3. Check that everything works
Open **https://sulong-civic.vercel.app/status.html**. It tests the Firebase config, the database rules, sign-in, and the maps, and tells you how to fix anything that is red. The link "System check" is also in the footer of every page.

## 4. First use
- The **Super Admin** is the account with the email in `SUPER_ADMIN_EMAIL` (`js/firebase-config.js`, also in `firestore.rules`). Sign in with Google, or with a verified email. Nobody else can become Super Admin.
- Everyone selects a role when signing in or registering: Super Admin, LGU Admin, Project Manager, Inspector or Public User.
- LGU Admin, Project Manager and Inspector accounts wait for approval from the Super Admin (Users page). Public User accounts are active immediately and see the public portal and the map.

## If something does not work
| Message | Cause and fix |
| --- | --- |
| Cannot read projects: permission-denied | Publish the latest `firestore.rules` |
| Firebase is not configured yet | Check `js/firebase-config.js` is uploaded |
| auth/operation-not-allowed | Enable Email/Password or Google in Authentication |
| auth/unauthorized-domain | Add your domain to Authorized domains |
| Cannot reach the server | Create the Firestore database, or check the internet |
| The old version still shows | Redeploy, then hard refresh with Ctrl+Shift+R |

## Maps (no API key needed)
Every project in the system appears on the map, colored by status. Use the **barangay** and **status** filters, or **View on map** on the By Barangay page.
- **SULONG map:** real satellite imagery with road and place names, all project pins, the planned road lines, and the concreted part in green. Switch to Street or Terrain with the layer button.
- **Google Maps:** the real Google Maps for the barangay overview or one project, with Satellite, **Open in Google Maps** and **Directions**. Every project also has a **View on Google Maps** link. This uses Google's free embed and shows one place at a time.
Optional: for the full interactive Google map with all pins, add `const GOOGLE_MAPS_KEY="YOUR_KEY";` to `js/firebase-config.js` (Maps JavaScript API key).

## Monitoring road concreting in barangays
Register each road with its municipality, barangay, length, width, thickness, budget, contractor and dates. Set the start and end points on the map. The **Completion forecast** estimates whether a road will finish by the target date, from its average progress per day. **By Barangay** shows totals per barangay, and **Export CSV** downloads a report. Evidence photos are saved in Firestore, and the public sees a photo only after the project is verified.

## Your own domain in the Google sign-in window
`authDomain` and `AUTH_DOMAIN_OVERRIDE` in `js/firebase-config.js` are set to `sulong-civic.vercel.app` (the app falls back to the default Firebase domain automatically if the proxy is not reachable). `vercel.json`, `api/firebase-proxy.js` and `__/firebase/init.json` serve the Firebase sign-in files from your domain, and read the project ID from the config automatically. To finish, add `https://sulong-civic.vercel.app/__/auth/handler` to Google Cloud Console > APIs & Services > Credentials > your Web client > Authorized redirect URIs. If the Google window shows an error before you do this, use the link "Use the standard Google sign-in" under the Google button.

Developed by Roniel Nyke Gonzales – BSIT 2-B, West Visayas State University – Lambunao Campus.
