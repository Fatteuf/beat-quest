/* ================= question generators ================= */
const AB_OPTS=[{v:'A',label:'A'},{v:'B',label:'B'}];
const DRUM_OPTS=[{v:'kick',label:'KICK'},{v:'snare',label:'SNARE'},{v:'hat',label:'HI-HAT'}];
const drumSkill=d=>d==='hat'?'hihat':d;
const DRUM_SOUND={kick:'The kick: a low, round thump.',snare:'The snare: a sharp crack with a noisy tail.',hat:'The hi-hat: a short, bright tick.'};
function playTone(dest,freqs,dur){dur=dur||.6;const t0=now()+.05;withRoute(dest,()=>freqs.forEach((f,i)=>V.sine(t0+i*(dur+.15),f,dur,.32)))}
const playPat=(p,bpm,bars,opt)=>d=>withRoute(d,()=>schedPattern(p,bpm,bars,now()+.05,opt));

function highLowQ(tier){tier=clamp(tier||1,1,3);const r=[2,1.5,1.19][tier-1];const base=220*Math.pow(2,Math.random());const hiFirst=Math.random()<.5;const fA=hiFirst?base*r:base,fB=hiFirst?base:base*r;const ans=hiFirst?'A':'B';
  return{skill:'sound',dim:'l',tag:'pitch',prompt:'Which note is higher?',plays:[{label:'▶ A',fn:d=>playTone(d,[fA])},{label:'▶ B',fn:d=>playTone(d,[fB])},{label:'▶ A THEN B',fn:d=>playTone(d,[fA,fB])}],options:AB_OPTS,answer:ans,
    explain:()=>`${ans} was higher: ${Math.round(Math.max(fA,fB))} Hz against ${Math.round(Math.min(fA,fB))} Hz. More vibrations per second means a higher pitch.`,
    hints:['Hum along with each note. Which one pushes your voice up?','Higher notes feel thinner and brighter. Lower notes feel rounder.'],
    demo:()=>playQ(d=>playTone(d,[Math.min(fA,fB),Math.max(fA,fB)])),demoText:'Low first, then high. Now listen to A and B again.'}}
function toneBandQ(){const bands=[['LOW',[70,90,110,150]],['MID',[500,700,900,1400]],['HIGH',[4500,5500,7000,9000]]];const [name,fs]=pick(bands);const f=pick(fs);
  return{skill:['sound','frequency'],dim:'l',tag:'freq',prompt:'Is this sound LOW, MID or HIGH?',plays:[{label:'▶ PLAY',fn:d=>playTone(d,[f],.9)}],options:['LOW','MID','HIGH'].map(v=>({v,label:v})),answer:name,
    explain:()=>`${name}: it vibrates ${f} times per second (${f} Hz). Low is roughly 20–250 Hz, mid 250–4,000 Hz, high 4,000–20,000 Hz.`,
    hints:['Low sounds rumble (headphones help). High sounds whistle or sparkle.','Mid sounds sit where voices and most instruments live.'],
    demo:()=>playQ(d=>playTone(d,[100,1000,7000],.5)),demoText:'That was LOW, then MID, then HIGH. Compare with the mystery sound.',viz:(host,rev)=>freqRuler(host,rev?f:null)}}
const FBANDS={1:[['LOW',100],['MID',1000],['HIGH',6000]],2:[['LOW',90],['LOW-MID',300],['MID',1000],['HIGH-MID',3000],['HIGH',8000]]};
const BAND_FEEL={LOW:'Low boosts make the kick and bass boom.','LOW-MID':'Low-mid boosts make a mix sound muddy and boxy.',MID:'Mid boosts sound nasal, like a telephone.','HIGH-MID':'High-mid boosts sound harsh and edgy.',HIGH:'High boosts add sizzle and air.'};
function freqBandQ(tier){tier=clamp(tier||1,1,3);const bands=tier===1?FBANDS[1]:FBANDS[2];const [name,f]=pick(bands);const gdb=[12,10,6][tier-1];
  const play=boost=>dest=>{const pk=A.ctx.createBiquadFilter();pk.type='peaking';pk.frequency.value=f;pk.Q.value=1.1;pk.gain.value=boost?gdb:0;pk.connect(dest);withRoute(pk,()=>musicBed(now()+.05))};
  return{skill:'frequency',dim:'l',tag:'freq',prompt:`One version has a +${gdb} dB boost. Which range was boosted?`,plays:[{label:'▶ ORIGINAL',fn:play(false)},{label:'▶ BOOSTED',fn:play(true)}],options:bands.map(b=>({v:b[0],label:b[0]})),answer:name,
    explain:()=>`The boost was in the ${name} range, around ${f>=1000?f/1000+' kHz':f+' Hz'}. ${BAND_FEEL[name]}`,
    hints:['Switch between ORIGINAL and BOOSTED. What got louder: the thump, the body, or the sizzle?','Low = kick and bass get fatter. Mid = boxy or nasal. High = hats and air get sharper.'],
    viz:(host,rev)=>eqViz(host,rev?{f,g:gdb,q:1.1}:null)}}
