"""Visibility, rest, privacy fallback, and storage failures."""
import ast,os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SMOKE_URL','http://127.0.0.1:4210/english-story.html')
CHROME=Path(os.path.expandvars(r'%LOCALAPPDATA%\ms-playwright\chromium-1223\chrome-win64\chrome.exe'))
tree=ast.parse(Path('tools/story_acceptance.py').read_text('utf8'))
MOCK=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='MOCK' for t in n.targets))
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=str(CHROME),args=['--no-proxy-server'])
    ctx=b.new_context();ctx.add_init_script(MOCK);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.clock.install();page.goto(BASE,wait_until='networkidle');page.locator('[data-action="open"]').first.click()
    assert page.locator('#kidRate').input_value()=='0.85'
    page.locator('[data-action="retell"]').click();page.locator('#kidConsent').check()
    page.evaluate("navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('denied','NotAllowedError')};void 0")
    page.locator('[data-action="record"]').click();page.wait_for_function("document.querySelector('#kidRecordStatus').textContent.includes('未能开启')")
    assert page.locator('#kidRecord').is_enabled()
    page.evaluate("navigator.mediaDevices.getUserMedia=async()=>({getTracks:()=>[{stop:()=>tracksStopped++}]});void 0")
    page.locator('[data-action="record"]').click();page.wait_for_function("document.querySelector('#kidRecord').disabled")
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_function('tracksStopped===1');assert page.locator('#kidRecord').is_enabled()
    page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")
    page.locator('[data-action="reader"]').click()
    page.clock.run_for(601000)
    assert page.locator('#kidRest').is_visible()
    assert page.locator('#kidRestContinue').is_disabled()
    page.clock.run_for(61000);assert page.locator('#kidRestContinue').is_enabled()
    page.locator('#kidRestContinue').click();assert page.locator('#kidRest').is_hidden()
    assert not errors,errors
    ctx.close()
    broken=b.new_context();broken.add_init_script("Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('quota')}")
    fallback=broken.new_page();fallback.goto(BASE,wait_until='networkidle');fallback.locator('[data-action="open"]').first.click()
    assert fallback.locator('.kid-sentence').is_visible()
    print('PASS selected speed, permission denial, visibility releases mic, 10-minute rest + 60-second return, storage unavailable fallback')
    b.close()
