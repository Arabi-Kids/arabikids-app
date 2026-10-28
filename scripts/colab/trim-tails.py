# Trim babbling tails: transcribe each clip with Whisper (word timestamps), and when the clip contains
# at least two more words than the expected line, cut right after the expected last word (with a short fade).
# Reads /content/new-clips.json and /content/newc/*.mp3. Writes changed clips to /content/trimmed/ and
# /content/chatterbox-trimmed.zip. No download here.
import json, os, re, shutil, subprocess, zipfile

os.environ["TQDM_DISABLE"] = "1"
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"
subprocess.run("pip -q install faster-whisper", shell=True, capture_output=True)
from faster_whisper import WhisperModel

wm = WhisperModel("small", device="cuda", compute_type="float16")
clips = json.load(open("/content/new-clips.json", encoding="utf8"))
os.makedirs("/content/trimmed", exist_ok=True)


def length(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path], capture_output=True, text=True).stdout
    return float(out)


changed = []
for c in clips:
    src = f"/content/newc/{c['id']}.mp3"
    dst = f"/content/trimmed/{c['id']}.mp3"
    d = length(src)
    expected = [w for w in re.split(r"\s+", re.sub(r"[!?.،؟,]", " ", c["text"]).strip()) if w]
    n = len(expected)
    segs, _ = wm.transcribe(src, language=c["language"], word_timestamps=True, beam_size=1)
    words = [w for s in segs for w in (s.words or [])]
    cut = None
    if len(words) >= n + 2:
        t = words[n - 1].end + 0.25
        if d - t > 0.8:
            cut = t
    if cut:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-t", f"{cut:.2f}", "-af", f"afade=t=out:st={max(cut - 0.12, 0):.2f}:d=0.12", "-ac", "1", "-b:a", "96k", dst], check=True)
        changed.append(c["id"])
        print(c["id"], "| trimmed", round(d, 1), "->", round(cut, 1), "|", c["text"], "| heard:", " ".join(w.word.strip() for w in words))

with zipfile.ZipFile("/content/chatterbox-trimmed.zip", "w", zipfile.ZIP_STORED) as z:
    for cid in changed:
        z.write(f"/content/trimmed/{cid}.mp3", f"{cid}.mp3")
print("trimmed clips:", len(changed), "of", len(clips), "| chatterbox-trimmed.zip bytes:", os.path.getsize("/content/chatterbox-trimmed.zip"))
