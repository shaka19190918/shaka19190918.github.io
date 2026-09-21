"""Local controlled baseline/new comparison; not real device certification."""
import os,json,statistics
from pathlib import Path
from playwright.sync_api import sync_playwright
CHROME=Path(os.path.expandvars(r'%LOCALAPPDATA%\ms-playwright\chromium-1223\chrome-win64\chrome.exe'))
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=str(CHROME),args=['--no-proxy-server'])
    results={}
    for label,path,selector in [('before','.visual-story/baseline.html','.story-btn'),('after','english-story.html','.kid-book')]:
        rows=[]
        for run in range(3):
            ctx=b.new_context(viewport={'width':390,'height':844});page=ctx.new_page()
            c=ctx.new_cdp_session(page);c.send('Network.enable');c.send('Network.emulateNetworkConditions',{'offline':False,'latency':150,'downloadThroughput':200000,'uploadThroughput':100000});c.send('Emulation.setCPUThrottlingRate',{'rate':4})
            page.goto('http://127.0.0.1:4210/'+path,wait_until='domcontentloaded');page.wait_for_selector(selector)
            ready=page.evaluate('performance.now()');page.wait_for_load_state('networkidle')
            rows.append({'readyMs':round(ready),'fcpMs':page.evaluate("performance.getEntriesByName('first-contentful-paint')[0]?.startTime"),'documentAndResources':page.evaluate("performance.getEntriesByType('navigation')[0].transferSize+performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0)")})
            if run==0 and label=='before':
                page.screenshot(path='.visual-story/before-shelf.png',full_page=True);page.locator(selector).first.click();page.screenshot(path='.visual-story/before-reader.png',full_page=True)
            ctx.close()
        results[label]=rows
    Path('.visual-story/metrics.json').write_text(json.dumps(results,indent=2),encoding='utf8')
    print(json.dumps(results));b.close()
