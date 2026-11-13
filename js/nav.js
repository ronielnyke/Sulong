/* ---------- navigation ---------- */
let view=document.body.dataset.view||'auth',sel=new URLSearchParams(location.search).get('id'),F={q:new URLSearchParams(location.search).get('q')||'',s:''};
const PAGES={auth:'index.html',dash:'dashboard.html',projects:'projects.html',detail:'project.html',map:'map.html',verify:'verification.html',alerts:'alerts.html',audit:'audit.html',users:'users.html',public:'public.html',barangays:'barangays.html'};
const NAV=[['dash','Dashboard','📊'],['projects','Projects','📁'],['barangays','By Barangay','🏘️'],['map','Project Map','📍'],['verify','Verification','✅'],['alerts','Alerts','🔔'],['audit','Audit Trail','🧾'],['users','Users','👥','Super Admin'],['public','Public Portal','🌐']];
const TITLE={dash:'Project Intelligence Dashboard',projects:'Projects',barangays:'Barangay Monitoring',detail:'Project Details',map:'Project Location Map',verify:'Independent Verification',alerts:'Alerts and Notifications',audit:'Audit Trail',users:'User Management',public:'Public Transparency Portal'};
function go(v,id){closeModal();location.href=PAGES[v]+(id?'?id='+encodeURIComponent(id):'')}
function render(){
 LASTSIG=dataSig();
 if(!FB_OK||FBERR){$('#root').innerHTML=setupHTML();return}
 if(!READY||!PLOADED){$('#root').innerHTML='<div class="load"><div class="spin"></div><b>SULONG</b></div>';return}
 if(view==='map'&&MAPS[0]&&MAPS[0].touched&&MAPS[0].getView){try{LASTVIEW=MAPS[0].getView()}catch(e){}}
 MAPS.forEach(m=>{try{m.remove()}catch(e){}});MAPS=[];
 const u=me();
 if(!u&&view!=='public'&&view!=='auth'){location.replace('index.html');return}
 if(u&&!active(u)){$('#root').innerHTML=pendingHTML(u);return}
 if(u&&view==='auth'){location.replace(u.role==='Public User'?'public.html':'dashboard.html');return}
 if(u&&u.role==='Public User'&&view!=='public'&&view!=='map'){location.replace('public.html');return}
 if(u&&view==='users'&&u.role!=='Super Admin'){location.replace('dashboard.html');return}
 document.title='SULONG – '+TITLE[view];
 let h;
 if(!u)h=view==='auth'?authHTML():`<div class="pubwrap"><div class="row sp up"><div class="logo">SULONG</div><button class="btn alt" onclick="go('auth')">Sign in</button></div><h2 style="margin:18px 0;font-size:26px">${TITLE.public}</h2>${vPublic()}${foot()}</div>`;
 else{const n=u.role==='Public User'?0:alerts().length,PEND=DB.users.filter(x=>x.status==='pending').length;
  h=`<aside class="side" id="side"><div class="logo">▲ SULONG</div>${NAV.filter(x=>(!x[3]||x[3]===u.role)&&(u.role!=='Public User'||x[0]==='public'||x[0]==='map')).map(x=>`<a class="${view===x[0]||(view==='detail'&&x[0]==='projects')?'on':''}" onclick="go('${x[0]}')"><span>${x[2]}</span>${x[1]}${x[0]==='alerts'&&n?`<span class="badge">${n}</span>`:''}${x[0]==='users'&&PEND?`<span class="badge">${PEND}</span>`:''}</a>`).join('')}<div class="me"><b>${esc(u.name)}</b><br>${esc(u.role)}<br><a style="padding:6px 0" onclick="logout()">Sign out</a></div></aside>
  <main><div class="top"><button class="btn alt burger" onclick="$('#side').classList.toggle('open')" aria-label="Menu">☰</button><h2>${TITLE[view]}</h2></div><div id="view">${({dash:vDash,barangays:vBarangays,projects:vProjects,detail:vDetail,map:vMap,verify:vVerify,alerts:vAlerts,audit:vAudit,users:vUsers,public:vPublic})[view]()}</div>${foot()}</main>`}
 $('#root').innerHTML=h;post()}
const foot=()=>`<footer><div class="dots"><span></span><span style="animation-delay:.15s"></span><span style="animation-delay:.3s"></span></div>© ${new Date().getFullYear()} SULONG – Every Project. Every Progress. Every Proof.<br>Built with <span class="hb">♥</span> by <span class="dev">Roniel Nyke Gonzales</span> – BS Information Technology 2-B, West Visayas State University – Lambunao Campus, Lambunao, Iloilo<br><a class="lnk" href="status.html">System check</a></footer>`;
function post(){setTimeout(initMaps,0);loadPhotos();
 document.querySelectorAll('#view,.pubwrap').forEach(c=>c.querySelectorAll('.up').forEach((e,i)=>e.style.setProperty('--i',Math.min(i,10))));
 requestAnimationFrame(()=>setTimeout(()=>{
  document.querySelectorAll('[data-w]').forEach(e=>e.style.width=e.dataset.w+'%');
  document.querySelectorAll('[data-len]').forEach(e=>{const l=+e.dataset.len;e.style.strokeDasharray=`${l} ${251.3-l}`});
  document.querySelectorAll('[data-n]').forEach(e=>{const to=+e.dataset.n,t0=performance.now(),f=e.dataset.f==='php';(function s(t){const k=Math.min(1,(t-t0)/1000),v=Math.round(to*(1-Math.pow(1-k,3)));e.textContent=f?php(v):v;if(k<1)requestAnimationFrame(s)})(t0)});
 },30))}
