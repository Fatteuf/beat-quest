const VERSION='2.0';
/* ================= helpers ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=$('#app');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const haptic=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function rng(seed){let s=seed%2147483647||1;return()=>(s=s*16807%2147483647)/2147483647}
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const m=f<0?1+f:1;const a=f>0?f:0;r=Math.round(r*m+(255-r)*a);g=Math.round(g*m+(255-g)*a);b=Math.round(b*m+(255-b)*a);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
const dayStr=d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
const todayStr=()=>dayStr(new Date());
function parseDay(s){const p=String(s).split('-').map(Number);return new Date(p[0],p[1]-1,p[2])}
const addDays=(s,n)=>{const d=parseDay(s);d.setDate(d.getDate()+n);return dayStr(d)};
const dayDiff=(a,b)=>Math.round((parseDay(b)-parseDay(a))/864e5);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}

/* ================= pixel sprites ================= */
function drawSprite(cv,rows,pal,sc){const w=Math.max(...rows.map(r=>r.length)),h=rows.length;cv.width=w*sc;cv.height=h*sc;cv.style.width=w*sc+'px';cv.style.height=h*sc+'px';const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const c=pal[r[x]];if(c){g.fillStyle=c;g.fillRect(x*sc,y*sc,sc,sc)}}});return cv}
function sprite(rows,pal,sc,cls){const c=document.createElement('canvas');c.className='px'+(cls?' '+cls:'');return drawSprite(c,rows,pal,sc)}

const HERO=["....kkkkkkkk....","...kppppppppk...","..kphhhhhhhhpk..",".kphhhhhhhhhhpk.",".kPkhhhhhhhhkPk.",".kPkhsssssshkPk.",".kPksesssseskPk.",".kPksssssssskPk.","..kkssskkssskk..","...kksssssskk...","..kcccksskccck..",".kcccccccccccck.","kccccaaaaaacccck","kckccaaaaaacckck","kskccccccccccksk",".k.kcccccccck.k.","...kjjjjjjjjk...","...kjjjkkjjjk...","...kjjk..kjjk...","..kbbbk..kbbbk..","..kkkkk..kkkkk.."];
const PIP=[".....ka.....",".....k......","..kkkkkkkk..",".kmmmmmmmmk.",".kmkkmmkkmk.",".kmkekkekmk.",".kmmmmmmmmk.",".kmmggggmmk.",".kmmgkgkmmk.",".kmmggggmmk.","..kkkkkkkk..","...k....k..."];
const PIP_PAL={k:'#140d1f',m:'#ffb547',e:'#3ef0c8',g:'#7a4a1a',a:'#ff4f9a'};
const SLIME=["......kkkk......","....kkggggkk....","...kggggggwgk...","..kgggggggwwgk..",".kggggggggggggk.",".kggwkwggwkwggk.","kggggggggggggggk","kgggggkkkkgggggk","kddgggggggggggdk","kddddggggggddddk",".kkkkkkkkkkkkkk."];
const SLIME_PAL={k:'#140d1f',g:'#c24dff',d:'#7a2ab0',w:'#ffffff'};
const PEAK_PAL={k:'#140d1f',g:'#ff5a2a',d:'#b8322e',w:'#ffe27a'};
const METRO=[".......kk.......","......kyyk......","......kbbk......",".....kbbbbk.....",".....kbbybk.....","....kbbbybbk....","....kbbbbybk....","...kbbbbbbybk...","...kbrrbbbrrbk..","..kbbbbbbbbbbbk.","..kbbbkkkkkbbbk.",".kbbbbbbbbbbbbbk",".kyyyyyyyyyyyyyk","kkkkkkkkkkkkkkkk"];
const METRO_PAL={k:'#140d1f',b:'#8a5a34',y:'#ffcc4d',r:'#ff4f5a'};
const BEAST=["k..............k",".kk..........kk.","..kkkkkkkkkkkk..",".krrrrrrrrrrrrk.","krrwwrrrrrrwwrrk","krrkwrrrrrrwkrrk","krrrrrrrrrrrrrrk","krryyyyyyyyyyrrk","kryykyykyykyyrrk","krryyyyyyyyyyrrk","krrrrrrrrrrrrrrk",".krrk......krrk.",".kkkk......kkkk."];
const BEAST_PAL={k:'#140d1f',r:'#b8322e',w:'#ffffff',y:'#ffcc4d'};
const GNAT=[".ww......ww.","wwww....wwww","wwwwwkkwwwww",".wwkggggkww.","...kgegegk..","...kggggk...","....kddk....",".....kk....."];
const GNAT_PAL={w:'#bfe3ff',k:'#140d1f',g:'#6fd36a',e:'#ff4f9a',d:'#2f5a34'};
const GOBLIN=["k..........k","kk.kkkkkk.kk",".kkggggggkk.","..kggggggk..","..kwkggkwk..","..kggggggk..","..kgkkkkgk..","...kggggk...","..kcccccck..",".kgkcyyckgk.","..kcckkcck..","..kkk..kkk.."];
const GOBLIN_PAL={k:'#140d1f',g:'#8fbf3a',w:'#ffffff',c:'#7a4a1a',y:'#ffcc4d'};
const BAT=["k....kk....k","kk..kbbk..kk","kbk.kbbk.kbk","kbbkbbbbkbbk","kbbbwbbwbbbk",".kbbbbbbbbk.","..kbkbbkbk..","....k..k...."];
const BAT_PAL={k:'#140d1f',b:'#6c5cff',w:'#ffe27a'};
const BUG=["..k......k..","...k....k...","..kkkkkkkk..",".kaaaaaaaak.","kaawkaawkaak","kaaaaaaaaaak","kbaabaabaabk",".kaaaaaaaak.",".k.k.kk.k.k."];
const BUG_PAL={k:'#140d1f',a:'#3ef0c8',b:'#1f8a74',w:'#ffffff'};
const CASSETTE=["kkkkkkkkkk","kaaaaaaaak","kawkaawkak","kaaaaaaaak","kaakkkkaak",".k......k."];
const CASSETTE_PAL={k:'#140d1f',a:'#ff4f9a',w:'#ffffff'};
const SIL_PAL=new Proxy({},{get:(t,k)=>k==='.'?null:'#2a2248'});

const ICONS={
volume:["....dd....","....dd....","..llllll..","..laaaal..","..llllll..","....dd....","....dd....","....dd....","....dd....","...dddd..."],
drums:["..........",".llllllll.","laaaaaaaal","llllllllll","lalalalala","lalalalala","lalalalala","llllllllll",".d......d.","d........d"],
midi:["..........","aaaaaaaaaa","ldldlldldl","ldldlldldl","ldldlldldl","llllllllll","llllllllll","llllllllll","aaaaaaaaaa",".........."],
eq:["........ll",".......lal","......lal.",".....lal..","....lal...","d..lal....",".dlal.....","..dd......",".d.dd.....","d........."],
comp:["..llllll..","..laaaal..","..laaaal..","..llllll..","....dd....","....dd....","....dd....","....dd....","....dd....","...dddd..."],
reverb:["....ll....","...laal...","..laalal..",".laaalaal.",".laalaaal.","..laaaal..","...laal...","....ll....","...dddd...","..dddddd.."],
delay:["dddddddddd",".laaaaaal.","..laaaal..","...laal...","....ll....","....ll....","...l..l...","..l.aa.l..",".laaaaaal.","dddddddddd"],
dist:["....a.....","...aa.....","...aal....","..aall.a..","..alllaa..",".aallllaa.",".alllllla.",".allddlla.","..alddla..","...aaaa..."],
synth:[".......aa.","......alla","......alla",".......aa.","......d...",".....d....","....d.....","...d......","..d.......",".d........"],
auto:["l.........","l.......a.","l......a.a","l.....a...","l..a.a....","l.a.a.....","la........","l.........","llllllllll",".........."],
limiter:["llllllllll","laaaaaaaal","laddddddal","laaaaaaaal","laaaaaaaal",".laaaaaal.",".laaaaaal.","..laaaal..","...laal...","....ll...."],
mixer:[".l..l..l..",".l..l..l..",".a..l..l..",".a..l..a..",".l..a..a..",".l..a..l..",".l..l..l..",".l..l..l..","dddddddddd","dddddddddd"],
wave:["..........",".aa.......","a..a......","....a....a",".....a..a.","......aa..",".........."],
phones:[".lllllll.","l.......l","l.......l","aa.....aa","aa.....aa","aa.....aa"],
path:["....a....","...lal...","....l....",".a..l..a.",".l..l..l.",".lllllll.","....l....","....l....","...lll..."],
home:["....l....","...lal...","..laaal..",".laaaaal.","lllllllll",".l.....l.",".l.ll..l.",".l.ll..l.",".lllllll."],
flag:["la.......","laaaa....","laaaaaaa.","laaaaaa..","laaa.....","l........","l........","l........","lll......"],
scroll:["lllllllll","l.......l","l.aaaaa.l","l.......l","l.aaaa..l","l.......l","l.aaaaa.l","l.......l","lllllllll"],
chest:[".lllllll.","laaaaaaal","laaaaaaal","llllLllll","laaaLaaal","laaaaaaal","laaaaaaal","lllllllll"],
coin:["..lll..",".laaal.","laalaal","laalaal","laalaal",".laaal.","..lll.."],
heart:[".aa.aa.","alaaaaa","aaaaaaa",".aaaaa.","..aaa..","...a..."],
flame:["...l...","..ll...","..lal..",".llal.l",".laaall","laaaaal","laaaaal",".lllll."],
sword:["........ll",".......lal","......lal.",".....lal..","....lal...","d..lal....",".dlal.....","..dd......",".d.dd.....","d........."],
star:["....l....","....l....","...lal...","lllaaalll",".laaaaal.","..laaal..",".lal.lal.",".l.....l."],
lock:["..ddd..",".d...d.",".d...d.","aaaaaaa","aaalaaa","aaalaaa","aaaaaaa"],
skull:[".aaaaaa.","aaaaaaaa","a..aa..a","a..aa..a","aaaaaaaa",".aaaaaa.",".a.aa.a.",".aaaaaa."],
bolt:["....aa","...aa.","..aa..",".aaaaa","...aa.","..aa..",".aa...","aa...."]};
const DIM_PAL={l:'#3d3166',a:'#2a2248',d:'#2a2248',L:'#3d3166'};
function icPal(col){return{l:'#f1e7d0',a:col||'#ffb547',d:'#8a7fa8',L:'#ffb547'}}
function icon(name,col,sc,dimmed){return sprite(ICONS[name],dimmed?DIM_PAL:icPal(col),sc)}
const ICON_DEFAULT_COL={coin:'#ffcc4d',heart:'#ff4f9a',flame:'#ff7a3a',lock:'#6a5f9a',skull:'#ff4f9a',wave:'#3ef0c8',phones:'#3ef0c8',path:'#a98bff',bolt:'#a98bff'};

/* ================= data ================= */
const TOOLS=[
{id:'volume',name:'Volume',weapon:'Gain Fader',lv:1,world:'Starting gear',col:'#f1e7d0',desc:'Sets how loud each sound is. Every balanced mix starts here.',daw:'Every channel in every DAW has a volume fader. Mixing starts with these.',tag:'Turn it up. Or, more often, turn it down.'},
{id:'drums',name:'Drum Machine',weapon:'Rhythm Gauntlet',lv:2,world:'Beat Forest',col:'#ffb547',desc:'Programs rhythms on a 16-step grid: kick, snare, hats and bass.',daw:'Ableton Drum Rack, FL Studio Channel Rack and Logic Step Sequencer all use this same 16-step grid.',tag:'Program rhythms step by step.'},
{id:'midi',name:'MIDI',weapon:'Note Scroll',lv:3,world:'Synth Caves',col:'#a98bff',desc:'Records which notes play, when, and how hard, without recording any sound.',daw:'The piano roll in any DAW is MIDI you can see and edit.',tag:'Write music as instructions.'},
{id:'eq',name:'EQ',weapon:'Frequency Blade',lv:4,world:'EQ Desert',col:'#3ef0c8',desc:'Cuts or boosts ranges of frequencies to fix muddy or harsh sounds.',daw:'EQ Eight in Ableton, Channel EQ in Logic, Fruity Parametric EQ 2 in FL Studio.',tag:'Cut away what the sound does not need.'},
{id:'comp',name:'Compressor',weapon:'Dynamics Hammer',lv:5,world:'Compression Volcano',col:'#ff7a3a',desc:'Tames loud peaks so a sound hits with steady punch.',daw:'Threshold, ratio, attack and release: the same four knobs on every compressor.',tag:'Control the dynamics of your sounds.'},
{id:'reverb',name:'Reverb',weapon:'Space Crystal',lv:6,world:'Reverb Swamp',col:'#6cb8ff',desc:'Places a sound inside a room, a hall or a cave.',daw:'Room size, decay, pre-delay and wet/dry appear on almost every reverb.',tag:'Give your sound a place to live.'},
{id:'delay',name:'Delay',weapon:'Time Spell',lv:7,world:'Reverb Swamp',col:'#6cb8ff',desc:'Repeats a sound in time, like a musical echo.',daw:'Sync the delay time to 1/8 or 1/4 notes so echoes stay in the groove.',tag:'Bend time with echoes.'},
{id:'dist',name:'Distortion',weapon:'Ember Charm',lv:8,world:'Compression Volcano',col:'#ff4f5a',desc:'Adds grit and harmonics by pushing a sound past clean.',daw:'Saturation and overdrive plug-ins do this gently or brutally.',tag:'Add fire and grit.'},
{id:'synth',name:'Synthesizer',weapon:'Wave Staff',lv:9,world:'Synth Caves',col:'#a98bff',desc:'Builds brand-new sounds from oscillators, filters and envelopes.',daw:'Serum, Vital, Wavetable and Alchemy are all built from the same parts.',tag:'Create sounds that never existed.'},
{id:'auto',name:'Automation',weapon:'Motion Rune',lv:10,world:'Mixing Castle',col:'#ffcc4d',desc:'Moves any knob over time, so your mix breathes and builds.',daw:'Draw automation lanes under any track in any DAW.',tag:'Make your mix move.'},
{id:'limiter',name:'Limiter',weapon:'Ceiling Shield',lv:11,world:'Mastering Sky',col:'#f1e7d0',desc:'Stops your track from ever going past a set level.',daw:'The last plug-in on the master channel, set just under 0 dB.',tag:'Nothing gets past the ceiling.'}];
const TOOL_SKILLS={volume:['volume'],drums:['kick','snare','hihat','patterns','quantize'],midi:['midi','notes'],eq:['eq','frequency','masking'],comp:['compression','threshold','ratio','attack','release'],reverb:['reverb'],delay:['delay'],dist:['synthesis'],synth:['oscillators','waveforms','adsr','filters'],auto:['automation'],limiter:['limiting','loudness']};

