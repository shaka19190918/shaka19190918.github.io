"""Fresh-cache first shelf and complete character art under simulated mobile 4G.
This is an engineering measurement, not a promise of every user's network speed.
"""
import os,json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SMOKE_URL','http://127.0.0.1:4210/english-story.html')
CHROME=Path(os.path.expandvars(r'%LOCALAPPDATA%\ms-playwright\chromium-1223\chrome-win64\chrome.exe'))
results=[]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=str(CHROME),args=['--no-proxy-server'])
    for _ in range(3):
        ctx=b.new_context(viewport={'width':390,'height':844});page=ctx.new_page();cdp=ctx.new_cdp_session(page)
        cdp.send('Network.enable');cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
        cdp.send('Network.emulateNetworkConditions',{'offline':False,'downloadThroughput':200000,'uploadThroughput':100000,'latency':150})
        cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
        page.goto(BASE,wait_until='domcontentloaded');page.wait_for_selector('.kid-book')
        interactive=page.evaluate('Math.round(performance.now())');page.wait_for_function('StoryPicture.ready()')
        painted=page.evaluate('Math.round(performance.now())')
        requests=page.evaluate('performance.getEntriesByType("resource").map(r=>({name:r.name,size:r.transferSize}))')
        assert not any('.mp3' in x['name'] or 'characters.png' in x['name'] for x in requests)
        assert sum('characters.webp' in x['name'] for x in requests)<=1
        results.append({'shelf_ms':interactive,'characters_ms':painted,'resources_bytes':sum(x['size'] for x in requests)})
        ctx.close()
    b.close()
print(json.dumps(results))
