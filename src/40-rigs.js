/* =====================================================================
   PRO PLUGIN KIT: knobs, faders, meters, displays, keyboard
   ===================================================================== */
const DPR=()=>Math.min(2,window.devicePixelRatio||1);
const LOG20=f=>Math.log10(f/20)/3;                       // 20 Hz..20 kHz → 0..1
const FROMLOG20=x=>20*Math.pow(1000,clamp(x,0,1));
const fmtHz=f=>f>=1000?(f/1000).toFixed(f>=10000?0:1)+'k':Math.round(f)+'';
const fmtMs=v=>v>=1000?(v/1000).toFixed(v>=10000?0:2)+' s':(v<10?v.toFixed(1):Math.round(v))+' ms';
const dbToG=db=>Math.pow(10,db/20),gToDb=g=>20*Math.log10(Math.max(g,1e-6));
function plug(host,o){const f=h('div','plug');f.style.setProperty('--pc',o.col||'#ffb547');
  f.innerHTML=`<div class="plug-h"><span class="plug-led"></span><b>${o.name}</b><span class="plug-type">${o.type||''}</span><span class="grow"></span>${o.extra||''}${o.bypass===false?'':'<button class="plug-btn" data-a="byp" aria-pressed="true" title="Bypass">ON</button>'}</div><div class="plug-b"></div>`;host.append(f);
  const api={el:f,body:$('.plug-b',f),head:$('.plug-h',f),byp:false,onBypass:null};const b=$('[data-a=byp]',f);
  if(b)b.onclick=()=>{api.byp=!api.byp;f.classList.toggle('off',api.byp);b.textContent=api.byp?'OFF':'ON';b.setAttribute('aria-pressed',String(!api.byp));sfx.tap();if(api.onBypass)api.onBypass(api.byp)};return api}
function sect(host,title,extra){const s=h('div','sect');s.innerHTML=`<div class="sect-h"><b>${title}</b><span class="grow"></span>${extra||''}</div>`;host.append(s);return s}
function display(host,hgt,draw){const cv=h('canvas','disp');cv.style.height=hgt+'px';host.append(cv);
  const api={cv,W:0,H:hgt,redraw(){if(!cv.isConnected)return;const w=cv.clientWidth||280,d=DPR();if(cv.width!==Math.round(w*d)||cv.height!==Math.round(hgt*d)){cv.width=Math.round(w*d);cv.height=Math.round(hgt*d)}const g=cv.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,hgt);api.W=w;draw(g,w,hgt)}};
  requestAnimationFrame(()=>api.redraw());return api}
function gridLines(g,W,H,opt){opt=opt||{};g.fillStyle='#07050d';g.fillRect(0,0,W,H);g.lineWidth=1;
  if(opt.freq){[50,100,200,500,1000,2000,5000,10000].forEach(f=>{const x=Math.round(LOG20(f)*W)+.5;g.strokeStyle=f===100||f===1000||f===10000?'#241d40':'#171230';g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()});
    g.fillStyle='#4d4380';g.font='9px VT323, monospace';[[100,'100'],[1000,'1k'],[10000,'10k']].forEach(([f,t])=>g.fillText(t,LOG20(f)*W+3,H-3))}
  if(opt.db){const r=opt.db;for(let d=-r;d<=r;d+=6){const y=Math.round(H/2-d/r*(H/2-6))+.5;g.strokeStyle=d===0?'#2e2552':'#171230';g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}}
  if(opt.cols){for(let i=1;i<opt.cols;i++){const x=Math.round(i/opt.cols*W)+.5;g.strokeStyle=opt.major&&i%opt.major===0?'#2e2552':'#171230';g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}}}
function arcPath(r,a0,a1){const p=a=>[24+r*Math.sin(a*Math.PI/180),24-r*Math.cos(a*Math.PI/180)];const s=p(a0),e=p(a1);return`M${s[0].toFixed(2)} ${s[1].toFixed(2)} A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${e[0].toFixed(2)} ${e[1].toFixed(2)}`}
/* rotary knob: drag up/down (or sideways), wheel, arrow keys, double-tap resets */
function knob(host,o){const el=h('div','knob2');el.tabIndex=0;el.setAttribute('role','slider');el.setAttribute('aria-label',o.label);const sz=o.size||42;
  el.innerHTML=`<svg viewBox="0 0 48 48" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="24" cy="24" r="15.5" fill="#241c40" stroke="#07050d" stroke-width="2"/><circle cx="24" cy="24" r="12" fill="#1a1430"/><path d="${arcPath(20,-135,135)}" fill="none" stroke="#2a2248" stroke-width="4"/><path class="kv" fill="none" stroke-width="4"/><line class="kp" x1="24" y1="24" x2="24" y2="12" stroke="#f1e7d0" stroke-width="3"/></svg><span class="kb-lab">${o.label}</span><span class="kb-v"></span>`;
  host.append(el);const kv=$('.kv',el),kp=$('.kp',el),vEl=$('.kb-v',el);kv.setAttribute('stroke',o.col||'#ffb547');
  const lg=!!o.log,mn=o.min,mx=o.max;const toN=v=>lg?Math.log(v/mn)/Math.log(mx/mn):(v-mn)/(mx-mn);
  const fromN=n=>{n=clamp(n,0,1);let v=lg?mn*Math.pow(mx/mn,n):mn+(mx-mn)*n;if(o.step)v=Math.round(v/o.step)*o.step;return v};
  let val=o.value;
  function paint(){const n=clamp(toN(val),0,1),a=-135+270*n,z=o.bipolar?0:-135,s=Math.min(z,a),e=Math.max(z,a);kv.setAttribute('d',e-s<.6?'':arcPath(20,s,e));kp.setAttribute('transform',`rotate(${a.toFixed(1)} 24 24)`);vEl.textContent=o.fmt?o.fmt(val):String(Math.round(val*100)/100);el.setAttribute('aria-valuetext',vEl.textContent)}
  function setN(n){const v=fromN(n);if(v===val)return;val=v;paint();if(o.onInput)o.onInput(val)}
  let drag=null;
  el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(err){}drag={y:e.clientY,x:e.clientX,n:toN(val)};el.classList.add('hot');if(o.onTouch)o.onTouch()});
  el.addEventListener('pointermove',e=>{if(drag)setN(drag.n+(drag.y-e.clientY)/140+(e.clientX-drag.x)/280)});
  const up=()=>{if(drag){drag=null;el.classList.remove('hot');if(o.onEnd)o.onEnd(val)}};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('dblclick',()=>{if(o.def!=null){val=o.def;paint();if(o.onInput)o.onInput(val);if(o.onEnd)o.onEnd(val)}});
  el.addEventListener('keydown',e=>{const d={ArrowUp:.02,ArrowRight:.02,ArrowDown:-.02,ArrowLeft:-.02}[e.key];if(d){e.preventDefault();setN(toN(val)+d);if(o.onEnd)o.onEnd(val)}});
  el.addEventListener('wheel',e=>{e.preventDefault();setN(toN(val)-Math.sign(e.deltaY)*.02);if(o.onEnd)o.onEnd(val)},{passive:false});
  paint();return{el,get:()=>val,set(v,fire){val=v;paint();if(fire&&o.onInput)o.onInput(val)},enable(on){el.classList.toggle('off',!on)}}}
/* DAW-style vertical fader in dB (taper: the top 70% covers -24..+6 dB) */
function faderV(host,o){const w=h('div','fdr');w.tabIndex=0;w.setAttribute('role','slider');w.setAttribute('aria-label',o.label||'Fader');w.innerHTML='<div class="cap"></div>';const H=o.height||140;w.style.height=H+'px';host.append(w);
  const cap=$('.cap',w),mn=-60,mx=6;let db=o.value==null?0:o.value;
  const toN=d=>d>=-24?.3+.7*(d+24)/(mx+24):.3*(d-mn)/(-24-mn),fromN=n=>{n=clamp(n,0,1);return n>=.3?-24+(n-.3)/.7*(mx+24):mn+n/.3*(-24-mn)};
  const paint=()=>{cap.style.top=((1-toN(db))*(H-16))+'px';w.setAttribute('aria-valuetext',db<=-59.5?'-inf dB':db.toFixed(1)+' dB')};
  const setY=y=>{const n=1-(y-8)/(H-16);db=Math.round(fromN(n)*10)/10;if(db<=-59.5)db=-60;paint();if(o.onInput)o.onInput(db)};
  let drag=false;w.addEventListener('pointerdown',e=>{e.preventDefault();try{w.setPointerCapture(e.pointerId)}catch(err){}drag=true;setY(e.clientY-w.getBoundingClientRect().top)});
  w.addEventListener('pointermove',e=>{if(drag)setY(e.clientY-w.getBoundingClientRect().top)});const up=()=>{if(drag){drag=false;if(o.onEnd)o.onEnd(db)}};w.addEventListener('pointerup',up);w.addEventListener('pointercancel',up);
  w.addEventListener('dblclick',()=>{db=0;paint();if(o.onInput)o.onInput(db);if(o.onEnd)o.onEnd(db)});
  w.addEventListener('keydown',e=>{const d={ArrowUp:1,ArrowDown:-1}[e.key];if(d){e.preventDefault();db=clamp(db+d,mn,mx);paint();if(o.onInput)o.onInput(db);if(o.onEnd)o.onEnd(db)}});
  paint();return{el:w,get:()=>db,set(v){db=v;paint()}}}
function meterV(host,H){const m=h('div','mtr');m.style.height=H+'px';m.innerHTML='<i></i><b></b>';host.append(m);let hold=-60,ht=0;
  return{set(db){const n=clamp((db+48)/54,0,1);$('i',m).style.height=n*100+'%';if(db>hold||performance.now()-ht>1500){hold=db;ht=performance.now()}$('b',m).style.bottom=clamp((hold+48)/54,0,1)*100+'%'}}}
function anPeakDb(an,buf){an.getFloatTimeDomainData(buf);let m=0;for(let i=0;i<buf.length;i++){const v=Math.abs(buf[i]);if(v>m)m=v}return gToDb(m)}
function drawSpectrum(g,W,H,an,fill,stroke,floor){if(!an)return;const n=an.frequencyBinCount,d=new Float32Array(n);an.getFloatFrequencyData(d);const sr=an.context.sampleRate;g.beginPath();let first=true;
  for(let x=0;x<=W;x+=2){const f=FROMLOG20(x/W),bin=Math.min(n-1,Math.round(f/(sr/2)*n));const db=isFinite(d[bin])?d[bin]:-140;const y=H-clamp((db-(floor||-100))/((floor?-floor:100)-10),0,1)*H;if(first){g.moveTo(x,y);first=false}else g.lineTo(x,y)}
  if(fill){g.lineTo(W,H);g.lineTo(0,H);g.closePath();g.fillStyle=fill;g.fill()}else{g.strokeStyle=stroke;g.lineWidth=1;g.stroke()}}