function tempoQ(tier){tier=clamp(tier||1,1,3);let opts,bpm;
  if(tier===1){opts=[70,100,130,160];bpm=pick(opts)}else{const step=tier===2?10:6;bpm=pick([80,90,100,110,120,130]);const k=Math.floor(Math.random()*4);opts=[0,1,2,3].map(i=>bpm+(i-k)*step)}
  const p=pat({kick:[0,8],snare:[4,12],hat:EIGHTHS});
  return{skill:['bpm','tempo'],dim:'l',tag:'tempo',prompt:'About what tempo is this groove?',plays:[{label:'▶ PLAY',fn:playPat(p,bpm,2)},{label:'▶ 120 BPM REFERENCE',fn:d=>withRoute(d,()=>clickTrack(120,8,now()+.05))}],options:opts.map(v=>({v:String(v),label:String(v)})),answer:String(bpm),
    explain:()=>`It was ${bpm} BPM. ${bpm<96?'That is hip-hop and lo-fi territory.':bpm<116?'That is pop and R&B territory.':bpm<133?'That is house and techno territory.':'That is trap, dubstep or faster.'}`,
    hints:['Compare it with the 120 BPM reference: faster or slower?','Tap your foot. 60 BPM is one tap per second, 120 is two.'],viz:(host,rev)=>{if(rev)tempoViz(host,bpm)}}}
function fasterQ(){const a=pick([80,90,100]),b=a+pick([30,40]);const aFirst=Math.random()<.5;const tA=aFirst?b:a,tB=aFirst?a:b;const p=pat({kick:[0,8],snare:[4,12],hat:EIGHTHS});
  return{skill:'tempo',dim:'l',tag:'tempo',prompt:'Which groove has the faster tempo?',plays:[{label:'▶ A',fn:playPat(p,tA,1)},{label:'▶ B',fn:playPat(p,tB,1)}],options:AB_OPTS,answer:tA>tB?'A':'B',
    explain:()=>`${tA>tB?'A':'B'} was faster: ${Math.max(tA,tB)} BPM against ${Math.min(tA,tB)} BPM.`,hints:['Listen to how quickly the kicks come round.','Faster tempo means the beats are closer together.']}}
const CONCEPTS=[
{s:'bpm',q:'What does BPM measure?',o:['Beats per minute','Bass per mix','Bars per measure'],a:0,e:'BPM is beats per minute: the speed of the pulse.'},
{s:'bpm',q:'At 60 BPM, how many beats happen each second?',o:['1','2','60'],a:0,e:'60 beats in 60 seconds is one beat per second.'},
{s:'tempo',q:'A house track usually sits around…',o:['70 BPM','124 BPM','174 BPM'],a:1,e:'House lives around 120 to 128 BPM.'},
{s:'tempo',q:'Drum & bass usually sits around…',o:['90 BPM','128 BPM','174 BPM'],a:2,e:'Drum & bass runs fast, around 170 to 175 BPM.'},
{s:'beats',q:'In 4/4 time, how many beats are in one bar?',o:['2','3','4'],a:2,e:'4/4 means four beats per bar.'},
{s:'bars',q:'On a 16-step grid, which step is beat 3?',o:['Step 3','Step 9','Step 12'],a:1,e:'Each beat is 4 steps: beats sit on steps 1, 5, 9 and 13.'},
{s:'bars',q:'How many steps are in one bar of a 16-step sequencer?',o:['8','12','16'],a:2,e:'4 beats × 4 steps = 16 steps.'},
{s:'rhythm',q:'Rhythm is…',o:['The pattern of hits and gaps in time','How high a note is','How loud a mix is'],a:0,e:'Rhythm is about when sounds happen.'},
{s:'kick',q:'Which drum is the low thump that anchors the groove?',o:['Kick','Snare','Hi-hat'],a:0,e:'The kick is the lowest drum.'},
{s:'snare',q:'In a backbeat, the snare lands on…',o:['Beats 1 and 3','Beats 2 and 4','Every beat'],a:1,e:'The backbeat is 2 and 4: the part people clap to.'},
{s:'hihat',q:'Hi-hats on every 8th note means how many hats per bar?',o:['4','8','16'],a:1,e:'Two per beat × 4 beats = 8.'},
{s:'patterns',q:'“Four on the floor” means…',o:['A kick on every beat','Four snares per bar','Four bars of silence'],a:0,e:'A kick on beats 1, 2, 3 and 4: the house and techno heartbeat.'},
{s:'quantize',q:'Quantize moves each note to…',o:['The nearest grid line','The loudest beat','A higher pitch'],a:0,e:'Quantize snaps notes to the nearest line of the grid you choose.'},
{s:'sound',q:'A sound that vibrates faster sounds…',o:['Higher','Lower','Louder'],a:0,e:'Faster vibration = higher frequency = higher pitch.'},
{s:'frequency',q:'Frequency is measured in…',o:['Hertz (Hz)','Decibels (dB)','BPM'],a:0,e:'Hertz = vibrations per second. Decibels measure level.'},
{s:'compression',q:'A compressor mostly turns down…',o:['The loud parts','The quiet parts','The high notes'],a:0,e:'It reduces whatever goes over the threshold.'},
{s:'threshold',q:'The threshold is…',o:['The level where compression starts','How fast it reacts','The output volume'],a:0,e:'Only sound above the threshold gets turned down.'},
{s:'ratio',q:'At 4:1, a hit 8 dB over the threshold comes out…',o:['2 dB over','4 dB over','8 dB over'],a:0,e:'8 ÷ 4 = 2 dB over the threshold.'},
{s:'attack',q:'A slower attack lets the start of each hit through. Drums sound…',o:['Punchier','Muddier','Wider'],a:0,e:'The first click (the transient) survives, so hits snap.'},
{s:'release',q:'Release too long on a fast groove makes the mix…',o:['Pump and duck','Brighter','Out of tune'],a:0,e:'The compressor never recovers before the next hit, so everything ducks.'}];
function conceptQ(skill){const pool=CONCEPTS.filter(c=>c.s===skill);const c=pick(pool.length?pool:CONCEPTS);
  return{skill:c.s,dim:'u',tag:null,prompt:c.q,wide:true,options:shuffle(c.o.map((o,i)=>({v:String(i),label:o}))),answer:String(c.a),explain:()=>c.e,
    hints:['Think back to where you learned it.','Rule out the answer that is about something else entirely.']}}
