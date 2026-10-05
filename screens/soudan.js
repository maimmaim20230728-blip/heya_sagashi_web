'use strict';
/* 画面: 相談先
   ・都道府県を選ぶ（端末に覚える api.save('prefecture')）→ 全国どこでも使える窓口＋その都道府県の窓口
   ・電話は <a href="tel:">（押すとかけられる）。リンクは国・公的な法人・自治体の公式のページだけ（_build_data.js が見張る） */
(function(){
  var PREFS = [
    ['01','北海道','Hokkaido'],['02','青森県','Aomori'],['03','岩手県','Iwate'],['04','宮城県','Miyagi'],['05','秋田県','Akita'],['06','山形県','Yamagata'],['07','福島県','Fukushima'],
    ['08','茨城県','Ibaraki'],['09','栃木県','Tochigi'],['10','群馬県','Gunma'],['11','埼玉県','Saitama'],['12','千葉県','Chiba'],['13','東京都','Tokyo'],['14','神奈川県','Kanagawa'],
    ['15','新潟県','Niigata'],['16','富山県','Toyama'],['17','石川県','Ishikawa'],['18','福井県','Fukui'],['19','山梨県','Yamanashi'],['20','長野県','Nagano'],['21','岐阜県','Gifu'],
    ['22','静岡県','Shizuoka'],['23','愛知県','Aichi'],['24','三重県','Mie'],['25','滋賀県','Shiga'],['26','京都府','Kyoto'],['27','大阪府','Osaka'],['28','兵庫県','Hyogo'],
    ['29','奈良県','Nara'],['30','和歌山県','Wakayama'],['31','鳥取県','Tottori'],['32','島根県','Shimane'],['33','岡山県','Okayama'],['34','広島県','Hiroshima'],['35','山口県','Yamaguchi'],
    ['36','徳島県','Tokushima'],['37','香川県','Kagawa'],['38','愛媛県','Ehime'],['39','高知県','Kochi'],['40','福岡県','Fukuoka'],['41','佐賀県','Saga'],['42','長崎県','Nagasaki'],
    ['43','熊本県','Kumamoto'],['44','大分県','Oita'],['45','宮崎県','Miyazaki'],['46','鹿児島県','Kagoshima'],['47','沖縄県','Okinawa']
  ];
  /* 選んだ「気になること」に合う窓口を先に（合う印をつける）。並びは元のまま */
  function fitFirst(list, sel){
    var U = window.HEYA_UI;
    if(!sel.length) return list.map(function(ct){ return { ct: ct, fit: false }; });
    var a = [], b = [];
    list.forEach(function(ct){ (U.fits(ct, sel) ? a : b).push({ ct: ct, fit: U.fits(ct, sel) }); });
    return a.concat(b);
  }
  function contactCard(api, ct, fit){
    var U = window.HEYA_UI;
    var box = api.el('div', 'card contact' + (fit ? ' fit' : ''));
    var hd = api.el('h3', 'ct-name', U.tx(ct, 'name', api));
    if(fit){ hd.appendChild(document.createTextNode(' ')); hd.appendChild(api.el('span', 'fit-mark', api.T('screen.common.fit'))); }
    box.appendChild(hd);
    if(ct.phone){
      var tels = String(ct.phone).match(/(#?\d[\d-]{1,14}\d)/g) || [];
      var pp = api.el('p', 'ct-phone', U.tx(ct, 'phone', api));
      box.appendChild(pp);
      tels.slice(0, 2).forEach(function(t){
        var a = document.createElement('a');
        a.className = 'call-link'; a.href = 'tel:' + t.replace(/-/g, '').replace('#', '%23');
        a.textContent = api.T('screen.soudan.call') + ' ' + t;
        box.appendChild(a);
      });
    }
    if(ct.text) String(U.tx(ct, 'text', api)).split(/\n+/).forEach(function(p){ if(p.trim()) box.appendChild(api.el('p', 'ct-text', p.trim())); });
    if(ct.hours) box.appendChild(api.el('p', 'hint ct-hours', U.tx(ct, 'hours', api)));
    if(ct.find){
      var fp = api.el('p', 'ct-find');
      fp.appendChild(api.el('strong', '', api.T('screen.soudan.find') + '：'));
      fp.appendChild(document.createTextNode(U.tx(ct, 'find', api)));
      box.appendChild(fp);
    }
    (ct.urls || []).slice(0, 2).forEach(function(u, i){
      var on = U.orgName(api, u);
      var a = U.link(api, u, api.T(i ? 'screen.soudan.open2' : 'screen.soudan.open') + (on ? (api.lang === 'en' ? ' (' + on + ')' : '（' + on + '）') : ''));
      a.classList.add('ct-link');
      box.appendChild(a);
    });
    return box;
  }
  window.SCREENS.register('soudan', {
    render: function(c, api){
      var U = window.HEYA_UI, D = U.D;
      c.appendChild(api.el('h1', 'scr-title', api.T('screen.soudan.title')));
      c.appendChild(api.el('p', 'hint', api.T('screen.soudan.lead')));
      var f = api.el('div', 'field');
      var lb = api.el('label', '', api.T('screen.soudan.prefH'));
      var sel = document.createElement('select');
      sel.id = 'sd-pref'; lb.setAttribute('for', 'sd-pref');
      var o0 = document.createElement('option'); o0.value = ''; o0.textContent = api.T('screen.soudan.prefNone'); sel.appendChild(o0);
      PREFS.forEach(function(p){ var o = document.createElement('option'); o.value = p[0]; o.textContent = api.lang === 'en' ? p[2] : p[1]; sel.appendChild(o); });
      var cur = api.load('prefecture', '') || '';
      sel.value = cur;
      sel.addEventListener('change', function(){ api.save('prefecture', sel.value); draw(); });
      f.appendChild(lb); f.appendChild(sel);
      c.appendChild(f);
      var out = api.el('div', 'sd-out');
      c.appendChild(out);
      var localOpen = false;
      function draw(){
        out.textContent = '';
        var code = sel.value;
        var cs = U.getConcerns(api);
        if(code){
          var p = PREFS.filter(function(x){ return x[0] === code; })[0];
          var name = api.lang === 'en' ? p[2] : p[1];
          out.appendChild(api.el('h2', 'sec-h', String(api.T('screen.soudan.prefListH')).replace('{p}', name)));
          var pd = (D.contacts.prefs || {})[code];
          if(pd && pd.list && pd.list.length) fitFirst(pd.list, cs).forEach(function(x){ out.appendChild(contactCard(api, x.ct, x.fit)); });
          else out.appendChild(api.el('p', 'note', api.T('screen.soudan.prefPending')));
        }
        /* 住む地域で探す窓口（種類と探し方。数が多いので、たたんでおく） */
        var local = D.contacts.local || [];
        if(local.length){
          out.appendChild(api.el('h2', 'sec-h', api.T('screen.soudan.localH')));
          out.appendChild(api.el('p', 'hint', api.T('screen.soudan.localLead')));
          var fb = api.el('button', 'btn fold-btn', (localOpen ? '▼ ' : '▶ ') + api.T(localOpen ? 'screen.soudan.localHide' : 'screen.soudan.localShow'));
          fb.type = 'button';
          fb.setAttribute('aria-expanded', localOpen ? 'true' : 'false');
          api.Tap.bind(fb, function(){ localOpen = !localOpen; draw(); });
          out.appendChild(fb);
          if(localOpen) fitFirst(local, cs).forEach(function(x){ out.appendChild(contactCard(api, x.ct, x.fit)); });
        }
        out.appendChild(api.el('h2', 'sec-h', api.T('screen.soudan.nationalH')));
        fitFirst(D.contacts.national || [], cs).forEach(function(x){ out.appendChild(contactCard(api, x.ct, x.fit)); });
      }
      draw();
    }
  });
})();