const WORLDS=[
{id:'sky',name:'Mastering Sky',teaches:'Limiting, loudness, LUFS, headroom, exporting',boss:'The Master',x:46,y:16},
{id:'castle',name:'Mixing Castle',teaches:'Volume, gain staging, panning, stereo image, automation',boss:'The Mixing Lord',x:64,y:51},
{id:'swamp',name:'Reverb Swamp',teaches:'Reverb, delay, room size, decay, pre-delay',boss:'The Echo King',x:28,y:85},
{id:'volcano',name:'Compression Volcano',teaches:'Threshold, ratio, attack, release, punch',boss:'The Dynamic Titan',x:66,y:119},
{id:'desert',name:'EQ Desert',teaches:'Frequency, EQ, filters, masking',boss:'The Spectrum King',x:30,y:153},
{id:'caves',name:'Synth Caves',teaches:'MIDI, notes, scales, chords, oscillators, ADSR, filters, LFO',boss:'The Synth Dragon',x:64,y:187},
{id:'forest',name:'Beat Forest',teaches:'Sound, rhythm, BPM, bars, drum patterns, quantize',boss:'The Rhythm Beast',x:32,y:222}];
const WNAME=Object.fromEntries(WORLDS.map(w=>[w.id,w.name]));

const WORDER=['forest','caves','desert','volcano','swamp','castle','sky'];
const WSTAGES={forest:[
{id:'s0',kind:'LESSON',title:'What is Sound?',sub:'Vibration, pitch, low · mid · high',mins:4,icon:'wave',quest:'Discover what sound is'},
{id:'l1',kind:'LESSON',title:'The Pulse',sub:'BPM and tempo',mins:4,icon:'flame',quest:'Learn the pulse'},
{id:'l2',kind:'LESSON',title:'Bars & Beats',sub:'4/4 time and the 16-step grid',mins:5,icon:'scroll',quest:'Learn bars and beats'},
{id:'l3',kind:'LESSON',title:'The Drum Trio',sub:'Kick, snare, hi-hat',mins:5,icon:'drums',quest:'Meet the drum trio'},
{id:'slime',kind:'BATTLE',title:'Offbeat Slime',sub:'Tests: snare placement, timing',mins:3,icon:'sword',quest:'Defeat the Offbeat Slime'},
{id:'metro',kind:'MINI-BOSS',title:'Broken Metronome',sub:'Tests: tempo, quantize, backbeat',mins:5,icon:'star',quest:'Defeat the Broken Metronome'},
{id:'challenge',kind:'CHALLENGE',title:'First Beat',sub:'8 bars with kick, snare, hats and bass',mins:6,icon:'coin',quest:'Make your first beat'},
{id:'boss',kind:'WORLD BOSS',title:'The Rhythm Beast',sub:'Tests: swing, syncopation, genre, timing',mins:6,icon:'skull',quest:'Defeat the Rhythm Beast'},
{id:'trial',kind:'MASTER TRIAL',title:'Rhythm Master Trial',sub:'Fix a broken beat by ear. No multiple choice.',mins:6,icon:'bolt',quest:'Pass the Rhythm Master Trial'}],
caves:[
{id:'k1',kind:'LESSON',title:'Notes & MIDI',sub:'Keys, octaves, MIDI messages',mins:6,icon:'midi',quest:'Learn notes and MIDI',xp:450},
{id:'k2',kind:'LESSON',title:'Scales & Chords',sub:'Major, minor, triads',mins:6,icon:'midi',quest:'Learn scales and chords',xp:450},
{id:'k3',kind:'LESSON',title:'Waves & Oscillators',sub:'Sine, triangle, saw, square, wavetables',mins:6,icon:'wave',quest:'Meet the oscillators',xp:450},
{id:'k4',kind:'LESSON',title:'Shape the Sound',sub:'Filters, envelopes, LFO modulation',mins:8,icon:'synth',quest:'Shape a sound',xp:450},
{id:'ghost',kind:'MINI-BOSS',title:'Oscillator Ghost',sub:'Tests: waveforms, filters, chords',mins:6,icon:'skull',quest:'Defeat the Oscillator Ghost',xp:700},
{id:'dragon',kind:'WORLD BOSS',title:'The Synth Dragon',sub:'Tests: chords, envelopes, LFO, melody',mins:8,icon:'skull',quest:'Defeat the Synth Dragon',xp:900},
{id:'ktrial',kind:'MASTER TRIAL',title:'Sound Design Trial',sub:'Recreate three sounds by ear',mins:8,icon:'bolt',quest:'Pass the Sound Design Trial',xp:905}],
desert:[
{id:'d1',kind:'LESSON',title:'The Frequency Map',sub:'Where every instrument lives',mins:5,icon:'eq',quest:'Map the frequencies',xp:150},
{id:'d2',kind:'LESSON',title:'Cut & Boost',sub:'EQ bands, Q, high-pass filters',mins:6,icon:'eq',quest:'Learn to EQ',xp:150},
{id:'d3',kind:'LESSON',title:'Masking',sub:'When two sounds fight for space',mins:6,icon:'eq',quest:'Stop the masking',xp:150},
{id:'mud',kind:'MINI-BOSS',title:'Mud Monster',sub:'Tests: low-mid mud, rumble',mins:5,icon:'skull',quest:'Defeat the Mud Monster',xp:200},
{id:'king',kind:'WORLD BOSS',title:'The Spectrum King',sub:'Tests: bands, harshness, masking',mins:7,icon:'skull',quest:'Defeat the Spectrum King',xp:225},
{id:'dtrial',kind:'MASTER TRIAL',title:'EQ Master Trial',sub:'Fix a badly mixed track',mins:7,icon:'bolt',quest:'Pass the EQ Master Trial',xp:355}],
volcano:[
{id:'c1',kind:'LESSON',title:'Taming Peaks',sub:'Threshold, ratio, attack, release',mins:8,icon:'comp',quest:'Tame the peaks',xp:200},
{id:'v2',kind:'LESSON',title:'Over-Squashed',sub:'When compression kills the life',mins:6,icon:'comp',quest:'Learn when to stop',xp:150},
{id:'ogre',kind:'MINI-BOSS',title:'Dynamic Ogre',sub:'Tests: hearing compression, threshold, attack',mins:6,icon:'skull',quest:'Defeat the Dynamic Ogre',xp:200},
{id:'titan',kind:'WORLD BOSS',title:'The Dynamic Titan',sub:'Tests: all four controls, subtle compression',mins:8,icon:'skull',quest:'Defeat the Dynamic Titan',xp:250},
{id:'vtrial',kind:'MASTER TRIAL',title:'Compression Trial',sub:'Set a compressor from scratch',mins:6,icon:'bolt',quest:'Pass the Compression Trial',xp:430}],
swamp:[
{id:'s1',kind:'LESSON',title:'Rooms & Halls',sub:'Decay, damping, dry and wet',mins:6,icon:'reverb',quest:'Learn reverb',xp:150},
{id:'s2',kind:'LESSON',title:'Depth & Pre-delay',sub:'Near and far in a mix',mins:6,icon:'reverb',quest:'Build depth',xp:150},
{id:'s3',kind:'LESSON',title:'Echoes in Time',sub:'Synced delay, feedback, ping-pong',mins:6,icon:'delay',quest:'Learn delay',xp:150},
{id:'phantom',kind:'MINI-BOSS',title:'Mud Phantom',sub:'Tests: too much reverb, depth',mins:6,icon:'skull',quest:'Defeat the Mud Phantom',xp:200},
{id:'echoking',kind:'WORLD BOSS',title:'The Echo King',sub:'Tests: spaces, feedback, sync, depth',mins:8,icon:'skull',quest:'Defeat the Echo King',xp:225},
{id:'strial',kind:'MASTER TRIAL',title:'Space Trial',sub:'Place three sounds in depth',mins:7,icon:'bolt',quest:'Pass the Space Trial',xp:355}],
castle:[
{id:'m1',kind:'LESSON',title:'Balance & Headroom',sub:'Faders, dB, gain staging',mins:6,icon:'mixer',quest:'Balance a mix',xp:150},
{id:'m2',kind:'LESSON',title:'Left, Right, Wide',sub:'Panning and stereo image',mins:6,icon:'mixer',quest:'Learn panning',xp:150},
{id:'m3',kind:'LESSON',title:'Automation',sub:'Make the mix move',mins:6,icon:'auto',quest:'Learn automation',xp:150},
{id:'hall',kind:'MINI-BOSS',title:'The Crowded Hall',sub:'Tests: balance, panning',mins:6,icon:'skull',quest:'Clear the Crowded Hall',xp:200},
{id:'lord',kind:'WORLD BOSS',title:'The Mixing Lord',sub:'Tests: everything you know about mixing',mins:9,icon:'skull',quest:'Defeat the Mixing Lord',xp:225},
{id:'mtrial',kind:'MASTER TRIAL',title:'Mix Trial',sub:'Mix a raw multitrack',mins:8,icon:'bolt',quest:'Pass the Mix Trial',xp:355}],
sky:[
{id:'a1',kind:'LESSON',title:'Headroom & Clipping',sub:'0 dBFS and why it matters',mins:5,icon:'limiter',quest:'Learn headroom',xp:300},
{id:'a2',kind:'LESSON',title:'Loudness & LUFS',sub:'How loud a track really feels',mins:6,icon:'limiter',quest:'Measure loudness',xp:300},
{id:'a3',kind:'LESSON',title:'The Limiter',sub:'Ceiling, drive, streaming targets',mins:7,icon:'limiter',quest:'Master with a limiter',xp:300},
{id:'a4',kind:'LESSON',title:'Ship It',sub:'Export formats and final checks',mins:5,icon:'scroll',quest:'Export your music',xp:300},
{id:'golem',kind:'MINI-BOSS',title:'The Loudness Golem',sub:'Tests: clipping, over-limiting',mins:6,icon:'skull',quest:'Defeat the Loudness Golem',xp:350},
{id:'master',kind:'WORLD BOSS',title:'The Master',sub:'Tests: every world',mins:10,icon:'skull',quest:'Defeat The Master',xp:500},
{id:'final',kind:'FINAL',title:'The Final Track',sub:'Produce a complete song. Get certified.',mins:30,icon:'star',quest:'Produce the Final Track',xp:2050}]};
const STAGES=[];WORDER.forEach(w=>WSTAGES[w].forEach(st=>{st.w=w;STAGES.push(st)}));
const stageById=id=>STAGES.find(x=>x.id===id);