function fourFloorQ(){const ff=Math.random()<.5;const p=ff?pat({kick:[0,4,8,12],snare:[4,12],hat:[2,6,10,14]}):pat({kick:[0,8],snare:[4,12],hat:EIGHTHS});
  return{skill:['patterns','kick'],dim:'l',tag:'pattern',prompt:'What is the kick doing?',plays:[{label:'▶ PLAY',fn:playPat(p,ff?124:96,2)}],options:[{v:'ff',label:'EVERY BEAT'},{v:'13',label:'BEATS 1 AND 3'}],answer:ff?'ff':'13',
    explain:()=>ff?'Every beat: four on the floor, the house heartbeat.':'Beats 1 and 3: half as busy, a hip-hop and rock feel.',hints:['Count 1, 2, 3, 4 and listen only for the low thump.','Does the thump land on 2 and 4 as well, or only on 1 and 3?'],viz:(host,rev)=>{if(rev)gridViz(host,p,['kick','snare','hat'])}}}
function drumSoloQ(which){const d=which||pick(['kick','snare','hat']);const p=pat({[d]:{kick:[0,4,8,12],snare:[4,12],hat:EIGHTHS}[d]});
  return{skill:drumSkill(d),dim:'l',tag:'drumid',prompt:'Which drum is playing alone?',plays:[{label:'▶ PLAY',fn:playPat(p,96,1)}],options:DRUM_OPTS,answer:d,explain:()=>DRUM_SOUND[d],
    hints:['Is it low and round, cracking in the middle, or tiny and bright?','Kick = thump, snare = crack, hi-hat = tick.']}}
function drumMissingQ(){const miss=pick(['kick','snare','hat']);const full={kick:[0,8],snare:[4,12],hat:EIGHTHS};const spec={};['kick','snare','hat'].forEach(k=>{if(k!==miss)spec[k]=full[k]});const p=pat(spec),pf=pat(full);
  return{skill:drumSkill(miss),dim:'l',tag:'drumid',prompt:'Which drum is missing from the mystery groove?',plays:[{label:'▶ FULL GROOVE',fn:playPat(pf,96,1)},{label:'▶ MYSTERY',fn:playPat(p,96,1)}],options:DRUM_OPTS,answer:miss,
    explain:()=>`The ${miss==='hat'?'hi-hat':miss} was missing. ${DRUM_SOUND[miss]}`,hints:['Play the full groove, then the mystery one. What disappeared?','Listen for the thump, then the crack, then the ticks.']}}
function offbeatQ(tier){tier=clamp(tier||1,1,3);const which=pick(['kick','snare','hat']);const spec={kick:[0,8],snare:[4,12],hat:EIGHTHS.slice()};const arr=spec[which];const k=which==='hat'?pick([1,2,3,5,6]):pick([0,1]);const from=arr[k];let late=Math.random()<.5;if(from===0)late=true;arr[k]=from+(late?1:-1);const p=pat(spec);
  const beat=Math.floor(from/4)+1;
  const base={skill:which==='hat'?'hihat':'snare',dim:'l',tag:'offbeat',plays:[{label:'▶ PLAY',fn:playPat(p,92,2)}],hints:['Keep counting 1, 2, 3, 4. Which sound fights the count?','The wrong note is exactly one step (a 16th) away from where it belongs.'],
    viz:(host,rev)=>{if(rev){const g=gridViz(host,p,['kick','snare','hat']);g.mark([[which,arr[k]]])}}};
  if(tier===1)return Object.assign(base,{skill:drumSkill(which),prompt:'One drum is off the grid. Which one?',options:DRUM_OPTS,answer:which,explain:()=>`The ${which==='hat'?'hi-hat':which} was one step ${late?'late':'early'}.`});
  if(tier===2)return Object.assign(base,{prompt:`The ${which==='hat'?'hi-hat':which} is off. Is it early or late?`,options:[{v:'early',label:'EARLY'},{v:'late',label:'LATE'}],answer:late?'late':'early',explain:()=>`It landed one step ${late?'after':'before'} its place, so it sounded ${late?'late (dragging)':'early (rushing)'}.`});
  return Object.assign(base,{prompt:`The ${which==='hat'?'hi-hat':which} is off. Near which beat?`,options:[1,2,3,4].map(b=>({v:String(b),label:'BEAT '+b})),answer:String(beat),explain:()=>`The wrong note belonged to beat ${beat}.`})}