/* piano keyboard: press and hold to play (real note-on / note-off) */
function keyboard(host,o){o=o||{};const lo=o.lo||60,hi=o.hi||83,BL=[1,3,6,8,10];const wrap=h('div','kbd');host.append(wrap);const keys={},whites=[];
  for(let m=lo;m<=hi;m++)if(!BL.includes(m%12))whites.push(m);const ww=100/whites.length;
  whites.forEach(m=>{const k=h('button','wk',m%12===0?noteName(m):(o.labels?NOTE_NAMES[m%12]:''));k.setAttribute('aria-label',noteName(m));keys[m]=k;wrap.append(k)});
  for(let m=lo;m<=hi;m++)if(BL.includes(m%12)){const wi=whites.indexOf(m-1);const k=h('button','bk');k.setAttribute('aria-label',noteName(m));k.style.left=`calc(${(wi+1)*ww}% - ${(ww*.3).toFixed(2)}%)`;k.style.width=(ww*.6).toFixed(2)+'%';keys[m]=k;wrap.append(k)}
  const act=new Map(),sel=new Set();
  function on(m){initAudio();if(!A.ctx)return;stopMusic();const el=keys[m];if(o.select){if(sel.has(m))sel.delete(m);else sel.add(m);el.classList.toggle('sel',sel.has(m))}el.classList.add('on');
    const v=voiceOn(o.patch?o.patch():PLUCK,midiF(m+(o.shift?o.shift():0)),now()+.005,.34,o.dest?o.dest():null);act.set(m,v);if(o.onNote)o.onNote(m);haptic(5)}
  function off(m){const v=act.get(m);if(v){v.off(now());act.delete(m)}if(keys[m])keys[m].classList.remove('on')}
  Object.keys(keys).forEach(ms=>{const m=+ms,el=keys[m];el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(err){}on(m)});['pointerup','pointercancel'].forEach(ev=>el.addEventListener(ev,()=>off(m)))});
  return{keys,sel,flash(m,ms){const el=keys[m];if(!el)return;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),ms||260)},mark(list,cls){list.forEach(m=>keys[m]&&keys[m].classList.add(cls||'hint'))},unmark(cls){Object.values(keys).forEach(k=>k.classList.remove(cls||'hint'))},clearSel(){sel.clear();Object.values(keys).forEach(k=>k.classList.remove('sel'))},allOff(){[...act.keys()].forEach(off)}}}
/* a private output (its own analyser) that later plugins and game sounds don't interrupt */
function rigOut(){const c=A.ctx,g=c.createGain(),an=c.createAnalyser();an.fftSize=4096;an.smoothingTimeConstant=.75;g.connect(an);an.connect(A.bus);return{g,an,kill(){try{g.gain.setTargetAtTime(0,now(),.02)}catch(e){}setTimeout(()=>{try{an.disconnect()}catch(e){}},200)}}}
const tipLine=host=>{const t=h('p','tip');host.append(t);return t};

/* =====================================================================
   PIXEL WAVE — wavetable synthesizer (Serum-inspired)
   ===================================================================== */
const SYN_TIPS={wt:'Wavetable position: morphs the oscillator from sine to triangle to saw to square. More harmonics = brighter.',oct:'Octave: moves the whole sound up or down by octaves.',fine:'Fine: detunes by cents (1/100 of a semitone).',uni:'Unison: stacks several copies of the oscillator for a thick sound.',det:'Detune: spreads the unison voices apart. More = wider and more chorused.',lvl:'Level: the oscillator volume.',sub:'Sub: a sine one octave below, for weight.',
  cut:'Cutoff: where the filter starts removing frequencies. Low-pass + low cutoff = dark.',res:'Resonance: boosts the frequencies right at the cutoff. High = whistly, squelchy.',fenv:'Envelope amount: how far the filter envelope moves the cutoff on each note.',
  a:'Attack: time to reach full level.',d:'Decay: time to fall to the sustain level.',s:'Sustain: the level held while the key is down.',r:'Release: how long the note rings after you let go.',
  lfoRate:'LFO rate: how fast the modulation cycles, in Hz.',lfoDepth:'LFO depth: how far it moves the destination.'};
