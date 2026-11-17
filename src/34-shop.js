/* =====================================================================
   SHOP: spend coins on skins, pets, studio decor and sounds.
   FLAMES: the daily streak. A daily coin bonus, flame items (a best streak unlocks them) and streak shields.
   ===================================================================== */
/* ---- pets: small sprites that follow you around (the Cassette Critter is the Offbeat Slime's reward) ---- */
const PETS={
  'comp-cassette':{rows:CASSETTE,pal:CASSETTE_PAL},
  'comp-slime':{rows:["....kkk....","..kkaaakk..",".kaawaaaak.",".kaaaaaaak.","kaakaaakaak","kaaaaaaaaak","kaaakkkaaak",".kkkkkkkkk."],pal:{k:'#140d1f',a:'#6fd36a',w:'#c8ffb0'}},
  'comp-bird':{rows:["...kkkk....","..kaaaakk..",".kaakaaaaoo",".kaaaaaaak.","kaabbbaaak.","kaabbaaak..",".kkaaaakk..","...k..k...."],pal:{k:'#140d1f',a:'#ffcc4d',b:'#e09a20',o:'#ff7a3a'}},
  'comp-bunny':{rows:["..kk...kk..","..kak.kak..","..kak.kak..",".kpkkkkkpk.","kpaaaaaaapk","kpakaaakapk","kaaaanaaaak",".kaaaaaaak.",".kaakkkaak.","..kk...kk.."],pal:{k:'#140d1f',a:'#f1e7d0',p:'#ff4f9a',n:'#ff9ac0'}},
  'comp-cat':{rows:["k.........k","kk.......kk","krk.....krk","kaakkkkkaak","kaaaaaaaaak","kawaaaaawak","kaaaanaaaak",".kaaaaaaak.","..kk...kk.."],pal:{k:'#140d1f',a:'#3d3550',r:'#ff9ac0',w:'#ffe27a',n:'#ff9ac0'}},
  'comp-fox':{rows:["k.........k..","kk.......kk..","kak.....kak..","kaakkkkkaak.F","kaaaaaaaaakFf","kakaaaaakakf.","kawwwkwwwakF.",".kawwwwwak.f.","..kk...kk...."],pal:{k:'#140d1f',a:'#ff7a1a',w:'#fff1d6',f:'#ffcc4d',F:'#ff3d1a'}},
  'comp-dragon':{rows:["...h.....h...","...kh...hk...","..kaakkkaak..","bkaaaaaaaaakb","bbkaeaaaeakbb","bbkaaaaaaakbb",".bkawwwwwakb.","..kawwwwwak..","...kaaaaak...","...kk...kk..."],pal:{k:'#140d1f',a:'#6c5cff',b:'#a98bff',w:'#c9b8ff',e:'#ffe27a',h:'#ffcc4d'}}};