function quantizeQ(){const eighths=Math.random()<.6;const target=eighths?EIGHTHS:[0,4,8,12];const g=eighths?2:4;
  const big=shuffle(target.map((_,i)=>i)).slice(0,2);const pos=target.map((p,i)=>{const s=Math.random()<.5?-1:1;const m=big.includes(i)?(g===2?.55+Math.random()*.3:1.15+Math.random()*.6):(g===2?.2+Math.random()*.6:.3+Math.random()*1.4);return Math.max(0,p+(p===0?Math.abs(m):s*m))});
  const ans=eighths?'1/8':'1/4';let lv=null;
  return{skill:'quantize',dim:'u',tag:'quantize',prompt:`${target.length} hi-hats drift off the grid. Which quantize grid snaps them back where they belong?`,options:['1/4','1/8','1/16'].map(v=>({v,label:v})),answer:ans,
    plays:[{label:'▶ HEAR THE DRIFT',fn:d=>{const spb=60/100/4,t0=now()+.05;withRoute(d,()=>{for(let b=0;b<2;b++){[0,8].forEach(k=>V.kick(t0+(b*16+k)*spb,.8));pos.forEach(p=>V.hat(t0+(b*16+p)*spb,.6))}})}}],
    viz:(host,rev)=>{lv=laneViz(host,pos,[0,8]);if(rev){const snapped=pos.map(p=>Math.round(p/g)*g);lv.setGrid(g);setTimeout(()=>lv.move(snapped),200)}},
    explain:()=>`${ans}: there are ${target.length} hats per bar, so they are ${eighths?'8th notes':'quarter notes'}. A finer grid can snap a drifting note onto the wrong step; a coarser one squashes notes together.`,
    hints:['Count the hats in one bar. Is it 4, 8 or 16?','4 per bar = quarter notes (1/4). 8 per bar = 8th notes (1/8).']}}
function swingQ(){const sw=Math.random()<.5?'A':'B';const p=pat({kick:[0,8],snare:[4,12],hat:EIGHTHS});
  return{skill:'patterns',dim:'l',tag:'swing',prompt:'One groove swings. Which one?',plays:[{label:'▶ A',fn:playPat(p,96,2,{swing:sw==='A'?.6:0})},{label:'▶ B',fn:playPat(p,96,2,{swing:sw==='B'?.6:0})}],options:AB_OPTS,answer:sw,
    explain:()=>`${sw} swings: every second hi-hat arrives a little late, so the groove goes long-short, long-short.`,hints:['Listen only to the hi-hats.','Straight hats are evenly spaced. Swung hats limp: long-short, long-short.']}}
function balanceQ(){const loud=Math.random()<.5?'A':'B';const p=pat({kick:[0,8],snare:[4,12],hat:EIGHTHS});const vN={kick:.9,snare:.75,hat:.35},vL={kick:.9,snare:.75,hat:1};
  return{skill:'volume',dim:'l',tag:'balance',prompt:'Which mix has the hi-hats too loud?',plays:[{label:'▶ MIX A',fn:playPat(p,96,1,{vol:loud==='A'?vL:vN})},{label:'▶ MIX B',fn:playPat(p,96,1,{vol:loud==='B'?vL:vN})}],options:AB_OPTS,answer:loud,
    explain:()=>`Mix ${loud}: the hats sit on top of everything. Hats usually sit below the kick and snare.`,hints:['Listen for the tiny ticks. Do they sit behind the drums or on top?','In a balanced groove, the kick and snare lead and the hats support.']}}
/* dynamics, space and stereo (later worlds) */
async function renderDrums(set){const bpm=100,spb=60/bpm/4,dur=32*spb+.8;
  return renderOffline(dur,set?(oc,inp)=>{const k=oc.createDynamicsCompressor();k.threshold.value=set.thr;k.ratio.value=set.ratio;k.knee.value=4;k.attack.value=.004;k.release.value=.12;inp.connect(k);return k}:null,
    t0=>{for(let s=0;s<32;s++){const i=s%16,t=t0+s*spb;if(i===0||i===8)V.kick(t,.9);if(i===4||i===12)V.snare(t,1);if(i===7||i===10||i===15)V.snare(t,.16);if(i%2===0)V.hat(t,i%4===0?.5:.2)}})}
function compQ(tier){tier=clamp(tier||1,1,3);const set=[{thr:-34,ratio:12},{thr:-26,ratio:5},{thr:-22,ratio:3}][tier-1];const cA=Math.random()<.5;
  const q={skill:'compression',dim:'l',tag:'comp',prompt:'Both versions are equally loud. Which one is MORE compressed?',options:AB_OPTS,answer:cA?'A':'B',
    explain:()=>`${cA?'A':'B'} was compressed: the loud hits were pushed down and, after matching loudness, the quiet ghost notes came up. The level stays flatter. The other version keeps its peaks and dips.`,
    hints:['Listen to the gap between the loudest hits and the quietest ones.','Compressed drums sound flatter and denser: the ghost notes seem almost as loud as the main hits.'],
    prepare:async()=>{const [dry,wet]=await Promise.all([renderDrums(null),renderDrums(set)]);const m=matchLoudness(dry,wet);q.bufA=cA?m[1]:m[0];q.bufB=cA?m[0]:m[1]},fallback:()=>conceptQ('compression'),
    viz:(host,rev)=>{if(rev)waveViz(host,[[q.bufA,'A'+(cA?' · COMPRESSED':' · DYNAMIC')],[q.bufB,'B'+(cA?' · DYNAMIC':' · COMPRESSED')]])}};
  q.plays=[{label:'▶ A',fn:d=>playBuf(q.bufA,d)},{label:'▶ B',fn:d=>playBuf(q.bufB,d)}];return q}
