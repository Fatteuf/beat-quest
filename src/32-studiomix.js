/* ================= the studio's EQ (EQ tool) and AUTOMATION (Automation tool) =================
   S.fx.eq[track] = six bands {f,g,q,on} laid over EQ_BANDS(). The filters live in the studio graph, right after each track input.
   S.fx.auto = {on, pts:[5 values 0..1]}: a low-pass on the whole beat whose cutoff follows the lane over 4 bars. */
/* small studio effects of abilities won in Beat Forest: Drum Sense names where each drum sits, Perfect Pulse thinks in milliseconds */
const DS_ZONE={kick:'LOW THUMP',snare:'MID CRACK',hat:'HIGH TICK',bass:'LOW NOTES'};
const stepMs=()=>`1/16 = ${Math.round(60000/S.bpm/4)} ms`;
const swingTxt=()=>S.swing+'%'+(hasAb('perfect')&&S.swing?` · ${Math.round(S.swing/100*60000/S.bpm/4)} ms`:'');
const EQ_TRACKS=()=>['kick','snare','hat','bass'].concat(has('synth')||has('midi')?['lead']:[]);
let STUDIO_SOLO=null,AUTO_PH=-1,AUTO_OFF=false;
function eqBandsOf(k){const B=EQ_BANDS(),st=(S.fx&&S.fx.eq||{})[k];if(Array.isArray(st))st.forEach((b,i)=>{if(B[i]&&b&&isFinite(b.f))Object.assign(B[i],{f:clamp(+b.f,20,20000),g:clamp(+b.g||0,-18,18),q:clamp(+b.q||.71,.3,10),on:!!b.on})});return B}
function eqStore(k,B){if(!S.fx.eq)S.fx.eq={};S.fx.eq[k]=B.map(b=>({f:Math.round(b.f),g:b.g,q:Math.round(b.q*100)/100,on:!!b.on}))}
function eqSetNode(x,b){if(!b||!b.on){x.type='peaking';x.frequency.value=1000;x.Q.value=1;x.gain.value=0;return}
  x.type=b.type;x.frequency.value=b.f;x.Q.value=b.type==='peaking'||b.type.includes('pass')?b.q:.71;x.gain.value=b.type.includes('pass')?0:b.g}
