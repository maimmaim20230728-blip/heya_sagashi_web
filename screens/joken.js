'use strict';
/* 画面: わたしの条件
   ・ゆずれないこと／あればうれしいこと／家賃の上限／通う場所 を先に書く（端末の中だけ・api.save('joken')）
   ・見た部屋（内見の画面で足した props）ごとに、条件に ○△× を本人がつけて並べる。🔴点数・合計・順位は出さない（SPEC で明示して許した比べる表示はこれだけ）
   ・保存の形 joken = { must:[{id,text}], want:[{id,text}], rent:'', places:[{id,text}] } / 印は props[].marks[条件のid] = 'o'|'t'|'x' */
(function(){
  var MARKS = ['', 'o', 't', 'x'];
  var SHOW = { '':'', o:'○', t:'△', x:'×' };
  function newId(){ return 'j' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
  function load(api){
    var j = api.load('joken', null) || {};
    return { must:Array.isArray(j.must) ? j.must : [], want:Array.isArray(j.want) ? j.want : [], rent:typeof j.rent === 'string' ? j.rent : '', places:Array.isArray(j.places) ? j.places : [] };
  }
  window.SCREENS.register('joken', {
    render: function(c, api){
      var J = load(api);
      function save(){ if(!api.save('joken', J)) api.toast(api.T('common.storageFull')); }
      c.appendChild(api.el('h1', 'scr-title', api.T('screen.joken.title')));
      c.appendChild(api.el('p', 'hint', api.T('screen.joken.lead')));

      /* 書いて足す一覧（ゆずれない・うれしい・通う場所） */
      function listBlock(field, title){
        c.appendChild(api.el('h2', 'sec-h', title));
        var ul = api.el('ul', 'list jk-list');
        var f = api.el('div', 'add-row');
        f.setAttribute('data-nodirty', '1');
        var inp = document.createElement('input');
        inp.type = 'text'; inp.maxLength = 60; inp.placeholder = api.T('screen.joken.itemPh');
        inp.setAttribute('aria-label', title);
        var add = api.el('button', 'btn primary', api.T('screen.joken.add'));
        add.type = 'button';
        f.appendChild(inp); f.appendChild(add);
        function draw(){
          ul.textContent = '';
          J[field].forEach(function(it){
            var li = api.el('li', '');
            li.appendChild(api.el('span', 'grow', it.text));
            var d = api.el('button', 'btn small-btn', api.T('screen.joken.delItem'));
            d.type = 'button';
            d.setAttribute('aria-label', api.T('screen.joken.delItem') + ' ' + it.text);
            api.Tap.bind(d, function(){ J[field] = J[field].filter(function(x){ return x.id !== it.id; }); save(); draw(); drawCompare(); });
            li.appendChild(d);
            ul.appendChild(li);
          });
        }
        api.Tap.bind(add, function(){
          var v = inp.value.trim();
          if(!v) return;
          J[field].push({ id:newId(), text:v.slice(0, 60) });
          save(); inp.value = ''; api.markSaved(); draw(); drawCompare();
        });
        c.appendChild(ul); c.appendChild(f);
        draw();
      }
      listBlock('must', api.T('screen.joken.mustH'));
      listBlock('want', api.T('screen.joken.wantH'));

      c.appendChild(api.el('h2', 'sec-h', api.T('screen.joken.rentH')));
      var rf = api.el('div', 'field');
      rf.setAttribute('data-nodirty', '1');
      var rent = document.createElement('input');
      rent.type = 'text'; rent.maxLength = 40; rent.placeholder = api.T('screen.joken.rentPh'); rent.value = J.rent;
      rent.setAttribute('aria-label', api.T('screen.joken.rentH'));
      rent.addEventListener('input', function(){ J.rent = rent.value; save(); });
      rf.appendChild(rent);
      c.appendChild(rf);

      listBlock('places', api.T('screen.joken.placesH'));

      /* 見た部屋を並べる */
      c.appendChild(api.el('h2', 'sec-h', api.T('screen.joken.compareH')));
      var cmp = api.el('div', 'compare');
      c.appendChild(cmp);
      function drawCompare(){
        cmp.textContent = '';
        var props = api.load('props', []) || [];
        var items = J.must.concat(J.want);
        if(!props.length){ cmp.appendChild(api.el('p', 'hint', api.T('screen.joken.noProps'))); return; }
        if(!items.length){ cmp.appendChild(api.el('p', 'hint', api.T('screen.joken.noItems'))); return; }
        cmp.appendChild(api.el('p', 'hint', api.T('screen.joken.compareHint')));
        var wrap = api.el('div', 'cmp-wrap');
        var tb = document.createElement('table');
        tb.className = 'cmp';
        var tr = document.createElement('tr');
        tr.appendChild(api.el('th', '', ''));
        props.forEach(function(p){ tr.appendChild(api.el('th', 'cmp-prop', p.name)); });
        tb.appendChild(tr);
        items.forEach(function(it){
          var row = document.createElement('tr');
          var must = J.must.indexOf(it) >= 0;
          row.appendChild(api.el('th', 'cmp-item' + (must ? ' must' : ''), (must ? '◆ ' : '') + it.text));
          props.forEach(function(p){
            var td = document.createElement('td');
            var b = api.el('button', 'cmp-cell');
            b.type = 'button';
            var v = (p.marks && p.marks[it.id]) || '';
            b.textContent = SHOW[v];
            b.setAttribute('aria-label', p.name + ' / ' + it.text + (v ? ' ' + SHOW[v] : ''));
            api.Tap.bind(b, function(){
              var all = api.load('props', []) || [];
              var q = all.filter(function(x){ return x.id === p.id; })[0];
              if(!q) return;
              q.marks = q.marks || {};
              var nv = MARKS[(MARKS.indexOf(q.marks[it.id] || '') + 1) % MARKS.length];
              if(nv) q.marks[it.id] = nv; else delete q.marks[it.id];
              api.save('props', all);
              b.textContent = SHOW[nv];
              b.setAttribute('aria-label', p.name + ' / ' + it.text + (nv ? ' ' + SHOW[nv] : ''));
            });
            td.appendChild(b);
            row.appendChild(td);
          });
          tb.appendChild(row);
        });
        wrap.appendChild(tb);
        cmp.appendChild(wrap);
      }
      drawCompare();
    }
  });
})();
