/* ================= SIDE WORLD · TECHNO BUNKER ================= */
const BOUNCER=['....kkkkkkkk....','...kssssssssk...','..ksssssssssdk..','..kggggggggggk..','..kgwggkkgwggk.c','..ksssssssssdkc.','..ksssskkssssdkc','...kssssssssdk.c','..kkkdddddddkkk.','.kttttttttttttk.','ktttsssssssstttk','kttsssssssssdttk','kttttttwwttttttk','kttttttttttttttk','.kttttkkkkttttk.','..kkkkk..kkkkk..'];
const BOUNCER_PAL={k:'#140d1f',s:'#c98a5e',d:'#9a5f3a',g:'#1d1a24',w:'#ffffff',t:'#2a2440',c:'#3ef0c8'};
const HEADLINER=['.....kkkkkk.....','....kcccccck....','...kcccccccck...','..kpkkkkkkkkpk..','.kppksssssskppk.','.kppksesseskppk.','.kppksssssskppk.','..kkksskksskkk..','...khhhhhhhhk...','..khhhhhhhhhhk..','.ksshhhhhhhhssk.','kmmmmmmmmmmmmmmk','kmrrmllllllmrrmk','kmrrmlLlLlLmrrmk','kmmmmmmmmmmmmmmk','.kkkkkkkkkkkkkk.'];
const HEADLINER_PAL={k:'#140d1f',c:'#ff3d7f',p:'#3ef0c8',s:'#e0a878',e:'#140d1f',h:'#2a2440',m:'#4d4373',r:'#a98bff',l:'#241c40',L:'#3ef0c8'};
Object.assign(MONS,{
  strobebat:{name:'Strobe Bat',spr:BAT,pal:{k:K_,b:'#ff3d7f',w:'#3ef0c8'},sc:5,world:'bunker',problem:'Flickers between every tempo.',weak:'Knowing the techno tempo zones'},
  rumbleworm:{name:'Rumble Worm',spr:WORM,pal:{k:K_,g:'#6c5cff',w:K_},sc:5,world:'bunker',problem:'Smears mud under every kick.',weak:'A ducked, filtered rumble'},
  shuffleimp:{name:'Shuffle Imp',spr:GOBLIN,pal:{k:K_,g:'#ff7a3a',w:'#ffffff',c:'#2a2440',y:'#3ef0c8'},sc:5,world:'bunker',problem:'Marches dead straight.',weak:'Swing'},
  drumspirit:{name:'Drum Spirit',spr:GHOST,pal:{k:K_,g:'#d9a441',w:K_},sc:5,world:'bunker',problem:'Hides in loops of three.',weak:'Polyrhythm'},
  bounceblob:{name:'Bounce Blob',spr:SLIME,pal:{k:K_,g:'#ff4f9a',d:'#a8306a',w:'#ffffff'},sc:5,world:'bunker',problem:'Its bass sits on the kicks.',weak:'Offbeat bass'},
  acidslime:{name:'Acid Smiley',spr:SLIME,pal:{k:K_,g:'#ffcc4d',d:'#c9821c',w:'#140d1f'},sc:5,world:'bunker',problem:'Squelches without accents or slides.',weak:'303 accents and slides'},
  bouncer:{name:'The Bouncer',spr:BOUNCER,pal:BOUNCER_PAL,sc:5,world:'bunker',problem:'Lets in only grooves that bounce.',weak:'Offbeat bass and hits on the beat'},
  headliner:{name:'The Headliner',spr:HEADLINER,pal:HEADLINER_PAL,sc:5,world:'bunker',problem:'Owns the 4 AM floor.',weak:'Every techno groove'}});
COS.push({id:'phones-strobe',slot:'phones',name:'Strobe Cans',col:'#ff3d7f',price:null,how:'Defeat The Bouncer'},{id:'hoodie-rave',slot:'hoodie',name:'Rave Neon',col:'#3ef0c8',price:null,how:'Defeat The Headliner'},{id:'kit-bunker',slot:'kit',name:'Bunker 909 Kit',col:'#ff7a3a',price:null,how:'Pass the Club Trial'});

/* ---- lesson visuals ---- */
function tempoMap(host){const Z=[['DETROIT',125,130,'#6cb8ff'],['TRIBAL',128,138,'#d9a441'],['ACID',130,140,'#ffcc4d'],['HARDGROOVE',135,145,'#ff7a3a'],['HARD TECHNO',145,160,'#ff4f5a'],['HARD BOUNCE',160,172,'#ff4f9a']];
  return display(host,140,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);const lo=120,hi=175,X=b=>(b-lo)/(hi-lo)*W;g.font='10px VT323, monospace';
    for(let b=lo;b<=hi;b+=5){const x=Math.round(X(b))+.5;g.strokeStyle=b%10?'#171230':'#2a2248';g.beginPath();g.moveTo(x,0);g.lineTo(x,H-12);g.stroke();if(b%10===0&&b<hi){g.fillStyle='#6a5f9a';g.fillText(String(b),x+2,H-2)}}
    Z.forEach(([n,a,b,c],i)=>{const y=4+i*20;g.fillStyle=c+'44';g.fillRect(X(a),y,X(b)-X(a),15);g.fillStyle=c;g.fillRect(X(a),y,2,15);g.fillText(n,Math.min(W-62,X(a)+5),y+11)})})}
function chainViz(host,steps,col){return display(host,48,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);const n=steps.length,gap=7,bw=(W-(n-1)*gap)/n;g.font='10px VT323, monospace';
  steps.forEach((s,i)=>{const x=i*(bw+gap);g.fillStyle=i===0?'#3d3166':'#1d1636';g.fillRect(x,10,bw,28);g.strokeStyle=col;g.strokeRect(x+.5,10.5,bw-1,27);g.fillStyle='#f1e7d0';const tw=g.measureText(s).width;g.fillText(s,x+(bw-tw)/2,28);if(i<n-1){g.fillStyle=col;g.fillRect(x+bw,23,gap,2)}})})}
function swingViz(host,sw0,onSet){let sw=sw0;const d=display(host,84,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);const cw=W/16,del=swingDelay(sw,1);g.font='10px VT323, monospace';
    [['STRAIGHT',0,'#8a7fa8'],[`SWING ${sw}% · +${Math.round(swingDelay(sw,60/140/4)*1000)} MS AT 140 BPM`,1,'#ff4f9a']].forEach(([lab,row,c])=>{const y=row?56:20;g.fillStyle=c;g.fillText(lab,4,y-7);
      for(let i=0;i<16;i++){const x=(i+(row&&i%2?del:0))*cw+cw*.25;g.fillStyle=i%4===0?'#f1e7d0':row&&i%2?'#ff4f9a':'#3ef0c8';g.fillRect(x,y,3,i%4===0?18:11)}})});
  const kr=h('div','krow');host.append(kr);knob(kr,{label:'SWING',min:50,max:75,step:1,value:sw,fmt:v=>Math.round(v)+'%',col:'#ff4f9a',onInput:v=>{sw=Math.round(v);d.redraw();if(onSet)onSet(sw)}});return d}
