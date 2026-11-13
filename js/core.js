const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const today=()=>new Date().toISOString().slice(0,10);
const php=n=>'₱'+Number(n||0).toLocaleString('en-PH');
const fd=t=>new Date(t).toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'});
const dOff=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
let DB={users:[],projects:[],audit:[],session:null};
function save(){syncOut();return true}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),3200)}
const me=()=>DB.users.find(u=>u.id===DB.session)||null;
const PERM={create:['Super Admin','LGU Admin','Project Manager'],update:['Super Admin','LGU Admin','Project Manager'],del:['Super Admin','LGU Admin'],verify:['Super Admin','Inspector'],users:['Super Admin']};
const active=u=>!u.status||u.status==='active';
const ROLE_NAMES=['Super Admin','LGU Admin','Project Manager','Inspector','Public User'];
const can=a=>{const u=me();return !!u&&active(u)&&PERM[a].includes(u.role)};
function log(action,detail){const u=me();if(u&&(u.role==='Public User'||!active(u)))return;DB.audit.unshift({at:Date.now(),by:u?u.name:'System',role:u?u.role:'-',action,detail});DB.audit.length=Math.min(DB.audit.length,600)}
async function hash(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return 'f'+h}}
/* ---------- delay detection engine ---------- */
const ST={'On Schedule':'#16a34a','Delayed':'#d97706','Stalled':'#ea580c','Abandoned':'#dc2626','Pending Verification':'#2563eb','Completed':'#0d9488'};
const dd=n=>n+(n===1?' day':' days');
const lastAt=p=>p.updates.length?p.updates[0].at:p.created;
const idleDays=p=>Math.floor((Date.now()-lastAt(p))/864e5);
const overdue=p=>p.milestones.filter(m=>!m.done&&m.due<today());
const prog=p=>p.updates.length?p.updates[0].pct:0;
function stat(p){
 if(p.verified&&p.verified.ok)return 'Completed';
 if(p.submitted)return 'Pending Verification';
 const idle=idleDays(p),late=p.end<today(),om=overdue(p).length;
 if((late||om)&&idle>60)return 'Abandoned';
 if(idle>30)return 'Stalled';
 if(late||om)return 'Delayed';
 return 'On Schedule'}
const chip=s=>`<span class="chip ${s==='Abandoned'?'abn':''}" style="background:${ST[s]}22;color:${ST[s]}">${s}</span>`;
function alerts(){const a=[];DB.projects.forEach(p=>{const s=stat(p);if(s==='Completed')return;
 if(s==='Abandoned')a.push({sev:3,p,msg:`Abandoned: no update for ${dd(idleDays(p))} and the schedule is overdue`});
 else if(s==='Stalled')a.push({sev:2,p,msg:`Stalled: no update for ${dd(idleDays(p))}`});
 overdue(p).forEach(m=>a.push({sev:2,p,msg:`Milestone overdue: ${m.t} (due ${m.due})`}));
 if(p.end<today()&&!p.submitted)a.push({sev:2,p,msg:`Target end date ${p.end} has passed`});
 if(p.submitted&&Date.now()-p.submittedAt>3*864e5)a.push({sev:1,p,msg:'Waiting for inspector verification for more than 3 days'});
{const f=forecast(p);if(f.g==='bad'&&s!=='Abandoned'&&s!=='Stalled')a.push({sev:2,p,msg:'Forecast: '+f.s.toLowerCase()+'. '+f.t});else if(f.g==='risk')a.push({sev:1,p,msg:'Forecast: at risk of finishing late. '+f.t})}
 if(s==='On Schedule'&&idleDays(p)>14)a.push({sev:1,p,msg:`No update for ${dd(idleDays(p))}`})});
 return a.sort((x,y)=>y.sev-x.sev)}

/* ---------- completion forecast and road helpers ---------- */
const fmtD=t=>new Date(t).toLocaleDateString('en-PH',{dateStyle:'medium'});
const km=m=>(m/1000).toFixed(2)+' km';
const hasEnd=p=>typeof p.endLat==='number'&&typeof p.endLng==='number';
const along=(p,pc)=>[p.lat+(p.endLat-p.lat)*pc/100,p.lng+(p.endLng-p.lng)*pc/100];
function hav(a,b){const R=6371000,r=x=>x*Math.PI/180,dl=r(b[0]-a[0]),dn=r(b[1]-a[1]),h=Math.sin(dl/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
const roadbar=(pc,now)=>`<div class="road"><i ${now?`style="width:${pc}%"`:`data-w="${pc}"`}></i></div>`;
function forecast(p){
 const GR='#16a34a',AM='#d97706',RD='#dc2626',GY='#64748b',s=stat(p),pc=prog(p),now=Date.now();
 if(s==='Completed')return{g:'done',c:ST.Completed,s:'Completed',t:'Completed and verified.'};
 if(s==='Pending Verification')return{g:'done',c:ST['Pending Verification'],s:'Awaiting verification',t:'All work is reported as finished. An inspector must verify it.'};
 const t0=new Date(p.start+'T00:00:00').getTime(),endT=new Date(p.end+'T23:59:59').getTime(),since=(now-t0)/864e5;
 if(since<0&&!p.updates.length)return{g:'na',c:GY,s:'Not started',t:'Work is scheduled to start on '+p.start+'.'};
 if(endT<now)return{g:'bad',c:RD,s:'Past target date',t:'The target date ('+p.end+') has passed and '+(100-pc)+'% of the work is still remaining.'};
 if(pc===0&&since<14)return{g:'na',c:GY,s:'Too early',t:'Not enough progress has been recorded to estimate a finish date.'};
 const lastT=p.updates.length?p.updates[0].at:t0,rate=pc/Math.max(1,(lastT-t0)/864e5);
 if(rate<=0)return{g:'bad',c:RD,s:'Will not finish on time',t:'No progress has been recorded, so the project is not expected to finish by '+p.end+'.'};
 const idle=idleDays(p),need=(100-pc)/rate,projT=now+need*864e5,slip=Math.ceil((projT-endT)/864e5),req=(100-pc)/Math.max(1,(endT-now)/864e5);
 const base='Average pace: '+rate.toFixed(2)+'% per day. Pace needed to finish on time: '+req.toFixed(2)+'% per day. Projected finish: '+fmtD(projT)+'.';
 if(idle>30)return{g:'bad',c:RD,s:'Will not finish on time',t:'Work has stalled for '+dd(idle)+'. '+base};
 if(slip<=0)return{g:'ok',c:GR,s:'On track',t:(slip===0?'Expected to finish on the target date. ':'Expected to finish about '+dd(-slip)+' before the target date. ')+base};
 if(slip<=14)return{g:'risk',c:AM,s:'At risk',t:'Expected to finish about '+dd(slip)+' late. '+base};
 return{g:'bad',c:RD,s:'Will not finish on time',t:'Expected to finish about '+dd(slip)+' late. '+base}}
const fchip=p=>{const f=forecast(p);return `<span class="chip" style="background:${f.c}22;color:${f.c}">${f.s}</span>`};
