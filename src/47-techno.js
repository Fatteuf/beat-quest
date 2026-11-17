/* =====================================================================
   TECHNO ENGINE — 909-style voices, rumble, swing and the techno styles
   (Techno Bunker world, Bunker Box, Ear Gym and studio)
   ===================================================================== */
const TCURVES={};
function tcurve(k){k=Math.round(clamp(k,0,1)*20)/20;if(!TCURVES[k]){const n=1024,c=new Float32Array(n),a=1+k*12;for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(a*x)/Math.tanh(a)}TCURVES[k]=c}return TCURVES[k]}
/* MPC-style swing: 50% = straight, every second 16th moves later (66% ≈ triplet) */
const swingDelay=(sw,spb)=>(2*clamp(sw,50,75)/100-1)*spb;
const gcd=(a,b)=>b?gcd(b,a%b):a;
const TV={
  kick(t,v,d,drive){const c=AC();d=d||OUT();const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(175,t);o.frequency.exponentialRampToValueAtTime(72,t+.03);o.frequency.exponentialRampToValueAtTime(47,t+.13);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.003);g.gain.setTargetAtTime(v*.62,t+.02,.07);g.gain.setTargetAtTime(.0001,t+.16,.1);o.connect(g);
    if(drive>0){const ws=c.createWaveShaper(),pg=c.createGain();ws.curve=tcurve(drive);pg.gain.value=1/(1+drive*.5);g.connect(ws);ws.connect(pg);pg.connect(d)}else g.connect(d);
    o.start(t);o.stop(t+.75);noiseHit(t,.012,v*.32,'highpass',3200,.7,d)},
  clap(t,v,d){[0,.012,.024].forEach((o,i)=>noiseHit(t+o,.014,v*(2.2-i*.3),'bandpass',1150,1.3,d));noiseHit(t+.034,.22,v*1.5,'bandpass',1100,1,d)},
  chat(t,v,d){noiseHit(t,.045,v*.22,'highpass',8200,.8,d)},
  ohat(t,v,d){noiseHit(t,.26,v*.16,'highpass',7200,.7,d);noiseHit(t,.2,v*.21,'bandpass',10500,1.2,d)},
  ride(t,v,d){const c=AC();d=d||OUT();const hp=c.createBiquadFilter(),g=c.createGain();hp.type='highpass';hp.frequency.value=5200;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*.075,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.85);hp.connect(g);g.connect(d);
    [263,400,421,474,587,845].forEach(f=>{const o=c.createOscillator();o.type='square';o.frequency.value=f*1.7;o.connect(hp);o.start(t);o.stop(t+.9)});noiseHit(t,.3,v*.08,'highpass',9500,.7,d)},
  tom(t,v,f,d){const c=AC();d=d||OUT();const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.5,t);o.frequency.exponentialRampToValueAtTime(f,t+.07);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*.5,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.34);o.connect(g);g.connect(d);o.start(t);o.stop(t+.36);noiseHit(t,.03,v*.28,'bandpass',f*5,1.2,d)},
  hand(t,v,f,dec,d){const c=AC();d=d||OUT();const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(f*1.18,t);o.frequency.exponentialRampToValueAtTime(f,t+.02);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*.5,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dec);o.connect(g);g.connect(d);o.start(t);o.stop(t+dec+.02);noiseHit(t,.016,v*.6,'bandpass',f*7,1.6,d)},
  conga(t,v,d,hi){TV.hand(t,v,hi?262:196,.22,d)},
  bongo(t,v,d,hi){TV.hand(t,v,hi?523:392,.12,d)},
  rim(t,v,d){tone(t,'square',1700,.03,v*.14,null,d);tone(t,'triangle',820,.035,v*.25,null,d);noiseHit(t,.02,v*.42,'bandpass',3400,2,d)},
  shaker(t,v,d){noiseHit(t,.07,v*.5,'bandpass',7000,1.2,d)},
  cowbell(t,v,d){const c=AC();d=d||OUT();const bp=c.createBiquadFilter(),g=c.createGain();bp.type='bandpass';bp.frequency.value=2640;bp.Q.value=1.5;g.gain.setValueAtTime(v*.22,t);g.gain.exponentialRampToValueAtTime(.0001,t+.3);bp.connect(g);g.connect(d);[540,800].forEach(f=>{const o=c.createOscillator();o.type='square';o.frequency.value=f;o.connect(bp);o.start(t);o.stop(t+.32)})},
  /* offbeat bass: pluck (short), reverse (swells into the next kick, like a kick tail played backwards), rolling (short 16ths) */
  bass(t,v,m,mode,dur,d){const c=AC();d=d||OUT();const f=midiF(m);const o=c.createOscillator(),s=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain(),ws=c.createWaveShaper(),sg=c.createGain();
    o.type='sawtooth';s.type='sine';o.frequency.value=f;s.frequency.value=f;lp.type='lowpass';lp.Q.value=2;ws.curve=tcurve(.45);sg.gain.value=.8;s.connect(sg);sg.connect(g);o.connect(lp);lp.connect(ws);ws.connect(g);g.connect(d);
    if(mode==='reverse'){const end=t+dur;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v*.85,end-.012);g.gain.linearRampToValueAtTime(.0001,end);lp.frequency.setValueAtTime(140,t);lp.frequency.exponentialRampToValueAtTime(1400,end-.01);
      [o,s].forEach(x=>{x.frequency.setValueAtTime(f,end-dur*.2);x.frequency.exponentialRampToValueAtTime(f*1.9,end)})}
    else{const len=mode==='rolling'?Math.min(dur,.13):Math.min(dur,.17);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*.48,t+.004);g.gain.setTargetAtTime(.0001,t+len*.5,len/3);lp.frequency.setValueAtTime(mode==='rolling'?900:2400,t);lp.frequency.exponentialRampToValueAtTime(160,t+len)}
    o.start(t);s.start(t);o.stop(t+dur+.1);s.stop(t+dur+.1)},
  /* a short minor-chord stab: the "hit" of hard bounce, the chord stab of Detroit */
  hit(t,v,m,d){const c=AC();d=d||OUT();const lp=c.createBiquadFilter(),g=c.createGain();lp.type='lowpass';lp.Q.value=4;lp.frequency.setValueAtTime(5200,t);lp.frequency.exponentialRampToValueAtTime(700,t+.13);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*.14,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.16);lp.connect(g);g.connect(d);
    [0,3,7,12].forEach((iv,k)=>{const o=c.createOscillator();o.type=k%2?'square':'sawtooth';o.frequency.value=midiF(m+iv);o.detune.value=(k-1.5)*6;o.connect(lp);o.start(t);o.stop(t+.18)})}};
/* 303-style voice: one oscillator through a resonant low-pass; slides glide without retriggering the envelope */
function acidVoice(t,steps,spb,midis,P,acc,d){const c=AC();d=d||OUT();const o=c.createOscillator(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';f1.type=f2.type='lowpass';f1.Q.value=.7+P.reso*19;f2.Q.value=.5;o.connect(f1);f1.connect(f2);f2.connect(g);g.connect(d);
  const base=60*Math.pow(60,P.cut),amt=P.env*5200*(acc?1+P.accent*.7:1),dec=(.06+P.dec*.9)*(acc?.6:1),vol=.22*(1-.7*P.reso)*(acc?1+P.accent*.8:1);
  midis.forEach((m,k)=>{const tt=t+k*spb;if(k===0)o.frequency.setValueAtTime(midiF(m),tt);else o.frequency.setTargetAtTime(midiF(m),tt-.012,.018)});
  [f1,f2].forEach(f=>{f.frequency.setValueAtTime(Math.min(18000,base+amt),t);f.frequency.setTargetAtTime(base,t+.004,dec/3)});
  const end=t+steps*spb*.92;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.003);g.gain.setValueAtTime(vol*.85,end-.01);g.gain.linearRampToValueAtTime(.0001,end);o.start(t);o.stop(end+.05)}
const BASS_ST=[0,0,3,5,7,10,12];
function acidStep(a,s,t,spb,d){const i=s%16,n=a.notes[i];if(!n)return;const p=(i+15)%16;if(a.sl[p]&&a.notes[p]&&(i>0||s>0))return;
  let k=1;while(k<16&&a.sl[(i+k-1)%16]&&a.notes[(i+k)%16])k++;const ms=[];for(let j=0;j<k;j++)ms.push(a.root+BASS_ST[a.notes[(i+j)%16]]);acidVoice(t,k,spb,ms,a,a.acc[i],d)}
/* ================= the synth tracks of the studio Bunker Box =================
   st.syn = {syn1:{snd,oct,clip}, syn2:{…}}. A clip is one bar of MIDI notes [step, semitones above the track base, length in steps, velocity];
   the base is the bass root plus the sound's register, so the synths always follow the key of the loaded style.
   Lessons never get st.syn, so they sound exactly as before. */
