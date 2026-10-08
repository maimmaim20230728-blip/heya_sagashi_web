'use strict';
/* わたしに合う部屋さがし・そよぎ 画面どうしで使う部品（window.HEYA_UI）
   ・中身は data.js（window.HEYA_DATA）。英語の中身（item.en）がまだ無いものは日本語のまま出す
   ・カードを開く（重ねた画面 .ov）・出典の一覧を開く・選んだ「気になること」・たしかめた印・画面をまたぐ行き先
   ・🔴「居場所を知られたくない（safety）」は端末に残さない（この変数の中だけ。アプリを閉じれば消える）
   ・操作は全部 api.Tap.bind。外のページへのリンクは <a target="_blank">（ブラウザ／Play版は端末のブラウザで開く） */
(function(){
  var D = window.HEYA_DATA || { cards:[], stages:[], sheet:{ groups:[], rows:[], bring:[] }, contacts:{ national:[], local:[], prefs:{} }, orgs:[], legend:{} };
  var STRENGTH = { '法律で禁止・義務':'law', '告示・規約':'rule', '国のガイドライン':'guide', '判例':'court', '公的機関の注意喚起':'warn', '実務上の目安':'tip' };
  var CONCERNS = ['move','see','hear','understand','health','age','guarantor','money','safety','foreign','refused','support','animal'];
  var safetyOn = false;           // 端末に残さない
  var nav = {};                   // 画面をまたぐ行き先（cards の段階など）

  function tx(item, f, api){
    if(!item) return '';
    if(api && api.lang === 'en' && item.en && item.en[f]) return item.en[f];
    return item[f] == null ? '' : item[f];
  }
  function cardIndex(key){ for(var i = 0; i < D.cards.length; i++){ if(D.cards[i].key === key) return i; } return -1; }
  function cardByKey(key){ var i = cardIndex(key); return i < 0 ? null : D.cards[i]; }

  /* 気になること */
  function getConcerns(api){
    var saved = api.load('concerns', []);
    var list = Array.isArray(saved) ? saved.filter(function(k){ return CONCERNS.indexOf(k) >= 0 && k !== 'safety'; }) : [];
    if(safetyOn) list.push('safety');
    return list;
  }
  function setConcern(api, k, on){
    if(k === 'safety'){ safetyOn = !!on; return; }
    var list = getConcerns(api).filter(function(x){ return x !== 'safety' && x !== k; });
    if(on) list.push(k);
    api.save('concerns', list);
  }
  function fits(item, sel){
    if(!sel.length) return false;
    var cs = item.concerns || [];
    for(var i = 0; i < cs.length; i++){ if(sel.indexOf(cs[i]) >= 0) return true; }
    return false;
  }

  /* たしかめた印（カードごと。数や割合は出さない） */
  function isDone(api, key){ var d = api.load('done', {}); return !!(d && d[key]); }
  function setDone(api, key, on){ var d = api.load('done', {}) || {}; if(on) d[key] = 1; else delete d[key]; api.save('done', d); }

  function strengthTag(api, s){
    var code = STRENGTH[s] || 'tip';
    var t = api.el('span', 'tag tag-' + code, api.T('screen.common.strengths.' + code));
    return t;
  }
  function link(api, url, text){
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.className = 'ext';
    a.textContent = text;
    return a;
  }
  /* URL のホストから、出典の一覧の組織の名前を出す（いちばん長く合うもの） */
  function orgName(api, url){
    var h = '';
    try{ h = new URL(url).hostname.toLowerCase().replace(/^www\./, ''); }catch(_){ return ''; }
    var best = null;
    (D.orgs || []).forEach(function(o){ if((h === o.host || h.slice(-(o.host.length + 1)) === '.' + o.host) && (!best || o.host.length > best.host.length)) best = o; });
    return best ? (api.lang === 'en' ? best.en : best.ja) : '';
  }
  function notApp(api){
    var box = api.el('div', 'notapp');
    box.appendChild(api.el('p', 'notapp-p', api.T('screen.common.notApp')));
    var b = api.el('button', 'btn notapp-btn', api.T('screen.common.sourcesBtn'));
    b.type = 'button';
    api.Tap.bind(b, function(){ openSources(api); });
    box.appendChild(b);
    return box;
  }

  /* 重ねた画面（とじるボタンつき） */
  function overlay(api, cls){
    var ov = api.el('div', 'ov heya-ov ' + (cls || ''));
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    var close = api.el('button', 'ov-close', api.T('common.close'));
    close.type = 'button';
    api.Tap.bind(close, function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); if(ov._onclose) ov._onclose(); });
    ov.appendChild(close);
    document.body.appendChild(ov);
    return ov;
  }

  /* カードを開く */
  function openCard(api, key, onclose){
    var c = cardByKey(key);
    if(!c) return;
    var ov = overlay(api, 'card-ov');
    ov._onclose = onclose || null;
    var box = api.el('article', 'card-full');
    var head = api.el('div', 'cf-head');
    head.appendChild(api.el('span', 'cf-no', String(cardIndex(key) + 1)));
    var h = api.el('h2', 'cf-title', tx(c, 'title', api));
    h.setAttribute('tabindex', '-1');
    head.appendChild(h);
    box.appendChild(head);
    var meta = api.el('div', 'cf-meta');
    meta.appendChild(strengthTag(api, c.strength));
    var stg = D.stages.filter(function(s){ return s.key === c.stage; })[0];
    if(stg) meta.appendChild(api.el('span', 'cf-stage', tx(stg, 'label', api)));
    box.appendChild(meta);
    var cs = (c.concerns || []).filter(function(k){ return k !== 'all'; });
    if(cs.length){
      var cr = api.el('div', 'cf-concerns');
      cs.forEach(function(k){ cr.appendChild(api.el('span', 'mini-chip', api.T('screen.common.concerns.' + k))); });
      box.appendChild(cr);
    }
    ['look','why','warn','how','note'].forEach(function(f){
      var v = tx(c, f, api);
      if(!v) return;
      var sec = api.el('section', 'cf-sec cf-' + f);
      sec.appendChild(api.el('h3', 'cf-lbl', api.T('screen.common.labels.' + f)));
      String(v).split(/\n+/).forEach(function(p){ if(p.trim()) sec.appendChild(api.el('p', 'cf-p', p.trim())); });
      box.appendChild(sec);
    });
    /* たしかめた */
    var doneB = api.el('button', 'btn done-btn');
    doneB.type = 'button';
    function drawDone(){ var on = isDone(api, key); doneB.textContent = (on ? '☑ ' : '☐ ') + api.T('screen.common.done'); doneB.classList.toggle('on', on); doneB.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    api.Tap.bind(doneB, function(){ setDone(api, key, !isDone(api, key)); drawDone(); });
    drawDone();
    box.appendChild(doneB);
    /* 内見のときに確かめること */
    var rows = D.sheet.rows.filter(function(r){ return (r.card_keys || []).indexOf(key) >= 0; });
    if(rows.length){
      var rs = api.el('section', 'cf-sec cf-rows');
      rs.appendChild(api.el('h3', 'cf-lbl', api.T('screen.common.sheetRows')));
      var ul = api.el('ul', 'cf-rowlist');
      rows.forEach(function(r){ ul.appendChild(api.el('li', '', (r.star ? '★ ' : '') + tx(r, 'check', api))); });
      rs.appendChild(ul);
      box.appendChild(rs);
    }
    /* 出典 */
    var ss = api.el('section', 'cf-sec cf-src');
    ss.appendChild(api.el('h3', 'cf-lbl', api.T('screen.common.sources')));
    var sl = api.el('ul', 'src-list');
    (c.sources || []).forEach(function(s){
      var li = api.el('li', '');
      li.appendChild(link(api, s.url, s.title));
      if(s.publisher) li.appendChild(api.el('span', 'src-pub', s.publisher));
      sl.appendChild(li);
    });
    ss.appendChild(sl);
    box.appendChild(ss);
    box.appendChild(api.el('p', 'cf-note hint', api.T('screen.common.cardNote')));
    box.appendChild(api.el('p', 'cf-note hint', api.T('screen.common.notApp')));
    ov.insertBefore(box, ov.firstChild);
    ov.scrollTop = 0;
    try{ h.focus(); }catch(_){}
    return ov;
  }

  /* 出典の一覧（組織の名前とトップのURL。Play の政府関連の情報アプリの要件）。
     出すのはサイト（p の無い組織）だけ。サブドメインの組織は親のサイトにまとめてある（_build_data.js）。
     並び（国の機関→裁判所→公的な法人→都道府県→市区町村）とURLは、Play の説明文（store/_listing.js）と同じ */
  function sites(){ return (D.orgs || []).filter(function(o){ return !o.p; }); }
  /* 見せるURLは、うしろの「/」を取った形（説明文と同じ文字にする） */
  function siteUrl(u){ return String(u).replace(/\/$/, ''); }
  function openSources(api){
    var ov = overlay(api, 'src-ov');
    var box = api.el('div', 'src-box');
    var h = api.el('h2', 'scr-title', api.T('screen.common.sourcesTitle'));
    h.setAttribute('tabindex', '-1');
    box.appendChild(h);
    box.appendChild(api.el('p', 'notapp-p', api.T('screen.common.notApp')));
    var all = sites();
    box.appendChild(api.el('p', 'hint', String(api.T('screen.common.sourcesLead')).replace('{n}', all.length)));
    box.appendChild(api.el('p', 'hint', api.T('screen.common.sourcesSub')));
    var asOf = (api.lang === 'en' && D.asOfEn) ? D.asOfEn : D.asOf;
    if(asOf) box.appendChild(api.el('p', 'hint', asOf));
    ['gov','court','pub','pref','city'].forEach(function(g){
      var list = all.filter(function(o){ return o.lv === g; });
      if(!list.length) return;
      /* 1サイト1行（石川県は2つのドメインなので2行。行の数＝説明文のURLの数） */
      box.appendChild(api.el('h3', 'sec-h', api.T('screen.common.groups.' + g)));
      var ul = api.el('ul', 'src-list');
      list.forEach(function(o){
        var li = api.el('li', '');
        var nm = api.lang === 'en' ? o.en : o.ja, note = api.lang === 'en' ? o.noteEn : o.note;
        li.appendChild(api.el('span', 'src-org', nm + (note ? (api.lang === 'en' ? ', ' + note : '：' + note) : '')));
        li.appendChild(link(api, o.url, siteUrl(o.url)));
        ul.appendChild(li);
      });
      box.appendChild(ul);
    });
    /* 印の意味 */
    box.appendChild(api.el('h3', 'sec-h', api.T('screen.common.legendTitle')));
    var lg = api.el('ul', 'legend-list');
    Object.keys(STRENGTH).forEach(function(k){
      var li = api.el('li', '');
      li.appendChild(strengthTag(api, k));
      var txt = (api.lang === 'en' && D.legendEn && D.legendEn[k]) ? D.legendEn[k] : (D.legend[k] || '');
      li.appendChild(api.el('span', 'legend-t', txt));
      lg.appendChild(li);
    });
    box.appendChild(lg);
    ov.insertBefore(box, ov.firstChild);
    try{ h.focus(); }catch(_){}
    return ov;
  }

  /* プライバシーポリシー（2026-10-05）。せっていから開くときは、ページを移らずに重ねた画面で出す。
     ページを移ると「すぐ閉じる」の無いページに出てしまい、Web版ではブラウザの「戻る」でアプリに戻れてしまうため。
     中身は privacy.html の <main>（正本は1つ）。いまの言葉の半分だけ（hr.lang-sep の前=日本語・後=英語）。「← もどる」は除く。
     読めないとき（fetch の無い環境など）は、今までどおり privacy.html へ移る */
  var ppBusy = false;
  function openPrivacy(api){
    if(ppBusy || document.querySelector('.pp-ov')) return;
    var fail = function(){ ppBusy = false; try{ location.href = 'privacy.html'; }catch(_){} };
    if(typeof fetch !== 'function' || typeof DOMParser === 'undefined'){ fail(); return; }
    ppBusy = true;
    fetch('privacy.html').then(function(r){
      if(!r.ok) throw new Error('http ' + r.status);
      return r.text();
    }).then(function(html){
      var main = new DOMParser().parseFromString(html, 'text/html').querySelector('main');
      if(!main) throw new Error('no main');
      var box = api.el('div', 'pp-box');
      var en = false, want = (api.lang === 'en');
      Array.prototype.slice.call(main.children).forEach(function(n){
        if(n.classList.contains('lang-sep')){ en = true; return; }
        if(n.classList.contains('back') || en !== want) return;
        box.appendChild(document.importNode(n, true));
      });
      var h = box.querySelector('h1');
      if(!h) throw new Error('empty');
      h.setAttribute('tabindex', '-1');
      ppBusy = false;
      if(document.documentElement.classList.contains('qx-hide')) return;   // 読むあいだに すぐ閉じる が押された
      var ov = overlay(api, 'pp-ov');
      ov.insertBefore(box, ov.firstChild);
      try{ h.focus(); }catch(_){}
    }).catch(fail);
  }

  /* せっていの行（出典の一覧・プライバシーポリシー・記録をぜんぶ消す）。押したときに app.js の api を使う */
  var bs = document.getElementById && document.getElementById('btn-sources');
  if(bs && window.Tap) window.Tap.bind(bs, function(){ if(window.App) openSources(window.App.api()); });
  var lp = document.getElementById && document.getElementById('link-privacy');
  if(lp && window.Tap){
    lp.addEventListener('click', function(e){ if(window.App) e.preventDefault(); });   // ページは移らない(Tap も click を拾って開く)
    window.Tap.bind(lp, function(){ if(window.App) openPrivacy(window.App.api()); });
  }
  var bw = document.getElementById && document.getElementById('btn-wipe');
  if(bw && window.Tap) window.Tap.bind(bw, function(){
    if(!window.App) return;
    var api = window.App.api();
    api.ask(api.T('screen.set.wipeConfirm'), function(ok){
      if(!ok) return;
      ['props', 'joken', 'concerns', 'prefecture', 'done'].forEach(function(k){ api.remove(k); });
      safetyOn = false;
      api.toast(api.T('screen.set.wiped'));
    });
  });

  window.HEYA_UI = {
    D: D, CONCERNS: CONCERNS, nav: nav, tx: tx,
    cardIndex: cardIndex, cardByKey: cardByKey,
    getConcerns: getConcerns, setConcern: setConcern, fits: fits,
    isDone: isDone, setDone: setDone,
    strengthTag: strengthTag, link: link, orgName: orgName, notApp: notApp, overlay: overlay,
    openCard: openCard, openSources: openSources, openPrivacy: openPrivacy,
    clearSafety: function(){ safetyOn = false; }
  };
})();