function synthRig(host,o){o=o||{};initAudio();const P=o.patch||mkPatch({});const show=o.show||['osc','filter','env','lfo'];let envTab='amp';
  const pg=plug(host,{name:'PIXEL WAVE',type:'WAVETABLE SYNTH',col:'#a98bff',bypass:false,extra:o.presets===false?'':'<button class="plug-btn" data-a="pprev" aria-label="Previous preset">◀</button><span class="chip pname" style="min-width:74px;justify-content:center">INIT</span><button class="plug-btn" data-a="pnext" aria-label="Next preset">▶</button>'});
  const B=pg.body,out=A.ctx?rigOut():null,K={},D={},segSync=[];const tip=tipLine(B);
  const change=()=>{Object.values(D).forEach(d=>d.redraw());segSync.forEach(f=>f());if(o.onChange)o.onChange(P)};
  const mk=(host2,key,label,min,max,fmt,extra)=>{K[key]=knob(host2,Object.assign({label,min,max,value:P[key],fmt,col:'#a98bff',onTouch:()=>{tip.textContent=SYN_TIPS[key]||''},onInput:v=>{P[key]=v;change()}},extra||{}));return K[key]};
  if(show.includes('osc')){const s=sect(B,'OSC A','<span class="chip wtn" style="font-size:9px">SAW</span>');
    D.wt=display(s,104,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);const frames=10;for(let k=frames;k>=0;k--){const pos=k/frames,ox=k*5,oy=-k*4,cur=Math.abs(pos-P.wt)<.051;g.beginPath();for(let x=0;x<=W-60;x+=2){const ph=x/(W-60)*Math.PI*2;const y=H*.62+oy-wtSample(pos,ph)*H*.26;if(x===0)g.moveTo(x+8+ox,y);else g.lineTo(x+8+ox,y)}g.strokeStyle=cur?'#c9b8ff':'rgba(108,92,255,'+(.18+.02*(frames-k))+')';g.lineWidth=cur?2:1;g.stroke()}
      g.beginPath();for(let x=0;x<=W-60;x+=2){const ph=x/(W-60)*Math.PI*2;const k=P.wt*frames;const y=H*.62-k*4-wtSample(P.wt,ph)*H*.26;if(x===0)g.moveTo(x+8+k*5,y);else g.lineTo(x+8+k*5,y)}g.strokeStyle='#f1e7d0';g.lineWidth=2.5;g.shadowColor='#a98bff';g.shadowBlur=8;g.stroke();g.shadowBlur=0;$('.wtn',s).textContent=WAVE_NAME[wtName(P.wt)]+' · '+Math.round(P.wt*100)+'%'});
    let dr=null;D.wt.cv.addEventListener('pointerdown',e=>{dr={x:e.clientX,v:P.wt};try{D.wt.cv.setPointerCapture(e.pointerId)}catch(err){}tip.textContent=SYN_TIPS.wt});D.wt.cv.addEventListener('pointermove',e=>{if(!dr)return;P.wt=clamp(dr.v+(e.clientX-dr.x)/220,0,1);K.wt.set(P.wt);change()});D.wt.cv.addEventListener('pointerup',()=>{dr=null});
    const r1=h('div','krow');s.append(r1);mk(r1,'wt','WT POS',0,1,v=>Math.round(v*100)+'%',{def:.66});mk(r1,'oct','OCT',-2,2,v=>(v>0?'+':'')+v,{step:1,def:0,bipolar:true});mk(r1,'fine','FINE',-50,50,v=>Math.round(v)+'c',{def:0,bipolar:true});
    const r2=h('div','krow');s.append(r2);mk(r2,'uni','UNISON',1,7,v=>v+'v',{step:1,def:1});mk(r2,'det','DETUNE',0,1,v=>Math.round(v*100)+'%',{def:.25});mk(r2,'sub','SUB',0,1,v=>Math.round(v*100)+'%',{def:0});mk(r2,'lvl','LEVEL',0,1,v=>Math.round(v*100)+'%',{def:.8})}
  if(show.includes('filter')){const s=sect(B,'FILTER');const seg=h('div','seg2');seg.innerHTML=[['lp',12,'LP 12'],['lp',24,'LP 24'],['hp',12,'HP'],['bp',12,'BP']].map(([t,sl,n])=>`<button data-t="${t}" data-s="${sl}">${n}</button>`).join('');s.append(seg);
    const segOn=()=>$$('button',seg).forEach(b=>b.classList.toggle('on',b.dataset.t===P.flt&&(+b.dataset.s===P.slope||P.flt!=='lp')));segOn();segSync.push(segOn);$$('button',seg).forEach(b=>b.onclick=()=>{P.flt=b.dataset.t;P.slope=+b.dataset.s;segOn();change()});
    D.flt=display(s,96,(g,W,H)=>{gridLines(g,W,H,{freq:true});if(!A.ctx)return;const bq=A.ctx.createBiquadFilter();bq.type=P.flt==='hp'?'highpass':P.flt==='bp'?'bandpass':'lowpass';bq.frequency.value=P.cut;bq.Q.value=P.res;const n=Math.floor(W/2),fr=new Float32Array(n),mg=new Float32Array(n),ph=new Float32Array(n);for(let i=0;i<n;i++)fr[i]=FROMLOG20(i/n);bq.getFrequencyResponse(fr,mg,ph);
      g.beginPath();for(let i=0;i<n;i++){let db=gToDb(mg[i]);if(P.slope===24&&P.flt!=='bp')db*=2;const y=H*.45-db/30*(H*.45);if(i===0)g.moveTo(i*2,y);else g.lineTo(i*2,y)}g.lineTo(W,H);g.lineTo(0,H);g.closePath();g.fillStyle='rgba(169,139,255,.18)';g.fill();g.strokeStyle='#c9b8ff';g.lineWidth=2;g.stroke();
      const nx=LOG20(P.cut)*W,ny=H*.9-(Math.log(P.res/.5)/Math.log(36))*H*.8;g.fillStyle='#07050d';g.strokeStyle='#f1e7d0';g.lineWidth=2;g.beginPath();g.arc(nx,ny,7,0,7);g.fill();g.stroke()});
    let dr=false;const mv=e=>{const r=D.flt.cv.getBoundingClientRect();P.cut=Math.round(clamp(FROMLOG20((e.clientX-r.left)/r.width),40,18000));P.res=clamp(.5*Math.pow(36,(.9-(e.clientY-r.top)/r.height)/.8),.5,18);K.cut.set(P.cut);K.res.set(P.res);change()};
    D.flt.cv.addEventListener('pointerdown',e=>{dr=true;try{D.flt.cv.setPointerCapture(e.pointerId)}catch(err){}tip.textContent='Drag the dot: left-right moves the cutoff, up-down sets the resonance.';mv(e)});D.flt.cv.addEventListener('pointermove',e=>{if(dr)mv(e)});D.flt.cv.addEventListener('pointerup',()=>{dr=false});
    const r=h('div','krow');s.append(r);mk(r,'cut','CUTOFF',40,18000,v=>fmtHz(v),{log:true,def:3200});mk(r,'res','RES',.5,18,v=>v.toFixed(1),{log:true,def:1});mk(r,'fenv','ENV AMT',-1,1,v=>(v>0?'+':'')+Math.round(v*100)+'%',{def:0,bipolar:true})}
  if(show.includes('env')){const s=sect(B,'ENVELOPES');const seg=h('div','seg2');seg.innerHTML='<button data-e="amp" class="on">ENV 1 · AMP</button><button data-e="flt">ENV 2 · FILTER</button>';s.append(seg);
    const keyOf=k=>envTab==='amp'?k:'f'+k;const LOGT=[[1,3000],[10,4000],[0,1],[10,6000]];
    D.env=display(s,92,(g,W,H)=>{gridLines(g,W,H,{cols:4});const a=P[keyOf('a')],d=P[keyOf('d')],su=P[keyOf('s')],r=P[keyOf('r')];const z=v=>Math.log(1+v)/Math.log(1+6000);const xa=6+z(a)*W*.26,xd=xa+z(d)*W*.26,xs=Math.min(W*.72,xd+W*.16),xr=xs+z(r)*(W-xs-6),top=10,bot=H-8,ys=bot-(bot-top)*su;
      g.beginPath();g.moveTo(6,bot);g.lineTo(xa,top);g.bezierCurveTo(xa+(xd-xa)*.3,ys,xa+(xd-xa)*.5,ys,xd,ys);g.lineTo(xs,ys);g.bezierCurveTo(xs+(xr-xs)*.3,bot,xs+(xr-xs)*.5,bot,xr,bot);g.strokeStyle=envTab==='amp'?'#ffb547':'#3ef0c8';g.lineWidth=2.5;g.stroke();g.lineTo(6,bot);g.fillStyle=envTab==='amp'?'rgba(255,181,71,.12)':'rgba(62,240,200,.12)';g.fill();
      [[xa,top],[xd,ys],[xr,bot]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,6,0,7);g.fillStyle='#07050d';g.fill();g.strokeStyle='#f1e7d0';g.lineWidth=2;g.stroke()});
      g.fillStyle='#6a5f9a';g.font='9px VT323, monospace';['A','D','S','R'].forEach((t,i)=>g.fillText(t,[xa/2,(xa+xd)/2,(xd+xs)/2,(xs+xr)/2][i],H-1))});
    let hd=null;D.env.cv.addEventListener('pointerdown',e=>{const r=D.env.cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;hd=x<.22?'a':x<.5?'d':x<.72?'s':'r';try{D.env.cv.setPointerCapture(e.pointerId)}catch(err){}tip.textContent='Drag the handles to shape the envelope.';envDrag(e)});
    const envDrag=e=>{if(!hd)return;const r=D.env.cv.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width,0,1),y=clamp((e.clientY-r.top)/r.height,0,1);const k=keyOf(hd);
      if(hd==='s')P[k]=Math.round(clamp(1-(y-.1)/.8,0,1)*100)/100;else{const span=hd==='a'?[0,.26]:hd==='d'?[.22,.5]:[.72,1];const f=clamp((x-span[0])/(span[1]-span[0]),0,1);P[k]=Math.round(Math.pow(6001,f)-1)||1;if(hd==='d')P[keyOf('s')]=Math.round(clamp(1-(y-.1)/.8,0,1)*100)/100}
      ['a','d','s','r'].forEach(q=>K['env_'+q].set(P[keyOf(q)]));change()};
    D.env.cv.addEventListener('pointermove',envDrag);D.env.cv.addEventListener('pointerup',()=>{hd=null});
    const r=h('div','krow');s.append(r);[['a','ATTACK',1,3000],['d','DECAY',10,4000],['s','SUSTAIN',0,1],['r','RELEASE',10,6000]].forEach(([q,l,mn,mx])=>{K['env_'+q]=knob(r,{label:l,min:mn,max:mx,log:q!=='s',value:P[q],fmt:q==='s'?v=>Math.round(v*100)+'%':fmtMs,col:'#ffb547',onTouch:()=>{tip.textContent=SYN_TIPS[q]},onInput:v=>{P[keyOf(q)]=v;change()}})});
    $$('button',seg).forEach(b=>b.onclick=()=>{envTab=b.dataset.e;$$('button',seg).forEach(x=>x.classList.toggle('on',x===b));['a','d','s','r'].forEach(q=>K['env_'+q].set(P[keyOf(q)]));D.env.redraw()})}
  if(show.includes('lfo')){const s=sect(B,'LFO 1');const seg=h('div','seg2');seg.innerHTML=[['sine','SIN'],['triangle','TRI'],['sawtooth','SAW'],['square','SQR']].map(([t,n])=>`<button data-t="${t}">${n}</button>`).join('');s.append(seg);
    const son=()=>$$('button',seg).forEach(b=>b.classList.toggle('on',b.dataset.t===P.lfoShape));son();segSync.push(son);$$('button',seg).forEach(b=>b.onclick=()=>{P.lfoShape=b.dataset.t;son();change()});
    const t0=performance.now();D.lfo=display(s,70,(g,W,H)=>{gridLines(g,W,H,{cols:4});const shp=P.lfoShape,val=ph=>shp==='sine'?Math.sin(ph):shp==='triangle'?2/Math.PI*Math.asin(Math.sin(ph)):shp==='sawtooth'?((ph/Math.PI)%2)-1:(Math.sin(ph)>=0?1:-1);
      g.beginPath();for(let x=0;x<=W;x+=2){const y=H/2-val(x/W*Math.PI*4)*(H/2-8)*Math.max(.12,P.lfoDepth);if(x===0)g.moveTo(x,y);else g.lineTo(x,y)}g.strokeStyle='#3ef0c8';g.lineWidth=2;g.stroke();
      const ph=((performance.now()-t0)/1000*P.lfoRate)%2;const px2=ph/2*W;g.fillStyle='rgba(241,231,208,.8)';g.fillRect(px2,0,2,H)});addLive(D.lfo.cv,()=>D.lfo.redraw());
    const r=h('div','krow');s.append(r);mk(r,'lfoRate','RATE',.1,20,v=>v.toFixed(v<1?2:1)+' Hz',{log:true,def:4});mk(r,'lfoDepth','DEPTH',0,1,v=>Math.round(v*100)+'%',{def:0});
    const dseg=h('div','seg2');dseg.innerHTML=[['cut','→ CUTOFF'],['pitch','→ PITCH'],['vol','→ VOLUME']].map(([t,n])=>`<button data-d="${t}">${n}</button>`).join('');s.append(dseg);const don=()=>$$('button',dseg).forEach(b=>b.classList.toggle('on',b.dataset.d===P.lfoDest));don();segSync.push(don);$$('button',dseg).forEach(b=>b.onclick=()=>{P.lfoDest=b.dataset.d;don();change()})}
  const ms=sect(B,'OUTPUT');D.scope=display(ms,52,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);if(!out)return;const d=new Float32Array(1024);out.an.getFloatTimeDomainData(d);let st=0;for(let i=1;i<512;i++)if(d[i-1]<0&&d[i]>=0){st=i;break}g.beginPath();for(let x=0;x<W;x++){const v=d[st+Math.floor(x/W*480)]||0;const y=H/2-v*H*1.4;if(x===0)g.moveTo(x,y);else g.lineTo(x,y)}g.strokeStyle='#a98bff';g.lineWidth=1.5;g.stroke()});addLive(D.scope.cv,()=>D.scope.redraw());
  const pr=h('div','row wrap');pr.style.gap='6px';ms.append(pr);const riffB=h('button','btn ghost sm','▶ PLAY RIFF');pr.append(riffB);let tgtB=null;if(o.target){tgtB=h('button','btn violet sm','▶ TARGET SOUND');pr.append(tgtB)}
  const riff=o.riff||[[57,0,1],[60,1,1],[64,2,1],[67,3,1.5]];
  function playRiff(p,dest){initAudio();if(!A.ctx)return;stopMusic();const spb=60/110,t0=now()+.05;riff.forEach(([m,b,l])=>{voiceOn(p,midiF(m),t0+b*spb,.34,dest).off(t0+(b+l)*spb*.95)})}
  riffB.onclick=()=>playRiff(P,out&&out.g);if(tgtB)tgtB.onclick=()=>playRiff(o.target,out&&out.g);
  const kh=h('div');B.append(kh);const kb=keyboard(kh,{lo:o.lo||48,hi:o.hi||71,patch:()=>P,dest:()=>out&&out.g});
  if(o.presets!==false){const names=Object.keys(PRESETS);let pi=0;const setP=i=>{pi=(i+names.length)%names.length;Object.assign(P,PRESETS[names[pi]]);$('.pname',pg.el).textContent=names[pi];Object.keys(K).forEach(k=>{const key=k.startsWith('env_')?(envTab==='amp'?k.slice(4):'f'+k.slice(4)):k;if(P[key]!=null)K[k].set(P[key])});change();playRiff(P,out&&out.g)};
    $('[data-a=pprev]',pg.el).onclick=()=>setP(pi-1);$('[data-a=pnext]',pg.el).onclick=()=>setP(pi+1)}
  return{P,K,kb,playRiff:p=>playRiff(p||P,out&&out.g),set(p){Object.assign(P,p);Object.keys(K).forEach(k=>{const key=k.startsWith('env_')?(envTab==='amp'?k.slice(4):'f'+k.slice(4)):k;if(P[key]!=null)K[k].set(P[key])});change()},stop(){kb.allOff();if(out)out.kill()}}}
/* how close is a patch to a target? (log-scaled tolerance, used by sound-design trials) */
function patchCheck(P,T,keys){const res={};keys.forEach(k=>{const a=P[k],b=T[k];let ok;if(k==='wt')ok=wtName(a)===wtName(b);else if(['s','lfoDepth','fenv','det','sub'].includes(k))ok=Math.abs(a-b)<=.2;else if(['oct','uni'].includes(k))ok=a===b;else ok=Math.abs(Math.log((a+1)/(b+1)))<=Math.log(2.2);res[k]=ok});return res}

/* =====================================================================
   SPECTRUM EQ — 6-band parametric EQ with analyser (Pro-Q / EQ Eight inspired)
   ===================================================================== */
