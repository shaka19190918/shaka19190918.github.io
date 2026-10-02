/* Local-only 16:9 dialogue movie. VAD detects speaking then silence, NOT words.
 * No camera, cloud speech recognition, language score, or automatic upload. */
(()=>{
 'use strict';
 const el=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let story=null,index=0,epoch=0,pending=false,pendingContext=null,session=null,frame=0,result=null,resultUrl=null,downloaded=false,demoEpoch=0,demoAudio=null,demoActive=false,demoSpeaking=false,demoFrame=0,demoTimer=null;
 const MAX_MS=180000,SILENCE_MS=1200;
 function button(a,t,primary=false){return `<button class="kid-btn ${primary?'primary':''}" type="button" data-theater="${a}">${t}</button>`}
 function note(t){if(el('theaterStatus'))el('theaterStatus').textContent=t}
 function clearDemo(){demoEpoch++;clearTimeout(demoTimer);demoAudio?.pause();demoAudio=null;demoActive=false;setDemoSpeaking(false);try{speechSynthesis.cancel()}catch(_){}}
 function supported(){return !!(window.MediaRecorder&&window.AudioContext&&HTMLCanvasElement.prototype.captureStream&&navigator.mediaDevices?.getUserMedia)}
 function ui(){
  if(!el('theaterStart'))return;const recording=!!session,pause=recording&&session.rec.state==='paused';
  el('theaterStart').disabled=pending||recording||!supported();el('theaterStop').disabled=!pending&&!recording;
  el('theaterNext').disabled=!recording||pause||session.finishing;el('theaterPause').disabled=!recording||session.finishing;
  el('theaterPause').textContent=pause?'▶ 继续配音':'⏸ 暂停';el('theaterDemo').disabled=pending||demoActive||!!session?.finishing;
  el('theaterConsent').disabled=pending||recording;el('theaterAuto').disabled=pending||recording;el('kid-retell').classList.toggle('theater-recording',recording||pending);
  el('theaterClock').textContent=recording?fmt(Math.max(0,(MAX_MS-(performance.now()-session.started))/1000)):'最多 3 分钟';
 }
 function paint(speaking=false,t=0){const c=el('theaterCanvas');if(c&&story)StoryPicture.draw(c.getContext('2d'),story,index,{speaking,t})}
 function setDemoSpeaking(on){demoSpeaking=on;cancelAnimationFrame(demoFrame);paint(on,performance.now()/1000);if(on&&!session){let last=0;const animate=now=>{if(!demoSpeaking||session||document.hidden)return;if(now-last>=66){paint(true,now/1000);last=now}demoFrame=requestAnimationFrame(animate)};demoFrame=requestAnimationFrame(animate)}}
 function line(){const l=story.script[index],ch=CHARACTERS[l.who];el('theaterSpeaker').textContent=ch.em+' '+ch.cn+' · '+ch.name;el('theaterLine').textContent=l.en;el('theaterCn').textContent=l.cn;el('theaterLineCount').textContent=`第 ${index+1} / ${story.script.length} 句`;paint()}
 function mount(s){halt('已停止本次录制。');story=s;index=0;
  el('kid-retell').innerHTML=`<div class="kid-reader-head"><button class="kid-btn" data-action="reader">← 回到故事</button><div><span class="kid-eyebrow">小猪小象 · 配音小剧场</span><h1>${esc(s.cn)}</h1></div></div><section class="theater-card"><div class="theater-top"><span>🎬 你来演两个角色</span><span id="theaterLineCount"></span></div><div class="theater-screen"><canvas id="theaterCanvas" width="1280" height="720" role="img" aria-label="当前角色和故事画面"></canvas></div><div class="theater-script"><p id="theaterSpeaker" class="kid-speaker"></p><p id="theaterLine" class="kid-sentence" lang="en"></p><details><summary>看中文</summary><p id="theaterCn"></p></details></div><div class="kid-actions">${button('demo','🔊 先听这句')} ${button('fullscreen','⛶ 放大画面')}</div><div class="theater-steps"><span>① 看角色</span><span>② 念这一句</span><span>③ 停顿换幕</span></div><label class="kid-consent"><input id="theaterConsent" type="checkbox">家长同意本次麦克风与本地视频制作</label><label class="theater-toggle"><input id="theaterAuto" type="checkbox" checked>说话后停顿约1秒，自动下一句</label><div class="kid-actions">${button('start','🎙️ 开始我的配音',true)}${button('pause','⏸ 暂停')}${button('next','这句念好了 →')}${button('stop','■ 完成 / 取消')}</div><div class="theater-meter"><span id="theaterClock">最多 3 分钟</span><meter id="theaterMeter" min="0" max="1" value="0" aria-label="麦克风声音大小"></meter></div><p id="theaterStatus" class="kid-status" role="status" aria-live="polite">先听示范，再用自己的声音扮演角色。不需要模仿特殊口音。</p><p class="theater-privacy">只检测声音与停顿，不识别句子、不评判发音。不打开摄像头、不上传。请在安静环境中练习；背景声也可能触发换幕，可关闭自动模式。</p><section id="theaterResult" hidden></section><details class="theater-fallback"><summary>只想自由讲一段故事？</summary><p>不看台词，自己讲给家长听。</p><button class="kid-btn" data-action="free-retell">🎤 自由讲述（仅录音）</button></details></section>`;
  const names={start:'theaterStart',stop:'theaterStop',next:'theaterNext',pause:'theaterPause',demo:'theaterDemo'};Object.entries(names).forEach(([k,id])=>el('kid-retell').querySelector(`[data-theater="${k}"]`).id=id);el('theaterStart').parentElement.classList.add('theater-record-controls');
  line();ui();showResult();if(!supported())note('此浏览器不支持制作视频。请在新版 Safari / Chrome 打开；也可以使用下方的“自由讲述”仅录音。');StoryPicture.load().then(()=>{if(StoryChild.screen==='retell'&&el('theaterCanvas'))paint()}).catch(()=>note('角色图片没有加载成功，请联网后重试。不会用不完整画面录制视频。'));
 }
 function showResult(){if(!result||!resultUrl||!el('theaterResult'))return;const r=el('theaterResult');r.hidden=false;r.innerHTML=`<h2>🌟 你的配音小电影</h2><p>${esc(result.title)} · ${result.complete?'完整故事':'练习片段'} · ${result.lines} / ${result.total} 句</p><video id="theaterPlayback" controls playsinline preload="metadata"></video><div class="kid-actions">${button('download','⬇ 保存我的视频',true)}${button('discard','删除这段视频')}</div><p class="theater-privacy">${result.mime.includes('mp4')?'MP4':'WebM'} 格式。刷新前请保存；手机可能弹出分享/保存菜单。不能保存时，请保留页面并使用浏览器下载。</p>`;el('theaterPlayback').src=resultUrl;el('theaterPlayback').poster=result.poster||''}
 function dispose(s){cancelAnimationFrame(frame);clearInterval(s.timer);s.input?.getTracks().forEach(t=>t.stop());s.video?.getTracks().forEach(t=>t.stop());s.ctx?.close().catch(()=>{});if(session===s)session=null;if(el('theaterMeter'))el('theaterMeter').value=0;ui()}
 function finish(message='完成啦！先回放，再保存你的小电影。'){
  if(pending){epoch++;pending=false;pendingContext?.close().catch(()=>{});pendingContext=null;clearDemo();ui();note('已取消麦克风请求。');return}
  const s=session;if(!s||s.finishing)return;s.finishing=true;clearDemo();s.message=message;
  try{if(s.rec.state!=='inactive')s.rec.stop();else dispose(s)}catch(_){dispose(s);note('录制中断，未生成可播放的视频。请重试。')}ui();
 }
 function halt(message){finish(message||'离开页面已停止录制，练习片段保留在本次页面中。');clearDemo();el('theaterPlayback')?.pause()}
 function resetVad(s){s.voiceMs=0;s.silentMs=0;s.last=performance.now();s.lineStarted=s.last;s.speaking=false;s.ignoreUntil=s.last+500}
 function advance(){const s=session;if(!s||s.finishing||s.rec.state!=='recording')return;s.completed=Math.max(s.completed,index+1);if(index===story.script.length-1){s.complete=true;finish();return}index++;resetVad(s);line();note('轮到'+CHARACTERS[story.script[index].who].cn+'啦，念出新的一句。')}
 function tick(now){const s=session;if(!s||s.finishing)return;
  if(s.rec.state==='recording'&&now>s.ignoreUntil){s.analyser.getFloatTimeDomainData(s.samples);let power=0;for(const n of s.samples)power+=n*n;const rms=Math.sqrt(power/s.samples.length),delta=Math.min(120,now-s.last);s.last=now;
   const audible=rms>.018;s.speaking=audible;if(audible){s.voiceMs+=delta;s.silentMs=0}else if(s.voiceMs>=350)s.silentMs+=delta;
   if(el('theaterMeter'))el('theaterMeter').value=Math.min(1,rms*9);
   if(s.auto&&s.voiceMs>=350&&s.silentMs>=SILENCE_MS&&now-s.lineStarted>1700)advance();
  }else{s.last=now;s.speaking=false}
  if(session===s&&!s.finishing){if(now-s.painted>66){paint(demoSpeaking||s.speaking,(now-s.started)/1000);s.painted=now}frame=requestAnimationFrame(tick)}
 }
 async function start(){
  if(pending||session||document.hidden||!el('kidRest').hidden)return;
  if(!el('theaterConsent').checked){note('请家长先阅读并勾选本次同意。');return}
  if(!supported()){note('请使用支持视频录制的新版 Safari / Chrome。');return}
  if(!StoryPicture.ready()){note('请等待角色图片加载完成后再开始；加载失败可刷新重试。');return}
  if(result&&!downloaded&&!confirm('上一段视频尚未确认保存。重新录制会替换它，确定吗？'))return;
  clearDemo();el('theaterPlayback')?.pause();pending=true;const token=++epoch;ui();note('请允许麦克风。只收集声音，不打开摄像头。');let input,ctx,video,s;
  try{
   ctx=new AudioContext();pendingContext=ctx;await ctx.resume();if(token!==epoch){await ctx.close();return}input=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
   if(token!==epoch||StoryChild.screen!=='retell'||document.hidden||!el('theaterCanvas')){input.getTracks().forEach(t=>t.stop());await ctx.close();return}
   video=el('theaterCanvas').captureStream(15);const movie=new MediaStream([...video.getVideoTracks(),...input.getAudioTracks()]);
   const mime=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)throw Error('No video encoder');
   const rec=new MediaRecorder(movie,{mimeType:mime,videoBitsPerSecond:1500000,audioBitsPerSecond:96000}),analyser=ctx.createAnalyser();analyser.fftSize=2048;ctx.createMediaStreamSource(input).connect(analyser);
   s={rec,input,video,ctx,analyser,samples:new Float32Array(analyser.fftSize),started:performance.now(),auto:el('theaterAuto').checked,completed:0,complete:false,painted:0,finishing:false,chunks:[],title:story.cn,id:story.id,total:story.script.length};session=s;pending=false;pendingContext=null;index=0;line();s.poster=el('theaterCanvas').toDataURL('image/webp',.75);resetVad(s);
   rec.ondataavailable=e=>{if(e.data.size)s.chunks.push(e.data)};
   rec.onstop=()=>{const blob=new Blob(s.chunks,{type:rec.mimeType||mime});dispose(s);if(blob.size){if(resultUrl)URL.revokeObjectURL(resultUrl);result={blob,mime:blob.type,title:s.title,id:s.id,total:s.total,lines:s.completed,complete:s.complete,poster:s.poster};resultUrl=URL.createObjectURL(blob);downloaded=false;showResult();note(s.message||'已保留练习片段，回放后保存。')}else note('没有录到视频文件，请重新尝试。')};
   rec.onerror=()=>{finish('录制出现错误。请检查练习片段是否可播放，再决定是否重录。')};rec.start(250);s.timer=setInterval(()=>{ui();if(performance.now()-s.started>=MAX_MS)finish('3分钟到了，先休息。已保留当前练习片段。')},200);frame=requestAnimationFrame(tick);ui();note('正在配音！看角色，念一句，停顿后换幕。也可以点“这句念好了”。');
   el('theaterResult').hidden=true;el('theaterCanvas').scrollIntoView({block:'start',behavior:'auto'});
  }catch(_){input?.getTracks().forEach(t=>t.stop());video?.getTracks().forEach(t=>t.stop());ctx?.close().catch(()=>{});if(pendingContext===ctx)pendingContext=null;if(session===s)session=null;if(token!==epoch)return;pending=false;ui();note('未能开启视频录制。请检查麦克风权限或使用新版 Safari / Chrome；也可以选择下方仅录音的自由讲述。')}
 }
 function pause(){const s=session;if(!s||s.finishing)return;clearDemo();if(s.rec.state==='recording'){s.rec.pause();s.input.getAudioTracks().forEach(t=>t.enabled=false);note('配音已暂停，麦克风静音。准备好了再继续。')}else{s.input.getAudioTracks().forEach(t=>t.enabled=true);s.rec.resume();resetVad(s);note('继续配音。念完再停顿。')}ui()}
 function demo(){
  if(pending||session?.finishing)return;clearDemo();el('theaterPlayback')?.pause();const token=demoEpoch,l=story.script[index];const s=session,resume=!!s&&s.rec.state==='recording';
  if(resume){s.rec.pause();s.input.getAudioTracks().forEach(t=>t.enabled=false);ui()}
  demoActive=true;ui();note('正在听示范，录制已暂停，麦克风静音。听完再轮到你。');
  const ended=()=>{if(token!==demoEpoch)return;clearTimeout(demoTimer);demoAudio?.pause();demoAudio=null;demoActive=false;setDemoSpeaking(false);if(resume&&session===s&&!s.finishing){s.input.getAudioTracks().forEach(t=>t.enabled=true);s.rec.resume();resetVad(s)}ui();note('轮到你说啦！')};
  demoTimer=setTimeout(()=>{try{speechSynthesis.cancel()}catch(_){}ended();note('示范已停止，可以再听一次或继续配音。')},25000);
  if(story.original){const a=new Audio(`assets/story-v2/voice/fly-${String(index+1).padStart(2,'0')}.mp3`);demoAudio=a;a.onplaying=()=>{if(token===demoEpoch)setDemoSpeaking(true)};a.onwaiting=()=>{if(token===demoEpoch)setDemoSpeaking(false)};a.onended=ended;a.onerror=()=>{ended();note('示范音频没有加载成功，请联网后重试或请家长陪读。')};a.play().catch(a.onerror)}
  else{const voices=window.speechSynthesis?.getVoices()?.filter(v=>/^en(?:[-_]|$)/i.test(v.lang))||[];if(!voices.length){ended();note('设备没有英语语音，请开启英语语音或请家长示范。');return}const u=new SpeechSynthesisUtterance(l.en);u.lang=voices[0].lang;u.voice=voices.find(v=>v.localService)||voices[0];u.rate=.85;u.pitch=1;u.onstart=()=>{if(token===demoEpoch)setDemoSpeaking(true)};u.onend=ended;u.onerror=ended;try{speechSynthesis.speak(u)}catch(_){ended()}}
 }
 async function download(){if(!result||!resultUrl)return;el('theaterPlayback')?.pause();const ext=result.mime.includes('mp4')?'mp4':'webm',name=`my-dialogue-${result.id}.${ext}`,file=new File([result.blob],name,{type:result.mime});
  try{if(/iPad|iPhone|iPod/.test(navigator.userAgent)&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'我的英语配音小电影'});downloaded=true;note('已打开系统保存/分享，请确认保存位置。');return}}catch(e){if(e.name==='AbortError'){note('已取消保存，视频仍在此页面。');return}}
  const a=document.createElement('a');a.href=resultUrl;a.download=name;downloaded=true;a.click();note('已请求下载，请在浏览器下载列表确认。刷新前检查视频已保存。');
 }
 document.getElementById('app').addEventListener('click',e=>{const b=e.target.closest('[data-theater]');if(!b||b.disabled||!el('kidRest').hidden)return;switch(b.dataset.theater){case'start':start();break;case'next':advance();break;case'stop':finish();break;case'pause':pause();break;case'demo':demo();break;case'download':download();break;case'discard':if(confirm('删除这段视频？删除后无法恢复。')){el('theaterPlayback')?.pause();URL.revokeObjectURL(resultUrl);result=null;resultUrl=null;el('theaterResult').hidden=true;note('本次视频已删除。')}break;case'fullscreen':if(el('theaterCanvas').requestFullscreen)el('theaterCanvas').requestFullscreen().catch(()=>note('可以将手机横过来，放大16:9画面。'));else note('请将手机横过来，放大16:9画面。');break}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)halt('切换页面已结束录制，练习片段已保留。')});window.addEventListener('pagehide',()=>halt());
 window.addEventListener('beforeunload',e=>{if(session||pending||(result&&!downloaded)){e.preventDefault();e.returnValue=''}});
 window.StoryTheater={mount,halt,get active(){return !!session},get pending(){return pending},get index(){return index},get result(){return result?{mime:result.mime,size:result.blob.size,lines:result.lines,complete:result.complete}:null}};
})();
