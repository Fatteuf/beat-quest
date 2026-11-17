/* ================= the studio's PIANO ROLL: what the MIDI tool gives you =================
   S.roll holds one bar of MIDI notes as [step, note number, length in 16th steps, velocity 1-127].
   It plays on the studio's LEAD channel: on training keys before the Synthesizer, then on the player's own lead patch. */
const ROLL_HI=81,ROLL_LO=57,ROLL_COL='#a98bff';
const ROLL_LEN=[[1,'1/16'],[2,'1/8'],[4,'1/4'],[8,'1/2']],ROLL_VEL=[[45,'SOFT'],[85,'MEDIUM'],[120,'HARD']];
const ROLL_KEYS=mkPatch({wt:.22,cut:2600,res:1,fenv:.25,fd:240,a:3,d:520,s:.3,r:320});
const ROLL_DEMO=[[0,69,3,100],[3,72,1,70],[4,76,4,110],[8,77,2,90],[10,76,6,80]];
const rollInKey=m=>MINOR.includes(((m-9)%12+12)%12);
const rollLenName=l=>({1:'1/16',2:'1/8',4:'1/4',8:'1/2',16:'1 BAR'})[l]||l+'/16';
const rollOk=n=>Array.isArray(n)&&n.length===4&&n.every(Number.isFinite)&&n[0]>=0&&n[0]<16&&n[1]>=ROLL_LO&&n[1]<=ROLL_HI&&n[2]>=1&&n[0]+n[2]<=16&&n[3]>=1&&n[3]<=127;
let ROLL_PH=-1;
function rollNotes(){
  if(!Array.isArray(S.roll)){S.roll=[];const L=S.pattern&&S.pattern.lead;
    if(L&&L.some(Boolean)){L.forEach((v,i)=>{if(v)S.roll.push([i,69+SEMI[v],1,85])});L.fill(0)}}   /* a lead written in the old step grid becomes MIDI notes */
  else if(!S.roll.every(rollOk))S.roll=S.roll.filter(rollOk);
  return S.roll}
const rollPatch=()=>has('synth')?(S.leadPatch||PRESETS.LEAD):ROLL_KEYS;
const rollGain=v=>(S.vols.lead==null?.6:S.vols.lead)*.5*v/100;
function rollStep(s,t,dest){if(!has('midi')||!Array.isArray(S.roll)||!S.roll.length)return;const i=s%16,spb=60/S.bpm/4,P=rollPatch();
  withRoute(dest||A.route,()=>S.roll.forEach(n=>{if(n[0]===i)SV(t,midiF(n[1]),n[2]*spb*.92,P,rollGain(n[3]))}))}
function rollHear(m,v){initAudio();if(!A.ctx)return;const G=studioGraph();withRoute(G?G.tr.lead.inp:null,()=>SV(now()+.01,midiF(m),.32,rollPatch(),rollGain(v||85)))}
function rollSummary(){const n=rollNotes().length;return n?`${n} NOTE${n===1?'':'S'} · ${has('synth')?'YOUR LEAD SYNTH':'TRAINING KEYS'}`:'EMPTY CLIP · NO NOTES YET'}
/* the clip preview in the studio: one pixel row per note, A3 at the bottom, A5 at the top */
function rollMiniDraw(g,t,cv){const W=cv.width,H=cv.height,cw=W/16;px(g,0,0,W,H,'#08060f');
  for(let m=ROLL_HI;m>=ROLL_LO;m--)if(rollInKey(m))px(g,0,ROLL_HI-m,W,1,'#100c20');
  for(let i=4;i<16;i+=4)px(g,i*cw,0,1,H,'#2a2248');
  if(seq.on&&ROLL_PH>=0)px(g,ROLL_PH*cw,0,cw,H,'#221a40');
  (S.roll||[]).forEach(([st,m,l,v])=>px(g,st*cw+1,ROLL_HI-m,l*cw-1,1,v>=100?'#e6dcff':v>=70?ROLL_COL:'#6f5fa8'))}
function rollCard(){const lv=Math.round((S.vols.lead==null?.6:S.vols.lead)*100);
  return`<div class="win raised stack roll-card"><div class="row sp"><p class="eyebrow" style="color:${ROLL_COL}">MIDI · PIANO ROLL</p><span class="chip" style="color:${ROLL_COL}">SYNTH CAVES</span></div>
  <canvas class="px roll-mini" width="96" height="25"></canvas>
  <p class="num roll-sum" style="font-size:18px;color:${ROLL_COL}">${rollSummary()}</p>
  <p class="muted" style="font-size:14px">${has('synth')?'Your MIDI notes play through your own synth. EDIT LEAD SOUND changes the sound. The piano roll changes the notes.':'MIDI is notes, not sound. Until you win the Synthesizer (Waves &amp; Oscillators, in the Synth Caves), the studio plays your notes on training keys.'}</p>
  <div class="knobrow"><span>VOLUME</span><input type="range" class="roll-vol" min="0" max="100" value="${lv}" aria-label="MIDI clip volume"><span class="num">${lv}</span></div>
  <button class="btn block" data-a="roll" style="background:${ROLL_COL}">▶ OPEN THE PIANO ROLL</button></div>`}