function polyViz(host,len){return display(host,72,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);const N=48,cw=W/N;g.font='10px VT323, monospace';
  for(let s=0;s<N;s++){const x=s*cw;if(s%4===0){g.fillStyle='#ffb547';g.fillRect(x+1,14,Math.max(2,cw-2),16)}if(s%len===0){g.fillStyle=s%16===0?'#3ef0c8':'#d9a441';g.fillRect(x+1,44,Math.max(2,cw-2),16)}}
  for(let b=1;b<3;b++){g.fillStyle='#f1e7d0';g.fillRect(Math.round(b*16*cw),0,1,H)}g.fillStyle='#8a7fa8';g.fillText('KICK · EVERY 4 STEPS',4,10);g.fillText(`CONGA · EVERY ${len} STEPS · 3 BARS`,4,H-2)})}
function bassShapeViz(host){const d=display(host,92,(g,W,H)=>{gridLines(g,W,H,{cols:8,major:4});const X=bt=>bt/2*W;g.font='10px VT323, monospace';
  for(let k=0;k<2;k++){g.fillStyle='#f1e7d0';g.fillRect(X(k)+1,14,3,H-20)}
  for(let k=0;k<2;k++){g.beginPath();for(let x=Math.ceil(X(k+.5));x<=X(k+1)-3;x++){const p=(x-X(k+.5))/(X(k+1)-X(k+.5)),y=H-6-Math.pow(p,2.2)*(H-26);if(x===Math.ceil(X(k+.5)))g.moveTo(x,y);else g.lineTo(x,y)}g.strokeStyle='#ff4f9a';g.lineWidth=2.5;g.stroke();
    g.setLineDash([3,3]);g.beginPath();for(let x=Math.ceil(X(k+.5));x<=X(k+.85);x++){const p=(x-X(k+.5))/(X(k+.85)-X(k+.5)),y=H-6-Math.exp(-p*4)*(H-30);if(x===Math.ceil(X(k+.5)))g.moveTo(x,y);else g.lineTo(x,y)}g.strokeStyle='#3ef0c8';g.lineWidth=1.5;g.stroke();g.setLineDash([])}
  g.fillStyle='#ff4f9a';g.fillText('REVERSE = SWELLS INTO THE KICK',8,12);g.fillStyle='#3ef0c8';g.fillText('PLUCK = SHORT, DIES AWAY',8,24)});
  host.append(h('div','dispcap','<span>WHITE = KICK · 2 BEATS · BASS ON EVERY OFFBEAT</span>'));return d}
function rulesFeedback(fb,rows,okMsg){const bad=rows.filter(r=>!r.ok);fb.innerHTML=bad.length?`<p class="fb">${bad.map(r=>r.bad).join(' ')}</p>`:`<p class="fb good">${okMsg}</p>`;return!bad.length}
/* ---- the studio's Bunker Box: the jam is kept in S.bbox (saved like the rest of the game) ---- */
const BB_KEYS=['bpm','swing','rumble','drive','kdrive','bassMode','root'];
function packBB(st){const o={pat:{},len:{},vol:Object.assign({},st.vol)};BB_KEYS.forEach(k=>o[k]=st[k]);TT_ORDER.forEach(k=>{o.pat[k]=st.pat[k].slice();o.len[k]=st.len[k]||16});o.acid=st.acid?JSON.parse(JSON.stringify(st.acid)):null;o.syn=st.syn?synClean(st.syn):null;return o}
function unpackBB(o){if(!o||!o.pat)return null;const st=mkSt({});BB_KEYS.forEach(k=>{if(o[k]!=null)st[k]=o[k]});
  TT_ORDER.forEach(k=>{const a=o.pat[k];if(Array.isArray(a)&&a.length===16)st.pat[k]=a.map(v=>+v||0);if(o.len&&BB_LEN.includes(o.len[k]))st.len[k]=o.len[k]});
  Object.assign(st.vol,o.vol||{});if(o.acid)st.acid=JSON.parse(JSON.stringify(o.acid));if(o.syn)st.syn=synClean(o.syn);return st}
function bbSummary(){const st=unpackBB(S.bbox);if(!st)return'NO JAM SAVED YET';const n=TT_ORDER.filter(k=>st.pat[k].some(Boolean)).length,sy=st.syn?SYN_KEYS.filter(k=>st.syn[k].clip.length).length:0;
  return`YOUR JAM · ${st.bpm} BPM · ${n} TRACK${n===1?'':'S'}${sy?` · ${sy} SYNTH${sy===1?'':'S'}`:''}`}
/* the Bunker Box has its own screen (bottom bar · BUNKER BOX); the jam is kept in S.bbox and saved on every change */
let BB_RIG=null;
function openBunkerBox(){go('bbox')}
RENDER.bbox=scr=>{if(BB_RIG){BB_RIG.stop();BB_RIG=null}
  if(!has('groovebox')){scr.innerHTML=topbar('BUNKER BOX')+`<div class="stack"><div class="win raised stack" style="border-color:#ff7a3a"><p class="eyebrow" style="color:#ff7a3a">GROOVEBOX · LOCKED</p><h3>The Bunker Box</h3>
    <p style="font-size:15px">A techno groovebox: 14 drum tracks, an offbeat bass and 2 synths with a MIDI piano roll. You win it in the Techno Bunker, at the end of the lesson “The Techno Engine”.</p>
    ${worldOpen('bunker')?'<button class="btn block" data-a="go" style="background:#ff7a3a">GO TO THE TECHNO BUNKER ▶</button>':'<p class="muted">The Techno Bunker opens once Beat Forest is cleared.</p>'}</div></div>`;
    hydrateIcons(scr);const b=$('[data-a=go]',scr);if(b)b.onclick=()=>{sfx.tap();go('region','bunker')};return}
  scr.innerHTML=topbar('BUNKER BOX')+`<div class="stack"><div class="row sp" style="align-items:center;gap:8px"><p class="eyebrow" style="color:#ff7a3a">FREE JAM · AUTO-SAVED</p><p class="num bbx-sum" style="font-size:16px;color:#ff7a3a">${bbSummary()}</p></div><div class="bbx-h" style="width:100%"></div></div>`;hydrateIcons(scr);
  const st=unpackBB(S.bbox)||mkSt({bpm:132,pat:{kick:BEATS}});if(!st.syn)st.syn=synNew();
  const keep=s=>{S.bbox=packBB(s);save();const e=$('.bbx-sum',scr);if(e)e.textContent=bbSummary()};
  BB_RIG=bunkerRig($('.bbx-h',scr),{presets:true,synths:true,show:['swing','rumble','drive','bass','len','stop'],state:st,onChange:keep})};