const eqActive=k=>eqBandsOf(k).some(b=>b.on&&(b.type.includes('pass')||Math.abs(b.g)>=.5));
function openStudioEq(trk,onDone){seq.stop();initAudio();const G=studioGraph(),TRS=EQ_TRACKS();
  let k=TRS.includes(trk)?trk:TRS.includes(S.fx.eqSel)?S.fx.eqSel:'kick',sel=3,B=eqBandsOf(k),sv=0;
  const m=modal('<div class="seq-eq" style="width:100%;text-align:left"></div><button class="btn block fx-close">DONE</button>');
  const close=()=>{seq.stop();STUDIO_SOLO=null;autoReset();save();m.close();if(onDone)onDone()};$('.fx-close',m).onclick=close;
  const pg=plug($('.seq-eq',m),{name:'FREQUENCY BLADE',type:'EQ · YOUR TRACKS',col:'#3ef0c8',bypass:false}),body=pg.body,tip=tipLine(body);
  if(!G){body.append(h('p','muted','Audio is not available here.'));return}
  tip.textContent='Pick a track, then drag a numbered band: left-right sets the frequency, up-down boosts or cuts.';
  const chips=h('div','eq-trk');body.append(chips);
  const R=18,Y=(db,H)=>H/2-db/R*(H/2-10),cur=()=>B.find(x=>x.id===sel);
  const resp=(nodes,W)=>{const n=Math.floor(W/2),fr=new Float32Array(n),acc=new Float32Array(n),mg=new Float32Array(n),ph=new Float32Array(n);for(let i=0;i<n;i++)fr[i]=FROMLOG20(i/n);nodes.forEach(x=>{x.getFrequencyResponse(fr,mg,ph);for(let i=0;i<n;i++)acc[i]+=gToDb(mg[i])});return acc};
  const curve=(g,arr,H,col,lw)=>{g.beginPath();arr.forEach((db,i)=>{const y=Y(db,H);if(i===0)g.moveTo(i*2,y);else g.lineTo(i*2,y)});g.strokeStyle=col;g.lineWidth=lw;g.stroke()};
  const disp=display(body,190,(g,W,H)=>{gridLines(g,W,H,{freq:true,db:R});
    if(hasAb('freqvision'))TRS.filter(x=>x!==k).forEach(x=>drawSpectrum(g,W,H,G.tr[x].an,null,'rgba(255,79,154,.5)',-110));
    drawSpectrum(g,W,H,G.tr[k].an,'rgba(62,240,200,.18)',null,-110);
    const nodes=G.tr[k].eq;B.forEach((b,i)=>{if(b.on)curve(g,resp([nodes[i]],W),H,b.col+'66',1)});curve(g,resp(nodes,W),H,'#f1e7d0',2.5);
    g.font='10px VT323, monospace';g.fillStyle='#3ef0c8';g.fillText(TR[k].n+(STUDIO_SOLO?' · SOLO':''),6,12);
    B.forEach(b=>{const x=LOG20(b.f)*W,y=b.type.includes('pass')?H/2:Y(b.g,H);g.beginPath();g.arc(x,y,b.id===sel?10:8,0,7);g.fillStyle=b.on?b.col:'#2a2248';g.fill();g.strokeStyle=b.id===sel?'#f1e7d0':'#07050d';g.lineWidth=2;g.stroke();g.fillStyle='#07050d';g.font='bold 11px VT323, monospace';g.fillText(String(b.id),x-3,y+4)})});
  addLive(disp.cv,()=>disp.redraw());
  let drag=null;const pick=e=>{const r=disp.cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=30;B.forEach(b=>{const d=Math.hypot(LOG20(b.f)*r.width-x,(b.type.includes('pass')?r.height/2:Y(b.g,r.height))-y);if(d<bd){bd=d;best=b}});return best};
  const move=e=>{const b=B.find(x=>x.id===drag);if(!b)return;const r=disp.cv.getBoundingClientRect();b.f=Math.round(clamp(FROMLOG20((e.clientX-r.left)/r.width),20,20000));if(!b.type.includes('pass'))b.g=Math.round(clamp((r.height/2-(e.clientY-r.top))/(r.height/2-10)*R,-R,R)*2)/2;b.on=true;syncPanel();apply()};
  disp.cv.addEventListener('pointerdown',e=>{const b=pick(e);if(!b)return;sel=b.id;drag=b.id;try{disp.cv.setPointerCapture(e.pointerId)}catch(err){}tip.textContent=b.type.includes('pass')?`${b.n}: drag left-right to set where the filter starts.`:`${b.n}: drag left-right for the frequency, up-down to boost or cut.`;syncPanel();disp.redraw()});
  disp.cv.addEventListener('pointermove',e=>{if(drag)move(e)});disp.cv.addEventListener('pointerup',()=>{drag=null});
  body.append(h('div','dispcap',`<span>DRAG A BAND · TEAL = THIS TRACK${hasAb('freqvision')?' · PINK = YOUR OTHER TRACKS':''}</span>`));
  const tabs=h('div','seg2');body.append(tabs);const panel=sect(body,'BAND','<button class="plug-btn" data-a="onoff">ON</button>');const kr=h('div','krow');panel.append(kr);
  const kF=knob(kr,{label:'FREQ',min:20,max:20000,log:true,value:350,fmt:fmtHz,col:'#3ef0c8',onTouch:()=>{tip.textContent='Frequency: where this band works.'},onInput:v=>{cur().f=Math.round(v);cur().on=true;apply()}});
  const kG=knob(kr,{label:'GAIN',min:-R,max:R,value:0,bipolar:true,def:0,fmt:v=>(v>0?'+':'')+v.toFixed(1)+' dB',col:'#3ef0c8',onTouch:()=>{tip.textContent='Gain: boost (up) or cut (down) this range.'},onInput:v=>{cur().g=Math.round(v*2)/2;cur().on=true;apply()}});
  const kQ=knob(kr,{label:'Q',min:.3,max:10,log:true,value:1.4,fmt:v=>v.toFixed(2),col:'#3ef0c8',onTouch:()=>{tip.textContent='Q: the width. High Q is narrow and surgical, low Q is broad and musical.'},onInput:v=>{cur().q=v;apply()}});
  function syncPanel(){const b=cur();tabs.innerHTML=B.map(x=>`<button data-b="${x.id}" class="${x.id===sel?'on':''}" style="${x.on?'':'opacity:.55'}">${x.id} ${x.type==='highpass'?'LC':x.type==='lowpass'?'HC':x.type==='lowshelf'?'LS':x.type==='highshelf'?'HS':'BELL'}</button>`).join('');
    $$('button',tabs).forEach(t=>t.onclick=()=>{sel=+t.dataset.b;syncPanel();disp.redraw()});
    $('.sect-h b',panel).textContent=`BAND ${b.id} · ${b.n}`;const oo=$('[data-a=onoff]',panel);oo.textContent=b.on?'ON':'OFF';oo.classList.toggle('on',b.on);kF.set(b.f);kG.set(b.g);kQ.set(b.q);kG.enable(!b.type.includes('pass'));kQ.enable(b.type==='peaking'||b.type.includes('pass'))}
  $('[data-a=onoff]',panel).onclick=()=>{const b=cur();b.on=!b.on;syncPanel();apply()};
  const paintChips=()=>{chips.innerHTML=TRS.map(x=>`<button data-t="${x}" class="${x===k?'on':''}" style="--tc:${TR[x].c}">${TR[x].n}${eqActive(x)?' ●':''}</button>`).join('');
    $$('button',chips).forEach(b=>b.onclick=()=>{k=b.dataset.t;S.fx.eqSel=k;B=eqBandsOf(k);if(STUDIO_SOLO)STUDIO_SOLO=k;syncPanel();paintChips();disp.redraw()})};
  const row=h('div','row wrap');row.style.gap='6px';body.append(row);
  const play=h('button','btn neon sm','▶ PLAY'),solo=h('button','chip','SOLO'),reset=h('button','btn ghost sm','RESET TRACK');row.append(play,solo,reset);
  const stopUI=()=>{play.textContent='▶ PLAY';autoReset()};
  play.onclick=()=>{if(seq.on){seq.stop();return}play.textContent='■ STOP';seq.start({bpm:()=>S.bpm,total:0,play:(s,t)=>{const i=s%16;studioStep(S.pattern,s,t+(hasAb('swing')&&i%4===2?S.swing/100*60/S.bpm/4:0),S.vols)},onStop:stopUI,onEnd:stopUI})};
  solo.onclick=()=>{STUDIO_SOLO=STUDIO_SOLO?null:k;solo.classList.toggle('neon',!!STUDIO_SOLO);solo.textContent=STUDIO_SOLO?'SOLO ON':'SOLO';disp.redraw()};
  reset.onclick=()=>{B=EQ_BANDS();apply();syncPanel();tip.textContent=TR[k].n+' EQ reset: flat, the track sounds as it did.'};
  body.append(h('p','muted',hasAb('freqvision')?'FREQUENCY VISION: the pink lines are your other tracks. Where one sits on top of this track, cut one of them there.':'Win FREQUENCY VISION (The Spectrum King) to see your other tracks here in pink.'));
  const apply=()=>{eqStore(k,B);applyFx();paintChips();disp.redraw();clearTimeout(sv);sv=setTimeout(save,300)};
  paintChips();syncPanel()}