/* ---- the catalogue (outfits colour the whole body through pal: a = hoodie print, j = jeans, b = boots) ---- */
COS.push(
  {id:'hoodie-neon',slot:'hoodie',name:'Neon Night',col:'#ff3d7f',pal:{a:'#3ef0c8'},price:120},
  {id:'hoodie-camo',slot:'hoodie',name:'Forest Camo',col:'#4f6a3a',pal:{a:'#8fbf3a',j:'#3a3020'},price:150},
  {id:'hoodie-ice',slot:'hoodie',name:'Ice Cold',col:'#bde8ff',pal:{a:'#ffffff',j:'#3a6a9a',b:'#e0f4ff'},price:180},
  {id:'hoodie-galaxy',slot:'hoodie',name:'Galaxy',col:'#2a1f6a',pal:{a:'#a98bff',j:'#140d1f',b:'#6c5cff'},price:240},
  {id:'hoodie-goldrush',slot:'hoodie',name:'Gold Rush',col:'#ffcc4d',pal:{a:'#fff1a6',j:'#5a3a10',b:'#3a2618'},price:350},
  {id:'hoodie-blaze',slot:'hoodie',name:'Blaze',col:'#ff5a1a',pal:{a:'#ffcc4d'},price:150,flame:3},
  {id:'hoodie-phoenix',slot:'hoodie',name:'Phoenix',col:'#e0241a',pal:{a:'#ffcc4d',j:'#5a1010',b:'#ffcc4d'},price:400,flame:14},
  {id:'phones-chrome',slot:'phones',name:'Chrome',col:'#e6e6f0',price:60},
  {id:'phones-mint',slot:'phones',name:'Mint',col:'#7dffb2',price:70},
  {id:'phones-ruby',slot:'phones',name:'Ruby',col:'#ff2a4a',price:90},
  {id:'phones-inferno',slot:'phones',name:'Inferno Cans',col:'#ff7a1a',price:200,flame:7},
  {id:'hair-pink',slot:'hair',name:'Bubblegum',col:'#ff7ab8',price:50},
  {id:'hair-blonde',slot:'hair',name:'Blonde',col:'#ffd76a',price:50},
  {id:'hair-silver',slot:'hair',name:'Silver',col:'#d8d8e8',price:60},
  {id:'hair-blue',slot:'hair',name:'Electric Blue',col:'#4a7aff',price:60},
  {id:'hair-fire',slot:'hair',name:'Fire',col:'#ff4f2a',price:80},
  {id:'comp-slime',slot:'comp',name:'Synth Slime',col:'#6fd36a',price:120},
  {id:'comp-bird',slot:'comp',name:'Metro Bird',col:'#ffcc4d',price:160},
  {id:'comp-bunny',slot:'comp',name:'Beat Bunny',col:'#f1e7d0',price:220},
  {id:'comp-cat',slot:'comp',name:'Vinyl Cat',col:'#3d3550',price:280},
  {id:'comp-fox',slot:'comp',name:'Ember Fox',col:'#ff7a1a',price:250,flame:5},
  {id:'comp-dragon',slot:'comp',name:'Mini Dragon',col:'#6c5cff',price:600},
  {id:'decor-lights',slot:'decor',name:'Fairy Lights',col:'#ffcc4d',price:80},
  {id:'decor-led',slot:'decor',name:'Desk LEDs',col:'#3ef0c8',price:90},
  {id:'decor-lava',slot:'decor',name:'Lava Lamp',col:'#ff5a2a',price:100},
  {id:'decor-crate',slot:'decor',name:'Vinyl Crate',col:'#a8744a',price:120},
  {id:'decor-neon',slot:'decor',name:'Neon Sign',col:'#ff3d7f',price:150},
  {id:'decor-disco',slot:'decor',name:'Disco Ball',col:'#d8d8e8',price:220},
  {id:'kit-808',slot:'kit',name:'808 Kit',col:'#ff4f5a',price:150});