const EQ_BANDS=()=>[{id:1,type:'highpass',n:'LOW CUT',f:30,g:0,q:.71,on:false,col:'#ff4f9a'},{id:2,type:'lowshelf',n:'LOW SHELF',f:120,g:0,q:.71,on:true,col:'#ffb547'},{id:3,type:'peaking',n:'BELL',f:350,g:0,q:1.4,on:true,col:'#3ef0c8'},{id:4,type:'peaking',n:'BELL',f:2500,g:0,q:1.4,on:true,col:'#6cb8ff'},{id:5,type:'highshelf',n:'HIGH SHELF',f:8000,g:0,q:.71,on:true,col:'#a98bff'},{id:6,type:'lowpass',n:'HIGH CUT',f:18000,g:0,q:.71,on:false,col:'#ff7a3a'}];
function kickBassStep(s,t,r){const i=s%16,bar=Math.floor(s/16)%4,base=A.route;withRoute(r&&r.kick||base,()=>{if(i===0||i===8)V.kick(t,.9)});withRoute(r&&r.bass||base,()=>{if(i===0||i===6||i===8||i===11)SV(t,midiF(SONG_BASS[bar]-12),.3,BASSP,.6)});withRoute(r&&r.kick||base,()=>{if(i===4||i===12)V.snare(t,.5);if(i%2===0)V.hat(t,.25)})}
function eqRig(host,o){o=o||{};initAudio();const bands=EQ_BANDS();(o.bands||[]).forEach(b=>Object.assign(bands.find(x=>x.id===b.id),b));let sel=o.select||3,xray=0;
  const pg=plug(host,{name:'FREQUENCY BLADE',type:'6-BAND EQ',col:'#3ef0c8'});const B=pg.body,tip=tipLine(B);if(!A.ctx){B.textContent='Audio is not available here.';return{net:()=>0,stop(){},bands}}
  const c=A.ctx,out=rigOut(),srcIn=c.createGain(),preAn=c.createAnalyser();preAn.fftSize=4096;preAn.smoothingTimeConstant=.8;
  const probs=(o.problems||[]).map(p=>{const x=c.createBiquadFilter();x.type=p.type;x.frequency.value=p.f;x.Q.value=p.q||1;x.gain.value=p.g;return x});
  const nodes=bands.map(()=>c.createBiquadFilter());let chainIn=srcIn;probs.forEach(x=>{chainIn.connect(x);chainIn=x});chainIn.connect(preAn);
  let last=chainIn;nodes.forEach(x=>{last.connect(x);last=x});const eqOut=c.createGain(),bypassG=c.createGain();last.connect(eqOut);eqOut.connect(out.g);chainIn.connect(bypassG);bypassG.connect(out.g);bypassG.gain.value=0;
  const kickDirect=c.createGain();kickDirect.connect(out.g);
  const apply=()=>{bands.forEach((b,i)=>{const x=nodes[i];if(!b.on){x.type='allpass';x.frequency.value=1000;x.Q.value=.0001;return}x.type=b.type;x.frequency.value=b.f;x.Q.value=b.type==='peaking'?b.q:b.type.includes('pass')?b.q:.71;x.gain.value=b.g});
    eqOut.gain.value=pg.byp?0:1;bypassG.gain.value=pg.byp?1:0;disp.redraw();if(o.onChange)o.onChange(bands)};
  pg.onBypass=()=>apply();
  const respOf=(list,W)=>{const n=Math.floor(W/2),fr=new Float32Array(n),acc=new Float32Array(n).fill(0),mg=new Float32Array(n),ph=new Float32Array(n);for(let i=0;i<n;i++)fr[i]=FROMLOG20(i/n);list.forEach(x=>{x.getFrequencyResponse(fr,mg,ph);for(let i=0;i<n;i++)acc[i]+=gToDb(mg[i])});return acc};
  const R=18,Y=(db,H)=>H/2-db/R*(H/2-10);
  const disp=display(B,190,(g,W,H)=>{gridLines(g,W,H,{freq:true,db:R});drawSpectrum(g,W,H,preAn,null,'rgba(160,146,194,.35)',-110);drawSpectrum(g,W,H,out.an,'rgba(62,240,200,.13)',null,-110);
    if(xray||hasAb('freqvision')&&probs.length){const pr=respOf(probs,W);g.setLineDash([4,4]);g.beginPath();pr.forEach((db,i)=>{const y=Y(db,H);if(i===0)g.moveTo(i*2,y);else g.lineTo(i*2,y)});g.strokeStyle='#ff4f9a';g.lineWidth=1.5;g.stroke();g.setLineDash([]);
      (o.problems||[]).forEach(p=>{if(Math.abs(p.g)<2)return;const x=LOG20(p.f)*W,y=Y(p.g,H)-12;g.fillStyle='#ff4f9a';g.fillRect(x-3,y-3,6,6);g.fillStyle='#07050d';g.fillRect(x-1,y-1,2,2)})}
    const act=bands.map((b,i)=>[b,nodes[i]]).filter(([b])=>b.on);act.forEach(([b,x])=>{const r=respOf([x],W);g.beginPath();r.forEach((db,i)=>{const y=Y(db,H);if(i===0)g.moveTo(i*2,y);else g.lineTo(i*2,y)});g.strokeStyle=b.col+'55';g.lineWidth=1;g.stroke()});
    const tot=respOf(act.map(a=>a[1]),W);g.beginPath();tot.forEach((db,i)=>{const y=Y(db,H);if(i===0)g.moveTo(i*2,y);else g.lineTo(i*2,y)});g.strokeStyle='#f1e7d0';g.lineWidth=2.5;g.shadowColor='#3ef0c8';g.shadowBlur=pg.byp?0:6;g.stroke();g.shadowBlur=0;
    bands.forEach(b=>{const x=LOG20(b.f)*W,y=b.type.includes('pass')?H/2:Y(b.g,H);g.beginPath();g.arc(x,y,b.id===sel?10:8,0,7);g.fillStyle=b.on?b.col:'#2a2248';g.fill();g.strokeStyle=b.id===sel?'#f1e7d0':'#07050d';g.lineWidth=2;g.stroke();g.fillStyle='#07050d';g.font='bold 11px VT323, monospace';g.fillText(String(b.id),x-3,y+4)})});
  addLive(disp.cv,()=>disp.redraw());
  let drag=null;const pick=e=>{const r=disp.cv.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=30;bands.forEach(b=>{const bx=LOG20(b.f)*r.width,by=b.type.includes('pass')?r.height/2:Y(b.g,r.height);const d=Math.hypot(bx-x,by-y);if(d<bd){bd=d;best=b}});return best};
  const move=e=>{const b=bands.find(x=>x.id===drag);if(!b)return;const r=disp.cv.getBoundingClientRect();b.f=Math.round(clamp(FROMLOG20((e.clientX-r.left)/r.width),20,20000));if(!b.type.includes('pass'))b.g=Math.round(clamp((r.height/2-(e.clientY-r.top))/(r.height/2-10)*R,-R,R)*2)/2;b.on=true;syncPanel();apply()};
  disp.cv.addEventListener('pointerdown',e=>{const b=pick(e);if(!b)return;sel=b.id;drag=b.id;try{disp.cv.setPointerCapture(e.pointerId)}catch(err){}tip.textContent=b.type.includes('pass')?`${b.n}: drag left-right to set where the filter starts.`:`${b.n}: drag left-right for frequency, up-down to boost or cut.`;syncPanel();disp.redraw()});
  disp.cv.addEventListener('pointermove',e=>{if(drag)move(e)});disp.cv.addEventListener('pointerup',()=>{drag=null});
  B.append(h('div','dispcap','<span>DRAG A BAND · GREY LINE = INPUT · TEAL = OUTPUT</span>'));
  const tabs=h('div','seg2');B.append(tabs);const panel=sect(B,'BAND','<button class="plug-btn" data-a="onoff">ON</button>');const kr=h('div','krow');panel.append(kr);
  const kF=knob(kr,{label:'FREQ',min:20,max:20000,log:true,value:350,fmt:fmtHz,col:'#3ef0c8',onTouch:()=>{tip.textContent='Frequency: where this band works.'},onInput:v=>{const b=bands.find(x=>x.id===sel);b.f=Math.round(v);apply()}});
  const kG=knob(kr,{label:'GAIN',min:-R,max:R,value:0,bipolar:true,def:0,fmt:v=>(v>0?'+':'')+v.toFixed(1)+' dB',col:'#3ef0c8',onTouch:()=>{tip.textContent='Gain: boost (up) or cut (down) this range.'},onInput:v=>{const b=bands.find(x=>x.id===sel);b.g=Math.round(v*2)/2;apply()}});
  const kQ=knob(kr,{label:'Q',min:.3,max:10,log:true,value:1.4,fmt:v=>v.toFixed(2),col:'#3ef0c8',onTouch:()=>{tip.textContent='Q: the width. High Q = narrow and surgical, low Q = broad and musical.'},onInput:v=>{const b=bands.find(x=>x.id===sel);b.q=v;apply()}});
  function syncPanel(){const b=bands.find(x=>x.id===sel);tabs.innerHTML=bands.map(x=>`<button data-b="${x.id}" class="${x.id===sel?'on':''}" style="${x.on?'':'opacity:.55'}">${x.id} ${x.type==='highpass'?'LC':x.type==='lowpass'?'HC':x.type==='lowshelf'?'LS':x.type==='highshelf'?'HS':'BELL'}</button>`).join('');$$('button',tabs).forEach(t=>t.onclick=()=>{sel=+t.dataset.b;syncPanel();disp.redraw()});
    $('.sect-h b',panel).textContent=`BAND ${b.id} · ${b.n}`;const oo=$('[data-a=onoff]',panel);oo.textContent=b.on?'ON':'OFF';oo.classList.toggle('on',b.on);kF.set(b.f);kG.set(b.g);kQ.set(b.q);kG.enable(!b.type.includes('pass'));kQ.enable(b.type==='peaking'||b.type.includes('pass'))}
  $('[data-a=onoff]',panel).onclick=()=>{const b=bands.find(x=>x.id===sel);b.on=!b.on;syncPanel();apply()};
  const src=o.src||'mix';const routes=src==='kickbass'?{kick:kickDirect,bass:srcIn}:null;
  seq.start({bpm:100,route:srcIn,play:(s,t)=>{if(src==='kickbass')kickBassStep(s,t,routes);else songStep(s,t,null,{bpm:100})}});
  syncPanel();apply();
  const q=f=>{const fr=new Float32Array([f]),mg=new Float32Array(1),ph=new Float32Array(1);return x=>{x.getFrequencyResponse(fr,mg,ph);return gToDb(mg[0])}};
  return{bands,net(f){const g=q(f);return probs.reduce((a,x)=>a+g(x),0)+bands.reduce((a,b,i)=>a+(b.on?g(nodes[i]):0),0)},eqAt(f){const g=q(f);return bands.reduce((a,b,i)=>a+(b.on?g(nodes[i]):0),0)},
    setBand(id,v){Object.assign(bands.find(x=>x.id===id),v);syncPanel();apply()},showProblems(ms){xray=1;disp.redraw();setTimeout(()=>{xray=0;disp.redraw()},ms||3500)},stop(){seq.stop();out.kill()}}}

