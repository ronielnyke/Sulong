(function(){
 var R=document.getElementById('r'),S=document.getElementById('sum'),n={pass:0,fail:0,warn:0};
 function add(k,title,msg){n[k]++;var d=document.createElement('div');d.className='st '+k;var b=document.createElement('b');b.textContent=({pass:'✅ ',fail:'❌ ',warn:'⚠️ '})[k]+title;var s=document.createElement('span');s.textContent=msg;d.appendChild(b);d.appendChild(s);R.appendChild(d);S.textContent=n.pass+' passed, '+n.warn+' warnings, '+n.fail+' failed'}
 function img(u){return new Promise(function(res){var i=new Image(),t=setTimeout(function(){res(false)},6000);i.onload=function(){clearTimeout(t);res(true)};i.onerror=function(){clearTimeout(t);res(false)};i.src=u})}
 async function run(){
  add('pass','Website address','This page runs on '+location.host+'.');
  if(typeof CANONICAL_HOST!=='undefined'&&CANONICAL_HOST&&location.hostname!==CANONICAL_HOST&&!/^(localhost|127\.0\.0\.1)$/.test(location.hostname))add('warn','Main link','The main link is '+CANONICAL_HOST+'. You are on '+location.host+'. Both work, but people should use the main link.');
  var cfgOk=typeof FIREBASE_CONFIG!=='undefined'&&FIREBASE_CONFIG.apiKey&&!/PASTE/i.test(FIREBASE_CONFIG.apiKey);
  if(!cfgOk){add('fail','Firebase config','Open js/firebase-config.js and paste your Firebase web app config.');return}
  add('pass','Firebase config','Project '+FIREBASE_CONFIG.projectId+' is configured.');
  if(typeof firebase==='undefined'){add('fail','Firebase scripts','The Firebase scripts did not load. Check the internet connection or any ad blocker.');return}
  var app,auth,fs;
  try{app=firebase.initializeApp(FIREBASE_CONFIG);auth=firebase.auth();fs=firebase.firestore();add('pass','Firebase start','Firebase started.')}catch(e){add('fail','Firebase start',e.message);return}
  try{var dm=(typeof AUTH_DOMAIN_OVERRIDE!=='undefined'&&AUTH_DOMAIN_OVERRIDE)||FIREBASE_CONFIG.authDomain,j1=await fetch('https://'+dm+'/__/firebase/init.json',{cache:'no-store'}).then(function(r){return r.json()}),h1=await fetch('https://'+dm+'/__/auth/iframe',{cache:'no-store'});
   if(j1&&j1.apiKey&&h1.ok)add('pass','Google sign-in domain','The Google window will show '+dm+'.');else add('warn','Google sign-in domain',dm+' does not serve the Firebase sign-in files yet. Redeploy on Vercel (vercel.json and api/ must be at the top level). Until then Google shows '+FIREBASE_CONFIG.projectId+'.firebaseapp.com.')}
  catch(e){add('warn','Google sign-in domain',(typeof AUTH_DOMAIN_OVERRIDE!=='undefined'?AUTH_DOMAIN_OVERRIDE:'')+' could not be reached ('+e.message+'). Redeploy on Vercel with vercel.json and api/firebase-proxy.js at the top level. Until then Google shows '+FIREBASE_CONFIG.projectId+'.firebaseapp.com.')}
  try{var s=await fs.collection('meta').doc('setup').get();add('pass','Database and rules (setup)',s.exists?'Connected. A Super Admin already exists.':'Connected. The Super Admin ('+SUPER_ADMIN_EMAIL+') has not signed in yet.')}
  catch(e){add('fail','Database and rules (setup)',e.code==='permission-denied'?'Permission denied. Publish the latest firestore.rules in Firebase Console > Firestore Database > Rules.':(e.code==='unavailable'||e.code==='not-found'||e.code==='failed-precondition')?'Cannot reach Firestore. Create the Firestore database in the Firebase Console, then reload. ('+e.code+')':(e.code||e.message))}
  try{var p=await fs.collection('projects').limit(1).get();add('pass','Database and rules (projects)','Projects can be read ('+p.size+' found in the first check).')}
  catch(e){add('fail','Database and rules (projects)',e.code==='permission-denied'?'Permission denied. Publish the latest firestore.rules.':(e.code||e.message))}
  try{await auth.signInWithEmailAndPassword('check'+Date.now()+'@example.com','not-a-real-password')}
  catch(e){var okc=['auth/invalid-credential','auth/user-not-found','auth/wrong-password','auth/invalid-login-credentials'];
   if(okc.indexOf(e.code)>=0)add('pass','Email and password sign-in','Enabled.');
   else if(e.code==='auth/operation-not-allowed')add('fail','Email and password sign-in','Not enabled. Firebase Console > Authentication > Sign-in method > Email/Password > Enable.');
   else if(e.code==='auth/network-request-failed')add('fail','Email and password sign-in','Network error. Check the internet connection.');
   else add('warn','Email and password sign-in',e.code||e.message)}
  try{var pc=await fetch('https://identitytoolkit.googleapis.com/v1/projects?key='+encodeURIComponent(FIREBASE_CONFIG.apiKey),{cache:'no-store'}).then(function(r){return r.json()}),ad=pc.authorizedDomains||[],hn=(typeof AUTH_DOMAIN_OVERRIDE!=='undefined'&&AUTH_DOMAIN_OVERRIDE)||location.hostname;
   if(ad.indexOf(hn)>=0)add('pass','Authorized domain',hn+' is in Firebase Authorized domains.');else add('warn','Authorized domain','Add '+hn+' in Firebase Console > Authentication > Settings > Authorized domains.')}
  catch(e){add('pass','Authorized domain','Could not read the list from here. If Google sign-in says unauthorized domain, add '+location.hostname+' in Firebase Console > Authentication > Settings > Authorized domains.')}
  if(typeof L==='undefined')add('fail','Map library','Leaflet did not load. Check the internet connection.');else add('pass','Map library','Leaflet loaded.');
  var ok=await img('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/450/860');
  add(ok?'pass':'fail','Satellite map tiles',ok?'Satellite imagery loads.':'Satellite tiles did not load. Check the internet connection or a firewall.');
  var ok2=await img('https://tile.openstreetmap.org/10/860/450.png');
  add(ok2?'pass':'warn','Street map tiles',ok2?'Street map loads.':'Street map tiles did not load.');
  try{var gk=(typeof GOOGLE_MAPS_KEY!=='undefined'&&GOOGLE_MAPS_KEY)||FIREBASE_CONFIG.apiKey,gr=await new Promise(function(res){var d=false;function fin(v){if(!d){d=true;res(v)}}window.gm_authFailure=function(){fin('auth')};window.__gmS=function(){setTimeout(function(){fin('ok')},1500)};var sc=document.createElement('script');sc.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(gk)+'&callback=__gmS';sc.onerror=function(){fin('net')};document.head.appendChild(sc);setTimeout(function(){fin('net')},9000)});
   if(gr==='ok')add('pass','Google Maps','Full interactive Google Maps is active.');
   else if(gr==='auth')add('pass','Google Maps','Google Maps is not enabled for this key yet, so the backup satellite map is used. To switch on Google Maps: Google Cloud Console > project '+FIREBASE_CONFIG.projectId+' > enable Maps JavaScript API and billing.');
   else add('pass','Google Maps','Could not reach Google Maps from here. The backup satellite map is used.')}
  catch(e){add('pass','Google Maps','The backup satellite map is used.')}
 }
 run().catch(function(e){add('fail','Unexpected error',e.message||String(e))});
})();
