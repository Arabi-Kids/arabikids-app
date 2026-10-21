# 8) Redo: slower, calmer chants + the "haadha" sentences + Nur's A03 line (no download here)
import json, os, re, subprocess, zipfile
import numpy as np
import torch
import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

if "model" not in globals():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    try:
        model = ChatterboxMultilingualTTS.from_pretrained(device=device, t3_model="v3")
    except TypeError:
        model = ChatterboxMultilingualTTS.from_pretrained(device=device)

items = json.load(open("/content/redo.json"))
os.makedirs("redo", exist_ok=True)
SPC = {"ar": 0.064, "en": 0.055, "ms": 0.06}  # seconds per letter at a normal pace


def letters(t):
    return len(re.sub(r"\W|_", "", t))


def take(text, lang, mode):
    n = letters(text)
    chant = mode == "chant"
    exp = max(0.9, n * SPC[lang] * (1.5 if chant else 1.0))
    lo = 0.5 * exp
    hi = (1.7 * exp + 0.8) if chant else (1.25 * exp + 0.4)
    ex, cfg = (0.45, 0.2) if chant else (0.5, 0.35)  # chant: calmer and slower
    best = None
    for _ in range(10):
        with torch.no_grad():
            w = model.generate(text, language_id=lang, exaggeration=ex, cfg_weight=cfg, temperature=0.8).cpu()
        d = w.shape[-1] / model.sr
        if best is None or abs(d - exp) < best[0]:
            best = (abs(d - exp), w, d)
        if lo <= d <= hi:
            return w, d, True
    return best[1], best[2], False


for it in items:
    chant = it["mode"] == "chant"
    parts = re.split(r"(?<=[!؟?.])\s+", it["text"]) if chant else [it["text"]]
    gap = torch.zeros(1, int(model.sr * (0.55 if chant else 0.3)))
    waves, total, bad = [], 0.0, 0
    for p in parts:
        w, d, ok = take(p, it["language"], it["mode"])
        bad += 0 if ok else 1
        total += d
        if waves:
            waves.append(gap)
        waves.append(w if w.dim() == 2 else w.unsqueeze(0))
    wav = torch.cat(waves, dim=-1)
    ta.save("tmp.wav", wav, model.sr)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "tmp.wav", "-ac", "1", "-b:a", "96k", f"redo/{it['id']}.mp3"], check=True)
    print(it["id"], "parts", len(parts), "| speech %.1f s" % total, "| parts without a clean take:", bad)

names = sorted(f for f in os.listdir("redo") if f.endswith(".mp3"))
with zipfile.ZipFile("chatterbox-redo.zip", "w", zipfile.ZIP_STORED) as z:
    for f in names:
        z.write(f"redo/{f}", f)
print("chatterbox-redo.zip:", len(names), "clips,", os.path.getsize("chatterbox-redo.zip"), "bytes")
