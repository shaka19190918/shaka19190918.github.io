"""Real canvas + MediaRecorder + synthetic local mic, not pronunciation testing.
Checks encoded video/audio, VAD transitions, pause, permission lifecycle & layouts.
"""
import os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
import imageio_ffmpeg
BASE=os.environ.get('SMOKE_URL','http://127.0.0.1:4210/english-story.html')
CHROME=Path(os.path.expandvars(r'%LOCALAPPDATA%\ms-playwright\chromium-1223\chrome-win64\chrome.exe'))
VOICE="""
window.spoken=[];window.mockVoices=[{name:'English',lang:'en-US',localService:true}];
Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>mockVoices,cancel(){},speak(u){spoken.push(u);window.lastUtterance=u;u.onstart?.()}}});
window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
window.micCalls=0;window.tracksStopped=0;
window.fakeMic=async options=>{
 window.micCalls++;window.micOptions=options;window.fakeContext=new AudioContext();
 await fakeContext.resume();const o=fakeContext.createOscillator();window.micGain=fakeContext.createGain();
 micGain.gain.value=0;o.frequency.value=220;const d=fakeContext.createMediaStreamDestination();
 o.connect(micGain).connect(d);o.start();d.stream.getTracks().forEach(t=>{const stop=t.stop.bind(t);t.stop=()=>{tracksStopped++;stop();o.stop();fakeContext.close()}});
 return d.stream;
};navigator.mediaDevices.getUserMedia=fakeMic;
"""
def act(page,a):page.locator('[data-action="'+a+'"]').filter(visible=True).first.click()
def theater(page,a):page.locator('[data-theater="'+a+'"]').click()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=str(CHROME),args=['--no-proxy-server'])
    ctx=browser.new_context(accept_downloads=True);ctx.add_init_script(VOICE)
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE,wait_until='networkidle');assert page.locator('.kid-book').count()==7
    assert page.locator('.kid-book').first.get_attribute('data-id')=='today-i-want-to-fly'
    act(page,'open');act(page,'retell');page.wait_for_function('StoryPicture.ready()')
    theater(page,'start');assert page.evaluate('micCalls')==0
    page.locator('#theaterConsent').check();theater(page,'start')
    page.wait_for_function('StoryTheater.active');assert page.evaluate('micOptions.video') is False
    page.wait_for_timeout(2200);assert page.evaluate('StoryTheater.index')==0
    # Real audio energy causes one transition, sustained silence cannot skip another.
    page.evaluate('micGain.gain.value=.08');page.wait_for_timeout(700);page.evaluate('micGain.gain.value=0')
    page.wait_for_function('StoryTheater.index===1');page.wait_for_timeout(2200);assert page.evaluate('StoryTheater.index')==1
    assert 'Let us make' in page.locator('#theaterLine').inner_text()
    theater(page,'pause');page.evaluate('micGain.gain.value=.08');page.wait_for_timeout(2000)
    assert page.evaluate('StoryTheater.index')==1
    theater(page,'pause');page.evaluate('micGain.gain.value=0');page.wait_for_timeout(700)
    theater(page,'stop');page.wait_for_selector('#theaterPlayback');assert page.evaluate('StoryTheater.result.size')>1000
    assert page.evaluate('tracksStopped')==1
    with page.expect_download() as info:theater(page,'download')
    download=info.value;path=Path('.visual-story')/download.suggested_filename;path.parent.mkdir(exist_ok=True);download.save_as(path)
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    probe=subprocess.run([ffmpeg,'-hide_banner','-i',str(path),'-f','null','-'],capture_output=True,text=True)
    assert probe.returncode==0,probe.stderr
    assert '1280x720' in probe.stderr and 'Audio:' in probe.stderr and 'Video:' in probe.stderr,probe.stderr
    print('PASS real 1280x720 encoded video + audio, VAD/silence/pause and MIME download',flush=True)
    # All sentence transitions and natural last-line completion with real recorder.
    theater(page,'start');page.wait_for_function('StoryTheater.active')
    for i in range(15):
        page.wait_for_timeout(600);page.evaluate('micGain.gain.value=.08');page.wait_for_timeout(600);page.evaluate('micGain.gain.value=0')
        if i<14:page.wait_for_function(f'StoryTheater.index==={i+1}')
    page.wait_for_function('StoryTheater.result.complete && !StoryTheater.active')
    assert page.evaluate('StoryTheater.result.lines')==15;assert page.evaluate('tracksStopped')==2
    print('Checking full movie download',flush=True)
    with page.expect_download() as info:theater(page,'download')
    info.value.save_as('.visual-story/full-story.'+info.value.suggested_filename.split('.')[-1])
    print('Checking pending cancellation',flush=True)
    print('PASS full 15-line automatic movie completion',flush=True)
    # Navigation while mic permission is unresolved must cancel/release late input.
    page.evaluate('navigator.mediaDevices.getUserMedia=()=>new Promise(r=>window.lateMic=r);void 0')
    theater(page,'start');page.wait_for_function('StoryTheater.pending && !!window.lateMic');act(page,'reader')
    page.evaluate('lateMic({getTracks:()=>[{stop(){window.lateStopped=true}}]})');page.wait_for_function('window.lateStopped')
    assert not page.evaluate('StoryTheater.active || StoryTheater.pending')
    act(page,'retell');page.locator('#theaterConsent').check();page.evaluate('navigator.mediaDevices.getUserMedia=fakeMic;void 0');theater(page,'start');page.wait_for_function('StoryTheater.active')
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_function('!StoryTheater.active');assert page.evaluate('tracksStopped')==3
    page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")
    print('PASS pending cancellation, late stream cleanup, visibility mic release',flush=True)
    # Responsive views and all seven story frames.
    for w,h in [(320,740),(375,812),(390,844),(768,1024),(844,390),(1024,768),(1440,900)]:
        page.set_viewport_size({'width':w,'height':h})
        if page.evaluate('StoryChild.screen')!='shelf':page.locator('#kidBack').click()
        if w==1440:page.screenshot(path='.visual-story/theater-shelf-desktop.png',full_page=True)
        for i in range(7):
            page.locator('.kid-book').nth(i).click();act(page,'retell')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(w,i)
            size=page.locator('#theaterCanvas').bounding_box();assert abs(size['width']/size['height']-16/9)<.01,(w,i,size)
            for b in page.locator('[data-theater]').all():
                if b.is_visible():box=b.bounding_box();assert box['width']>=48 and box['height']>=48,(w,i,b.inner_text())
            if i==0 and w in [390,1440]:page.screenshot(path=f'.visual-story/theater-{w}.png',full_page=True)
            act(page,'reader');act(page,'shelf')
    assert not errors,errors
    print('PASS all 7 stories / 7 viewports, 16:9 screens, 48px targets, zero page errors',flush=True)
    browser.close()