const COS=[
{id:'hoodie-amber',slot:'hoodie',name:'Ember',col:'#d9792a',price:0},
{id:'hoodie-moss',slot:'hoodie',name:'Moss',col:'#4f8a4a',price:0},
{id:'hoodie-midnight',slot:'hoodie',name:'Midnight',col:'#3a4a9a',price:50},
{id:'hoodie-magenta',slot:'hoodie',name:'Offbeat',col:'#c23a7a',price:null,how:'Daily quest: Balance three instruments'},
{id:'hoodie-beast',slot:'hoodie',name:'Beast Hide',col:'#b8322e',price:null,how:'Defeat the Rhythm Beast'},
{id:'phones-silver',slot:'phones',name:'Studio Silver',col:'#c9c6d8',price:0},
{id:'phones-gold',slot:'phones',name:'Gold Monitors',col:'#ffcc4d',price:80},
{id:'phones-leaf',slot:'phones',name:'Leaf Cans',col:'#6fd36a',price:null,how:'Finish the First Beat challenge'},
{id:'hair-brown',slot:'hair',name:'Brown',col:'#6b3f22',price:0},
{id:'hair-black',slot:'hair',name:'Ink',col:'#2a1f30',price:0},
{id:'hair-teal',slot:'hair',name:'Teal',col:'#2bb3a0',price:40},
{id:'comp-none',slot:'comp',name:'Solo',col:'#3d3166',price:0},
{id:'comp-cassette',slot:'comp',name:'Cassette Critter',col:'#ff4f9a',price:null,how:'Defeat the Offbeat Slime'},
{id:'kit-training',slot:'kit',name:'Training Kit',col:'#ffb547',price:0},
{id:'kit-forest',slot:'kit',name:'Forest Lo-fi Kit',col:'#6fd36a',price:null,how:'Daily quest: Create a 4-bar drum loop'},
{id:'kit-boom',slot:'kit',name:'Boom Kit',col:'#ff4f5a',price:null,how:'Pass the Rhythm Master Trial'}];
const cos=id=>COS.find(c=>c.id===id);

const QUESTS=[
{id:'lesson',title:'Finish a lesson',desc:'Any lesson in Beat Forest',goal:1,xp:30,coins:10,icon:'scroll'},
{id:'ear',title:'Finish an Ear Gym round',desc:'Any game in the Ear Gym',goal:1,xp:30,coins:10,icon:'phones',needs:'ear'},
{id:'defeat',title:'Defeat a monster',desc:'Win any battle',goal:1,xp:40,coins:20,icon:'sword'},
{id:'loop4',title:'Create a 4-bar drum loop',desc:'Play a kick + snare loop for 4 bars',goal:4,xp:40,coins:15,icon:'drums',needs:'drums',reward:'kit-forest'},
{id:'balance',title:'Balance three instruments',desc:'Move the volume of 3 different tracks',goal:3,xp:30,coins:15,icon:'volume',needs:'drums',reward:'hoodie-magenta'}];

const TIERS=[{id:'beg',name:'Beginner',sub:'Sound, rhythm and harmony'},{id:'sd',name:'Sound Design',sub:'Build sounds from scratch'},{id:'mix',name:'Mixing',sub:'Make every sound fit'},{id:'mas',name:'Mastering',sub:'Loud, clean and ready to release'}];
const SKILLS=[
['sound','Sound','beg','forest','Sound is air vibrating. Faster vibration means a higher pitch.'],
['rhythm','Rhythm','beg','forest','The pattern of hits and gaps in time.'],
['bpm','BPM','beg','forest','Beats per minute: how fast the pulse goes.'],
['beats','Beats','beg','forest','The steady pulse you tap your foot to.'],
['bars','Bars','beg','forest','Groups of beats. In 4/4, one bar is four beats.'],
['tempo','Tempo','beg','forest','The speed of a song. Each genre has a typical range.'],
['kick','Kick','beg','forest','The low thump that anchors the groove.'],
['snare','Snare','beg','forest','The crack on beats 2 and 4: the backbeat.'],
['hihat','Hi-hat','beg','forest','Quick ticks that keep time between the big hits.'],
['patterns','Drum patterns','beg','forest','How kick, snare and hats combine into a groove.'],
['quantize','Quantization','beg','forest','Snapping notes onto the grid.'],
['midi','MIDI','beg','caves','Notes as instructions: which note, when, how hard.'],
['notes','Notes','beg','caves','Named pitches: C, D, E and the rest.'],
['scales','Scales','beg','caves','Families of notes that sound good together.'],
['chords','Chords','beg','caves','Several notes played at once.'],
['oscillators','Oscillators','sd','caves','The part of a synth that makes the raw tone.'],
['waveforms','Waveforms','sd','caves','Sine, square, saw: the shape sets the character.'],
['adsr','ADSR','sd','caves','Attack, decay, sustain, release: how a note changes over time.'],
['filters','Filters','sd','caves','Remove highs or lows to shape the tone.'],
['lfo','LFO','sd','caves','A slow wave that moves another control automatically.'],
['modulation','Modulation','sd','caves','Making one control move another.'],
['synthesis','Synthesis','sd','caves','Designing a complete sound from scratch.'],
['volume','Volume','mix','castle','How loud each track is in the mix.'],
['gain','Gain staging','mix','castle','Keeping levels healthy at every step.'],
['frequency','Frequency','mix','desert','Where a sound lives, from low to high.'],
['eq','EQ','mix','desert','Boosting or cutting frequency ranges.'],
['masking','Frequency masking','mix','desert','When two sounds fight for the same frequencies.'],
['compression','Compression','mix','volcano','Turning down the loud parts automatically.'],
['attack','Attack','mix','volcano','How fast the compressor reacts.'],
['release','Release','mix','volcano','How fast the compressor lets go.'],
['ratio','Ratio','mix','volcano','How hard the compressor turns down.'],
['threshold','Threshold','mix','volcano','The level where compression starts.'],
['reverb','Reverb','mix','swamp','The sound of a space: room, hall, cave.'],
['delay','Delay','mix','swamp','Echoes repeated in time.'],
['panning','Panning','mix','castle','Placing a sound left or right.'],
['stereo','Stereo image','mix','castle','How wide the whole mix feels.'],
['automation','Automation','mix','castle','Moving controls over time.'],
['loudness','Loudness','mas','sky','How loud a track feels, not just its peaks.'],
['lufs','LUFS','mas','sky','The unit streaming services use to measure loudness.'],
['limiting','Limiting','mas','sky','A hard ceiling that stops peaks.'],
['clipping','Clipping','mas','sky','What happens when audio goes past 0 dB.'],
['headroom','Headroom','mas','sky','The safety space below 0 dB.'],
['export','Final export','mas','sky','Rendering the finished song to a file.']];
const SK=Object.fromEntries(SKILLS.map(s=>[s[0],{id:s[0],n:s[1],t:s[2],w:s[3],d:s[4]}]));

const ABILITIES=[
{id:'ears',name:'Ears Open',from:'What is Sound?',desc:'You hear in frequencies now. A live spectrum appears in every listening challenge.'},
{id:'pulse',name:'Pulse Sense',from:'The Pulse',desc:'You can feel tempo. Monsters now show their BPM in battle.'},
{id:'grid',name:'Grid Sight',from:'Bars & Beats',desc:'You see the grid. Notes that sit off the beat glow on every sequencer.'},
{id:'drumsense',name:'Drum Sense',from:'The Drum Trio',desc:'You can pick each drum out of a groove. Enemy weaknesses now name the exact drum.'},
{id:'swing',name:'Swing Technique',from:'The Rhythm Beast',desc:'You understand groove. Your studio gains a SWING knob.'},
{id:'perfect',name:'Perfect Pulse',from:'Rhythm Master Trial',desc:'Certified in rhythm. Tap challenges show your average timing in milliseconds.'},
{id:'wave',name:'Wave Shaper',from:'The Synth Dragon',desc:'You can design sounds. Pixel Wave presets (bass, pluck, pad, lead, wobble) load into your studio lead synth.'},
{id:'freqvision',name:'Frequency Vision',from:'The Spectrum King',desc:'You see hidden frequency creatures: every EQ now shows the problem curve and where it hurts.'},
{id:'dynamic',name:'Dynamic Control',from:'Taming Peaks',desc:'You understand dynamics. Your studio gains a master compressor.'},
{id:'space',name:'Space Sense',from:'The Echo King',desc:'You hear the size of any space. Your studio lead delay now locks to your tempo (a dotted 8th).'},
{id:'stereosight',name:'Stereo Sight',from:'The Mixing Lord',desc:'You see where every sound sits. Your studio gains pan knobs on every track.'},
{id:'ceiling',name:'Ceiling Guard',from:'The Master',desc:'No peak can break your ceiling. Your studio master gains a live loudness meter.'}];
const hasAb=id=>S.abilities.includes(id);

const MONS={
gnat:{name:'Hum Gnat',spr:GNAT,pal:GNAT_PAL,sc:5,world:'forest',problem:'Buzzes at pitches you cannot place.',weak:'Telling high from low'},
goblin:{name:'Timing Goblin',spr:GOBLIN,pal:GOBLIN_PAL,sc:5,world:'forest',problem:'Speeds up and slows down to trip you.',weak:'Hearing tempo'},
bat:{name:'Bar Bat',spr:BAT,pal:BAT_PAL,sc:5,world:'forest',problem:'Loses count of the bar.',weak:'Counting beats and steps'},
bug:{name:'Groove Bug',spr:BUG,pal:BUG_PAL,sc:5,world:'forest',problem:'Hides a drum inside the groove.',weak:'Telling drums apart'},
slime:{name:'Offbeat Slime',spr:SLIME,pal:SLIME_PAL,sc:5,world:'forest',problem:'Its snare lands a step late.',weak:'Snare placement'},
metro:{name:'Broken Metronome',spr:METRO,pal:METRO_PAL,sc:5,world:'forest',problem:'Drifting tempo and off-grid notes.',weak:'Tempo and quantize'},
boss:{name:'The Rhythm Beast',spr:BEAST,pal:BEAST_PAL,sc:5,world:'forest',problem:'A stiff, square groove.',weak:'Swing and syncopation'},
peak:{name:'Peak Beast',spr:SLIME,pal:PEAK_PAL,sc:5,world:'volcano',problem:'Volume spikes that crush everything else.',weak:'Compression'},
noisebat:{name:'Noise Bat',world:'caves'},spider:{name:'Frequency Spider',world:'caves'},ghost:{name:'Oscillator Ghost',world:'caves'},dragon:{name:'The Synth Dragon',world:'caves'},
mud:{name:'Mud Monster',world:'desert'},harsh:{name:'Harshness Demon',world:'desert'},worm:{name:'Frequency Worm',world:'desert'},king:{name:'The Spectrum King',world:'desert'},
ogre:{name:'Dynamic Ogre',world:'volcano'},titan:{name:'The Dynamic Titan',world:'volcano'},
echo:{name:'Echo Ghost',world:'swamp'},phantom:{name:'Mud Phantom',world:'swamp'},echoking:{name:'The Echo King',world:'swamp'},
lord:{name:'The Mixing Lord',world:'castle'},master:{name:'The Master',world:'sky'}};

const RANKS=[[1,"I don't know what BPM means.",'The start'],[10,'I can create a basic beat.','Beat Forest'],[20,'I understand MIDI and basic harmony.','Synth Caves'],[30,'I can design sounds.','Synth Caves'],[40,'I can EQ and compress.','EQ Desert · Compression Volcano'],[50,'I can mix a song.','Reverb Swamp · Mixing Castle'],[60,'I understand mastering.','Mastering Sky'],[70,'I can produce a complete track.','The Final Track']];
const TAGNAME={timing:'tapping on the beat',tempo:'guessing tempo',backbeat:'snare placement',offbeat:'spotting offbeat notes',quantize:'choosing a quantize grid',drumid:'telling drums apart',freq:'frequency ranges',pitch:'high versus low pitch',swing:'hearing swing',pattern:'reading drum patterns',balance:'mix balance',comp:'hearing compression',space:'reverb sizes',stereo:'stereo position',dyn:'compressor settings',bars:'counting bars and steps'};

/* ================= state ================= */
const emptyPat=()=>({kick:Array(16).fill(0),snare:Array(16).fill(0),hat:Array(16).fill(0),bass:Array(16).fill(0)});
function pat(spec){const p=emptyPat();for(const k in spec)spec[k].forEach(i=>{p[k][Array.isArray(i)?i[0]:i]=Array.isArray(i)?i[1]:1});return p}
const EIGHTHS=[0,2,4,6,8,10,12,14];
const DEF=()=>({v:2,xp:0,coins:20,streak:1,lastDay:null,prevDay:null,firstDay:null,done:[],lessons:0,defeated:[],seen:[],tools:['volume'],abilities:[],missions:{},skills:{},tags:{},pq:[],ear:{},timing:{n:0,sum:0},log:[],daily:{day:null,segs:{},snap:null,shown:false,active:null},hintsUsed:0,owned:COS.filter(c=>c.price===0).map(c=>c.id),eq:{hoodie:'hoodie-amber',phones:'phones-silver',hair:'hair-brown',comp:'comp-none'},kit:'kit-training',quests:{day:null,prog:{},claimed:[],moved:[]},music:true,pattern:pat({kick:[0,8],hat:EIGHTHS}),vols:{kick:.9,snare:.75,hat:.5,bass:.7},bpm:92,swing:0,mcomp:{on:false,thr:-14,ratio:3},best:null,trialBest:null});
const SAVE_KEY='beatquest-save-v1';
let S;
function migrate1(o){const n=Object.assign(DEF(),o,{v:2});const t=todayStr();n.skills={};n.abilities=[];
  const map={l1:['rhythm','bpm','beats','tempo'],l2:['bars','beats'],l3:['kick','snare','hihat','patterns'],metro:['quantize']};
  Object.keys(map).forEach(st=>{if((o.done||[]).includes(st))map[st].forEach(id=>{n.skills[id]={u:45,l:30,p:30,learned:t,box:1,due:addDays(t,1)}})});
  [['l1','pulse'],['l2','grid'],['l3','drumsense'],['boss','swing']].forEach(([st,ab])=>{if((o.done||[]).includes(st))n.abilities.push(ab)});
  n.seen=[...(o.defeated||[])];delete n.mastery;return n}