const SPACES={DRY:{rt:0},'SMALL ROOM':{rt:.35,pre:.004,wet:.3},'LARGE ROOM':{rt:1.1,pre:.012,wet:.35},HALL:{rt:2.6,pre:.025,wet:.4,dark:true}};
const IRS={};
function getIR(name){if(IRS[name])return IRS[name];const sp=SPACES[name],c=A.ctx,sr=c.sampleRate;const len=Math.floor((sp.rt+sp.pre+.1)*sr);const b=c.createBuffer(2,len,sr);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<len;i++){const t=i/sr;if(t<sp.pre){d[i]=0;continue}let v=(Math.random()*2-1)*Math.pow(10,-3*(t-sp.pre)/sp.rt);if(sp.dark){lp+=(v-lp)*.35;v=lp*1.6}d[i]=v}}return IRS[name]=b}
function playSpace(dest,name){const c=A.ctx,sp=SPACES[name];let inp=dest;if(sp.rt){const dry=c.createGain(),wet=c.createGain(),cv=c.createConvolver();inp=c.createGain();dry.gain.value=1-sp.wet*.5;wet.gain.value=sp.wet*1.6;cv.buffer=getIR(name);inp.connect(dry);dry.connect(dest);inp.connect(cv);cv.connect(wet);wet.connect(dest)}
  const t0=now()+.05;withRoute(inp,()=>{V.snare(t0,.8);V.pluck(t0+1,392,.2,.4);V.pluck(t0+1.35,523,.2,.4);V.snare(t0+2.4,.8)})}
function reverbQ(tier){tier=clamp(tier||1,1,3);const opts=tier===1?['DRY','SMALL ROOM','HALL']:['DRY','SMALL ROOM','LARGE ROOM','HALL'];const ans=pick(opts);
  return{skill:'reverb',dim:'l',tag:'space',prompt:'What space was this played in? Listen to the tail after each hit.',plays:[{label:'▶ PLAY',fn:d=>playSpace(d,ans)},{label:'▶ DRY REFERENCE',fn:d=>playSpace(d,'DRY')}],options:opts.map(v=>({v,label:v})),answer:ans,
    explain:()=>ans==='DRY'?'Dry: no space at all. Each sound stops dead.':`${ans[0]+ans.slice(1).toLowerCase()}: the tail lasts about ${SPACES[ans].rt} s. Bigger spaces have longer tails and a small gap (pre-delay) before the echoes arrive.`,
    hints:['After each hit, how long does the sound hang in the air?','Small room = short, tight tail. Hall = long, washy tail.'],viz:(host,rev)=>{if(rev)roomViz(host,ans)}}}
function playStereo(dest,name){const c=A.ctx,t0=now()+.05;const notes=[523,659,784,659,523,784];const mk=p=>{if(!c.createStereoPanner)return dest;const pn=c.createStereoPanner();pn.pan.value=p;pn.connect(dest);return pn};
  if(name==='WIDE'){const l=mk(-1),r=mk(1);withRoute(l,()=>notes.forEach((f,i)=>V.pluck(t0+i*.28,f,.25,.35,-12)));withRoute(r,()=>notes.forEach((f,i)=>V.pluck(t0+i*.28+.012,f,.25,.35,12)))}
  else{const p=mk({LEFT:-1,'HALF LEFT':-.5,CENTER:0,'HALF RIGHT':.5,RIGHT:1}[name]);withRoute(p,()=>notes.forEach((f,i)=>{V.pluck(t0+i*.28,f,.25,.4);V.hat(t0+i*.28+.14,.3)}))}}
function stereoQ(tier){tier=clamp(tier||1,1,3);const opts=tier===1?['LEFT','CENTER','RIGHT']:tier===2?['LEFT','CENTER','RIGHT','WIDE']:['LEFT','HALF LEFT','CENTER','HALF RIGHT','RIGHT'];const ans=pick(opts);
  return{skill:['panning','stereo'],dim:'l',tag:'stereo',prompt:'Headphones on. Where is this sound?',plays:[{label:'▶ PLAY',fn:d=>playStereo(d,ans)},{label:'▶ CENTER REFERENCE',fn:d=>playStereo(d,'CENTER')}],options:opts.map(v=>({v,label:v})),answer:ans,
    explain:()=>ans==='WIDE'?'Wide: slightly different copies in each ear spread the sound across the whole stereo field.':`${ans[0]+ans.slice(1).toLowerCase()}. Panning places a sound anywhere from hard left to hard right.`,
    hints:['Close your eyes. Which ear hears it more?','A wide sound seems to surround you instead of coming from one point.'],viz:(host,rev)=>{if(rev)stereoViz(host,ans)}}}
/* practical tasks: build it yourself */
function backbeatTask(){return{type:'task',skill:['patterns','snare'],dim:'p',tag:'backbeat',prompt:'Build a backbeat: kick on beats 1 and 3, snare on beats 2 and 4. The hats are already there.',
  hints:['The snare is the part people clap to.','Beats sit on steps 1, 5, 9 and 13. Kick on 1 and 9, snare on 5 and 13.'],
  render(host,done,ctl){const p=pat({hat:EIGHTHS});const g=grid(host,{tracks:['kick','snare','hat'],pat:p,edit:{kick:true,snare:true}});seq.start({bpm:96,play:(s,t)=>playStep(p,s,t),onStep:s=>g.step(s%16)});
    const b=h('button','btn neon block','CHECK');host.append(b);b.onclick=()=>{seq.stop();const ok=!!(p.kick[0]&&p.kick[8]&&!p.kick[4]&&!p.kick[12])&&p.snare.every((v,i)=>!!v===(i===4||i===12));done(ok,ok?'Backbeat locked in.':'Kick on steps 1 and 9, snare only on steps 5 and 13.')};
    ctl.demo=()=>{const ref=pat({kick:[0,8],snare:[4,12],hat:EIGHTHS});g.mark([['kick',0],['kick',8],['snare',4],['snare',12]]);seq.start({bpm:96,total:32,play:(s,t)=>playStep(ref,s,t),onStep:s=>g.step(s%16),onEnd:()=>g.step(-1)})};
    ctl.reveal=()=>{p.kick.fill(0);p.snare.fill(0);p.kick[0]=p.kick[8]=1;p.snare[4]=p.snare[12]=1;g.paint()}}}}
