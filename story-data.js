/* Existing story adaptations and vector illustrations retained from the original page. */
var CHARACTERS = {
  /* pitch/rate 为角色的"基准嗓"；每一句还会叠加 line.tone 的情绪修饰。
     基准音高的上限刻意留在 1.50 —— 这样"兴奋/惊讶"还能继续往上走，
     否则 highest 情绪会被 Web Speech 的 2.0 上限压成一条平线。
     语速整体降低 15%，适合 4-8 岁儿童听辨。 */
  piggie: { name:'Piggie', cn:'小猪',  em:'🐷', bg:'#FCE4EC', accent:'#E8709A', pitch:1.62, rate:0.94, voice:'高亢甜脆',
            pos:[[30,54],[66,50],[46,52],[70,54]] },
  gerald: { name:'Gerald', cn:'小象',  em:'🐘', bg:'#E3F2FD', accent:'#3E9AD4', pitch:0.26, rate:0.63, voice:'低沉慢吞吞',
            pos:[[34,56],[70,52],[50,54],[32,54]] },
  snake:  { name:'Snake',  cn:'小蛇',  em:'🐍', bg:'#E8F5E9', accent:'#4CAF7D', pitch:1.78, rate:0.95, voice:'尖细急促',
            pos:[[30,58],[62,72],[38,56],[68,50]] },
  puppy:  { name:'Puppy',  cn:'小狗',  em:'🐶', bg:'#FFF8E1', accent:'#D3A017', pitch:1.48, rate:0.92, voice:'明亮欢快',
            pos:[[30,58],[68,54],[48,56],[66,52]] },
  nah:    { name:'Narrator', cn:'旁白', em:'📖', bg:'#F1E9FF', accent:'#8B4AE8', pitch:0.94, rate:0.71, voice:'慢条斯理',
            pos:[[50,50],[50,50],[50,50],[50,50]] }
};

/* 情绪修饰：让同一角色在不同句子里有抑扬顿挫，而不是一个调子念到底 */
var TONES = {
  normal:    { pitch:1.00, rate:1.00, label:'' },
  happy:     { pitch:1.26, rate:1.09, label:'开心' },
  excited:   { pitch:1.44, rate:1.18, label:'兴奋' },
  question:  { pitch:1.24, rate:0.94, label:'疑问' },
  surprised: { pitch:1.55, rate:1.20, label:'惊讶' },
  sad:       { pitch:0.62, rate:0.74, label:'失落' },
  worried:   { pitch:0.86, rate:0.86, label:'担心' },
  angry:     { pitch:1.16, rate:1.22, label:'生气' },
  proud:     { pitch:0.92, rate:0.90, label:'得意' },
  whisper:   { pitch:0.78, rate:0.72, label:'轻声' },
  thinking:  { pitch:0.94, rate:0.76, label:'思考' },
  laugh:     { pitch:1.40, rate:1.16, label:'大笑' }
};