const SYN_KEYS=['syn1','syn2'],SYN_DEG=[0,2,3,5,7,8,10,12],SYN_SCALE=[0,2,3,5,7,8,10,12,14,15,17,19,20,22,24];
const SYN_SOUNDS={
  stab:{n:'STAB',c:'#ff5a2a',base:24,dl:1,tip:'STAB: one note plays a short minor chord, the hit of Detroit techno and hard bounce. Stack notes in the piano roll to play your own chord.'},
  lead:{n:'LEAD',c:'#6cb8ff',base:36,dl:2,v:.32,patch:()=>PRESETS.LEAD,tip:'LEAD: a bright detuned saw.'},
  pad:{n:'PAD',c:'#8fbf3a',base:24,dl:4,triad:true,v:.12,patch:()=>PRESETS.PAD,tip:'PAD: one note plays the soft chord of the scale built on it. Stack notes in the piano roll to play your own chord.'},
  pluck:{n:'PLUCK',c:'#ffcc4d',base:36,dl:1,v:.32,patch:()=>PRESETS.PLUCK,tip:'PLUCK: short and percussive, for fast riffs.'},
  acid:{n:'ACID',c:'#ffe27a',base:12,dl:1,tip:'ACID: the 303 squelch, an octave above the bass. Hard notes (velocity 110 and up) are accented.'},
  mine:{n:'MY SYNTH',short:'MINE',c:'#a98bff',base:24,dl:2,v:.3,need:'synth',patch:()=>S.leadPatch||PRESETS.LEAD,tip:'MY SYNTH: the sound you designed in EDIT LEAD SOUND.'}};
const SYN_ACID={cut:.3,reso:.72,env:.6,dec:.3,accent:.6};
/* ready-made synth parts; degrees: 1 root, 2 second, 3 minor third, 4 fourth, 5 fifth, 6 minor sixth, 7 minor seventh, 8 octave */
const SYN_IDEAS=[{n:'DETROIT STABS',why:'minor chord stabs on the offbeats, answering the kick.',syn1:{snd:'stab',notes:{2:1,6:1,10:1,13:4}},syn2:{snd:'pad',notes:{}}},
  {n:'240 HITS',why:'one short hit on the beat and nothing else. The space is the hook.',syn1:{snd:'stab',notes:{0:1}},syn2:{snd:'pad',notes:{}}},
  {n:'ACID RIFF',why:'a 303 riff on the root, jumping to the octave and the minor third.',syn1:{snd:'acid',notes:{0:1,2:1,3:8,5:1,7:3,8:1,10:6,11:1,13:5,14:3}},syn2:{snd:'pad',notes:{}}},
  {n:'DARK PAD',why:'chords moving from the root to the minor sixth: dark and wide under the drums.',syn1:{snd:'stab',notes:{}},syn2:{snd:'pad',notes:{0:1,8:6}}},
  {n:'SIGH LEAD',why:'a lead falling from the minor sixth to the fifth, the classic minor sigh, over the dark pad.',syn1:{snd:'lead',notes:{0:1,4:3,8:6,12:5}},syn2:{snd:'pad',notes:{0:1,8:6}}}];
const synNew=()=>({syn1:{snd:'stab',oct:0,clip:[]},syn2:{snd:'pad',oct:0,clip:[]}});
const synOk=x=>Array.isArray(x)&&x.length===4&&x.every(Number.isFinite)&&x[0]>=0&&x[0]<16&&x[1]>=-12&&x[1]<=12&&x[2]>=1&&x[0]+x[2]<=16&&x[3]>=1&&x[3]<=127;
/* scale degrees on 16 steps (the 2.5 format and the ideas) → clip notes; a note lasts until the next one, up to what that sound used to hold */
function degToClip(arr,snd){const hold={lead:2,pad:16,mine:4}[snd]||1,out=[];arr.forEach((d,i)=>{d=Math.round(+d||0);if(d<1||d>8)return;let l=1;if(hold>1)while(l<hold&&i+l<16&&!arr[i+l])l++;out.push([i,SYN_DEG[d-1],l,100])});return out}
function synClean(o){const n=synNew();SYN_KEYS.forEach(k=>{const T=o&&o[k];if(!T)return;if(SYN_SOUNDS[T.snd])n[k].snd=T.snd;n[k].oct=clamp(Math.round(+T.oct||0),-1,1);
  if(Array.isArray(T.clip))n[k].clip=dedupeNotes(T.clip.map(x=>Array.isArray(x)?x.map(v=>Math.round(+v)):x).filter(synOk));else if(Array.isArray(T.notes)&&T.notes.length===16)n[k].clip=degToClip(T.notes,n[k].snd)});return n}
const synBase=(st,T)=>st.root+(SYN_SOUNDS[T.snd]||SYN_SOUNDS.stab).base+12*(T.oct||0);
/* one note of the stab sound, for chords written note by note */
function stabOne(t,v,m,d){const c=AC();d=d||OUT();const lp=c.createBiquadFilter(),g=c.createGain();lp.type='lowpass';lp.Q.value=4;lp.frequency.setValueAtTime(5200,t);lp.frequency.exponentialRampToValueAtTime(700,t+.13);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(v*.12,.0002),t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.16);lp.connect(g);g.connect(d);
  [0,12].forEach((iv,k)=>{const o=c.createOscillator();o.type=k?'square':'sawtooth';o.frequency.value=midiF(m+iv);o.connect(lp);o.start(t);o.stop(t+.18)})}
/* play the notes that start together, [[midi note, length in steps, velocity], …]; with STAB and PAD one note means a whole chord */
function synPlay(st,T,list,t,d){const P=SYN_SOUNDS[T.snd]||SYN_SOUNDS.stab,spb=60/st.bpm/4,one=list.length===1;
  if(T.snd==='stab'){list.forEach(([m,,v])=>one?TV.hit(t,v/100,m,d):stabOne(t,v/100,m,d));return}
  if(T.snd==='acid'){list.forEach(([m,l,v])=>acidVoice(t,l,spb,[m],SYN_ACID,v>=110,d));return}
  const out=[];list.forEach(([m,l,v])=>{const dur=l*spb*.95;if(P.triad&&one){const dg=MINOR.indexOf(((m-st.root)%12+12)%12);(dg>=0?[0,2,4].map(j=>SYN_SCALE[dg+j]-SYN_SCALE[dg]):[0,3,7]).forEach(x=>out.push([m+x,dur,v]))}else out.push([m,dur,v])});
  withRoute(d,()=>out.forEach(([m,dur,v])=>SV(t,midiF(m),dur,P.patch(),P.v*v/100)))}
function synStep(st,k,s,t,d){const T=st.syn&&st.syn[k];if(!T||!T.clip||!T.clip.length)return;const i=s%16,b=synBase(st,T),here=T.clip.filter(n=>n[0]===i);if(here.length)synPlay(st,T,here.map(n=>[b+n[1],n[2],n[3]]),t,d)}
/* rumble: kick → dark reverb → low-pass → duck (on every kick) → drive */
function rumbleChain(c,dest){const inp=c.createGain(),pre=c.createBiquadFilter(),cv=c.createConvolver(),lp=c.createBiquadFilter(),hp=c.createBiquadFilter(),ws=c.createWaveShaper(),dk=c.createGain(),out=c.createGain();
  pre.type='lowpass';pre.frequency.value=350;lp.type='lowpass';lp.Q.value=1.1;hp.type='highpass';hp.frequency.value=32;inp.connect(pre);pre.connect(cv);cv.connect(lp);lp.connect(hp);hp.connect(ws);ws.connect(dk);dk.connect(out);out.connect(dest);
  const R={inp,out,P:{amt:0,dec:2.4,cut:140,duck:.85,drive:.35,rel:.18},irDec:0,
    set(p){Object.assign(R.P,p);const q=R.P;if(Math.abs(R.irDec-q.dec)>.05){R.irDec=q.dec;cv.buffer=makeIR(c,q.dec,1800,0)}lp.frequency.value=q.cut;ws.curve=tcurve(q.drive);out.gain.value=q.amt*.45/(1+q.drive*2.5)},
    duck(t,beat){const q=R.P;if(q.amt<=0)return;dk.gain.cancelScheduledValues(t);dk.gain.setValueAtTime(Math.max(.02,1-q.duck),t);dk.gain.setTargetAtTime(1,t+.02,Math.max(.02,beat*q.rel))}};
  R.set({});return R}
/* ================= the 14 tracks of the Bunker Box ================= */
const TT={kick:{n:'KICK',c:'#ffb547'},clap:{n:'CLAP',c:'#ff4f9a'},chat:{n:'CL HAT',c:'#3ef0c8'},ohat:{n:'OP HAT',c:'#8ff7e4'},ride:{n:'RIDE',c:'#b8c2f0'},ltom:{n:'LO TOM',c:'#ff7a3a'},htom:{n:'HI TOM',c:'#ffa25a'},
  conga:{n:'CONGA',c:'#d9a441'},bongo:{n:'BONGO',c:'#f0d27a'},rim:{n:'RIM',c:'#c9b8ff'},shaker:{n:'SHAKER',c:'#8fbf3a'},cowbell:{n:'COWBELL',c:'#ffe27a'},bass:{n:'BASS',c:'#a98bff'},hit:{n:'HIT',c:'#ff5a2a'}};
const TT_ORDER=Object.keys(TT);
const BASSN={pluck:'PLUCK',reverse:'REVERSE',rolling:'ROLLING'};
function mkSt(o){const st={bpm:132,swing:50,rumble:0,drive:0,kdrive:0,bassMode:'pluck',root:33,pat:{},len:{},vol:{},acid:null};TT_ORDER.forEach(k=>{st.pat[k]=new Array(16).fill(0);st.len[k]=16});
  for(const k in o||{}){const v=o[k];if(k==='pat'){for(const tk in v){const x=v[tk];if(Array.isArray(x))x.forEach(i=>{if(Array.isArray(i))st.pat[tk][i[0]]=i[1];else st.pat[tk][i]=1});else for(const i in x)st.pat[tk][+i]=x[i]}}
    else if(k==='len'||k==='vol')Object.assign(st[k],v);else st[k]=v}return st}
