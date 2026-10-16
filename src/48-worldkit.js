/* ================= world kit: shared building blocks for worlds 2–7 ================= */
COS.push(
 {id:'hoodie-dragon',slot:'hoodie',name:'Dragon Scale',col:'#6c5cff',price:null,how:'Defeat the Synth Dragon'},
 {id:'phones-wave',slot:'phones',name:'Wavetable Cans',col:'#a98bff',price:null,how:'Pass the Sound Design Trial'},
 {id:'hoodie-dune',slot:'hoodie',name:'Dune Robe',col:'#c9a227',price:null,how:'Defeat the Spectrum King'},
 {id:'hair-sunset',slot:'hair',name:'Sunset',col:'#ff7a3a',price:null,how:'Pass the EQ Master Trial'},
 {id:'hoodie-magma',slot:'hoodie',name:'Magma',col:'#ff5a2a',price:null,how:'Defeat the Dynamic Titan'},
 {id:'phones-ember',slot:'phones',name:'Ember Monitors',col:'#ff4f5a',price:null,how:'Pass the Compression Trial'},
 {id:'phones-bog',slot:'phones',name:'Bog Monitors',col:'#2b8a7a',price:null,how:'Defeat the Echo King'},
 {id:'hair-mist',slot:'hair',name:'Mist',col:'#9ab8c8',price:null,how:'Pass the Space Trial'},
 {id:'hoodie-royal',slot:'hoodie',name:'Royal Mix',col:'#7a5ad0',price:null,how:'Defeat the Mixing Lord'},
 {id:'hair-star',slot:'hair',name:'Starlight',col:'#f1e7d0',price:null,how:'Pass the Mix Trial'},
 {id:'hoodie-sky',slot:'hoodie',name:'Cloudwalker',col:'#8e9ad6',price:null,how:'Defeat The Master'},
 {id:'hoodie-cert',slot:'hoodie',name:'Producer Gold',col:'#ffcc4d',price:null,how:'Get PRODUCER CERTIFIED'},
 {id:'phones-violet',slot:'phones',name:'Violet Pro',col:'#8a5aff',price:120},
 {id:'hoodie-teal',slot:'hoodie',name:'Studio Teal',col:'#2bb3a0',price:90});
QUESTS.find(q=>q.id==='lesson').desc='Any lesson, in any world';

/* EXPERIMENT steps: a checklist of discoveries */
function discover(b,items,need,done){const box=h('div','check disc');box.innerHTML=items.map((t,i)=>`<div data-d="${i}">${t}</div>`).join('');b.append(box);const found=new Set();
  return i=>{if(found.has(i)||!box.isConnected)return;found.add(i);const d=$(`[data-d="${i}"]`,box);if(d)d.classList.add('ok');sfx.ok();if(found.size>=need)done()}}
/* CHALLENGE steps: a short quiz with retry */
function quizStep(b,done,o){const n=o.count||4,need=o.need||3;const run=()=>{b.innerHTML=`<div class="big-title">${o.title}</div><p>${o.text}</p>`;
  quiz(b,{mode:'lesson',count:n,gen:o.gen,onDone:r=>{const ok=r.ok>=need;b.append(h('p','fb'+(ok?' good':''),ok?`${r.ok}/${n}. ${o.win}`:`${r.ok}/${n}. ${o.lose||'Close! Play each sound twice before you answer.'}`));if(ok)done();else{const again=h('button','btn block','TRY AGAIN');again.onclick=run;b.append(again)}}})};run()}
/* LISTEN steps: offline renders matched in loudness, with a live fallback */
function abRender(b,done,o){b.insertAdjacentHTML('beforeend','<p class="muted wait">Rendering…</p>');initAudio();if(!A.ctx)return;
  withTimeout(Promise.all(o.items.map(it=>it.render())),6000).then(bufs=>{if(!b.isConnected)return;const m=o.match===false?bufs:matchLoudness(bufs[0],bufs[1]);$('.wait',b).remove();abBuffers(b,o.items.map((it,i)=>({label:it.label,note:it.note,buf:m[i]})),done)})
   .catch(()=>{if(!b.isConnected)return;$('.wait',b).textContent='Live version: loudness is not matched on this device, so judge the character, not the volume.';const hh=h('div');b.append(hh);abWidget(hh,o.items.map(it=>({label:it.label,note:it.note,bpm:100,play:it.live})),done)})}