var ART = {
  piggieL: '<svg viewBox="0 0 100 100"><circle cx="50" cy="52" r="39" fill="#FF9DC4" stroke="#8C2E50" stroke-width="2.6"/><ellipse cx="20" cy="20" rx="13" ry="16" fill="#FF9DC4" stroke="#8C2E50" stroke-width="2.4" transform="rotate(-24 20 20)"/><ellipse cx="80" cy="20" rx="13" ry="16" fill="#FF9DC4" stroke="#8C2E50" stroke-width="2.4" transform="rotate(24 80 20)"/><ellipse cx="20" cy="20" rx="8" ry="10" fill="#FFD0E0" transform="rotate(-24 20 20)"/><ellipse cx="80" cy="20" rx="8" ry="10" fill="#FFD0E0" transform="rotate(24 80 20)"/><circle cx="34" cy="46" r="8" fill="#FFF" stroke="#3A2432" stroke-width="1.6"/><circle cx="66" cy="46" r="8" fill="#FFF" stroke="#3A2432" stroke-width="1.6"/><circle cx="36" cy="47" r="4.6" fill="#2A1822"/><circle cx="64" cy="47" r="4.6" fill="#2A1822"/><circle cx="37.8" cy="45.4" r="1.9" fill="#FFF"/><circle cx="65.8" cy="45.4" r="1.9" fill="#FFF"/><ellipse cx="50" cy="68" rx="18" ry="13" fill="#FF7FAC" stroke="#8C2E50" stroke-width="2"/><ellipse cx="42" cy="68" rx="4" ry="5.4" fill="#8E2E50"/><ellipse cx="58" cy="68" rx="4" ry="5.4" fill="#8E2E50"/><path d="M40 82 q10 10 20 0" stroke="#8C2E50" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="60" r="7" fill="#FFB3D0" opacity=".9"/><circle cx="84" cy="60" r="7" fill="#FFB3D0" opacity=".9"/><ellipse cx="24" cy="72" rx="4" ry="2.4" fill="#FFC9DD" opacity=".7"/><ellipse cx="76" cy="72" rx="4" ry="2.4" fill="#FFC9DD" opacity=".7"/></svg>',
  geraldL: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="56" rx="39" ry="34" fill="#9AD5F0" stroke="#1E5F88" stroke-width="2.6"/><ellipse cx="10" cy="48" rx="15" ry="20" fill="#9AD5F0" stroke="#1E5F88" stroke-width="2.4"/><ellipse cx="90" cy="48" rx="15" ry="20" fill="#9AD5F0" stroke="#1E5F88" stroke-width="2.4"/><ellipse cx="10" cy="48" rx="9" ry="13" fill="#C7E6F7"/><ellipse cx="90" cy="48" rx="9" ry="13" fill="#C7E6F7"/><circle cx="34" cy="42" r="8" fill="#FFF" stroke="#1B3D54" stroke-width="1.6"/><circle cx="66" cy="42" r="8" fill="#FFF" stroke="#1B3D54" stroke-width="1.6"/><circle cx="36" cy="43" r="4.6" fill="#1E3B52"/><circle cx="64" cy="43" r="4.6" fill="#1E3B52"/><circle cx="37.8" cy="41.4" r="1.9" fill="#FFF"/><circle cx="65.8" cy="41.4" r="1.9" fill="#FFF"/><path d="M50 60 q-12 8 -19 2 q-5 6 -2 13 q8 6 21 -3 q13 9 21 3 q3 -7 -2 -13 q-7 6 -19 -2 z" fill="#78BEE0" stroke="#1E5F88" stroke-width="2"/><path d="M50 64 q-7 5 -14 1" stroke="#1E5F88" stroke-width="1.6" fill="none"/><path d="M50 64 q7 5 14 1" stroke="#1E5F88" stroke-width="1.6" fill="none"/><ellipse cx="20" cy="60" rx="6" ry="3.4" fill="#6FB9DE" opacity=".7"/><ellipse cx="80" cy="60" rx="6" ry="3.4" fill="#6FB9DE" opacity=".7"/><path d="M26 18 q8 -13 16 -4 q7 -12 16 -1" stroke="#7ABDE0" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M74 18 q-8 -13 -16 -4 q-7 -12 -16 -1" stroke="#7ABDE0" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
  snakeL: '<svg viewBox="0 0 100 100"><path d="M16 90 q20 -6 18 -26 q-2 -22 22 -22 q26 0 24 -22 q-2 -12 -14 -12" stroke="#6FCF8A" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M16 90 q20 -6 18 -26 q-2 -22 22 -22 q26 0 24 -22 q-2 -12 -14 -12" stroke="#2E7C45" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="76" cy="18" r="16" fill="#6FCF8A" stroke="#2E7C45" stroke-width="2.4"/><circle cx="70" cy="15" r="4" fill="#FFF" stroke="#1E3B2A" stroke-width="1.3"/><circle cx="82" cy="15" r="4" fill="#FFF" stroke="#1E3B2A" stroke-width="1.3"/><circle cx="70.6" cy="15.6" r="2" fill="#1E3B2A"/><circle cx="82.6" cy="15.6" r="2" fill="#1E3B2A"/><circle cx="71.2" cy="14.6" r=".8" fill="#FFF"/><circle cx="83.2" cy="14.6" r=".8" fill="#FFF"/><path d="M68 24 q8 7 16 0" stroke="#2E7C45" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M84 28 l7 6 M85 26 l8 2" stroke="#E8506E" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="24" cy="76" rx="5" ry="3.4" fill="#A5E0B8" transform="rotate(-20 24 76)"/><ellipse cx="40" cy="54" rx="5" ry="3.4" fill="#A5E0B8" transform="rotate(20 40 54)"/><ellipse cx="58" cy="38" rx="5" ry="3.4" fill="#A5E0B8" transform="rotate(-20 58 38)"/></svg>',
  puppyL: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="58" rx="34" ry="31" fill="#E8C48A" stroke="#7A5A2A" stroke-width="2.6"/><ellipse cx="18" cy="36" rx="13" ry="22" fill="#C9A066" stroke="#7A5A2A" stroke-width="2.4" transform="rotate(-16 18 36)"/><ellipse cx="82" cy="36" rx="13" ry="22" fill="#C9A066" stroke="#7A5A2A" stroke-width="2.4" transform="rotate(16 82 36)"/><ellipse cx="18" cy="36" rx="7" ry="13" fill="#E8C48A" transform="rotate(-16 18 36)"/><ellipse cx="82" cy="36" rx="7" ry="13" fill="#E8C48A" transform="rotate(16 82 36)"/><circle cx="36" cy="50" r="8" fill="#FFF" stroke="#3A2A14" stroke-width="1.6"/><circle cx="64" cy="50" r="8" fill="#FFF" stroke="#3A2A14" stroke-width="1.6"/><circle cx="38" cy="51" r="4.6" fill="#2A1E10"/><circle cx="62" cy="51" r="4.6" fill="#2A1E10"/><circle cx="39.8" cy="49.4" r="1.9" fill="#FFF"/><circle cx="63.8" cy="49.4" r="1.9" fill="#FFF"/><ellipse cx="50" cy="70" rx="14" ry="11" fill="#F5E0B8" stroke="#7A5A2A" stroke-width="2"/><ellipse cx="50" cy="65" rx="5.4" ry="4" fill="#3A2A14"/><path d="M50 70 v6 M50 76 q-6 5 -11 0 M50 76 q6 5 11 0" stroke="#7A5A2A" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="62" rx="6" ry="3.6" fill="#FFC9A6" opacity=".8"/><ellipse cx="78" cy="62" rx="6" ry="3.6" fill="#FFC9A6" opacity=".8"/></svg>',
  busL: '<svg viewBox="0 0 100 100"><rect x="12" y="26" width="76" height="48" rx="10" fill="#FFD567"/><rect x="20" y="34" width="24" height="18" rx="4" fill="#BEE6FA"/><rect x="50" y="34" width="30" height="18" rx="4" fill="#BEE6FA"/><rect x="12" y="58" width="76" height="7" fill="#E0AE33"/><circle cx="28" cy="76" r="8" fill="#4A4258"/><circle cx="72" cy="76" r="8" fill="#4A4258"/><circle cx="28" cy="76" r="3" fill="#B9B2C7"/><circle cx="72" cy="76" r="3" fill="#B9B2C7"/><path d="M84 40 h6" stroke="#E8506E" stroke-width="4" stroke-linecap="round"/></svg>',
  ballL: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="32" fill="#F4707C"/><path d="M18 50 q32 -14 64 0" stroke="#FFF" stroke-width="5" fill="none"/><path d="M50 18 q-14 32 0 64" stroke="#FFF" stroke-width="5" fill="none"/><circle cx="50" cy="50" r="32" fill="none" stroke="#D3455A" stroke-width="3"/></svg>',
  iceL:  '<svg viewBox="0 0 100 100"><path d="M38 26 L62 26 L56 82 Q50 88 44 82 Z" fill="#FFE0B2"/><path d="M40 16 q-8 -12 -2 -16" stroke="#F0C08A" stroke-width="3" fill="none"/><circle cx="50" cy="20" r="15" fill="#F7A8C4"/><circle cx="50" cy="14" r="11" fill="#FBD3E2"/><circle cx="45" cy="19" r="2" fill="#D2597F"/><circle cx="55" cy="19" r="2" fill="#D2597F"/><path d="M46 26 q4 4 8 0" stroke="#D2597F" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="34" y="30" width="32" height="5" rx="2" fill="#E8B87E"/></svg>',
  cakeL: '<svg viewBox="0 0 100 100"><rect x="20" y="52" width="60" height="30" rx="6" fill="#FBD3E2"/><rect x="20" y="46" width="60" height="10" rx="5" fill="#F7A8C4"/><path d="M20 52 q10 8 20 0 q10 8 20 0 q10 8 20 0 v6 h-60z" fill="#FFF0F6"/><rect x="48" y="30" width="4" height="14" fill="#8FC9EC"/><ellipse cx="50" cy="27" rx="5" ry="7" fill="#FFD567"/><circle cx="34" cy="66" r="3" fill="#E8506E"/><circle cx="52" cy="70" r="3" fill="#4CAF7D"/><circle cx="66" cy="64" r="3" fill="#8B4AE8"/></svg>',
  giftL: '<svg viewBox="0 0 100 100"><rect x="20" y="42" width="60" height="40" rx="6" fill="#8FC9EC"/><rect x="14" y="32" width="72" height="14" rx="5" fill="#5BA8D6"/><rect x="44" y="32" width="12" height="50" fill="#FFD567"/><path d="M50 32 q-16 -6 -14 -16 q2 -8 10 -4 q6 4 4 20z" fill="#FFD567"/><path d="M50 32 q16 -6 14 -16 q-2 -8 -10 -4 q-6 4 -4 20z" fill="#FFD567"/></svg>',
  partyL: '<svg viewBox="0 0 100 100"><path d="M30 84 L50 30 L70 84 Z" fill="#F28AB2"/><path d="M36 66 h28 M42 48 h16" stroke="#FFF" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="24" r="6" fill="#FFD567"/><path d="M20 40 q6 -8 0 -16 M80 40 q-6 -8 0 -16" stroke="#7CCB93" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="24" cy="58" r="4" fill="#8FC9EC"/><circle cx="78" cy="62" r="4" fill="#FFD567"/></svg>'
};

