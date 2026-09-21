"""Behavior tests with mocked speech/media, not pronunciation certification."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SMOKE_URL','http://127.0.0.1:4210/english-story.html')
CHROME=Path(os.path.expandvars(r'%LOCALAPPDATA%\ms-playwright\chromium-1223\chrome-win64\chrome.exe'))
MOCK="""
window.spoken=[];window.mockVoices=[{name:'Test English',lang:'en-US',localService:true}];
Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>mockVoices,cancel(){},speak(u){spoken.push(u);window.lastUtterance=u;u.onstart?.()}}});
window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
window.mediaCalls=[];window.tracksStopped=0;
navigator.mediaDevices.getUserMedia=async options=>{mediaCalls.push(options);return{getTracks:()=>[{stop:()=>tracksStopped++}]}};
window.MediaRecorder=class{static isTypeSupported(t){return t==='audio/mp4'}constructor(stream,opts){this.mimeType=opts?.mimeType||'audio/mp4';this.state='inactive'}start(){this.state='recording'}stop(){this.state='inactive';setTimeout(()=>{this.ondataavailable?.({data:new Blob(['test audio'],{type:this.mimeType})});this.onstop?.()},0)}};
"""
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=str(CHROME),args=['--no-proxy-server'])
    ctx=b.new_context(accept_downloads=True);ctx.add_init_script(MOCK)
    page=ctx.new_page();page.set_default_timeout(10000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE,wait_until='networkidle');page.wait_for_function('window.StoryChild')
    assert page.locator('.kid-book').count()==6
    assert page.evaluate('spoken.length')==0
    print('Ready: shelf',flush=True)
    def action(name):
        page.locator('[data-action="'+name+'"]').filter(visible=True).first.click()
    action('open');assert page.locator('.kid-translation').is_hidden()
    action('listen');assert page.evaluate('lastUtterance.text')=='Let us play catch!'
    page.evaluate('window.old=lastUtterance');action('next');page.evaluate('old.onend()')
    assert page.evaluate("StoryChild.progress.books['can-i-play-too'].heard.length")==0
    action('listen');page.evaluate('lastUtterance.onend()')
    assert page.evaluate("StoryChild.progress.books['can-i-play-too'].heard.length")==1
    action('translate');assert page.locator('.kid-translation').is_visible()
    n=page.evaluate('spoken.length');action('translate');assert page.evaluate('spoken.length')==n
    action('auto');action('auto');n=page.evaluate('state.lineIndex');page.evaluate('lastUtterance.onend()');page.wait_for_timeout(800);assert page.evaluate('state.lineIndex')==n
    action('listen');page.evaluate('lastUtterance.onerror()');assert '没有播放成功' in page.locator('#kidStatus').inner_text()
    page.evaluate('mockVoices=[]');action('listen');assert '没有可用' in page.locator('#kidStatus').inner_text();page.evaluate("mockVoices=[{lang:'en-US',localService:true}]")
    action('shelf');action('open');assert page.evaluate('state.lineIndex')==1
    page.reload(wait_until='networkidle');action('open');assert page.evaluate('state.lineIndex')==1
    print('PASS audio lifecycle and resume',flush=True)
    action('quiz');action('question');assert 'Who wants' in page.evaluate('lastUtterance.text')
    page.locator('[data-action="option"][data-index="1"]').click();assert page.evaluate('lastUtterance.text')=='Snake'
    for _ in range(3):page.locator('[data-action="answer"][data-index="0"]').click()
    assert page.locator('[data-action="answer"]').first.is_disabled()
    action('hint');assert page.evaluate('state.lineIndex')==4
    # Full listening is based on completed utterances, not clicking next.
    page.evaluate("state.lineIndex=0;playLine(0)")
    for i in range(21):
        page.evaluate('(i)=>playLine(i)',i);page.evaluate('lastUtterance.onend()')
    page.wait_for_timeout(8200);action('quiz');page.locator('[data-action="answer"][data-index="1"]').click()
    assert page.evaluate("StoryChild.progress.books['can-i-play-too'].complete")
    print('PASS quiz and listening completion',flush=True)
    action('retell');action('record');assert page.evaluate('mediaCalls.length')==0
    page.locator('#kidConsent').check();action('record');page.wait_for_function('mediaCalls.length===1');assert page.evaluate('mediaCalls[0].video') is False
    action('stoprecord');page.wait_for_selector('#kidDownload:visible');assert page.evaluate('tracksStopped')==1
    assert '不作自动评分' in page.locator('#kidRecordStatus').inner_text()
    with page.expect_download() as info:action('download')
    assert info.value.suggested_filename.endswith('.m4a')
    action('discard');assert page.locator('#kidPlayback').is_hidden()
    page.locator('#kidConsent').check();page.evaluate('navigator.mediaDevices.getUserMedia=()=>new Promise(r=>window.lateMic=r);void 0');action('record');action('stoprecord')
    page.evaluate('lateMic({getTracks:()=>[{stop:()=>tracksStopped++}]})');page.wait_for_function('tracksStopped===2')
    assert page.locator('#kidRecord').is_enabled()
    print('PASS recording lifecycle',flush=True)
    # Shapes, navigation and text wrapping, including every page of all stories.
    Path('.visual-story').mkdir(exist_ok=True)
    for w,h in [(320,740),(375,812),(390,844),(768,1024),(844,390),(1024,768),(1440,900)]:
        page.set_viewport_size({'width':w,'height':h});page.locator('#kidBack').click()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        if w in [390,1440]:page.screenshot(path=f'.visual-story/shelf-{w}.png',full_page=True)
        for i in range(6):
            page.locator('.kid-book').nth(i).click()
            length=page.evaluate('state.story.script.length')
            for line in range(length):
                page.evaluate('(i)=>{state.lineIndex=i;renderStage()}',line)
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(w,i,line)
            for button in page.locator('.kid-controls button').all():
                box=button.bounding_box();assert box['width']>=48 and box['height']>=48
            if i==0 and w in [390,1440]:page.screenshot(path=f'.visual-story/reader-{w}.png',full_page=True)
            action('shelf')
        action('open')
    assert not errors,errors
    print('PASS 6 books/all sentences at 7 viewport sizes, speech stop/error/no voice, translation, resume, real completion, quiz intervention, mic consent/cancel, download MIME, no page errors')
    b.close()
