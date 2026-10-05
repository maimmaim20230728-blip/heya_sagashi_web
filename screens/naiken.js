'use strict';
/* 画面: 内見のチェックシート
   ・見に行く部屋の呼び名を足す → 部屋ごとにシートを重ねて開き、□に印とメモ（端末の中だけ・api.save('props')）
   ・「シートを見る（記録しない）」は印をつけない見るだけのシート
   ・印の数や割合は出さない（SPEC_COMMON：点数化・達成率を出さない）
   ・保存の形 props = [{ id, name, ticks:{ 行のkey:1 }, memo, marks:{ 条件のid:'o'|'t'|'x' } }]（marks は「わたしの条件」の画面が使う） */
(function(){
  function newId(){ return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }

  function openSheet(api, propId, onclose){
    var U = window.HEYA_UI, D = U.D, S = D.sheet;
    var props = api.load('props', []) || [];
    var prop = propId ? props.filter(function(p){ return p.id === propId; })[0] : null;
    function saveProp(){
      var all = api.load('props', []) || [];
      for(var i = 0; i < all.length; i++){ if(all[i].id === prop.id){ all[i] = prop; break; } }
      if(!api.save('props', all)) api.toast(api.T('common.storageFull'));
    }
    var ov = U.overlay(api, 'sheet-ov');
    ov._onclose = onclose || null;
    var box = api.el('div', 'sheet-box');
    var h = api.el('h2', 'scr-title', prop ? prop.name : api.T('screen.naiken.title'));
    h.setAttribute('tabindex', '-1');
    box.appendChild(h);
    box.appendChild(api.el('p', 'hint', U.tx(S, 'lead', api)));   // ★の説明は lead の中にある(starHint を重ねて出さない)

    /* 持っていく物（開け閉め） */
    var bt = api.el('button', 'btn wide fold-btn', '▸ ' + api.T('screen.naiken.bringH'));
    bt.type = 'button';
    var bl = api.el('ul', 'bring-list hidden');
    (S.bring || []).forEach(function(b){
      var li = api.el('li', '');
      li.appendChild(api.el('b', '', U.tx(b, 'thing', api)));
      li.appendChild(api.el('span', '', U.tx(b, 'use', api)));
      bl.appendChild(li);
    });
    api.Tap.bind(bt, function(){ var open = bl.classList.contains('hidden'); bl.classList.toggle('hidden', !open); bt.textContent = (open ? '▾ ' : '▸ ') + api.T('screen.naiken.bringH'); });
    box.appendChild(bt); box.appendChild(bl);

    var sel = U.getConcerns(api);
    S.groups.forEach(function(g){
      var rows = S.rows.filter(function(r){ return r.group === g.key; });
      if(!rows.length) return;
      var sec = api.el('section', 'nk-group');
      sec.appendChild(api.el('h3', 'nk-gh', U.tx(g, 'label', api)));
      if(g.lead) sec.appendChild(api.el('p', 'hint', U.tx(g, 'lead', api)));
      var ul = api.el('ul', 'nk-rows');
      rows.forEach(function(r){
        var li = api.el('li', 'nk-row' + (U.fits(r, sel) ? ' fit' : ''));
        var main;
        if(prop){
          main = api.el('button', 'nk-check');
          main.type = 'button';
          var draw = function(){
            var on = !!(prop.ticks && prop.ticks[r.key]);
            main.textContent = '';
            main.appendChild(api.el('span', 'nk-box', on ? '☑' : '☐'));
            main.appendChild(api.el('span', 'nk-txt', (r.star ? '★ ' : '') + U.tx(r, 'check', api)));
            main.setAttribute('aria-pressed', on ? 'true' : 'false');
            li.classList.toggle('on', on);
          };
          api.Tap.bind(main, function(){
            prop.ticks = prop.ticks || {};
            if(prop.ticks[r.key]) delete prop.ticks[r.key]; else prop.ticks[r.key] = 1;
            saveProp(); draw();
          });
          draw();
        } else {
          main = api.el('p', 'nk-check ro', (r.star ? '★ ' : '') + U.tx(r, 'check', api));
        }
        li.appendChild(main);
        if(r.hint) li.appendChild(api.el('p', 'nk-hint', U.tx(r, 'hint', api)));
        if(U.fits(r, sel)) li.appendChild(api.el('span', 'fit-mark', api.T('screen.common.fit')));
        (r.card_keys || []).forEach(function(k){
          var cd = U.cardByKey(k);
          if(!cd) return;
          var cb = api.el('button', 'link-btn', '→ ' + (U.cardIndex(k) + 1) + ' ' + U.tx(cd, 'title', api));
          cb.type = 'button';
          api.Tap.bind(cb, function(){ U.openCard(api, k); });
          li.appendChild(cb);
        });
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      box.appendChild(sec);
    });

    if(prop){
      var f = api.el('div', 'field');
      f.setAttribute('data-nodirty', '1');           // 入れたらすぐ保存する欄（戻るボタンの書きかけに数えない）
      var lb = api.el('label', '', api.T('screen.naiken.memo'));
      var ta = document.createElement('textarea');
      ta.id = 'nk-memo'; lb.setAttribute('for', 'nk-memo');
      ta.rows = 5; ta.value = prop.memo || '';
      ta.addEventListener('input', function(){ prop.memo = ta.value; saveProp(); });
      f.appendChild(lb); f.appendChild(ta);
      box.appendChild(f);
      var row = api.el('div', 'btn-row');
      var rn = api.el('button', 'btn', api.T('screen.naiken.rename'));
      var dl = api.el('button', 'btn danger', api.T('screen.naiken.delProp'));
      rn.type = 'button'; dl.type = 'button';
      /* 呼び名をなおす（Play版の prompt は英語のボタンになるので、アプリの中の欄で） */
      var ed = api.el('div', 'add-row hidden');
      ed.setAttribute('data-nodirty', '1');
      var ein = document.createElement('input');
      ein.type = 'text'; ein.maxLength = 40; ein.setAttribute('aria-label', api.T('screen.naiken.namePh'));
      var eok = api.el('button', 'btn primary', api.T('common.save'));
      eok.type = 'button';
      ed.appendChild(ein); ed.appendChild(eok);
      api.Tap.bind(rn, function(){ ein.value = prop.name; ed.classList.remove('hidden'); try{ ein.focus(); }catch(_){} });
      api.Tap.bind(eok, function(){
        var v = ein.value.trim();
        if(!v){ api.toast(api.T('screen.naiken.noName')); return; }
        prop.name = v.slice(0, 40); saveProp(); h.textContent = prop.name;
        ed.classList.add('hidden'); api.toast(api.T('common.saved'));
      });
      api.Tap.bind(dl, function(){
        api.ask(api.T('screen.naiken.delConfirm'), function(ok){
          if(!ok) return;
          var all = (api.load('props', []) || []).filter(function(p){ return p.id !== prop.id; });
          api.save('props', all);
          api.toast(api.T('common.deleted'));
          if(ov.parentNode) ov.parentNode.removeChild(ov);
          if(ov._onclose) ov._onclose();
        });
      });
      row.appendChild(rn); row.appendChild(dl);
      box.appendChild(row);
      box.appendChild(ed);
    }
    ov.insertBefore(box, ov.firstChild);
    try{ h.focus(); }catch(_){}
  }

  window.SCREENS.register('naiken', {
    render: function(c, api){
      c.appendChild(api.el('h1', 'scr-title', api.T('screen.naiken.title')));
      c.appendChild(api.el('h2', 'sec-h', api.T('screen.naiken.propsH')));
      c.appendChild(api.el('p', 'hint', api.T('screen.naiken.propsHint')));
      var f = api.el('div', 'add-row');
      f.setAttribute('data-nodirty', '1');
      var inp = document.createElement('input');
      inp.type = 'text'; inp.maxLength = 40; inp.placeholder = api.T('screen.naiken.namePh');
      inp.setAttribute('aria-label', api.T('screen.naiken.namePh'));
      var add = api.el('button', 'btn primary', api.T('screen.naiken.add'));
      add.type = 'button';
      f.appendChild(inp); f.appendChild(add);
      c.appendChild(f);
      var list = api.el('ul', 'list prop-list');
      c.appendChild(list);
      function draw(){
        list.textContent = '';
        var props = api.load('props', []) || [];
        props.forEach(function(p){
          var li = api.el('li', '');
          var b = api.el('button', 'prop-btn', p.name);
          b.type = 'button';
          api.Tap.bind(b, function(){ openSheet(api, p.id, draw); });
          li.appendChild(b);
          list.appendChild(li);
        });
        if(!props.length) list.appendChild(api.el('li', 'empty-li', api.T('common.empty')));
      }
      api.Tap.bind(add, function(){
        var v = inp.value.trim();
        if(!v){ api.toast(api.T('screen.naiken.noName')); return; }
        var props = api.load('props', []) || [];
        props.push({ id:newId(), name:v.slice(0, 40), ticks:{}, memo:'', marks:{} });
        if(!api.save('props', props)){ api.toast(api.T('common.storageFull')); return; }
        inp.value = '';
        api.markSaved();
        draw();
      });
      draw();
      var vb = api.el('button', 'btn wide view-btn', api.T('screen.naiken.view'));
      vb.type = 'button';
      api.Tap.bind(vb, function(){ openSheet(api, null); });
      c.appendChild(vb);
    }
  });
})();