function bunkerGraph(c,dest){const G={c,bus:{},mix:c.createGain(),kdry:c.createGain(),drive:c.createWaveShaper(),post:c.createGain()};G.mix.connect(G.drive);G.drive.connect(G.post);if(dest)G.post.connect(dest);
  TT_ORDER.concat(['acid'],SYN_KEYS).forEach(k=>{const g=c.createGain();if(k!=='kick')g.connect(G.mix);G.bus[k]=g});G.bus.kick.connect(G.kdry);G.kdry.connect(G.mix);
  G.rum=rumbleChain(c,G.mix);G.bus.kick.connect(G.rum.inp);
  G.set=st=>{G.drive.curve=st.drive>0?tcurve(st.drive*.7):null;G.post.gain.value=1/(1+(st.drive||0)*1.1);for(const k of TT_ORDER.concat(SYN_KEYS))G.bus[k].gain.value=(st.vol&&st.vol[k]!=null?st.vol[k]:1)*(st.mute&&st.mute[k]?0:1);G.kdry.gain.value=st.soloRumble?0:1;
    G.rum.set({amt:st.rumble||0,dec:st.rdec||2.4,cut:st.rcut||140,duck:st.rduck==null?.85:st.rduck,drive:st.rdrive==null?.35:st.rdrive})};return G}
function tvoice(st,k,val,t,G,i){const d=G.bus[k],v=val===2?.42:1,spb=60/st.bpm/4;
  switch(k){case'kick':TV.kick(t,.95*v,d,st.kdrive||0);G.rum.duck(t,spb*4);break;case'clap':TV.clap(t,v,d);break;case'chat':TV.chat(t,v,d);break;case'ohat':TV.ohat(t,v,d);break;case'ride':TV.ride(t,v,d);break;
    case'ltom':TV.tom(t,v,98,d);break;case'htom':TV.tom(t,v,156,d);break;case'conga':TV.conga(t,v,d,i%4>=2);break;case'bongo':TV.bongo(t,v,d,i%2===1);break;case'rim':TV.rim(t,v,d);break;case'shaker':TV.shaker(t,v,d);break;case'cowbell':TV.cowbell(t,v,d);break;
    case'bass':{const dur=st.bassMode==='reverse'?(4-(i%4))*spb-.004:st.bassMode==='rolling'?spb*.92:spb*1.7;TV.bass(t,.9,st.root+BASS_ST[val],st.bassMode,dur,d);break}
    case'hit':TV.hit(t,v,st.root+24,d);break}}
function technoStep(st,s,t,G){const spb=60/st.bpm/4,i=s%16,tt=t+(s%2?swingDelay(st.swing,spb):0);
  if(st.stopReq&&i===0){st.stopReq=false;st.stopUntil=s+16}const stopped=st.stopUntil!=null&&s<st.stopUntil;
  for(const k of TT_ORDER){const L=st.len[k]||16,val=st.pat[k][s%L];if(!val||stopped&&(k==='kick'||k==='bass'))continue;tvoice(st,k,val,tt,G,i)}
  if(st.acid&&st.acid.on!==false)acidStep(st.acid,s,t,spb,G.bus.acid);
  if(st.syn)for(const k of SYN_KEYS)synStep(st,k,s,tt,G.bus[k])}
function playStyle(dest,st,bars){const c=AC(),G=bunkerGraph(c,dest);G.set(st);const spb=60/st.bpm/4,t0=now()+.06;for(let s=0;s<16*(bars||2);s++)technoStep(st,s,t0+s*spb,G)}
let LGR=null;function LG(){initAudio();if(!A.ctx)return null;if(!LGR||LGR.c!==A.ctx)LGR=bunkerGraph(A.ctx,A.bus);return LGR}
/* A/B items for abWidget built from two Bunker states */
const abSt=(st,label,note)=>({label,note,bpm:st.bpm,play:(s,t)=>{const G=LG();if(!G)return;if(s===0)G.set(st);technoStep(st,s,t,G)}});

/* ================= the styles (researched presets) ================= */
const ODD=[1,3,5,7,9,11,13,15],OFF=[2,6,10,14],BEATS=[0,4,8,12],ALL16=[...Array(16).keys()],g2=a=>a.map(i=>[i,2]);
const STYLES={
  detroit:{name:'DETROIT',bpm:'125–130',make:()=>mkSt({bpm:128,swing:55,root:36,pat:{kick:BEATS,clap:[4,12],chat:ODD,ohat:OFF,rim:[3,10],bass:{2:1,6:1,10:4,14:5},hit:[3,10]}}),
    why:'Detroit techno: around 125–130 BPM, a swinging 909 groove, an offbeat bass and soulful chord stabs. It all started there in the mid-80s.'},
  hardgroove:{name:'HARDGROOVE',bpm:'135–145',make:()=>mkSt({bpm:140,swing:59,rumble:.3,root:31,pat:{kick:BEATS,clap:[4,12,[7,2]],chat:ODD,ohat:OFF,conga:[3,6,11,[13,2],14],ltom:[2,10],htom:[7,15],rim:[[5,2],13],shaker:g2([0,2,4,6,8,10,12,14])}}),
    why:'Hardgroove: about 135–145 BPM, swung hats and percussion (congas, toms, rims) over a rumbling kick. The name comes from Ben Sims\' Hard Groove Trax tapes of the mid-90s.'},
  tribal:{name:'TRIBAL',bpm:'128–138',make:()=>mkSt({bpm:134,swing:54,rumble:.2,len:{ltom:3,conga:6,cowbell:7},pat:{kick:BEATS,ltom:[0],htom:[6,14],conga:[1,4],bongo:[3,7,[10,2],15],shaker:ALL16.map(i=>[i,i%2?1:2]),ohat:OFF,cowbell:[0]}}),
    why:'Tribal: the drums lead. Toms, congas and bongos loop over different lengths (3, 6 or 7 steps against a 16-step bar), so the groove keeps rolling into new shapes.'},
  bounce:{name:'HARD BOUNCE',bpm:'160+',make:()=>mkSt({bpm:162,drive:.25,bassMode:'reverse',root:33,pat:{kick:BEATS,clap:[4,12],chat:OFF,shaker:g2(ODD),bass:{2:1,6:1,10:1,14:1},hit:[0]}}),
    why:'Hard bounce: 160 BPM and up, a reverse bass swelling into every kick, claps on 2 and 4 and a short hit on the beat. Bright, fast and playful.'},
  hardtechno:{name:'HARD TECHNO',bpm:'145–160',make:()=>mkSt({bpm:150,rumble:.75,kdrive:.6,drive:.35,pat:{kick:BEATS,clap:[4,12],chat:ALL16.map(i=>[i,i%2?2:1]),ohat:OFF,ride:OFF,rim:[7,15]}}),
    why:'Hard techno: about 145–160 BPM, a distorted kick with a heavy rumble and relentless 16th hats. Dark and driving, like German schranz and industrial techno.'},
  acid:{name:'ACID',bpm:'130–140',make:()=>mkSt({bpm:136,swing:52,pat:{kick:BEATS,clap:[4,12],chat:ODD,ohat:OFF},acid:{notes:[1,1,6,1,0,4,1,5,1,0,3,1,6,0,4,2],acc:[1,0,1,0,0,1,0,0,1,0,0,1,1,0,0,0],sl:[0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0],cut:.32,reso:.78,env:.62,dec:.35,accent:.7,root:45}}),
    why:'Acid: a 303-style bass line with a resonant filter, accents and slides squelching over a straight techno beat. It started in Chicago with Phuture\'s "Acid Tracks" (1987).'}};
const styleState=id=>STYLES[id].make();

/* ================= rules a club groove must follow (lessons, bosses, Club Trial) ================= */
/* hits per bar, counting how a shorter loop repeats inside the 16 steps */
const hits=(st,k)=>{const L=st.len[k]||16;return ALL16.filter(s=>st.pat[k][s%L]).length};
const kick4=st=>(st.len.kick||16)===16&&ALL16.every(i=>(st.pat.kick[i]>0)===(i%4===0));
const PERC=['ltom','htom','conga','bongo','rim','shaker','cowbell'];
const oddHits=(st,ks)=>ks.reduce((a,k)=>{const L=st.len[k]||16;return a+(L===16?ODD.filter(i=>st.pat[k][i]).length:0)},0);
const CLUB_RULES={
  hardgroove:{name:'HARDGROOVE',venue:'WAREHOUSE · 2 AM',brief:'Hardgroove for the warehouse: driving, swung and full of percussion.',check:st=>[
    ['Tempo',st.bpm>=135&&st.bpm<=145,`${st.bpm} BPM, hardgroove speed.`,'Hardgroove sits between 135 and 145 BPM.','tgenre'],
    ['Kick',kick4(st),'four on the floor.','Kick on every beat, nothing in between.','pattern'],
    ['Swing',st.swing>=54&&st.swing<=66,`${st.swing}% swing.`,'Swing the 16ths between 54 and 66%.','tswing'],
    ['Percussion',PERC.filter(k=>hits(st,k)>=3).length>=2,'two busy percussion lines.','Give at least two percussion lines 3 hits or more.','tgenre'],
    ['Shuffle',oddHits(st,['chat'].concat(PERC))>=3,'swung 16ths you can hear.','Put 3+ hats or percussion hits on the in-between 16ths so the swing shows.','tswing']]},
  tribal:{name:'TRIBAL',venue:'JUNGLE ROOM · 3 AM',brief:'Tribal techno for the jungle room: drums first, polyrhythms everywhere.',check:st=>{const used=PERC.filter(k=>hits(st,k)>=2);return[
    ['Tempo',st.bpm>=126&&st.bpm<=140,`${st.bpm} BPM, tribal speed.`,'Tribal techno sits around 126–140 BPM.','tgenre'],
    ['Kick',kick4(st),'four on the floor.','Kick on every beat, nothing in between.','pattern'],
    ['Drums',used.length>=3,'three percussion lines or more.','Use at least three percussion lines with 2+ hits each.','poly'],
    ['Polyrhythm',used.some(k=>16%(st.len[k]||16)!==0),'a loop that drifts against the bar.','Set one percussion loop to a length that does not fit 16 (3, 5, 6, 7…).','poly'],
    ['Call & response',(hits(st,'ltom')+hits(st,'htom')>=2)&&(hits(st,'conga')+hits(st,'bongo')>=2),'toms answered by hand drums.','Use toms AND congas or bongos so the drums talk to each other.','poly']]}},
  bounce:{name:'HARD BOUNCE',venue:'240 MAIN STAGE · 5 AM',brief:'Hard bounce for the main stage: fast, bright, and the bass has to bounce.',check:st=>{const hb=ALL16.filter(i=>st.pat.hit[i]);return[
    ['Tempo',st.bpm>=158&&st.bpm<=172,`${st.bpm} BPM, bounce speed.`,'Hard bounce runs at about 160–170 BPM.','tbounce'],
    ['Kick',kick4(st),'four on the floor.','Kick on every beat, nothing in between.','pattern'],
    ['Bounce',OFF.every(i=>st.pat.bass[i])&&BEATS.every(i=>!st.pat.bass[i])&&st.bassMode!=='rolling','a bass on every offbeat.','Bass on all four offbeats (the "and"), never on a kick, in REVERSE or PLUCK mode.','tbounce'],
    ['Clap',st.pat.clap[4]&&st.pat.clap[12],'claps on 2 and 4.','Claps on beats 2 and 4.','pattern'],
    ['Hits',hb.length>0&&hb.every(i=>i%4!==3),'short hits on the grid.','Add a short HIT on a beat, and never on the last 16th before a beat (it clashes with the bass swell).','tbounce']]}}};
