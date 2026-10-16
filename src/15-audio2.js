/* ================= synthesis & music theory ================= */
const midiF=m=>440*Math.pow(2,(m-69)/12);
const NOTE_NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const noteName=m=>NOTE_NAMES[((m%12)+12)%12]+(Math.floor(m/12)-1);
const MAJOR=[0,2,4,5,7,9,11],MINOR=[0,2,3,5,7,8,10];
const WAVE_GAIN={sine:1,triangle:.9,square:.42,sawtooth:.5};
const WAVE_NAME={sine:'SINE',triangle:'TRIANGLE',square:'SQUARE',sawtooth:'SAW'};
/* ---- wavetable: sine → triangle → saw → square, morphed by harmonic series (real additive wavetable) ---- */
const HARM=64,WT_ORDER=['sine','triangle','sawtooth','square'];
const SHAPE_H={sine:n=>n===1?1:0,triangle:n=>n%2?8/(Math.PI*Math.PI)*(((n-1)/2)%2?-1:1)/(n*n):0,sawtooth:n=>2/Math.PI*(n%2?1:-1)/n,square:n=>n%2?4/Math.PI/n:0};
function wtCoefs(pos){pos=clamp(pos,0,1)*3;const i=Math.min(2,Math.floor(pos)),f=pos-i;const a=SHAPE_H[WT_ORDER[i]],b=SHAPE_H[WT_ORDER[i+1]];const im=new Float32Array(HARM+1);for(let n=1;n<=HARM;n++)im[n]=a(n)*(1-f)+b(n)*f;return im}
function wtSample(pos,ph){const im=wtCoefs(pos);let v=0;for(let n=1;n<=24;n++)if(im[n])v+=im[n]*Math.sin(n*ph);return v}
const PWCACHE=new Map();
function periodicWave(c,pos){const key=Math.round(clamp(pos,0,1)*60);const ck=c===A.ctx?key:null;if(ck!==null&&PWCACHE.has(ck))return PWCACHE.get(ck);const pw=c.createPeriodicWave(new Float32Array(HARM+1),wtCoefs(key/60));if(ck!==null)PWCACHE.set(ck,pw);return pw}
const wtName=pos=>WT_ORDER[Math.round(clamp(pos,0,1)*3)];
/* patches: every sound in the game is one of these */
const INIT_PATCH={wt:.66,oct:0,fine:0,uni:1,det:.25,lvl:.8,sub:0,flt:'lp',slope:12,cut:3200,res:1,fenv:0,fa:5,fd:300,fs:0,fr:300,a:5,d:300,s:.6,r:250,lfoShape:'sine',lfoRate:4,lfoDepth:0,lfoDest:'cut'};
const mkPatch=o=>Object.assign({},INIT_PATCH,o);
const PRESETS={INIT:mkPatch({}),BASS:mkPatch({wt:.66,oct:-1,cut:700,res:3,fenv:.45,fd:200,a:3,d:250,s:.5,r:110,sub:.45}),PLUCK:mkPatch({wt:.4,cut:1600,res:2,fenv:.6,fd:180,a:2,d:260,s:.12,r:260}),
  PAD:mkPatch({wt:.7,uni:5,det:.55,cut:1500,a:700,d:900,s:.8,r:1500,lfoDest:'cut',lfoDepth:.15,lfoRate:.3}),LEAD:mkPatch({wt:.85,uni:3,det:.3,cut:4200,res:2,a:6,d:400,s:.8,r:220,lfoDest:'pitch',lfoDepth:.08,lfoRate:5.5}),
  WOBBLE:mkPatch({wt:1,oct:-1,cut:500,res:8,a:3,d:300,s:1,r:120,lfoDest:'cut',lfoDepth:.85,lfoRate:2,sub:.35})};
