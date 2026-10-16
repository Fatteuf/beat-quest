/* ================= boot ================= */
$$('#nav button').forEach(b=>b.onclick=()=>{sfx.tap();go(b.dataset.go)});
hydrateIcons($('#nav'));
load();getSample();go('title');cloudInit();
