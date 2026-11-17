/* ================= MY REWARDS: every reward in the game, and where it lives in the studio =================
   One index of tools, abilities, certificates and cosmetics, grouped by world. Tapping an owned reward takes you to it
   (or puts it on, for cosmetics). Rewards not seen yet in the studio are marked NEW (S.rwSeen). */
const RW_WCOL={forest:'#6fd36a',caves:'#a98bff',desert:'#ffcc4d',volcano:'#ff7a3a',swamp:'#6cb8ff',castle:'#f1e7d0',sky:'#8e9ad6',bunker:'#ff3d7f',quests:'#3ef0c8',shop:'#ffb547'};
const RW_GNAME=g=>g==='quests'?'Daily quests':g==='shop'?'Shop':WNAME[g];
const TOOL_FROM={drums:'metro',midi:'k1',synth:'k3',eq:'d2',comp:'c1',dist:'titan',reverb:'s1',delay:'s3',auto:'m3',limiter:'a3',groovebox:'t1'};
const TOOL_WHERE={volume:'The volume fader on every track',drums:'The drum machine',midi:'The MIDI · PIANO ROLL panel',synth:'EDIT LEAD SOUND, and the sound of your piano roll',eq:'The EQ button in the MIX RACK',comp:'The MASTER COMPRESSOR panel',
  dist:'The DRIVE knob in the MIX RACK',reverb:'The VERB knobs in the MIX RACK',delay:'The LEAD DELAY knob in the MIX RACK',auto:'The AUTOMATION panel',limiter:'LIMITER and CEILING in the MIX RACK',groovebox:'The BUNKER BOX panel'};
const ABIL_FROM={ears:'s0',pulse:'l1',grid:'l2',drumsense:'l3',swing:'boss',perfect:'trial',wave:'dragon',freqvision:'king',dynamic:'c1',space:'echoking',stereosight:'lord',ceiling:'master',rumblecraft:'headliner'};
const ABIL_WHERE={ears:'The live spectrum in your studio',pulse:'The beat light next to your tempo · in battles, monsters show their BPM',grid:'Off-beat notes glow in your drum machine',
  drumsense:'Each drum lights up when it hits · in battles, weaknesses name the exact drum',
  swing:'The SWING slider on your drum machine',perfect:'Your steps and swing in milliseconds · in tap challenges, your timing in ms',wave:'The wavetable presets in EDIT LEAD SOUND',freqvision:'Your EQ shows your other tracks in pink',
  dynamic:'The MASTER COMPRESSOR panel',space:'Your LEAD DELAY locks to your tempo',stereosight:'The PAN knobs in the MIX RACK',ceiling:'The LOUDNESS meter in the MIX RACK',rumblecraft:'The RUMBLE knob in the MIX RACK'};
const COS_FROM={'hoodie-beast':'boss','phones-leaf':'challenge','comp-cassette':'slime','kit-boom':'trial','hoodie-dragon':'dragon','phones-wave':'ktrial','hoodie-dune':'king','hair-sunset':'dtrial',
  'hoodie-magma':'titan','phones-ember':'vtrial','phones-bog':'echoking','hair-mist':'strial','hoodie-royal':'lord','hair-star':'mtrial','hoodie-sky':'master','hoodie-cert':'final',
  'phones-strobe':'bouncer','hoodie-rave':'headliner','kit-bunker':'btrial'};
const CERTS=[['trial','RHYTHM CERTIFIED','The gold trophy on your studio wall'],['ktrial','SOUND DESIGNER','The violet trophy on the shelf above your window'],['dtrial','EQ MASTER','The gold trophy on the shelf above your window'],
  ['vtrial','DYNAMICS CERTIFIED','The orange trophy on the shelf above your window'],['strial','SPACE CERTIFIED','The blue trophy on the shelf above your window'],['mtrial','MIX ENGINEER','The white trophy on the shelf above your window'],
  ['final','PRODUCER CERTIFIED','Your framed certificate on the studio wall'],['btrial','CLUB CERTIFIED','The record plaque on your studio wall']];
const COS_KIND={hoodie:'HOODIE',phones:'HEADPHONES',hair:'HAIR',comp:'COMPANION',kit:'DRUM KIT'};
function stageWorld(id){for(const w of WORDER)if((WSTAGES[w]||[]).some(x=>x.id===id))return w;return'forest'}
function stageTitle(id){for(const w of WORDER){const x=(WSTAGES[w]||[]).find(x=>x.id===id);if(x)return x.title}return id}
function rewardIndex(){const L=[];
  TOOLS.forEach(t=>{const st=TOOL_FROM[t.id];L.push({key:'t:'+t.id,w:st?stageWorld(st):'forest',kind:'TOOL',name:t.name,col:t.col,got:has(t.id),where:TOOL_WHERE[t.id]||'Your studio',how:st?stageTitle(st):'Starting gear'})});
  ABILITIES.forEach(a=>{const st=ABIL_FROM[a.id];L.push({key:'a:'+a.id,w:st?stageWorld(st):'forest',kind:'ABILITY',name:a.name,col:'#3ef0c8',got:hasAb(a.id),where:ABIL_WHERE[a.id]||'Your studio',how:a.from})});
  CERTS.forEach(([id,n,where])=>L.push({key:'c:'+id,w:stageWorld(id),kind:'CERTIFICATE',name:n,col:'#ffcc4d',got:id==='final'?!!(S.cert||S.done.includes('final')):S.done.includes(id),where,how:stageTitle(id)}));
  COS.filter(c=>c.price!==0).forEach(c=>{const st=COS_FROM[c.id],sl=c.slot;
    L.push({key:'o:'+c.id,w:st?stageWorld(st):c.price?'shop':'quests',kind:COS_KIND[sl]||sl.toUpperCase(),name:c.name,col:c.col,got:S.owned.includes(c.id),cos:c,
      where:sl==='kit'?'SWAP KIT on your drum machine':sl==='comp'?'Your companion, next to you in the studio':'Your hero in the studio',how:c.how||(c.price?`${c.price} coins · PATH › STYLE`:'')})});
  return L}