const PATCH0=PRESETS.INIT,PLUCK=mkPatch({wt:.36,cut:4200,res:1,a:4,d:260,s:.15,r:220}),PADP=mkPatch({wt:.66,uni:3,det:.35,cut:1400,a:600,d:800,s:.8,r:1400}),BASSP=mkPatch({wt:.66,cut:650,res:3,fenv:.3,fd:150,a:3,d:200,s:.45,r:120});
/* a playable voice: unison wavetable oscillators + sub → filter (12/24 dB) with its own envelope → amp envelope, LFO to cutoff, pitch or volume */
function voiceOn(P,f,t,v,dest){const c=AC();dest=dest||OUT();const out=c.createGain();
  const mkF=()=>{const x=c.createBiquadFilter();x.type=P.flt==='hp'?'highpass':P.flt==='bp'?'bandpass':'lowpass';x.frequency.value=P.cut;x.Q.value=P.res;return x};
  const f1=mkF(),f2=P.slope===24&&P.flt!=='bp'?mkF():null;if(f2){f1.connect(f2);f2.connect(out)}else f1.connect(out);
  let end=out;if(P.lfoDepth>0&&P.lfoDest==='vol'){const tr=c.createGain();tr.gain.value=1-P.lfoDepth/2;out.connect(tr);end=tr}end.connect(dest);
  const fr=f*Math.pow(2,P.oct||0),uni=Math.max(1,Math.round(P.uni||1)),pw=periodicWave(c,P.wt),oscs=[];
  for(let k=0;k<uni;k++){const o=c.createOscillator();o.setPeriodicWave(pw);o.frequency.value=fr;const sp=uni>1?(k/(uni-1)-.5)*2:0;o.detune.value=(P.fine||0)+sp*(P.det||0)*40;const g=c.createGain();g.gain.value=1/Math.sqrt(uni);o.connect(g);g.connect(f1);oscs.push(o)}
  if(P.sub>0){const o=c.createOscillator();o.type='sine';o.frequency.value=fr/2;const g=c.createGain();g.gain.value=P.sub;o.connect(g);g.connect(f1);oscs.push(o)}
  const a=Math.max(.002,P.a/1000),d=Math.max(.01,P.d/1000),r=Math.max(.01,P.r/1000),pk=Math.max((v||.3)*(P.lvl==null?.8:P.lvl)*(1-.4*P.wt),.0002),sus=Math.max(pk*P.s,.0001);
  out.gain.setValueAtTime(.0001,t);out.gain.linearRampToValueAtTime(pk,t+a);out.gain.setTargetAtTime(sus,t+a,d/3);
  const fl=[f1,f2].filter(Boolean);
  if(P.fenv){const top=clamp(P.cut*Math.pow(2,P.fenv*5),30,18000),sl=clamp(P.cut*Math.pow(2,P.fenv*5*P.fs),30,18000),fa=Math.max(.002,P.fa/1000);fl.forEach(x=>{x.frequency.setValueAtTime(P.cut,t);x.frequency.linearRampToValueAtTime(top,t+fa);x.frequency.setTargetAtTime(sl,t+fa,Math.max(.01,P.fd/1000)/3)})}
  let lfo=null;if(P.lfoDepth>0){lfo=c.createOscillator();lfo.type=P.lfoShape||'sine';lfo.frequency.value=P.lfoRate;const lg=c.createGain();lfo.connect(lg);
    if(P.lfoDest==='pitch'){lg.gain.value=P.lfoDepth*300;oscs.forEach(o=>lg.connect(o.detune))}else if(P.lfoDest==='vol'){lg.gain.value=P.lfoDepth/2;lg.connect(end.gain)}else{lg.gain.value=P.cut*P.lfoDepth*.9;fl.forEach(x=>lg.connect(x.frequency))}lfo.start(t)}
  oscs.forEach(o=>o.start(t));
  const envAt=tt=>{const e=tt-t;if(e<a)return Math.max(.0001,pk*e/a);return sus+(pk-sus)*Math.exp(-(e-a)/(d/3))};
  return{off(t2){t2=Math.max(t2,t+.005);out.gain.cancelScheduledValues(t2);out.gain.setValueAtTime(envAt(t2),t2);out.gain.setTargetAtTime(.0001,t2,r/3);const stop=t2+r*1.6+.1;oscs.forEach(o=>o.stop(stop));if(lfo)lfo.stop(stop);
    if(P.fenv){const rel=Math.max(.01,P.fr/1000);fl.forEach(x=>{x.frequency.cancelScheduledValues(t2);x.frequency.setTargetAtTime(P.cut,t2,rel/3)})}}}}
