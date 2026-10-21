# Sing the letter chants (all letters except Ba, which is done) with the free open-source ACE-Step model (MIT licence).
# Reads /content/songs-lyrics.json (list of {n, lang, lyrics}); writes /content/songs-all/L<nn>-<lang>-<take>.mp3 and
# /content/ace-songs-all.zip. No download here. Safe to re-run: finished clips are skipped.
import json, os, re, subprocess, time, urllib.request, zipfile

ACE = "/content/ace"
OUT = "/content/songs-all"
os.makedirs(OUT, exist_ok=True)

# T4 GPUs give NaN with lyrics in float16: run this model in float32 (idempotent patch).
f = ACE + "/acestep/core/generation/handler/init_service_orchestrator.py"
src = open(f, encoding="utf8").read()
m = re.search(r"(cuda_supports_bfloat16\(\):\s*\n\s*self\.dtype = torch\.bfloat16\s*\n\s*else:\s*\n\s*self\.dtype = )torch\.float16", src)
if m:
    open(f, "w", encoding="utf8").write(src[: m.start()] + m.group(1) + "torch.float32" + src[m.end():])
print("float32 patch applied now:", bool(m), flush=True)

subprocess.run("pkill -f acestep-ap[i]", shell=True)
time.sleep(5)
env = dict(os.environ, MPLBACKEND="Agg", ACESTEP_INIT_LLM="false", ACESTEP_API_HOST="127.0.0.1", ACESTEP_API_PORT="8001",
           ACESTEP_OFFLOAD_TO_CPU="true", ACESTEP_LM_BACKEND="pt")
log = open("/content/ace-server.log", "w")
server = subprocess.Popen("uv run acestep-api", shell=True, cwd=ACE, env=env, stdout=log, stderr=subprocess.STDOUT)


def call(path, body=None, timeout=60):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request("http://127.0.0.1:8001" + path, data=data, headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=timeout))


for _ in range(120):
    time.sleep(10)
    try:
        urllib.request.urlopen("http://127.0.0.1:8001/health", timeout=5)
        break
    except urllib.error.HTTPError:
        break
    except Exception:
        pass
else:
    raise SystemExit("server did not start: " + open("/content/ace-server.log").read()[-1500:])
time.sleep(5)
print("server is up", flush=True)

CAPTION = "cheerful a cappella children's nursery rhyme, simple catchy melody, hand claps, slow tempo, warm friendly child-like voice, no instruments, clear pronunciation"
for t in json.load(open("/content/songs-lyrics.json", encoding="utf8")):
    stem = f"L{t['n']:02d}-{t['lang']}"
    if os.path.exists(f"{OUT}/{stem}-2.mp3"):
        continue
    body = dict(prompt=CAPTION, lyrics=t["lyrics"], vocal_language=t["lang"], audio_duration=24, bpm=90, inference_steps=8,
                thinking=False, use_format=False, batch_size=2, audio_format="mp3")
    for attempt in range(2):
        tid = call("/release_task", body)["data"]["task_id"]
        for _ in range(90):
            time.sleep(5)
            item = call("/query_result", {"task_id_list": [tid]})["data"][0]
            if item["status"] in (1, 2):
                break
        if item["status"] == 1:
            break
    if item["status"] != 1:
        print(stem, "FAILED", str(item)[:300], flush=True)
        continue
    for k, r in enumerate(json.loads(item["result"]), start=1):
        urllib.request.urlretrieve("http://127.0.0.1:8001" + r["file"], f"{OUT}/{stem}-{k}.mp3")
    print(stem, "ok", flush=True)

with zipfile.ZipFile("/content/ace-songs-all.zip", "w", zipfile.ZIP_STORED) as z:
    for name in sorted(os.listdir(OUT)):
        z.write(f"{OUT}/{name}", name)
print("ace-songs-all.zip:", len(os.listdir(OUT)), "clips,", os.path.getsize("/content/ace-songs-all.zip"), "bytes")
server.terminate()
