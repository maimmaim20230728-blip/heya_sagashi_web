'use strict';
/* 画面: カード
   ・段階を選ぶ（すべて／各段階）→ カードの一覧 → 押すと1枚を重ねて開く（HEYA_UI.openCard）
   ・並び：だれにでも役立つカード（concerns に all）→ 選んだ気になることに合うカード → ほかの事情に合わせたカード（たたむ）
   ・気になることを選んでいれば、合うカードに「合う」の印。「合うものだけ」で絞れる（ほかのカードも「ぜんぶ見る」で戻せる）
   ・たしかめた印は ✓ だけ出す（数や割合は出さない） */
(function(){
  var stage = 'all', onlyFit = false, restOpen = false;
  function isGeneral(x){ var cs = x.concerns || []; return !cs.length || cs.indexOf('all') >= 0; }
  window.SCREENS.register('cards', {
    render: function(c, api){
      var U = window.HEYA_UI, D = U.D;
      if(U.nav.stage){ stage = U.nav.stage; U.nav.stage = null; }
      var sel = U.getConcerns(api);
      if(!sel.length) onlyFit = false;
      var h = api.el('h1', 'scr-title', api.T('screen.cards.title'));
      c.appendChild(h);

      var tabs = api.el('div', 'chips stage-chips');
      var opts = [{ key:'all', label:api.T('screen.cards.all') }].concat(D.stages.filter(function(s){
        return D.cards.some(function(x){ return x.stage === s.key; });
      }).map(function(s){ return { key:s.key, label:parseInt(s.key, 10) + ' ' + U.tx(s, 'label', api) }; }));
      opts.forEach(function(o){
        var b = api.el('button', 'chip' + (o.key === stage ? ' on' : ''), o.label);
        b.type = 'button';
        b.setAttribute('aria-pressed', o.key === stage ? 'true' : 'false');
        api.Tap.bind(b, function(){ stage = o.key; api.go('cards'); });
        tabs.appendChild(b);
      });
      c.appendChild(tabs);

      if(sel.length){
        var fb = api.el('button', 'btn fit-toggle' + (onlyFit ? ' primary' : ''), onlyFit ? api.T('screen.cards.showAll') : api.T('screen.cards.onlyFit'));
        fb.type = 'button';
        api.Tap.bind(fb, function(){ onlyFit = !onlyFit; api.go('cards'); });
        c.appendChild(fb);
      }

      var cur = D.stages.filter(function(s){ return s.key === stage; })[0];
      if(cur) c.appendChild(api.el('p', 'hint', U.tx(cur, 'lead', api)));

      var list = api.el('ul', 'card-list');
      var empty = api.el('p', 'empty hidden', api.T('screen.cards.noFit'));
      var restBtn = api.el('button', 'btn fold-btn hidden');
      restBtn.type = 'button';
      var rest = api.el('ul', 'card-list');
      c.appendChild(list);
      c.appendChild(empty);
      c.appendChild(restBtn);
      c.appendChild(rest);
      api.Tap.bind(restBtn, function(){ restOpen = !restOpen; draw(); });
      /* カードを閉じたら、一覧だけ描き直す（たしかめた印。読んでいた位置はそのまま） */
      function draw(){
        list.textContent = '';
        rest.textContent = '';
        var shown = 0, restN = 0;
        D.cards.forEach(function(x, i){
          if(stage !== 'all' && x.stage !== stage) return;
          var fit = U.fits(x, sel);
          if(onlyFit && !fit) return;
          var into = list;
          if(!fit && !isGeneral(x)){ restN++; if(!restOpen) return; into = rest; }
          else shown++;
          var li = api.el('li', 'card-row' + (fit ? ' fit' : ''));
          var b = api.el('button', 'card-btn');
          b.type = 'button';
          b.appendChild(api.el('span', 'cr-no', String(i + 1)));
          var t = api.el('span', 'cr-txt');
          t.appendChild(api.el('span', 'cr-title', U.tx(x, 'title', api)));
          var m = api.el('span', 'cr-meta');
          m.appendChild(U.strengthTag(api, x.strength));
          if(fit) m.appendChild(api.el('span', 'fit-mark', api.T('screen.common.fit')));
          if(U.isDone(api, x.key)) m.appendChild(api.el('span', 'done-mark', '✓ ' + api.T('screen.common.done')));
          t.appendChild(m);
          b.appendChild(t);
          api.Tap.bind(b, function(){ U.openCard(api, x.key, draw); });
          li.appendChild(b);
          into.appendChild(li);
        });
        empty.classList.toggle('hidden', shown > 0 || restN > 0);
        restBtn.classList.toggle('hidden', !restN);
        restBtn.textContent = (restOpen ? '▼ ' : '▶ ') + String(api.T(restOpen ? 'screen.cards.restHide' : 'screen.cards.restShow')).replace('{n}', restN);
        restBtn.setAttribute('aria-expanded', restOpen ? 'true' : 'false');
      }
      draw();
    }
  });
})();