var STORIES = [
  {
    id: 'can-i-play-too',
    title: 'Can I Play Too?',
    cn: '我也能玩吗？',
    cover: ['piggie', 'gerald'],
    blurb: '小猪小象在玩抛球，小蛇也想加入——可是蛇没有手呀！',
    cast: ['piggie', 'gerald', 'snake'],
    scenes: [
      { bg:['#D6ECFB', '#A9D4F2'], cap: '第 1 幕 · 一起玩抛球，玩得正开心' },
      { bg:['#FBE0EC', '#F2C0D8'], cap: '第 2 幕 · 小蛇来了，他也想玩' },
      { bg:['#FFF3DC', '#F2DFB4'], cap: '第 3 幕 · 球砸到了头！怎么办？' },
      { bg:['#E2F6E4', '#C0E5C4'], cap: '第 4 幕 · 想出一个新玩法，三个人一起玩' }
    ],
    script: [
      { who:'gerald', tone:'excited',   en:"Let us play catch!", cn:'我们来玩抛接球吧！' },
      { who:'piggie', tone:'happy',     en:"Yes! I love this game.", cn:'好呀！我最喜欢这个游戏了。' },
      { who:'gerald', tone:'proud',     en:"I am the best thrower!", cn:'我是最厉害的投手！' },
      { who:'piggie', tone:'laugh',     en:"Hee hee! I caught it!", cn:'嘿嘿！我接住啦！' },
      { who:'snake',  tone:'question',  en:"Hello! Can I play too?", cn:'你们好！我也能玩吗？' },
      { who:'piggie', tone:'surprised', en:"Oh! But you have no arms.", cn:'哦……可是你没有手臂呀。' },
      { who:'gerald', tone:'worried',   en:"I am sorry. This game needs arms.", cn:'对不起，这个游戏要有手臂才能玩。' },
      { who:'snake',  tone:'sad',       en:"Oh. I see.", cn:'哦……我明白了。' },
      { who:'snake',  tone:'normal',    en:"But I still want to try!", cn:'可我还是想试一试！' },
      { who:'piggie', tone:'excited',   en:"Let us throw the ball to Snake!", cn:'我们把球抛给小蛇试试吧！' },
      { who:'snake',  tone:'excited',   en:"I am ready! Throw it here!", cn:'我准备好了！抛过来吧！' },
      { who:'gerald', tone:'surprised', en:"Hey! That hit my head!", cn:'嘿！球打到我的头了！' },
      { who:'snake',  tone:'worried',   en:"Oops! Sorry, Gerald.", cn:'哎呀！对不起，Gerald。' },
      { who:'gerald', tone:'sad',       en:"I do not think this works.", cn:'我觉得这样好像不行。' },
      { who:'piggie', tone:'excited',   en:"Wait! I have an idea!", cn:'等等！我有个好主意！' },
      { who:'gerald', tone:'question',  en:"What is your idea?", cn:'什么好主意？' },
      { who:'piggie', tone:'proud',     en:"We can make a brand new game!", cn:'我们可以发明一个全新的游戏！' },
      { who:'snake',  tone:'question',  en:"A new game for all of us?", cn:'一个我们三个都能玩的游戏？' },
      { who:'gerald', tone:'happy',     en:"Yes! Let us play together.", cn:'对！我们一起玩。' },
      { who:'snake',  tone:'happy',     en:"This is the best game ever!", cn:'这是最好玩的游戏了！' },
      { who:'gerald', tone:'proud',     en:"Friends always find a way.", cn:'好朋友总能想到办法。' }
    ],
    keywords: ['play', 'too', 'arms', 'throw', 'catch', 'ball', 'new game', 'together', 'friend']
  },
  {
    id: 'my-new-toy',
    title: 'My New Toy!',
    cn: '我的新玩具！',
    cover: ['piggie', 'gift'],
    blurb: '小猪得到一个新玩具，小象不小心弄坏了，两个人又气又难过……',
    cast: ['piggie', 'gerald'],
    scenes: [
      { bg:['#FBE0EC', '#F2C0D8'], cap: '第 1 幕 · Piggie 拿到了一个闪闪发光的新玩具' },
      { bg:['#E7E2F7', '#C9BEE8'], cap: '第 2 幕 · 咔嚓——玩具坏了' },
      { bg:['#FBE3E6', '#F5BFC6'], cap: '第 3 幕 · 两个人都很生气、很难过' },
      { bg:['#E2F6E4', '#C0E5C4'], cap: '第 4 幕 · 一起修好它，比一个人玩更开心' }
    ],
    script: [
      { who:'piggie', tone:'excited',   en:"Look! This is my new toy!", cn:'你看！这是我的新玩具！' },
      { who:'gerald', tone:'surprised', en:"Wow! It is so shiny.", cn:'哇！它好亮呀。' },
      { who:'piggie', tone:'proud',     en:"You can hold it. But be careful!", cn:'你可以拿一下。但要小心哦！' },
      { who:'gerald', tone:'whisper',   en:"I will be very, very careful.", cn:'我会非常、非常小心的。' },
      { who:'gerald', tone:'surprised', en:"Oh no!", cn:'哦不！' },
      { who:'piggie', tone:'surprised', en:"What happened?", cn:'怎么了？' },
      { who:'gerald', tone:'sad',       en:"I broke it. I am so sorry.", cn:'我把它弄坏了……真的很对不起。' },
      { who:'piggie', tone:'angry',     en:"You broke it! I am so mad!", cn:'你把它弄坏了！我太生气了！' },
      { who:'gerald', tone:'sad',       en:"It was an accident. I did not mean to.", cn:'我不是故意的，真的不是。' },
      { who:'piggie', tone:'angry',     en:"I do not want to play now.", cn:'我现在不想玩了。' },
      { who:'gerald', tone:'worried',   en:"Let us fix it together. Please?", cn:'我们一起把它修好吧，好吗？' },
      { who:'piggie', tone:'thinking',  en:"Hmm ... Okay. Let us try.", cn:'嗯……好吧，我们试试。' },
      { who:'gerald', tone:'excited',   en:"Look! It works again!", cn:'你看！它又能用了！' },
      { who:'piggie', tone:'happy',     en:"You did it! I forgive you, Gerald.", cn:'你做到了！我原谅你了，Gerald。' },
      { who:'gerald', tone:'question',  en:"Can we share it now?", cn:'我们现在可以一起玩吗？' },
      { who:'piggie', tone:'happy',     en:"Yes. Sharing is more fun.", cn:'可以。分享更好玩。' }
    ],
    keywords: ['new toy', 'broke', 'accident', 'sorry', 'fix', 'forgive', 'share', 'careful']
  },
  {
    id: 'i-broke-my-trunk',
    title: 'I Broke My Trunk!',
    cn: '我的鼻子折了！',
    cover: ['gerald'],
    blurb: '小象的鼻子折了！原因是……一个越讲越长、越讲越好笑的故事。',
    cast: ['gerald', 'piggie'],
    scenes: [
      { bg:['#D6ECFB', '#A9D4F2'], cap: '第 1 幕 · Gerald 的鼻子怎么了？' },
      { bg:['#FFF3DC', '#F2DFB4'], cap: '第 2 幕 · 「一开始，我举起了一头河马……」' },
      { bg:['#FBE0EC', '#F2C0D8'], cap: '第 3 幕 · 「然后，一头犀牛坐到了河马身上！」' },
      { bg:['#E2F6E4', '#C0E5C4'], cap: '第 4 幕 · 讲到最后，两个人一起哈哈大笑' }
    ],
    script: [
      { who:'piggie', tone:'surprised', en:"Gerald! What happened to your trunk?", cn:'Gerald！你的鼻子怎么了？' },
      { who:'gerald', tone:'sad',       en:"I broke my trunk.", cn:'我的鼻子折了。' },
      { who:'piggie', tone:'question',  en:"How did you break it?", cn:'你是怎么弄折的？' },
      { who:'gerald', tone:'normal',    en:"It was a very crazy day.", cn:'那是非常疯狂的一天。' },
      { who:'gerald', tone:'proud',     en:"First, I lifted a hippo with my trunk!", cn:'一开始，我用鼻子举起了一头河马！' },
      { who:'piggie', tone:'surprised', en:"A hippo? With your trunk?", cn:'一头河马？用你的鼻子？' },
      { who:'gerald', tone:'excited',   en:"Then, a rhino sat on the hippo!", cn:'然后，一头犀牛坐到了河马身上！' },
      { who:'piggie', tone:'surprised', en:"Oh my! Then what happened?", cn:'天哪！然后呢？' },
      { who:'gerald', tone:'excited',   en:"And then, my friend came too!", cn:'再然后，我的朋友也来了！' },
      { who:'gerald', tone:'excited',   en:"Finally, I lifted them all up!", cn:'最后，我把它们全都举了起来！' },
      { who:'gerald', tone:'normal',    en:"Then I tripped. That is how I broke it.", cn:'然后我绊了一跤。就是这么弄折的。' },
      { who:'piggie', tone:'laugh',     en:"That is the funniest story ever!", cn:'这是最好笑的故事了！' },
      { who:'gerald', tone:'question',  en:"Can you believe it?", cn:'你信吗？' },
      { who:'piggie', tone:'laugh',     en:"No! Tell me again!", cn:'不信！再讲一遍！' }
    ],
    keywords: ['broke', 'trunk', 'hippo', 'rhino', 'first', 'then', 'finally', 'story']
  },
  {
    id: 'happy-pig-day',
    title: 'Happy Pig Day!',
    cn: '快乐小猪节！',
    cover: ['piggie'],
    blurb: '今天是快乐小猪节，小猪们好开心——可是 Gerald 不是猪，他有点难过。',
    cast: ['piggie', 'gerald'],
    scenes: [
      { bg:['#FBE0EC', '#F2C0D8'], cap: '第 1 幕 · 小猪节到了！到处都是猪猪在跳舞' },
      { bg:['#D6ECFB', '#A9D4F2'], cap: '第 2 幕 · Gerald 有点难过：我不是猪呀' },
      { bg:['#FFF3DC', '#F2DFB4'], cap: '第 3 幕 · 「你是我最好的朋友，这就够了」' },
      { bg:['#E2F6E4', '#C0E5C4'], cap: '第 4 幕 · 不一样也没关系，一起庆祝吧' }
    ],
    script: [
      { who:'piggie', tone:'excited',   en:"Happy Pig Day! It is the best day!", cn:'快乐小猪节！这是最棒的日子！' },
      { who:'gerald', tone:'question',  en:"Happy ... Pig Day?", cn:'快乐……小猪节？' },
      { who:'piggie', tone:'excited',   en:"We dance, we sing, we eat!", cn:'我们跳舞、唱歌、还有好多吃的！' },
      { who:'gerald', tone:'sad',       en:"But I am not a pig.", cn:'可是我不是猪呀。' },
      { who:'piggie', tone:'surprised', en:"Oh. That is true.", cn:'哦……确实是这样。' },
      { who:'gerald', tone:'sad',       en:"I feel a little sad today.", cn:'我今天有点难过。' },
      { who:'piggie', tone:'worried',   en:"Oh no. Do not be sad.", cn:'哦不，别难过。' },
      { who:'piggie', tone:'happy',     en:"You do not need to be a pig!", cn:'你不需要是猪才可以！' },
      { who:'gerald', tone:'question',  en:"I do not?", cn:'真的吗？' },
      { who:'piggie', tone:'happy',     en:"You are my best friend. That is enough.", cn:'你是我最好的朋友，这就够了。' },
      { who:'gerald', tone:'happy',     en:"Then let us celebrate together!", cn:'那我们一起庆祝吧！' },
      { who:'piggie', tone:'proud',     en:"Yes! Being different is fine.", cn:'好！不一样也没关系。' },
      { who:'gerald', tone:'happy',     en:"I love you, my friend.", cn:'我爱你，我的朋友。' }
    ],
    keywords: ['Happy Pig Day', 'pig', 'different', 'sad', 'best friend', 'celebrate', 'together']
  },
  {
    id: 'i-am-invited-to-a-party',
    title: 'I Am Invited to a Party!',
    cn: '我被邀请去派对！',
    cover: ['piggie', 'party'],
    blurb: '小猪第一次收到派对邀请，拉着小象一起准备，可是穿什么才对呢？',
    cast: ['piggie', 'gerald'],
    scenes: [
      { bg:['#FBE0EC', '#F2C0D8'], cap: '第 1 幕 · 邀请函！Piggie 第一次要去派对' },
      { bg:['#E7E2F7', '#C9BEE8'], cap: '第 2 幕 · 穿得太正式？太傻气？试了一次又一次' },
      { bg:['#FFF3DC', '#F2DFB4'], cap: '第 3 幕 · 到底穿什么才好呢？' },
      { bg:['#E2F6E4', '#C0E5C4'], cap: '第 4 幕 · 带着微笑一起去，怎样都开心' }
    ],
    script: [
      { who:'piggie', tone:'excited',   en:"I am invited to a party!", cn:'我被邀请去派对啦！' },
      { who:'gerald', tone:'excited',   en:"A party! That is exciting!", cn:'派对！太让人兴奋了！' },
      { who:'piggie', tone:'worried',   en:"But what should I wear?", cn:'可是我该穿什么呢？' },
      { who:'gerald', tone:'thinking',  en:"Maybe something fancy.", cn:'也许穿得正式一点。' },
      { who:'piggie', tone:'sad',       en:"This is too fancy! I cannot walk.", cn:'这太正式了！我都走不动了。' },
      { who:'gerald', tone:'thinking',  en:"Then try something silly.", cn:'那试试傻气一点的。' },
      { who:'piggie', tone:'worried',   en:"This is too silly! Everyone will laugh.", cn:'这太傻了！大家会笑我的。' },
      { who:'gerald', tone:'thinking',  en:"Hmm. Let us think again.", cn:'嗯……我们再想想。' },
      { who:'piggie', tone:'question',  en:"What will you wear, Gerald?", cn:'那你穿什么呢，Gerald？' },
      { who:'gerald', tone:'happy',     en:"I will wear a smile.", cn:'我会带着微笑去。' },
      { who:'piggie', tone:'excited',   en:"Then I will wear one too!", cn:'那我也带着微笑！' },
      { who:'gerald', tone:'happy',     en:"Let us go to the party together.", cn:'我们一起去派对。' },
      { who:'piggie', tone:'laugh',     en:"This will be the best party ever!", cn:'这一定是最棒的派对！' }
    ],
    keywords: ['invited', 'party', 'wear', 'fancy', 'silly', 'smile', 'together', 'go']
  },
  {
    id: 'should-i-share-my-ice-cream',
    title: 'Should I Share My Ice Cream?',
    cn: '我要不要分享我的冰淇淋？',
    cover: ['gerald', 'ice'],
    blurb: 'Gerald 拿到一个冰淇淋，好好吃……可是好朋友 Piggie 还没吃到呢。',
    cast: ['gerald', 'piggie'],
    scenes: [
      { bg:['#D6ECFB', '#A9D4F2'], cap: '第 1 幕 · Gerald 拿着一个冰淇淋，看起来好好吃' },
      { bg:['#FBE0EC', '#F2C0D8'], cap: '第 2 幕 · 要不要分享呢？他想了很久很久' },
      { bg:['#E7E2F7', '#C9BEE8'], cap: '第 3 幕 · 等啊等，冰淇淋都快要化掉了……' },
      { bg:['#FFF3DC', '#F2DFB4'], cap: '第 4 幕 · 分享出去的那一刻，比吃到更甜' }
    ],
    script: [
      { who:'gerald', tone:'excited',   en:"I have a big ice cream!", cn:'我有一个大大的冰淇淋！' },
      { who:'gerald', tone:'happy',     en:"It is so delicious.", cn:'它太好吃了。' },
      { who:'gerald', tone:'normal',    en:"But Piggie is not here.", cn:'可是 Piggie 不在这里。' },
      { who:'gerald', tone:'thinking',  en:"Should I share my ice cream?", cn:'我要不要分享我的冰淇淋？' },
      { who:'gerald', tone:'thinking',  en:"What if I eat it all?", cn:'要是我全吃掉了呢？' },
      { who:'gerald', tone:'thinking',  en:"What if I wait for her?", cn:'要是我等她呢？' },
      { who:'gerald', tone:'sad',       en:"Waiting is so hard!", cn:'等待好难熬啊！' },
      { who:'gerald', tone:'surprised', en:"Oh no! It is melting!", cn:'哦不！它要化了！' },
      { who:'piggie', tone:'happy',     en:"Hi, Gerald! What are you doing?", cn:'嗨，Gerald！你在做什么？' },
      { who:'gerald', tone:'happy',     en:"Oh! I was waiting for you.", cn:'哦！我在等你呀。' },
      { who:'gerald', tone:'question',  en:"Would you like some ice cream?", cn:'你要来一点冰淇淋吗？' },
      { who:'piggie', tone:'surprised', en:"You saved it for me? Thank you!", cn:'你特意留给我的？谢谢你！' },
      { who:'gerald', tone:'happy',     en:"I am glad I shared.", cn:'我很高兴我分享了。' },
      { who:'piggie', tone:'happy',     en:"Friends share and care.", cn:'朋友就是要分享和互相关心。' }
    ],
    keywords: ['ice cream', 'share', 'delicious', 'wait', 'melt', 'glad', 'friend', 'care']
  }
];