/* ---- automation: 5 points over 4 bars, like the Mixing Castle lesson ---- */
const AUTO_SHAPES=[['RISE',[.05,.3,.55,.8,1]],['FALL',[1,.75,.5,.25,.05]],['DIP',[1,.35,.1,.35,1]],['FLAT',[.5,.5,.5,.5,.5]]];
const autoHz=v=>Math.round(150*Math.pow(80,clamp(v,0,1)));
function autoState(){const a=S.fx.auto;if(!a||!Array.isArray(a.pts)||a.pts.length!==5||!a.pts.every(Number.isFinite))S.fx.auto={on:!!(a&&a.on),pts:AUTO_SHAPES[0][1].slice()};return S.fx.auto}
/* called on the first step of every 4-bar cycle; only the first cycle clears old events, so a running ramp is never cut */
function autoSchedule(G,t,first){const au=autoState(),spb=60/S.bpm/4,f=G.alp.frequency;if(first)f.cancelScheduledValues(0);G.alp.Q.setValueAtTime(4,t);
  au.pts.forEach((v,i)=>{const at=t+i*16*spb;if(i===0)f.setValueAtTime(autoHz(v),at);else f.exponentialRampToValueAtTime(autoHz(v),at)})}
function autoReset(){if(!SG||SG.c!==A.ctx)return;const f=SG.alp.frequency,t=now();f.cancelScheduledValues(0);f.setValueAtTime(20000,t);SG.alp.Q.cancelScheduledValues(0);SG.alp.Q.setValueAtTime(.71,t)}
function autoCard(){const au=autoState();return`<div class="win raised stack auto-card"><div class="row sp"><p class="eyebrow" style="color:#ffcc4d">AUTOMATION · MOTION RUNE</p><button class="chip ${au.on?'amber':''}" data-a="auto-on" style="min-height:36px">${au.on?'ON':'OFF'}</button></div>
  <p class="muted" style="font-size:14px">A filter on your whole beat, drawn over 4 bars. Drag the 5 points: low = dark and closed, high = bright and open. Turn it ON, then press PLAY on the drum machine.</p>
  <div class="auto-h"></div><div class="row wrap" style="gap:6px">${AUTO_SHAPES.map(([n])=>`<button class="btn ghost sm" data-shape="${n}">${n}</button>`).join('')}</div></div>`}
