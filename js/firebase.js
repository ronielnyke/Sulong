let PDEL=[],HAS_ADMIN=null,NEWACC=false,WANT='',DEFAULT_DOMAIN='',ACTIVE_DOMAIN='',DOMAIN_OK=null,auth=null,fs=null,st=null,READY=false,PLOADED=false,FBERR='',PENDING=null,JUST=false,unsubs=[],Q=Promise.resolve();
const FB_OK=typeof firebase!=='undefined'&&typeof FIREBASE_CONFIG!=='undefined'&&!!FIREBASE_CONFIG.apiKey&&!/PASTE/i.test(FIREBASE_CONFIG.apiKey);
const SYNC={p:{},u:{}};
function setupHTML(){return `<div class="pubwrap" style="max-width:640px"><div class="card" style="margin-top:8vh"><h2>Connect Firebase</h2><p class="muted" style="margin:8px 0">${FBERR?esc(FBERR):'Firebase is not configured yet.'}</p><ol style="padding-left:18px;line-height:1.9"><li>Open <b>js/firebase-config.js</b></li><li>Paste your Firebase web app config</li><li>Save and refresh this page</li></ol></div>${foot()}</div>`}
let LASTSIG='';
const dataSig=()=>JSON.stringify([DB.projects,DB.users,DB.audit.map(a=>a.id||a.at),DB.session,READY,PLOADED,HAS_ADMIN]);
function refresh(){const a=document.activeElement;if($('#modal').classList.contains('on')||(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)))return;if(READY&&PLOADED&&dataSig()===LASTSIG)return;render()}
async function proxyOK(host){
 try{const c=new AbortController(),t=setTimeout(()=>c.abort(),3500),r=await fetch('https://'+host+'/__/firebase/init.json',{cache:'no-store',signal:c.signal}),j=await r.json();clearTimeout(t);return !!(j&&j.apiKey)}catch(e){return false}}
async function initFirebase(){
 const cfg=Object.assign({},FIREBASE_CONFIG);DEFAULT_DOMAIN=cfg.projectId+'.firebaseapp.com';
 let want=(typeof AUTH_DOMAIN_OVERRIDE!=='undefined'&&AUTH_DOMAIN_OVERRIDE)||cfg.authDomain||DEFAULT_DOMAIN;
 if(!want||/PASTE/i.test(want))want=DEFAULT_DOMAIN;
 cfg.authDomain=(want===DEFAULT_DOMAIN||await proxyOK(want))?want:DEFAULT_DOMAIN;
 ACTIVE_DOMAIN=cfg.authDomain;firebase.initializeApp(cfg);auth=firebase.auth();fs=firebase.firestore();
 fs.collection('projects').onSnapshot(s=>{SYNC.p={};DB.projects=s.docs.map(d=>{const o=Object.assign({},d.data(),{id:d.id});o.updates=o.updates||[];o.milestones=o.milestones||[];SYNC.p[o.id]=JSON.stringify(o);return o});PLOADED=true;refresh()},e=>{console.error(e);PLOADED=true;toast('Cannot read projects: '+(e.code||e.message)+(e.code==='permission-denied'?'. Publish firestore.rules in the Firebase Console.':''));refresh()});
 setTimeout(()=>{if(!PLOADED){PLOADED=true;toast('Cannot reach the server. Check your internet connection.');refresh()}},8000);
 fs.collection('meta').doc('setup').get().then(()=>{HAS_ADMIN=true;refresh()}).catch(()=>{HAS_ADMIN=true});
 auth.onAuthStateChanged(onAuth)}
const isOwner=fu=>!!(typeof SUPER_ADMIN_EMAIL!=='undefined'&&fu&&fu.email&&fu.emailVerified&&fu.email.toLowerCase()===SUPER_ADMIN_EMAIL.toLowerCase());
async function ensureProfile(fu){
 const ref=fs.collection('users').doc(fu.uid),s=await ref.get(),owner=isOwner(fu);
 if(s.exists){const d=Object.assign({},s.data(),{id:fu.uid});
  if(owner&&(d.role!=='Super Admin'||d.status!=='active')){await ref.update({role:'Super Admin',status:'active'});d.role='Super Admin';d.status='active'}
  return d}
 const setup=fs.collection('meta').doc('setup');let prof;
 if(!owner&&typeof SUPER_ADMIN_EMAIL!=='undefined'&&fu.email&&fu.email.toLowerCase()===SUPER_ADMIN_EMAIL.toLowerCase()&&!fu.emailVerified){try{await fu.sendEmailVerification();toast('Verify your email (check your inbox), then sign in again to become Super Admin. Or use Continue with Google.')}catch(e){}}
 await fs.runTransaction(async t=>{const m=await t.get(setup),want=PENDING&&PENDING.role,req=['LGU Admin','Project Manager','Inspector','Public User'].includes(want)?want:'Public User';
  prof={name:(PENDING&&PENDING.name)||fu.displayName||(fu.email||'User').split('@')[0],email:fu.email||'',role:owner?'Super Admin':req,status:(owner||req==='Public User')?'active':'pending',at:Date.now()};
  if(owner&&!m.exists)t.set(setup,{by:fu.uid,at:Date.now()});t.set(ref,prof)});
 PENDING=null;NEWACC=true;HAS_ADMIN=true;return Object.assign({},prof,{id:fu.uid})}