const ruleRows=(id,st)=>CLUB_RULES[id].check(st).map(([k,ok,good,bad,tag])=>({k,ok:!!ok,good,bad,tag}));

/* =====================================================================
   BUNKER BOX — techno groovebox (TR-909 / Drum Rack + Groove Pool inspired)
   ===================================================================== */
const BB_LEN=[16,12,8,7,6,5,4,3];
function bunkerRig(host,o){o=o||{};initAudio();const st=o.state||mkSt(o.init);const tracks=o.tracks||TT_ORDER;const show=o.show||[];const ghosts=o.ghosts!==false;
  const pg=plug(host,{name:'BUNKER BOX',type:'TECHNO GROOVEBOX',col:'#ff7a3a',bypass:false,extra:o.presets?'<button class="plug-btn" data-a="pp" aria-label="Previous style">◀</button><span class="chip pname" style="min-width:104px;justify-content:center">STYLES</span><button class="plug-btn" data-a="pn" aria-label="Next style">▶</button>':''});
  const B=pg.body,tip=tipLine(B);if(!A.ctx){B.textContent='Audio is not available here.';return{st,stop(){},paint(){},set(){}}}
  const out=rigOut(),G=bunkerGraph(A.ctx,out.g);const fire=()=>{G.set(st);if(o.onChange)o.onChange(st)};
  const syn=o.synths&&st.syn?SYN_KEYS:[],scells={},snm={};let synPaint=()=>{};
  const top=h('div','row wrap');top.style.cssText='gap:8px;align-items:center';B.append(top);const playB=h('button','btn neon sm','▶ PLAY'),barc=h('span','num','BAR –');barc.style.cssText='font-size:20px;color:var(--dim)';top.append(playB,barc);
  if(show.includes('stop')){const sb=h('button','btn ghost sm','STOP 1 BAR');top.append(sb);sb.onclick=()=>{st.stopReq=true;tip.textContent='Stop: kick and bass drop out for one bar, then slam back in.';if(!seq.on)playB.click();if(o.onStopUsed)o.onStopUsed()}}
  const kr=h('div','krow');B.append(kr);const K={};
  if(!o.lockBpm)K.bpm=knob(kr,{label:'BPM',min:110,max:175,step:1,value:st.bpm,fmt:v=>Math.round(v)+'',col:'#ff7a3a',onTouch:()=>{tip.textContent='Tempo. Detroit ~128 · hardgroove 135–145 · hard techno 145–160 · hard bounce 160+.'},onInput:v=>{st.bpm=Math.round(v);fire()}});
  if(show.includes('swing'))K.swing=knob(kr,{label:'SWING',min:50,max:75,step:1,value:st.swing,fmt:v=>Math.round(v)+'%',col:'#ff4f9a',onTouch:()=>{tip.textContent=`MPC-style swing: 50% is straight; every second 16th moves later. ${st.swing}% = +${Math.round(swingDelay(st.swing,60/st.bpm/4)*1000)} ms at ${st.bpm} BPM.`},onInput:v=>{st.swing=Math.round(v);tip.textContent=`${st.swing}% swing = every second 16th +${Math.round(swingDelay(st.swing,60/st.bpm/4)*1000)} ms late at ${st.bpm} BPM.`;fire()}});
  if(show.includes('rumble'))K.rumble=knob(kr,{label:'RUMBLE',min:0,max:1,value:st.rumble,fmt:v=>Math.round(v*100)+'%',col:'#a98bff',onTouch:()=>{tip.textContent='Rumble: the kick through a dark, filtered reverb, ducked by every kick.'},onInput:v=>{st.rumble=v;fire()}});
  if(show.includes('drive'))K.drive=knob(kr,{label:'DRIVE',min:0,max:1,value:st.drive,fmt:v=>Math.round(v*100)+'%',col:'#ff4f5a',onTouch:()=>{tip.textContent='Drive: saturates the kick and the whole loop. Hard techno pushes it hard.'},onInput:v=>{st.drive=v;st.kdrive=v*.85;fire()}});
  syn.forEach((k,j)=>{K[k]=knob(kr,{label:'SYNTH '+(j+1),min:0,max:1.5,value:st.vol[k]==null?1:st.vol[k],fmt:v=>Math.round(v*100)+'%',col:'#a98bff',onTouch:()=>{tip.textContent=`Synth ${j+1} volume. Keep synths under the kick: the kick still leads.`},onInput:v=>{st.vol[k]=v;fire()}})});
  let bo=()=>{};if(show.includes('bass')){const bs=h('div','seg2');bs.style.setProperty('--pc','#a98bff');bs.innerHTML=['pluck','reverse','rolling'].map(m=>`<button data-m="${m}">BASS: ${BASSN[m]}</button>`).join('');B.append(bs);bo=()=>$$('button',bs).forEach(b=>b.classList.toggle('on',b.dataset.m===st.bassMode));bo();
    $$('button',bs).forEach(b=>b.onclick=()=>{st.bassMode=b.dataset.m;bo();tip.textContent={pluck:'Pluck: a short bass right after each kick, dying away.',reverse:'Reverse: the bass swells into the next kick and cuts just before it.',rolling:'Rolling: short 16th notes between the kicks.'}[st.bassMode];fire()})}
  const gw=h('div','bb');B.append(gw);const hd=h('div','bb-row bb-hd');hd.innerHTML='<span></span>'+ALL16.map(i=>`<span class="${i%4?'':'b'}">${i%4?['','e','&amp;','a'][i%4]:i/4+1}</span>`).join('');gw.append(hd);
  const cells={},lens={};
  tracks.forEach(k=>{const T=TT[k];const row=h('div','bb-row');row.style.setProperty('--rc',T.c);const nm=h('div','bb-nm',`<b style="color:${T.c}">${T.n}</b>`);row.append(nm);
    if(show.includes('len')&&PERC.includes(k)){const lc=h('button','bb-len');lc.setAttribute('aria-label',T.n+' loop length');nm.append(lc);lens[k]=lc;
      lc.onclick=()=>{const L=st.len[k]||16;st.len[k]=BB_LEN[(BB_LEN.indexOf(L)+1)%BB_LEN.length];paint();fire();tip.textContent=st.len[k]===16?`${T.n} loops over the whole bar.`:`${T.n} now loops every ${st.len[k]} steps: ${16%st.len[k]?'a polyrhythm against the 4/4 kick.':'it still fits the bar.'}`}}
    cells[k]=[];const ed=!o.edit||!!o.edit[k];
    ALL16.forEach(i=>{const b=h('button','bb-c'+(i%4===0?' beat':''));b.setAttribute('aria-label',`${T.n} step ${i+1}`);if(!ed)b.classList.add('lockc');
      b.onclick=()=>{if(!ed||i>=(st.len[k]||16))return;const p=st.pat[k];if(k==='bass')p[i]=(p[i]+1)%7;else if(k==='hit'||k==='kick'||!ghosts)p[i]=p[i]?0:1;else p[i]=(p[i]+1)%3;paint();if(p[i])tvoice(st,k,p[i],now()+.01,G,i);haptic(6);fire()};
      cells[k].push(b);row.append(b)});gw.append(row)});
  /* quick entry in the grid: a tap adds the root, each tap moves it up the scale, then clears it (chords and other notes: the piano roll) */
  function synTap(k,i){const T=st.syn[k],here=T.clip.filter(n=>n[0]===i);
    if(!here.length){const nx=T.clip.filter(n=>n[0]>i).reduce((a,n)=>Math.min(a,n[0]),16);T.clip.forEach(n=>{if(n[0]<i&&n[0]+n[2]>i)n[2]=i-n[0]});T.clip.push([i,0,Math.max(1,Math.min((SYN_SOUNDS[T.snd]||SYN_SOUNDS.stab).dl||1,nx-i)),100])}
    else if(here.length===1&&SYN_DEG.includes(here[0][1])&&here[0][1]<12)here[0][1]=SYN_DEG[SYN_DEG.indexOf(here[0][1])+1];
    else T.clip=T.clip.filter(n=>n[0]!==i);
    T.clip.sort((a,b)=>a[0]-b[0]||a[1]-b[1])}
  /* the MIDI piano roll for one synth: any note, length, velocity and chord, in the key of the bass */
  function openSynRoll(k,j){if(seq.on)seq.stop();const T=st.syn[k],P=SYN_SOUNDS[T.snd]||SYN_SOUNDS.stab,b0=synBase(st,T),key=NOTE_NAMES[st.root%12],arr=T.clip.map(n=>[n[0],b0+n[1],n[2],n[3]]);
    pianoRollModal({title:`PIANO ROLL · SYNTH ${j+1} · ${P.n}`,col:P.c,notes:arr,lo:b0-12,hi:b0+12,root:st.root%12,keyName:key+' MINOR',soundLine:P.tip,footer:`The light rows are the notes of ${key} minor, the key of your bass.`,
      hear:(m,v)=>synPlay(st,T,[[m,2,v]],now()+.01,G.bus[k]),bpm:()=>st.bpm,
      play:(s,t,beat)=>{if(beat)technoStep(st,s,t,G);else synStep(st,k,s,t+(s%2?swingDelay(st.swing,60/st.bpm/4):0),G.bus[k])},
      onChange:()=>{T.clip=arr.map(n=>[n[0],n[1]-b0,n[2],n[3]]);paint();fire()},onClose:()=>{paint();fire()}})}
  syn.forEach((k,j)=>{const row=h('div','bb-row syn-r');const nm=h('button','bb-nm syn-nm');nm.setAttribute('aria-label',`Synth ${j+1}: open the piano roll`);nm.onclick=()=>openSynRoll(k,j);snm[k]=nm;row.append(nm);scells[k]=[];
    ALL16.forEach(i=>{const b=h('button','bb-c'+(i%4===0?' beat':''));b.setAttribute('aria-label',`Synth ${j+1} step ${i+1}`);
      b.onclick=()=>{synTap(k,i);paint();if(st.syn[k].clip.some(n=>n[0]===i))synStep(st,k,i,now()+.01,G.bus[k]);haptic(6);fire()};scells[k].push(b);row.append(b)});gw.append(row)});
  if(ghosts)B.append(h('p','muted','Tap a cell to add a hit, tap again for a softer ghost note, a third time to clear.'+(tracks.includes('bass')?' Bass cells cycle through notes.':'')));
  if(syn.length){const sc=sect(B,'SYNTHS','<button class="plug-btn" data-a="sidea">IDEA ▶</button>');
    const rows=syn.map((k,j)=>{const r=h('div','syn-row');r.innerHTML=`<span class="kb-lab">SYNTH ${j+1}</span><div class="seg2">${Object.entries(SYN_SOUNDS).map(([id,P])=>`<button data-s="${id}"${P.need&&!has(P.need)?' disabled':''}>${P.n}</button>`).join('')}</div><span></span><div class="row wrap" style="gap:6px;align-items:center"><button class="plug-btn" data-o="-1" aria-label="Synth ${j+1} octave down">OCT −</button><span class="num syn-oct"></span><button class="plug-btn" data-o="1" aria-label="Synth ${j+1} octave up">OCT +</button><button class="plug-btn syn-roll" data-r="${k}">PIANO ROLL ▶</button></div>`;sc.append(r);
      const hearFirst=()=>{const T=st.syn[k],f=T.clip[0];if(f&&!seq.on)synStep(st,k,f[0],now()+.01,G.bus[k])};
      $$('[data-s]',r).forEach(b=>b.onclick=()=>{const T=st.syn[k];T.snd=b.dataset.s;paint();fire();tip.textContent=SYN_SOUNDS[T.snd].tip;hearFirst()});
      $$('[data-o]',r).forEach(b=>b.onclick=()=>{const T=st.syn[k];T.oct=clamp((T.oct||0)+(+b.dataset.o),-1,1);paint();fire();hearFirst()});
      $('[data-r]',r).onclick=()=>openSynRoll(k,j);return r});
    if(!has('synth'))sc.append(h('p','muted','MY SYNTH unlocks with the Synthesizer (Synth Caves): your own sound, played right here.'));
    sc.append(h('p','muted','Synth cells: a tap adds the root, each new tap moves the note up the minor scale of your bass, then clears it. To pick any note, its length or a chord, tap the synth name or PIANO ROLL.'));
    synPaint=()=>syn.forEach((k,j)=>{const T=st.syn[k];$$('[data-s]',rows[j]).forEach(b=>b.classList.toggle('on',b.dataset.s===T.snd));rows[j].style.setProperty('--pc',(SYN_SOUNDS[T.snd]||SYN_SOUNDS.stab).c);$('.syn-oct',rows[j]).textContent=(T.oct>0?'+':'')+(T.oct||0)});
    let ii=-1;$('[data-a=sidea]',sc).onclick=()=>{ii=(ii+1)%SYN_IDEAS.length;const I=SYN_IDEAS[ii];SYN_KEYS.forEach(k=>{if(!I[k])return;const T=st.syn[k],a=new Array(16).fill(0);T.snd=I[k].snd;T.oct=0;for(const i in I[k].notes)a[+i]=I[k].notes[i];T.clip=degToClip(a,T.snd)});paint();fire();tip.textContent=I.n+': '+I.why;if(!seq.on)playB.click()}}
  function paint(){tracks.forEach(k=>{const L=st.len[k]||16;cells[k].forEach((b,i)=>{const v=st.pat[k][i];b.classList.toggle('on',k==='bass'?!!v:v===1);b.classList.toggle('gh',k!=='bass'&&v===2);b.classList.toggle('out',i>=L);b.textContent=k==='bass'&&v?NOTE_NAMES[(st.root+BASS_ST[v])%12]:''});if(lens[k])lens[k].textContent=String(st.len[k]||16)});
    syn.forEach((k,j)=>{const T=st.syn[k],P=SYN_SOUNDS[T.snd]||SYN_SOUNDS.stab,b0=synBase(st,T);snm[k].innerHTML=`<b style="color:${P.c}">S${j+1} ${P.short||P.n}</b>`;snm[k].parentNode.style.setProperty('--rc',P.c);
      scells[k].forEach((b,i)=>{const here=T.clip.filter(n=>n[0]===i).sort((x,y)=>x[1]-y[1]),sus=!here.length&&T.clip.some(n=>n[0]<i&&n[0]+n[2]>i);
        b.classList.toggle('on',here.length>0);b.classList.toggle('gh',sus);b.textContent=here.length?NOTE_NAMES[(b0+here[0][1])%12]+(here.length>1?'+':''):''})});synPaint()}
  const onStep=s=>{tracks.forEach(k=>{const L=st.len[k]||16;cells[k].forEach((b,i)=>b.classList.toggle('ph',s>=0&&i===s%L))});syn.forEach(k=>scells[k].forEach((b,i)=>b.classList.toggle('ph',s>=0&&i===s%16)));barc.textContent=s>=0?'BAR '+(Math.floor(s/16)+1):'BAR –';if(s>=0&&o.onStep)o.onStep(s)};
  playB.onclick=()=>{if(seq.on){seq.stop();return}G.set(st);stopMusic();playB.textContent='■ STOP';seq.start({bpm:()=>st.bpm,play:(s,t)=>technoStep(st,s,t,G),onStep,onStop:()=>{playB.textContent='▶ PLAY';onStep(-1)}});if(o.onPlay)o.onPlay()};
  const syncKnobs=()=>{if(K.bpm)K.bpm.set(st.bpm);if(K.swing)K.swing.set(st.swing);if(K.rumble)K.rumble.set(st.rumble);if(K.drive)K.drive.set(st.drive);syn.forEach(k=>K[k].set(st.vol[k]==null?1:st.vol[k]));bo()};
  const api={st,G,paint,set(v){Object.assign(st,v);syncKnobs();paint();fire()},setPat(tk,arr){arr.forEach((x,i)=>st.pat[tk][i]=x);paint();fire()},load(id){const ns=styleState(id),ks=st.syn,kv={};SYN_KEYS.forEach(k=>{if(st.vol&&st.vol[k]!=null)kv[k]=st.vol[k]});Object.keys(st).forEach(k=>delete st[k]);Object.assign(st,ns);if(ks)st.syn=ks;Object.assign(st.vol,kv);syncKnobs();paint();fire()},   /* a style changes drums, bass and key; your synth parts stay and follow the new key */stop(){seq.stop();out.kill()}};
  if(o.presets){const ids=Object.keys(STYLES);let pi=-1;const setP=i=>{pi=(i+ids.length)%ids.length;api.load(ids[pi]);$('.pname',pg.el).textContent=STYLES[ids[pi]].name;tip.textContent=STYLES[ids[pi]].why;if(!seq.on)playB.click()};$('[data-a=pp]',pg.el).onclick=()=>setP(pi-1);$('[data-a=pn]',pg.el).onclick=()=>setP(pi+1)}
  paint();G.set(st);return api}