/* ---- studio decor: drawn in the room (draw(g,t,ox,oy,full)), also used, smaller, as the shop picture ---- */
const DECOR={
  'decor-lights':{x:0,y:0,iw:24,ih:6,draw:(g,t,ox,oy,full)=>{const cols=['#ff4f9a','#ffcc4d','#3ef0c8','#a98bff'],segs=full?[[34,53],[66,107]]:[[0,23]];let i=0;
    segs.forEach(([a,b])=>{for(let x=a;x<=b;x++)px(g,ox+x,oy+1+((x>>2)%2),1,1,'#4d4373');for(let x=a+1;x<=b;x+=4,i++)px(g,ox+x,oy+3,1,2,Math.sin(t*3+i*1.3)>-.3?cols[i%4]:'#2a2248')})}},
  'decor-led':{x:0,y:0,iw:22,ih:3,draw:(g,t,ox,oy,full)=>{const cols=['#ff4f9a','#ffcc4d','#3ef0c8','#a98bff','#6cb8ff'],sp=seq.on?10:3,x0=full?28:0,x1=full?81:21,y=full?39:1;
    for(let x=x0;x<=x1;x++)px(g,ox+x,oy+y,1,1,cols[(Math.floor(x/3)+Math.floor(t*sp))%5])}},
  'decor-lava':{x:92,y:44,iw:7,ih:11,draw:(g,t,ox,oy)=>{px(g,ox+2,oy,3,1,'#3d3166');px(g,ox+1,oy+1,5,6,'#ff7a3a');px(g,ox+1,oy+1,1,6,'#ffa06a');
    px(g,ox+2,oy+Math.round(3+Math.sin(t*.9)*2),2,2,'#ffcc4d');px(g,ox+3,oy+Math.round(4+Math.sin(t*.7+2)*2),2,1,'#ffe27a');px(g,ox+1,oy+7,5,1,'#2a2248');px(g,ox,oy+8,7,3,'#3d3166');px(g,ox+1,oy+8,5,1,'#5a4a7a')}},
  'decor-crate':{x:3,y:46,iw:13,ih:9,draw:(g,t,ox,oy)=>{['#ff4f9a','#ffcc4d','#3ef0c8','#a98bff'].forEach((l,i)=>{px(g,ox+1+i*3,oy,3,5,'#140d1f');px(g,ox+2+i*3,oy+2,1,1,l)});
    px(g,ox,oy+4,13,5,'#8a5a34');px(g,ox,oy+4,13,1,'#a8744a');px(g,ox+1,oy+6,11,1,'#6a4630')}},
  'decor-neon':{x:94,y:10,iw:13,ih:11,draw:(g,t,ox,oy)=>{px(g,ox,oy,13,11,'#1a1030');const on=Math.sin(t*7)>-.85,c=on?'#ff3d7f':'#5a2040';
    px(g,ox+8,oy+2,1,6,c);px(g,ox+8,oy+2,3,1,c);px(g,ox+10,oy+3,1,1,c);px(g,ox+4,oy+7,4,2,c);px(g,ox+5,oy+6,2,1,c);px(g,ox+5,oy+7,1,1,on?'#ff9ac0':c);px(g,ox+1,oy+1,1,1,'#3ef0c8')}},
  'decor-disco':{x:98,y:0,iw:7,ih:9,draw:(g,t,ox,oy)=>{px(g,ox+3,oy,1,2,'#8a7fa8');px(g,ox+1,oy+2,5,6,'#8a8ca8');px(g,ox,oy+3,7,4,'#8a8ca8');const f=Math.floor(t*6);
    for(let i=0;i<6;i++)px(g,ox+(i*3+f)%7,oy+2+(i*5+f)%6,1,1,i%2?'#ffffff':'#d8d8e8')}}};
function drawDecor(g,t){for(const id in DECOR)if(S.owned.includes(id)&&!(S.decorOff||[]).includes(id)){const D=DECOR[id];D.draw(g,t,D.x,D.y,true)}}
/* ---- buying and using ---- */
const shopState=x=>S.owned.includes(x.id)?'own':x.price==null?'reward':x.flame&&(S.bestStreak||1)<x.flame?'flame':S.coins>=x.price?'buy':'poor';
const isUsed=x=>x.slot==='kit'?S.kit===x.id:x.slot==='decor'?S.owned.includes(x.id)&&!(S.decorOff||[]).includes(x.id):S.eq[x.slot]===x.id;
function useItem(x){if(x.slot==='kit')S.kit=x.id;else if(x.slot==='decor'){const off=S.decorOff||(S.decorOff=[]),i=off.indexOf(x.id);if(i>=0)off.splice(i,1);else off.push(x.id)}else S.eq[x.slot]=x.id;save()}
function buyItem(x){const s=shopState(x);if(s==='own')return true;
  if(s==='reward'){toast('WIN IT · '+String(x.how||'').toUpperCase());return false}
  if(s==='flame'){toast(`NEEDS A ${x.flame}-DAY STREAK · YOUR BEST: ${S.bestStreak||1}`);sfx.bad();return false}
  if(s==='poor'){toast(`NOT ENOUGH COINS · ${x.price-S.coins} MORE`);sfx.bad();return false}
  S.coins-=x.price;S.owned.push(x.id);if(x.slot!=='decor')useItem(x);save();sfx.coin();haptic([20,40,20]);toast('BOUGHT · '+x.name.toUpperCase());return true}