var state={story:null,lineIndex:0,showCn:false};
var synth=window.speechSynthesis||null;
var $=id=>document.getElementById(id);
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0')}
function coverArt(story) {
  // 封面：把封面角色/道具摆成一行
  var keys = story.cover || [];
  var svg = '<svg viewBox="0 0 120 60">';
  var parts = keys.map(function (k) {
    return (k === 'gift' ? ART.giftL : k === 'party' ? ART.partyL : k === 'ice' ? ART.iceL : k === 'ball' ? ART.ballL :
      k === 'gerald' ? ART.geraldL : k === 'snake' ? ART.snakeL : k === 'puppy' ? ART.puppyL : ART.piggieL);
  });
  var n = parts.length || 1;
  parts.forEach(function (p, i) {
    var w = n===1?54:46; var gap = 120 / (n + 1); var x = gap * (i + 1) - w / 2;
    var art=p.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
    svg += '<g transform="translate(' + x + ',7) scale(' + (w / 100) + ')">' + art + '</g>';
  });
  svg += '</svg>';
  return svg;
}

function speakerSlot(whoKey) {
  var order = (state.story.cast || []).indexOf(whoKey);
  if (order < 0) order = whoKey === 'gerald' ? 0 : 1;
  return order % 2 === 0 ? 'l' : 'r';
}