const rwInUse=c=>c.slot==='kit'?S.kit===c.id:S.eq[c.slot]===c.id;
/* where TRY IT NOW (and USE IN STUDIO) takes you for each tool; a fresh copy each time, the studio clears the flags it uses */
const STUDIO_TRY={groovebox:{bbox:1},midi:{roll:1},eq:{eq:1},synth:{lead:1},auto:{focus:'.auto-card'},comp:{focus:'.mcomp'},dist:{focus:'.fxrack'},reverb:{focus:'.fxrack'},delay:{focus:'.fxrack'},limiter:{focus:'.fxrack'},drums:{focus:'.dm-win'}};
const studioTry=id=>STUDIO_TRY[id]?Object.assign({},STUDIO_TRY[id]):undefined;
function rewardWall(host,o){o=o||{};const L=rewardIndex();
  if(!Array.isArray(S.rwSeen)){S.rwSeen=L.filter(r=>r.got).map(r=>r.key);save()}      /* first visit: nothing is "new" */
  const fresh=new Set(L.filter(r=>r.got&&!S.rwSeen.includes(r.key)).map(r=>r.key));
  const groups=WORDER.concat(['quests','shop']).filter(g=>L.some(r=>r.w===g));
  const lastDone=S.done.length?stageWorld(S.done[S.done.length-1]):'forest';
  let tab=o.tab||(fresh.size?L.find(r=>fresh.has(r.key)).w:lastDone);
  const w=h('div','win raised stack mr-wall');host.append(w);
  const paint=()=>{const got=L.filter(r=>r.got).length;
    w.innerHTML=`<div class="row sp"><p class="eyebrow" style="color:#ffcc4d">MY REWARDS · ${got} / ${L.length}</p>${fresh.size?`<span class="chip neon">${fresh.size} NEW</span>`:''}</div>
     <div class="row" style="gap:10px;align-items:center"><div class="mr-hero"></div><p class="muted grow" style="font-size:14px">Everything you win lands in your studio. Pick a world, then tap a reward to go to it. Tap a cosmetic to put it on.</p></div>
     <div class="mr-tabs">${groups.map(g=>{const a=L.filter(r=>r.w===g),n=a.filter(r=>r.got).length;return`<button class="mr-tab ${g===tab?'on':''}" data-w="${g}" style="--wc:${RW_WCOL[g]}">${RW_GNAME(g).toUpperCase()}<b>${n}/${a.length}${a.some(r=>fresh.has(r.key))?' ★':''}</b></button>`}).join('')}</div>
     <div class="stack mr-list" style="gap:6px">${L.filter(r=>r.w===tab).map(r=>`<button class="sw mr-it ${r.got?'on':'lock'}" data-k="${r.key}"><i style="background:${r.col}"></i><span class="grow" style="text-align:left">${r.name}${fresh.has(r.key)?' <b class="mr-new">NEW</b>':''}<br><small class="muted">${r.kind} · ${r.got?(r.cos?(rwInUse(r.cos)?'✓ IN USE · ':'TAP TO USE · '):'✓ ')+r.where:'LOCKED · '+r.how}</small></span></button>`).join('')}</div>`;
    const hb=$('.mr-hero',w);hb.append(heroEl(2,'bob'));const cp=companionEl(2);if(cp)hb.append(cp);
    $$('.mr-tab',w).forEach(b=>b.onclick=()=>{tab=b.dataset.w;sfx.tap();paint()});
    $$('.mr-it',w).forEach(b=>b.onclick=()=>{const r=L.find(x=>x.key===b.dataset.k);if(!r)return;sfx.tap();
      if(!r.got){toast('LOCKED · '+String(r.how).toUpperCase());return}
      if(r.cos){if(r.cos.slot==='kit')S.kit=r.cos.id;else S.eq[r.cos.slot]=r.cos.id;save();paint();if(o.onEquip)o.onEquip(r.cos);return}
      if(!(o.go&&o.go(r.key)))toast(r.where.toUpperCase())})};
  paint();S.rwSeen=L.filter(r=>r.got).map(r=>r.key);save();
  return{paint,el:w}}