/* ---- flames ---- */
const flameBonus=()=>10*Math.min(Math.max(S.streak||1,1),7);
const flameReady=()=>S.flameDay!==todayStr();
function claimFlame(){if(!flameReady())return 0;const c=flameBonus();S.coins+=c;S.flameDay=todayStr();save();sfx.coin();haptic([20,40,20]);toast(`FLAME BONUS · +${c} COINS`);return c}
const FLAME_STEPS=[[3,'Blaze hoodie'],[5,'Ember Fox pet'],[7,'Inferno Cans'],[14,'Phoenix outfit']];
function flamesHtml(){const nx=FLAME_STEPS.find(([n])=>(S.bestStreak||1)<n);
  return`<div class="fl-row"><span data-ic="flame" data-sc="4"></span><div class="stack" style="gap:2px"><b class="num" style="font-size:30px;line-height:1">${S.streak} DAY${S.streak===1?'':'S'} IN A ROW</b><span class="muted" style="font-size:14px">Best streak: ${S.bestStreak||1} · Shields: ${S.shields||0}/2</span></div></div>
  <p style="font-size:14.5px;text-align:left">A flame is one day in a row that you came back to make music. Miss a day and the fire goes out, back to 1.</p>
  <div class="stack" style="gap:6px;text-align:left;font-size:14.5px">
   <p><b style="color:var(--amber)">DAILY BONUS</b> · every day, +10 coins per flame (up to +70 at 7 flames).</p>
   <p><b style="color:var(--magenta)">FLAME ITEMS</b> · in the shop, a streak unlocks them: ${FLAME_STEPS.map(([n,w])=>`${n} days: ${w}`).join(' · ')}.${nx?` Next: ${nx[1]} at ${nx[0]} days.`:' You unlocked them all.'}</p>
   <p><b style="color:var(--neon)">STREAK SHIELD</b> · 60 coins in the shop. If you miss a single day, it is used up and your flames keep burning.</p></div>`}