function wireRollCard(card,before){addLive($('.roll-mini',card),rollMiniDraw);
  const vs=$('.roll-vol',card);vs.oninput=()=>{S.vols.lead=vs.value/100;vs.nextElementSibling.textContent=vs.value};vs.onchange=()=>{gain('volume','p',1);save()};
  const open=()=>{if(before)before();openPianoRoll(()=>{$('.roll-sum',card).textContent=rollSummary()})};$('[data-a=roll]',card).onclick=open;return open}
/* the studio clip: S.roll in A minor, A3–A5, played over the studio beat */
function openPianoRoll(onDone){rollNotes();let practiced=0;
  pianoRollModal({title:'PIANO ROLL · MIDI CLIP · 1 BAR',col:ROLL_COL,notes:S.roll,lo:ROLL_LO,hi:ROLL_HI,root:9,keyName:'A MINOR',demo:ROLL_DEMO,
    soundLine:has('synth')?'Sound: your lead synth.':'Sound: training keys, until you win the Synthesizer.',footer:'The light rows are the notes of A minor, the key of your bass line.',
    hear:rollHear,bpm:()=>S.bpm,
    play:(s,t,beat)=>{const i=s%16,tt=t+(hasAb('swing')&&i%4===2?S.swing/100*60/S.bpm/4:0);if(beat)studioStep(S.pattern,s,tt,S.vols);else{const G=studioGraph();rollStep(s,tt,G?G.tr.lead.inp:null)}},
    onStep:s=>{ROLL_PH=s%16;if(s%16===0&&s>0&&S.roll.length>=3&&practiced<6){practiced++;gain(['midi','notes'],'p',1)}},
    onStop:()=>{ROLL_PH=-1;autoReset()},onChange:()=>{save();if(onDone)onDone()},onClose:()=>{ROLL_PH=-1;save();if(onDone)onDone()}})}
/* a MIDI piano roll in a modal, for any one-bar clip. c.notes ([step, note, length, velocity]) is edited in place;
   c.play(s,t,withBeat) schedules one step, c.hear(note,vel) auditions one note, c.root is the pitch class of the minor key */