/* =====================================================================
   RUMBLE FORGE — the techno rumble kick, step by step
   ===================================================================== */
function rumbleRig(host,o){o=o||{};initAudio();const R=Object.assign({amt:.5,dec:2.4,cut:140,duck:.85,drive:.35},o.init||{});const st=mkSt({bpm:140,pat:{kick:BEATS,chat:ODD,ohat:OFF}});
  const pg=plug(host,{name:'RUMBLE FORGE',type:'KICK → REVERB → LOW-PASS → DUCK → DRIVE',col:'#a98bff',bypass:false});const B=pg.body,tip=tipLine(B);if(!A.ctx){B.textContent='Audio is not available here.';return{R,stop(){},set(){}}}
  const out=rigOut(),G=bunkerGraph(A.ctx,out.g);
  const D=display(B,120,(g,W,H)=>{gridLines(g,W,H,{cols:8,major:4});const beat=60/st.bpm,T=2*beat;g.beginPath();g.moveTo(0,H);
    for(let x=0;x<=W;x+=2){const t=x/W*T,tb=t%beat;let tail=0;for(let n=0;n<8;n++)tail+=Math.pow(10,-3*(tb+n*beat)/R.dec);tail=Math.min(1.6,tail)/1.6;const dk=1-R.duck*Math.exp(-tb/(beat*.18));g.lineTo(x,H-6-clamp(R.amt*tail*dk*(1+R.drive*.5),0,1)*(H-22))}
    g.lineTo(W,H);g.closePath();const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(169,139,255,.85)');gr.addColorStop(1,'rgba(169,139,255,.08)');g.fillStyle=gr;g.fill();
    for(let k=0;k<2;k++){g.fillStyle='#f1e7d0';g.fillRect(k*W/2,14,3,H-20)}g.fillStyle='#c9b8ff';g.font='10px VT323, monospace';g.fillText(`TONE ${fmtHz(R.cut)} Hz · DECAY ${R.dec.toFixed(1)} s · DUCK ${Math.round(R.duck*100)}%`,6,11)});
  B.append(h('div','dispcap','<span>KICKS (WHITE) · RUMBLE (PURPLE) OVER 2 BEATS</span>'));
  const apply=()=>{st.rumble=R.amt;st.rdec=R.dec;st.rcut=R.cut;st.rduck=R.duck;st.rdrive=R.drive;G.set(st);D.redraw();if(o.onChange)o.onChange(R)};
  const kr=h('div','krow');B.append(kr);const K={};const mk=(k,l,mn,mx,fmt,t2,x)=>{K[k]=knob(kr,Object.assign({label:l,min:mn,max:mx,value:R[k],fmt,col:'#a98bff',onTouch:()=>{tip.textContent=t2},onInput:v=>{R[k]=v;apply()}},x||{}))};
  mk('amt','AMOUNT',0,1,v=>Math.round(v*100)+'%','Amount: how loud the rumble sits under the kick.');
  mk('dec','DECAY',.5,8,v=>v.toFixed(1)+' s','Decay: how long the reverb tail lasts. Longer = more pressure, and more risk of mud.',{log:true});
  mk('cut','TONE',40,600,v=>fmtHz(v)+' Hz','Tone: the low-pass. Keep only the lows (60–200 Hz) so the rumble feels deep, not boomy.',{log:true});
  mk('duck','DUCK',0,1,v=>Math.round(v*100)+'%','Duck: how far the rumble dips on every kick (sidechain). Without it, the tail smears over the next kick.');
  mk('drive','DRIVE',0,1,v=>Math.round(v*100)+'%','Drive: saturation on the rumble for grit and presence on small speakers.');
  const row=h('div','row wrap');row.style.gap='6px';B.append(row);const playB=h('button','btn neon sm','▶ PLAY'),solo=h('button','btn ghost sm','SOLO RUMBLE');row.append(playB,solo);
  solo.onclick=()=>{st.soloRumble=!st.soloRumble;solo.classList.toggle('neon',st.soloRumble);solo.classList.toggle('ghost',!st.soloRumble);G.set(st);tip.textContent=st.soloRumble?'Rumble alone: hear the tail, the duck and the drive.':'Kick and rumble together.'};
  playB.onclick=()=>{if(seq.on){seq.stop();return}apply();stopMusic();playB.textContent='■ STOP';seq.start({bpm:st.bpm,play:(s,t)=>technoStep(st,s,t,G),onStop:()=>{playB.textContent='▶ PLAY'}})};
  apply();return{R,set(v){Object.assign(R,v);Object.keys(K).forEach(k=>K[k].set(R[k]));apply()},stop(){seq.stop();out.kill()}}}