/* legacy one-shot entry point used across the game */
function SV(t,f,dur,P,v){if(!A.ctx)return;P=P||PATCH0;
  if(P.wave){const c=AC();const o=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();o.type=P.wave;o.frequency.value=f;lp.type='lowpass';lp.frequency.value=P.cut||4000;lp.Q.value=P.q||1;const a=Math.max(.002,(P.a||5)/1000),d=Math.max(.01,(P.d||200)/1000),r=Math.max(.01,(P.r||200)/1000),pk=Math.max((v||.3)*(WAVE_GAIN[P.wave]||.5),.0002),off=t+Math.max(dur,a+.01);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.setTargetAtTime(Math.max(pk*(P.s==null?.5:P.s),.0001),t+a,d/3);g.gain.setTargetAtTime(.0001,off,r/3);o.connect(lp);lp.connect(g);g.connect(OUT());o.start(t);o.stop(off+r*1.4+.1);return}
  voiceOn(P,f,t,v).off(t+Math.max(dur,.02))}
function playNotes(dest,notes,opt){opt=opt||{};const t0=now()+.05,step=opt.step||.36;withRoute(dest,()=>notes.forEach((n,i)=>{const t=t0+(opt.chord?0:i*step);[].concat(n).forEach(m=>SV(t,midiF(m),opt.dur||.3,opt.patch||PLUCK,opt.v||.3))}))}
function clipCurve(level){const n=4096,c=new Float32Array(n);for(let i=0;i<n;i++){const x=(i/(n-1)*2-1)*4;c[i]=Math.max(-level,Math.min(level,x))}return c}

/* ================= the demo song used by the later worlds ================= */
const SONG_CHORDS=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],SONG_BASS=[45,41,36,43];
const LEADLINE=[{0:76,3:72,6:69,8:71,10:72,12:76},{0:77,3:76,6:72,8:69,12:72},{0:79,3:76,6:72,8:74,10:76},{0:74,3:71,6:67,8:71,12:74,14:76}];
function songStep(s,t,r,o){r=r||{};o=o||{};const i=s%16,bar=Math.floor(s/16)%4,bpm=o.bpm||100,base=A.route;const R=k=>r[k]||base;
  withRoute(R('kick'),()=>{if(i===0||i===8||i===10)V.kick(t,.85)});
  withRoute(R('snare'),()=>{if(i===4||i===12)V.snare(t,.7)});
  withRoute(R('hat'),()=>{if(i%2===0)V.hat(t,i%4===0?.45:.3)});
  withRoute(R('bass'),()=>{if(i===0||i===3||i===8||i===11)SV(t,midiF(SONG_BASS[bar]),.22,BASSP,.55)});
  withRoute(R('pad'),()=>{if(i===0)SONG_CHORDS[bar].forEach(m=>SV(t,midiF(m+12),60/bpm*4*.95,o.padPatch||PADP,.14))});
  withRoute(R('lead'),()=>{const n=LEADLINE[bar][i];if(n)SV(t,midiF(n),.22,o.leadPatch||PLUCK,.3)})}

/* ================= measuring like a mastering engineer ================= */
function kCoef(fs){let f0=1681.974450955533,G=3.999843853973347,Q=.7071752369554196;let K=Math.tan(Math.PI*f0/fs);const Vh=Math.pow(10,G/20),Vb=Math.pow(Vh,.4996667741545416);let a0=1+K/Q+K*K;
  const shelf={b:[(Vh+Vb*K/Q+K*K)/a0,2*(K*K-Vh)/a0,(Vh-Vb*K/Q+K*K)/a0],a:[2*(K*K-1)/a0,(1-K/Q+K*K)/a0]};
  f0=38.13547087602444;Q=.5003270373238773;K=Math.tan(Math.PI*f0/fs);a0=1+K/Q+K*K;return[shelf,{b:[1,-2,1],a:[2*(K*K-1)/a0,(1-K/Q+K*K)/a0]}]}