/* 上镜的两个人必须分居左右两个卡位，否则会重叠。
   3 人同幕的绘本（如 Can I Play Too?）里主角都是 左/左 或 右/右，
   所以这里强制"说话人站自己惯用位，另一个人站对面"。 */
function stagePair(talking) {
  var s = state.story;
  var scIdx = sceneIndexOfLine(state.lineIndex);
  var cnt = {};
  s.script.forEach(function (ln, j) {
    if (sceneIndexOfLine(j) !== scIdx) return;
    cnt[ln.who] = (cnt[ln.who] || 0) + 1;
  });
  var others = Object.keys(cnt).filter(function (w) { return w !== talking; })
    .sort(function (a, b) { return (cnt[b] || 0) - (cnt[a] || 0); });
  var pair = {};
  pair[talking] = speakerSlot(talking);
  if (others.length) pair[others[0]] = pair[talking] === 'l' ? 'r' : 'l';
  return pair;
}

/* 角色专属立绘（去掉外层 svg 包装，供场景内复用） */
var FIG = {
  piggie: '<circle cx="50" cy="52" r="39" fill="#FF9DC4" stroke="#8C2E50" stroke-width="2.6"/><ellipse cx="20" cy="20" rx="13" ry="16" fill="#FF9DC4" stroke="#8C2E50" stroke-width="2.4" transform="rotate(-24 20 20)"/><ellipse cx="80" cy="20" rx="13" ry="16" fill="#FF9DC4" stroke="#8C2E50" stroke-width="2.4" transform="rotate(24 80 20)"/><ellipse cx="20" cy="20" rx="8" ry="10" fill="#FFD0E0" transform="rotate(-24 20 20)"/><ellipse cx="80" cy="20" rx="8" ry="10" fill="#FFD0E0" transform="rotate(24 80 20)"/><circle cx="34" cy="46" r="8" fill="#FFF" stroke="#3A2432" stroke-width="1.6"/><circle cx="66" cy="46" r="8" fill="#FFF" stroke="#3A2432" stroke-width="1.6"/><circle cx="36" cy="47" r="4.6" fill="#2A1822"/><circle cx="64" cy="47" r="4.6" fill="#2A1822"/><circle cx="37.8" cy="45.4" r="1.9" fill="#FFF"/><circle cx="65.8" cy="45.4" r="1.9" fill="#FFF"/><ellipse cx="50" cy="68" rx="18" ry="13" fill="#FF7FAC" stroke="#8C2E50" stroke-width="2"/><ellipse cx="42" cy="68" rx="4" ry="5.4" fill="#8E2E50"/><ellipse cx="58" cy="68" rx="4" ry="5.4" fill="#8E2E50"/><path d="M40 82 q10 10 20 0" stroke="#8C2E50" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="60" r="7" fill="#FFB3D0" opacity=".9"/><circle cx="84" cy="60" r="7" fill="#FFB3D0" opacity=".9"/><ellipse cx="24" cy="72" rx="4" ry="2.4" fill="#FFC9DD" opacity=".7"/><ellipse cx="76" cy="72" rx="4" ry="2.4" fill="#FFC9DD" opacity=".7"/>',
  gerald: '<ellipse cx="50" cy="56" rx="39" ry="34" fill="#9AD5F0" stroke="#1E5F88" stroke-width="2.6"/><ellipse cx="10" cy="48" rx="15" ry="20" fill="#9AD5F0" stroke="#1E5F88" stroke-width="2.4"/><ellipse cx="90" cy="48" rx="15" ry="20" fill="#9AD5F0" stroke="#1E5F88" stroke-width="2.4"/><ellipse cx="10" cy="48" rx="9" ry="13" fill="#C7E6F7"/><ellipse cx="90" cy="48" rx="9" ry="13" fill="#C7E6F7"/><circle cx="34" cy="42" r="8" fill="#FFF" stroke="#1B3D54" stroke-width="1.6"/><circle cx="66" cy="42" r="8" fill="#FFF" stroke="#1B3D54" stroke-width="1.6"/><circle cx="36" cy="43" r="4.6" fill="#1E3B52"/><circle cx="64" cy="43" r="4.6" fill="#1E3B52"/><circle cx="37.8" cy="41.4" r="1.9" fill="#FFF"/><circle cx="65.8" cy="41.4" r="1.9" fill="#FFF"/><path d="M50 60 q-12 8 -19 2 q-5 6 -2 13 q8 6 21 -3 q13 9 21 3 q3 -7 -2 -13 q-7 6 -19 -2 z" fill="#78BEE0" stroke="#1E5F88" stroke-width="2"/><path d="M50 64 q-7 5 -14 1" stroke="#1E5F88" stroke-width="1.6" fill="none"/><path d="M50 64 q7 5 14 1" stroke="#1E5F88" stroke-width="1.6" fill="none"/><ellipse cx="20" cy="60" rx="6" ry="3.4" fill="#6FB9DE" opacity=".7"/><ellipse cx="80" cy="60" rx="6" ry="3.4" fill="#6FB9DE" opacity=".7"/><path d="M26 18 q8 -13 16 -4 q7 -12 16 -1" stroke="#7ABDE0" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M74 18 q-8 -13 -16 -4 q-7 -12 -16 -1" stroke="#7ABDE0" stroke-width="4" fill="none" stroke-linecap="round"/>',
  snake: '<path d="M16 90 q20 -6 18 -26 q-2 -22 22 -22 q26 0 24 -22 q-2 -12 -14 -12" stroke="#6FCF8A" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M16 90 q20 -6 18 -26 q-2 -22 22 -22 q26 0 24 -22 q-2 -12 -14 -12" stroke="#2E7C45" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="76" cy="18" r="16" fill="#6FCF8A" stroke="#2E7C45" stroke-width="2.4"/><circle cx="70" cy="15" r="4" fill="#FFF" stroke="#1E3B2A" stroke-width="1.3"/><circle cx="82" cy="15" r="4" fill="#FFF" stroke="#1E3B2A" stroke-width="1.3"/><circle cx="70.6" cy="15.6" r="2" fill="#1E3B2A"/><circle cx="82.6" cy="15.6" r="2" fill="#1E3B2A"/><circle cx="71.2" cy="14.6" r=".8" fill="#FFF"/><circle cx="83.2" cy="14.6" r=".8" fill="#FFF"/><path d="M68 24 q8 7 16 0" stroke="#2E7C45" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M84 28 l7 6 M85 26 l8 2" stroke="#E8506E" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="24" cy="76" rx="5" ry="3.4" fill="#A5E0B8" transform="rotate(-20 24 76)"/><ellipse cx="40" cy="54" rx="5" ry="3.4" fill="#A5E0B8" transform="rotate(20 40 54)"/><ellipse cx="58" cy="38" rx="5" ry="3.4" fill="#A5E0B8" transform="rotate(-20 58 38)"/>',
  puppy: '<ellipse cx="50" cy="58" rx="34" ry="31" fill="#E8C48A" stroke="#7A5A2A" stroke-width="2.6"/><ellipse cx="18" cy="36" rx="13" ry="22" fill="#C9A066" stroke="#7A5A2A" stroke-width="2.4" transform="rotate(-16 18 36)"/><ellipse cx="82" cy="36" rx="13" ry="22" fill="#C9A066" stroke="#7A5A2A" stroke-width="2.4" transform="rotate(16 82 36)"/><ellipse cx="18" cy="36" rx="7" ry="13" fill="#E8C48A" transform="rotate(-16 18 36)"/><ellipse cx="82" cy="36" rx="7" ry="13" fill="#E8C48A" transform="rotate(16 82 36)"/><circle cx="36" cy="50" r="8" fill="#FFF" stroke="#3A2A14" stroke-width="1.6"/><circle cx="64" cy="50" r="8" fill="#FFF" stroke="#3A2A14" stroke-width="1.6"/><circle cx="38" cy="51" r="4.6" fill="#2A1E10"/><circle cx="62" cy="51" r="4.6" fill="#2A1E10"/><circle cx="39.8" cy="49.4" r="1.9" fill="#FFF"/><circle cx="63.8" cy="49.4" r="1.9" fill="#FFF"/><ellipse cx="50" cy="70" rx="14" ry="11" fill="#F5E0B8" stroke="#7A5A2A" stroke-width="2"/><ellipse cx="50" cy="65" rx="5.4" ry="4" fill="#3A2A14"/><path d="M50 70 v6 M50 76 q-6 5 -11 0 M50 76 q6 5 11 0" stroke="#7A5A2A" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="62" rx="6" ry="3.6" fill="#FFC9A6" opacity=".8"/><ellipse cx="78" cy="62" rx="6" ry="3.6" fill="#FFC9A6" opacity=".8"/>'
};
/* #RGB/#RRGGBB → rgba()，用于气泡描边与光晕 */
function hexA(hex, a) {
  var h = String(hex).replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16);
  if (isNaN(n)) return 'rgba(166,108,255,' + a + ')';
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