/* =====================================================================
   ACID BOX — a 303-style bass line: notes, accents, slides, five knobs
   ===================================================================== */
function acidRig(host,o){o=o||{};initAudio();const st=styleState('acid');const a=st.acid;if(o.init)Object.assign(a,JSON.parse(JSON.stringify(o.init)));
  const pg=plug(host,{name:'ACID BOX',type:'303-STYLE BASS LINE',col:'#ffcc4d',bypass:false});const B=pg.body,tip=tipLine(B);if(!A.ctx){B.textContent='Audio is not available here.';return{a,st,stop(){}}}
  const out=rigOut(),G=bunkerGraph(A.ctx,out.g);G.set(st);const fire=()=>{D.redraw();if(o.onChange)o.onChange(a)};
  const D=display(B,96,(g,W,H)=>{gridLines(g,W,H,{cols:16,major:4});const cw=W/16,Y=st2=>H-12-(st2/12)*(H-28);
    for(let i=0;i<16;i++){const n=a.notes[i];if(!n)continue;const y=Y(BASS_ST[n]);if(a.sl[i]&&i<15&&a.notes[i+1]){g.strokeStyle='#3ef0c8';g.lineWidth=2;g.beginPath();g.moveTo(i*cw+cw-2,y);g.lineTo((i+1)*cw+2,Y(BASS_ST[a.notes[i+1]]));g.stroke()}
      g.fillStyle=a.acc[i]?'#fff1a6':'#ffcc4d';g.fillRect(i*cw+2,y-(a.acc[i]?4:2),cw-4,a.acc[i]?8:5)}
    g.fillStyle='#ffcc4d';g.font='10px VT323, monospace';g.fillText('PITCH · BRIGHT = ACCENT · TEAL LINE = SLIDE',6,11)});
  const gw=h('div','bb');B.append(gw);const cells={n:[],acc:[],sl:[]};
  [['n','NOTE','#ffcc4d'],['acc','ACCENT','#fff1a6'],['sl','SLIDE','#3ef0c8']].forEach(([k,n,c])=>{const row=h('div','bb-row');row.style.setProperty('--rc',c);row.append(h('div','bb-nm',`<b style="color:${c}">${n}</b>`));
    ALL16.forEach(i=>{const b=h('button','bb-c'+(i%4===0?' beat':''));b.setAttribute('aria-label',`${n} step ${i+1}`);b.onclick=()=>{if(k==='n'){a.notes[i]=(a.notes[i]+1)%7;if(a.notes[i])acidVoice(now()+.01,1,.14,[a.root+BASS_ST[a.notes[i]]],a,a.acc[i],G.bus.acid)}else{const arr=k==='acc'?a.acc:a.sl;arr[i]=arr[i]?0:1}paint();fire()};cells[k].push(b);row.append(b)});gw.append(row)});
  function paint(){ALL16.forEach(i=>{const n=a.notes[i];cells.n[i].classList.toggle('on',!!n);cells.n[i].textContent=n?NOTE_NAMES[(a.root+BASS_ST[n])%12]:'';cells.acc[i].classList.toggle('on',!!a.acc[i]);cells.acc[i].textContent=a.acc[i]?'A':'';cells.sl[i].classList.toggle('on',!!a.sl[i]);cells.sl[i].textContent=a.sl[i]?'~':''})}
  const kr=h('div','krow');B.append(kr);const K={};const mk=(k,l,fmt,t2)=>{K[k]=knob(kr,{label:l,min:0,max:1,value:a[k],fmt,col:'#ffcc4d',onTouch:()=>{tip.textContent=t2},onInput:v=>{a[k]=v;fire()}})};const pc=v=>Math.round(v*100)+'%';
  mk('cut','CUTOFF',v=>fmtHz(60*Math.pow(60,v)),'Cutoff: where the low-pass sits. Sweep it while it plays: that is the acid move.');
  mk('reso','RESO',pc,'Resonance: boosts the cutoff. High = squelchy, whistly, talking.');
  mk('env','ENV MOD',pc,'Envelope mod: how far each note opens the filter.');
  mk('dec','DECAY',pc,'Decay: how fast the filter closes after each note. Short = plucky, long = wah.');
  mk('accent','ACCENT',pc,'Accent: how much louder and brighter accented notes get.');
  const row=h('div','row wrap');row.style.gap='6px';B.append(row);const playB=h('button','btn neon sm','▶ PLAY WITH DRUMS');row.append(playB);
  playB.onclick=()=>{if(seq.on){seq.stop();return}stopMusic();playB.textContent='■ STOP';seq.start({bpm:st.bpm,play:(s,t)=>technoStep(st,s,t,G),onStep:s=>{if(o.onStep)o.onStep(s)},onStop:()=>{playB.textContent='▶ PLAY WITH DRUMS'}})};
  paint();return{a,st,set(v){Object.assign(a,v);Object.keys(K).forEach(k=>K[k].set(a[k]));paint();fire()},stop(){seq.stop();out.kill()}}}

/* ================= questions ================= */
const playSt=(st,bars)=>d=>playStyle(d,st,bars||2);
function genreQ(tier){tier=clamp(tier||1,1,3);const ids=tier===1?['hardgroove','tribal','bounce']:tier===2?['hardgroove','tribal','bounce','hardtechno','acid']:['detroit','hardgroove','tribal','bounce','hardtechno','acid'];const id=pick(ids);
  return{skill:'technogenres',dim:'l',tag:'tgenre',prompt:'Which techno style is playing?',plays:[{label:'▶ PLAY 2 BARS',fn:playSt(styleState(id))}],options:ids.map(x=>({v:x,label:STYLES[x].name})),answer:id,explain:()=>STYLES[id].why,
    hints:['Tempo first: under 130 feels relaxed, 135–145 drives, 160 and up sprints.','Then the signature: swung percussion, toms in odd loops, a bass bouncing between kicks, a distorted rumble, a squelchy 303, or soulful chords.']}}