function load(){let raw=null;try{raw=JSON.parse(localStorage.getItem(SAVE_KEY))}catch(e){raw=null}adopt(raw)}
function adopt(raw){if(raw&&raw.v===1)raw=migrate1(raw);
  S=raw&&raw.v===2?Object.assign(DEF(),raw):DEF();
  const t=todayStr();if(!S.firstDay)S.firstDay=t;
  if(S.lastDay!==t){S.prevDay=S.lastDay;S.streak=S.lastDay===addDays(t,-1)?S.streak+1:(S.lastDay?1:S.streak);S.lastDay=t}
  if(S.quests.day!==t)S.quests={day:t,prog:{},claimed:[],moved:[]};
  if(S.daily.day!==t)S.daily={day:t,segs:{},snap:null,shown:false,active:null};
  if(!S.daily.snap)S.daily.snap={beg:tierMastery('beg'),sk:Object.fromEntries(Object.keys(S.skills).map(k=>[k,ovr(k)]))};
  saveLocal()}
/* saving: this device first (instant), then the player's claude.ai account when the page runs there */
const hasProgress=s=>!!(s&&(s.xp>0||(s.done&&s.done.length)||s.resetAt));
function saveLocal(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function save(){if(hasProgress(S))S.savedAt=Date.now();saveLocal();cloudQueue()}
const CLOUD={ref:null,on:false,timer:0,writing:false,again:false,dirty:false};
function cloudQueue(){if(!CLOUD.on)return;CLOUD.dirty=true;clearTimeout(CLOUD.timer);CLOUD.timer=setTimeout(cloudPush,2500)}
async function cloudPush(){if(!CLOUD.on||!CLOUD.dirty)return;clearTimeout(CLOUD.timer);if(CLOUD.writing){CLOUD.again=true;return}CLOUD.writing=true;CLOUD.dirty=false;
  try{await CLOUD.ref.set({v:2,t:S.savedAt||0,state:JSON.stringify(S)})}
  catch(e){const c=e&&e.code;if(c==='unavailable'||c==='resource_exhausted')setTimeout(cloudQueue,5000);else CLOUD.on=false}
  CLOUD.writing=false;if(CLOUD.again){CLOUD.again=false;cloudQueue()}}
async function cloudInit(){try{if(!window.claude||!window.claude.use)return;const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);if(!db||!user)return;
  const id=await user.id();if(!id)return;const ref=db.doc('data/users/'+id+'/save');const snap=await ref.get();CLOUD.ref=ref;CLOUD.on=true;
  let remote=null;if(snap.exists){const d=snap.data();try{remote=d&&typeof d.state==='string'?JSON.parse(d.state):null}catch(e){remote=null}}
  if(hasProgress(remote)&&(!hasProgress(S)||(remote.savedAt||0)>(S.savedAt||0))){adopt(remote);const safe=['title','home','map','region','path','train','quests','studio'];go(safe.includes(cur)?cur:'home');setTimeout(()=>toast('PROGRESS RESTORED FROM YOUR ACCOUNT'),300)}
  else if(hasProgress(S)&&(!remote||(S.savedAt||0)>(remote.savedAt||0))){CLOUD.dirty=true;cloudPush()}}catch(e){}}
const needXp=n=>n<10?70+15*(n-1):205;
const cum=n=>{let s2=0;for(let k=1;k<n;k++)s2+=needXp(k);return s2};
function level(){let n=1;while(cum(n+1)<=S.xp)n++;return n}
function lvProg(){const n=level();return{n,cur:Math.round(S.xp-cum(n)),need:Math.round(cum(n+1)-cum(n))}}
const rankFor=lv=>{let r=RANKS[0];RANKS.forEach(x=>{if(lv>=x[0])r=x});return r};
const rankNext=lv=>RANKS.find(x=>x[0]>lv);
const has=t=>S.tools.includes(t);
function addMission(t){S.missions[t]=(S.missions[t]||0)+1}
const nextStage=()=>STAGES.find(x=>!S.done.includes(x.id));
function worldDone(w){return WSTAGES[w||'forest'].every(x=>S.done.includes(x.id))}
function worldOpen(w){const i=WORDER.indexOf(w);return i<=0||worldDone(WORDER[i-1])}
const curWorldId=()=>{const n=nextStage();return n?n.w:'sky'};
function stageState(id){if(S.done.includes(id))return'done';const st=stageById(id);if(!st||!worldOpen(st.w))return'locked';const n=WSTAGES[st.w].find(x=>!S.done.includes(x.id));return n&&n.id===id?'current':'locked'}

/* ================= learning engine: mastery, memory, weaknesses ================= */
function sk(id){return S.skills[id]||(S.skills[id]={u:0,l:0,p:0,learned:null,box:0,due:null})}
function ovr(id){const s=S.skills&&S.skills[id];return s?Math.round((s.u+s.l+s.p)/3):0}
function gain(ids,dim,amt){[].concat(ids).forEach(id=>{if(!SK[id]||!amt)return;const s=sk(id);s[dim]=clamp(s[dim]+amt*(1-s[dim]/115),0,100)})}
function loss(ids,dim,amt){[].concat(ids).forEach(id=>{if(!SK[id])return;const s=sk(id);s[dim]=clamp(s[dim]-amt,0,100)})}
const BOX_DAYS=[1,3,7,14,30];
function learn(ids){const t=todayStr();[].concat(ids).forEach(id=>{const s=sk(id);if(!s.learned){s.learned=t;s.box=1;s.due=addDays(t,1);logEv('learn',id)}})}
const learnedSkills=()=>Object.keys(S.skills).filter(k=>S.skills[k].learned);
function dueSkills(){const t=todayStr();return learnedSkills().filter(id=>{const s=S.skills[id];return s.due&&dayDiff(s.due,t)>=0&&SKILL_Q[id]}).sort((a,b)=>dayDiff(S.skills[b].due,S.skills[a].due))}
function nextRecall(){const l=learnedSkills().filter(id=>SKILL_Q[id]&&S.skills[id].due);if(!l.length)return null;l.sort((a,b)=>dayDiff(S.skills[b].due,S.skills[a].due));return{id:l[0],days:Math.max(0,dayDiff(todayStr(),S.skills[l[0]].due))}}
function recallResult(id,ok){const s=sk(id),t=todayStr();if(ok){s.box=Math.min(5,s.box+1);s.due=addDays(t,BOX_DAYS[s.box-1])}else{s.box=1;s.due=addDays(t,1)}}
function tierMastery(t){const list=SKILLS.filter(s=>s[2]===t);return list.reduce((a,s)=>a+ovr(s[0]),0)/list.length}
function skillVisible(id){const s=S.skills[id];return!!(s&&(s.learned||s.u+s.l+s.p>0))||SK[id].w==='forest'}
function logEv(k,skill,tag){S.log.push({d:todayStr(),k,s:skill||null,g:tag||null});if(S.log.length>120)S.log.shift()}
function tagResult(tag,ok){if(!tag)return;const g=S.tags[tag]||(S.tags[tag]={a:0,e:0,r:[]});g.a++;if(!ok)g.e++;g.r.push(ok?1:0);if(g.r.length>6)g.r.shift();
  if(!ok&&PQ[tag]&&g.r.slice(-4).filter(x=>!x).length>=2&&!S.pq.some(q=>q.tag===tag)&&S.pq.length<3){S.pq.push({tag,prog:0,goal:3,day:todayStr()});logEv('pq',PQ[tag].skill,tag);setTimeout(()=>toast('PERSONAL QUEST · '+PQ[tag].title.toUpperCase(),'violet'),400)}}
function record(skills,dim,ok,hl,tag){const f=[1,.75,.5,.25,0][clamp(hl||0,0,4)];if(ok)gain(skills,dim,9*f);else loss(skills,dim,2);tagResult(tag,ok&&(hl||0)<3);logEv(ok?'ok':'err',[].concat(skills)[0],tag);save()}
function weakTags(){return Object.keys(S.tags).filter(t=>S.tags[t].a>=2).map(t=>[t,S.tags[t].e/S.tags[t].a]).filter(x=>x[1]>=.34).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}
function memoryLine(){const t=todayStr();const due=dueSkills();const pq=S.pq[0];
  if(!S.done.length)return'Welcome, producer! Every sound you will ever make starts with one idea: vibration. Let’s find out what that means.';
  if(pq)return`I noticed ${PQ[pq.tag].why.toLowerCase()} So I built you a personal trial: ${PQ[pq.tag].title}.`;
  const gap=S.prevDay?dayDiff(S.prevDay,t):0;
  if(gap>=3&&due.length)return`Welcome back! It’s been ${gap} days. Let’s refresh ${SK[due[0]].n} before it fades.`;
  const prevErr={};S.log.filter(e=>e.k==='err'&&e.d===S.prevDay&&e.g&&TAGNAME[e.g]).forEach(e=>{prevErr[e.g]=(prevErr[e.g]||0)+1});
  const worst=Object.keys(prevErr).sort((a,b)=>prevErr[b]-prevErr[a])[0];
  if(worst&&prevErr[worst]>=2)return`Last time, ${TAGNAME[worst]} gave you trouble. We’ll warm up with it today.`;
  if(due.length)return`${due.length} skill${due.length>1?'s are':' is'} ready to recall. Remembering right before you forget is how memory gets strong.`;
  if(S.timing.n>=8){const avg=S.timing.sum/S.timing.n*1000;if(Math.abs(avg)>30)return`Your taps land about ${Math.round(Math.abs(avg))} ms ${avg>0?'late':'early'} on average. Try to ${avg>0?'move with':'wait for'} the click.`}
  const wk=weakTags()[0];if(wk)return`Your weakest spot right now is ${TAGNAME[wk]||wk}. A few reps in the Ear Gym will fix that.`;
  if(S.streak>=2)return`Day ${S.streak} in a row! Short daily sessions beat one long cram.`;
  const n=nextStage();return n?`Next up: ${n.title}. ${n.sub}.`:'Beat Forest is yours. Keep your ears sharp in the Ear Gym.'}

