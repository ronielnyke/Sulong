const staffUser=()=>{const u=me();return !!u&&active(u)&&u.role!=='Public User'};
let MF={b:new URLSearchParams(location.search).get('b')||'',s:new URLSearchParams(location.search).get('s')||''},GBQ='',MAPS=[],PM=null,PK={s:null,e:null,l:null},PMODE='start',GM_FAIL=false,GM_PROMISE=null,MT=0;
const OWNKEY=typeof GOOGLE_MAPS_KEY!=='undefined'&&!!GOOGLE_MAPS_KEY&&!/PASTE|YOUR_KEY/i.test(GOOGLE_MAPS_KEY);
const GKEY=OWNKEY?GOOGLE_MAPS_KEY:((typeof FIREBASE_CONFIG!=='undefined'&&FIREBASE_CONFIG.apiKey&&!/PASTE/i.test(FIREBASE_CONFIG.apiKey))?FIREBASE_CONFIG.apiKey:'');
let LASTVIEW=null;
const GON=()=>!!GKEY&&!GM_FAIL;
const useG=()=>!!GKEY&&!GM_FAIL&&typeof google!=='undefined'&&!!google.maps&&!!google.maps.Map;
window.gm_authFailure=()=>{GM_FAIL=true;if(OWNKEY)toast('Google Maps rejected the API key. Check the key, billing, and allowed websites. Showing the backup map instead.');if($('#pick'))initPicker();else render()};
function loadGoogle(){
 if(!GKEY||GM_FAIL)return Promise.resolve(false);
 if(typeof google!=='undefined'&&google.maps&&google.maps.Map)return Promise.resolve(true);
 if(GM_PROMISE)return GM_PROMISE;
 GM_PROMISE=new Promise(res=>{window.__gmReady=()=>res(true);const s=document.createElement('script');s.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(GKEY)+'&callback=__gmReady&v=weekly';s.async=true;s.onerror=()=>res(false);document.head.appendChild(s)});
 return GM_PROMISE}
