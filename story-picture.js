/* Original illustration system. One local atlas; no third-party book pictures. */
(()=>{
 'use strict';
 CHARACTERS.piggie.name='Pip'; CHARACTERS.piggie.cn='小猪豆豆';
 CHARACTERS.gerald.name='Ellie'; CHARACTERS.gerald.cn='小象乐乐';
 STORIES.forEach(s=>s.script.forEach(l=>{l.en=l.en.replace(/Gerald/g,'Ellie').replace(/Piggie/g,'Pip');l.cn=l.cn.replace(/Gerald/g,'小象乐乐').replace(/Piggie/g,'小猪豆豆')}));
 STORIES.push({id:'today-i-want-to-fly',title:'Today I Want to Fly!',cn:'今天我想飞！',original:true,
  blurb:'豆豆和乐乐让一架纸飞机飞起来。一起说出自己的主意吧！',cover:['piggie','gerald'],cast:['piggie','gerald'],sceneStarts:[0,3,6,9,12],
  scenes:[{cap:'草地上的新主意',bg:['#c9edff','#e7f6cb']},{cap:'一起做一架纸飞机',bg:['#fff1c9','#dff2cc']},{cap:'第一次试飞',bg:['#e1dfff','#dff2cc']},{cap:'改变一点，再试一次',bg:['#c5f1eb','#dff2cc']},{cap:'我们成功了！',bg:['#ffdfe9','#dff2cc']}],
  script:[
   {who:'piggie',en:'I want to fly!',cn:'我想飞！',tone:'excited'},
   {who:'gerald',en:'Let us make something that can fly.',cn:'我们做个能飞的东西吧。',tone:'happy'},
   {who:'piggie',en:'A paper plane! Can you help me?',cn:'一架纸飞机！你能帮我吗？',tone:'question'},
   {who:'gerald',en:'Yes! Here is some paper.',cn:'好呀！这里有一些纸。',tone:'happy'},
   {who:'piggie',en:'Fold it like this.',cn:'像这样折起来。',tone:'normal'},
   {who:'gerald',en:'Look! Two little wings.',cn:'看！两只小翅膀。',tone:'surprised'},
   {who:'piggie',en:'Ready? One, two, three!',cn:'准备好了吗？一、二、三！',tone:'excited'},
   {who:'gerald',en:'Oh! It landed by my feet.',cn:'噢！它落在了我的脚边。',tone:'surprised'},
   {who:'piggie',en:'That is okay. We can try again.',cn:'没关系，我们可以再试一次。',tone:'happy'},
   {who:'gerald',en:'Let us fold the wings a little more.',cn:'我们把翅膀再折一点吧。',tone:'thinking'},
   {who:'piggie',en:'I will give it a gentle push.',cn:'我要轻轻地把它推出去。',tone:'normal'},
   {who:'gerald',en:'Look up! Our plane is flying!',cn:'抬头看！我们的飞机飞起来了！',tone:'excited'},
   {who:'piggie',en:'Hooray! We did it together!',cn:'太好了！我们一起做到了！',tone:'excited'},
   {who:'gerald',en:'What shall we make next?',cn:'接下来我们做什么呢？',tone:'question'},
   {who:'piggie',en:'A kite! But first, let us rest.',cn:'一只风筝！不过，我们先休息一下吧。',tone:'happy'}
  ]});
 const atlas=new Image();atlas.decoding='async';atlas.src='assets/story-v2/characters.webp';
 const frames=new WeakMap(),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 let readerFrame=0,readerLastPaint=0;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const oldScene=sceneIndexOfLine;
 window.sceneIndexOfLine=function(i){if(!state.story.sceneStarts)return oldScene(i);return Math.max(0,state.story.sceneStarts.filter(x=>x<=i).length-1)};
 window.coverArt=function(s){return `<div class="picture-cover" aria-hidden="true"><i class="picture-sprite pig pose-${s.id==='today-i-want-to-fly'?3:0}"></i><i class="picture-sprite elephant pose-1"></i><b class="picture-prop">${({'my-new-toy':'🧸','can-i-play-too':'⚽','happy-pig-day':'🎈','i-am-invited-to-a-party':'🎉','should-i-share-my-ice-cream':'🍦','i-broke-my-trunk':'💛','today-i-want-to-fly':'🛩️'})[s.id]}</b></div>`};
 function round(ctx,x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else{ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r)}ctx.fill()}
 function ellipse(ctx,x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
 function words(ctx,text,x,y,max,font=44){ctx.font=`800 ${font}px system-ui, sans-serif`;const lines=[];let line='';for(const word of text.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>max&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);lines.forEach((t,i)=>ctx.fillText(t,x,y+i*(font+10)));return lines.length}
 function paperPlane(ctx,x,y,scale,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.fillStyle='#fffaf0';ctx.strokeStyle='#8db5c3';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-75,-35);ctx.lineTo(95,0);ctx.lineTo(-55,55);ctx.lineTo(-22,3);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-75,-35);ctx.lineTo(-22,3);ctx.lineTo(95,0);ctx.stroke();ctx.restore()}
 function character(ctx,key,pose,x,y,size,active,t){
  ellipse(ctx,x+size/2,y+size*.9,size*.27,16,'#57795720');
  const moving=active&&!reduced?.matches,bob=moving?Math.sin(t*7)*10:0;
  if(active){ellipse(ctx,x+size*.5,y+size*.52,size*.57,size*.58,'#fff6cfb0');ctx.strokeStyle=key==='piggie'?'#e388a6':'#4fa4ad';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x+size*.5,y+size*.52,size*.53,size*.55,0,0,Math.PI*2);ctx.stroke()}
  // Two illustrated poses: mouth closed / mouth open with a friendly hand gesture.
  if(moving)pose=Math.sin(t*10)>-.4?1:0;
  ctx.save();ctx.translate(x+size/2,y+size*.9);if(moving)ctx.rotate(Math.sin(t*5)*.025);ctx.translate(-x-size/2,-y-size*.9);
  if((key==='piggie'||key==='gerald')&&atlas.complete&&atlas.naturalWidth){const sw=atlas.naturalWidth/4,sh=atlas.naturalHeight/2;ctx.drawImage(atlas,sw*pose,key==='piggie'?0:sh,sw,sh,x,y+bob,size,size*sh/sw)}
  else{ctx.font=`${size*.60}px system-ui`;ctx.fillText(CHARACTERS[key]?.em||'📖',x+size*.1,y+size*.7)}
  ctx.restore();
  round(ctx,x+size*.12,y+size*.90,size*.76,46,23,active?(key==='piggie'?'#d57991':'#3c92a0'):'#ffffffd9');ctx.fillStyle=active?'white':'#354957';ctx.textAlign='center';ctx.font='800 25px system-ui';ctx.fillText(CHARACTERS[key]?.cn||'旁白',x+size*.5,y+size*.90+32);ctx.textAlign='left';
 }
 function wrap(ctx,text,width,font){ctx.font=`800 ${font}px system-ui, sans-serif`;const lines=[];let row='';for(const word of text.split(' ')){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){lines.push(row);row=word}else row=next}if(row)lines.push(row);return lines}
 function bubble(ctx,line,slot,speaking,t){
  const color=line.who==='piggie'?'#c85c84':line.who==='nah'?'#8063aa':'#287d87',x=slot==='r'?658:slot==='c'?355:36,w=586,y=112;
  let font=44,rows=wrap(ctx,line.en,w-56,font);while(rows.length>2&&font>34){font-=2;rows=wrap(ctx,line.en,w-56,font)}
  const h=62+rows.length*(font+10),tail=slot==='r'?962:slot==='c'?640:326;
  ctx.save();ctx.shadowColor='#32405020';ctx.shadowBlur=14;ctx.shadowOffsetY=5;round(ctx,x,y,w,h,26,'#fffefbef');ctx.restore();
  ctx.strokeStyle=color;ctx.lineWidth=speaking?5:3;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,26);else ctx.rect(x,y,w,h);ctx.stroke();
  if(slot!=='c'){ctx.fillStyle='#fffefb';ctx.beginPath();ctx.moveTo(tail-17,y+h-1);ctx.lineTo(tail,y+h+22);ctx.lineTo(tail+17,y+h-1);ctx.fill();ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(tail-17,y+h);ctx.lineTo(tail,y+h+22);ctx.lineTo(tail+17,y+h);ctx.stroke()}
  const ch=CHARACTERS[line.who]||CHARACTERS.nah;ctx.fillStyle=color;ctx.font='800 25px system-ui';ctx.fillText(`${ch.cn} · ${ch.name}`,x+28,y+34);
  if(speaking){for(let j=0;j<4;j++){const height=reduced?.matches?15:12+Math.abs(Math.sin(t*9+j))*14;round(ctx,x+w-85+j*14,y+26-height/2,8,height,4,color)}}
  ctx.fillStyle='#342c48';ctx.font=`800 ${font}px system-ui, sans-serif`;rows.forEach((text,j)=>ctx.fillText(text,x+28,y+72+j*(font+10)));
  return {x,y,width:w,height:h,font,rows,tail,slot};
 }
 function sceneFor(s,i){if(s.sceneStarts)return Math.max(0,s.sceneStarts.filter(x=>x<=i).length-1);const starts={'can-i-play-too':[0,4,9,14],'my-new-toy':[0,4,7,10],'i-broke-my-trunk':[0,4,6,10],'happy-pig-day':[0,3,7,10],'i-am-invited-to-a-party':[0,3,7,9],'should-i-share-my-ice-cream':[0,3,6,10]}[s.id]||[0];return Math.max(0,starts.filter(x=>x<=i).length-1)}
 function draw(ctx,s,i,{speaking=false,t=0,subtitles=true}={}){
  if(reduced?.matches)t=0;
  const line=s.script[i],scIndex=sceneFor(s,i),sc=s.scenes[scIndex];
  ctx.clearRect(0,0,1280,720);const sky=ctx.createLinearGradient(0,0,0,720);sky.addColorStop(0,sc.bg[0]);sky.addColorStop(1,'#fff9e8');ctx.fillStyle=sky;ctx.fillRect(0,0,1280,720);
  ellipse(ctx,1120,115,58,58,'#ffdf88');
  [[130,110],[890,80]].forEach(([x,y])=>{ellipse(ctx,x,y,80,26,'#ffffffbd');ellipse(ctx,x+45,y-15,46,32,'#ffffffbd')});
  ellipse(ctx,300,715,840,350,sc.bg[1]);ellipse(ctx,1240,700,670,310,'#b7dfbb');
  round(ctx,56,112,28,360,14,'#b99972');[0,1,2].forEach(j=>ellipse(ctx,75+j*18,145+j*45,115-j*20,100,'#81bf99'));
  ctx.strokeStyle='#6aac86';ctx.lineWidth=4;for(let j=0;j<8;j++){const x=850+j*45;ctx.beginPath();ctx.moveTo(x,512);ctx.lineTo(x+8,487);ctx.stroke();ellipse(ctx,x+8,484,10,10,j%2?'#fff3a2':'#f9b5c7')}
  round(ctx,28,24,720,65,28,'#ffffffdb');ctx.fillStyle='#375964';ctx.font='700 29px system-ui';ctx.fillText(sc.cap,52,68);
  round(ctx,1050,24,204,65,28,'#ffffffdb');ctx.fillStyle='#375964';ctx.font='700 28px system-ui';ctx.fillText(`${i+1} / ${s.script.length}`,1090,68);
  // Props change with scene/line, rather than an unrelated stock illustration.
  if(s.original){if(i>=3&&i<6){round(ctx,560,520,165,80,12,'#e5b584');paperPlane(ctx,640,500,.85,0)}else if(i>=6){const fly=i>=11;paperPlane(ctx,fly?640+Math.sin(t)*75:650,fly?395:590,fly?1.2:.8,fly?-.25:.12)}}
  else{const prop={'my-new-toy':'🧸','can-i-play-too':'⚽','happy-pig-day':'🎈','i-am-invited-to-a-party':'🎉','should-i-share-my-ice-cream':'🍦','i-broke-my-trunk':'💛'}[s.id];ctx.font='95px system-ui';ctx.fillText(prop,595,scIndex%2?340:465)}
  let pair=['piggie','gerald'];if(!pair.includes(line.who)&&line.who!=='nah')pair=[line.who,'gerald'];
  const pose= ['surprised','question','worried'].includes(line.tone)?2:['excited','happy','laugh','proud'].includes(line.tone)?3:0;
  pair.forEach((key,k)=>character(ctx,key,key===line.who?(speaking?1:pose):0,k===0?150:800,288,330,key===line.who&&speaking,t));
  // Speech bubbles are part of the canvas, so the exported movie includes them.
  const slot=line.who==='nah'?'c':pair.indexOf(line.who)===1?'r':'l';
  const bounds=bubble(ctx,line,slot,speaking,t);
  frames.set(ctx.canvas,{speaker:line.who,text:line.en,bubble:bounds,speaking,animatedRoles:pair.filter(k=>speaking&&k===line.who)});
 }
 function readerPaint(now=performance.now()){
  const stage=document.getElementById('stage'),canvas=stage?.querySelector('canvas');
  if(!canvas||document.hidden||document.getElementById('kid-reader')?.hidden){cancelAnimationFrame(readerFrame);readerFrame=0;return}
  const speaking=document.body.classList.contains('kid-speaking');
  if(now-readerLastPaint>=66||!speaking){draw(canvas.getContext('2d'),state.story,state.lineIndex,{speaking,t:now/1000});readerLastPaint=now}
  if(speaking)readerFrame=requestAnimationFrame(readerPaint);else readerFrame=0;
 }
 function syncReader(){cancelAnimationFrame(readerFrame);readerLastPaint=0;readerPaint()}
 window.StoryPicture={atlas,draw,sceneFor,inspect:canvas=>{const f=frames.get(canvas);return f?JSON.parse(JSON.stringify(f)):null},ready:()=>atlas.complete&&atlas.naturalWidth>0,load:()=>new Promise((resolve,reject)=>{if(atlas.complete){atlas.naturalWidth?resolve():reject(Error('图片未加载'));return}atlas.addEventListener('load',resolve,{once:true});atlas.addEventListener('error',reject,{once:true})})};
 window.renderStage=function(){const el=document.getElementById('stage');if(!el||!state.story)return;el.innerHTML='<canvas width="1280" height="720" aria-hidden="true"></canvas>';syncReader();if(!StoryPicture.ready())StoryPicture.load().then(syncReader).catch(()=>{});renderNowCard()};
 new MutationObserver(syncReader).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',syncReader);
 document.addEventListener('click',()=>queueMicrotask(syncReader));
 window.addEventListener('pagehide',()=>cancelAnimationFrame(readerFrame));
})();
