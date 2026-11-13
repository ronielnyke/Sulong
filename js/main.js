/* ---------- modal + sample ---------- */
function openModal(h){$('#modal').innerHTML=`<div class="card">${h}</div>`;$('#modal').classList.add('on')}
function closeModal(){if(PM){PM.remove();PM=null;PK={s:null,e:null,l:null}}$('#modal').classList.remove('on');$('#modal').innerHTML=''}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function sample(){if(!confirm('This adds 7 sample projects to your live database. Continue?'))return;const u=me(),t=n=>Date.now()-n*864e5;
 const mk=o=>{const e=[o.lat+o.lengthM*.7/111000,o.lng+o.lengthM*.7/108900],p=Object.assign({id:uid(),type:'Government',province:'Iloilo',category:'Road concreting',widthM:5,thickMm:200,submitted:false,verified:null,created:t(Math.abs(o.s))},o,{endLat:e[0],endLng:e[1],start:dOff(o.s),end:dOff(o.e),milestones:o.ms.map(x=>({t:x[0],due:dOff(x[1]),done:!!x[2]})),updates:o.ups.map(x=>({at:t(x[0]),by:u.name,note:x[1],pct:x[2]}))});['s','e','ms','ups'].forEach(k=>delete p[k]);return p};
 DB.projects.push(
  mk({name:'Poblacion Main Street Concreting',municipality:'Lambunao',barangay:'Poblacion',lat:11.0575,lng:122.4833,lengthM:1200,budget:4800000,contractor:'Panay Builders Inc.',s:-150,e:30,ms:[['Mobilization',-140,1],['Subgrade and base course',-80,1],['Concrete pouring, section 1',-30,1],['Concrete pouring, section 2',-5,0],['Curing and finishing',25,0]],ups:[[60,'Subgrade and base course completed',40],[10,'Concrete pouring on section 2',62]]}),
  mk({name:'Calmay Farm-to-Market Road',municipality:'Lambunao',barangay:'Calmay',lat:11.0200,lng:122.5150,lengthM:2000,budget:8900000,contractor:'Iloilo Civil Works',s:-90,e:120,ms:[['Mobilization',-80,1],['Subgrade preparation',-40,1],['Concrete pouring, section 1',20,0],['Concrete pouring, section 2',80,0]],ups:[[5,'Concrete section 1 completed',45]]}),
  mk({name:'Janiuay Poblacion Street Concreting',municipality:'Janiuay',barangay:'Poblacion',lat:10.9486,lng:122.5013,lengthM:800,budget:3200000,contractor:'Visayas Structures',s:-100,e:25,ms:[['Subgrade preparation',-70,1],['Concrete pouring, section 1',-30,1],['Concrete pouring, section 2',10,0]],ups:[[3,'Concrete section 3 poured',78]]}),
  mk({name:'Barangay Road to the Elementary School',municipality:'Maasin',barangay:'Santa Rosa',lat:10.8821,lng:122.4437,lengthM:900,budget:3600000,contractor:'RiverGuard Corp.',s:-240,e:-30,ms:[['Subgrade preparation',-200,1],['Base course',-120,1],['Concrete pouring',-45,0]],ups:[[80,'Base course finished',35]]}),
  mk({name:'Tigbauan Access Road',municipality:'Tigbauan',barangay:'Poblacion',lat:10.6747,lng:122.3774,lengthM:600,budget:2400000,contractor:'Visayas Structures',s:-120,e:-10,ms:[['Subgrade preparation',-90,1],['Concrete pouring',-30,1],['Curing and finishing',-12,1]],ups:[[2,'All concrete sections finished and cured',100]],submitted:true,submittedAt:t(2)}),
  mk({name:'Oton Alley Concreting',municipality:'Oton',barangay:'Poblacion East',lat:10.6930,lng:122.4720,lengthM:350,budget:1100000,contractor:'AquaServe PH',s:-180,e:-40,ms:[['Subgrade preparation',-150,1],['Concrete pouring',-70,1]],ups:[[35,'Completed and turned over',100]],submitted:true,submittedAt:t(33),verified:{ok:true,by:'Inspector Team',at:t(30),note:'Inspected on site. Thickness and finish are acceptable.'}}),
  mk({name:'Miagao Access Road',municipality:'Miagao',barangay:'Poblacion',lat:10.6440,lng:122.2350,lengthM:1500,budget:6400000,contractor:'Panay Builders Inc.',s:-20,e:180,ms:[['Mobilization',-10,1],['Subgrade preparation',30,0],['Concrete pouring',120,0]],ups:[[2,'Mobilization done, subgrade started',12]]}));
 log('Sample projects loaded',DB.projects.length+' projects');save();toast('Sample projects loaded.');render()}
function probeCanonical(){return new Promise(res=>{const s=document.createElement('script'),t=setTimeout(()=>res(false),4000);s.onload=()=>{clearTimeout(t);res(true)};s.onerror=()=>{clearTimeout(t);res(false)};s.src='https://'+CANONICAL_HOST+'/js/firebase-config.js?probe='+Date.now();document.head.appendChild(s)})}
function startFirebase(){
 if(typeof firebase==='undefined'){FBERR='The Firebase scripts could not load. Check your internet connection.';READY=true;render();return}
 if(!FB_OK){READY=true;render();return}
 initFirebase().then(()=>{let r=false;try{r=sessionStorage.getItem('sulong_redir')==='1';sessionStorage.removeItem('sulong_redir')}catch(e){}
  if(r)auth.getRedirectResult().catch(e=>{const x=authErr(e);if(x)toast(x)})}).catch(e=>{console.error(e);FBERR=e.message||'Firebase failed to start.';READY=true;render()})}
function boot(){
 const wrongHost=typeof CANONICAL_HOST!=='undefined'&&CANONICAL_HOST&&/^https?:$/.test(location.protocol)&&!/^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname)&&location.hostname!==CANONICAL_HOST;
 if(!wrongHost){startFirebase();return}
 // Go to the main link only if it really serves this app. Otherwise keep working on the current link.
 probeCanonical().then(ok=>{if(ok)location.replace('https://'+CANONICAL_HOST+location.pathname+location.search+location.hash);else startFirebase()})}

boot();
