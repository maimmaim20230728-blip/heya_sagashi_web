/* わたしに合う部屋さがし・そよぎ ことばの表(日本語と英語だけ)
   ・window.HEYA_I18N = { ja, en }
   ・キー構造は ja と en で完全一致(_check.js が ja を正として構造・配列要素数を機械照合)
   ・文言は ja と en の両方に同じキーで足す。画面固有は screen.<画面id>.* に置く。
   ・{n} などのプレースホルダは app.js/screens が実値に差し替える(訳文でも記号のまま残す)
   ・set.lang は言語切替ラベルなので両方 'ことば / Language' 固定
   ・カードや窓口の中身は data.js(_build_data.js が data/*.json から作る)
   ・ひらがな: 本人が読む操作文言はひらがな主体。相手に見せる文(みせる画面等)は漢字で曖昧さを消す */
(function(){
'use strict';

/* ============ ja(正) ============ */
var ja = {
  app: { name:'わたしに合う部屋さがし・そよぎ', short:'わたしに合う部屋さがし', tagline:'自分に合う良い部屋を見つけるために。',
         nameWrap:'わたしに合う|部屋さがし・そよぎ', shortWrap:'わたしに合う|部屋さがし' },   // ヘッダーが2行のとき、折ってよい所が「|」(app.js fitTitle)
  nav: { home:'ホーム', cards:'カード', naiken:'内見', joken:'条件', soudan:'相談先', set:'せってい' },
  common: {
    ok:'OK', cancel:'やめる', save:'ほぞんする', del:'けす', back:'もどる', close:'とじる',
    yes:'はい', no:'いいえ', add:'ついか', edit:'なおす', next:'つぎ', prev:'まえ', done:'できた',
    saved:'ほぞんしました ✓', saveFail:'ほぞんできませんでした', storageFull:'いっぱいで ほぞんできません',
    deleted:'けしました', delConfirm:'ほんとうに けしますか?', empty:'まだ なにも ありません',
    optional:'ぜんぶ 書かなくても だいじょうぶです。', today:'きょう',
    quickExit:'すぐ閉じる', qxTitle:'天気予報',
    photo: {
      camera:'カメラで とる', roll:'しゃしんから えらぶ',
      cropTitle:'しゃしんを 切りとる', cropHint:'ゆびで うごかすか、やじるしで あわせて、スライダーで 大きさを かえます。',
      zoom:'大きさ', panUp:'うえへ', panDown:'したへ', panLeft:'ひだりへ', panRight:'みぎへ',
      make:'これで きめる', fail:'しゃしんを よみこめませんでした'
    }
  },
  set: {
    hNormal:'ふだんの せってい',
    hBackup:'きしゅへんこう(バックアップ)',
    fs:'もじの大きさ', fsSizes:['ふつう','大きい','とても大きい'],
    lang:'ことば / Language',
    theme:'いろ', themes:['みどり','みずいろ','しろ','くろ'],
    bgm:'BGM', bgms:['なし','みどりの音','あおの音'],
    sound:'タップ音', on:'ON', off:'OFF',
    bkHint:'あたらしい スマホに うつるときは、「かきだす」で ファイルを ほぞんして、あたらしい スマホで「よみこむ」を おしてください。',
    bkExport:'かきだす', bkImport:'よみこむ',
    exported:'かきだしました ✓', imported:'よみこみました ✓', importFail:'よみこめませんでした',
    note:'書いたことは すべて この端末の中だけに ほぞんされます。どこにも 送られません。',
    privacy:'プライバシーポリシー',
    credit:'アプリ開発：介護と支援の相談どころ そよぎ'
  },
  /* はじめての つかいかた(app.js openGuide・初回に必ず出す)。🔴 BUILDER: このアプリの使い方を1ページずつ丁寧に書く
     (何のアプリか・最初に何をするか・画面ごとにできること・書いたものはどこに残るか・隠れた入口があればその開き方)。heads と bodies は同じ数 */
  guide: {
    title:'つかいかた', step:'{n} / {m}', start:'はじめる', again:'もういちど 見る',
    heads:[
      'わたしに合う部屋さがし・そよぎ へ ようこそ',
      'ホーム：気になることを選ぶ',
      'カード：することを1枚ずつ',
      '内見：部屋を見に行く日に',
      'わたしの条件：先に書いておく',
      '相談先：都道府県を選ぶ',
      '右上の「すぐ閉じる」',
      '書いたことは、この端末の中だけに'
    ],
    bodies:[
      '賃貸の部屋を探す人が、自分に合う良い部屋を見つけるためのアプリです。探す前から、住んだあと、出ていくときまでに、することと確かめることを、やさしい言葉でまとめました。\n国や自治体のアプリではありません。法律の助言でもありません。中身は、国や自治体などの公式のページで確かめたものです。',
      'ホームで「気になること」を選ぶと、合うカードに印がつきます。段差や移動のこと、保証人がいないこと、年齢のこと、日本語のことなど、いくつでも選べます。選ばなくても、全部のカードを見られます。',
      '段階（探す前に、内見、申込み、契約、入居、退去など）ごとに、カードが並んでいます。1枚に、することが1つです。見るところ、どうして、気をつけて、確かめかたが書いてあります。下の「公式のページ」から、もとのページを開けます。',
      '部屋を見に行く日（内見）のチェックシートです。見に行く部屋の呼び名を足すと、部屋ごとに□に印をつけて、メモを書けます。全部できなくても大丈夫です。★は、とくに大事な行です。',
      'ゆずれないことと、あればうれしいことを、先に書いておけます。見た部屋ごとに、○△×を自分でつけて並べられます。点数にはしません。決めるのは自分です。',
      '都道府県を選ぶと、そこで相談できる窓口が出ます。全国どこでも使える窓口も出ます。電話番号を押すと電話をかけられます。',
      '画面の右上の「すぐ閉じる」を押すと、どの画面からでも、すぐに閉じます。ブラウザで開いているときは、気象庁の天気予報のページに切りかわります。\nほかの人に画面を見られたくないときに使えます。書いたことは消えません。消したいときは、せっていの「記録をぜんぶ消す」を使います。',
      '書いたこと、印をつけたことは、この端末の中だけに残ります。どこにも送りません。せっていの「記録をぜんぶ消す」で、一度に消せます。'
    ]
  },
  screen: {
    common: {
      notApp:'国や自治体のアプリではありません。法律の助言ではありません。中身は、国や自治体などの公式のページで確かめたものです。',
      sourcesBtn:'出典の一覧（公式のページ）',
      sourcesTitle:'出典の一覧',
      sourcesLead:'このアプリの中身は、次の国の機関、公的な法人、都道府県と市区町村、裁判所の公式のページで確かめました。各カードの下に、確かめたページのリンクがあります。',
      groups:{ gov:'国の機関', pub:'公的な法人', court:'裁判所', local:'都道府県と市区町村' },
      asOf:'確かめた日',
      fit:'合う',
      cardsCount:'カード {n}枚',
      fitCount:'合うもの {n}枚',
      openCard:'カードを見る',
      done:'たしかめた',
      notDone:'まだ',
      labels:{ look:'見るところ', why:'どうして', warn:'気をつけて', how:'確かめかた', note:'ただし' },
      sources:'公式のページ（出典）',
      sheetRows:'内見のときに確かめること',
      cardNote:'状況によって当てはまらないことがあります。迷ったら、相談先の窓口に聞いてください。',
      strengths:{ law:'法律のきまり', rule:'法律にもとづく決まり', guide:'国の目安（ガイドライン）', court:'裁判所の判断', warn:'公的機関のよびかけ', tip:'知っておくと安心' },
      legendTitle:'印の意味',
      concerns:{
        move:'段差や移動（車いす・杖など）', see:'見えにくさ', hear:'聞こえにくさ・話しにくさ', understand:'読み書きや説明の分かりにくさ',
        health:'体調や気持ちの波・通院', age:'年齢のこと', guarantor:'保証人や緊急連絡先がいない', money:'収入や家賃の心配',
        safety:'居場所を知られたくない（DVなど）', foreign:'日本語や国籍のこと', refused:'断られた・断られそう', support:'手伝ってくれる人がほしい',
        animal:'補助犬', all:'だれにでも'
      }
    },
    home: {
      lead:'自分に合う良い部屋を見つけるために、探す前から住んだあとまでに、することと確かめることをまとめました。',
      concernsH:'気になること',
      concernsHint:'選ぶと、合うカードに印がつきます。いくつでも選べます。選ばなくても使えます。「居場所を知られたくない」は、アプリを閉じると消えます（端末に残しません）。',
      stagesH:'すすめかた',
      stagesHint:'段階を押すと、その段階のカードが出ます。'
    },
    cards: {
      title:'カード',
      all:'すべて',
      onlyFit:'合うものだけ',
      showAll:'ぜんぶ見る',
      restShow:'ほかの事情に合わせたカード（{n}枚）を見る',
      restHide:'ほかの事情に合わせたカードをとじる',
      noFit:'この段階には、選んだ気になることに合うカードはありません。「ぜんぶ見る」で全部のカードを出せます。'
    },
    naiken: {
      title:'内見のチェックシート',
      propsH:'見に行く部屋',
      propsHint:'部屋の呼び名を足すと、部屋ごとに印とメモを残せます（例：A駅の2階の部屋）。',
      namePh:'部屋の呼び名',
      add:'足す',
      view:'シートを見る（記録しない）',
      bringH:'持っていく物',
      memo:'この部屋のメモ',
      rename:'呼び名をなおす',
      delProp:'この部屋の記録を消す',
      delConfirm:'この部屋の印とメモを消します。よいですか?',
      checked:'印 {n}',
      starHint:'★は、とくに大事な行です。',
      fitOnly:'当てはまるときだけ使う行です。',
      noName:'呼び名を入れてください'
    },
    joken: {
      title:'わたしの条件',
      lead:'ゆずれないことと、あればうれしいことを、先に書いておきます。部屋を見たら、条件ごとに○△×を自分でつけます。点数にはしません。',
      mustH:'ゆずれないこと',
      wantH:'あればうれしいこと',
      rentH:'家賃の上限（管理費などを入れて）',
      rentPh:'例：6万円まで',
      placesH:'通う場所（病院、仕事、学びの場、支援者の家など）',
      itemPh:'書いて「足す」',
      add:'足す',
      compareH:'見た部屋を並べる',
      compareHint:'ます目を押すたびに、○ → △ → × → 空白 と変わります。',
      noProps:'「内見」で見に行く部屋を足すと、ここで並べられます。',
      noItems:'条件を書くと、ここで並べられます。',
      delItem:'消す'
    },
    soudan: {
      title:'相談先',
      prefH:'都道府県',
      prefNone:'選ぶ',
      nationalH:'全国どこでも',
      prefListH:'{p}の窓口',
      prefPending:'この都道府県の窓口は、いま確かめているところです。下の、住む地域で探す窓口と、全国どこでも使える窓口を見てください。',
      localH:'住む地域で探す窓口',
      localLead:'都道府県や市区町村ごとにある窓口です。何を相談できるかと、探し方をのせています。',
      localShow:'住む地域で探す窓口を見る',
      localHide:'住む地域で探す窓口をとじる',
      find:'探し方',
      call:'電話する',
      open:'公式のページ',
      open2:'あわせて見るページ',
      lead:'困ったとき、迷ったときに相談できる窓口です。受付の時間は変わることがあるので、かける前に公式のページでも確かめてください。'
    },
    set: {
      sourcesRow:'出典の一覧',
      sourcesBtn:'見る',
      wipeRow:'記録をぜんぶ消す',
      wipeBtn:'消す',
      wipeConfirm:'内見の印とメモ、わたしの条件、選んだ気になることと都道府県、たしかめた印を、ぜんぶ消します。よいですか?',
      wiped:'消しました'
    }
  }
};

/* ============ en ============ */
var en = {
  app: { name:'A Home That Fits Me - SOYOGI', short:'A Home That Fits Me', tagline:'For finding a good home that fits you.',
         nameWrap:'A Home That Fits Me - SOYOGI', shortWrap:'A Home That Fits Me' },
  nav: { home:'Home', cards:'Cards', naiken:'Viewing', joken:'Conditions', soudan:'Help', set:'Settings' },
  common: {
    ok:'OK', cancel:'Cancel', save:'Save', del:'Delete', back:'Back', close:'Close',
    yes:'Yes', no:'No', add:'Add', edit:'Edit', next:'Next', prev:'Previous', done:'Done',
    saved:'Saved ✓', saveFail:'Could not save', storageFull:'Storage is full, could not save',
    deleted:'Deleted', delConfirm:'Really delete this?', empty:'Nothing here yet',
    optional:'You do not have to fill in everything.', today:'Today',
    quickExit:'Quick exit', qxTitle:'Weather forecast',
    photo: {
      camera:'Take a photo', roll:'Choose from photos',
      cropTitle:'Crop the photo', cropHint:'Drag with a finger or use the arrows, then change the size with the slider.',
      zoom:'Size', panUp:'Up', panDown:'Down', panLeft:'Left', panRight:'Right',
      make:'Use this', fail:'Could not load the photo'
    }
  },
  set: {
    hNormal:'Everyday settings',
    hBackup:'Changing phones (backup)',
    fs:'Text size', fsSizes:['Normal','Large','Very large'],
    lang:'ことば / Language',
    theme:'Color', themes:['Green','Light blue','White','Black'],
    bgm:'Music', bgms:['None','Green tone','Blue tone'],
    sound:'Tap sound', on:'ON', off:'OFF',
    bkHint:'When you move to a new phone, tap "Export" to save a file, then tap "Import" on the new phone.',
    bkExport:'Export', bkImport:'Import',
    exported:'Exported ✓', imported:'Imported ✓', importFail:'Could not import',
    note:'Everything you write is stored only on this device. Nothing is sent anywhere.',
    privacy:'Privacy policy',
    credit:'Developed by SOYOGI, a care and support consultation service'
  },
  guide: {
    title:'How to use', step:'{n} / {m}', start:'Start', again:'Show again',
    heads:[
      'Welcome to A Home That Fits Me - SOYOGI',
      'Home: choose what matters',
      'Cards: one step at a time',
      'Viewing: on the day you see a home',
      'My conditions: write them first',
      'Help desks: choose a prefecture',
      'Quick exit at the top right',
      'What you write stays on this device'
    ],
    bodies:[
      'This app helps people renting a home in Japan find a good home that fits them. It sums up, in plain words, what to do and what to check, from before the search to after moving in and moving out.\nThis is not an app of the national or local government. It is not legal advice. The content was checked on official pages of the national government, local governments and public bodies.',
      'On Home, choose what matters to you, and the cards that fit are marked. For example: steps and getting around, no guarantor, age, or the Japanese language. Choose as many as you like. You can see every card without choosing.',
      'Cards are grouped by stage: before the search, viewing, applying, the contract, moving in, moving out and more. Each card has one thing to do, with what to look at, why, what to watch for and how to check. Open the original official pages from the bottom of each card.',
      'This is the checklist for the day you go to see a home (a viewing). Add a name for each home you see, then tick the boxes and write notes for each one. You do not have to do everything. A star marks the most important rows.',
      'Write down first what you cannot give up and what would be nice to have. For each home you saw, you can mark each item yourself and see them side by side. There are no scores. You decide.',
      'Choose a prefecture to see the help desks there. Desks you can use anywhere in Japan are shown too. Tap a phone number to call.',
      'Press "Quick exit" at the top right to close the app at once, from any screen. When the app is open in a web browser, the page changes to the weather forecast of the Japan Meteorological Agency.\nUse it when others should not see the screen. What you wrote stays. To delete it, use "Delete all records" in Settings.',
      'Everything you write or tick stays only on this device. Nothing is sent anywhere. Use "Delete all records" in Settings to delete it all at once.'
    ]
  },
  screen: {
    common: {
      notApp:'This is not an app of the national or local government, and it is not legal advice. The content was checked on official pages of the national government, local governments and public bodies.',
      sourcesBtn:'List of sources (official pages)',
      sourcesTitle:'List of sources',
      sourcesLead:'The content of this app was checked on the official pages of the following national government bodies, public corporations, prefectures and municipalities, and courts. Each card links to the pages that were checked.',
      groups:{ gov:'National government', pub:'Public corporations', court:'Courts', local:'Prefectures and municipalities' },
      asOf:'Checked on',
      fit:'Fits',
      cardsCount:'{n} cards',
      fitCount:'{n} fit',
      openCard:'Open the card',
      done:'Checked',
      notDone:'Not yet',
      labels:{ look:'What to look at', why:'Why', warn:'Watch for', how:'How to check', note:'However' },
      sources:'Official pages (sources, in Japanese)',
      sheetRows:'What to check at the viewing',
      cardNote:'This may not apply to every situation. If unsure, ask one of the help desks.',
      strengths:{ law:'Law', rule:'Rules based on law', guide:'National guidelines', court:'Court decisions', warn:'Public notices', tip:'Good to know' },
      legendTitle:'What the labels mean',
      concerns:{
        move:'Steps and getting around (wheelchair, cane)', see:'Low vision', hear:'Hearing or speaking', understand:'Reading, writing or following explanations',
        health:'Health, mood changes, hospital visits', age:'Age', guarantor:'No guarantor or emergency contact', money:'Worries about income or rent',
        safety:'Keeping the new address private (DV etc.)', foreign:'Japanese language or nationality', refused:'Turned down, or worried about it', support:'Wanting someone to help',
        animal:'Assistance dog', all:'For everyone'
      }
    },
    home: {
      lead:'What to do and what to check, from before the search to after moving in, to find a good home that fits.',
      concernsH:'What matters to you',
      concernsHint:'Choose to mark the cards that fit. Choose as many as you like, or none. "Keeping the new address private" is cleared when the app closes (not kept on the device).',
      stagesH:'Steps',
      stagesHint:'Tap a stage to see its cards.'
    },
    cards: {
      title:'Cards',
      all:'All',
      onlyFit:'Only the ones that fit',
      showAll:'Show all',
      restShow:'Show cards for other situations ({n})',
      restHide:'Hide cards for other situations',
      noFit:'No card in this stage fits what you chose. Tap "Show all" to see every card.'
    },
    naiken: {
      title:'Viewing checklist',
      propsH:'Homes to see',
      propsHint:'Add a name for each home to keep ticks and notes for it (for example: 2nd floor near A Station).',
      namePh:'Name of the home',
      add:'Add',
      view:'See the checklist (no records)',
      bringH:'What to bring',
      memo:'Notes about this home',
      rename:'Rename',
      delProp:'Delete the records of this home',
      delConfirm:'This deletes the ticks and notes for this home. Continue?',
      checked:'Ticked {n}',
      starHint:'A star marks the most important rows.',
      fitOnly:'Use these rows only when they apply.',
      noName:'Please enter a name'
    },
    joken: {
      title:'My conditions',
      lead:'Write down first what you cannot give up and what would be nice to have. After seeing a home, mark each condition yourself. There are no scores.',
      mustH:'Cannot give up',
      wantH:'Nice to have',
      rentH:'Highest rent (including management fees)',
      rentPh:'Example: up to 60,000 yen',
      placesH:'Places to go (hospital, work, school, supporters)',
      itemPh:'Write and tap "Add"',
      add:'Add',
      compareH:'Homes side by side',
      compareHint:'Each tap on a box changes it: ○ → △ → × → blank.',
      noProps:'Add homes to see under "Viewing" to compare them here.',
      noItems:'Write some conditions to compare homes here.',
      delItem:'Delete'
    },
    soudan: {
      title:'Help desks',
      prefH:'Prefecture',
      prefNone:'Choose',
      nationalH:'Anywhere in Japan',
      prefListH:'Desks in {p}',
      prefPending:'The desks for this prefecture are still being checked. Please see the local desks and the desks for anywhere in Japan below.',
      localH:'Desks to look for where you live',
      localLead:'These desks exist in each prefecture or city. Here is what you can ask and how to find them.',
      localShow:'Show the desks to look for where you live',
      localHide:'Hide the desks to look for where you live',
      find:'How to find',
      call:'Call',
      open:'Official page',
      open2:'Related page',
      lead:'Places to ask when you are in trouble or unsure. Opening hours can change, so please also check the official page before calling.'
    },
    set: {
      sourcesRow:'List of sources',
      sourcesBtn:'Open',
      wipeRow:'Delete all records',
      wipeBtn:'Delete',
      wipeConfirm:'This deletes all viewing ticks and notes, your conditions, the things and prefecture you chose, and the checked marks. Continue?',
      wiped:'Deleted'
    }
  }
};

/* 日本語と英語だけ(2026-10-02 ヒロさん「日英で」) */
window.HEYA_I18N = { ja: ja, en: en };
})();