/* ----- OpenStreetMap (Leaflet) backend ----- */
function baseLayers(){
 const T=(u,o)=>L.tileLayer(u,Object.assign({maxZoom:20,maxNativeZoom:18},o)),E='https://server.arcgisonline.com/ArcGIS/rest/services/';
 return {
  'Satellite':L.layerGroup([T(E+'World_Imagery/MapServer/tile/{z}/{y}/{x}',{zIndex:1,attribution:'Imagery © Esri, Maxar, Earthstar Geographics'}),T(E+'Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',{zIndex:2}),T(E+'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{zIndex:3})]),
  'Street':T('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxNativeZoom:19,attribution:'© OpenStreetMap contributors'}),
  'Terrain':T(E+'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri'})}}
function pin(c){return L.divIcon({className:'',html:`<span class="pin" style="background:${c}"></span>`,iconSize:[22,22],iconAnchor:[11,22],popupAnchor:[0,-22]})}
function lfMap(id,c,z){const bl=baseLayers(),m=L.map(id,{center:c,zoom:z,layers:[bl.Satellite]});L.control.layers(bl).addTo(m);L.control.scale().addTo(m);setTimeout(()=>m.invalidateSize(),450);
 return{
  marker(p,color,html,drag){const k=L.marker(p,{icon:pin(color),draggable:!!drag}).addTo(m);if(html)k.bindPopup(html);return{set:q=>k.setLatLng(q),get:()=>{const l=k.getLatLng();return[l.lat,l.lng]},onDrag:f=>k.on('dragend',f)}},
  line(pts,o){const w=o.weight||6,c=L.polyline(pts,{color:'#ffffff',weight:w+4,opacity:.75}).addTo(m),l=L.polyline(pts,{color:o.color,weight:w,opacity:o.opacity||.9}).addTo(m);return{set:q=>{c.setLatLngs(q);l.setLatLngs(q)}}},
  fit(pts,max){m.fitBounds(pts,{padding:[40,40],maxZoom:max||15})},
  view(p,z){m.setView(p,z||m.getZoom())},
  onClick(f){m.on('click',e=>f([e.latlng.lat,e.latlng.lng]))},
  getView(){const c=m.getCenter();return{c:[c.lat,c.lng],z:m.getZoom()}},
  refresh(){m.invalidateSize()},
  remove(){try{m.remove()}catch(e){}}}}
/* ----- Google Maps backend ----- */
function gMap(id,c,z){const ll=p=>({lat:p[0],lng:p[1]}),m=new google.maps.Map(document.getElementById(id),{center:ll(c),zoom:z,mapTypeId:'roadmap',mapTypeControl:true,streetViewControl:true,fullscreenControl:true,gestureHandling:'greedy'}),info=new google.maps.InfoWindow();
 return{
  marker(p,color,html,drag){const k=new google.maps.Marker({position:ll(p),map:m,draggable:!!drag,icon:{path:'M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z',fillColor:color,fillOpacity:1,strokeColor:'#ffffff',strokeWeight:2,scale:1,anchor:new google.maps.Point(12,34)}});
   if(html)k.addListener('click',()=>{info.setContent(html);info.open({map:m,anchor:k})});
   return{set:q=>k.setPosition(ll(q)),get:()=>{const l=k.getPosition();return[l.lat(),l.lng()]},onDrag:f=>k.addListener('dragend',f)}},
  line(pts,o){const l=new google.maps.Polyline({path:pts.map(ll),map:m,strokeColor:o.color,strokeOpacity:o.opacity||.9,strokeWeight:o.weight||6});return{set:q=>l.setPath(q.map(ll))}},
  fit(pts,max){const b=new google.maps.LatLngBounds();pts.forEach(p=>b.extend(ll(p)));m.fitBounds(b,60);google.maps.event.addListenerOnce(m,'idle',()=>{if(m.getZoom()>(max||15))m.setZoom(max||15)})},
  view(p,z){m.setCenter(ll(p));if(z)m.setZoom(z)},
  onClick(f){m.addListener('click',e=>f([e.latLng.lat(),e.latLng.lng()]))},
  getView(){const c=m.getCenter();return{c:[c.lat(),c.lng()],z:m.getZoom()}},
  refresh(){},
  remove(){try{google.maps.event.clearInstanceListeners(m)}catch(e){}}}}
function addLocate(w,id){const c=document.getElementById(id);if(!c)return;const b=document.createElement('button');b.type='button';b.className='btn sm locbtn';b.textContent='📍 My location';
 b.addEventListener('mousedown',e=>e.stopPropagation());b.addEventListener('dblclick',e=>e.stopPropagation());
 b.onclick=()=>{if(!navigator.geolocation)return toast('Location is not available on this device.');navigator.geolocation.getCurrentPosition(q=>{const p=[q.coords.latitude,q.coords.longitude];w.view(p,16);w.marker(p,'#2563eb','You are here')},()=>toast('Location permission was denied.'))};c.appendChild(b)}
function mkMap(id,c,z,keep){const w=useG()?gMap(id,c,z):lfMap(id,c,z);if(!keep){MAPS.push(w);const el=document.getElementById(id);if(el)['pointerdown','wheel','touchstart'].forEach(ev=>el.addEventListener(ev,()=>{w.touched=true},{passive:true}))}addLocate(w,id);return w}
const mapsMissing=()=>!useG()&&typeof L==='undefined';
const MSG='<p class="muted" style="padding:20px">The map could not load. Check your internet connection.</p>';
async function initMaps(){
 if(!$('#map')&&!$('#dmap'))return;
 const tk=++MT;await loadGoogle();if(tk!==MT)return;
 const M=$('#map'),D=$('#dmap');
 if(mapsMissing()){[M,D].forEach(e=>{if(e)e.innerHTML=MSG});return}
 if(M){const m=mkMap('map',[11,122.5],9),pts=[];
  mapList().forEach(p=>{const s=stat(p),a=[p.lat,p.lng];pts.push(a);
   if(hasEnd(p)){const b=[p.endLat,p.endLng];pts.push(b);m.line([a,b],{color:ST[s],weight:6})}
   m.marker(a,ST[s],`<b>${esc(p.name)}</b><br>${esc(p.barangay)}${p.municipality?', '+esc(p.municipality):''}<br>${s} – ${prog(p)}%<br>${esc(forecast(p).s)}<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">Directions (Google Maps)</a> · <a href="#" onclick="${staffUser()?`go('detail','${p.id}')`:`pubDetail('${p.id}')`};return false">${staffUser()?'Open project':'View details'}</a>`)});
  if(pts.length)m.fit(pts,15);
  if(LASTVIEW){m.view(LASTVIEW.c,LASTVIEW.z);m.touched=true}}
 if(D){const p=DB.projects.find(x=>x.id===sel);if(p){const a=[p.lat,p.lng],m=mkMap('dmap',a,16),c=ST[stat(p)];
  if(hasEnd(p)){const b=[p.endLat,p.endLng];m.line([a,b],{color:'#94a3b8',weight:7,opacity:.85});if(prog(p)>0)m.line([a,along(p,prog(p))],{color:'#16a34a',weight:8,opacity:1});m.marker(a,'#16a34a','<b>Start</b><br>'+esc(p.name));m.marker(b,'#dc2626','<b>End</b><br>'+esc(p.name));m.fit([a,b],17)}
  else m.marker(a,c,'<b>'+esc(p.name)+'</b>')}}}
/* ----- location picker in the project form ----- */
const readPt=(a,b)=>{const x=parseFloat($('#'+a).value),y=parseFloat($('#'+b).value);return(x>=-90&&x<=90&&y>=-180&&y<=180)?[x,y]:null};
function pickMode(m){PMODE=m;$('#mS').className=m==='start'?'btn sm':'btn alt sm';$('#mE').className=m==='end'?'btn sm':'btn alt sm';toast(m==='start'?'Tap the map to set the start point.':'Tap the map to set the end point.')}
function setPt(mode,pt,center){const a=mode==='start'?['pla','plo']:['pea','peo'];$('#'+a[0]).value=(+pt[0]).toFixed(6);$('#'+a[1]).value=(+pt[1]).toFixed(6);syncPicker(center?pt:null)}
function syncPicker(focus){const s=readPt('pla','plo'),e=readPt('pea','peo');
 if(s&&e){const L=$('#pl');if(!L.value||L.dataset.auto==='1'){L.value=String(Math.round(hav(s,e)));L.dataset.auto='1'}}
 if(!PM)return;
 if(s&&PK.s)PK.s.set(s);
 if(e){if(PK.e)PK.e.set(e);else{PK.e=PM.marker(e,'#dc2626','',true);PK.e.onDrag(()=>setPt('end',PK.e.get()))}}
 if(s&&e){if(PK.l)PK.l.set([s,e]);else PK.l=PM.line([s,e],{color:'#0f766e',weight:5})}
 if(focus)PM.view(focus,17)}
async function initPicker(){
 if(!$('#pick'))return;
 await loadGoogle();const el=$('#pick');if(!el)return;
 if(mapsMissing()){el.innerHTML=MSG;return}
 if(PM){PM.remove();PM=null}
 PM=mkMap('pick',[10.9,122.5],10,true);PK={s:null,e:null,l:null};
 const s=readPt('pla','plo')||[11,122.5];
 PK.s=PM.marker(s,'#16a34a','',true);PK.s.onDrag(()=>setPt('start',PK.s.get()));
 PM.onClick(pt=>setPt(PMODE,pt));
 ['pla','plo','pea','peo'].forEach(i=>$('#'+i).addEventListener('change',()=>syncPicker(readPt('pla','plo'))));
 PM.view(s,13)}
async function findPlace(){const q=$('#ps2').value.trim();if(!q)return;
 if(useG()){new google.maps.Geocoder().geocode({address:q,componentRestrictions:{country:'PH'}},(r,s)=>{if(s==='OK'&&r&&r[0]){const l=r[0].geometry.location;setPt(PMODE,[l.lat(),l.lng()],true)}else toast('Place not found.')});return}
 try{const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q='+encodeURIComponent(q)),j=await r.json();if(!j.length)return toast('Place not found.');setPt(PMODE,[+j[0].lat,+j[0].lon],true)}catch(e){toast('Search failed. Check your connection.')}}
const PHOTOS={};
async function storePhoto(d,pid){
 if(d.length>600000){toast('That photo is too large. Use a smaller photo.');return ''}
 try{const ref=fs.collection('photos').doc();await ref.set({pid,data:d,at:Date.now(),by:me().name});PHOTOS[ref.id]=d;return 'fs:'+ref.id}
 catch(e){console.error(e);toast('Could not save the photo: '+(e.code||e.message));return ''}}
const GIF='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const phImg=(ph,alt)=>ph?(ph.indexOf('fs:')===0?`<br><img class="ph" data-ph="${esc(ph.slice(3))}" src="${PHOTOS[ph.slice(3)]||GIF}" alt="${alt}">`:`<br><img class="ph" src="${esc(ph)}" alt="${alt}">`):'';
function loadPhotos(){document.querySelectorAll('img[data-ph]').forEach(async im=>{const id=im.dataset.ph;
 try{if(!PHOTOS[id]){const s=await fs.collection('photos').doc(id).get();PHOTOS[id]=s.exists?s.data().data:'x'}
  if(PHOTOS[id]!=='x')im.src=PHOTOS[id];else im.alt='Photo not available'}catch(e){im.alt='Photo not available'}})}
/* ----- Google Maps tab (no API key needed: official Google embed and Google Maps links) ----- */
const mapTabs=()=>GON()?'':'<div class="mtabs"><button class="on" data-m="osm" onclick="mapMode(\'osm\')">SULONG map</button><button data-m="google" onclick="mapMode(\'google\')">Google Maps</button></div>';
function gBox(list,h,bq){if(!list.length||GON())return '';GBQ=bq||'';
 const sel=(list.length>1||GBQ)?`<select id="gsel" style="flex:1;margin:0;min-width:180px" onchange="gUpdate()">${GBQ?'<option value="__b">Barangay overview on Google Maps</option>':''}${list.map(p=>`<option value="${p.id}">${esc(p.name)} – ${esc(p.barangay)}</option>`).join('')}</select>`:`<input type="hidden" id="gsel" value="${list[0].id}">`;
 return `<div id="gwrap" style="display:none"><div class="row" style="margin-bottom:8px">${sel}<label class="chk"><input type="checkbox" id="gsat" checked onchange="gUpdate()"> Satellite</label><a class="btn alt sm" id="gopen" target="_blank" rel="noopener">Open in Google Maps</a><a class="btn alt sm" id="gdir" target="_blank" rel="noopener">Directions</a></div><div class="map" style="height:${h}px;min-height:0"><iframe id="gf" title="Google Maps" style="width:100%;height:100%;border:0;border-radius:12px" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
 <div style="margin-top:10px">${list.slice(0,50).map(p=>`<div class="row sp" style="padding:6px 0;border-top:1px solid var(--bd)"><span><b>${esc(p.name)}</b> ${chip(stat(p))}</span><a class="btn alt sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}">View on Google Maps</a></div>`).join('')}</div></div>`}
function gUpdate(){const v=$('#gsel').value,f=$('#gf'),sat=$('#gsat').checked?'h':'m';if(!f)return;
 if(v==='__b'&&GBQ){const q=encodeURIComponent(GBQ);f.src='https://www.google.com/maps?q='+q+'&z=15&t='+sat+'&output=embed&hl=en';$('#gopen').href='https://www.google.com/maps/search/?api=1&query='+q;$('#gdir').href='https://www.google.com/maps/dir/?api=1&destination='+q;return}
 const p=DB.projects.find(x=>x.id===v);if(!p)return;
 f.src='https://www.google.com/maps?q='+p.lat+','+p.lng+'&z=17&t='+sat+'&output=embed&hl=en';
 $('#gopen').href='https://www.google.com/maps/search/?api=1&query='+p.lat+','+p.lng;
 $('#gdir').href=hasEnd(p)?'https://www.google.com/maps/dir/?api=1&origin='+p.lat+','+p.lng+'&destination='+p.endLat+','+p.endLng+'&travelmode=driving':'https://www.google.com/maps/dir/?api=1&destination='+p.lat+','+p.lng}
function mapMode(md){const g=md==='google',A=$('#map')||$('#dmap'),W=$('#gwrap');if(!A||!W)return;
 A.style.display=g?'none':'';W.style.display=g?'':'none';
 document.querySelectorAll('.mtabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===md));
 if(g)gUpdate();else MAPS.forEach(w=>w.refresh&&w.refresh())}

/* ----- map filters: barangay and status ----- */
const bkey=p=>(p.municipality||'-')+'|'+p.barangay;
const mapList=()=>DB.projects.filter(p=>(!MF.b||bkey(p)===MF.b)&&(!MF.s||stat(p)===MF.s));
function setMF(k,v){MF[k]=v;LASTVIEW=null;render()}
function bq(){const p=MF.b?mapList()[0]||DB.projects.find(x=>bkey(x)===MF.b):null;return p?[p.barangay,p.municipality,p.province||'Iloilo','Philippines'].filter(Boolean).join(', '):''}
function mapFilters(){const B={};DB.projects.forEach(p=>{B[bkey(p)]=1});const keys=Object.keys(B).sort();
 return `<div class="row" style="margin-bottom:10px"><select style="flex:1;min-width:180px;margin:0" onchange="setMF('b',this.value)"><option value="">All barangays</option>${keys.map(k=>{const a=k.split('|');return `<option value="${esc(k)}" ${k===MF.b?'selected':''}>${esc(a[1])}${a[0]!=='-'?', '+esc(a[0]):''}</option>`}).join('')}</select><select style="flex:1;min-width:150px;margin:0" onchange="setMF('s',this.value)"><option value="">All statuses</option>${Object.keys(ST).map(s=>`<option ${s===MF.s?'selected':''}>${s}</option>`).join('')}</select></div>`}
async function mapSearch(){const q=($('#msearch').value||'').trim();if(!q)return;const w=MAPS[0];if(!w)return toast('Map is still loading.');w.touched=true;
 const go=pt=>{w.view(pt,16);w.marker(pt,'#2563eb','<b>'+esc(q)+'</b><br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query='+pt[0]+','+pt[1]+'">Open in Google Maps</a>')};
 if(useG()){new google.maps.Geocoder().geocode({address:q,componentRestrictions:{country:'PH'}},(r,s)=>{if(s==='OK'&&r&&r[0]){const l=r[0].geometry.location;go([l.lat(),l.lng()])}else toast('Place not found.')});return}
 try{const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q='+encodeURIComponent(q)),j=await r.json();if(!j.length)return toast('Place not found.');go([+j[0].lat,+j[0].lon])}catch(e){toast('Search failed. Check your connection.')}}
function mapSearchBox(){return '<div class="row" style="margin-bottom:10px"><input id="msearch" placeholder="Search any place, barangay or road" style="flex:1;margin:0;min-width:180px" onkeydown="if(event.key===\'Enter\')mapSearch()"><button class="btn sm" onclick="mapSearch()">Search</button></div>'}
function mapSummary(L){const c={};L.forEach(p=>{const s=stat(p);c[s]=(c[s]||0)+1});
 return `<p style="margin:0 0 8px"><b>${L.length}</b> ${L.length===1?'project':'projects'} on the map${L.length?': ':''}${Object.keys(ST).filter(s=>c[s]).map(s=>`<span class="chip" style="background:${ST[s]}22;color:${ST[s]};margin:0 4px 4px 0">${c[s]} ${s}</span>`).join('')}</p>`}