const SPB=60/100/4;
const renderSong2=(chain,opt,steps)=>renderOffline((steps||32)*SPB+.8,chain,t0=>{for(let s=0;s<(steps||32);s++)songStep(s,t0+s*SPB,null,Object.assign({bpm:100},opt||{}))});
/* a node chain that lives in the real context, for live A/B */
function liveNode(make){let n=null;return()=>{if(!n||n.context!==A.ctx){n=make(A.ctx);n._out.connect(A.bus)}return n}}
/* big pixel title + PIP explanation */
const lessonHead=(b,title,html)=>{b.innerHTML=`<div class="big-title">${title}</div>`;if(html)b.append(pipSay(html))};
const eyebrowW=(b,w)=>b.insertAdjacentHTML('afterbegin',`<p class="eyebrow" style="color:var(--amber)">${WNAME[w].toUpperCase()}</p>`);

/* ---- battle rounds built from question generators ---- */
function qRound(o){const R={label:o.label,skill:o.skill,dim:o.dim||'l',tag:o.tag,hints:o.hints||[]};
  R.run=function(area,api){let q=o.gen();area._q=q;const sync=()=>{R.skill=q.skill||o.skill;R.dim=q.dim||o.dim||'l';R.tag=q.tag||o.tag;R.hints=q.hints||o.hints||[];R.demo=q.demo?()=>q.demo():null;R.demoText=q.demoText;R.revealFn=null};sync();
    const body=h('div','stack');area.append(body);if(o.say)body.before(h('p','muted',o.say));
    const render=()=>{body.innerHTML='';body.append(h('p','qprompt',q.prompt));
      if(q.type==='task'){const th=h('div','stack');body.append(th);const ctl={};let fired=false;q.render(th,(ok,msg)=>{if(fired)return;fired=true;if(ok)api.hit(o.dmg||40,!!o.crit,(o.win?o.win+' ':'Right! ')+(msg||''));else api.miss(msg||'Not quite.')},ctl);R.demo=ctl.demo?()=>ctl.demo():R.demo;R.revealFn=ctl.reveal||null;return}
      if(q.plays){const pl=h('div','qplays');q.plays.forEach(p=>{const b=h('button','btn ghost',p.label);b.onclick=()=>{playQ(p.fn);b.classList.add('heard')};pl.append(b)});body.append(pl)}
      const vz=h('div','vizhost');body.append(vz);if(q.viz)q.viz(vz,false);
      const op=h('div','qopts'+(q.wide?' wide':''));q.options.forEach(opt=>{const b=h('button','btn qopt',opt.label);b.dataset.v=opt.v;b.onclick=()=>{stopGroup();[...op.children].forEach(x=>x.disabled=true);const ok=opt.v===q.answer;const ex=q.explain?q.explain(opt.v):'';if(ok)api.hit(o.dmg||40,!!o.crit,(o.win?o.win+' ':'Right! ')+ex);else api.miss(ex)};op.append(b)});body.append(op);area._op=op;
      if(q.plays)setTimeout(()=>{if(body.isConnected)playQ(q.plays[0].fn)},250)};
    if(q.prepare){body.innerHTML='<p class="muted">The monster is rendering its attack…</p>';initAudio();withTimeout(q.prepare(),5000).then(()=>{if(body.isConnected)render()}).catch(()=>{if(!body.isConnected)return;const f=q.fallback?q.fallback():conceptQ([].concat(q.skill)[0]);q=Object.assign({},f);area._q=q;sync();render()})}else render()};
  R.reveal=a=>{if(R.revealFn){R.revealFn();return}const op=a._op,q=a._q;if(!op||!q)return;const b=[...op.children].find(x=>x.dataset.v===q.answer);if(b)b.classList.add('qopt','reveal')};
  return R}
/* practical rounds: fix the problem with a real plugin, then STRIKE */
function rigRound(o){const R={label:o.label,skill:o.skill,dim:'p',tag:o.tag,hints:o.hints||[],demoText:o.demoText};
  R.run=function(area,api){area.append(h('p','muted',o.say));const host=h('div','stack');area.append(host);const k=o.build(host);area._k=k;const st=h('button','btn pink block big',`${SWORD} STRIKE`);area.append(st);hydrateIcons(area);
    st.onclick=async()=>{if(k.rig&&k.rig.ready&&!k.rig.ready()){toast('ONE MOMENT · THE PLUGIN IS STILL MEASURING');return}st.disabled=true;const r=await o.check(k);if(k.rig&&k.rig.stop)k.rig.stop();if(r.ok)api.hit(o.dmg||50,true,r.win||o.win);else api.miss(r.why)}};
  if(o.reveal)R.reveal=a=>{if(a._k)o.reveal(a._k)};if(o.demo)R.demo=a=>{if(a._k)o.demo(a._k)};return R}