function pianoRollModal(c){seq.stop();initAudio();const notes=c.notes,inKey=p=>MINOR.includes(((p-c.root)%12+12)%12);let len=2,vel=85,beat=true,fold=true,rows=[],ph=null;
  const m=modal(`<p class="eyebrow" style="color:${c.col}">${c.title}</p>
   <p style="font-size:14.5px;text-align:left">Each block is one MIDI note. Its <b>row</b> is the pitch, its <b>start</b> is when it plays, its <b>length</b> is how long it holds, and its <b>brightness</b> is the velocity: how hard it is played. Tap an empty cell to add a note. Tap a note to delete it.</p>
   <p class="num pr-mon">MIDI MONITOR · TAP A KEY OR A CELL</p>
   <div class="proll"></div>
   <div class="pr-opts"><div class="pr-opt"><span class="kb-lab">LENGTH</span><div class="pr-seg" data-g="len">${ROLL_LEN.map(([l,n])=>`<button data-v="${l}">${n}</button>`).join('')}</div></div>
    <div class="pr-opt"><span class="kb-lab">VELOCITY</span><div class="pr-seg" data-g="vel">${ROLL_VEL.map(([v,n])=>`<button data-v="${v}">${n}</button>`).join('')}</div></div></div>
   <div class="transport" style="justify-content:center"><button class="btn neon" data-a="play">▶ PLAY</button><button class="chip neon" data-a="beat">WITH BEAT</button><button class="chip neon" data-a="fold">${c.keyName} ONLY</button></div>
   <div class="row wrap" style="justify-content:center">${c.demo?'<button class="btn ghost sm" data-a="demo">LOAD EXAMPLE</button>':''}<button class="btn ghost sm" data-a="clr">CLEAR</button></div>
   <p class="muted" style="font-size:13.5px">${c.soundLine} ${c.footer}</p>
   <button class="btn block fx-close">DONE</button>`);
  const R=$('.proll',m),mon=$('.pr-mon',m),playB=$('[data-a=play]',m);
  const saved=()=>{if(c.onChange)c.onChange()};
  const paintNotes=()=>{$$('.pn',R).forEach(x=>x.remove());notes.forEach(n=>{const r=rows.indexOf(n[1]);if(r<0)return;const b=h('button','pn');
      b.style.gridArea=`${r+1} / ${n[0]+2} / ${r+2} / ${n[0]+2+n[2]}`;b.style.opacity=(.4+.6*n[3]/127).toFixed(2);b.setAttribute('aria-label',`Delete ${noteName(n[1])} at step ${n[0]+1}`);b.onclick=()=>del(n);R.append(b)})};
  const changed=()=>{paintNotes();saved()};
  const add=(i,p)=>{const next=notes.filter(n=>n[1]===p&&n[0]>i).reduce((a,n)=>Math.min(a,n[0]),16),l=Math.max(1,Math.min(len,next-i));
    notes.push([i,p,l,vel]);notes.sort((a,b)=>a[0]-b[0]||b[1]-a[1]);c.hear(p,vel);haptic(6);
    mon.textContent=`NOTE ON · ${noteName(p)} · #${p} · VELOCITY ${vel} · ${rollLenName(l)}`;changed()};
  const del=n=>{const k=notes.indexOf(n);if(k>=0)notes.splice(k,1);haptic(4);mon.textContent=`NOTE DELETED · ${noteName(n[1])} · STEP ${n[0]+1}`;changed()};
  const build=()=>{R.innerHTML='';const used=new Set(notes.map(n=>n[1]));rows=[];for(let p=c.hi;p>=c.lo;p--)if(!fold||inKey(p)||used.has(p))rows.push(p);
    R.style.gridTemplateRows=`repeat(${rows.length},${fold?22:15}px)`;
    rows.forEach((p,r)=>{const k=h('button','pk'+([1,3,6,8,10].includes(p%12)?' bk':'')+(((p-c.root)%12+12)%12===0?' root':''),noteName(p));k.style.gridArea=`${r+1} / 1`;k.setAttribute('aria-label','Play '+noteName(p));
      k.onclick=()=>{c.hear(p,vel);mon.textContent=`NOTE ON · ${noteName(p)} · MIDI #${p} · ${midiF(p).toFixed(1)} Hz`};R.append(k);
      for(let i=0;i<16;i++){const b=h('button','pc'+(inKey(p)?' ik':'')+(i%4===0?' beat':''));b.style.gridArea=`${r+1} / ${i+2}`;b.setAttribute('aria-label',`Add ${noteName(p)} at step ${i+1}`);b.onclick=()=>add(i,p);R.append(b)}});
    ph=h('div','pph');ph.style.gridRow=`1 / ${rows.length+1}`;ph.style.display='none';R.append(ph);paintNotes()};
  const setPh=i=>{if(!ph)return;ph.style.display=i<0?'none':'';if(i>=0)ph.style.gridColumn=String(i+2)};
  const stopUI=()=>{playB.textContent='▶ PLAY';setPh(-1);if(c.onStop)c.onStop()};
  playB.onclick=()=>{if(seq.on){seq.stop();return}playB.textContent='■ STOP';
    seq.start({bpm:c.bpm,total:0,play:(s,t)=>c.play(s,t,beat),onStep:s=>{setPh(s%16);if(c.onStep)c.onStep(s)},onStop:stopUI,onEnd:stopUI})};
  const seg=(g,get,set)=>{const w=$(`[data-g=${g}]`,m),bs=$$('button',w),paint=()=>bs.forEach(b=>b.classList.toggle('on',+b.dataset.v===get()));bs.forEach(b=>b.onclick=()=>{set(+b.dataset.v);paint()});paint()};
  seg('len',()=>len,v=>{len=v});seg('vel',()=>vel,v=>{vel=v});
  const bt=$('[data-a=beat]',m);bt.onclick=()=>{beat=!beat;bt.textContent=beat?'WITH BEAT':'NOTES ONLY';bt.classList.toggle('neon',beat)};
  const fb=$('[data-a=fold]',m);fb.onclick=()=>{fold=!fold;fb.textContent=fold?c.keyName+' ONLY':'ALL 12 NOTES';fb.classList.toggle('neon',fold);build()};
  const twice=(b,act)=>{if(!b)return;const lab=b.textContent;let armed=0;b.onclick=()=>{if(notes.length&&!armed){b.textContent='TAP AGAIN TO CONFIRM';armed=setTimeout(()=>{armed=0;b.textContent=lab},2500);return}clearTimeout(armed);armed=0;b.textContent=lab;act()}};
  twice($('[data-a=demo]',m),()=>{notes.length=0;c.demo.forEach(n=>notes.push(n.slice()));build();saved();mon.textContent=`EXAMPLE LOADED · ${notes.length} NOTES IN ${c.keyName}`});
  twice($('[data-a=clr]',m),()=>{notes.length=0;build();saved();mon.textContent='CLIP CLEARED · TAP A CELL TO START'});
  $('.fx-close',m).onclick=()=>{seq.stop();m.close();if(c.onClose)c.onClose()};
  build();return m}