function grooveSt(sw){const st=styleState('hardgroove');st.swing=sw;st.rumble=.15;return st}
function swingAmtQ(tier){tier=clamp(tier||1,1,3);
  if(tier===2){const opts=[['STRAIGHT',50],['LIGHT',55],['HEAVY',64]];const [lab,sw]=pick(opts);
    return{skill:'groove',dim:'l',tag:'tswing',prompt:'How much swing does this groove have?',plays:[{label:'▶ PLAY',fn:playSt(grooveSt(sw))}],options:opts.map(([l])=>({v:l,label:l})),answer:lab,
      explain:()=>`${lab}: ${sw}% swing. ${sw===50?'Every 16th sits exactly on the grid.':sw<60?'The in-between 16ths arrive a touch late: a subtle push.':'The in-between 16ths arrive very late: a lazy, triplet-like shuffle.'}`,hints:['Listen to the closed hats between the beats.','Straight hats tick evenly; swung hats go long-short, long-short.']}}
  const amt=tier===1?62:56,sA=Math.random()<.5;
  return{skill:'groove',dim:'l',tag:'tswing',prompt:tier===1?'Which groove swings?':'Subtle one: which groove has a little swing?',plays:[{label:'▶ A',fn:playSt(grooveSt(sA?amt:50))},{label:'▶ B',fn:playSt(grooveSt(sA?50:amt))}],options:AB_OPTS,answer:sA?'A':'B',
    explain:()=>`${sA?'A':'B'} had ${amt}% swing: every second 16th lands late, so the hats and percussion bounce. The other was straight (50%).`,hints:['Focus on the hats between the kicks.','Straight = even ticks. Swung = long-short, long-short.']}}
function polySt(len){return mkSt({bpm:132,len:{conga:len},pat:{kick:BEATS,chat:ODD,conga:[0]}})}
function polyQ(tier){tier=clamp(tier||1,1,3);const odd=tier===1?3:tier===2?6:5,square=tier===3?8:4,pA=Math.random()<.5;
  return{skill:'polyrhythm',dim:'l',tag:'poly',prompt:'One conga loop fits the bar, the other is a polyrhythm. Which one drifts against the kick?',plays:[{label:'▶ A',fn:playSt(polySt(pA?odd:square),3)},{label:'▶ B',fn:playSt(polySt(pA?square:odd),3)}],options:AB_OPTS,answer:pA?'A':'B',
    explain:()=>`${pA?'A':'B'}: its conga loops every ${odd} steps, so it lands somewhere new on each beat and only meets beat 1 again after ${odd*16/gcd(odd,16)} steps. The other loops every ${square} steps and stays locked to the grid.`,hints:['Follow the conga against the kick.','Locked to the grid, the conga always hits with the same kick. As a polyrhythm, it slides around them.']}}
function rumbleSt(o){return mkSt(Object.assign({bpm:140,pat:{kick:BEATS,chat:ODD,ohat:OFF}},o))}
function rumbleQ(tier){tier=clamp(tier||1,1,3);const sA=Math.random()<.5;
  const [good,bad,prompt,why]={1:[{rumble:.6},{rumble:0},'Which kick has a rumble under it?','had a rumble: the kick feeds a dark, filtered reverb that fills the space between the hits.'],
    2:[{rumble:.65,rduck:.9},{rumble:.65,rduck:0},'Both have a rumble. Which one is ducked by the kick?','was ducked: the rumble dips on every kick and swells back in between, so each kick punches through. The other smears into mud.'],
    3:[{rumble:.6,rcut:90},{rumble:.6,rcut:420},'Which rumble is darker (lower tone)?','was filtered lower (about 90 Hz against 420 Hz): only the sub remains, so it feels deep instead of boomy.']}[tier];
  return{skill:'rumble',dim:'l',tag:'rumble',prompt,plays:[{label:'▶ A',fn:playSt(rumbleSt(sA?good:bad))},{label:'▶ B',fn:playSt(rumbleSt(sA?bad:good))}],options:AB_OPTS,answer:sA?'A':'B',explain:()=>`${sA?'A':'B'} ${why}`,hints:['Headphones or a big speaker help: listen under the kick.','Listen to the gaps between the kicks.']}}
function bassSt(mode){return mkSt({bpm:mode==='rolling'?142:162,bassMode:mode,pat:{kick:BEATS,clap:[4,12],chat:OFF,bass:mode==='rolling'?{1:1,2:1,3:1,5:1,6:1,7:1,9:1,10:1,11:1,13:1,14:1,15:1}:{2:1,6:1,10:1,14:1}}})}
function bounceQ(tier){tier=clamp(tier||1,1,3);const opts=tier===1?['pluck','reverse']:['pluck','reverse','rolling'];const m=pick(opts);
  return{skill:'bounce',dim:'l',tag:'tbounce',prompt:'What kind of bass is this?',plays:[{label:'▶ PLAY',fn:playSt(bassSt(m))}],options:opts.map(x=>({v:x,label:BASSN[x]})),answer:m,
    explain:()=>({pluck:'Pluck: a short bass on each offbeat, starting right after the kick and dying away.',reverse:'Reverse: the bass swells up on each offbeat and cuts right before the next kick, like a kick tail played backwards. The hard bounce signature, inherited from hard trance and hardstyle.',rolling:'Rolling: three short bass notes between every kick, a 16th-note roll. Classic driving techno.'})[m],
    hints:['Listen to the shape of each bass note: does it start loud, or grow?','Pluck = short and dying. Reverse = growing into the kick. Rolling = several notes between kicks.']}}
function acidSt(o){const st=styleState('acid');Object.assign(st.acid,o);return st}
function acidQ(tier){tier=clamp(tier||1,1,3);const sA=Math.random()<.5;
  const [good,bad,prompt,why]=tier===1?[{},{acc:new Array(16).fill(0),sl:new Array(16).fill(0),reso:.25,env:.3},'Which line is the real acid squelch?','had accents, slides and high resonance: the notes squelch, glide and talk.']
    :[{reso:.85},{reso:.2},'Which line has more resonance?','had far more resonance: the filter whistles and squelches around its cutoff.'];
  return{skill:'acid',dim:'l',tag:'acid',prompt,plays:[{label:'▶ A',fn:playSt(acidSt(sA?good:bad))},{label:'▶ B',fn:playSt(acidSt(sA?bad:good))}],options:AB_OPTS,answer:sA?'A':'B',explain:()=>`${sA?'A':'B'} ${why}`,hints:['Listen to the bass line, not the drums.','Acid squelch = resonance + accents + slides.']}}