/* ================= audio ================= */
const A={ctx:null,octx:null,route:null};
function transparentComp(k){k.threshold.value=0;k.ratio.value=1;k.knee.value=0;k.attack.value=.003;k.release.value=.25}
function initAudio(){
  if(A.ctx){if(A.ctx.state!=='running'){const p=A.ctx.resume();if(p&&p.catch)p.catch(()=>{})}return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const c=A.ctx=new C();
  A.master=c.createGain();A.master.gain.value=.9;
  const lim=c.createDynamicsCompressor();lim.threshold.value=-2;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.002;lim.release.value=.1;
  A.an=c.createAnalyser();A.an.fftSize=1024;
  A.bus=c.createGain();A.busComp=c.createDynamicsCompressor();transparentComp(A.busComp);A.bus.connect(A.busComp);A.busComp.connect(A.master);
  A.sfxBus=c.createGain();A.sfxBus.gain.value=.55;A.sfxBus.connect(A.master);
  A.master.connect(lim);lim.connect(A.an);A.an.connect(c.destination);
  const len=c.sampleRate;A.noise=c.createBuffer(1,len,c.sampleRate);const d=A.noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
}
const now=()=>A.ctx?A.ctx.currentTime:0;
const AC=()=>A.octx||A.ctx, OUT=()=>A.route||A.bus;
function withRoute(node,fn){const prev=A.route;A.route=node;try{return fn()}finally{A.route=prev}}
function tone(t,type,f,dur,v,fEnd,dest){const c=AC();const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(fEnd)o.frequency.exponentialRampToValueAtTime(fEnd,t+dur);g.gain.setValueAtTime(Math.max(v,.0001),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest||OUT());o.start(t);o.stop(t+dur+.03)}
function noiseHit(t,dur,v,type,freq,q,dest){const c=AC();const s=c.createBufferSource();s.buffer=A.noise;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q||.7;const g=c.createGain();g.gain.setValueAtTime(Math.max(v,.0001),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest||OUT());s.start(t,Math.random()*.5);s.stop(t+dur+.03)}
const SEMI=[0,0,3,5,7,10],NOTES=['','A','C','D','E','G'];
const V={
  kick(t,v=.9){if(!A.ctx)return;const k=S.kit,f=k==='kit-forest',b=k==='kit-boom';tone(t,'sine',b?110:f?125:165,b?.8:f?.46:.36,v*1.1,b?34:f?38:44);noiseHit(t,.015,v*.25,'highpass',f?1800:3000)},
  snare(t,v=.75){if(!A.ctx)return;const k=S.kit,f=k==='kit-forest',b=k==='kit-boom';if(b){noiseHit(t,.12,v*.75,'highpass',1600,.7);tone(t,'triangle',230,.07,v*.5,130);return}noiseHit(t,f?.22:.17,v*.7,f?'bandpass':'highpass',f?1700:1300,f?.9:.7);tone(t,'triangle',f?165:200,.09,v*.5,110)},
  hat(t,v=.5){if(!A.ctx)return;const k=S.kit;noiseHit(t,k==='kit-forest'?.06:k==='kit-boom'?.03:.045,v*.42,'highpass',k==='kit-forest'?6200:k==='kit-boom'?9500:8200)},
  bass(t,n,v=.7){if(!A.ctx||!n)return;const c=AC(),fr=110*Math.pow(2,SEMI[n]/12);const o=c.createOscillator(),o2=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o2.type='sine';o.frequency.value=fr;o2.frequency.value=fr/2;lp.type='lowpass';lp.Q.value=5;lp.frequency.setValueAtTime(1600,t);lp.frequency.exponentialRampToValueAtTime(260,t+.25);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(v*.45,.0002),t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.34);o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(OUT());o.start(t);o2.start(t);o.stop(t+.4);o2.stop(t+.4)},
  click(t,acc){if(!A.ctx)return;tone(t,'square',acc?1760:1320,.035,acc?.28:.18)},
  sine(t,f,dur,v){if(!A.ctx)return;const c=AC();const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(v,.0002),t+.03);g.gain.setValueAtTime(Math.max(v,.0002),t+Math.max(.05,dur-.1));g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(OUT());o.start(t);o.stop(t+dur+.05)},
  pluck(t,f,dur,v,det){if(!A.ctx)return;const c=AC();const o=c.createOscillator(),o2=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain(),m=c.createGain();o.type='triangle';o2.type='sawtooth';o.frequency.value=f;o2.frequency.value=f;if(det){o.detune.value=det;o2.detune.value=det}m.gain.value=.35;lp.type='lowpass';lp.frequency.setValueAtTime(5000,t);lp.frequency.exponentialRampToValueAtTime(900,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(v,.0002),t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur+.25);o2.connect(m);m.connect(lp);o.connect(lp);lp.connect(g);g.connect(OUT());o.start(t);o2.start(t);o.stop(t+dur+.3);o2.stop(t+dur+.3)},
  sawpad(t,freqs,dur,v){if(!A.ctx)return;const c=AC();freqs.forEach(fr=>{const o=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=fr;o.detune.value=(Math.random()-.5)*10;lp.type='lowpass';lp.frequency.value=7000;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.05);g.gain.setValueAtTime(v,t+dur-.1);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(lp);lp.connect(g);g.connect(OUT());o.start(t);o.stop(t+dur+.05)})},
  pad(t,freqs,dur,v){if(!A.ctx)return;const c=AC();freqs.forEach(fr=>{const o=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();o.type='triangle';o.frequency.value=fr;o.detune.value=(Math.random()-.5)*14;lp.type='lowpass';lp.frequency.value=900;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.9);g.gain.setValueAtTime(v,t+dur-.6);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(lp);lp.connect(g);g.connect(OUT());o.start(t);o.stop(t+dur+.05)})}};
function playStep(p,s,t,vol){vol=vol||{};const i=s%16;if(p.kick&&p.kick[i])V.kick(t,vol.kick??.9);if(p.snare&&p.snare[i])V.snare(t,vol.snare??.75);if(p.hat&&p.hat[i])V.hat(t,vol.hat??.5);if(p.bass&&p.bass[i])V.bass(t,p.bass[i],vol.bass??.7);if(p.lead&&p.lead[i])SV(t,leadF(p.lead[i]),.2,S.leadPatch||PRESETS.LEAD,(vol.lead??.6)*.5)}
const leadF=n=>440*Math.pow(2,SEMI[n]/12);
function audition(tk,val){initAudio();if(!A.ctx)return;const t=now()+.01;if(tk==='bass')V.bass(t,val,S.vols.bass);else if(tk==='lead')SV(t,leadF(val),.25,S.leadPatch||PRESETS.LEAD,.3);else V[tk](t,S.vols[tk])}
function schedPattern(p,bpm,bars,t0,opt){opt=opt||{};const spb=60/bpm/4;for(let s=0;s<16*bars;s++){const i=s%16;playStep(p,s,t0+s*spb+(opt.swing&&i%4===2?opt.swing*spb:0),opt.vol)}return 16*bars*spb}
function clickTrack(bpm,n,t0){for(let k=0;k<n;k++)V.click(t0+k*60/bpm,k%4===0)}
function musicBed(t0){const spb=60/100/4;const p=pat({kick:[0,8,10],snare:[4,12],hat:EIGHTHS,bass:[[0,1],[3,1],[8,2],[11,5]]});for(let s=0;s<32;s++)playStep(p,s,t0+s*spb,{kick:.8,snare:.6,hat:.5,bass:.6});V.sawpad(t0,[220,261.6,329.6],16*spb,.045);V.sawpad(t0+16*spb,[196,246.9,392],16*spb,.045);return 32*spb}
/* playback groups: every new listening example stops the previous one */
let GRP=null;
function newGroup(){stopGroup();const g=A.ctx.createGain();g.connect(A.bus);GRP=g;return g}
function stopGroup(){if(!GRP)return;const g=GRP;GRP=null;try{g.gain.setTargetAtTime(0,now(),.015)}catch(e){}setTimeout(()=>{try{g.disconnect()}catch(e){}},300)}
function playQ(fn){initAudio();if(!A.ctx)return;stopMusic();seq.stop();fn(newGroup())}
/* offline rendering: used for loudness-matched A/B tests */
async function renderOffline(dur,chain,sched){const sr=A.ctx.sampleRate;const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;const oc=new OC(2,Math.ceil(dur*sr),sr);const inp=oc.createGain();const last=chain?chain(oc,inp):inp;last.connect(oc.destination);A.octx=oc;try{withRoute(inp,()=>sched(.05))}finally{A.octx=null}return await oc.startRendering()}
function rms(b){let s=0,n=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i+=2){s+=d[i]*d[i];n++}}return Math.sqrt(s/Math.max(1,n))||1e-6}
function peak(b){let m=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);if(v>m)m=v}}return m}
function scaleBuf(b,g){const o=A.ctx.createBuffer(b.numberOfChannels,b.length,b.sampleRate);for(let c=0;c<b.numberOfChannels;c++){const s=b.getChannelData(c),d=o.getChannelData(c);for(let i=0;i<s.length;i++)d[i]=s[i]*g}return o}
function matchLoudness(a,b){const target=.08;let ga=target/rms(a),gb=target/rms(b);const pk=Math.max(peak(a)*ga,peak(b)*gb);if(pk>.7){ga*=.7/pk;gb*=.7/pk}return[scaleBuf(a,ga),scaleBuf(b,gb)]}
function withTimeout(p,ms){return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))])}
let LIVECOMP=null;function liveComp(){if(LIVECOMP&&LIVECOMP.context===A.ctx&&GRP&&LIVECOMP._g===GRP)return LIVECOMP;const k=A.ctx.createDynamicsCompressor();k.threshold.value=-24;k.ratio.value=8;k.knee.value=2;k.attack.value=.003;k.release.value=.12;const mk=A.ctx.createGain();mk.gain.value=.55;k.connect(mk);mk.connect(OUT());k._g=GRP;LIVECOMP=k;return k}
function playBuf(b,dest){const s=A.ctx.createBufferSource();s.buffer=b;s.connect(dest);s.start(now()+.03);return s}

const sfx={
  tap(){if(!A.ctx)return;tone(now(),'square',880,.04,.12,null,A.sfxBus)},
  seq(ns,type='square',step=.07,v=.14,dur=.12){if(!A.ctx)return;const t=now();ns.forEach((f,i)=>tone(t+i*step,type,f,dur,v,null,A.sfxBus))},
  ok(){this.seq([523,659,784])},
  bad(){this.seq([330,247],'square',.1,.12,.16)},
  coin(){this.seq([988,1319],'square',.08,.12,.2)},
  hit(){if(!A.ctx)return;const t=now();noiseHit(t,.18,.6,'lowpass',2200,1,A.sfxBus);tone(t,'square',420,.2,.18,90,A.sfxBus)},
  crit(){this.hit();this.seq([784,1047,1319,1568],'square',.05,.12,.1)},
  miss(){if(!A.ctx)return;tone(now(),'triangle',600,.3,.2,150,A.sfxBus)},
  hurt(){if(!A.ctx)return;noiseHit(now(),.25,.5,'bandpass',500,2,A.sfxBus);tone(now(),'sawtooth',200,.25,.12,60,A.sfxBus)},
  level(){this.seq([523,659,784,1047,1319],'square',.09,.14,.2)},
  unlock(){if(!A.ctx)return;this.seq([392,523,659,784,1047],'triangle',.12,.22,.5);const t=now()+.7;[1047,1319,1568].forEach(f=>tone(t,'square',f,.9,.06,null,A.sfxBus))},
  ability(){if(!A.ctx)return;this.seq([330,494,659,988,1319],'triangle',.1,.2,.6);const t=now()+.6;[659,831,988].forEach(f=>tone(t,'sine',f,1.2,.08,null,A.sfxBus))},
  victory(){this.seq([523,523,523,698,880,784,880,1047],'square',.11,.13,.14)},
  start(){this.seq([262,392,523,784],'square',.06,.14,.15)}};

class Looper{
  start(o){this.stop();initAudio();if(!A.ctx)return;this.o=o;this.on=true;this.step=0;this.next=now()+.08;this.q=[];
    this.timer=setInterval(()=>this.tick(),25);this.tick();
    const ui=()=>{while(this.q.length&&this.q[0][1]<=now()){const s=this.q.shift()[0];o.onStep&&o.onStep(s)}if(this.on||this.q.length)this.raf=requestAnimationFrame(ui)};this.raf=requestAnimationFrame(ui)}
  tick(){const o=this.o;while(this.on&&this.next<now()+.12){if(o.total&&this.step>=o.total){const end=this.next;this.on=false;clearInterval(this.timer);setTimeout(()=>{o.onEnd&&o.onEnd()},Math.max(0,(end-now())*1000));break}
    const st=this.step,tt=this.next;withRoute(o.route||null,()=>o.play(st,tt));this.q.push([st,tt]);const bpm=typeof o.bpm==='function'?o.bpm():o.bpm;this.next+=60/bpm/4;this.step++}}
  stop(){const was=this.on;this.on=false;clearInterval(this.timer);cancelAnimationFrame(this.raf);this.q=[];if(was&&this.o&&this.o.onStop)this.o.onStop()}}
const seq=new Looper(),music=new Looper();
const CHORDS=[[220,261.6,329.6,392],[174.6,220,261.6,329.6],[196,261.6,329.6,392],[196,246.9,293.7,392]];
const PENTA=[440,523.3,587.3,659.3,784];
function startMusic(){if(!S.music||!A.ctx||music.on)return;const r=rng(7);
  music.start({bpm:78,play:(s,t)=>{const i=s%16,bar=Math.floor(s/16);
    if(i===0)V.pad(t,CHORDS[bar%4],60/78*4,.035);
    if(i===0||i===10)V.kick(t,.3);if(i===4||i===12)V.snare(t,.12);if(i%4===2)V.hat(t,.12);
    if(r()<.16&&i%2===0)tone(t,'triangle',PENTA[Math.floor(r()*5)],.5,.05)}})}
function stopMusic(){music.stop()}

/* ================= animated canvases ================= */
const live=[];let lastFrame=0;
function addLive(cv,draw){live.push({cv,draw})}
function frame(ts){requestAnimationFrame(frame);if(ts-lastFrame<80)return;lastFrame=ts;const t=ts/1000;
  for(let i=live.length-1;i>=0;i--){const L=live[i];if(!L.cv.isConnected){live.splice(i,1);continue}if(L.cv.offsetParent===null)continue;L.draw(L.cv.getContext?L.cv.getContext('2d'):null,t,L.cv)}}