/* =====================================================================
   DYNAMICS HAMMER — compressor (Ableton Compressor / Glue inspired)
   ===================================================================== */
const RIG_CTRL={thr:{n:'THRESH',min:-40,max:0,fmt:v=>Math.round(v)+' dB',tip:'Threshold: where compression starts. Anything louder than this line gets turned down.'},
  ratio:{n:'RATIO',min:1,max:20,fmt:v=>v.toFixed(1)+':1',tip:'Ratio: how hard it pushes down. At 4:1, 8 dB over the threshold comes out 2 dB over.',log:true},
  att:{n:'ATTACK',min:.5,max:100,fmt:fmtMs,tip:'Attack: how fast it grabs. A slower attack lets the first snap of each hit through.',log:true},
  rel:{n:'RELEASE',min:20,max:1000,fmt:fmtMs,tip:'Release: how fast it lets go. Too long and the groove pumps and ducks.',log:true},
  mk:{n:'MAKEUP',min:0,max:12,fmt:v=>'+'+v.toFixed(1)+' dB',tip:'Makeup gain: turns the whole signal back up after compression. It does not change the compression itself.'}};
let PEAK_CAL=null;const peakCal=()=>PEAK_CAL||(PEAK_CAL=withTimeout(calibratePeak(),4000).catch(()=>PEAK_FALLBACK));
function compRig(host,o){o=o||{};initAudio();const pg=plug(host,{name:'DYNAMICS HAMMER',type:'COMPRESSOR',col:'#ff7a3a'});const B=pg.body;
  if(!A.ctx){B.textContent='Audio is not available here.';return{stop(){},model:()=>({}),set(){},demo(){},solve(){},controls(){},peakGR:()=>0,st:{}}}
  const c=A.ctx,st=Object.assign({thr:0,ratio:1,att:10,rel:120,mk:0},o.init||{});let ctrls=o.controls||['thr','ratio','att','rel'];let cal=null,alive=true,raf=0;
  const out=rigOut(),inp=c.createGain(),comp=c.createDynamicsCompressor(),mk=c.createGain(),inAn=c.createAnalyser();comp.knee.value=2;inAn.fftSize=1024;inp.connect(inAn);inp.connect(comp);comp.connect(mk);mk.connect(out.g);
  const wait=h('p','muted wait','Measuring the beast…');wait.style.fontSize='14px';B.append(wait);
  const tw=h('div','twocol');B.append(tw);const c1=h('div'),c2=h('div');tw.append(c1,c2);
  const tf=display(c1,150,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);const X=db=>(db+48)/48*W,Yy=db=>H-(db+48)/48*H;g.strokeStyle='#171230';for(let d=-48;d<=0;d+=12){g.beginPath();g.moveTo(X(d),0);g.lineTo(X(d),H);g.stroke();g.beginPath();g.moveTo(0,Yy(d));g.lineTo(W,Yy(d));g.stroke()}
    g.setLineDash([3,3]);g.strokeStyle='#2e2552';g.beginPath();g.moveTo(0,H);g.lineTo(W,0);g.stroke();g.setLineDash([]);
    g.beginPath();for(let x=0;x<=W;x+=2){const i=x/W*48-48;const o2=pg.byp?i:i<=st.thr?i:st.thr+(i-st.thr)/st.ratio;if(x===0)g.moveTo(x,Yy(o2));else g.lineTo(x,Yy(o2))}g.strokeStyle='#ff7a3a';g.lineWidth=2.5;g.stroke();
    g.fillStyle='#a98bff';g.fillRect(X(st.thr)-1,0,2,H);g.fillStyle='#a98bff';g.font='10px VT323, monospace';g.fillText('THRESH',Math.min(W-34,X(st.thr)+3),10);
    if(cal){const m=model();[[cal.body,'#3ef0c8','BODY'],[cal.spike,'#ff4f9a','SLAM']].forEach(([i,col,lab])=>{const x=X(i),y=Yy(pg.byp?i:m.out(i));g.strokeStyle=col;g.setLineDash([2,2]);g.beginPath();g.moveTo(x,Yy(i));g.lineTo(x,y);g.stroke();g.setLineDash([]);g.beginPath();g.arc(x,y,5,0,7);g.fillStyle=col;g.fill();g.fillStyle=col;g.fillText(lab,x-10,y-8)})}});
  c1.append(h('div','dispcap','<span>INPUT →</span><span>OUTPUT ↑ dB</span>'));
  const hist=[];const act=display(c2,150,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);gridLines(g,W,H,{db:24});const n=hist.length,bw=W/90;
    hist.forEach((f,i)=>{const x=W-(n-i)*bw;const yi=H-clamp((f.i+48)/48,0,1)*H,yo=H-clamp((f.o+48)/48,0,1)*H;g.fillStyle='#2a2248';g.fillRect(x,yi,bw,H-yi);g.fillStyle='#ff7a3a';g.fillRect(x,yo,bw,H-yo)});
    g.beginPath();hist.forEach((f,i)=>{const x=W-(n-i)*bw,y=f.gr/24*H;if(i===0)g.moveTo(x,y);else g.lineTo(x,y)});g.strokeStyle='#ff4f9a';g.lineWidth=2;g.stroke();
    const ms=model();const maxGR=ms.catches?Math.max(0,(cal.spike-st.thr)*(1-1/st.ratio)):0;if(maxGR>0){const left=maxGR*Math.exp(-(300-80)/(st.rel/3));if(left>1){g.fillStyle='rgba(255,79,154,.18)';g.fillRect(0,0,W,6)}}});
  c2.append(h('div','dispcap','<span>ACTIVITY</span><span style="color:#ff4f9a">GAIN REDUCTION</span>'));
  const grm=h('div','grm','<span>GR</span><div class="bar"><i style="width:0%;--c:var(--magenta)"></i></div><span class="num">0.0 dB</span>');B.append(grm);
  const tip=tipLine(B);const kr=h('div','krow');B.append(kr);const KN={};
  Object.keys(RIG_CTRL).forEach(k=>{const R2=RIG_CTRL[k];KN[k]=knob(kr,{label:R2.n,min:R2.min,max:R2.max,log:R2.log,value:st[k],fmt:R2.fmt,col:'#ff7a3a',onTouch:()=>{tip.textContent=R2.tip},onInput:v=>{stopDemo();st[k]=k==='thr'?Math.round(v):v;apply()}});if(k!=='mk')KN[k].enable(ctrls.includes(k))});
  pg.onBypass=()=>apply();
  function apply(){comp.threshold.value=pg.byp?0:st.thr;comp.ratio.value=pg.byp?1:st.ratio;comp.attack.value=st.att/1000;comp.release.value=st.rel/1000;mk.gain.value=dbToG(st.mk);tf.redraw();act.redraw();if(o.onChange)o.onChange(st)}
  function model(){if(!cal)return{catches:false,bodyClean:true,spikeOver:99,out:x=>x};const catches=cal.spike>st.thr+1;const over=catches?(cal.spike-st.thr)/st.ratio:0;return{catches,bodyClean:cal.body<st.thr-1,spikeOver:over,out:x=>x<=st.thr?x:st.thr+(x-st.thr)/st.ratio}}
  let DI=null,DT=null;const stopDemo=()=>{if(DI)clearInterval(DI);if(DT)clearTimeout(DT);DI=DT=null};const setRaw=v=>{Object.assign(st,v);Object.keys(KN).forEach(k=>KN[k].set(st[k]));apply()};
  let lastSlam=-9;const modelGR=()=>{if(!cal||pg.byp||st.ratio<=1.01||cal.spike<=st.thr)return 0;return(cal.spike-st.thr)*(1-1/st.ratio)};
  const tbuf=new Float32Array(1024);
  function tick(){if(!alive||!B.isConnected){alive=false;return}const node=Math.abs(typeof comp.reduction==='number'?comp.reduction:(comp.reduction&&comp.reduction.value)||0);const mg=modelGR();const since=(now()-lastSlam)*1000;const env=since<0?0:since<st.att?since/st.att:Math.exp(-Math.max(0,since-80)/(st.rel/3));const gr=mg<=0?0:(node>.05?node:mg*env);
    $('.bar i',grm).style.width=Math.min(100,gr/24*100)+'%';$('.num',grm).textContent='−'+gr.toFixed(1)+' dB';const ind=anPeakDb(inAn,tbuf),od=anPeakDb(out.an,tbuf);hist.push({i:ind,o:od,gr});if(hist.length>90)hist.shift();if(o.onTick)o.onTick(st,gr);raf=requestAnimationFrame(tick)}
  addLive(act.cv,()=>act.redraw());
  peakCal().then(r=>{if(!alive)return;const adj=-4-r.spike;inp.gain.value=Math.pow(10,adj/20);cal={spike:-4,body:Math.round(r.body+adj)};wait.textContent=`Body of the groove: about ${cal.body} dB. Slams: about ${cal.spike} dB.`;apply();if(api._q){const q=api._q;api._q=null;api[q]()}});
  seq.start({bpm:100,route:inp,play:(s,t)=>{(o.groove||peakGroove)(s,t);const i=s%16;if(i===4||i===12)setTimeout(()=>{lastSlam=now()},Math.max(0,(t-now())*1000))}});apply();raf=requestAnimationFrame(tick);
  const api={st,model,ready:()=>!!cal,peakGR:()=>modelGR(),set(v){stopDemo();setRaw(v)},controls(list){ctrls=list;Object.keys(KN).forEach(k=>{if(k!=='mk')KN[k].enable(list.includes(k))})},
    stop(){alive=false;stopDemo();cancelAnimationFrame(raf);seq.stop();out.kill()},
    demo(){if(!cal){api._q='demo';return}stopDemo();const keep=Object.assign({},st);const mid=Math.round((cal.body+cal.spike)/2);let k=0;DI=setInterval(()=>{k++;setRaw({thr:Math.round(keep.thr+(mid-keep.thr)*k/10),ratio:1+(6-1)*k/10});if(k>=10){clearInterval(DI);DI=null;DT=setTimeout(()=>{DT=null;setRaw(keep)},1800)}},120)},
    solve(){if(!cal){api._q='solve';return}const mid=Math.round((cal.body+cal.spike)/2);api.set({thr:mid,ratio:Math.max(2,Math.ceil((cal.spike-mid)/3.5))})}};
  return api}

/* =====================================================================
   SPACE CRYSTAL (reverb) + TIME SPELL (delay)
   ===================================================================== */
