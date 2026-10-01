# Story theater assets — 2026-10-01

## Source boundary

Publisher reference: https://books.disney.com/book/today-i-will-fly/
The publisher identifies *Today I Will Fly!* by Mo Willems as an Elephant & Piggie book.
We reference its theme of trying with a friend, not its full text, page scans,
illustrations, narration, logos, or character designs.

New story: **Today I Want to Fly! / 今天我想飞！** — an original 15-line
dialogue about folding, testing and improving a paper plane, with 5 scenes.
Original identities: Pip / 小猪豆豆 (yellow overalls) and Ellie / 小象乐乐
(mint vest, no glasses). Existing 6 user-provided adapted exercises remain;
replacing their pictures does not establish rights to commercially distribute
their adaptations. They are not presented as original publisher editions.

## Art

Created with built-in `imagegen`, not downloaded book art.

- Source: `assets/story-v2/characters.png`, 1774×887 RGBA, 1,469,461 bytes.
- Optimized atlas: `assets/story-v2/characters.webp`, 233,074 bytes.
- Four equal columns, two rows: neutral / speaking / surprised / celebrating.
- Row 1 pig, row 2 elephant. CSS and canvas use the same file and pose mapping.
- Original preserved; the page requests WebP only. No separate scene downloads.

Generation prompt:

> Use case: illustration-story. Create one production-ready transparent PNG sprite atlas for a children's English story web app. Exactly 4 columns by 2 rows, each cell same size, spacious clean margins, no gridlines, no text, no watermarks, no floor/background. Entire full body of one character centered in each cell, never crossing cell edges. Row 1: the SAME original cheerful little pink pig in soft yellow overalls and a tiny teal neckerchief, round plush-like body, small rounded ears, expressive dark eyes; columns: smiling neutral, speaking with one hand open, gently surprised, delighted both arms open. Row 2: the SAME original baby blue-gray elephant in a mint-green vest with one simple round yellow button, floppy ears, a curved short trunk and friendly expressive eyes, NO eyeglasses; columns: smiling neutral, speaking with one hand open, gently surprised, delighted both arms open. These are original identities, do not imitate Mo Willems's Elephant & Piggie drawings or recognizable character designs. Style: premium charming 2.5D picture-book clay/plush illustration, soft matte texture, beautifully rounded silhouettes, warm cheerful pastel colors, readable at mobile sizes, consistent soft light and consistent proportions across all 8 poses. No scary expressions, no extra characters or props. Format wide 2:1, ideally 2048x1024, 4x2 equally spaced cells and true alpha transparency.

Compression: `baoyu-compress-image`, Sharp, WebP quality 82, 84% reduction.
Canvas backgrounds and props are original vector rendering, not publisher scans.

## Voice

15 local MP3 files, 345,024 bytes total, generated from the new original dialogue
using edge-tts: `en-US-GuyNeural` for Pip and `en-US-EricNeural` for Ellie,
rate -15%. Build tool: `python tools/story_voice.py`. This is synthetic speech,
not a child actor, publisher recording, or pronunciation certification.
No child recording is input to the generator. Existing 6 exercises use device
English speech; absent English voice gives a parent-help message.

## Movie privacy / format

Canvas 1280×720, 15 fps + microphone audio through MediaRecorder. MP4 if the
browser supports it; otherwise WebM with the correct extension. No transcoding
server, camera, upload endpoint, or cloud speech recognizer.

Voice activity: RMS > 0.018 for at least 350ms, followed by 1200ms silence,
with a minimum 1700ms dwell. This does NOT verify words, sentence completeness
or pronunciation. No language score or reward is granted for recording.
Automatic mode can be disabled; manual completion supports noisy environments.
Examples pause the recorder and mute the microphone, then resume. Time cap 3min
including pauses; visibility change ends capture. Results exist in memory until
download, deliberate replacement/deletion or page reload. MP4/WebM playback and
system sharing support still vary by device; unsupported browsers offer audio-only
free retelling and explicit instructions, not a falsely renamed video file.