requestAnimationFrame(frame);
function lowres(W,H,cls){const c=document.createElement('canvas');c.width=W;c.height=H;c.className='px'+(cls?' '+cls:'');return c}
function px(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0)}
function pine(g,cx,base,h,col,hi){for(let r=0;r<h;r++){const w=Math.floor(r*.42)+1;px(g,cx-w,base-h+r,w*2+1,1,col);if(hi&&r%4===3)px(g,cx-w,base-h+r,2,1,hi)}px(g,cx,base,1,3,'#2a1a12')}
function drawForest(g,t,cv,opt){const W=cv.width,H=cv.height;opt=opt||{};
  const sky=['#0d0a1c','#130f28','#1a1436','#221a44'];const hz=Math.floor(H*.62);
  for(let y=0;y<hz;y++){const b=Math.min(3,Math.floor(y/hz*4));px(g,0,y,W,1,sky[b]);const nb=Math.min(3,Math.floor((y+2)/hz*4));if(nb!==b)for(let x=(y%2);x<W;x+=2)px(g,x,y,1,1,sky[nb])}
  for(let y=hz;y<H;y++)px(g,0,y,W,1,y%3?'#16261b':'#1a2d1f');
  const r=rng(opt.seed||3);for(let i=0;i<26;i++){const x=Math.floor(r()*W),y=Math.floor(r()*hz*.7);if(Math.sin(t*2+i*1.7)>-.3)px(g,x,y,1,1,i%5?'#6a5f9a':'#f1e7d0')}
  const mx=Math.floor(W*.8),my=Math.floor(H*.17),mr=Math.max(4,Math.min(10,Math.floor(H*.07)));for(let y=-mr;y<=mr;y++)for(let x=-mr;x<=mr;x++)if(x*x+y*y<=mr*mr)px(g,mx+x,my+y,1,1,(x+2)*(x+2)+(y-1)*(y-1)<3?'#e8cf94':'#ffe7b0');
  const r2=rng(11);for(let x=-4;x<W+6;x+=5)pine(g,x+Math.floor(r2()*3),hz+2,10+Math.floor(r2()*8),'#1a2440');
  const r3=rng(23);for(let x=-6;x<W+8;x+=9)pine(g,x+Math.floor(r3()*4),hz+10,16+Math.floor(r3()*10),'#15301f','#1f4a2c');
  const r4=rng(5);for(let i=0;i<W/4;i++){const x=Math.floor(r4()*W),y=hz+12+Math.floor(r4()*Math.max(1,H-hz-12));px(g,x,y,1,2,'#2f5a34');px(g,x+1,y+1,1,1,'#2f5a34')}
  [[.12,.9],[.9,.86],[.62,.94]].forEach(([fx,fy],i)=>{const x=Math.floor(W*fx),y=Math.floor(H*fy);px(g,x,y,1,2,'#d8c9a8');const on=Math.sin(t*1.5+i)>0;px(g,x-1,y-1,3,1,on?'#ff4f9a':'#b8337a')});
  for(let i=0;i<9;i++){const x=(W*(.1+.8*((i*.37)%1))+Math.sin(t*.7+i)*6)|0,y=(hz-6+Math.cos(t*.9+i*2)*8+(i%3)*5)|0;if(Math.sin(t*3+i*2.3)>.1){px(g,x,y,1,1,'#ffe27a');if(Math.sin(t*3+i)>.8)px(g,x-1,y,3,1,'rgba(255,226,122,.35)')}}}
function drawArena(g,t,cv){drawForest(g,t,cv,{seed:9});const W=cv.width,H=cv.height;for(let x=0;x<W;x++){const y=Math.floor(H*.8+Math.sin(x*.2)*1.5);px(g,x,y,1,H-y,x%2?'#1b3122':'#1d3525')}}
function drawLava(g,t,cv){const W=cv.width,H=cv.height;for(let y=0;y<H;y++)px(g,0,y,W,1,y<H*.6?['#1a0c10','#221014','#2c1216'][Math.floor(y/(H*.6)*3)]:'#301818');
  for(let x=0;x<W;x+=3){const hh=Math.floor(4+3*Math.sin(x*.3+t*2));px(g,x,H*.6-hh,3,hh,'#3f2222')}
  for(let i=0;i<12;i++){const x=(i*37+Math.floor(t*8)*(i%3+1))%W,y=H-4-((t*10+i*9)%Math.floor(H*.5));px(g,x,y,1,1,i%2?'#ff5a2a':'#ffb547')}
  for(let x=0;x<W;x++){const y=Math.floor(H*.82+Math.sin(x*.25+t)*1.5);px(g,x,y,1,H-y,x%3?'#ff5a2a':'#ff7a3a')}}

function drawMap(g){const W=96,H=238,B=34;const r=rng(42);const clear=worldDone();
  for(let y=0;y<B;y++)px(g,0,y,W,1,['#1b2350','#223066','#2a3a7a','#314488'][Math.floor(y/B*4)]);
  for(let i=0;i<5;i++){const x=Math.floor(r()*80),y=4+Math.floor(r()*24);px(g,x,y,12,2,'#8e9ad6');px(g,x+3,y-1,6,1,'#b8c2f0')}
  px(g,36,20,22,4,'#4a3f6a');px(g,38,24,18,2,'#3a3058');px(g,42,17,10,3,'#6d6590');
  let y0=B;for(let y=y0;y<y0+B;y++)px(g,0,y,W,1,y%2?'#2a2644':'#2d2848');
  px(g,50,y0+8,30,20,'#4a4460');for(let x=50;x<80;x+=4)px(g,x,y0+5,2,3,'#4a4460');px(g,58,y0+2,8,26,'#5a5378');px(g,58,y0,2,2,'#5a5378');px(g,64,y0,2,2,'#5a5378');px(g,61,y0+18,3,6,'#1a1426');
  [[53,y0+12],[74,y0+12],[60,y0+8],[63,y0+8]].forEach(([x,y])=>px(g,x,y,2,2,'#ffb547'));
  for(let i=0;i<6;i++)pine(g,6+i*6,y0+30,6+(i%3)*2,'#1e2a3a');
  y0=2*B;for(let y=y0;y<y0+B;y++)px(g,0,y,W,1,'#1a302c');for(let i=0;i<9;i++){const x=Math.floor(r()*80),y=y0+6+Math.floor(r()*24);px(g,x,y,10+Math.floor(r()*8),2,'#2b5550')}
  [[12,y0+10],[48,y0+6],[80,y0+14]].forEach(([x,y])=>{px(g,x,y,1,14,'#3a2e24');px(g,x-3,y+3,3,1,'#3a2e24');px(g,x+1,y+6,3,1,'#3a2e24')});
  for(let i=0;i<5;i++)px(g,Math.floor(r()*80),y0+2+Math.floor(r()*28),14,1,'rgba(200,220,210,.18)');
  y0=3*B;for(let y=y0;y<y0+B;y++)px(g,0,y,W,1,y%3?'#2c1818':'#301a1a');
  for(let rr=0;rr<22;rr++){const w=Math.floor(rr*.9)+2;px(g,30-w,y0+8+rr,w*2,1,'#3f2222')}px(g,27,y0+7,6,2,'#ff5a2a');
  for(let y=y0+9;y<y0+B;y++)px(g,31+Math.floor(Math.sin(y*.5)*2)+Math.floor((y-y0)*.4),y,2,1,'#ff5a2a');
  for(let i=0;i<8;i++)px(g,54+Math.floor(r()*38),y0+4+Math.floor(r()*26),3,2,'#4a2626');
  y0=4*B;for(let y=y0;y<y0+B;y++)px(g,0,y,W,1,y%4?'#7a5c32':'#86663a');
  for(let i=0;i<7;i++){const x=Math.floor(r()*86),y=y0+4+Math.floor(r()*26);px(g,x,y,10,1,'#a8844a')}
  [[70,y0+10],[84,y0+20],[10,y0+22]].forEach(([x,y])=>{px(g,x,y,2,8,'#3f6b3a');px(g,x-2,y+2,2,1,'#3f6b3a');px(g,x-2,y,1,2,'#3f6b3a');px(g,x+2,y+3,2,1,'#3f6b3a');px(g,x+3,y+1,1,2,'#3f6b3a')});
  y0=5*B;for(let y=y0;y<y0+B;y++)px(g,0,y,W,1,y%2?'#221d38':'#261f3e');
  for(let i=0;i<7;i++){const x=Math.floor(r()*86),y=y0+2+Math.floor(r()*26);px(g,x,y,8,6,'#2f2850')}px(g,74,y0+12,16,10,'#100c1e');px(g,76,y0+10,12,2,'#100c1e');
  [[20,y0+8,'#6c5cff'],[40,y0+22,'#3ef0c8'],[88,y0+4,'#6c5cff'],[10,y0+26,'#3ef0c8']].forEach(([x,y,c])=>{px(g,x,y,2,4,c);px(g,x+2,y+1,1,3,c)});
  y0=6*B;for(let y=y0;y<H;y++)px(g,0,y,W,1,y%3?'#16301e':'#1a3522');
  const r5=rng(8);for(let i=0;i<22;i++){const x=Math.floor(r5()*96),yy=y0+6+Math.floor(r5()*30);if(Math.abs(x-32)<10&&Math.abs(yy-222)<9)continue;pine(g,x,yy,7+Math.floor(r5()*5),clear?'#2c6a3a':'#1f4a2c',clear?'#3f8a4a':'#2c5a36')}
  for(let k=1;k<7;k++){const y=k*B;for(let x=0;x<W;x+=2)px(g,x+(k%2),y-1,1,2,'rgba(0,0,0,.4)')}
  for(let k=0;k<6;k++){const yy=k*B;px(g,0,yy,W,B,'rgba(8,6,16,.35)');for(let y=yy;y<yy+B;y++)for(let x=(y%2);x<W;x+=2)px(g,x,y,1,1,'rgba(8,6,16,.4)')}
  const pts=[...WORLDS].reverse();for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const d=Math.hypot(b.x-a.x,b.y-a.y);for(let s=0;s<d;s+=3){const x=a.x+(b.x-a.x)*s/d,y=a.y+(b.y-a.y)*s/d;px(g,x,y,1,1,i===0?'#ffb547':'#6a5f9a')}}
  if(clear){px(g,44,211,1,8,'#f1e7d0');px(g,45,211,5,3,'#3ef0c8')}}

function drawStudio(g,t,cv){const W=cv.width,H=cv.height,fl=44;
  for(let y=0;y<fl;y++)px(g,0,y,W,1,y%8===7?'#1d1532':'#241a3c');for(let y=0;y<fl;y+=8)for(let x=(y/8%2)*6;x<W;x+=12)px(g,x,y,1,8,'#1d1532');
  for(let y=fl;y<H;y++)px(g,0,y,W,1,y%4===0?'#2e2019':'#3a2a20');
  px(g,8,8,22,18,'#0d0a1c');px(g,8,8,22,1,'#5a4a7a');px(g,8,25,22,1,'#5a4a7a');px(g,8,8,1,18,'#5a4a7a');px(g,29,8,1,18,'#5a4a7a');px(g,18,8,1,18,'#5a4a7a');px(g,24,11,3,3,'#ffe7b0');
  [[11,12],[14,18],[21,20]].forEach(([x,y],i)=>{if(Math.sin(t*2+i)>0)px(g,x,y,1,1,'#f1e7d0')});
  px(g,80,5,14,16,'#ff4f9a');px(g,81,6,12,14,'#2a1030');px(g,84,9,2,7,'#ffb547');px(g,86,9,4,2,'#ffb547');px(g,88,11,2,5,'#ffb547');px(g,83,15,3,2,'#ffb547');px(g,87,15,3,2,'#ffb547');
  if(S.done.includes('challenge')){for(let y=fl+3;y<H-1;y++)px(g,20,y,68,1,y%2?'#5a2a4a':'#6a3258')}
  px(g,28,36,54,3,'#6a4630');px(g,28,39,54,1,'#4a3020');px(g,31,40,2,10,'#4a3020');px(g,77,40,2,10,'#4a3020');
  const glow=(Math.sin(t*6)>.6)?'#6ff8dc':'#3ef0c8';px(g,50,26,16,10,'#140d1f');px(g,51,27,14,8,glow);px(g,52,29,6,1,'#0b2a24');px(g,52,31,9,1,'#0b2a24');px(g,48,36,20,1,'#8a7fa8');
  if(has('drums')){px(g,31,30,15,6,'#2a2248');px(g,31,30,15,1,'#5a4a7a');const pl=seq.on?Math.floor(t*6)%4:-1;['#ffb547','#ff4f9a','#3ef0c8','#a98bff'].forEach((c,i)=>px(g,32+i*3.5,32,3,3,pl===i?'#ffffff':c))}
  if(has('comp')){px(g,67,31,10,5,'#2a1a1a');px(g,67,31,10,1,'#8a5a34');const m=seq.on?Math.floor((Math.sin(t*9)+1)*3):1;px(g,68,33,m+1,2,'#ff5a2a')}
  if(S.done.includes('l3')){[[18,27],[84,27]].forEach(([x,y])=>{const p=seq.on&&Math.floor(t*8)%2?1:0;px(g,x,y,8,18,'#1a1426');px(g,x+1,y+3-p,6,6,'#3d3166');px(g,x+3,y+5-p,2,2,'#0d0a1c');px(g,x+2,y+11,4,4,'#3d3166')})}
  if(S.defeated.includes('slime')){px(g,98,34,6,8,'#8a5a34');px(g,97,34,8,1,'#a8744a');px(g,99,28,2,6,'#4f8a4a');px(g,96,30,3,2,'#6fd36a');px(g,101,27,3,3,'#6fd36a');px(g,98,26,2,2,'#6fd36a')}
  if(S.done.includes('trial')){px(g,36,10,10,12,'#ffcc4d');px(g,37,11,8,10,'#2a1a06');px(g,40,13,2,6,'#ffcc4d');px(g,38,14,6,1,'#ffcc4d')}}