async function onAuth(fu){
 unsubs.forEach(f=>f());unsubs=[];
 if(!fu){DB.session=null;DB.users=[];DB.audit=[];SYNC.u={};READY=true;render();return}
 try{
  const prof=await ensureProfile(fu);PENDING=null;const was=NEWACC;NEWACC=false;
  if(JUST&&WANT&&!was&&prof.role!==WANT){const w=prof.role;JUST=false;WANT='';toast('This account is registered as '+w+'. Select '+w+' to sign in.');try{await auth.signOut()}catch(x){}return}
  WANT='';DB.users=[prof];DB.session=fu.uid;SYNC.u={};SYNC.u[prof.id]=JSON.stringify(prof);
  if(prof.role==='Super Admin')unsubs.push(fs.collection('users').onSnapshot(s=>{DB.users=s.docs.map(d=>Object.assign({},d.data(),{id:d.id}));SYNC.u={};DB.users.forEach(x=>SYNC.u[x.id]=JSON.stringify(x));refresh()},e=>console.error(e)));
  else unsubs.push(fs.collection('users').doc(fu.uid).onSnapshot(s=>{if(s.exists){const x=Object.assign({},s.data(),{id:s.id});DB.users=[x];SYNC.u={};SYNC.u[x.id]=JSON.stringify(x);refresh()}},e=>console.error(e)));
  unsubs.push(fs.collection('audit').orderBy('at','desc').limit(300).onSnapshot(s=>{const pend=DB.audit.filter(a=>!a.id);DB.audit=pend.concat(s.docs.map(d=>Object.assign({},d.data(),{id:d.id})));refresh()},e=>console.error(e)));
  if(JUST){JUST=false;log('Signed in','')}
  READY=true;render();save();
 }catch(e){console.error(e);READY=true;toast('Sign-in failed: '+(e.code||e.message));try{await auth.signOut()}catch(x){}}}
function syncOut(){return Q=Q.then(doSync).catch(e=>{console.error(e);toast('Could not save to the server: '+(e.code||e.message));return false})}
async function doSync(){
 if(!FB_OK||!auth||!auth.currentUser)return true;
 const b=fs.batch(),done=[];let n=0;
 DB.projects.forEach(p=>{const j=JSON.stringify(p);if(SYNC.p[p.id]!==j){b.set(fs.collection('projects').doc(p.id),JSON.parse(j));done.push(()=>{SYNC.p[p.id]=j});n++}});
 Object.keys(SYNC.p).forEach(id=>{if(!DB.projects.some(p=>p.id===id)){b.delete(fs.collection('projects').doc(id));done.push(()=>{delete SYNC.p[id]});n++}});
 const u=me();
 if(u&&u.role==='Super Admin'){
  DB.users.forEach(x=>{const j=JSON.stringify(x);if(SYNC.u[x.id]!==j){const d=JSON.parse(j);delete d.id;b.set(fs.collection('users').doc(x.id),d);done.push(()=>{SYNC.u[x.id]=j});n++}});
  Object.keys(SYNC.u).forEach(id=>{if(!DB.users.some(x=>x.id===id)){b.delete(fs.collection('users').doc(id));done.push(()=>{delete SYNC.u[id]});n++}})}
 PDEL.splice(0).forEach(pid=>{b.delete(fs.collection('photos').doc(pid));n++});
 const fresh=DB.audit.filter(a=>!a.id);
 fresh.forEach(a=>{const r=fs.collection('audit').doc();b.set(r,{at:a.at,by:a.by,role:a.role,action:a.action,detail:a.detail});done.push(()=>{a.id=r.id});n++});
 if(!n)return true;
 try{await b.commit();done.forEach(f=>f());return true}catch(e){console.error(e);toast('Could not save to the server: '+(e.code||e.message));return false}}

/* Google sign-in that keeps working when authDomain is changed to your own domain */
const gProvider=()=>{const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});return p};
async function customDomainOK(){return true}
async function googleSignIn(std){
 await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
 if(!std||ACTIVE_DOMAIN===DEFAULT_DOMAIN){
  try{await auth.signInWithPopup(gProvider())}
  catch(x){if(x.code==='auth/popup-blocked'){try{sessionStorage.setItem('sulong_redir','1')}catch(e){}await auth.signInWithRedirect(gProvider())}else throw x}
  return}
 let app2;try{app2=firebase.app('gfb')}catch(e){app2=firebase.initializeApp(Object.assign({},FIREBASE_CONFIG,{authDomain:DEFAULT_DOMAIN}),'gfb')}
 const r=await app2.auth().signInWithPopup(gProvider());
 await auth.signInWithCredential(r.credential);
 try{await app2.auth().signOut()}catch(e){}}