const NOTE_VALS={'1/16':.25,'1/8':.5,'1/8D':.75,'1/4':1,'1/4D':1.5,'1/2':2};
function makeIR(c,decay,damp,width){const sr=c.sampleRate,len=Math.floor((decay*1.1+.05)*sr),b=c.createBuffer(2,len,sr);const L=b.getChannelData(0),Rr=b.getChannelData(1);let lpL=0,lpR=0;const k=clamp(damp/20000,.02,1);
  for(let i=0;i<len;i++){const t=i/sr,env=Math.pow(10,-3*t/decay),nL=Math.random()*2-1,nR=width*(Math.random()*2-1)+(1-width)*nL;lpL+=(nL-lpL)*k;lpR+=(nR-lpR)*k;const er=t<.06&&Math.random()<.004?(Math.random()*2-1)*3:0;L[i]=(lpL+er)*env;Rr[i]=(lpR+er*.8)*env}return b}
function srcStep(kind,s,t){const i=s%16,bar=Math.floor(s/16)%4;if(kind==='snare'){if(i===4||i===12)V.snare(t,.8);if(i===0||i===8)V.kick(t,.5)}else if(kind==='lead'){const n=LEADLINE[bar][i];if(n)SV(t,midiF(n),.2,PLUCK,.34)}else if(kind==='pad'){if(i===0)SONG_CHORDS[bar].forEach(m=>SV(t,midiF(m+12),2.3,PADP,.16))}else songStep(s,t,null,{bpm:100})}
function spaceRig(host,o){o=o||{};initAudio();const st=Object.assign({decay:1.4,pre:10,damp:9000,width:.8,wet:.25,sync:'1/8',free:320,fb:.35,dfilt:6000,pp:false,dmix:0},o.init||{});const bpm=o.bpm||100;const show=o.show||['rev'];
  const wrap=h('div','stack');wrap.style.gap='8px';host.append(wrap);if(!A.ctx){wrap.textContent='Audio is not available here.';return{st,stop(){},set(){}}}
  const c=A.ctx,out=rigOut(),K={};const multi=o.sends;st.sends=Object.assign({lead:.1,pad:.5,snare:.25},st.sends||{});
  const srcIns={},revIn=c.createGain(),pre=c.createDelay(1),conv=c.createConvolver(),dampF=c.createBiquadFilter(),wetG=c.createGain(),dry=c.createGain();dampF.type='lowpass';
  revIn.connect(pre);pre.connect(conv);conv.connect(dampF);dampF.connect(wetG);wetG.connect(out.g);dry.connect(out.g);
  const dIn=c.createGain(),dA=c.createDelay(2),dB=c.createDelay(2),fbA=c.createGain(),fbB=c.createGain(),dLP=c.createBiquadFilter(),panA=c.createStereoPanner?c.createStereoPanner():c.createGain(),panB=c.createStereoPanner?c.createStereoPanner():c.createGain(),dOut=c.createGain();dLP.type='lowpass';
  dIn.connect(dA);dA.connect(dLP);dLP.connect(panA);panA.connect(dOut);dLP.connect(fbA);fbA.connect(dB);dB.connect(panB);panB.connect(dOut);dB.connect(fbB);fbB.connect(dA);dOut.connect(out.g);
  const sources=multi?['lead','pad','snare']:[o.src||'snare'];const sendG={};
  sources.forEach(k=>{const n=c.createGain();n.connect(dry);const sg=c.createGain();n.connect(sg);sg.connect(revIn);sendG[k]=sg;srcIns[k]=n;if(k==='lead'||!multi)n.connect(dIn)});
  let irT=0;const buildIR=()=>{clearTimeout(irT);irT=setTimeout(()=>{conv.buffer=makeIR(c,st.decay,st.damp,st.width)},120)};
  const dTime=()=>st.sync==='FREE'?st.free/1000:NOTE_VALS[st.sync]*60/bpm;
  function apply(){const onR=show.includes('rev')&&!(rp&&rp.byp),onD=show.includes('dly')&&!(dp&&dp.byp);pre.delayTime.value=st.pre/1000;dampF.frequency.value=st.damp;
    if(multi){sources.forEach(k=>{sendG[k].gain.value=onR?st.sends[k]:0});wetG.gain.value=onR?1:0;dry.gain.value=1}else{sendG[sources[0]].gain.value=1;wetG.gain.value=onR?st.wet*1.6:0;dry.gain.value=onR?1-st.wet*.6:1}
    const dt=dTime();dA.delayTime.value=dt;dB.delayTime.value=dt;dLP.frequency.value=st.dfilt;fbA.gain.value=onD?(st.pp?st.fb:0):0;fbB.gain.value=onD?st.fb:0;
    if(panA.pan){panA.pan.value=st.pp?-.8:0;panB.pan.value=st.pp?.8:0}dOut.gain.value=onD?st.dmix*1.4:0;
    selfFb.gain.value=onD&&!st.pp?st.fb:0;
    Object.values(D).forEach(d=>d.redraw());if(o.onChange)o.onChange(st)}
  const selfFb=c.createGain();dLP.connect(selfFb);selfFb.connect(dA);
  let tipEl=null;const D={};let rp=null,dp=null;const ui=[];
  if(show.includes('rev')){rp=plug(wrap,{name:'SPACE CRYSTAL',type:'REVERB',col:'#6cb8ff'});rp.onBypass=()=>apply();tipEl=tipLine(rp.body);
    D.rev=display(rp.body,110,(g,W,H)=>{g.fillStyle='#07050d';g.fillRect(0,0,W,H);const tmax=Math.max(2,st.pre/1000+st.decay*1.1);const X=t=>t/tmax*W;gridLines(g,W,H,{cols:Math.ceil(tmax)});
      g.fillStyle='#f1e7d0';g.fillRect(X(0),8,3,H-8);const t0=st.pre/1000;g.fillStyle='rgba(169,139,255,.25)';g.fillRect(X(0)+3,H-4,Math.max(0,X(t0)-3),4);
      const r=rng(3);for(let k=0;k<9;k++){const t=t0+r()*.06;const a=(.5+r()*.4)*(1-k/12);g.fillStyle='#a98bff';g.fillRect(X(t),H-a*(H-12),2,a*(H-12))}
      g.beginPath();g.moveTo(X(t0),H);for(let x=X(t0);x<=W;x+=2){const t=(x/W*tmax)-t0;const a=Math.pow(10,-3*t/st.decay)*.7*(multi?1:.4+st.wet);g.lineTo(x,H-a*(H-14))}g.lineTo(W,H);g.closePath();const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(108,184,255,.6)');gr.addColorStop(1,'rgba(108,184,255,.05)');g.fillStyle=gr;g.fill();
      g.fillStyle='#6cb8ff';g.font='10px VT323, monospace';g.fillText(`DECAY ${st.decay.toFixed(1)} s · PRE ${Math.round(st.pre)} ms`,6,12)});
    rp.body.append(h('div','dispcap','<span>DRY HIT · EARLY REFLECTIONS · TAIL</span><span>TIME →</span>'));
    const kr=h('div','krow');rp.body.append(kr);const mk=(k,l,mn,mx,fmt,x)=>{K[k]=knob(kr,Object.assign({label:l,min:mn,max:mx,value:st[k],fmt,col:'#6cb8ff',onInput:v=>{st[k]=v;if(k==='decay'||k==='damp'||k==='width')buildIR();apply()}},x||{}))};
    mk('decay','DECAY',.2,8,v=>v.toFixed(v<1?2:1)+' s',{log:true,onTouch:()=>{tipEl.textContent='Decay: how long the tail lasts (RT60, the time to fade by 60 dB). Rooms under 1 s, halls 2 s and up.'}});
    mk('pre','PRE-DELAY',0,150,v=>Math.round(v)+' ms',{onTouch:()=>{tipEl.textContent='Pre-delay: a gap before the reverb starts. 20–60 ms keeps a voice clear and upfront.'}});
    mk('damp','DAMP',1000,18000,fmtHz,{log:true,onTouch:()=>{tipEl.textContent='Damping: cuts the highs in the tail. Real rooms absorb high frequencies first.'}});
    mk('width','WIDTH',0,1,v=>Math.round(v*100)+'%',{onTouch:()=>{tipEl.textContent='Width: how different the left and right tails are. 0% = mono.'}});
    if(!multi)mk('wet','DRY/WET',0,1,v=>Math.round(v*100)+'%',{onTouch:()=>{tipEl.textContent='Dry/wet: how much reverb you hear against the original. More wet = further away.'}});
    if(multi){const sr=sect(rp.body,'SENDS · HOW MUCH OF EACH SOUND GOES INTO THE REVERB');const kr2=h('div','krow');sr.append(kr2);sources.forEach(k=>{K['send_'+k]=knob(kr2,{label:k.toUpperCase(),min:0,max:1,value:st.sends[k],fmt:v=>Math.round(v*100)+'%',col:'#6cb8ff',onInput:v=>{st.sends[k]=v;apply()}})})}}
  if(show.includes('dly')){dp=plug(wrap,{name:'TIME SPELL',type:'DELAY',col:'#3ef0c8',extra:'<button class="plug-btn" data-a="pp">PING-PONG</button>'});dp.onBypass=()=>apply();const tp=tipLine(dp.body);if(!tipEl)tipEl=tp;
    D.dly=display(dp.body,96,(g,W,H)=>{const beats=8;gridLines(g,W,H,{cols:beats*2,major:2});const dt=dTime(),spb=60/bpm,X=t=>t/(beats*spb)*W;g.fillStyle='#f1e7d0';g.fillRect(X(0),8,4,H-16);
      for(let k=1;k<30;k++){const t=k*dt;if(t>beats*spb)break;const a=Math.pow(st.fb,k-1)*Math.max(.15,st.dmix*1.6);if(a<.02)break;const left=st.pp&&k%2===1;g.fillStyle=st.pp?(left?'#3ef0c8':'#ffb547'):'#3ef0c8';const hh=clamp(a,0,1)*(H-16);g.fillRect(X(t),st.pp?(left?8:H-8-hh):H-8-hh,4,hh)}
      g.fillStyle='#3ef0c8';g.font='10px VT323, monospace';g.fillText(`${st.sync==='FREE'?Math.round(st.free)+' ms (free)':st.sync+' = '+Math.round(dt*1000)+' ms at '+bpm+' BPM'}`,6,12)});
    dp.body.append(h('div','dispcap','<span>ECHOES OVER 2 BARS</span><span>'+(bpm)+' BPM GRID</span>'));
    const seg=h('div','seg2');seg.innerHTML=Object.keys(NOTE_VALS).concat(['FREE']).map(k=>`<button data-v="${k}">${k}</button>`).join('');dp.body.append(seg);const son=()=>$$('button',seg).forEach(b=>b.classList.toggle('on',b.dataset.v===st.sync));son();ui.push(son);
    $$('button',seg).forEach(b=>b.onclick=()=>{st.sync=b.dataset.v;son();K.free&&K.free.enable(st.sync==='FREE');apply()});
    const ppb=$('[data-a=pp]',dp.el);const ppOn=()=>ppb.classList.toggle('on',st.pp);ppOn();ui.push(ppOn);ppb.onclick=()=>{st.pp=!st.pp;ppOn();apply()};
    const kr=h('div','krow');dp.body.append(kr);const mk=(k,l,mn,mx,fmt,x)=>{K[k]=knob(kr,Object.assign({label:l,min:mn,max:mx,value:st[k],fmt,col:'#3ef0c8',onInput:v=>{st[k]=v;apply()}},x||{}))};
    mk('free','TIME',40,1500,fmtMs,{log:true,onTouch:()=>{tp.textContent='Free time in milliseconds. Synced note values keep echoes in the groove.'}});K.free.enable(st.sync==='FREE');ui.push(()=>K.free.enable(st.sync==='FREE'));
    mk('fb','FEEDBACK',0,.95,v=>Math.round(v*100)+'%',{onTouch:()=>{tp.textContent='Feedback: sends the echo back in for more repeats. Near 100% it runs away.'}});
    mk('dfilt','FILTER',500,16000,fmtHz,{log:true,onTouch:()=>{tp.textContent='Filter: darkens each repeat so echoes sit behind the dry sound.'}});
    mk('dmix','MIX',0,1,v=>Math.round(v*100)+'%',{onTouch:()=>{tp.textContent='Mix: how loud the echoes are.'}})}
  buildIR();conv.buffer=makeIR(c,st.decay,st.damp,st.width);
  seq.start({bpm,play:(s,t)=>{sources.forEach(k=>withRoute(srcIns[k],()=>srcStep(k,s,t)))}});apply();
  return{st,set(v){Object.assign(st,v);if(v.sends)Object.assign(st.sends,v.sends);Object.keys(K).forEach(k=>{if(k.startsWith('send_'))K[k].set(st.sends[k.slice(5)]);else if(st[k]!=null)K[k].set(st[k])});ui.forEach(f=>f());buildIR();apply()},stop(){seq.stop();out.kill()}}}