CONCEPTS.push(
{s:'technogenres',q:'Detroit techno was started in the mid-80s by…',o:['Juan Atkins, Derrick May and Kevin Saunderson','Daft Punk','Skrillex'],a:0,e:'The "Belleville Three" from Detroit built techno out of funk, electro and machine futurism.'},
{s:'technogenres',q:'Who gave hardgroove its name?',o:['Ben Sims, with his Hard Groove Trax tapes (mid-90s)','Jeff Mills','Armin van Buuren'],a:0,e:'UK DJ Ben Sims launched the Hard Groove Trax mixtapes in the mid-90s; they later became a label.'},
{s:'technogenres',q:'A typical hardgroove tempo is…',o:['135–145 BPM','100–110 BPM','170–180 BPM'],a:0,e:'Driving but not frantic: most hardgroove sits between about 135 and 145 BPM.'},
{s:'technogenres',q:'Hard bounce usually runs at…',o:['160 BPM and up','120 BPM','90 BPM'],a:0,e:'Hard bounce is fast: about 160 BPM and above, faster than most hard techno (about 145–160).'},
{s:'technogenres',q:'The 240 KM/H collective, a home of hard bounce, was founded by…',o:['Adrián Mills, in 2021','Ben Sims, in 1995','Juan Atkins, in 1985'],a:0,e:'Spanish DJ Adrián Mills founded 240 KM/H; it officially started in 2021 at Gotec in Karlsruhe.'},
{s:'technogenres',q:'Compared with hard techno, hard bounce feels…',o:['Brighter and more playful','Darker and more industrial','Slower and dubbier'],a:0,e:'Hard techno leans dark and industrial; hard bounce is bright, bouncy and playful.'},
{s:'technogenres',q:'Schranz is a hard, looping techno style from…',o:['Germany, late 90s','Jamaica, 70s','Brazil, 2010s'],a:0,e:'Schranz grew out of the German (Frankfurt) scene in the late 90s: distorted loops and relentless repetition.'},
{s:'technogenres',q:'Most techno sits between…',o:['about 120 and 150 BPM','60 and 90 BPM','180 and 220 BPM'],a:0,e:'Classic techno lives around 120–150 BPM; the harder styles push faster.'},
{s:'groove',q:'On an MPC-style swing control, 50% means…',o:['Straight: no swing','Maximum swing','Half the tempo'],a:0,e:'50% puts the second 16th exactly halfway. Higher values push it later.'},
{s:'groove',q:'Swing delays…',o:['Every second 16th note','Every kick','The whole track'],a:0,e:'Only the in-between 16ths move late; the beats stay on the grid.'},
{s:'groove',q:'In hardgroove, which parts usually stay straight?',o:['Kick and clap','Every hi-hat','The conga loops'],a:0,e:'Kick and clap anchor the grid while hats and percussion swing around them.'},
{s:'groove',q:'Swing around 66% is close to…',o:['A triplet feel','No swing at all','Half-time'],a:0,e:'At about 66% the swung 16th lands two thirds of the way through the 8th: a triplet shuffle.'},
{s:'rumble',q:'A techno rumble is usually made by sending the kick into…',o:['A dark, filtered reverb (or delay)','A chorus','A vocoder'],a:0,e:'A long, low-passed reverb on the kick, ducked by the kick, makes the rumble.'},
{s:'rumble',q:'Why duck (sidechain) the rumble with the kick?',o:['So the dry kick punches through','To make it brighter','To change the tempo'],a:0,e:'The rumble dips on every kick and swells between them: punch, then pressure.'},
{s:'rumble',q:'The rumble lives mostly…',o:['Below about 150–200 Hz','Above 5 kHz','Only in the mids'],a:0,e:'It is sub and low-bass energy; filter the rest away so it stays dark.'},
{s:'rumble',q:'A rumble without ducking sounds…',o:['Muddy and smeared','Punchier','Brighter'],a:0,e:'The tail covers the next kick, so every hit blurs.'},
{s:'polyrhythm',q:'A polyrhythm is…',o:['Two rhythms with different cycles at once','A very fast rhythm','A rhythm with no kick'],a:0,e:'For example a 3-step loop over a 16-step bar: it keeps landing in new places.'},
{s:'polyrhythm',q:'A 3-step loop over a 16-step bar meets beat 1 again after…',o:['3 bars (48 steps)','1 bar','16 bars'],a:0,e:'3 × 16 = 48 steps: after 3 bars the pattern starts on beat 1 again.'},
{s:'polyrhythm',q:'In tribal techno, call and response often means…',o:['Low toms answered by higher congas or bongos','A singer and a choir','Kick and bass playing together'],a:0,e:'The drums talk: a low phrase, then a higher answer.'},
{s:'polyrhythm',q:'Tribal techno puts the focus on…',o:['Drums and percussion','Long melodies','Vocals'],a:0,e:'Melody stays minimal: toms, congas, bongos and shakers carry the track.'},
{s:'bounce',q:'The "bounce" comes from…',o:['A bass on the offbeat, between the kicks','A bass on every kick','Removing the kick'],a:0,e:'Kick on the beat, bass on the "and": the floor bounces between them.'},
{s:'bounce',q:'A reverse bass…',o:['Swells up into the next kick','Fades out after the kick','Plays only on beat 1'],a:0,e:'It grows on the offbeat and cuts just before the next kick, like a kick tail played backwards.'},
{s:'bounce',q:'Short hits in hard bounce work best…',o:['On the beat, every 4 or 8 beats','On the last 16th before each beat','On every 16th'],a:0,e:'Hits land on the grid of the beat; on the "a" 16th they collide with the bass swell and feel off.'},
{s:'bounce',q:'A "stop" in hard bounce is…',o:['A short gap where the kick and bass drop out','A tempo change','A key change'],a:0,e:'Pull the kick for a moment and its return hits twice as hard.'},
{s:'acid',q:'The classic acid sound comes from…',o:['The Roland TB-303 bass line','A grand piano','A drum machine hi-hat'],a:0,e:'The TB-303: resonant filter, accents and slides. Phuture\'s "Acid Tracks" (1987) made it famous.'},
{s:'acid',q:'On a 303-style line, a slide…',o:['Glides the pitch into the next note','Makes the note louder','Mutes the note'],a:0,e:'The note holds and the pitch bends smoothly to the next step, without a new attack.'},
{s:'acid',q:'An accent on a 303-style line…',o:['Makes the note louder and opens the filter more','Changes the tempo','Adds reverb'],a:0,e:'Accents give the squelchy, talking peaks.'},
{s:'acid',q:'High resonance on the filter makes the line…',o:['Squelchy and whistly','Softer and duller','Lower in pitch'],a:0,e:'Resonance boosts the cutoff frequency: sweep it and the line talks.'});
Object.assign(SKILL_Q,{technogenres:[()=>genreQ(1),()=>conceptQ('technogenres')],groove:[()=>swingAmtQ(1),()=>conceptQ('groove')],rumble:[()=>rumbleQ(1),()=>conceptQ('rumble')],
  polyrhythm:[()=>polyQ(1),()=>conceptQ('polyrhythm')],bounce:[()=>bounceQ(1),()=>conceptQ('bounce')],acid:[()=>acidQ(1),()=>conceptQ('acid')]});
Object.assign(PQ,{
  tgenre:{title:'The Style Compass',why:'Techno styles still blur together for you.',gen:()=>pick([genreQ(1),conceptQ('technogenres')]),skill:'technogenres',dim:'l'},
  tswing:{title:'The Shuffle School',why:'Swing is hard for you to hear yet.',gen:()=>swingAmtQ(1),skill:'groove',dim:'l'},
  poly:{title:'The Drum Circle',why:'Polyrhythms slip past you.',gen:()=>pick([polyQ(1),conceptQ('polyrhythm')]),skill:'polyrhythm',dim:'l'},
  tbounce:{title:'The Bounce Test',why:'Offbeat basses keep tricking you.',gen:()=>pick([bounceQ(1),conceptQ('bounce')]),skill:'bounce',dim:'l'},
  acid:{title:'The Squelch Hunt',why:'Acid lines are hard to read by ear.',gen:()=>acidQ(1),skill:'acid',dim:'l'},
  rumble:{title:'The Floor Shaker',why:'Rumble and mud still sound alike to you.',gen:()=>pick([rumbleQ(1),rumbleQ(2)]),skill:'rumble',dim:'l'}});
Object.assign(TAGNAME,{tgenre:'techno styles',tswing:'hearing swing',poly:'polyrhythms',tbounce:'offbeat bass',acid:'acid lines',rumble:'rumble kicks'});
GAMES.push(
{id:'radar',name:'Techno Radar',skill:'technogenres',ic:'groovebox',col:'#ff7a3a',gen:t=>genreQ(t),unlocked:()=>S.done.includes('t1'),how:'Learn “The Techno Engine” in the Techno Bunker',tiers:['3 styles','5 styles','6 styles'],intro:'Every techno style has its own speed and signature. Hear the loop, name the style.'},
{id:'swingsense',name:'Swing Sense',skill:'groove',ic:'conga',col:'#ff4f5a',gen:t=>swingAmtQ(t),unlocked:()=>S.done.includes('t3'),how:'Learn “Hardgroove” in the Techno Bunker',tiers:['Straight or swung','How much swing?','Subtle swing'],intro:'Swing pushes every second 16th late. Hear whether a groove swings, and how much.'});

/* ================= the bunker scene ================= */
function drawBunker(g,t,cv){const W=cv.width,H=cv.height;for(let y=0;y<H;y++)px(g,0,y,W,1,['#0d0a14','#110d1c','#151022','#191428'][Math.min(3,Math.floor(y/H*4))]);
  for(let y=3;y<H*.62;y+=6)for(let x=(Math.floor(y/6)%2)*5-5;x<W;x+=10)px(g,x,y,9,5,'#17122a');
  const beams=['rgba(255,61,127,.17)','rgba(62,240,200,.15)','rgba(169,139,255,.17)'];
  beams.forEach((col,k)=>{const sx=W*(.2+k*.3),a=Math.sin(t*(.9+k*.35)+k*2)*.9;for(let y=0;y<H*.85;y+=1)px(g,Math.floor(sx+a*y*.6)-1-Math.floor(y*.06),y,2+Math.floor(y*.12),1,col)});
  if(Math.sin(t*7.3)>.95)px(g,0,0,W,H,'rgba(255,255,255,.08)');
  [2,W-14].forEach(x=>{px(g,x,Math.floor(H*.36),12,H,'#0b0816');for(let k=0;k<3;k++){const yy=Math.floor(H*.4)+k*Math.floor(H*.17);px(g,x+3,yy,6,6,'#2a2248');px(g,x+5,yy+2,2,2,Math.sin(t*14+k)>0?'#4d4373':'#3d3166')}});
  const r=rng(77);for(let i=0;i<20;i++){const x=Math.floor(r()*(W-10))+5,hh=4+Math.floor(r()*3),bob=Math.sin(t*8.5+i*1.7)>0?1:0,y=H-hh-1+bob;px(g,x,y,3,hh+2,'#07050d');px(g,x,y-3,3,3,'#07050d');if(r()<.3)px(g,x+(i%2?3:-1),y-6+bob,1,4,'#07050d')}
  for(let i=0;i<4;i++){const x=Math.floor((i*37+t*6)%(W+30))-15;px(g,x,Math.floor(H*.55)+i*3,26,2,'rgba(200,180,255,.05)')}}
WSCENE.bunker=drawBunker;
/* the bunker entrance on the world map, half-buried in Beat Forest */
function drawBunkerMap(g,open){const x=60,y=204;px(g,x+1,y+4,22,13,'#2b2740');px(g,x,y+2,24,3,'#3a3552');px(g,x+2,y+5,20,1,'#221e33');px(g,x+9,y+8,6,9,'#07050d');px(g,x+10,y+9,4,1,open?'#ff3d7f':'#4a2236');px(g,x+3,y+7,4,2,open?'#3ef0c8':'#1f4a44');px(g,x+17,y+7,4,2,open?'#ff3d7f':'#4a2236');px(g,x+11,y-1,2,3,'#3a3552');if(open)for(let k=0;k<3;k++){px(g,x-3-k*2,y+8+k,1,3,'rgba(169,139,255,.65)');px(g,x+26+k*2,y+8+k,1,3,'rgba(169,139,255,.65)')}}