function biquadRun(x,c){const y=new Float32Array(x.length);let x1=0,x2=0,y1=0,y2=0;const b0=c.b[0],b1=c.b[1],b2=c.b[2],a1=c.a[0],a2=c.a[1];for(let i=0;i<x.length;i++){const v=b0*x[i]+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=x[i];y2=y1;y1=v;y[i]=v}return y}
/* integrated loudness (ITU-R BS.1770 / EBU R128): K-weighting, 400 ms blocks, absolute and relative gates */
function lufsOf(buf){const fs=buf.sampleRate,kc=kCoef(fs);const ch=[];for(let c=0;c<Math.min(2,buf.numberOfChannels);c++)ch.push(biquadRun(biquadRun(buf.getChannelData(c),kc[0]),kc[1]));
  const blk=Math.round(.4*fs),hop=Math.round(.1*fs);const pw=[];for(let st=0;st+blk<=buf.length;st+=hop){let sum=0;for(const x of ch){let e=0;for(let i=st;i<st+blk;i++)e+=x[i]*x[i];sum+=e/blk}pw.push(sum)}
  const L=p=>-.691+10*Math.log10(p||1e-12);const g1=pw.filter(p=>L(p)>-70);if(!g1.length)return-70;const rel=L(g1.reduce((a,b)=>a+b,0)/g1.length)-10;const g2=g1.filter(p=>L(p)>rel);return L(g2.reduce((a,b)=>a+b,0)/Math.max(1,g2.length))}