/* =====================================================================
   MIXER — channel strips with dB faders, pan, send, meters (Ableton / FL inspired)
   ===================================================================== */
const MIX_TRACKS=[{id:'kick',n:'KICK',col:'#ffb547',pk:-3},{id:'snare',n:'SNARE',col:'#ff4f9a',pk:-6},{id:'hat',n:'HATS',col:'#3ef0c8',pk:-13},{id:'bass',n:'BASS',col:'#a98bff',pk:-7},{id:'lead',n:'LEAD',col:'#6cb8ff',pk:-9},{id:'pad',n:'PAD',col:'#8fbf3a',pk:-12}];
function mixerRig(host,o){o=o||{};initAudio();const st={tr:{},master:0};MIX_TRACKS.forEach(t=>{st.tr[t.id]=Object.assign({lvl:0,pan:0,send:0,mute:false,solo:false},(o.init||{})[t.id]||{})});if(o.master!=null)st.master=o.master;const show=o.show||['lvl','pan','send'];
  const pg=plug(host,{name:'MIXING DESK',type:'6 TRACKS + MASTER',col:'#ffb547',bypass:false});const B=pg.body,tip=tipLine(B);
  if(!A.ctx){B.textContent='Audio is not available here.';return{st,masterDb:()=>0,stop(){}}}
  const c=A.ctx,out=rigOut(),mst=c.createGain(),mAn=c.createAnalyser();mAn.fftSize=1024;mst.connect(mAn);mAn.connect(out.g);const rev=c.createConvolver();rev.buffer=makeIR(c,2.2,7000,.9);const revG=c.createGain();revG.gain.value=1.2;rev.connect(revG);revG.connect(mst);
  const ch={};MIX_TRACKS.forEach(t=>{const inp=c.createGain(),g=c.createGain(),pn=c.createStereoPanner?c.createStereoPanner():c.createGain(),sg=c.createGain(),an=c.createAnalyser();an.fftSize=512;inp.connect(g);g.connect(pn);pn.connect(an);an.connect(mst);g.connect(sg);sg.connect(rev);ch[t.id]={inp,g,pn,sg,an}});
  const mixer=h('div','mixer');B.append(mixer);const M={};const buf=new Float32Array(512);
  const soloOn=()=>MIX_TRACKS.some(t=>st.tr[t.id].solo);
  function apply(){const so=soloOn();MIX_TRACKS.forEach(t=>{const s=st.tr[t.id],n=ch[t.id];const aud=!s.mute&&(!so||s.solo);n.g.gain.value=aud?dbToG(s.lvl):0;if(n.pn.pan)n.pn.pan.value=s.pan;n.sg.gain.value=aud?s.send:0});mst.gain.value=dbToG(st.master);const pd=masterDb();$('.mdb',mixer).textContent=(pd>0?'+':'')+pd.toFixed(1);$('.clipled',mixer).classList.toggle('on',pd>0);if(o.onChange)o.onChange(st)}
  function masterDb(){const so=soloOn();let sum=0;MIX_TRACKS.forEach(t=>{const s=st.tr[t.id];if(s.mute||so&&!s.solo)return;sum+=dbToG(t.pk+s.lvl)});return gToDb(sum*.55)+st.master+(Object.values(st.tr).reduce((a,s)=>a+s.send,0)>1.2?1:0)}
  MIX_TRACKS.forEach(t=>{const s=st.tr[t.id];const sd=h('div','strip');sd.style.setProperty('--sc',t.col);sd.innerHTML=`<div class="nm">${t.n}</div>`;mixer.append(sd);
    const kS=show.includes('send')?knob(sd,{label:'SEND',min:0,max:1,value:s.send,size:34,fmt:v=>Math.round(v*100)+'%',col:'#6cb8ff',onTouch:()=>{tip.textContent='Send: how much of this track goes to the shared reverb.'},onInput:v=>{s.send=v;apply()}}):null;
    const kP=show.includes('pan')?knob(sd,{label:'PAN',min:-1,max:1,value:s.pan,size:34,bipolar:true,def:0,fmt:v=>Math.abs(v)<.02?'C':(v<0?'L':'R')+Math.round(Math.abs(v)*100),col:'#a98bff',onTouch:()=>{tip.textContent='Pan: places the track from left (L) to right (R). C = center.'},onInput:v=>{s.pan=Math.abs(v)<.02?0:v;apply()}}):null;
    const fw=h('div','fdrwrap');sd.append(fw);const mt=meterV(fw,130);const fd=faderV(fw,{label:t.n+' volume',height:130,value:s.lvl,onInput:v=>{s.lvl=v;db.textContent=v<=-59.5?'-inf':(v>0?'+':'')+v.toFixed(1);apply()},onEnd:()=>{tip.textContent='Fader: the track volume in dB. 0 dB = unchanged.'}});if(!show.includes('lvl'))fd.el.style.pointerEvents='none';
    const db=h('span','db',(s.lvl>0?'+':'')+s.lvl.toFixed(1));sd.append(db);const msd=h('div','ms','<button data-m="m" aria-label="Mute">M</button><button data-m="s" aria-label="Solo">S</button>');sd.append(msd);
    $$('button',msd).forEach(b=>b.onclick=()=>{if(b.dataset.m==='m')s.mute=!s.mute;else s.solo=!s.solo;b.classList.toggle('on',b.dataset.m==='m'?s.mute:s.solo);apply()});M[t.id]={mt,fd,kS,kP,db}});
  const ms=h('div','strip master');ms.style.setProperty('--sc','#ffb547');ms.innerHTML='<div class="nm">MASTER</div><div class="clipled" title="Clip"></div>';mixer.append(ms);const mfw=h('div','fdrwrap');ms.append(mfw);const mmt=meterV(mfw,150);const mfd=faderV(mfw,{label:'Master volume',height:150,value:st.master,onInput:v=>{st.master=v;apply()}});ms.append(h('span','db mdb','0.0'),h('span','kb-lab','PEAK dB'));
  addLive(mixer,()=>{MIX_TRACKS.forEach(t=>M[t.id].mt.set(anPeakDb(ch[t.id].an,buf)));mmt.set(anPeakDb(mAn,buf))});
  const r={};MIX_TRACKS.forEach(t=>r[t.id]=ch[t.id].inp);
  seq.start({bpm:100,play:(s,t)=>songStep(s,t,r,{bpm:100})});apply();
  return{st,masterDb,set(id,v){const s=st.tr[id];Object.assign(s,v);const m=M[id];m.fd.set(s.lvl);m.db.textContent=s.lvl<=-59.5?'-inf':(s.lvl>0?'+':'')+s.lvl.toFixed(1);if(m.kP)m.kP.set(s.pan);if(m.kS)m.kS.set(s.send);apply()},setMaster(v){st.master=v;mfd.set(v);apply()},stop(){seq.stop();out.kill()}}}

/* =====================================================================
   AUTOMATION LANE (Ableton-style breakpoints over 4 bars)
   ===================================================================== */