function fourFloorTask(){return{type:'task',skill:['bars','kick'],dim:'p',tag:'bars',prompt:'Put a kick on every beat of the bar, and nothing in between.',hints:['A bar of 4/4 has four beats.','Beats are steps 1, 5, 9 and 13: the numbered columns.'],
  render(host,done,ctl){const p=emptyPat();const g=grid(host,{tracks:['kick'],pat:p,edit:true});seq.start({bpm:120,play:(s,t)=>{playStep(p,s,t);if(s%2===0)V.hat(t,.2)},onStep:s=>g.step(s%16)});
    const b=h('button','btn neon block','CHECK');host.append(b);b.onclick=()=>{seq.stop();const ok=p.kick.every((v,i)=>!!v===(i%4===0));done(ok,ok?'Four on the floor.':'Kicks only on steps 1, 5, 9 and 13.')};
    ctl.demo=()=>g.mark([0,4,8,12].map(i=>['kick',i]));ctl.reveal=()=>{p.kick.forEach((v,i)=>p.kick[i]=i%4===0?1:0);g.paint()}}}}
function tapTask(){const bpm=pick([90,100,110,120]);return{type:'task',skill:['rhythm','beats'],dim:'p',tag:'timing',prompt:`Tap along at ${bpm} BPM. Land 4 of 6 taps.`,hints:['Count 1, 2, 3, 4 out loud with the clicks.','Tap on the click, not after it. Start the movement a little early.'],
  render(host,done,ctl){tapWidget(host,{bpm,taps:6,need:4},r=>done(r.pass,r.pass?'Right on the pulse.':'Not quite on the pulse this time.'));ctl.demo=()=>demoTaps(bpm)},demoText:'The high tock marks exactly when to tap.'}}

/* which questions train which skill (used by recall, practice and personal quests) */
const SKILL_Q={
  sound:[()=>highLowQ(2),()=>toneBandQ(),()=>conceptQ('sound')],
  frequency:[()=>freqBandQ(gymTier('freq')),()=>toneBandQ(),()=>conceptQ('frequency')],
  rhythm:[()=>tapTask(),()=>conceptQ('rhythm')],
  bpm:[()=>tempoQ(1),()=>conceptQ('bpm')],
  tempo:[()=>fasterQ(),()=>tempoQ(2),()=>conceptQ('tempo')],
  beats:[()=>tapTask(),()=>conceptQ('beats')],
  bars:[()=>conceptQ('bars'),()=>fourFloorTask()],
  kick:[()=>drumSoloQ('kick'),()=>conceptQ('kick'),()=>fourFloorQ()],
  snare:[()=>offbeatQ(1),()=>drumSoloQ('snare'),()=>backbeatTask(),()=>conceptQ('snare')],
  hihat:[()=>drumSoloQ('hat'),()=>conceptQ('hihat'),()=>drumMissingQ()],
  patterns:[()=>fourFloorQ(),()=>swingQ(),()=>backbeatTask(),()=>conceptQ('patterns')],
  quantize:[()=>quantizeQ(),()=>conceptQ('quantize')],
  volume:[()=>balanceQ()],
  compression:[()=>compQ(1),()=>conceptQ('compression')],threshold:[()=>conceptQ('threshold')],ratio:[()=>conceptQ('ratio')],attack:[()=>conceptQ('attack')],release:[()=>conceptQ('release')],
  reverb:[()=>reverbQ(1)],panning:[()=>stereoQ(1)],stereo:[()=>stereoQ(2)]};
const PQ={
  timing:{title:'The Steady Hands Trial',why:'Your taps keep drifting off the click.',gen:()=>tapTask(),skill:'rhythm',dim:'p'},
  tempo:{title:'The Tempo Compass',why:'Tempo guesses keep missing.',gen:()=>pick([tempoQ(1),fasterQ()]),skill:'tempo',dim:'l'},
  backbeat:{title:'The Backbeat Drill',why:'The snare keeps landing off beats 2 and 4.',gen:()=>pick([backbeatTask(),offbeatQ(1)]),skill:'snare',dim:'p'},
  offbeat:{title:'The Offbeat Hunt',why:'Offbeat notes still slip past you.',gen:()=>offbeatQ(1),skill:'snare',dim:'l'},
  quantize:{title:'The Grid Whisperer',why:'Picking a quantize grid is tricky for you.',gen:()=>quantizeQ(),skill:'quantize',dim:'u'},
  drumid:{title:'The Drum Whisper',why:'Kick, snare and hats still blur together for you.',gen:()=>pick([drumSoloQ(),drumMissingQ()]),skill:'kick',dim:'l'},
  freq:{title:'The Frequency Compass',why:'Low, mid and high still get mixed up.',gen:()=>pick([toneBandQ(),freqBandQ(1)]),skill:'frequency',dim:'l'},
  pitch:{title:'The Pitch Ladder',why:'High and low notes trip you up.',gen:()=>highLowQ(1),skill:'sound',dim:'l'},
  swing:{title:'The Swing School',why:'Swing is hard for you to hear yet.',gen:()=>swingQ(),skill:'patterns',dim:'l'},
  pattern:{title:'The Pattern Reader',why:'Drum patterns are hard to read by ear.',gen:()=>fourFloorQ(),skill:'patterns',dim:'l'},
  bars:{title:'The Bar Counter',why:'Counting beats and steps is still shaky.',gen:()=>pick([fourFloorTask(),conceptQ('bars')]),skill:'bars',dim:'u'},
  balance:{title:'The Balance Beam',why:'Hearing which track is too loud is tricky.',gen:()=>balanceQ(),skill:'volume',dim:'l'},
  comp:{title:'The Squash Detective',why:'Compression is hard for you to hear.',gen:()=>compQ(1),skill:'compression',dim:'l'},
  dyn:{title:'The Fast Attack Trial',why:'Attack and release keep getting swapped.',gen:()=>pick([conceptQ('attack'),conceptQ('release')]),skill:'attack',dim:'u'},
  space:{title:'The Echo Map',why:'Room sizes still sound alike to you.',gen:()=>reverbQ(1),skill:'reverb',dim:'l'},
  stereo:{title:'The Stereo Compass',why:'Left, right and center are hard to place.',gen:()=>stereoQ(1),skill:'panning',dim:'l'}};