function scopeDraw(g,t,cv){const W=cv.width,H=cv.height;px(g,0,0,W,H,'#08060f');for(let x=0;x<W;x+=8)px(g,x,0,1,H,'#140f24');px(g,0,H/2,W,1,'#1d1736');if(!A.an)return;const d=new Uint8Array(A.an.fftSize);A.an.getByteTimeDomainData(d);for(let x=0;x<W;x++){const v=d[Math.floor(x/W*d.length)]/128-1;const y=Math.floor(H/2-v*H*.9);px(g,x,clamp(y,0,H-1),1,1,'#ffb547')}}
function specDraw(g,t,cv){const W=cv.width,H=cv.height;px(g,0,0,W,H,'#08060f');if(!A.an)return;const d=new Uint8Array(A.an.frequencyBinCount);A.an.getByteFrequencyData(d);const n=W/3;for(let i=0;i<n;i++){const idx=Math.floor(Math.pow(i/n,2)*d.length*.6);const v=d[idx]/255;const hh=Math.floor(v*H);for(let y=0;y<hh;y+=2)px(g,i*3,H-1-y,2,1,y>H*.7?'#ff4f9a':y>H*.4?'#ffb547':'#3ef0c8')}}

/* ================= teaching visualisations ================= */
const LOGX=(f,W)=>Math.log10(f/20)/Math.log10(1000)*W;
function axisRow(labels){const r=h('div','row sp vizcap');labels.forEach(l=>r.append(h('span',null,l)));return r}
const FRAC=f=>Math.log10(f/20)/Math.log10(1000);
function axisAt(list){const r=h('div','vizcap');r.style.cssText='position:relative;height:14px';list.forEach(([t,fr])=>{const s=h('span',null,t);s.style.cssText=`position:absolute;top:0;white-space:nowrap;left:${(fr*100).toFixed(1)}%;transform:translateX(${fr<.12?0:fr>.88?-100:-50}%)`;r.append(s)});return r}
function freqRuler(host,f){const W=120,H=22,cv=lowres(W,H,'viz');const g=cv.getContext('2d');px(g,0,0,W,H,'#08060f');
  [[20,250,'#1d2a3a'],[250,4000,'#2a2248'],[4000,20000,'#1d3530']].forEach(([a,b,c])=>px(g,LOGX(a,W),0,LOGX(b,W)-LOGX(a,W),H,c));
  [100,1000,10000].forEach(v=>px(g,LOGX(v,W),0,1,H,'#3d3166'));
  if(f){const x=Math.floor(LOGX(f,W));px(g,x-1,2,3,H-4,'#ffb547');px(g,x,0,1,H,'#ffe27a')}
  host.append(cv,axisAt([['LOW',FRAC(70)],['MID',FRAC(1000)],['HIGH',FRAC(9000)]]))}
function eqViz(host,prm){const W=120,H=44,cv=lowres(W,H,'viz');const g=cv.getContext('2d');px(g,0,0,W,H,'#08060f');
  [[20,250,'#161f2c'],[250,4000,'#1c1834'],[4000,20000,'#142824']].forEach(([a,b,c])=>px(g,LOGX(a,W),0,LOGX(b,W)-LOGX(a,W),H,c));
  [100,1000,10000].forEach(v=>px(g,LOGX(v,W),0,1,H,'#2a2248'));px(g,0,H/2,W,1,'#3d3166');
  let mags=null;if(prm&&A.ctx){const bq=A.ctx.createBiquadFilter();bq.type='peaking';bq.frequency.value=prm.f;bq.Q.value=prm.q;bq.gain.value=prm.g;const fr=new Float32Array(W),mg=new Float32Array(W),ph=new Float32Array(W);for(let x=0;x<W;x++)fr[x]=20*Math.pow(1000,x/W);bq.getFrequencyResponse(fr,mg,ph);mags=mg}
  for(let x=0;x<W;x++){const db=mags?20*Math.log10(mags[x]):0;const y=Math.round(H/2-db/15*(H/2-3));px(g,x,y,1,2,prm?'#3ef0c8':'#6a5f9a')}
  host.append(cv,axisAt([['100 Hz',FRAC(100)],['1 kHz',FRAC(1000)],['10 kHz',FRAC(10000)]]))}
function waveViz(host,list){list.forEach(([buf,label])=>{const W=120,H=26,cv=lowres(W,H,'viz');const g=cv.getContext('2d');px(g,0,0,W,H,'#08060f');const d=buf.getChannelData(0);const step=Math.floor(d.length/W);let mx=0;for(let i=0;i<d.length;i++)mx=Math.max(mx,Math.abs(d[i]));
  for(let x=0;x<W;x++){let m=0;for(let i=x*step;i<(x+1)*step;i++)m=Math.max(m,Math.abs(d[i]));const hh=Math.max(1,Math.round(m/mx*(H/2-1)));px(g,x,H/2-hh,1,hh*2,'#ffb547')}
  host.append(h('span','vizcap',label),cv)})}
function roomViz(host,name){const W=120,H=40,cv=lowres(W,H,'viz');const g=cv.getContext('2d');px(g,0,0,W,H,'#08060f');const sp=SPACES[name];
  const size={DRY:0,'SMALL ROOM':.3,'LARGE ROOM':.62,HALL:.95}[name];const bw=Math.round(40*size+8),bh=Math.round(24*size+6);const x0=6,y0=H-bh-4;
  if(size){px(g,x0,y0,bw,1,'#a98bff');px(g,x0,y0+bh,bw,1,'#a98bff');px(g,x0,y0,1,bh,'#a98bff');px(g,x0+bw,y0,1,bh+1,'#a98bff')}
  px(g,x0+4,H-8,3,3,'#ffb547');
  const tail=sp.rt?Math.round(sp.rt/2.8*60):0;px(g,60,H-14,58,1,'#2a2248');for(let x=0;x<tail;x++){const v=Math.round(10*Math.pow(.001,x/Math.max(1,tail)));px(g,60+x,H-14-v,1,v,'#3ef0c8')}px(g,60,H-24,2,10,'#ffb547');
  host.append(cv,axisRow([size?name:'NO ROOM',sp.rt?`TAIL ${sp.rt} s`:'NO TAIL']))}
function stereoViz(host,name){const W=120,H=36,cv=lowres(W,H,'viz');const g=cv.getContext('2d');px(g,0,0,W,H,'#08060f');const cx=60,cy=H-4;
  for(let a=0;a<=180;a+=3){const r=a*Math.PI/180;px(g,cx+Math.cos(r)*52,cy-Math.sin(r)*28,1,1,'#3d3166')}
  px(g,cx-4,cy-6,8,6,'#f0c08a');px(g,cx-6,cy-4,2,3,'#c9c6d8');px(g,cx+4,cy-4,2,3,'#c9c6d8');
  const pos={LEFT:-1,'HALF LEFT':-.5,CENTER:0,'HALF RIGHT':.5,RIGHT:1}[name];
  if(name==='WIDE'){for(let a=15;a<=165;a+=6){const r=a*Math.PI/180;px(g,cx+Math.cos(r)*46-1,cy-Math.sin(r)*24-1,3,3,'#3ef0c8')}}
  else{const r=(90-pos*80)*Math.PI/180;px(g,cx+Math.cos(r)*46-2,cy-Math.sin(r)*24-2,5,5,'#ffb547')}
  host.append(cv,axisRow(['LEFT','CENTER','RIGHT']))}
function tempoViz(host,bpm){const l=h('div','lamp go');l.style.setProperty('--dur',(60/bpm).toFixed(3)+'s');l.style.width=l.style.height='44px';host.append(l,axisRow([`${bpm} BPM`,bpm<96?'hip-hop · lo-fi':bpm<116?'pop · R&B':bpm<133?'house · techno':'trap · dubstep']))}
function gridViz(host,p,tracks,marks){const d=h('div');host.append(d);const g=grid(d,{tracks,pat:p,edit:false});if(marks)g.mark(marks);return g}
function laneViz(host,pos,kicks){const X=p=>(3+p/16*94)+'%';const lane=h('div','lane');for(let i=0;i<16;i++){const l=h('i','gl'+(i%4===0?' b':''));l.style.left=X(i);lane.append(l)}(kicks||[]).forEach(p=>{const k=h('i','nt k');k.style.left=X(p);lane.append(k)});const nts=pos.map(p=>{const n=h('i','nt');n.style.left=X(p);lane.append(n);return n});host.append(lane);return{lane,nts,X,setGrid(g){$$('.gl',lane).forEach((l,i)=>l.classList.toggle('g',g>0&&i%g===0))},move(ps){nts.forEach((n,i)=>n.style.left=X(ps[i]))}}}

/* ================= hero rendering ================= */
function heroPal(){const c=id=>cos(id).col;const ph=c(S.eq.phones);return{k:'#140d1f',h:c(S.eq.hair),p:ph,P:shade(ph,-.3),s:'#f0c08a',e:'#140d1f',c:c(S.eq.hoodie),a:'#ffe9c2',j:'#2e3160',b:'#3a2618'}}
function heroEl(sc,cls){return sprite(HERO,heroPal(),sc,cls)}
function pipEl(sc,cls){return sprite(PIP,PIP_PAL,sc,cls)}
function companionEl(sc){return S.eq.comp==='comp-cassette'?sprite(CASSETTE,CASSETTE_PAL,sc,'bob'):null}
function monEl(id,sc,cls){const m=MONS[id];return m&&m.spr?sprite(m.spr,m.pal,sc||m.sc,cls):sprite(SLIME,SIL_PAL,sc||4,cls)}