const peakDb=b=>20*Math.log10(peak(b)||1e-6);
/* export: 16-bit WAV, wrapped in a zip (the download system accepts zip) */
function wavBytes(buf){const ch=Math.min(2,buf.numberOfChannels),n=buf.length,sr=buf.sampleRate,ab=new ArrayBuffer(44+n*ch*2),dv=new DataView(ab);const ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i))};
  ws(0,'RIFF');dv.setUint32(4,36+n*ch*2,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,ch,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*ch*2,true);dv.setUint16(32,ch*2,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*ch*2,true);
  const d=[];for(let c=0;c<ch;c++)d.push(buf.getChannelData(c));let o=44;for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const v=Math.max(-1,Math.min(1,d[c][i]));dv.setInt16(o,v<0?v*32768:v*32767,true);o+=2}return new Uint8Array(ab)}
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC_T[(c^u8[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function zipStore(name,data){const nm=new TextEncoder().encode(name),crc=crc32(data),sz=data.length;const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,nm.length,true);
  const cd=new DataView(new ArrayBuffer(46));cd.setUint32(0,0x02014b50,true);cd.setUint16(4,20,true);cd.setUint16(6,20,true);cd.setUint32(16,crc,true);cd.setUint32(20,sz,true);cd.setUint32(24,sz,true);cd.setUint16(28,nm.length,true);
  const off=30+nm.length+sz,cdLen=46+nm.length;const end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,1,true);end.setUint16(10,1,true);end.setUint32(12,cdLen,true);end.setUint32(16,off,true);
  const out=new Uint8Array(off+cdLen+22);let p=0;const put=u=>{out.set(u,p);p+=u.length};put(new Uint8Array(lh.buffer));put(nm);put(data);put(new Uint8Array(cd.buffer));put(nm);put(new Uint8Array(end.buffer));return out}

/* ================= world scenes ================= */
function drawCaves(g,t,cv){const W=cv.width,H=cv.height;for(let y=0;y<H;y++)px(g,0,y,W,1,['#0c0a18','#120e22','#17122c','#1d1733'][Math.min(3,Math.floor(y/H*4))]);
  const r=rng(31);for(let x=0;x<W;x+=6){const hh=3+Math.floor(r()*H*.3);for(let k=0;k<hh;k++){const w=Math.floor((hh-k)*.22);px(g,x+3-w,k,w*2+1,1,'#2a2248')}}
  for(let x=0;x<W;x+=8){const hh=2+Math.floor(r()*H*.22);for(let k=0;k<hh;k++){const w=Math.floor(k*.28);px(g,x+4-w,H-hh+k,w*2+1,1,'#2a2248')}}
  [[.15,.7],[.4,.82],[.7,.75],[.9,.86],[.55,.3]].forEach(([fx,fy],i)=>{const x=Math.floor(W*fx),y=Math.floor(H*fy),on=Math.sin(t*2+i)>0;const c=i%2?(on?'#6ff8dc':'#3ef0c8'):(on?'#c9b8ff':'#6c5cff');px(g,x,y-4,2,5,c);px(g,x+2,y-2,1,3,c);px(g,x-1,y-1,1,2,c)})}
function drawDesert(g,t,cv){const W=cv.width,H=cv.height,hz=Math.floor(H*.55);for(let y=0;y<hz;y++)px(g,0,y,W,1,['#2a1740','#4a2150','#7a2f4a','#b8503a'][Math.min(3,Math.floor(y/hz*4))]);
  const sx=Math.floor(W*.72),sy=Math.floor(hz*.7),sr=Math.max(4,Math.floor(H*.1));for(let y=-sr;y<=0;y++)for(let x=-sr;x<=sr;x++)if(x*x+y*y<=sr*sr)px(g,sx+x,sy+y,1,1,'#ffb547');
  for(let y=hz;y<H;y++)px(g,0,y,W,1,y%3?'#8a6436':'#9a7040');
  for(let b=0;b<3;b++)for(let x=0;x<W;x++){const y=Math.floor(hz+4+b*6+Math.sin(x*.08+b*2)*2.5);px(g,x,y,1,1,'#b88a4a')}
  [[.15,0],[.85,1]].forEach(([fx],i)=>{const x=Math.floor(W*fx),y=hz+2;px(g,x,y-9,2,10,'#3f6b3a');px(g,x-2,y-6,2,1,'#3f6b3a');px(g,x-2,y-8,1,2,'#3f6b3a');px(g,x+2,y-5,2,1,'#3f6b3a');px(g,x+3,y-7,1,2,'#3f6b3a')});
  for(let i=0;i<6;i++)if(Math.sin(t*3+i)>.6)px(g,(i*23+Math.floor(t*6))%W,hz-2-(i%3),2,1,'rgba(255,220,160,.4)')}
function drawSwamp(g,t,cv){const W=cv.width,H=cv.height,hz=Math.floor(H*.58);for(let y=0;y<hz;y++)px(g,0,y,W,1,['#0b1614','#10201c','#152a25'][Math.min(2,Math.floor(y/hz*3))]);
  const r=rng(17);for(let x=-2;x<W;x+=11){const hh=12+Math.floor(r()*10);px(g,x,hz-hh,2,hh,'#2a2018');px(g,x-3,hz-hh+3,3,1,'#2a2018');px(g,x+2,hz-hh+6,4,1,'#2a2018')}
  for(let y=hz;y<H;y++)px(g,0,y,W,1,y%2?'#17332e':'#1b3a34');for(let i=0;i<14;i++){const x=Math.floor((i*29+t*4)%W),y=hz+2+Math.floor((i*7)%(H-hz-2));px(g,x,y,4,1,'#2b5550')}
  for(let b=0;b<3;b++){const y=Math.floor(hz-6+b*4);const off=Math.floor(t*(3+b))%W;for(let x=0;x<W;x+=3)if(((x+off)%24)<14)px(g,x,y,3,1,'rgba(200,230,215,.10)')}
  for(let i=0;i<7;i++){const x=(W*(.1+.8*((i*.41)%1))+Math.sin(t*.8+i)*5)|0,y=(hz-8+Math.cos(t+i)*5)|0;if(Math.sin(t*3+i)>.2)px(g,x,y,1,1,'#c7ff7a')}}
function drawCastle(g,t,cv){const W=cv.width,H=cv.height,hz=Math.floor(H*.7);for(let y=0;y<hz;y++)px(g,0,y,W,1,['#0f0c22','#161230','#1c173c'][Math.min(2,Math.floor(y/hz*3))]);
  const r=rng(5);for(let i=0;i<18;i++){const x=Math.floor(r()*W),y=Math.floor(r()*hz*.5);if(Math.sin(t*2+i)>-.2)px(g,x,y,1,1,'#8a7fa8')}
  const wall='#3d3658';px(g,0,Math.floor(H*.35),W,H,wall);for(let x=0;x<W;x+=6)px(g,x,Math.floor(H*.35)-3,3,3,wall);
  [[.2,.18],[.5,.08],[.8,.18]].forEach(([fx,fy])=>{const x=Math.floor(W*fx),y=Math.floor(H*fy);px(g,x-5,y,11,H,'#4a4468');for(let k=-5;k<6;k+=3)px(g,x+k,y-2,2,2,'#4a4468');const on=Math.sin(t*1.5+x)>-.5;px(g,x-1,y+5,3,4,on?'#ffb547':'#8a5a1a')});
  for(let k=0;k<3;k++){const x=Math.floor(W*(.2+k*.3));const wv=Math.floor(Math.sin(t*4+k)*1.5);px(g,x+6,Math.floor(H*.4),1,10,'#8a7fa8');px(g,x+7,Math.floor(H*.4)+wv,5,4,k===1?'#ff4f9a':'#a98bff')}
  for(let y=hz;y<H;y++)px(g,0,y,W,1,y%3?'#2a2644':'#2d2848')}
function drawSkyScene(g,t,cv){const W=cv.width,H=cv.height;for(let y=0;y<H;y++)px(g,0,y,W,1,['#101a40','#16245a','#1f3070','#2a3a7a','#39458a'][Math.min(4,Math.floor(y/H*5))]);
  const r=rng(9);for(let i=0;i<24;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H*.6);if(Math.sin(t*2+i*1.3)>0)px(g,x,y,1,1,'#f1e7d0')}
  for(let i=0;i<5;i++){const x=Math.floor((i*31+t*(2+i%3))%(W+20))-10,y=Math.floor(H*(.35+(i%3)*.15));px(g,x,y,14,3,'#8e9ad6');px(g,x+3,y-2,8,2,'#b8c2f0')}
  const ix=Math.floor(W*.5),iy=Math.floor(H*.75+Math.sin(t)*1.5);px(g,ix-16,iy,32,3,'#4a3f6a');px(g,ix-12,iy+3,24,2,'#3a3058');px(g,ix-7,iy+5,14,2,'#2d2548');px(g,ix-10,iy-2,20,2,'#6fd36a')}