/* ================= Ear Gym ================= */
const GAMES=[
{id:'freq',name:'Frequency Hunter',skill:'frequency',ic:'wave',col:'#3ef0c8',gen:t=>freqBandQ(t),unlocked:()=>S.done.includes('s0'),how:'Learn “What is Sound?” in Beat Forest',tiers:['3 bands, +12 dB','5 bands, +10 dB','5 bands, +6 dB'],intro:'A mix has lows (thump), mids (body) and highs (sizzle). One version gets a boost in one range. Find it by ear.'},
{id:'tempo',name:'Tempo Sense',skill:'tempo',ic:'flame',col:'#ff7a3a',gen:t=>tempoQ(t),unlocked:()=>S.done.includes('l1'),how:'Learn “The Pulse” in Beat Forest',tiers:['Far apart','10 BPM apart','6 BPM apart'],intro:'Every genre has a home tempo. Guess the BPM of each groove. The 120 BPM reference helps you compare.'},
{id:'offbeat',name:'Offbeat Hunter',skill:'snare',ic:'drums',col:'#ff4f9a',gen:t=>offbeatQ(t),unlocked:()=>S.done.includes('l3'),how:'Learn “The Drum Trio” in Beat Forest',tiers:['Which drum?','Early or late?','Which beat?'],intro:'One note in each groove is a 16th step away from its place. Catch it.'},
{id:'comp',name:'Compressor Detective',skill:'compression',ic:'comp',col:'#ff7a3a',gen:t=>compQ(t),unlocked:()=>hasAb('dynamic'),how:'Learn dynamics in Compression Volcano',world:'volcano',tiers:['Heavy squash','Medium squash','Subtle squash'],intro:'Two drum loops at exactly the same loudness. One is compressed: flatter, denser, less jumpy. Which one?'},
{id:'reverb',name:'Reverb Detective',skill:'reverb',ic:'reverb',col:'#6cb8ff',gen:t=>reverbQ(t),unlocked:()=>false,how:'Learn reverb in Reverb Swamp',world:'swamp',tiers:['Dry, room or hall','Four spaces','Four spaces, faster'],intro:'Every space leaves a tail after each sound. Short tail = small room. Long tail = hall. Name the space.'},
{id:'stereo',name:'Stereo Hunter',skill:'panning',ic:'phones',col:'#a98bff',gen:t=>stereoQ(t),unlocked:()=>false,how:'Learn panning in Mixing Castle',world:'castle',tiers:['Left, center, right','Plus wide','Five positions'],intro:'Headphones on. Each sound sits somewhere between your left and right ear. Point to it.'}];
const gymTier=id=>(S.ear[id]&&S.ear[id].tier)||1;
function recommendGame(){const open=GAMES.filter(g=>g.unlocked());if(!open.length)return null;return open.slice().sort((a,b)=>(sk(a.skill).l)-(sk(b.skill).l))[0].id}