/* 台词 → 所属分幕 */
function sceneIndexOfLine(lineIdx) {
  var starts={
    'can-i-play-too':[0,4,9,14], 'my-new-toy':[0,4,7,10],
    'i-broke-my-trunk':[0,4,6,10], 'happy-pig-day':[0,3,7,10],
    'i-am-invited-to-a-party':[0,3,7,9], 'should-i-share-my-ice-cream':[0,3,6,10]
  }[state.story.id];
  var scene=0;starts.forEach(function(start,i){if(lineIdx>=start)scene=i});return scene;
}

/* 当前台词大卡：不管屏幕多小，永远清楚显示"谁 + 说了什么 + 什么语气" */
var _stageCache={scene:-1,pairKey:'',bubbleHtml:''};
var renderNowCard=function(){};
function renderStage() {
  var s = state.story;
  if (!s) return;
  var i = state.lineIndex;
  var scIdx = sceneIndexOfLine(i);
  var sc = s.scenes[scIdx] || s.scenes[0];
  var cur = s.script[i];
  var talking = cur.who;
  var stageEl = $('stage');

  /* 上镜名单：说话人 + 一个在场配角，两人强制分居左右卡位，绝不重叠 */
  var pair = stagePair(talking);
  var pairKey = talking + '|' + Object.keys(pair).sort().join(',');

  /* ① 幕布变了？重建背景层（渐变 + 字幕条） */
  if (_stageCache.scene !== scIdx || !stageEl.querySelector('.scene-bg')) {
    stageEl.innerHTML =
      '<svg class="scene-bg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
      '<rect width="100" height="100" fill="' + sc.bg[0] + '"/>' +
      '<rect y="34" width="100" height="66" fill="' + sc.bg[1] + '" opacity=".55"/>' +
      '<ellipse cx="50" cy="101" rx="74" ry="12" fill="#FFFFFF" opacity=".4"/>' +
      '</svg>' +
      '<div class="caption">' + sc.cap + '</div>';
    _stageCache.scene = scIdx;
    _stageCache.pairKey = '';
  }

  /* ② 上镜名单变了？重建角色层 */
  if (_stageCache.pairKey !== pairKey) {
    var who = Object.keys(pair);
    who.sort(function (a, b) { return (a === talking ? -1 : 0) - (b === talking ? -1 : 0); });
    var actorsHtml = '';
    who.forEach(function (w) {
      var ch = CHARACTERS[w];
      var slot = pair[w] || 'l';
      var isTalking = w === talking;
      actorsHtml += '<div class="actor slot-' + slot + (slot === 'r' ? ' mirror' : '') + (isTalking ? ' talking' : '') + '" data-role="' + w + '">' +
        '<div class="art"><svg viewBox="0 0 100 100">' + (FIG[w] || FIG.piggie) + '</svg></div>' +
        '<div class="tag" style="background:' + ch.accent + '">' + ch.name + ' ' + ch.em + '</div>' +
        '</div>';
    });
    /* 清掉旧角色层，插入新角色 */
    stageEl.querySelectorAll('.actor').forEach(function (n) { n.remove(); });
    stageEl.insertAdjacentHTML('beforeend', actorsHtml);
    _stageCache.pairKey = pairKey;
  } else {
    /* 名单没变：切换"谁在说话"高亮 */
    stageEl.querySelectorAll('.actor').forEach(function (n) {
      n.classList.toggle('talking', n.dataset.role === talking);
    });
  }

  /* ③ 气泡：始终只有一个，动态更新内容（不重建 DOM） */
  var ch2 = CHARACTERS[talking] || CHARACTERS.nah;
  var t = TONES[cur.tone] || TONES.normal;
  var slot = pair[talking] || 'l';
  var bub = stageEl.querySelector('.say');
  if (!bub) {
    stageEl.insertAdjacentHTML('beforeend',
      '<div class="say bub-' + slot + '" style="--c-accent:' + ch2.accent + '">' +
      '<div class="hdr">' +
      '<span class="nm" style="color:' + ch2.accent + '"></span>' +
      '<span class="tn" style="background:' + hexA(ch2.accent, .17) + ';color:' + ch2.accent + '"></span>' +
      '</div>' +
      '<div class="en"></div>' +
      '<div class="cn"></div>' +
      '</div>');
    bub = stageEl.querySelector('.say');
    bub.addEventListener('click', function (e) { e.stopPropagation(); playLine(state.lineIndex, true); });
  }
  bub.className = 'say bub-' + slot;
  bub.style.setProperty('--c-accent', ch2.accent);
  bub.querySelector('.nm').textContent = ch2.name + ' ' + ch2.em;
  bub.querySelector('.nm').style.color = ch2.accent;
  var tn = bub.querySelector('.tn');
  if (t.label) { tn.textContent = t.label; tn.style.display = ''; }
  else tn.style.display = 'none';
  bub.querySelector('.en').textContent = cur.en;
  bub.querySelector('.cn').textContent = cur.cn;

  /* ④ 剧情小提示条 */
  var tap = stageEl.querySelector('#stageTap');
  if (!tap) {
    stageEl.insertAdjacentHTML('beforeend', '<div class="tap-hint" id="stageTap">🔊 再听一遍</div>');
    tap = stageEl.querySelector('#stageTap');
    tap.addEventListener('click', function (e) { e.stopPropagation(); playLine(state.lineIndex, true); });
  }
  tap.dataset.idx = i;

  renderNowCard();
}