/* what the Bunker gives you, and where it shows up */
const BUNKER_LOOT=[['GROOVEBOX · BUNKER BOX','#ff7a3a',()=>has('groovebox'),'Finish “The Techno Engine”','this panel'],['STROBE CANS','#ff3d7f',()=>S.owned.includes('phones-strobe'),'Defeat The Bouncer','your wardrobe'],
  ['RUMBLE KNOB','#a98bff',()=>hasAb('rumblecraft'),'Defeat The Headliner','the Mix Rack'],['RAVE NEON HOODIE','#3ef0c8',()=>S.owned.includes('hoodie-rave'),'Defeat The Headliner','your wardrobe'],['BUNKER 909 KIT','#ff7a3a',()=>S.owned.includes('kit-bunker'),'Pass the Club Trial','SWAP KIT']];
function bunkerCard(){return`<div class="win raised stack bbx-card"><div class="row sp"><p class="eyebrow" style="color:#ff7a3a">GROOVEBOX · BUNKER BOX</p><span class="chip" style="color:#ff7a3a">TECHNO BUNKER</span></div>
  <p style="font-size:15px">The techno drum machine you won in the Bunker: 14 tracks, MPC swing, loop lengths, rumble, drive, an offbeat bass and 2 synths (stab, lead, pad, pluck, acid, or your own synth). Load a style with ◀ ▶ and make it yours.</p>
  <p class="num bbx-sum" style="font-size:18px;color:#ff7a3a">${bbSummary()}</p><button class="btn block" data-a="bbox" style="background:#ff7a3a">▶ OPEN THE BUNKER BOX</button>
  <p class="eyebrow" style="padding:0">BUNKER REWARDS</p><div class="stack bbx-loot" style="gap:6px">${BUNKER_LOOT.map(([n,col,got,how,where])=>{const g=got();return`<div class="sw ${g?'on':'lock'}"><i style="background:${col}"></i><span class="grow">${n}<br><small class="muted">${g?'✓ IN '+where.toUpperCase():how+' · then in '+where}</small></span></div>`}).join('')}</div></div>`}
const FLAT_ACID={acc:new Array(16).fill(0),sl:new Array(16).fill(0),reso:.2,env:.25};
const kitHear=(row,list,done)=>{const heard=new Set();list.forEach(([l,fn],k)=>{const x=h('button','btn ghost sm',l);x.onclick=()=>{fn();heard.add(k);if(heard.size>=list.length)done()};row.append(x)})};