function wireAutoCard(card){const au=autoState(),host=$('.auto-h',card);
  const disp=display(host,130,(g,W,H)=>{gridLines(g,W,H,{cols:16,major:4});g.fillStyle='#6a5f9a';g.font='10px VT323, monospace';for(let b=0;b<4;b++)g.fillText('BAR '+(b+1),b*W/4+4,H-4);
    const X=i=>i/4*(W-16)+8,Yv=v=>H-14-v*(H-28),on=au.on;g.beginPath();au.pts.forEach((v,i)=>{if(i===0)g.moveTo(X(i),Yv(v));else g.lineTo(X(i),Yv(v))});g.strokeStyle=on?'#ffcc4d':'#6a5f9a';g.lineWidth=2.5;g.stroke();
    g.lineTo(X(4),H);g.lineTo(X(0),H);g.closePath();g.fillStyle=on?'rgba(255,204,77,.1)':'rgba(106,95,154,.08)';g.fill();
    au.pts.forEach((v,i)=>{g.beginPath();g.arc(X(i),Yv(v),7,0,7);g.fillStyle='#07050d';g.fill();g.strokeStyle='#f1e7d0';g.lineWidth=2;g.stroke()});
    if(on&&seq.on&&AUTO_PH>=0){g.fillStyle='rgba(241,231,208,.8)';g.fillRect(X(0)+AUTO_PH*(W-16),0,2,H)}
    g.fillStyle=on?'#ffcc4d':'#6a5f9a';g.fillText(`CUTOFF ${fmtHz(autoHz(au.pts[0]))} → ${fmtHz(autoHz(au.pts[4]))} Hz${on?'':' · OFF'}`,6,12)});
  addLive(disp.cv,()=>{if(seq.on)disp.redraw()});
  let dr=-1;const hit=e=>{const r=disp.cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:e.clientY-r.top,h:r.height}};
  const move=e=>{if(dr<0)return;const p=hit(e);au.pts[dr]=Math.round(clamp(1-(p.y-14)/(p.h-28),0,1)*100)/100;disp.redraw()};
  disp.cv.addEventListener('pointerdown',e=>{const p=hit(e);dr=clamp(Math.round(p.x*4),0,4);try{disp.cv.setPointerCapture(e.pointerId)}catch(err){}move(e)});
  disp.cv.addEventListener('pointermove',move);disp.cv.addEventListener('pointerup',()=>{if(dr>=0){dr=-1;save()}});
  const ob=$('[data-a=auto-on]',card);ob.onclick=()=>{au.on=!au.on;ob.textContent=au.on?'ON':'OFF';ob.classList.toggle('amber',au.on);if(!au.on)autoReset();save();disp.redraw();sfx.tap()};
  $$('[data-shape]',card).forEach(b=>b.onclick=()=>{const s=AUTO_SHAPES.find(x=>x[0]===b.dataset.shape);s[1].forEach((v,i)=>au.pts[i]=v);save();disp.redraw()});
  return disp}
