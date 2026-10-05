'use strict';
/* 画面: ホーム
   ・いちばん上に「国や自治体のアプリではありません」と出典の一覧への入口（Play の政府関連の情報アプリの要件）
   ・気になること（人ではなく困りごとで選ぶ。いくつでも）→ 段階の一覧（押すとカードの画面へ） */
(function(){
  window.SCREENS.register('home', {
    render: function(c, api){
      var U = window.HEYA_UI, D = U.D;
      c.appendChild(U.notApp(api));
      c.appendChild(api.el('p', 'home-lead', api.T('screen.home.lead')));

      /* 気になること */
      c.appendChild(api.el('h2', 'sec-h', api.T('screen.home.concernsH')));
      c.appendChild(api.el('p', 'hint', api.T('screen.home.concernsHint')));
      var chips = api.el('div', 'chips concern-chips');
      var sel = U.getConcerns(api);
      U.CONCERNS.forEach(function(k){
        var b = api.el('button', 'chip' + (sel.indexOf(k) >= 0 ? ' on' : ''), api.T('screen.common.concerns.' + k));
        b.type = 'button';
        b.setAttribute('aria-pressed', sel.indexOf(k) >= 0 ? 'true' : 'false');
        api.Tap.bind(b, function(){
          var on = !b.classList.contains('on');
          U.setConcern(api, k, on);
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          drawStages();
        });
        chips.appendChild(b);
      });
      c.appendChild(chips);

      /* すすめかた（段階） */
      c.appendChild(api.el('h2', 'sec-h', api.T('screen.home.stagesH')));
      c.appendChild(api.el('p', 'hint', api.T('screen.home.stagesHint')));
      var list = api.el('div', 'stage-list');
      c.appendChild(list);
      function drawStages(){
        list.textContent = '';
        var s2 = U.getConcerns(api);
        D.stages.forEach(function(s, i){
          var cards = D.cards.filter(function(x){ return x.stage === s.key; });
          if(!cards.length) return;
          var b = api.el('button', 'stage-btn');
          b.type = 'button';
          b.appendChild(api.el('span', 'stage-no', String(i)));
          var t = api.el('span', 'stage-txt');
          t.appendChild(api.el('span', 'stage-lbl', U.tx(s, 'label', api)));
          t.appendChild(api.el('span', 'stage-lead', U.tx(s, 'lead', api)));
          var n = api.el('span', 'stage-n', String(api.T('screen.common.cardsCount')).replace('{n}', cards.length));
          var fitN = s2.length ? cards.filter(function(x){ return U.fits(x, s2); }).length : 0;
          if(fitN) n.appendChild(api.el('span', 'stage-fit', String(api.T('screen.common.fitCount')).replace('{n}', fitN)));
          t.appendChild(n);
          b.appendChild(t);
          api.Tap.bind(b, function(){ U.nav.stage = s.key; api.go('cards'); });
          list.appendChild(b);
        });
      }
      drawStages();
    }
  });
})();