Object.assign(LESSONS,{
t1:{title:'The Techno Engine',teaches:['technogenres'],skills:['technogenres','patterns'],xp:100,coins:15,tool:'groovebox',game:'radar',mission:'groovebox',
 battle:{mon:'strobebat',hp:3,gen:i=>i%2?conceptQ('technogenres'):genreQ(1)},
 steps:[
 {k:'DISCOVER',render(b,done){lessonHead(b,'Welcome to the Bunker',`Techno was born in <b>Detroit</b> in the mid-80s: Juan Atkins, Derrick May and Kevin Saunderson built funk out of drum machines. Its engine is simple: a <b>kick on every beat</b> (four on the floor), a <b>clap</b> on 2 and 4, an <b>open hat on every offbeat</b> and fast <b>16th hats</b>.<br><br>The tempo picks the style. Every scene has its own speed zone:`);eyebrowW(b,'bunker');
   tempoMap(b);b.append(h('p','muted','Hear each part of the 909-style kit:'));const row=h('div','row wrap');row.style.gap='6px';b.append(row);
   kitHear(row,[['kick','KICK'],['clap','CLAP'],['chat','CLOSED HAT'],['ohat','OPEN HAT'],['ride','RIDE']].map(([k,n])=>['▶ '+n,()=>{const G=LG();if(!G)return;const st=mkSt({});G.set(st);tvoice(st,k,1,now()+.03,G,0)}]),done)}},
 {k:'LISTEN',render(b,done){b.innerHTML='<div class="big-title">Skeleton, then engine</div><p>A is only the kick and the clap. B adds the open hat on every offbeat, the 16th hats and a ride. Hear the drive appear.</p><div class="abhost"></div>';
   abWidget($('.abhost',b),[abSt(mkSt({bpm:130,pat:{kick:BEATS,clap:[4,12]}}),'Kick + clap','The skeleton. Steady, but it does not move yet.'),abSt(mkSt({bpm:130,pat:{kick:BEATS,clap:[4,12],ohat:OFF,chat:ALL16.map(i=>[i,i%2?1:2]),ride:OFF}}),'The full engine','Offbeat open hats, 16th hats, a ride: now it drives.')],done)}},
 {k:'EXPERIMENT',render(b,done,ctx){b.innerHTML='<div class="big-title">The Bunker Box</div><p>Your new groovebox, built like a TR-909 or an Ableton Drum Rack. Press PLAY and program. Discover at least 3:</p>';
   const mark=discover(b,['Put an open hat on all four offbeats (the "&" columns)','Push the tempo to 140 BPM or more','Give the closed hat 8 hits or more','Make a ghost note (tap a hat cell twice)'],3,done);
   const rig=bunkerRig(b,{tracks:['kick','clap','chat','ohat','ride'],init:{bpm:126,pat:{kick:BEATS}},onChange:st=>{if(OFF.every(i=>st.pat.ohat[i]))mark(0);if(st.bpm>=140)mark(1);if(hits(st,'chat')>=8)mark(2);if(['clap','chat','ohat','ride'].some(k=>st.pat[k].includes(2)))mark(3)}});ctx.onLeave(()=>rig.stop())}},
 {k:'CHALLENGE',render(b,done,ctx){b.innerHTML='<div class="big-title">Build the engine</div><p>Program a classic techno engine, then CHECK:</p><div class="check"><div>Kick on every beat, nothing in between</div><div>Clap on beats 2 and 4</div><div>Open hat on every offbeat</div><div>8 closed hats or more</div><div>Tempo between 125 and 145 BPM</div></div>';
   const rig=bunkerRig(b,{tracks:['kick','clap','chat','ohat','ride'],init:{bpm:118}});ctx.onLeave(()=>rig.stop());const fb=h('div'),ck=h('button','btn neon block','CHECK');b.append(fb,ck);
   ck.onclick=()=>{const st=rig.st;const ok=rulesFeedback(fb,[{ok:kick4(st),bad:'The kick must sit on every beat (steps 1, 5, 9, 13) and nowhere else.'},{ok:st.pat.clap[4]&&st.pat.clap[12],bad:'Put the clap on beats 2 and 4 (steps 5 and 13).'},{ok:OFF.every(i=>st.pat.ohat[i]),bad:'Put an open hat on every offbeat: the "&" columns (steps 3, 7, 11, 15).'},{ok:hits(st,'chat')>=8,bad:'Give the closed hat at least 8 hits.'},{ok:st.bpm>=125&&st.bpm<=145,bad:`${st.bpm} BPM is outside techno's home zone: aim for 125–145.`}],`That is the techno engine at ${st.bpm} BPM. Every style in the Bunker is built on top of it.`);
     ctx.attempt('pattern',ok);if(ok){sfx.ok();done()}else sfx.bad()};
   ctx.hint(b,{hints:['Beats are the numbered columns (1, 2, 3, 4). Offbeats are the "&" columns.','Kick on 1-2-3-4, clap on 2 and 4, open hat on every "&", closed hats on the other 16ths.'],reveal:()=>rig.set({bpm:130,pat:Object.assign(rig.st.pat,{kick:ALL16.map(i=>i%4===0?1:0),clap:ALL16.map(i=>i===4||i===12?1:0),ohat:ALL16.map(i=>i%4===2?1:0),chat:ALL16.map(i=>i%2?1:0)})})})}}]},
t2:{title:'The Rumble',teaches:['rumble'],skills:['rumble'],xp:100,coins:15,mission:'groovebox',
 battle:{mon:'rumbleworm',hp:3,gen:i=>i%2?conceptQ('rumble'):rumbleQ(i<2?1:2)},
 steps:[
 {k:'DISCOVER',render(b,done){lessonHead(b,'The rumble',`Under hard and hypnotic techno there is a low <b>rumble</b>: pressure you feel in your chest between the kicks. The recipe: send the kick into a long, dark <b>reverb</b> (some producers use a delay), <b>low-pass</b> it so only the lows remain, <b>duck</b> it on every kick so the kick still punches through, then add some <b>drive</b> for grit.`);eyebrowW(b,'bunker');
   chainViz(b,['KICK','REVERB','LOW-PASS','DUCK','DRIVE','MIX'],'#a98bff');const row=h('div','row wrap');row.style.gap='6px';b.append(row);
   kitHear(row,[['▶ DRY KICK',()=>playQ(playSt(rumbleSt({rumble:0})))],['▶ WITH RUMBLE',()=>playQ(playSt(rumbleSt({rumble:.65})))]],done)}},
 {k:'LISTEN',render(b,done){b.innerHTML='<div class="big-title">Mud versus rumble</div><p>Same kick, same reverb. In A the rumble is not ducked: it smears over every kick. In B it dips on each kick and swells back in between.</p><div class="abhost"></div>';
   abWidget($('.abhost',b),[abSt(rumbleSt({rumble:.65,rduck:0}),'Not ducked','Mud: the tail covers the next kick.'),abSt(rumbleSt({rumble:.65,rduck:.9}),'Ducked','Punch, then pressure. Every kick cuts through.')],done)}},
 {k:'EXPERIMENT',render(b,done,ctx){b.innerHTML='<div class="big-title">Rumble Forge</div><p>Build a rumble with real controls and watch its shape. Discover at least 3:</p>';
   const mark=discover(b,['Turn the duck off (under 15%) with the amount over 50%: hear the mud','Darken the tone under 120 Hz','Stretch the decay over 4 seconds','Push the drive over 60%'],3,done);
   const rig=rumbleRig(b,{onChange:R=>{if(R.duck<.15&&R.amt>.5)mark(0);if(R.cut<120)mark(1);if(R.dec>4)mark(2);if(R.drive>.6)mark(3)}});ctx.onLeave(()=>rig.stop())}},
 {k:'CHALLENGE',render(b,done,ctx){b.innerHTML='<div class="big-title">Rumble, not mud</div><p>This rumble is too quiet, too bright, too short and not ducked. Fix it: amount 40% or more, tone between 60 and 200 Hz, decay between 1.5 and 6 s, duck 60% or more. Then CHECK.</p>';
   const rig=rumbleRig(b,{init:{amt:.15,dec:.8,cut:520,duck:0,drive:.2}});ctx.onLeave(()=>rig.stop());const fb=h('div'),ck=h('button','btn neon block','CHECK');b.append(fb,ck);
   ck.onclick=()=>{const R=rig.R;const ok=rulesFeedback(fb,[{ok:R.amt>=.4,bad:'Raise the amount to 40% or more.'},{ok:R.cut>=60&&R.cut<=200,bad:`The tone is ${fmtHz(R.cut)} Hz: keep it between 60 and 200 Hz so only the lows rumble.`},{ok:R.dec>=1.5&&R.dec<=6,bad:'Set the decay between 1.5 and 6 seconds.'},{ok:R.duck>=.6,bad:'Duck it 60% or more so the kick punches through.'}],'A real techno rumble: deep, long, and out of the way of every kick.');
     ctx.attempt('rumble',ok);if(ok){sfx.ok();done()}else sfx.bad()};
   ctx.hint(b,{hints:['Work through the chain: amount, then tone, then decay, then duck.','About: amount 60%, tone 120 Hz, decay 2.5 s, duck 85%.'],reveal:()=>rig.set({amt:.6,cut:120,dec:2.5,duck:.85})})}}]},
t3:{title:'Hardgroove',teaches:['groove'],skills:['groove','technogenres','patterns'],xp:100,coins:15,game:'swingsense',mission:'groovebox',
 battle:{mon:'shuffleimp',hp:3,gen:i=>i%2?conceptQ('groove'):swingAmtQ(1)},
 steps:[
 {k:'DISCOVER',render(b,done){lessonHead(b,'Hardgroove',`In the mid-90s, UK DJ <b>Ben Sims</b> called his mixtapes <b>Hard Groove Trax</b>: tough techno with the swing of Detroit, funk and hip-hop. Hardgroove runs at about <b>135–145 BPM</b> and is full of percussion: congas, toms, rims and shakers, often looped. Since the 2020s it is back in clubs everywhere.<br><br>Its secret is <b>swing</b>: every second 16th arrives a little late. The kick and clap stay on the grid while the hats and percussion lean back. Turn the knob to 56% or more:`);eyebrowW(b,'bunker');
   swingViz(b,50,sw=>{if(sw>=56)done()})}},
 {k:'LISTEN',render(b,done){b.innerHTML='<div class="big-title">Straight versus swung</div><p>The same hardgroove loop. A is dead straight (50%). B swings at 60%.</p><div class="abhost"></div>';
   abWidget($('.abhost',b),[abSt(grooveSt(50),'Straight · 50%','Machine-tight. It marches.'),abSt(grooveSt(60),'Swung · 60%','The hats and congas lean back: it grooves.')],done)}},
 {k:'EXPERIMENT',render(b,done,ctx){b.innerHTML='<div class="big-title">Find the groove</div><p>A straight beat with percussion lines ready to fill. Discover at least 3:</p>';
   const mark=discover(b,['Set the swing between 54 and 62% (the hardgroove zone)','Put a conga on an in-between 16th (the "e" or "a" columns)','Give the toms 2 hits or more','Set the tempo between 135 and 145 BPM'],3,done);
   const rig=bunkerRig(b,{tracks:['kick','clap','chat','ohat','conga','ltom','htom','rim','shaker'],show:['swing'],init:{bpm:128,pat:{kick:BEATS,clap:[4,12],chat:ODD,ohat:OFF}},onChange:st=>{if(st.swing>=54&&st.swing<=62)mark(0);if(ODD.some(i=>st.pat.conga[i]))mark(1);if(hits(st,'ltom')+hits(st,'htom')>=2)mark(2);if(st.bpm>=135&&st.bpm<=145)mark(3)}});ctx.onLeave(()=>rig.stop())}},
 {k:'CHALLENGE',render(b,done,ctx){b.innerHTML=`<div class="big-title">Your first hardgroove</div><p>${CLUB_RULES.hardgroove.brief} Make it pass every rule, then CHECK.</p>`;
   const rig=bunkerRig(b,{tracks:['kick','clap','chat','ohat','conga','ltom','htom','rim','shaker'],show:['swing','rumble'],init:{bpm:128,pat:{kick:BEATS,clap:[4,12],ohat:OFF}}});ctx.onLeave(()=>rig.stop());const fb=h('div'),ck=h('button','btn neon block','CHECK');b.append(fb,ck);
   ck.onclick=()=>{const ok=rulesFeedback(fb,ruleRows('hardgroove',rig.st),`Hardgroove: ${rig.st.bpm} BPM, ${rig.st.swing}% swing and percussion that rolls.`);ctx.attempt('tswing',ok);if(ok){sfx.ok();done()}else sfx.bad()};
   ctx.hint(b,{hints:['Tempo first (135–145), then swing (54–66%), then fill two percussion lines.','For the swing to show, put hats or congas on the in-between 16ths (the "e" and "a" columns).'],reveal:()=>{const s=styleState('hardgroove');rig.set({bpm:s.bpm,swing:s.swing,rumble:s.rumble,pat:s.pat})}})}}]},
t4:{title:'Tribal',teaches:['polyrhythm'],skills:['polyrhythm','groove'],xp:100,coins:15,mission:'groovebox',
 battle:{mon:'drumspirit',hp:3,gen:i=>i%2?conceptQ('polyrhythm'):polyQ(1)},
 steps:[
 {k:'DISCOVER',render(b,done){lessonHead(b,'Tribal',`Tribal techno lets the <b>drums</b> lead and keeps melody to a minimum. Its roots run from African drumming through New York's <b>tribal house</b> of the early 90s, Jeff Mills' percussive records of 1997 and the bongo-heavy techno of the early 2000s.<br><br>Two tricks: <b>call and response</b> (low toms answered by higher congas) and <b>polyrhythm</b>. A conga that loops every <b>3 steps</b> over a bar of 16 lands somewhere new on each beat, and only meets beat 1 again after 3 bars:`);eyebrowW(b,'bunker');
   polyViz(b,3);const x=h('button','btn ghost block','▶ HEAR 3 AGAINST 4');x.onclick=()=>{playQ(playSt(polySt(3),3));done()};b.append(x)}},
 {k:'LISTEN',render(b,done){b.innerHTML='<div class="big-title">Square versus polyrhythm</div><p>A loops the conga every 4 steps: locked to the kick. B loops it every 3 steps: it rolls around the kick.</p><div class="abhost"></div>';
   abWidget($('.abhost',b),[abSt(polySt(4),'Every 4 steps','Locked to the grid. Solid but square.'),abSt(polySt(3),'Every 3 steps','A polyrhythm: it keeps landing in new places.')],done)}},
 {k:'EXPERIMENT',render(b,done,ctx){b.innerHTML='<div class="big-title">The drum circle</div><p>Tap the number next to a drum to change its loop length. Discover at least 3:</p>';
   const mark=discover(b,['Set a loop length to 3','Set a loop length to 5 or 7','Make a call and response: 2+ tom hits and 2+ conga or bongo hits','Get 4 percussion lines playing'],3,done);
   const rig=bunkerRig(b,{tracks:['kick','ltom','htom','conga','bongo','shaker','cowbell'],show:['len','swing'],init:{bpm:132,pat:{kick:BEATS,shaker:ALL16.map(i=>[i,i%2?1:2])}},onChange:st=>{if(PERC.some(k=>st.len[k]===3))mark(0);if(PERC.some(k=>st.len[k]===5||st.len[k]===7))mark(1);if(hits(st,'ltom')+hits(st,'htom')>=2&&hits(st,'conga')+hits(st,'bongo')>=2)mark(2);if(PERC.filter(k=>hits(st,k)>0).length>=4)mark(3)}});ctx.onLeave(()=>rig.stop())}},
 {k:'CHALLENGE',render(b,done,ctx){b.innerHTML=`<div class="big-title">The ritual</div><p>${CLUB_RULES.tribal.brief} Pass every rule, then CHECK.</p>`;
   const rig=bunkerRig(b,{tracks:['kick','ltom','htom','conga','bongo','shaker','cowbell','ohat'],show:['len','swing'],init:{bpm:124,pat:{kick:BEATS}}});ctx.onLeave(()=>rig.stop());const fb=h('div'),ck=h('button','btn neon block','CHECK');b.append(fb,ck);
   ck.onclick=()=>{const ok=rulesFeedback(fb,ruleRows('tribal',rig.st),'The drums are talking: toms call, hand drums answer, and the loops roll around the kick.');ctx.attempt('poly',ok);if(ok){sfx.ok();done()}else sfx.bad()};
   ctx.hint(b,{hints:['Tempo 126–140, then three percussion lines, then change one loop length to 3.','A low tom every 3 steps, congas answering on 2 or 3 steps, a shaker on the 16ths.'],reveal:()=>{const s=styleState('tribal');rig.set({bpm:s.bpm,swing:s.swing,len:s.len,pat:s.pat})}})}}]},
t5:{title:'Hard Bounce',teaches:['bounce'],skills:['bounce','technogenres'],xp:100,coins:15,mission:'groovebox',
 battle:{mon:'bounceblob',hp:3,gen:i=>i%2?conceptQ('bounce'):bounceQ(1)},
 steps:[
 {k:'DISCOVER',render(b,done){lessonHead(b,'Hard bounce',`<b>Hard bounce</b> took over Europe's hard techno raves in the 2020s: <b>160 BPM and up</b>, bright and playful where hard techno is dark. Collectives like <b>240 KM/H</b>, founded by Spanish DJ Adrián Mills in 2021, made it a movement.<br><br>The kick stays on every beat and a <b>bass bounces on every offbeat</b>: either a <b>reverse bass</b> that swells into the next kick (a trick from hard trance and hardstyle) or a short <b>pluck</b>. Add claps, percussion, <b>short hits on the beat</b> every 4 or 8 beats, and <b>stops</b> where the kick drops out.`);eyebrowW(b,'bunker');
   bassShapeViz(b);const row=h('div','row wrap');row.style.gap='6px';b.append(row);
   kitHear(row,[['▶ KICK ONLY',()=>playQ(playSt(mkSt({bpm:162,pat:{kick:BEATS}})))],['▶ + REVERSE BASS',()=>playQ(playSt(bassSt('reverse')))],['▶ + PLUCK BASS',()=>playQ(playSt(bassSt('pluck')))]],done)}},
 {k:'LISTEN',render(b,done){b.innerHTML='<div class="big-title">Rolling versus bouncing</div><p>A is a rolling techno bass: short 16ths between the kicks. B is a hard bounce reverse bass: one swell per offbeat, cut right before each kick.</p><div class="abhost"></div>';
   abWidget($('.abhost',b),[abSt(bassSt('rolling'),'Rolling 16ths','Driving techno. It runs.'),abSt(bassSt('reverse'),'Reverse bass','It bounces: kick, swell, kick, swell.')],done)}},
 {k:'EXPERIMENT',render(b,done,ctx){b.innerHTML='<div class="big-title">Make it bounce</div><p>Bass cells cycle through notes; the BASS buttons pick its shape. Discover at least 3:</p>';
   const mark=discover(b,['Push the tempo to 160 BPM or more','Put the bass on all four offbeats','Switch the bass to REVERSE','Drop a stop: press STOP 1 BAR','Add a hit on a beat'],3,done);
   const rig=bunkerRig(b,{tracks:['kick','clap','chat','shaker','bass','hit'],show:['bass','stop','drive'],init:{bpm:140,bassMode:'pluck',pat:{kick:BEATS,clap:[4,12]}},onStopUsed:()=>mark(3),onChange:st=>{if(st.bpm>=160)mark(0);if(OFF.every(i=>st.pat.bass[i]))mark(1);if(st.bassMode==='reverse')mark(2);if(BEATS.some(i=>st.pat.hit[i]))mark(4)}});ctx.onLeave(()=>rig.stop())}},
 {k:'CHALLENGE',render(b,done,ctx){b.innerHTML=`<div class="big-title">Through the door</div><p>${CLUB_RULES.bounce.brief} Pass every rule, then CHECK. A tip from real productions: hits on the last 16th before a beat clash with the bass swell and sound off-grid.</p>`;
   const rig=bunkerRig(b,{tracks:['kick','clap','chat','shaker','bass','hit'],show:['bass','stop','drive'],init:{bpm:138,bassMode:'rolling',pat:{kick:BEATS,bass:{0:1,4:1,8:1,12:1}}}});ctx.onLeave(()=>rig.stop());const fb=h('div'),ck=h('button','btn neon block','CHECK');b.append(fb,ck);
   ck.onclick=()=>{const ok=rulesFeedback(fb,ruleRows('bounce',rig.st),`Kick, swell, kick, swell at ${rig.st.bpm} BPM: the floor bounces.`);ctx.attempt('tbounce',ok);if(ok){sfx.ok();done()}else sfx.bad()};
   ctx.hint(b,{hints:['Tempo to 160+, then move every bass note off the kicks onto the "&" columns.','Bass on steps 3, 7, 11 and 15 in REVERSE, claps on 5 and 13, one HIT on step 1.'],reveal:()=>{const s=styleState('bounce');rig.set({bpm:s.bpm,bassMode:s.bassMode,drive:s.drive,pat:s.pat})}})}}]},
t6:{title:'Acid & Hard Techno',teaches:['acid'],skills:['acid','rumble','technogenres'],xp:100,coins:15,mission:'groovebox',
 battle:{mon:'acidslime',hp:3,gen:i=>i%2?conceptQ('acid'):acidQ(1)},
 steps:[
 {k:'DISCOVER',render(b,done){lessonHead(b,'Acid, and the hard end',`In the early 80s Roland sold the <b>TB-303</b> as a bass machine for guitarists. Chicago producers twisted its knobs and found a squelch: Phuture's <b>Acid Tracks</b> (1987) started <b>acid</b>. Three ingredients: a resonant <b>low-pass filter</b>, <b>accents</b> (louder, brighter notes) and <b>slides</b> (the pitch glides into the next note).<br><br>At the hard end, <b>hard techno</b> (about 145–160 BPM) and German <b>schranz</b> push distorted kicks, heavy rumble and relentless loops.`);eyebrowW(b,'bunker');
   const row=h('div','row wrap');row.style.gap='6px';b.append(row);
   kitHear(row,[['▶ FLAT LINE',()=>playQ(playSt(acidSt(FLAT_ACID)))],['▶ ACID SQUELCH',()=>playQ(playSt(styleState('acid')))],['▶ HARD TECHNO',()=>playQ(playSt(styleState('hardtechno')))]],done)}},
 {k:'LISTEN',render(b,done){b.innerHTML='<div class="big-title">Flat versus squelch</div><p>The same notes. A has no accents, no slides and little resonance. B has all three.</p><div class="abhost"></div>';
   abWidget($('.abhost',b),[abSt(acidSt(FLAT_ACID),'Flat','A bass line. Nothing talks.'),abSt(styleState('acid'),'Squelch','Accents bark, slides glide, the filter talks.')],done)}},
 {k:'EXPERIMENT',render(b,done,ctx){b.innerHTML='<div class="big-title">Acid Box</div><p>A 303-style bass line: notes, accents, slides and the five knobs that matter. Discover at least 3:</p>';
   const mark=discover(b,['Push the resonance over 70%','Add a slide (the ~ row)','Add an accent (the A row)','Sweep the cutoff below 25% or above 75%'],3,done);
   const rig=acidRig(b,{init:{notes:[1,0,1,0,4,0,1,0,1,0,5,0,1,0,3,0],acc:new Array(16).fill(0),sl:new Array(16).fill(0),reso:.3,env:.4,cut:.4},onChange:a=>{if(a.reso>.7)mark(0);if(a.sl.some(Boolean))mark(1);if(a.acc.some(Boolean))mark(2);if(a.cut<.25||a.cut>.75)mark(3)}});ctx.onLeave(()=>rig.stop())}},
 {k:'CHALLENGE',render(b,done,ctx){b.innerHTML='<div class="big-title">Make it squelch</div><p>Turn this flat line into acid: 6 notes or more on 2 pitches or more, 2 accents or more, at least one slide into a note, resonance 60%+ and envelope mod 50%+. Then CHECK.</p>';
   const rig=acidRig(b,{init:{notes:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],acc:new Array(16).fill(0),sl:new Array(16).fill(0),reso:.2,env:.2,cut:.35}});ctx.onLeave(()=>rig.stop());const fb=h('div'),ck=h('button','btn neon block','CHECK');b.append(fb,ck);
   ck.onclick=()=>{const a=rig.a,notes=a.notes.filter(Boolean),slid=ALL16.some(i=>i<15&&a.sl[i]&&a.notes[i]&&a.notes[i+1]);
     const ok=rulesFeedback(fb,[{ok:notes.length>=6,bad:'Use at least 6 notes.'},{ok:new Set(notes).size>=2,bad:'Use at least 2 different pitches.'},{ok:ALL16.filter(i=>a.acc[i]&&a.notes[i]).length>=2,bad:'Put accents on 2 notes or more.'},{ok:slid,bad:'Add a slide on a note that is followed by another note.'},{ok:a.reso>=.6,bad:'Raise the resonance to 60% or more.'},{ok:a.env>=.5,bad:'Raise the envelope mod to 50% or more.'}],'Squelch! Accents bark, slides glide, the resonance talks. That is acid.');
     ctx.attempt('acid',ok);if(ok){sfx.ok();done()}else sfx.bad()};
   ctx.hint(b,{hints:['Fill more notes first, then add accents and a slide, then turn up RESO and ENV MOD.','A slide only glides if the next step also has a note.'],reveal:()=>{const s=styleState('acid').acid;rig.set({notes:s.notes,acc:s.acc,sl:s.sl,reso:s.reso,env:s.env,cut:s.cut,dec:s.dec})}})}}]}});