/* ================= UI primitives ================= */
function h(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function toast(msg,cls){const t=h('div','toast'+(cls?' '+cls:''));t.textContent=msg;app.append(t);setTimeout(()=>t.remove(),2900)}
function modal(inner,opt){opt=opt||{};const back=h('div','modal-back'+(opt.cls?' '+opt.cls:''));const m=h('div',(opt.cls||'').includes('dramatic')?'modal':'modal win'+(opt.left?' left':''));
  if(typeof inner==='string')m.innerHTML=inner;else m.append(inner);back.append(m);app.append(back);back.close=()=>back.remove();
  if(opt.dismiss)back.addEventListener('click',e=>{if(e.target===back)back.remove()});return back}
function coinRow(n){return`<span class="row" style="justify-content:center;gap:8px"><span data-ic="coin"></span><b>+${n}</b> COINS</span>`}
function hydrateIcons(root){$$('[data-ic]',root).forEach(el=>{const name=el.dataset.ic;const col=el.dataset.col||ICON_DEFAULT_COL[name];const sc=+el.dataset.sc||3;const pal=el.dataset.dim?DIM_PAL:icPal(col);
  if(el.tagName==='CANVAS')drawSprite(el,ICONS[name],pal,sc);else el.replaceWith(sprite(ICONS[name],pal,sc))})}
function reward(o){return new Promise(res=>{const before=lvProg();S.xp+=o.xp||0;S.coins+=o.coins||0;(o.cosmetics||[]).forEach(id=>{if(!S.owned.includes(id))S.owned.push(id)});save();const after=lvProg();
  const rb=rankFor(before.n),ra=rankFor(after.n);
  const items=[];if(o.xp)items.push(`<b>+${o.xp}</b> XP`);if(o.coins)items.push(coinRow(o.coins));(o.lines||[]).forEach(l=>items.push(l));(o.cosmetics||[]).forEach(id=>items.push(`<span style="color:var(--violet)">NEW ${cos(id).slot==='kit'?'DRUM KIT':'COSMETIC'}: ${cos(id).name.toUpperCase()}</span>`));
  const m=modal(`<p class="eyebrow">${o.eyebrow||'REWARD'}</p><h2 class="rw-t">${o.title}</h2>${o.sub?`<p class="muted">${o.sub}</p>`:''}<div class="rw-list">${items.map((x,i)=>`<div class="rw-i" style="animation-delay:${i*.15}s">${x}</div>`).join('')}</div>
  <div style="width:100%" class="stack"><div class="row sp"><span class="eyebrow">PRODUCER LV <span class="rw-lv">${before.n}</span></span><span class="num muted rw-xp" style="font-size:18px">${before.cur}/${before.need} XP</span></div><div class="bar"><i class="rw-bar" style="width:${before.cur/before.need*100}%"></i></div><p class="lvup" hidden></p>${ra[0]>rb[0]?`<p class="fb good" style="width:100%">NEW RANK · LV ${ra[0]}: “${ra[1]}”</p>`:''}</div>
  <button class="btn block rw-go">${o.btn||'CONTINUE'}</button>`);
  hydrateIcons(m);sfx.coin();
  setTimeout(()=>{const bar=$('.rw-bar',m);if(!bar)return;if(after.n>before.n){bar.style.width='100%';setTimeout(()=>{bar.style.transition='none';bar.style.width='0%';void bar.offsetWidth;bar.style.transition='';bar.style.width=after.cur/after.need*100+'%';$('.rw-lv',m).textContent=after.n;const up=$('.lvup',m);up.hidden=false;up.textContent='LEVEL UP! PRODUCER LV '+after.n;sfx.level();haptic([30,40,30])},650)}else bar.style.width=after.cur/after.need*100+'%';$('.rw-xp',m).textContent=after.cur+'/'+after.need+' XP'},450);
  $('.rw-go',m).onclick=()=>{sfx.tap();m.close();res()}})}
function unlockTool(id){if(!S.tools.includes(id))S.tools.push(id);save();const t=TOOLS.find(x=>x.id===id);
  return new Promise(res=>{const m=modal(`<div class="unlock"><div class="rays"></div><p class="eyebrow" style="color:var(--amber);position:relative">NEW TOOL UNLOCKED</p><div class="ul-icon"></div><h2>${t.name.toUpperCase()}</h2><p class="weapon">WEAPON FORM · ${t.weapon.toUpperCase()}</p><p style="font-size:18px">“${t.tag}”</p><p class="muted" style="max-width:32ch">${t.daw}</p><button class="btn block big ul-try">TRY IT NOW</button><button class="btn ghost block ul-later">LATER</button></div>`,{cls:'dramatic'});
    $('.ul-icon',m).append(icon(id,t.col,10));sfx.unlock();haptic([20,60,20,60,80]);
    $('.ul-try',m).onclick=()=>{m.close();res('try')};$('.ul-later',m).onclick=()=>{m.close();res('later')}})}
function unlockAbility(id){if(hasAb(id))return Promise.resolve();S.abilities.push(id);save();const a=ABILITIES.find(x=>x.id===id);
  return new Promise(res=>{const m=modal(`<div class="unlock"><div class="rays"></div><p class="eyebrow" style="color:var(--violet);position:relative">ABILITY UNLOCKED</p><div class="ul-icon"></div><h2>${a.name.toUpperCase()}</h2><p class="because">BECAUSE YOU LEARNED: ${a.from.toUpperCase()}</p><p style="font-size:17px;max-width:32ch">${a.desc}</p><button class="btn violet block big ab-ok">I FEEL IT</button></div>`,{cls:'dramatic violetbg'});
    $('.ul-icon',m).append(icon('bolt','#a98bff',12));sfx.ability();haptic([30,50,30,50,90]);$('.ab-ok',m).onclick=()=>{m.close();res()}})}
function bump(id,n,set){const q=QUESTS.find(x=>x.id===id);if(!q||S.quests.claimed.includes(id))return;if(q.needs==='drums'&&!has('drums'))return;const p=S.quests.prog;const before=p[id]||0;p[id]=clamp(set!=null?set:before+(n||1),0,q.goal);if(before<q.goal&&p[id]>=q.goal){toast('QUEST COMPLETE · '+q.title.toUpperCase());sfx.coin()}save()}
let typing=null;
function typeText(el,text){if(typing)typing.finish();return new Promise(res=>{el.textContent='';let i=0;
  const fin=()=>{clearInterval(tm);el.textContent=text;typing=null;res()};
  const tm=setInterval(()=>{i+=2;el.textContent=text.slice(0,i);if(i%8===0&&A.ctx)tone(now(),'square',1100+Math.random()*300,.015,.03,null,A.sfxBus);if(i>=text.length)fin()},20);
  typing={finish:fin}})}

/* ================= widgets ================= */
const TR={kick:{n:'KICK',c:'#ffb547'},snare:{n:'SNARE',c:'#ff4f9a'},hat:{n:'HI-HAT',c:'#3ef0c8'},bass:{n:'BASS',c:'#a98bff'},lead:{n:'LEAD',c:'#6cb8ff'}};
function grid(host,o){host.innerHTML='';host.classList.add('seq');const cells={};
  const br=h('div','beatrow');for(let i=0;i<16;i++)br.append(h('span',i%4?'':'b',i%4?['','e','&amp;','a'][i%4]:String(i/4+1)));host.append(br);
  o.tracks.forEach(tk=>{const row=h('div','trk');const hd=h('div','trk-h',`<span class="dot" style="background:${TR[tk].c}"></span><span>${TR[tk].n}</span>`);
    if(o.faders){const f=h('input');f.type='range';f.min=0;f.max=100;f.value=Math.round(S.vols[tk]*100);f.id='vol-'+tk;f.setAttribute('aria-label',TR[tk].n+' volume');const vv=h('span','vv',f.value);
      f.oninput=()=>{S.vols[tk]=f.value/100;vv.textContent=f.value};f.onchange=()=>{gain('volume','p',2);if(!S.quests.moved.includes(tk)){S.quests.moved.push(tk);bump('balance',0,S.quests.moved.length)}save()};hd.append(f,vv)}
    row.append(hd);const cs=h('div','cells');cells[tk]=[];const ed=o.edit===true||!!(o.edit&&o.edit[tk]);
    for(let i=0;i<16;i++){const b=h('button','cell'+(i%4===0?' beat':''));b.style.setProperty('--c',TR[tk].c);b.setAttribute('aria-label',`${TR[tk].n} step ${i+1}`);if(!ed)b.classList.add('lockc');
      b.onclick=()=>{if(!ed)return;if(tk==='bass'||tk==='lead')o.pat[tk][i]=(o.pat[tk][i]+1)%6;else o.pat[tk][i]=o.pat[tk][i]?0:1;paint();if(o.pat[tk][i])audition(tk,o.pat[tk][i]);haptic(6);o.onChange&&o.onChange(tk,i)};
      cells[tk].push(b);cs.append(b)}
    row.append(cs);host.append(row)});
  let lastCol=-1;const sight=()=>hasAb('grid');
  function paint(){o.tracks.forEach(tk=>cells[tk].forEach((b,i)=>{const v=o.pat[tk][i];b.classList.toggle('on',!!v);b.classList.toggle('off',!!v&&sight()&&tk!=='hat'&&tk!=='bass'&&tk!=='lead'&&i%4!==0);b.textContent=(tk==='bass'||tk==='lead')&&v?NOTES[v]:''}))}
  paint();
  return{paint,step(i){if(lastCol>=0)o.tracks.forEach(tk=>cells[tk][lastCol].classList.remove('ph'));lastCol=i;if(i>=0)o.tracks.forEach(tk=>cells[tk][i].classList.add('ph'))},setPat(p){if(o.pat!==p){o.pat=p;paint()}},
    mark(list){list.forEach(([tk,i])=>cells[tk]&&cells[tk][i]&&cells[tk][i].classList.add('demo'))},clearMarks(){o.tracks.forEach(tk=>cells[tk].forEach(b=>b.classList.remove('demo')))}}}

function tapWidget(host,o,onResult){const taps=o.taps||8;
  host.innerHTML=`<div class="tapw"><div class="tapdots">${'<i></i>'.repeat(taps)}</div><button class="pad" aria-label="Tap pad">TAP</button><p class="tapmsg">${o.intro||'Press START. Four clicks count you in, then tap on every click.'}</p><p class="tapstat" hidden></p><button class="btn" data-a="start">START · ${o.bpm} BPM</button></div>`;
  const pad=$('.pad',host),msg=$('.tapmsg',host),stat=$('.tapstat',host),dots=$$('.tapdots i',host),startB=$('[data-a=start]',host);let beats=[],active=false,offs=[];const timers=[];
  const hit=e=>{if(e)e.preventDefault();if(!active||!A.ctx)return;pad.classList.add('pressed');setTimeout(()=>pad.classList.remove('pressed'),90);haptic(10);
    const lat=(A.ctx.outputLatency||A.ctx.baseLatency||0);const tt=now()-lat;let best=-1,bd=9;beats.forEach((b,i)=>{const d=Math.abs(tt-b.t);if(!b.hit&&d<bd){bd=d;best=i}});
    if(best>=0&&bd<.25)offs.push(tt-beats[best].t);
    if(best>=0&&bd<(o.tol||.13)){beats[best].hit=true;dots[best].className='hit';msg.textContent=bd<.05?'PERFECT!':(tt<beats[best].t?'Good (a little early)':'Good (a little late)')}else if(best>=0){const d=tt-beats[best].t;msg.textContent=d<0?'Too early. Wait for the click.':'Too late. Tap with the click, not after it.'}};
  pad.addEventListener('pointerdown',hit);
  const key=e=>{if(!host.isConnected){document.removeEventListener('keydown',key);return}if(e.code==='Space'&&active)hit(e)};document.addEventListener('keydown',key);
  startB.onclick=()=>{initAudio();if(!A.ctx)return;stopMusic();stopGroup();startB.disabled=true;dots.forEach(d=>d.className='');offs=[];const spb=60/o.bpm;const t0=now()+.35;beats=[];
    for(let k=0;k<4+taps;k++){const t=t0+k*spb;V.click(t,k%4===0);if(o.groove)V.hat(t,.25);if(k>=4)beats.push({t,hit:false});
      timers.push(setTimeout(()=>{if(!host.isConnected)return;pad.classList.add('flash');setTimeout(()=>pad.classList.remove('flash'),110);if(k<4){msg.textContent='Count-in… '+(k+1);if(k===3)setTimeout(()=>{active=true;msg.textContent='TAP!'},spb*500)}else{dots.forEach(d=>d.classList.remove('now'));if(!dots[k-4].className)dots[k-4].classList.add('now')}},(t-now())*1000))}
    const endT=t0+(4+taps)*spb;timers.push(setTimeout(()=>{if(!host.isConnected)return;active=false;dots.forEach((d,i)=>{if(!beats[i].hit)d.className='miss'});const n=beats.filter(b=>b.hit).length;const pass=n>=o.need;startB.disabled=false;startB.textContent='TRY AGAIN';
      if(offs.length){S.timing.n+=offs.length;S.timing.sum+=offs.reduce((a,b)=>a+b,0);save();if(hasAb('perfect')){const avg=offs.reduce((a,b)=>a+b,0)/offs.length*1000;stat.hidden=false;stat.textContent=`Average timing: ${avg>0?'+':''}${Math.round(avg)} ms ${Math.abs(avg)<15?'(dead on)':avg>0?'(late)':'(early)'}`}}
      msg.textContent=pass?`${n}/${taps} on the beat. Locked in!`:`${n}/${taps} on the beat. You need ${o.need}. Count “1, 2, 3, 4” out loud and tap on each number.`;onResult({pass,n})},(endT-now())*1000+250))};
  return{stop(){timers.forEach(clearTimeout);active=false}}}
function demoTaps(bpm){initAudio();if(!A.ctx)return;const g=newGroup();const spb=60/bpm,t0=now()+.1;withRoute(g,()=>{for(let k=0;k<8;k++){V.click(t0+k*spb,k%4===0);if(k>=4)tone(t0+k*spb,'triangle',660,.09,.35)}})}

function abWidget(host,items,onBoth){host.innerHTML='';const wrap=h('div','ab');const heard=new Set();const scope=lowres(96,24,'scope');addLive(scope,scopeDraw);
  items.forEach((it,i)=>{const b=h('button','abbtn',`<span class="L">${'AB'[i]}</span><b style="font-family:var(--f-disp);font-size:12px">${it.label}</b><small>${it.note}</small>`);
    b.onclick=()=>{stopMusic();stopGroup();const was=b.classList.contains('playing')&&seq.on;$$('.abbtn',wrap).forEach(x=>x.classList.remove('playing'));if(was){seq.stop();return}b.classList.add('playing');
      seq.start({bpm:it.bpm,total:32,play:(s,t)=>it.play(s,t),onStep:s=>{it.onStep&&it.onStep(s);if(s===8){b.classList.add('heard');heard.add(i);if(heard.size===items.length&&onBoth)onBoth()}},onEnd:()=>b.classList.remove('playing')})};
    wrap.append(b)});
  host.append(wrap,scope)}
function abBuffers(host,items,onBoth){const wrap=h('div','ab');const heard=new Set();const viz=h('div','vizhost');
  items.forEach((it,i)=>{const b=h('button','abbtn',`<span class="L">${'AB'[i]}</span><b style="font-family:var(--f-disp);font-size:12px">${it.label}</b><small>${it.note}</small>`);
    b.onclick=()=>{$$('.abbtn',wrap).forEach(x=>x.classList.remove('playing'));b.classList.add('playing');playQ(d=>playBuf(it.buf,d));heard.add(i);b.classList.add('heard');if(heard.size===items.length){if(!viz.childElementCount)waveViz(viz,items.map(x=>[x.buf,x.label]));onBoth&&onBoth()}};wrap.append(b)});
  host.append(wrap,viz)}
/* three-step hints: clue, sharper clue, demonstration, then the answer */
function hintBar(host,o){const bar=h('div','hintbar');let lv=0;const b=h('button','btn ghost sm','HINT');const txt=h('p','hinttxt');const hs=o.hints||[];
  b.onclick=()=>{lv++;S.hintsUsed++;o.onLevel&&o.onLevel(lv);sfx.tap();
    if(lv===1){txt.textContent=hs[0]||'Listen again carefully.';b.textContent='MORE HELP'}
    else if(lv===2){txt.textContent=hs[1]||hs[0]||'Compare the two versions.';b.textContent=o.demo?'SHOW ME':'REVEAL ANSWER'}
    else if(lv===3&&o.demo){o.demo();txt.textContent=o.demoText||'Watch and listen. Then try it yourself.';if(o.reveal)b.textContent='REVEAL ANSWER';else b.disabled=true}
    else{if(o.reveal)o.reveal();txt.textContent='Here is the answer. Study it, then use it.';b.disabled=true;if(!o.demo)o.onLevel&&o.onLevel(4)}
    save()};
  bar.append(b,txt);host.append(bar);return{level:()=>lv}}