/* ================= quiz runner ================= */
function quiz(host,o){const res={ok:0,n:0,combo:0,maxCombo:0,list:[],hints:0};let hl=0,cur=null,alive=true;
  const top=h('div','qtop');const dots=h('div','qdots');const comboEl=h('span','chip amber');top.append(dots,comboEl);const body=h('div','quiz');host.append(top,body);
  const total=o.count||0;const mult=()=>1+Math.min(2,Math.floor(res.combo/3));
  function drawDots(){dots.innerHTML='';const n=total||Math.max(o.need||3,res.n+1);for(let i=0;i<n;i++)dots.append(h('i',res.list[i]===true?'ok':res.list[i]===false?'no':i===res.n?'cur':''));comboEl.hidden=o.mode!=='gym'||res.combo<3;comboEl.textContent='COMBO ×'+mult()}
  const finished=()=>(total&&res.n>=total)||(o.need&&res.ok>=o.need)||(o.maxQ&&res.n>=o.maxQ);
  async function next(){if(!alive||!host.isConnected)return;if(finished()){finish();return}
    hl=0;cur=o.gen(res.n);drawDots();body.innerHTML='<p class="muted">Preparing sounds…</p>';
    if(cur.prepare){initAudio();try{await withTimeout(cur.prepare(),5000)}catch(e){cur=cur.fallback?cur.fallback():conceptQ([].concat(cur.skill)[0])}}
    if(!alive||!host.isConnected)return;render(cur)}
  function render(q){body.innerHTML='';const pr=h('p','qprompt');pr.textContent=q.prompt;body.append(pr);
    if(q.type==='task'){const th=h('div','stack');body.append(th);const ctl={};let fired=false;q.render(th,(ok,msg)=>{if(fired)return;fired=true;answered(q,ok,null,msg)},ctl);
      hintBar(body,{hints:q.hints,demo:ctl.demo?()=>ctl.demo():null,demoText:q.demoText,reveal:ctl.reveal?()=>ctl.reveal():null,onLevel:l=>{hl=l;res.hints++}});return}
    if(q.plays){const pl=h('div','qplays');q.plays.forEach(p=>{const b=h('button','btn ghost',p.label);b.onclick=()=>{playQ(p.fn);b.classList.add('heard')};pl.append(b)});body.append(pl);
      if(hasAb('ears')){const sp=lowres(96,16,'viz spec');addLive(sp,specDraw);body.append(sp)}}
    const vz=h('div','vizhost');body.append(vz);if(q.viz)q.viz(vz,false);q._viz=vz;
    const op=h('div','qopts'+(q.wide?' wide':''));q.options.forEach(opt=>{const b=h('button','btn qopt',opt.label);b.dataset.v=opt.v;b.onclick=()=>answered(q,opt.v===q.answer,opt.v);op.append(b)});body.append(op);q._opts=op;
    hintBar(body,{hints:q.hints,demo:q.demo||null,demoText:q.demoText,reveal:()=>{const b=[...op.children].find(x=>x.dataset.v===q.answer);if(b)b.classList.add('reveal')},onLevel:l=>{hl=l;res.hints++}});
    if(q.plays&&o.autoplay!==false)setTimeout(()=>{if(alive&&body.isConnected&&cur===q)playQ(q.plays[0].fn)},250)}
  function answered(q,ok,v,msg){stopGroup();seq.stop();if(q._opts)[...q._opts.children].forEach(b=>{b.disabled=true;if(b.dataset.v===q.answer)b.classList.add('correct');else if(b.dataset.v===v)b.classList.add('wrong')});
    const credit=ok&&hl<4;res.n++;res.list.push(credit);if(credit){res.ok++;res.combo++;res.maxCombo=Math.max(res.maxCombo,res.combo)}else res.combo=0;
    record(q.skill,q.dim,ok,hl,q.tag);if(o.onAnswer)o.onAnswer(credit,q,res);if(credit)sfx.ok();else if(!ok)sfx.bad();haptic(credit?15:[20,40,20]);
    const fb=h('p','fb'+(ok?' good':''));fb.textContent=(credit?'✓ ':ok?'◆ Revealed answer. ':'✗ ')+(msg||(credit?'Correct. ':'')+(q.explain?q.explain(v):''));body.append(fb);
    if(q.viz&&q._viz){q._viz.innerHTML='';q.viz(q._viz,true)}
    drawDots();const nx=h('button','btn block',finished()?'FINISH ▶':'NEXT ▶');nx.onclick=()=>{sfx.tap();next()};body.append(nx);setTimeout(()=>nx.scrollIntoView({block:'nearest',behavior:'smooth'}),50)}
  function finish(){alive=false;stopGroup();seq.stop();o.onDone&&o.onDone(res)}
  next();return{stop(){alive=false;stopGroup();seq.stop()}}}

/* ================= skirmish: a lesson's mini-battle ================= */
function popIn(host,html,cls){const p=h('div','pop '+(cls||''),html);host.append(p);setTimeout(()=>p.remove(),1200)}
function seenMon(id){if(!S.seen.includes(id)){S.seen.push(id);save()}}
function skirmish(host,o){const M=MONS[o.mon];seenMon(o.mon);const hp=o.hp||3;let left=hp;
  const top=h('div','row sp');top.innerHTML=`<span class="eyebrow" style="color:var(--magenta)">${o.title||M.name.toUpperCase()}</span><span class="skhp"></span>`;
  const ar=h('div','skarena');const cv=lowres(108,40,'bg');ar.append(cv);addLive(cv,o.scene||(o.lava?drawLava:drawArena));const ms=h('div','skmon'+(o.mon==='slime'||o.mon==='peak'?' slime':''));ms.append(monEl(o.mon,o.sc||5));ar.append(ms);const hs=h('div','skhero');hs.append(heroEl(3,'bob'));ar.append(hs);
  const line=h('p','muted');line.textContent=o.intro||`${M.name} blocks the path! ${M.problem}`;
  host.append(top,ar,line);const hpEl=$('.skhp',top);const drawHp=()=>{hpEl.innerHTML='';for(let i=0;i<hp;i++)hpEl.append(h('i',i<left?'':'gone'))};drawHp();
  const qh=h('div','stack');host.append(qh);
  quiz(qh,{mode:'skirmish',need:hp,maxQ:hp+7,gen:o.gen,onAnswer:ok=>{if(ok){left--;drawHp();sfx.hit();ms.classList.remove('hurt');void ms.offsetWidth;ms.classList.add('hurt');popIn(ar,'HIT!')}else{ar.classList.remove('shake');void ar.offsetWidth;ar.classList.add('shake');sfx.hurt();popIn(ar,'MISS','miss')}},
    onDone:r=>{const won=left<=0;if(won){ms.classList.add('dead');if(!S.defeated.includes(o.mon)){S.defeated.push(o.mon);save()}sfx.victory();line.textContent=`${M.name} defeated! You used what you just learned.`}else line.textContent=`${M.name} slips away. You will meet it again in the Ear Gym.`;
      qh.innerHTML='';o.onWin&&o.onWin(won,r)}})}
