"""Build local synthetic English demo audio for our ORIGINAL script only.
Requires edge-tts; no children recordings are sent to this generator/service.
Run from repository root. Does not download any publisher narration.
"""
import asyncio,json,subprocess
from pathlib import Path
import edge_tts

js="""const fs=require('fs'),vm=require('vm');const c={Image:class{},window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('story-data.js','utf8'),c);vm.runInContext(fs.readFileSync('story-picture.js','utf8'),c);console.log(JSON.stringify(c.STORIES.find(s=>s.original).script));"""
lines=json.loads(subprocess.check_output(['node','-e',js],text=True,encoding='utf8'))
folder=Path('assets/story-v2/voice');folder.mkdir(parents=True,exist_ok=True)
async def build():
    for i,line in enumerate(lines,1):
        output=folder/f'fly-{i:02}.mp3'
        if output.exists() and output.stat().st_size>1000:continue
        voice='en-US-GuyNeural' if line['who']=='piggie' else 'en-US-EricNeural'
        for attempt in range(3):
            try:
                await edge_tts.Communicate(line['en'],voice,rate='-15%').save(str(output))
                print(f'Generated original line {i}/{len(lines)}',flush=True)
                break
            except Exception:
                if attempt==2:raise
                await asyncio.sleep(2)
asyncio.run(build())