function autoLane(host,o){o=o||{};initAudio();const pts=(o.points||[.5,.5,.5,.5,.5]).slice();const pg=plug(host,{name:'MOTION RUNE',type:'AUTOMATION · FILTER CUTOFF',col:'#ffcc4d',bypass:false});const B=pg.body,tip=tipLine(B);tip.textContent='Drag the points: each one is the filter cutoff at the start of a bar.';
  const hz=v=>Math.round(150*Math.pow(80,v));let ph=-1,t0=0;
  const disp=display(B,150,(g,W,H)=>{gridLines(g,W,H,{cols:16,major:4});g.fillStyle='#6a5f9a';g.font='10px VT323, monospace';for(let b=0;b<4;b++)g.fillText('BAR '+(b+1),b*W/4+4,H-4);
    const X=i=>i/4*(W-16)+8,Yv=v=>H-12-v*(H-24);g.beginPath();pts.forEach((v,i)=>{if(i===0)g.moveTo(X(i),Yv(v));else g.lineTo(X(i),Yv(v))});g.lineTo(W,Yv(pts[4]));g.strokeStyle='#ffcc4d';g.lineWidth=2.5;g.stroke();g.lineTo(W,H);g.lineTo(X(0),H);g.closePath();g.fillStyle='rgba(255,204,77,.1)';g.fill();
    pts.forEach((v,i)=>{g.beginPath();g.arc(X(i),Yv(v),7,0,7);g.fillStyle='#07050d';g.fill();g.strokeStyle='#f1e7d0';g.lineWidth=2;g.stroke()});
    if(ph>=0){g.fillStyle='rgba(241,231,208,.8)';g.fillRect(8+ph*(W-16),0,2,H)}g.fillStyle='#ffcc4d';g.fillText('CUTOFF '+fmtHz(hz(ph>=0?pts[Math.min(4,Math.floor(ph*4))]:pts[0]))+' Hz',6,12)});
  let dr=-1;const hit=e=>{const r=disp.cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,r}};
  disp.cv.addEventListener('pointerdown',e=>{const p=hit(e);dr=clamp(Math.round(p.x*4),0,4);try{disp.cv.setPointerCapture(e.pointerId)}catch(err){}move(e)});
  const move=e=>{if(dr<0)return;const p=hit(e);pts[dr]=clamp(1-(p.y*p.r.height-12)/(p.r.height-24),0,1);disp.redraw();if(o.onChange)o.onChange(pts)};disp.cv.addEventListener('pointermove',move);disp.cv.addEventListener('pointerup',()=>{dr=-1});
  const row=h('div','row wrap');row.style.gap='6px';B.append(row);const play=h('button','btn neon sm','▶ PLAY 4 BARS');row.append(play);
  [['RISE',[.05,.3,.55,.8,1]],['FALL',[1,.75,.5,.25,.05]],['FLAT',[.5,.5,.5,.5,.5]]].forEach(([n,v])=>{const b=h('button','btn ghost sm',n);b.onclick=()=>{v.forEach((x,i)=>pts[i]=x);disp.redraw();if(o.onChange)o.onChange(pts)};row.append(b)});
  let out=null,lp=null;play.onclick=()=>{initAudio();if(!A.ctx)return;if(seq.on){seq.stop();return}if(out)out.kill();out=rigOut();lp=A.ctx.createBiquadFilter();lp.type='lowpass';lp.Q.value=4;lp.connect(out.g);const spb=60/100/4;
    seq.start({bpm:100,total:64,route:lp,play:(s,t)=>{if(s===0){t0=t;pts.forEach((v,i)=>{const at=t+i*16*spb;if(i===0)lp.frequency.setValueAtTime(hz(v),at);else lp.frequency.exponentialRampToValueAtTime(hz(v),at)})}songStep(s,t,{kick:null},{bpm:100})},onStep:s=>{ph=s/64;disp.redraw()},onEnd:()=>{ph=-1;disp.redraw();play.textContent='▶ PLAY 4 BARS'},onStop:()=>{ph=-1;disp.redraw();play.textContent='▶ PLAY 4 BARS'}});play.textContent='■ STOP'};
  return{pts,hz,set(v){v.forEach((x,i)=>pts[i]=x);disp.redraw();if(o.onChange)o.onChange(pts)},stop(){seq.stop();if(out)out.kill()}}}

/* =====================================================================
   CEILING SHIELD — limiter + loudness meter (EBU R128 integrated LUFS)
   ===================================================================== */
const MASTER_SRC={lufs:-19,peak:-3};
let MASTER_CAL=null;
function calibrateMaster(){if(!MASTER_CAL)MASTER_CAL=withTimeout(renderOffline(64*60/100/4+.5,null,t0=>{for(let s=0;s<64;s++)songStep(s,t0+s*60/100/4,null,{bpm:100})}),6000).then(b=>{MASTER_SRC.lufs=Math.round(lufsOf(b)*10)/10;MASTER_SRC.peak=Math.round(peakDb(b)*10)/10;MASTER_SRC.cal=true;return MASTER_SRC}).catch(()=>MASTER_SRC);return MASTER_CAL}
function limMakeup(T){const out0=T+(0-T)/20;return Math.pow(1/Math.pow(10,out0/20),.6)}
function buildMasterChain(c,inp,st,mode){const drive=c.createGain();drive.gain.value=dbToG(st.gain);inp.connect(drive);let last=drive;
  if(mode!=='clip'){const lim=c.createDynamicsCompressor();lim.threshold.value=st.ceil;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=st.rel/1000;const comp=c.createGain();comp.gain.value=1/limMakeup(st.ceil);drive.connect(lim);lim.connect(comp);last=comp;last._lim=lim}
  const clip=c.createWaveShaper();clip.curve=clipCurve(mode==='clip'?1:dbToG(st.ceil+.2));last.connect(clip);const lim=last._lim;return{drive,clip,lim}}
function masterRig(host,o){o=o||{};initAudio();const mode=o.mode||'limit';const st=Object.assign({gain:0,ceil:-.3,rel:80},o.init||{});let meas=null;
  const pg=plug(host,{name:mode==='clip'?'GAIN STAGE':'CEILING SHIELD',type:mode==='clip'?'GAIN + CLIP METER':'LIMITER + LOUDNESS',col:'#f1e7d0',bypass:false});const B=pg.body,tip=tipLine(B);
  if(!A.ctx){B.textContent='Audio is not available here.';return{st,measure:async()=>model(),model,stop(){}}}
  const c=A.ctx,out=rigOut(),inp=c.createGain();let chain=null;const oAn=c.createAnalyser();oAn.fftSize=1024;
  const rebuild=()=>{if(chain){try{inp.disconnect()}catch(e){}try{chain.clip.disconnect()}catch(e){}}chain=buildMasterChain(c,inp,st,mode);chain.clip.connect(oAn);oAn.connect(out.g)};
  const hist=[];const tw=h('div','twocol');B.append(tw);const c1=h('div'),c2=h('div');tw.append(c1,c2);
  const grD=display(c1,120,(g,W,H)=>{gridLines(g,W,H,{db:12});const n=hist.length,bw=W/80;hist.forEach((f,i)=>{const x=W-(n-i)*bw;const yo=H-clamp((f.o+30)/30,0,1)*H;g.fillStyle='#f1e7d055';g.fillRect(x,yo,bw,H-yo);if(f.gr>0){g.fillStyle='#ff4f9a';g.fillRect(x,0,bw,f.gr/12*H)}});
    const cy=H-clamp((st.ceil+30)/30,0,1)*H;g.fillStyle='#ffcc4d';g.fillRect(0,cy,W,2);g.font='10px VT323, monospace';g.fillText(mode==='clip'?'0 dBFS WALL':'CEILING '+st.ceil.toFixed(1)+' dB',4,cy-3)});
  c1.append(h('div','dispcap','<span>OUTPUT</span><span style="color:#ff4f9a">GAIN REDUCTION</span>'));
  c2.innerHTML=`<div class="sect" style="height:100%"><div class="sect-h"><b>LOUDNESS</b><span class="grow"></span><span class="clipled"></span></div><div class="bigval lu">— —</div><span class="kb-lab">LUFS INTEGRATED</span><div class="lufsbar"><i style="width:0%"></i><b style="left:${(( -14+24)/18*100).toFixed(1)}%"></b></div><div class="dispcap"><span>-24</span><span>-14 TARGET</span><span>-6</span></div><span class="num pk" style="font-size:18px;color:var(--dim)">PEAK — dBFS</span></div>`;
  const measB=h('button','btn neon sm block','MEASURE MASTER');B.append(measB);
  const kr=h('div','krow');B.append(kr);const K={};
  K.gain=knob(kr,{label:mode==='clip'?'GAIN':'INPUT GAIN',min:-12,max:18,value:st.gain,bipolar:true,def:0,fmt:v=>(v>0?'+':'')+v.toFixed(1)+' dB',col:'#f1e7d0',onTouch:()=>{tip.textContent=mode==='clip'?'Gain: turns the whole track up or down. Past 0 dBFS it clips.':'Input gain (drive): pushes the track into the limiter. More = louder, until it gets crushed.'},onInput:v=>{st.gain=v;upd()}});
  if(mode!=='clip'){K.ceil=knob(kr,{label:'CEILING',min:-6,max:0,value:st.ceil,fmt:v=>v.toFixed(1)+' dB',col:'#ffcc4d',onTouch:()=>{tip.textContent='Ceiling: nothing gets past this level. Around -1 dB leaves room for MP3 and streaming conversion.'},onInput:v=>{st.ceil=v;upd()}});
    K.rel=knob(kr,{label:'RELEASE',min:10,max:500,log:true,value:st.rel,fmt:fmtMs,col:'#f1e7d0',onTouch:()=>{tip.textContent='Release: how fast the limiter recovers. Too fast distorts, too slow pumps.'},onInput:v=>{st.rel=v;upd()}})}
  function model(){const pk=MASTER_SRC.peak+st.gain;if(mode==='clip')return{peak:Math.min(pk,0),lufs:MASTER_SRC.lufs+st.gain-Math.max(0,pk)*.35,gr:0,clip:pk>0};const over=Math.max(0,pk-st.ceil);return{peak:Math.min(pk,st.ceil),lufs:MASTER_SRC.lufs+st.gain-over*.5,gr:over,clip:false}}
  function show(r,measured){$('.lu',c2).textContent=r.lufs.toFixed(1);$('.lufsbar i',c2).style.width=clamp((r.lufs+24)/18,0,1)*100+'%';$('.pk',c2).textContent=`PEAK ${r.peak.toFixed(1)} dBFS${measured?'':' (est.)'}`;$('.clipled',c2).classList.toggle('on',r.peak>-.05&&mode==='clip'&&st.gain+MASTER_SRC.peak>0)}
  function upd(){if(chain){chain.drive.gain.value=dbToG(st.gain);if(chain.lim){chain.lim.threshold.value=st.ceil;chain.lim.release.value=st.rel/1000}chain.clip.curve=clipCurve(mode==='clip'?1:dbToG(st.ceil+.2))}meas=null;show(model(),false);grD.redraw();if(o.onChange)o.onChange(st)}
  async function measure(){initAudio();measB.disabled=true;measB.textContent='RENDERING…';const spb=60/100/4;
    try{const buf=await withTimeout(renderOffline(64*spb+.5,(oc,i2)=>buildMasterChain(oc,i2,st,mode).clip,t0=>{for(let s=0;s<64;s++)songStep(s,t0+s*spb,null,{bpm:100})}),6000);meas={lufs:lufsOf(buf),peak:peakDb(buf),gr:model().gr};show(meas,true)}catch(e){meas=Object.assign(model(),{est:true});show(meas,false)}
    measB.disabled=false;measB.textContent='MEASURE AGAIN';sfx.tap();if(o.onMeasure)o.onMeasure(meas);return meas}
  measB.onclick=()=>measure();
  const buf=new Float32Array(1024);addLive(grD.cv,()=>{const od=anPeakDb(oAn,buf);const gr=chain&&chain.lim?Math.abs(typeof chain.lim.reduction==='number'?chain.lim.reduction:0):0;hist.push({o:od,gr:gr>0.05?gr:0});if(hist.length>80)hist.shift();grD.redraw()});
  rebuild();seq.start({bpm:100,route:inp,play:(s,t)=>songStep(s,t,null,{bpm:100})});upd();calibrateMaster().then(()=>{if(B.isConnected&&!meas)upd()});
  return{st,model,measure,last:()=>meas,set(v){Object.assign(st,v);Object.keys(K).forEach(k=>K[k].set(st[k==='gain'?'gain':k]));upd()},stop(){seq.stop();out.kill()}}}
