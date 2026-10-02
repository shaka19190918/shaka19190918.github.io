"""Character/line mapping, real frame changes, playback and recording lifecycle.
Synthetic mic/TTS events validate UI behavior, not pronunciation accuracy.
"""
import ast,os,subprocess
from pathlib import Path
import imageio_ffmpeg
from PIL import Image,ImageChops
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SMOKE_URL','http://127.0.0.1:4210/english-story.html')
CHROME=Path(os.path.expandvars(r'%LOCALAPPDATA%\ms-playwright\chromium-1223\chrome-win64\chrome.exe'))
tree=ast.parse(Path('tools/story_theater_acceptance.py').read_text('utf8'))
VOICE=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='VOICE' for t in n.targets))
def act(page,name):page.locator('[data-action="'+name+'"]').filter(visible=True).first.click()
def theater(page,name):page.locator('[data-theater="'+name+'"]').click()
def frame(page,target):return page.evaluate('(id)=>StoryPicture.inspect(document.querySelector(id))',target)
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=str(CHROME),args=['--no-proxy-server'])
    ctx=b.new_context(accept_downloads=True);ctx.add_init_script(VOICE)
    page=ctx.new_page();page.set_default_navigation_timeout(45000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE,wait_until='networkidle');page.wait_for_function('StoryPicture.ready()')
    page.locator('.kid-book[data-id="can-i-play-too"]').click()
    act(page,'listen');page.wait_for_function('StoryPicture.inspect(document.querySelector("#stage canvas")).speaking')
    f=frame(page,'#stage canvas');assert f['speaker']=='gerald' and f['bubble']['slot']=='r' and f['animatedRoles']==['gerald']
    page.evaluate('lastUtterance.onend()');page.wait_for_function('!StoryPicture.inspect(document.querySelector("#stage canvas")).speaking')
    act(page,'next');act(page,'listen');page.wait_for_function('StoryPicture.inspect(document.querySelector("#stage canvas")).speaking')
    assert frame(page,'#stage canvas')['speaker']=='piggie' and frame(page,'#stage canvas')['bubble']['slot']=='l'
    page.evaluate('window.stale=lastUtterance');act(page,'next');page.evaluate('stale.onstart();stale.onend()')
    assert not frame(page,'#stage canvas')['speaking']
    act(page,'retell');theater(page,'demo');page.wait_for_function('StoryPicture.inspect(document.querySelector("#theaterCanvas")).speaking')
    page.evaluate('lastUtterance.onend()');page.wait_for_function('!StoryPicture.inspect(document.querySelector("#theaterCanvas")).speaking')
    print('PASS reader & theater demo speaking starts/stops; left/right roles; stale callbacks ignored',flush=True)
    # Scan every sentence: bubble contains EXACT current English, fits stage and doesn't cover heads.
    count=page.evaluate('''()=>{const c=document.createElement('canvas');c.width=1280;c.height=720;let count=0;for(const s of STORIES)for(let i=0;i<s.script.length;i++){StoryPicture.draw(c.getContext('2d'),s,i);const f=StoryPicture.inspect(c),b=f.bubble;if(f.text!==s.script[i].en||f.speaker!==s.script[i].who||b.x<0||b.x+b.width>1280||b.y+b.height>308||b.font<34)throw Error(s.id+':'+i);count++}return count}''')
    assert count==106
    # Pixel evidence: speaking character moves, idle partner stays still.
    page.evaluate('''()=>{window.c=document.createElement('canvas');c.width=1280;c.height=720;window.s=STORIES.find(s=>s.original);StoryPicture.draw(c.getContext('2d'),s,0,{speaking:true,t:.1});window.left=c.getContext('2d').getImageData(100,320,420,390).data.slice();window.right=c.getContext('2d').getImageData(780,320,450,390).data.slice();StoryPicture.draw(c.getContext('2d'),s,0,{speaking:true,t:.4});window.left2=c.getContext('2d').getImageData(100,320,420,390).data;window.right2=c.getContext('2d').getImageData(780,320,450,390).data;}''')
    assert page.evaluate('left.reduce((sum,v,i)=>sum+Math.abs(v-left2[i]),0)/left.length>1')
    # Allow tiny GPU filtering/edge differences, without a change of idle pose.
    assert page.evaluate('right.reduce((sum,v,i)=>sum+Math.abs(v-right2[i]),0)/right.length<.5')
    print('PASS 106 exact role bubbles within bounds; speaking pose pixel changes only correct character',flush=True)
    act(page,'reader');act(page,'shelf');page.locator('.kid-book[data-id="today-i-want-to-fly"]').click()
    # Actual local MP3 playback, not synthetic speech, also starts/stops reader motion.
    act(page,'listen');page.wait_for_function('StoryPicture.inspect(document.querySelector("#stage canvas")).speaking')
    page.wait_for_function('!StoryPicture.inspect(document.querySelector("#stage canvas")).speaking')
    act(page,'retell');theater(page,'demo');page.wait_for_function('StoryPicture.inspect(document.querySelector("#theaterCanvas")).speaking')
    page.wait_for_function('!StoryPicture.inspect(document.querySelector("#theaterCanvas")).speaking')
    page.locator('#theaterConsent').check();theater(page,'start');page.wait_for_function('StoryTheater.active')
    page.wait_for_timeout(700);page.evaluate('micGain.gain.value=.08');page.wait_for_function('StoryPicture.inspect(document.querySelector("#theaterCanvas")).speaking')
    assert frame(page,'#theaterCanvas')['animatedRoles']==['piggie']
    page.wait_for_timeout(700);page.evaluate('micGain.gain.value=0');page.wait_for_function('StoryTheater.index===1')
    assert frame(page,'#theaterCanvas')['bubble']['slot']=='r'
    page.wait_for_timeout(600);page.evaluate('micGain.gain.value=.08');page.wait_for_function('StoryPicture.inspect(document.querySelector("#theaterCanvas")).speaking')
    assert frame(page,'#theaterCanvas')['animatedRoles']==['gerald']
    page.wait_for_timeout(650)
    theater(page,'pause');page.wait_for_function('!StoryPicture.inspect(document.querySelector("#theaterCanvas")).speaking')
    theater(page,'stop');page.wait_for_selector('#theaterPlayback')
    Path('.visual-story').mkdir(exist_ok=True)
    with page.expect_download() as d:theater(page,'download')
    path=Path('.visual-story')/('bubble-'+d.value.suggested_filename);d.value.save_as(path)
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    for label,second in [('first',1.0),('second',3.5)]:
        target=Path('.visual-story')/('bubble-video-'+label+'.png')
        subprocess.run([ffmpeg,'-v','error','-y','-ss',str(second),'-i',str(path),'-frames:v','1',str(target)],check=True)
        assert Image.open(target).size==(1280,720)
    assert ImageChops.difference(Image.open('.visual-story/bubble-video-first.png').crop((30,110,1248,288)),Image.open('.visual-story/bubble-video-second.png').crop((30,110,1248,288))).getbbox()
    print('PASS real local audio and mic animation; exported video has changing role bubbles',flush=True)
    for w,h in [(320,740),(375,812),(390,844),(768,1024),(844,390),(1024,768),(1440,900)]:
        page.set_viewport_size({'width':w,'height':h})
        page.locator('#theaterCanvas').screenshot(path=f'.visual-story/bubble-{w}.png')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    assert not errors,errors
    b.close()
    # Reduced motion preserves the speaking cue, but produces identical frames.
    quiet=p.chromium.launch(headless=True,executable_path=str(CHROME),args=['--no-proxy-server'])
    ctx=quiet.new_context(reduced_motion='reduce');page=ctx.new_page();page.goto(BASE,wait_until='networkidle');page.wait_for_function('StoryPicture.ready()')
    assert page.evaluate('''()=>{const c=document.createElement('canvas');c.width=1280;c.height=720;const s=STORIES.find(s=>s.original);StoryPicture.draw(c.getContext('2d'),s,0,{speaking:true,t:.1});const a=c.toDataURL();StoryPicture.draw(c.getContext('2d'),s,0,{speaking:true,t:.4});return a===c.toDataURL()}''')
    quiet.close()
    print('PASS 7 sizes, no overflow; reduced-motion setting respected')