Object.assign(BATTLES,{
bouncer:{name:'THE BOUNCER',lv:18,hp:200,bpm:162,weak:'Offbeat bass and the grid',tests:['Techno styles','Bass shapes','Offbeat bass','Hits on the beat'],xp:200,coins:70,mission:'groovebox',cosmetics:['phones-strobe'],lines:['STROBE CANS UNLOCKED'],
 intro:'A wall of muscle blocks the Bunker door. THE BOUNCER folds his arms: "Your groove doesn\'t bounce. You\'re not getting in."',attack:'The Bouncer shoves you back into the queue. Your groove stumbles!',hint:'He only lets in grooves where the bass bounces between the kicks, at hard bounce speed.',
 listen:()=>playQ(playSt(styleState('bounce'))),
 rounds:[qRound({label:'READ THE QUEUE',gen:()=>genreQ(1),dmg:40}),qRound({label:'NAME THE BASS',gen:()=>bounceQ(2),dmg:45}),
  rigRound({label:'MAKE IT BOUNCE',skill:'bounce',tag:'tbounce',dmg:55,say:'His bass lands ON the kicks, so nothing bounces. Move it onto the four offbeats and push the tempo to 160 or more. Then STRIKE.',hints:['Offbeats are the "&" columns: steps 3, 7, 11 and 15.','Clear the bass from steps 1, 5, 9 and 13, put it on 3, 7, 11 and 15, tempo 162.'],
   build:host=>({rig:bunkerRig(host,{tracks:['kick','clap','bass'],show:['bass'],init:{bpm:140,bassMode:'pluck',pat:{kick:BEATS,clap:[4,12],bass:{0:1,4:1,8:1,12:1}}},edit:{bass:true}})}),
   check:k=>{const st=k.rig.st,off=OFF.every(i=>st.pat.bass[i])&&BEATS.every(i=>!st.pat.bass[i]),fast=st.bpm>=160;return off&&fast?{ok:true,win:'CRITICAL HIT! Kick, swell, kick, swell. The Bouncer\'s head starts nodding against his will.'}:{ok:false,why:`${off?'':'The bass must sit on all four offbeats and never on a kick. '}${fast?'':'Faster: 160 BPM or more.'}`}},
   reveal:k=>k.rig.set({bpm:162,pat:Object.assign(k.rig.st.pat,{bass:ALL16.map(i=>i%4===2?1:0)})})}),
  rigRound({label:'HIT THE GRID',skill:'bounce',tag:'tbounce',dmg:70,say:'Final blow! His hit lands on the last 16th before beat 1 and clashes with the bass swell. Put a short HIT on a beat instead. Then STRIKE.',hints:['Beats are the numbered columns.','Clear step 16 and put the HIT on step 1.'],
   build:host=>({rig:bunkerRig(host,{tracks:['kick','clap','bass','hit'],show:['bass'],init:{bpm:162,bassMode:'reverse',pat:{kick:BEATS,clap:[4,12],bass:{2:1,6:1,10:1,14:1},hit:[15]}},edit:{hit:true}})}),
   check:k=>{const hb=ALL16.filter(i=>k.rig.st.pat.hit[i]);return hb.length&&hb.some(i=>i%4===0)&&hb.every(i=>i%4!==3)?{ok:true,win:'CRITICAL HIT! The hit lands right on the beat. The Bouncer steps aside: "You\'re on the list."'}:{ok:false,why:hb.some(i=>i%4===3)?'A hit on the last 16th before a beat still clashes with the bass swell. Move it onto the beat.':'Put a hit on a beat (a numbered column).'}},
   reveal:k=>k.rig.setPat('hit',ALL16.map(i=>i===0?1:0))})]},
headliner:{name:'THE HEADLINER',lv:24,hp:320,bpm:140,weak:'Every techno groove',tests:['Techno styles','Swing','Polyrhythm','Rumble','Acid','A peak-time groove'],xp:300,coins:120,mission:'groovebox',ability:'rumblecraft',cosmetics:['hoodie-rave'],lines:['RAVE NEON HOODIE UNLOCKED'],
 intro:'The lights drop. THE HEADLINER steps up to the decks at 4 AM and the whole Bunker roars: "Think you can hold this floor? Show me."',attack:'The Headliner drops a brutal transition. The floor turns against you!',hint:'Every round is a different corner of techno. Tempo first, then the signature.',
 listen:()=>playQ(playSt(styleState('hardtechno'))),
 rounds:[qRound({label:'READ THE FLOOR',gen:()=>genreQ(3),dmg:45}),qRound({label:'FEEL THE SWING',gen:()=>swingAmtQ(2),dmg:45}),qRound({label:'FOLLOW THE DRUMS',gen:()=>polyQ(2),dmg:45}),qRound({label:'SHAKE THE ROOM',gen:()=>rumbleQ(2),dmg:45}),qRound({label:'SQUELCH',gen:()=>acidQ(2),dmg:45}),
  rigRound({label:'PEAK TIME',skill:['groove','polyrhythm','bounce'],tag:'tgenre',dmg:90,say:'Final blow! The Headliner hands you the decks for one track. Build what the floor asks for, then STRIKE.',hints:['Read the brief: tempo zone first, then the signature of the style.','Hardgroove = swing + percussion on the in-between 16ths. Tribal = toms, hand drums and an odd loop length. Hard bounce = 160+ and a bass on every offbeat.'],
   build:host=>{const id=pick(['hardgroove','tribal','bounce']),R=CLUB_RULES[id];host.append(h('p','qprompt',`The floor wants ${R.name}. ${R.brief}`));return{style:id,rig:bunkerRig(host,{show:['swing','len','bass','rumble'],tracks:['kick','clap','chat','ohat','ltom','htom','conga','bongo','shaker','bass','hit'],init:{bpm:120,pat:{kick:BEATS}}})}},
   check:k=>{const bad=ruleRows(k.style,k.rig.st).filter(r=>!r.ok);return bad.length?{ok:false,why:bad.map(r=>r.bad).join(' ')}:{ok:true,win:`CRITICAL HIT! A perfect ${CLUB_RULES[k.style].name.toLowerCase()} groove. The Headliner takes off the headphones, smiles, and hands you the closing set.`}},
   reveal:k=>k.rig.load(k.style)})]}});