function openFlames(){const m=modal(`<p class="eyebrow" style="color:var(--magenta)">FLAMES · YOUR DAILY STREAK</p>${flamesHtml()}
  ${flameReady()?`<button class="btn big block fl-claim">CLAIM +${flameBonus()} COINS</button>`:`<p class="fb good" style="width:100%">Today's bonus is claimed. Come back tomorrow for flame ${S.streak+1}.</p>`}
  <button class="btn ghost block fl-shop">OPEN THE SHOP</button><button class="btn ghost block fl-x">CLOSE</button>`,{dismiss:true});hydrateIcons(m);
  const c=$('.fl-claim',m);if(c)c.onclick=()=>{claimFlame();m.close();if(cur==='home'||cur==='shop')RENDER[cur]($('#s-'+cur))};
  $('.fl-shop',m).onclick=()=>{m.close();go('shop',{tab:'flames'})};$('.fl-x',m).onclick=()=>m.close();return m}
/* tapping the coins or the flames in the top bar */
document.addEventListener('click',e=>{const tb=e.target.closest&&e.target.closest('.topbar .chip');if(!tb||!(NAVSCREENS.includes(cur)))return;
  if(tb.classList.contains('amber')){if(cur!=='shop'){sfx.tap();go('shop')}}else if(tb.classList.contains('pink')){sfx.tap();openFlames()}});
/* ---- the shop screen ---- */
let SHOP_TAB='skins';
const SHOP_TABS=[['skins','SKINS'],['pets','PETS'],['studio','STUDIO'],['sounds','SOUNDS'],['flames','FLAMES']];
const shopTabOf=x=>x.slot==='comp'?'pets':x.slot==='decor'?'studio':x.slot==='kit'?'sounds':'skins';
function shopGroups(tab){const by=s=>COS.filter(c=>c.slot===s);
  return tab==='skins'?[['HOODIES & OUTFITS',by('hoodie')],['HEADPHONES',by('phones')],['HAIR',by('hair')]]:tab==='pets'?[['PETS',by('comp')]]:tab==='studio'?[['STUDIO DECOR · SHOWS IN YOUR STUDIO ROOM',by('decor')]]:
    tab==='sounds'?[['DRUM KITS · FOR YOUR DRUM MACHINE',by('kit')]]:[['FLAME ITEMS · UNLOCKED BY YOUR BEST STREAK',COS.filter(c=>c.flame)]]}
function itemArt(x,sc){if(x.slot==='comp'){const P=PETS[x.id];if(!P)return h('span','shop-solo','SOLO');return sprite(P.rows,P.pal,sc||3)}
  if(x.slot==='decor'){const D=DECOR[x.id],cv=lowres(D.iw,D.ih);cv.style.width=D.iw*(sc||3)+'px';addLive(cv,(g,t)=>{g.clearRect(0,0,cv.width,cv.height);D.draw(g,t,0,0,false)});return cv}
  if(x.slot==='kit')return icon('drums',x.col,2);
  return sprite(HERO,heroPalFor(Object.assign({},S.eq,{[x.slot]:x.id})),sc||2)}
function shopLabel(x,s){const u=isUsed(x);return s==='own'?(x.slot==='decor'?(u?'✓ IN YOUR STUDIO':'HIDDEN · TAP TO SHOW'):(u?'✓ IN USE':'OWNED · TAP TO USE')):s==='reward'?'WIN IT IN THE GAME':
  s==='flame'?`${x.flame}-DAY STREAK · ${x.price}c`:s==='buy'?`${x.price} COINS`:`${x.price}c · ${x.price-S.coins} MORE`}
RENDER.shop=(scr,arg)=>{let sel=arg&&arg.sel?cos(arg.sel):null;if(arg&&arg.tab)SHOP_TAB=arg.tab;if(sel)SHOP_TAB=shopTabOf(sel);
  const paint=()=>{const tab=SHOP_TAB,groups=shopGroups(tab),s=sel?shopState(sel):null;
    scr.innerHTML=topbar('SHOP','home')+`<div class="stack">
     <div class="win raised shop-head"><div class="shop-stage"></div><div class="stack" style="gap:6px;min-width:0;flex:1">
      <p class="eyebrow" style="color:var(--amber)">YOUR COINS</p><p class="num shop-coins"><span data-ic="coin" data-sc="2"></span>${S.coins}</p><div class="shop-sel"></div></div></div>
     ${flameReady()?`<button class="flame-cta" data-a="claim"><span data-ic="flame" data-sc="3"></span><span class="stack" style="gap:2px;text-align:left"><b>FLAME BONUS READY</b><span style="font-size:14px">Day ${S.streak} in a row: tap for +${flameBonus()} coins</span></span></button>`:''}
     <div class="shop-tabs">${SHOP_TABS.map(([id,n])=>`<button class="${id===tab?'on':''}" data-t="${id}">${n}</button>`).join('')}</div>
     ${tab==='flames'?`<div class="win raised stack">${flamesHtml()}</div>`:''}
     ${groups.map(([title,list])=>`<p class="eyebrow">${title}</p><div class="shop-grid">${list.map(x=>{const st=shopState(x);return`<button class="shop-it ${st}${isUsed(x)?' used':''}${sel&&sel.id===x.id?' sel':''}" data-id="${x.id}"><span class="shop-art"></span><b>${x.name}</b><small>${shopLabel(x,st)}</small></button>`}).join('')}</div>`).join('')}
     ${tab==='flames'?`<div class="win raised stack shield"><div class="row sp"><b>STREAK SHIELD</b><span class="chip">${S.shields||0} / 2</span></div><p class="muted" style="font-size:14px">Miss one day and a shield is used up: your flames keep burning.</p><button class="btn block" data-a="shield"${(S.shields||0)>=2?' disabled':''}>${(S.shields||0)>=2?'SHIELDS FULL':'BUY A SHIELD · 60 COINS'}</button></div>`:''}
     <p class="muted" style="font-size:13.5px">Coins come from lessons, battles, Master Trials, daily quests and the daily flame bonus.</p></div>`;
    hydrateIcons(scr);wireBack(scr);
    /* the preview: you, wearing what you picked, with your pet */
    const stg=$('.shop-stage',scr),eq=Object.assign({},S.eq);if(sel&&['hoodie','phones','hair','comp'].includes(sel.slot))eq[sel.slot]=sel.id;
    if(sel&&sel.slot==='decor')stg.append(itemArt(sel,6));else if(sel&&sel.slot==='kit')stg.append(icon('drums',sel.col,6));
    else{stg.append(sprite(HERO,heroPalFor(eq),4,'bob'));const P=PETS[eq.comp];if(P)stg.append(sprite(P.rows,P.pal,3,'bob'))}
    const sb=$('.shop-sel',scr);
    if(!sel)sb.innerHTML='<p class="muted" style="font-size:14px">Tap anything to try it on before you buy.</p>';
    else{sb.innerHTML=`<b>${sel.name}</b>`;const add=(cls,txt,fn)=>{const b=h('button',cls,txt);b.onclick=fn;sb.append(b);return b};
      if(s==='own'){if(!(isUsed(sel)&&sel.slot!=='decor'))add('btn sm block',sel.slot==='decor'?(isUsed(sel)?'HIDE IN THE STUDIO':'SHOW IN THE STUDIO'):'USE IT',()=>{useItem(sel);sfx.tap();paint()});else sb.append(h('p','fb good','In use.'))}
      else if(s==='buy')add('btn sm block',`BUY · ${sel.price} COINS`,()=>{if(buyItem(sel))paint()});
      else if(s==='poor')sb.append(h('p','muted',`${sel.price} coins: ${sel.price-S.coins} more to go.`));
      else if(s==='flame')sb.append(h('p','muted',`Reach a ${sel.flame}-day streak to unlock it (best: ${S.bestStreak||1}). Then ${sel.price} coins.`));
      else sb.append(h('p','muted','Win it: '+(sel.how||'in the game')+'.'))}
    $$('.shop-it',scr).forEach(b=>{const x=cos(b.dataset.id);$('.shop-art',b).append(itemArt(x));
      b.onclick=()=>{sfx.tap();if(shopState(x)==='own'&&x.slot!=='decor'&&!isUsed(x))useItem(x);sel=x;
        if(x.slot==='kit'){initAudio();if(A.ctx){const o=S.kit;S.kit=x.id;V.kick(now()+.02,.9);V.hat(now()+.27,.5);V.snare(now()+.52,.8);V.kick(now()+.77,.9);S.kit=o}}paint()}});
    $$('.shop-tabs [data-t]',scr).forEach(b=>b.onclick=()=>{SHOP_TAB=b.dataset.t;sel=null;sfx.tap();paint()});
    const cl=$('[data-a=claim]',scr);if(cl)cl.onclick=()=>{claimFlame();paint()};
    const sh=$('[data-a=shield]',scr);if(sh)sh.onclick=()=>{if(S.coins<60){toast(`NOT ENOUGH COINS · ${60-S.coins} MORE`);sfx.bad();return}S.coins-=60;S.shields=(S.shields||0)+1;save();sfx.coin();toast('STREAK SHIELD READY');paint()}};
  paint()};