const WSCENE={forest:(g,t,c)=>drawForest(g,t,c,{seed:6}),caves:drawCaves,desert:drawDesert,volcano:drawLava,swamp:drawSwamp,castle:drawCastle,sky:drawSkyScene};
function arenaFor(w){const sc=WSCENE[w]||WSCENE.forest;return(g,t,cv)=>{sc(g,t,cv);if(w==='forest'){const W=cv.width,H=cv.height;for(let x=0;x<W;x++){const y=Math.floor(H*.8+Math.sin(x*.2)*1.5);px(g,x,y,1,H-y,x%2?'#1b3122':'#1d3525')}}}}

/* ================= more monsters ================= */
const SPIDER=["k...k....k...k",".k...k..k...k.","..k..kkkk..k..","...kssssssk...","kk.kswsswsk.kk","..kssssssssk..",".k.kssssssk.k.","k...kssssk...k","...k.kkkk.k...","..k........k.."];
const GHOST=["...kkkkkk...","..kggggggk..",".kggggggggk.",".kgwkggwkgk.",".kgwkggwkgk.",".kggggggggk.",".kgggkkgggk.",".kggggggggk.",".kggggggggk.",".kgkgkkgkgk.",".kk.k..k.kk."];
const DRAGON=["......kk....kk..",".....kyk...kyk..","....kgggkkkgggk.","...kgggggggggggk","..kggwkgggggwkgk",".kgggggggggggggk","kgggkkkkkkkggggk","kggkykykykykggk.",".kgggggggggggk..","..kgggbbbbgggk..",".kggkbbbbbbkggk.","kggk.kbbbbk.kggk","kkk..kgkkgk..kkk",".....kk..kk....."];
const WORM=["..........kkkk..",".........kgwgk..","..kkkk...kgggk..",".kggggk..kgggk..","kggkkggk.kgggk..","kgk..kggkkggk...","kgk...kggggk....",".k.....kkkk....."];
const K_='#140d1f';
Object.assign(MONS,{
  noisebat:{name:'Noise Bat',spr:BAT,pal:{k:K_,b:'#8a8aa0',w:'#ffffff'},sc:5,world:'caves',problem:'Screeches random pitches.',weak:'Hearing melody direction'},
  spider:{name:'Frequency Spider',spr:SPIDER,pal:{k:K_,s:'#3ef0c8',w:'#ff4f9a'},sc:5,world:'caves',problem:'Weaves happy and sad chords together.',weak:'Major versus minor'},
  wisp:{name:'Wave Wisp',spr:GHOST,pal:{k:K_,g:'#ffb0d8',w:K_},sc:5,world:'caves',problem:'Changes shape between sine and saw.',weak:'Waveforms'},
  larva:{name:'Filter Larva',spr:WORM,pal:{k:K_,g:'#a98bff',w:K_},sc:5,world:'caves',problem:'Wobbles and darkens every sound.',weak:'Envelopes, filters and LFOs'},
  ghost:{name:'Oscillator Ghost',spr:GHOST,pal:{k:K_,g:'#bfe3ff',w:K_},sc:5,world:'caves',problem:'A wailing tone with a hidden shape.',weak:'Waveforms and filters'},
  dragon:{name:'The Synth Dragon',spr:DRAGON,pal:{k:K_,g:'#6c5cff',b:'#a98bff',y:'#ffe27a',w:'#ff4f9a'},sc:5,world:'caves',problem:'Roars chords and bends its own sound.',weak:'Harmony and sound design'},
  worm:{name:'Frequency Worm',spr:WORM,pal:{k:K_,g:'#d9a441',w:K_},sc:5,world:'desert',problem:'Burrows into one frequency range.',weak:'Frequency ranges'},
  harsh:{name:'Harshness Demon',spr:GOBLIN,pal:{k:K_,g:'#ff4f5a',w:'#ffffff',c:'#5a1020',y:'#ffe27a'},sc:5,world:'desert',problem:'Screams in the upper mids.',weak:'Cutting harsh frequencies'},
  blob:{name:'Bass Blob',spr:SLIME,pal:{k:K_,g:'#6a4a8a',d:'#3a2a5a',w:'#ffe27a'},sc:5,world:'desert',problem:'Smothers the kick with bass.',weak:'Masking'},
  mud:{name:'Mud Monster',spr:SLIME,pal:{k:K_,g:'#7a5a34',d:'#4a3420',w:'#ffe27a'},sc:5,world:'desert',problem:'Too much low-mid and rumble.',weak:'EQ cuts and high-pass filters'},
  king:{name:'The Spectrum King',spr:BEAST,pal:{k:K_,r:'#c9a227',w:'#ffffff',y:'#a98bff'},sc:5,world:'desert',problem:'Every frequency out of balance.',weak:'EQ and masking'},
  squash:{name:'Squashed Sound Monster',spr:SLIME,pal:{k:K_,g:'#ff7a3a',d:'#b84a1a',w:'#ffffff'},sc:5,world:'volcano',problem:'Crushed flat by too much compression.',weak:'Gentle compression'},
  ogre:{name:'Dynamic Ogre',spr:GOBLIN,pal:{k:K_,g:'#6a8a5a',w:'#ffffff',c:'#3a2a20',y:'#ff5a2a'},sc:5,world:'volcano',problem:'Punches in huge volume swings.',weak:'Threshold and attack'},
  titan:{name:'The Dynamic Titan',spr:BEAST,pal:{k:K_,r:'#5a2a1a',w:'#ffe27a',y:'#ff5a2a'},sc:5,world:'volcano',problem:'Every dynamic problem at once.',weak:'All four compressor controls'},
  echo:{name:'Echo Ghost',spr:GHOST,pal:{k:K_,g:'#3ef0c8',w:K_},sc:5,world:'swamp',problem:'Hides in rooms and halls.',weak:'Hearing spaces'},
  swisp:{name:'Swamp Wisp',spr:GHOST,pal:{k:K_,g:'#9ab8a8',w:K_},sc:5,world:'swamp',problem:'Floats near, then far.',weak:'Depth'},
  toad:{name:'Delay Toad',spr:BUG,pal:{k:K_,a:'#8fbf3a',b:'#4a6a2a',w:'#ffe27a'},sc:5,world:'swamp',problem:'Croaks echoes out of time.',weak:'Tempo-synced delay'},
  phantom:{name:'Mud Phantom',spr:GHOST,pal:{k:K_,g:'#7a5a34',w:K_},sc:5,world:'swamp',problem:'Drowns everything in reverb.',weak:'Wet, decay and pre-delay'},
  echoking:{name:'The Echo King',spr:BEAST,pal:{k:K_,r:'#2b5550',w:'#ffffff',y:'#6cb8ff'},sc:5,world:'swamp',problem:'Endless echoes and oceans of space.',weak:'Reverb and delay'},
  imp:{name:'Clipper Imp',spr:GOBLIN,pal:{k:K_,g:'#ff4f9a',w:'#ffffff',c:'#4a1030',y:'#ffe27a'},sc:5,world:'castle',problem:'Pushes every fader to the top.',weak:'Balance and headroom'},
  sprite2:{name:'Pan Sprite',spr:GNAT,pal:{w:'#e8d8ff',k:K_,g:'#a98bff',e:'#ffe27a',d:'#6c5cff'},sc:5,world:'castle',problem:'Darts from ear to ear.',weak:'Stereo position'},
  page:{name:'Automaton Page',spr:METRO,pal:{k:K_,b:'#4a5a7a',y:'#6cb8ff',r:'#ffb547'},sc:5,world:'castle',problem:'Never moves a single knob.',weak:'Automation'},
  hall:{name:'The Crowded Hall',spr:METRO,pal:{k:K_,b:'#4a4460',y:'#ffb547',r:'#ff4f9a'},sc:5,world:'castle',problem:'Everyone loud, everyone in the middle.',weak:'Balance and panning'},
  lord:{name:'The Mixing Lord',spr:BEAST,pal:{k:K_,r:'#4a3f6a',w:'#ffffff',y:'#ffb547'},sc:5,world:'castle',problem:'A mix with every problem you know.',weak:'Everything about mixing'},
  harpy:{name:'Clip Harpy',spr:BAT,pal:{k:K_,b:'#ff4f5a',w:'#ffffff'},sc:5,world:'sky',problem:'Screams past 0 dB.',weak:'Headroom'},
  nimbus:{name:'Cloud Wraith',spr:GHOST,pal:{k:K_,g:'#e8eeff',w:K_},sc:5,world:'sky',problem:'Makes quiet songs seem loud.',weak:'Loudness and LUFS'},
  comet:{name:'Crush Comet',spr:SLIME,pal:{k:K_,g:'#bfe3ff',d:'#6cb8ff',w:'#ffffff'},sc:5,world:'sky',problem:'Slams every master into the ceiling.',weak:'Limiting'},
  golem:{name:'The Loudness Golem',spr:METRO,pal:{k:K_,b:'#6d6590',y:'#ff4f5a',r:'#ffe27a'},sc:5,world:'sky',problem:'Crushed, clipped and too loud.',weak:'Clipping and limiting'},
  master:{name:'The Master',spr:BEAST,pal:{k:K_,r:'#f1e7d0',w:K_,y:'#ffcc4d'},sc:5,world:'sky',problem:'Tests everything you have learned.',weak:'Every skill'}});
['spider','ghost','dragon','worm','mud','harsh','king','ogre','titan','echo','phantom','echoking','lord','master','noisebat'].forEach(k=>{});