TRIALS.btrial=scr=>trialShell(scr,{id:'btrial',world:'bunker',eyebrow:'CLUB',cert:'CLUB CERTIFIED',skills:['groove','polyrhythm','bounce','technogenres'],cosmetics:['kit-bunker'],mission:'groovebox',
 brief:'Tonight you play three rooms: hardgroove in the warehouse at 2 AM, tribal in the jungle room at 3, hard bounce on the main stage at 5. Here are my demos. None of them work yet.',
 problems:['Warehouse demo: too slow, dead straight, no percussion.','Jungle room demo: every loop is 16 steps long and there are no toms.','Main stage demo: too slow, and the bass sits on the kicks.'],
 hints:['Open one room at a time. Each room has its own rules: tempo zone first.','Hardgroove = 135–145 BPM, swing 54–66% and percussion on the in-between 16ths. Tribal = toms, hand drums and one odd loop length. Hard bounce = 160+ BPM, a bass on every offbeat and a hit on the beat.'],
 build:host=>{const ROOMS=['hardgroove','tribal','bounce'];const S0={hardgroove:mkSt({bpm:126,pat:{kick:BEATS,clap:[4,12],ohat:OFF}}),tribal:mkSt({bpm:132,pat:{kick:BEATS,conga:BEATS,shaker:ALL16}}),bounce:mkSt({bpm:140,bassMode:'rolling',pat:{kick:BEATS,clap:[4,12],bass:{0:1,4:1,8:1,12:1}}})};
   const seg=h('div','seg2');seg.style.setProperty('--pc','#ff7a3a');seg.innerHTML=ROOMS.map((id,i)=>`<button data-i="${i}">${i+1} · ${CLUB_RULES[id].venue}</button>`).join('');host.append(seg);const brief=h('p','muted');host.append(brief);const rh=h('div');host.append(rh);let rig=null,cur=0;
   const open=i=>{if(rig)rig.stop();cur=i;rh.innerHTML='';$$('button',seg).forEach(x=>x.classList.toggle('on',+x.dataset.i===i));const id=ROOMS[i];brief.textContent=CLUB_RULES[id].brief;
     rig=bunkerRig(rh,{state:S0[id],show:['swing','len','bass','rumble','drive','stop'],tracks:['kick','clap','chat','ohat','ride','ltom','htom','conga','bongo','rim','shaker','bass','hit']})};
   $$('button',seg).forEach(x=>x.onclick=()=>open(+x.dataset.i));open(0);return{S0,ROOMS,stop:()=>rig&&rig.stop(),rig:()=>rig,cur:()=>cur}},
 demo:k=>playQ(playSt(styleState(k.ROOMS[k.cur()]))),demoText:'That is a reference groove for the room you have open.',
 criteria:k=>k.ROOMS.map(id=>{const bad=ruleRows(id,k.S0[id]).filter(r=>!r.ok);return crit(CLUB_RULES[id].venue,!bad.length,`a real ${CLUB_RULES[id].name.toLowerCase()} set.`,bad.map(r=>r.bad).join(' '),id==='tribal'?'poly':id==='bounce'?'tbounce':'tswing')})});

WVICT.bunker={big:['FLOOR','RULED'],then:'“Techno is just a loud kick.”',now:'“I can make a techno floor move.”',
 learned:['The techno engine','Tempo zones of each style','A ducked rumble kick','Hardgroove swing','Tribal polyrhythms','Hard bounce offbeat bass','Hits on the grid','Acid accents and slides'],
 daw:'In Ableton: a Drum Rack with the Groove Pool (MPC swing around 54–62%), a Reverb into EQ Eight and a sidechained Compressor for the rumble, clips of different lengths for polyrhythms, and a 303-style synth for acid. Same moves, real tools.',
 next:'Back to the adventure',nextTxt:'Your techno skills follow you everywhere. Your studio has the Bunker Box now, and the Final Track offers techno, hardgroove, hard techno and hard bounce.'};