const listenSong=opt=>()=>{initAudio();seq.start({bpm:100,total:32,play:(s,t)=>songStep(s,t,null,Object.assign({bpm:100},opt||{}))})};

/* ---- master trials: brief → fix with real tools → client feedback ---- */
const TRIALS={};let TRIAL_K=null;
function trialShell(scr,o){let hl=0;const stg=stageById(o.id);
  scr.innerHTML=`<div class="lhead"><div class="row"><button class="iconbtn" data-a="leave" aria-label="Leave trial">✕</button><div class="grow"><p class="eyebrow" style="color:var(--violet)">MASTER TRIAL · ${o.eyebrow}</p><h3>${stg.title}</h3></div></div></div>
  <div class="stack"><div class="win brief stack"><p class="eyebrow" style="color:var(--violet)">CLIENT BRIEF</p><p class="quote">“${o.brief}”</p><p class="muted" style="font-size:14.5px">No multiple choice. Diagnose by ear, fix it with your tools, then submit. Hints are free, but they lower the mastery you earn.</p></div><div class="stack th"></div><div class="hints"></div><button class="btn violet big block" data-a="submit">SUBMIT TO THE CLIENT</button></div>`;
  const k=o.build($('.th',scr));TRIAL_K=k;const stop=()=>{try{k.stop&&k.stop()}catch(e){}};
  $('[data-a=leave]',scr).onclick=()=>{sfx.tap();stop();S.daily.active=null;save();go('region')};
  hintBar($('.hints',scr),{hints:o.hints,demo:o.demo?()=>o.demo(k):null,demoText:o.demoText,reveal:()=>{const m=modal(`<h2>What the client hears</h2><div class="check" style="width:100%;text-align:left">${o.problems.map(t=>`<div>${t}</div>`).join('')}</div><p class="muted">The fixes are up to you.</p><button class="btn block rv-ok">BACK TO WORK</button>`);$('.rv-ok',m).onclick=()=>m.close();if(o.reveal)o.reveal(k)},onLevel:l=>{hl=l}});
  const sb=$('[data-a=submit]',scr);sb.onclick=async()=>{sb.disabled=true;const C=await o.criteria(k);sb.disabled=false;C.forEach(c=>tagResult(c.tag,c.ok));const pass=C.every(c=>c.ok);save();
    const m=modal(`<p class="eyebrow" style="color:var(--violet)">CLIENT FEEDBACK</p><h2 class="rw-t" style="color:${pass?'var(--neon)':'var(--amber)'}">${pass?o.cert:'NOT YET'}</h2><div class="check" style="width:100%;text-align:left">${C.map(c=>`<div class="${c.ok?'ok':'no'}">${c.k}: ${c.ok?c.good:c.bad}</div>`).join('')}</div>${pass?'':'<p class="muted">Fix the red items and submit again. Listen before you change anything.</p>'}<button class="btn block tr-ok">${pass?'CLAIM CERTIFICATION':'KEEP FIXING'}</button>`);
    $('.tr-ok',m).onclick=async()=>{m.close();if(!pass)return;stop();const first=!S.done.includes(o.id);const f=[1,.8,.6,.4,.2][clamp(hl,0,4)];gain(o.skills,'p',20*f);learn(o.skills);if(first)S.done.push(o.id);addMission(o.mission||'drums');save();
      await reward({eyebrow:'MASTER TRIAL PASSED',title:o.cert,xp:first?stg.xp:20,coins:first?70:5,cosmetics:first?(o.cosmetics||[]):[],lines:[`PRACTICAL MASTERY +${Math.round(20*f)}% ON EVERY ${o.eyebrow} SKILL`].concat(first?[`${WNAME[o.world].toUpperCase()} CLEARED`]:[])});
      if(first&&o.ability)await unlockAbility(o.ability);finishActivity('new',first?['victory',o.world]:'region')}}}
const crit=(k,ok,good,bad,tag)=>({k,ok:!!ok,good,bad,tag});
