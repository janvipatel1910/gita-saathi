// Gyaan Ghar: the Ramayan section (Tulsidas's Ramcharitmanas).
// Loaded after the main script in index.html, so it can use its helpers
// (T, TF, bil, bilVerses, SCR, svg, sky, hills, app, esc, Sound, addCard, FAM, mainHome …).
//
// How a Kand is written: KANDS[n].scenes is a list of scenes. Each scene has
//   art()  – the picture (SVG), redrawn after every step
//   steps  – what is said, one at a time. w = who speaks (see SPEAKERS).
//            A step with act: waits for the reader to do something (see ACTS).
// Retellings are always labelled "Story". Tulsidas's own lines are shown with RV(…)
// together with the Kand they come from.
(function(){
"use strict";
// Helpers shared by index.html (window.GG). Picked up the first time a Ramayan screen opens.
let T,TF,bil,bilVerses,SCR,svg,sky,hills,esc,Sound,addCard,mainHome,HOME_HELP_,stopVoice,app;
const LG=()=>window.GG.lang(), FAMon=()=>window.GG.fam().on;
function init(){
  if(T) return;
  ({T,TF,bil,bilVerses,SCR,svg,hills,esc,Sound,addCard,mainHome,HOME_HELP_,stopVoice}=window.GG);
  const sky0=window.GG.sky; sky=(a,b,c)=>sky0(a,b)+(c||"");
  app=document.getElementById("app");
}

/* ---------- who speaks ---------- */
const SPEAKERS={
  N:["Story","#1f8a8a"], R:["Ram","#2f5fa8"], S:["Sita","#d9534f"], L:["Lakshman","#b7791f"],
  D:["King Dasharath","#7a4fb0"], V:["Vishwamitra","#7a4fb0"], P:["Parashuram","#b03a2e"], U:["Kaushalya","#7a4fb0"]
};

/* ---------- Kand list (only Bal Kand is ready so far) ---------- */
const KANDLIST=[
  [1,"Bal Kand","Ram's childhood and Sita's swayamvar"],
  [2,"Ayodhya Kand","Kaikeyi's boons, exile and Bharat's love"],
  [3,"Aranya Kand","Life in the forest, and Sita taken"],
  [4,"Kishkindha Kand","Meeting Hanuman and Sugriva"],
  [5,"Sundar Kand","Hanuman's leap to Lanka"],
  [6,"Lanka Kand","The bridge, the battle and Ravana's end"],
  [7,"Uttar Kand","Return to Ayodhya and Ram Rajya"]
];
const KEY=n=>"gr-kand-"+n;
const kandDone=n=>{try{return localStorage.getItem(KEY(n))==="done";}catch(e){return false;}};
const READY=()=>Object.keys(KANDS).map(Number);
const kandsDone=()=>KANDLIST.filter(k=>kandDone(k[0])).length;
const REF_BAL="Ramcharitmanas · Bal Kand";

/* ---------- a Tulsidas line ---------- */
// ref: where it comes from · dev: Awadhi text · rom: in English letters · mean: our own simple meaning
const RV=(ref,dev,rom,mean)=>`<span class="verse"><span class="ref">${T(ref)}</span><span class="dev" lang="awa">${SCR(dev)}</span>${LG()==="en"?`<span class="rom">${rom}</span>`:""}<span class="mean" data-k="${encodeURIComponent(mean)}">${T(mean)}</span></span>`;

/* ---------- pictures (original designs) ---------- */
const INK="#1c1c2e", GOLDC="#f4c430";
function face(mood){
  let eyes,mouth,extra="";
  if(mood==="sad"){
    eyes=`<path d="M-27 -300 l16 4 M11 -296 l16 -4" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="-18" cy="-290" r="5" fill="${INK}"/><circle cx="18" cy="-290" r="5" fill="${INK}"/>`;
    mouth=`<path d="M-15 -262 q15 -12 30 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  } else if(mood==="angry"){
    eyes=`<path d="M-30 -308 l20 8 M10 -300 l20 -8" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="-18" cy="-290" r="6" fill="${INK}"/><circle cx="18" cy="-290" r="6" fill="${INK}"/>`;
    mouth=`<path d="M-15 -262 q15 -10 30 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  } else if(mood==="closed"){
    eyes=`<path d="M-27 -290 q9 6 18 0 M9 -290 q9 6 18 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    mouth=`<path d="M-12 -266 q12 8 24 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  } else {
    eyes=`<path d="M-27 -290 q9 -10 18 0 M9 -290 q9 -10 18 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    mouth=`<path d="M-17 -268 q17 16 34 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  return `<g>${eyes}</g><g class="mc">${mouth}</g><g class="mo"><ellipse cx="0" cy="-264" rx="15" ry="11" fill="#6a1f2b"/><ellipse cx="0" cy="-259" rx="8" ry="4" fill="#e8788a"/></g>${extra}<circle cx="-32" cy="-274" r="9" fill="#ff8fa3" opacity=".45"/><circle cx="32" cy="-274" r="9" fill="#ff8fa3" opacity=".45"/>`;
}
// One person. o: id (speaker letter), skin, dress, trim, crown ("mukut"|"jata"|"bun"), beard, bow, axe,
// sari (true for women), hairColor, mood, fold (hands joined), glow, still, child
function person(x,y,s,o){
  o=o||{};
  const skin=o.skin||"#c98a5e", dress=o.dress||"#f7c948", trim=o.trim||"#e05a47", hair=o.hairColor||INK;
  const arm=(side)=>{const k=side<0?-1:1;
    if(o.fold) return `<path d="M${40*k} -215 Q${30*k} -175 ${8*k} -185" stroke="${skin}" stroke-width="22" stroke-linecap="round" fill="none"/>`;
    if(o.bless&&k>0) return `<path d="M40 -215 Q85 -240 92 -290" stroke="${skin}" stroke-width="22" stroke-linecap="round" fill="none"/><circle cx="92" cy="-300" r="15" fill="${skin}"/>`;
    return `<path d="M${40*k} -215 Q${70*k} -170 ${60*k} -135" stroke="${skin}" stroke-width="22" stroke-linecap="round" fill="none"/>`;};
  const body=o.sari
    ? `<path d="M-58 0 L-44 -150 H44 L58 0Z" fill="${dress}"/><path d="M-58 0 L-54 -22 H54 L58 0Z" fill="${trim}"/><path d="M-44 -150 Q20 -120 44 -40" stroke="${trim}" stroke-width="12" fill="none"/>`
    : `<path d="M-52 0 L-42 -140 H42 L52 0Z" fill="${dress}"/><path d="M-52 0 L-49 -16 H49 L52 0Z" fill="${trim}"/><rect x="-46" y="-150" width="92" height="18" rx="8" fill="${trim}"/>`;
  const torso=o.sari
    ? `<path d="M-40 -140 Q-46 -235 0 -238 Q46 -235 40 -140Z" fill="${dress}"/><path d="M-30 -230 Q0 -200 30 -230" stroke="${trim}" stroke-width="7" fill="none"/>`
    : `<path d="M-42 -140 Q-48 -235 0 -238 Q48 -235 42 -140Z" fill="${skin}"/><path d="M-30 -228 Q0 -192 30 -228" stroke="${GOLDC}" stroke-width="7" fill="none"/>`;
  let head=`<circle cy="-290" r="56" fill="${skin}"/>`;
  const hairBack=o.sari?`<path d="M-62 -280 Q-70 -170 -40 -150 L40 -150 Q70 -170 62 -280Z" fill="${hair}"/>`:"";
  if(o.sari) head=head+`<path d="M-56 -292 Q-58 -356 0 -357 Q58 -356 56 -292 Q40 -335 0 -336 Q-40 -335 -56 -292Z" fill="${hair}"/><circle cy="-322" r="6" fill="#d9534f"/>`;
  else if(o.crown==="mukut") head+=`<path d="M-56 -292 Q-58 -355 0 -356 Q58 -355 56 -292 Q44 -330 0 -332 Q-44 -330 -56 -292Z" fill="${hair}"/><path d="M-40 -336 L-32 -380 L-14 -358 L0 -392 L14 -358 L32 -380 L40 -336Z" fill="${GOLDC}" stroke="#d99a00" stroke-width="3"/><circle cy="-352" r="6" fill="#e05a47"/>`;
  else if(o.crown==="jata"||o.crown==="bun") head+=`<path d="M-56 -292 Q-58 -355 0 -356 Q58 -355 56 -292 Q44 -330 0 -332 Q-44 -330 -56 -292Z" fill="${hair}"/><ellipse cy="-370" rx="30" ry="26" fill="${hair}"/>`;
  else head+=`<path d="M-56 -292 Q-58 -355 0 -356 Q58 -355 56 -292 Q44 -330 0 -332 Q-44 -330 -56 -292Z" fill="${hair}"/>`;
  if(!o.sari) head+=`<path d="M0 -318 v-12" stroke="#e05a47" stroke-width="5" stroke-linecap="round"/>`;
  const beard=o.beard?`<path d="M-48 -280 Q-40 -200 0 -186 Q40 -200 48 -280 Q30 -250 0 -250 Q-30 -250 -48 -280Z" fill="${o.beard}"/>`:"";
  const bow=o.bow?`<path d="M96 -330 Q160 -220 96 -110" fill="none" stroke="#8b4a1c" stroke-width="10" stroke-linecap="round"/><line x1="96" y1="-330" x2="96" y2="-110" stroke="#5a3a20" stroke-width="2"/>`:"";
  const axe=o.axe?`<line x1="80" y1="-60" x2="96" y2="-330" stroke="#6b4423" stroke-width="10" stroke-linecap="round"/><path d="M96 -330 Q150 -330 150 -270 Q120 -290 92 -280Z" fill="#9aa4b1" stroke="#5f6773" stroke-width="3"/>`:"";
  return `<g class="chr${o.id?" chr-"+o.id:""}" data-id="${o.id||""}" transform="translate(${x} ${y}) scale(${s*(o.child?.7:1)})"><g class="${o.still?"":"breathe"}">
   ${o.glow?`<circle cy="-220" r="210" fill="#fff3b0" class="pulse"/>`:""}
   ${hairBack}${bow}${axe}${body}${torso}${arm(-1)}${arm(1)}${head}${face(o.mood||"happy")}${beard}
  </g></g>`;
}
const RAM=(x,y,s,o)=>person(x,y,s,Object.assign({id:"R",skin:"#3566b0",dress:"#f7c948",trim:"#e05a47",crown:"mukut",bow:true},o||{}));
const LAKSH=(x,y,s,o)=>person(x,y,s,Object.assign({id:"L",skin:"#e2b48a",dress:"#f0a33a",trim:"#2f5fa8",crown:"mukut",bow:true},o||{}));
const SITA=(x,y,s,o)=>person(x,y,s,Object.assign({id:"S",skin:"#f0c9a0",dress:"#e0453a",trim:GOLDC,sari:true},o||{}));
const SAGE=(x,y,s,o)=>person(x,y,s,Object.assign({skin:"#d9a675",dress:"#f08a24",trim:"#c45f12",crown:"jata",hairColor:"#cfcfd6",beard:"#e6e6ec"},o||{}));
const KING=(x,y,s,o)=>person(x,y,s,Object.assign({skin:"#d9a675",dress:"#7a4fb0",trim:GOLDC,crown:"mukut",hairColor:"#9a9aa6",beard:"#d8d8e0"},o||{}));

const palace=()=>`<rect y="420" width="1600" height="480" fill="#f6dcae"/><g fill="#f3c27a">${[150,450,1150,1450].map(x=>`<rect x="${x-40}" y="250" width="80" height="320"/><path d="M${x-60} 260 Q${x} 150 ${x+60} 260Z" fill="#e8a13d"/>`).join("")}</g><path d="M600 420 Q800 180 1000 420Z" fill="#e8a13d"/><rect x="560" y="400" width="480" height="40" fill="#d98a2b"/><rect y="760" width="1600" height="140" fill="#e3b26b"/>`;
const forest=(c1,c2)=>hills(c1||"#7cc576",c2||"#5aa85a")+[120,330,1270,1480].map((x,i)=>`<g transform="translate(${x} ${560-i%2*30})"><rect x="-14" y="-10" width="28" height="160" fill="#7a4e2a"/><circle cy="-60" r="${90+i%2*20}" fill="${i%2?"#3e8e4a":"#4fa35a"}"/></g>`).join("");
const diyaRow=(n)=>{let g="";for(let i=0;i<5;i++){const x=380+i*210,on=i<n;g+=`<g transform="translate(${x} 860) scale(.8)">${on?`<circle cy="-50" r="70" fill="#ffd36b" opacity=".35" class="pulse"/>`:""}<path d="M-50 0 Q0 38 50 0Z" fill="#d9622b"/>${on?`<path class="flick" d="M0 -60 C24 -30 20 0 0 3 C-20 0 -24 -30 0 -60Z" fill="#ffd36b"/>`:`<line x1="0" y1="0" x2="0" y2="-16" stroke="#5a3a20" stroke-width="4"/>`}</g>`;}return g;};
const stone=(freed)=>freed?`<circle cx="1080" cy="560" r="230" fill="#fff3b0" class="pulse"/>`:`<path d="M940 780 Q930 600 1010 520 Q1100 470 1180 540 Q1250 640 1220 780Z" fill="#9aa0a8" stroke="#7d838b" stroke-width="6"/><path d="M1010 600 q40 -20 80 10 M1050 680 q50 -10 90 20" stroke="#7d838b" stroke-width="5" fill="none"/>`;
const shivBow=(broken)=>broken
  ?`<g transform="translate(800 700)"><path d="M-420 0 Q-260 -110 -40 -40" fill="none" stroke="#7a3d12" stroke-width="26" stroke-linecap="round" transform="rotate(14)"/><path d="M420 0 Q260 -110 40 -40" fill="none" stroke="#7a3d12" stroke-width="26" stroke-linecap="round" transform="rotate(-14)"/><circle r="60" fill="#fff3b0" class="pulse"/></g>`
  :`<g transform="translate(800 720)"><path d="M-430 0 Q0 -200 430 0" fill="none" stroke="#7a3d12" stroke-width="28" stroke-linecap="round"/><line x1="-430" y1="0" x2="430" y2="0" stroke="#5a3a20" stroke-width="4"/><rect x="-470" y="0" width="940" height="40" rx="12" fill="#c58a3c"/></g>`;

/* ---------- Bal Kand ---------- */
const KANDS={1:{
  title:"Bal Kand · Ram's Birth and Sita's Swayamvar",
  sub:"An interactive Ramayan story",
  langs:["hi","gu"],
  kids:"Ram is born in Ayodhya, helps a wise sage, frees a lady who was turned to stone, and marries Sita after gently breaking a huge bow.",
  talk:"Who is someone you love who lives far away? What would you like to tell them today?",
  scenes:[
 { art:()=>svg(sky("#ffd9a8","#fff3dc",`<circle cx="1330" cy="170" r="80" fill="#ffe28a"/>`)+forest("#e8c27a","#d9a95a")+RAM(800,780,.9,{still:true})),
   title:"The Story of Ram", sub:"Tulsidas's Ramcharitmanas · Bal Kand",
   steps:[
    {w:"N",t:"Namaste! About 450 years ago, the poet-saint Tulsidas wrote the story of Shri Ram in Awadhi, the everyday language of his people."},
    {w:"N",t:"He called it the <em>Ramcharitmanas</em>, the \"lake of Ram's deeds\". In homes across India and abroad, families still sing it together."},
    {w:"N",t:"Tulsidas tells it the way Lord Shiva told it to Parvati. Shiva begins with a line many families sing every day:"},
    {w:"N",t:()=>RV(REF_BAL,"मंगल भवन अमंगल हारी। द्रवौ सो दसरथ अजिर बिहारी॥","Mangal bhavan amangal haari, dravau so Dasarath ajir bihaari.","He is the home of all that is good, and he takes away what is bad. May the one who played as a child in King Dasharath's courtyard be kind to us.")},
    {w:"N",t:"Bal Kand is the first part. Tap Next, and let's go to Ayodhya."}
 ]},
 { art:()=>svg(sky("#ffcf8f","#fff1d2",`<circle cx="800" cy="210" r="110" fill="#fff1c1"/>`)+palace()+person(560,780,.85,{id:"U",skin:"#e2b48a",dress:"#2f8a6a",trim:GOLDC,sari:true,fold:true})+(S.cradle?RAM(980,780,.85,{child:true,crown:"mukut",bow:false,glow:true}):RAM(980,780,.85,{glow:true,bless:true,bow:false}))+diyaRow(S.diyas||0)),
   steps:[
    {w:"N",t:"Ayodhya. King Dasharath has three queens: Kaushalya, Kaikeyi and Sumitra. For years they have prayed for a child."},
    {w:"N",t:"On Ram Navami, at noon, Lord Vishnu appears before Queen Kaushalya, glowing, with four arms."},
    {w:"N",t:()=>RV(REF_BAL,"भए प्रगट कृपाला दीनदयाला कौसल्या हित कारी।","Bhaye pragat kripaala deenadayaala, Kausalya hitakaari.","The kind one, who cares for everyone in need, appeared, for the good of Kaushalya.")},
    {w:"U",t:"Lord, this form is too great for me. Please become my little baby, so I can hold you and love you."},
    {w:"N",t:"And he does. The Lord of the whole universe becomes a crying baby in his mother's arms, because that is what love asked for."},
    {act:"tapcount",key:"diyas",n:5,w:"N",q:"Ayodhya is celebrating! Light five diyas for baby Ram.",label:k=>`Light a diya (${k} of 5)`,
     on:()=>{S.cradle=true;return [
      {w:"N",t:"Ram, Lakshman, Bharat and Shatrughna are born, four brothers. The whole city sings."},
      {act:"choice",w:"N",q:"What brings light into <em>your</em> home?",
       opts:[["Family time together","family"],["Prayer or aarti","prayer"],["Good food and laughter","food"],["A call from someone far away","call"]],
       on:k=>[{w:"N",t:{family:"Then that time together is your Ayodhya. Protect it, even when life gets busy.",prayer:"Then keep that diya burning. Even two minutes a day keeps a home feeling like a mandir.",food:"Then that table is your Ayodhya. A shared meal is a small celebration.",call:"Then you know distance can't stop love. Love crossed the whole universe to reach Kaushalya."}[k]}]}]; }}
 ]},
 { art:()=>svg(sky("#cfe8f5","#f3f9fc")+palace()+KING(520,780,.85,{id:"D",mood:S.letgo?"happy":"sad"})+SAGE(860,780,.85,{id:"V",bless:true})+RAM(1180,780,.7,{})+LAKSH(1360,780,.66,{})),
   steps:[
    {w:"N",t:"The boys grow up. One day the great sage Vishwamitra arrives at the palace."},
    {w:"V",t:"O King, demons keep spoiling our yagya in the forest. Send Ram and Lakshman with me. They will protect it."},
    {w:"D",t:"Great sage, ask for my kingdom, my wealth, even my life. But don't ask for Ram. He is still so young."},
    {w:"N",t:"Guru Vasishtha gently explains that the boys will be safe, and that this journey will make them who they are meant to be."},
    {act:"choice",w:"N",q:"If you were King Dasharath, what would you do?",
     opts:[["Keep them safe at home","keep"],["Let them go, with blessings","go"]],
     on:k=>{S.letgo=true;return [
      {w:"N",t:k==="go"?"That's what Dasharath chose too, though his heart ached.":"That's how Dasharath felt at first. Every parent does. But in the end he let them go, with blessings."},
      {w:"N",t:"Many families abroad know this feeling: a parent waving goodbye at the airport, or a child moving away to study or work."},
      {w:"N",t:"Love doesn't mean holding on tight. Sometimes love means blessing someone and letting them grow."},
      {w:"N",t:"In the forest, Ram and Lakshman protect the yagya, and the sage teaches them everything he knows."}];}}
 ]},
 { art:()=>svg(sky("#bfe3d0","#eef8f1")+forest()+stone(S.freed)+(S.freed?person(1080,800,.85,{skin:"#e2b48a",dress:"#f6eedf",trim:"#2f8a6a",sari:true,fold:true,mood:"happy"}):"")+SAGE(260,800,.75,{})+RAM(560,800,.85,{})+LAKSH(760,800,.75,{})),
   steps:[
    {w:"N",t:"On the way to Janakpur they pass an empty ashram. There is a large stone there, quiet and alone."},
    {w:"V",t:"Ram, this is Ahalya, the wife of the sage Gautam. Long ago, after a terrible wrong, she was cursed to become stone. She has waited a very long time for you."},
    {act:"tap",flag:"freed",w:"N",q:"Ram steps forward. Help him free Ahalya.",label:"Touch the stone with Ram's feet",
     on:()=>[
      {w:"N",t:()=>RV(REF_BAL,"परसत पद पावन सोक नसावन प्रगट भई तपपुंज सही।<br>देखत रघुनायक जन सुख दायक सनमुख होइ कर जोरि रही॥","Parasat pad paavan sok nasaavan pragat bhai tapapunj sahi. Dekhat Raghunaayak jan sukh daayak sanmukh hoi kar jori rahi.","At the touch of his holy feet, which take away sorrow, she appeared, shining with all her years of tapasya. Seeing Ram, who brings joy to all, she stood before him with her hands joined.")},
      {w:"N",t:"Ram doesn't ask her what she did. He doesn't remind her of the past. He just sets her free."},
      {w:"N",t:"Maybe you're carrying something heavy too: a mistake, or guilt that has turned your heart to stone. One chapter is not your whole story."}]}
 ]},
 { art:()=>svg(sky("#ffd9e0","#fff3f5")+`<rect y="560" width="1600" height="340" fill="#9fd08a"/>`+[200,420,1200,1420].map((x,i)=>`<g transform="translate(${x} 600)"><circle r="70" fill="${["#ff8fa3","#f4c430","#ffb36b","#e0453a"][i]}" opacity=".85"/><circle r="26" fill="#fff3b0"/></g>`).join("")+SITA(560,800,.9,{fold:true})+RAM(1000,800,.9,{})),
   steps:[
    {w:"N",t:"In Janakpur, King Janak has set a test: whoever can lift and string Lord Shiva's great bow will marry his daughter, Sita."},
    {w:"N",t:"Early one morning, in the palace garden, Ram goes to pick flowers for his guru. Sita has come to pray to Mother Gauri."},
    {w:"N",t:"For the first time, they see each other. Neither says a word. Sita quietly prays: <em>Mother, may the one my heart has chosen be mine.</em>"},
    {w:"S",t:"Mother Gauri, you know what is in my heart. Please bless me."},
    {w:"N",t:"The goddess's garland slips down, as if to say: <em>Your wish will come true.</em>"}
 ]},
 { art:()=>svg(sky("#ffe3b0","#fff6e6")+palace()+shivBow(S.broken)+KING(240,800,.7,{mood:S.broken?"happy":"sad"})+(S.broken?SITA(1360,800,.75,{fold:true}):"")+RAM(800,560,.62,{glow:!!S.broken})),
   steps:[
    {w:"N",t:"The day of the swayamvar. Kings and princes from everywhere come. One by one they try to lift the bow, and one by one they fail. Some can't even move it."},
    {w:"N",t:"Then Ram stands up, calm and humble. And Tulsidas says something beautiful about how everyone in that hall saw him:"},
    {w:"N",t:()=>RV(REF_BAL,"जिन्ह कै रही भावना जैसी। प्रभु मूरति तिन्ह देखी तैसी॥","Jinh kai rahi bhaavana jaisi, prabhu moorati tinh dekhi taisi.","Each person saw the Lord in the same way as the feeling in their own heart.")},
    {act:"choice",w:"N",q:"How do you think the proud kings saw Ram?",
     opts:[["As a rival to beat","rival"],["As a friend","friend"],["As just a boy","boy"]],
     on:k=>[{w:"N",t:{rival:"Yes. Their pride made them see a rival. Sita's family saw a beloved son-in-law. The sages saw God himself.",friend:"Some did, but the proud kings saw a rival. Sita's family saw a beloved son-in-law. The sages saw God himself.",boy:"Some did, at first. The proud kings saw a rival. Sita's family saw a beloved son-in-law. The sages saw God himself."}[k]},
      {w:"N",t:"It works the same way for us. How we see other people often shows what's in our own heart."}]},
    {act:"tap",flag:"broken",w:"N",q:"Ram bows to his guru, then lifts the bow as easily as a flower.",label:"Help Ram string the bow",
     on:()=>[{w:"N",t:"The bow breaks with a sound like thunder! Sita places the jaimala around Ram's neck. Flowers rain down from the sky."}]}
 ]},
 { art:()=>{const calm=(S.breaths||0)>=3;return svg(sky(calm?"#cfe8f5":"#f5b08a",calm?"#f3f9fc":"#fde0cf")+palace()+person(1120,800,.9,{id:"P",skin:"#d9a675",dress:"#f08a24",trim:"#c45f12",crown:"jata",axe:true,mood:calm?"happy":"angry",hairColor:"#3a2a1a",beard:"#3a2a1a"})+RAM(520,800,.85,{fold:true,bow:false,mood:"happy"})+LAKSH(300,800,.75,{mood:calm?"happy":"angry"}));},
   steps:[
    {w:"N",t:"Suddenly the hall goes silent. The fierce sage Parashuram storms in, axe in hand. Shiva's bow was precious to him."},
    {w:"P",t:"Who broke Shiva's bow? Step forward, or every king here will face my anger!"},
    {w:"N",t:"Lakshman answers back sharply, and Parashuram gets even angrier. The air feels hot."},
    {act:"breath",w:"N",q:"Before Ram speaks, let's breathe with him. Press and hold while you breathe in, let go to breathe out. Three times.",
     on:()=>[
      {w:"R",t:()=>RV(REF_BAL,"नाथ संभु धनु भंजनि हारा। होइहि कोउ एक दास तुम्हारा॥","Naath Sambhu dhanu bhanjani haara, hoihi kou ek daas tumhaara.","My lord, the one who broke Shiva's bow must surely be one of your own servants.")},
      {w:"N",t:"Ram doesn't argue. He answers with respect and soft words. Slowly, Parashuram's anger melts. He realises who Ram really is, blesses him and leaves in peace."},
      {w:"N",t:"Anger met with anger grows bigger. Anger met with softness has nowhere to go."},
      {act:"write",w:"N",q:"Make your card. When someone is angry with me, what will I do?",ph:"e.g. Take a breath and reply softly",
       ref:REF_BAL,rom:"Naath Sambhu dhanu bhanjani haara",card:v=>TF("When someone is angry with me, like Ram, I will: <strong>{v}</strong>",v),
       on:()=>[
        {w:"N",t:"Ram and Sita are married in Janakpur, and so are his three brothers. Ayodhya celebrates for days."},
        {w:"N",t:"<em>Jai Siya Ram.</em> That is the end of Bal Kand. Next comes Ayodhya Kand, where life is about to change."}]}]}
 ]}
]}};

/* ---------- screens ---------- */
let S={};
function kandList(){
  init(); stopVoice();
  const ready=READY();
  app.innerHTML=`<div class="controls"><button class="ghost" id="toHome" type="button">${T("‹ Home")}</button></div>
   <h1>${T("The Ramayan Story")}</h1><p class="lead">${T("Tulsidas's Ramcharitmanas, Kand by Kand. Each one is a story where you make choices and keep a card at the end.")}</p>
   <div class="chlist">${KANDLIST.map(([n,name,about])=>{const ok=ready.includes(n),d=kandDone(n);
     return `<button class="ch${ok?" open":""}${d?" done":""}" type="button" data-k="${n}"${ok?"":" disabled aria-disabled=\"true\""}><span class="n">${n}</span><span class="t"><b>${T(about)}</b><i>${T(name)}</i></span><span class="s">${T(!ok?"Coming soon":d?"Play again":"Play")}</span></button>`;}).join("")}</div>
   <p class="tiny">${T("Stories are retold in simple words. Tulsidas's own lines are always shown with the Kand they come from.")}</p>
   ${HOME_HELP_()}`;
  document.getElementById("toHome").onclick=()=>mainHome();
  app.querySelectorAll(".ch[data-k]").forEach(b=>{if(!b.disabled) b.onclick=()=>kandStory(+b.dataset.k);});
  window.scrollTo(0,0);
}

function kandStory(N){
  init(); stopVoice();
  const K=KANDS[N]; if(!K) return kandList();
  S={};
  app.innerHTML=`<div class="controls"><button class="ghost" id="toKands" type="button">${T("‹ Kands")}</button></div>
  <header class="shead"><h2>${T(K.title)}</h2><div class="dots" id="dots" aria-hidden="true"></div></header>
  ${FAMon()&&K.kids?`<div class="kids"><b>${T("For children")}</b><p>${bil(K.kids)}</p></div>`:""}
  ${LG()!=="en"&&!(K.langs||[]).includes(LG())?`<p class="note-lang">${T("This Kand hasn't been translated yet, so it's shown in English for now.")}</p>`:""}
  <div class="stage story" id="stage" role="img" aria-label="${T("Story picture")}"></div>
  <div class="box story" aria-live="polite"><span class="who N" id="who">${T("Story")}</span><p class="say" id="say"></p><div class="act" id="act"></div></div>
  <div class="controls"><button class="ghost" id="back" type="button">${T("‹ Back")}</button><button id="next" type="button">${T("Next ›")}</button><span class="spacer"></span><label class="tts" for="tts"><input type="checkbox" id="tts"> ${T("Read aloud")}</label></div>
  <div id="cardHost"></div><p class="hint">${T("Tap the picture or press Next to move on. Some scenes ask you to do something first.")}</p>`;
  const $=id=>document.getElementById(id);
  const stage=$("stage"),who=$("who"),say=$("say"),act=$("act"),nextB=$("next"),backB=$("back"),dots=$("dots"),tts=$("tts"),cardHost=$("cardHost");
  const synth=("speechSynthesis" in window)?window.speechSynthesis:null;
  const scenes=K.scenes; let sc=0,queue=[],pos=-1,waiting=false,speaking="";
  $("toKands").onclick=()=>{if(synth)try{synth.cancel();}catch(e){} kandList();};
  scenes.forEach(()=>dots.appendChild(document.createElement("span")));

  function draw(){
    const s=scenes[sc];
    stage.innerHTML=s.art()+(s.title?`<div class="titlecard"><div class="t">${T(s.title)}</div><div class="s">${T(s.sub||K.sub)}</div></div>`:"");
    [...dots.children].forEach((d,i)=>{d.className=i<sc?"done":i===sc?"on":"";});
    mark();
  }
  function mark(){stage.querySelectorAll(".chr").forEach(c=>c.classList.toggle("spk",!!speaking&&c.dataset.id===speaking));}
  function speak(html){
    if(!synth) return; try{synth.cancel();}catch(e){}
    if(!tts.checked) return;
    const t=String(html).replace(/<[^>]+>/g," ");
    try{const u=new SpeechSynthesisUtterance(t);u.rate=.95;u.lang=LG()==="gu"?"gu-IN":LG()==="hi"?"hi-IN":"en-IN";
      const want=LG()==="gu"?/gu-IN/i:LG()==="hi"?/hi-IN/i:/en-IN|en-GB/i;const v=synth.getVoices().find(v=>want.test(v.lang));if(v)u.voice=v;synth.speak(u);}catch(e){}
  }
  let talkTimer=0;
  function show(step){
    const raw=typeof step.t==="function"?step.t():(step.t||step.q);
    const sp=SPEAKERS[step.w]||SPEAKERS.N;
    who.textContent=T(sp[0]); who.className="who"+(step.w==="N"?" N":""); who.style.background=step.w==="N"?"":sp[1];
    say.innerHTML=bil(raw); bilVerses(say); say.classList.remove("in"); void say.offsetWidth; say.classList.add("in");
    speaking=step.w!=="N"?step.w:""; mark();
    clearTimeout(talkTimer); stage.classList.toggle("talking",!!speaking);
    const plain=say.textContent||""; talkTimer=setTimeout(()=>stage.classList.remove("talking"),Math.min(6000,Math.max(1200,plain.length*55)));
    speak(say.innerHTML);
  }
  function startScene(i){
    sc=i; queue=scenes[i].steps.slice(); pos=-1; waiting=false; act.innerHTML="";
    draw(); stage.classList.remove("enter"); void stage.offsetWidth; stage.classList.add("enter");
    advance();
  }
  function advance(){
    if(waiting) return;
    if(pos>=queue.length-1){ if(sc<scenes.length-1) startScene(sc+1); else finish(); return; }
    pos++; const st=queue[pos]; act.innerHTML="";
    show(st);
    if(st.act){ waiting=true; nextB.disabled=true; ACTS[st.act](st); }
    else if(sc===scenes.length-1&&pos===queue.length-1) finish();
    else nextB.disabled=false;
    backB.disabled=(sc===0&&pos===0);
  }
  function done(st,arg){
    act.innerHTML=""; waiting=false; nextB.disabled=false; Sound.chime();
    const extra=st.on?st.on(arg):[];
    queue.splice(pos+1,0,...extra);
    draw(); advance();
  }
  function finish(){
    nextB.disabled=true; act.innerHTML="";
    try{localStorage.setItem(KEY(N),"done");}catch(e){} if(window.__ggChanged) window.__ggChanged();
    btn("Play again","",()=>kandStory(N));
    btn("Back to Kands","ghost",()=>kandList());
    if(FAMon()&&K.talk&&!document.getElementById("talkCard")) cardHost.insertAdjacentHTML("beforeend",`<div class="talk" id="talkCard"><b>${T("Talk about it together")}</b><p>${bil(K.talk)}</p></div>`);
  }
  function btn(label,cls,fn){const b=document.createElement("button");b.type="button";b.className=cls||"opt";b.innerHTML=T(label);b.onclick=fn;act.appendChild(b);return b;}

  const ACTS={
    choice(st){ st.opts.forEach(([label,key])=>btn(label,"opt",()=>done(st,key))); },
    tap(st){ btn(st.label,"",function(){this.remove();S[st.flag]=true;draw();setTimeout(()=>done(st),1100);}); },
    tapcount(st){ S[st.key]=0; const b=btn(st.label(0),"",()=>{S[st.key]++;draw();if(S[st.key]>=st.n){b.remove();setTimeout(()=>done(st),900);}else b.innerHTML=T(st.label(S[st.key]));}); },
    breath(st){
      S.breaths=0;
      const b=document.createElement("button"); b.type="button"; b.className="hold"; b.innerHTML="<i></i><span>"+T("Hold and breathe in")+"</span>"; act.appendChild(b);
      const fill=b.querySelector("i"), lab=b.querySelector("span"); let t0=0,raf=0,full=false;
      const tick=()=>{const p=Math.min(1,(performance.now()-t0)/3000); fill.style.width=(p*100)+"%"; if(p>=1){full=true;lab.textContent=T("Now let go, breathe out");return;} raf=requestAnimationFrame(tick);};
      const down=e=>{e.preventDefault(); full=false; t0=performance.now(); lab.textContent=T("Breathing in…"); raf=requestAnimationFrame(tick);};
      const up=()=>{if(!t0) return; t0=0; cancelAnimationFrame(raf); fill.style.width="0";
        if(full){ S.breaths++; draw(); if(S.breaths>=3){ setTimeout(()=>done(st),700); return;} lab.textContent=T(`Good. Again (${S.breaths} of 3)`); }
        else lab.textContent=T(S.breaths?`Hold a little longer (${S.breaths} of 3)`:"Hold a little longer"); full=false; };
      b.addEventListener("pointerdown",down); b.addEventListener("pointerup",up); b.addEventListener("pointerleave",up); b.addEventListener("pointercancel",up);
      b.addEventListener("keydown",e=>{if((e.key===" "||e.key==="Enter")&&!e.repeat)down(e);}); b.addEventListener("keyup",e=>{if(e.key===" "||e.key==="Enter")up();});
    },
    write(st){
      const wrap=document.createElement("div"); wrap.className="field";
      wrap.innerHTML=`<input id="wIn" type="text" maxlength="90" placeholder="${esc(T(st.ph))}" aria-label="${T("Your answer")}"><button type="button" id="wGo">${T("Make my card")}</button>`;
      act.appendChild(wrap);
      const go=()=>{const v=$("wIn").value.trim(); if(!v){$("wIn").focus();return;}
        const html=st.card(esc(v)); Sound.card(); addCard({kand:N,ref:st.ref,html});
        cardHost.innerHTML=`<div class="blessing">${LG()==="en"?`<div class="v">${st.rom}</div>`:""}<div class="m">${html}</div><div class="f">${T(st.ref)}</div><div><button type="button" id="copyCard" class="opt">${T("Copy my card")}</button></div></div>`;
        $("copyCard").onclick=function(){const b=this;const txt=cardHost.querySelector(".m").innerText+"\n"+cardHost.querySelector(".f").innerText;
          try{navigator.clipboard.writeText(txt).then(()=>b.textContent=T("Copied"),()=>b.textContent=T("Select the text above to copy"));}catch(e){b.textContent=T("Select the text above to copy");}};
        done(st);};
      $("wGo").onclick=go; $("wIn").addEventListener("keydown",e=>{if(e.key==="Enter"){e.stopPropagation();go();}});
      setTimeout(()=>{try{$("wIn").focus({preventScroll:true});}catch(e){}},50);
    }
  };

  nextB.onclick=advance;
  backB.onclick=()=>{ if(pos<=0&&sc>0) startScene(sc-1); else startScene(sc); };
  stage.addEventListener("click",()=>{ if(!waiting) advance(); });
  if(window.__sk)document.removeEventListener("keydown",window.__sk);
  window.__sk=e=>{if(!document.getElementById("next"))return; if(e.target.tagName==="INPUT"||e.target.tagName==="BUTTON") return; if(e.key==="ArrowRight"||e.key===" "){e.preventDefault(); if(!waiting) advance();}};
  document.addEventListener("keydown",window.__sk);
  tts.onchange=()=>{ if(tts.checked) speak(say.innerHTML); else if(synth) try{synth.cancel();}catch(e){} };
  window.scrollTo(0,0);
  startScene(0);
}

/* ---------- used by the home page ---------- */
window.Ramayan={
  open:kandList,
  play:n=>kandStory(n),
  next:()=>READY().find(n=>!kandDone(n))||null,
  done:kandsDone,
  total:KANDLIST.length,
  ready:()=>READY().length
};
})();
