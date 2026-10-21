# Pilot: sing the "Ba for Battah (duck)" chant with the free open-source ACE-Step 1.5 model (MIT licence).
# Runs on the free Colab T4. Output: /content/songs/*.mp3 and /content/ace-songs.zip (no download here).
import json, os, subprocess, sys, time, urllib.parse, urllib.request, zipfile

ACE = "/content/ace"
OUT = "/content/songs"
os.makedirs(OUT, exist_ok=True)


def sh(cmd, cwd=None, tail=1500):
    print("$", cmd, flush=True)
    p = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True)
    print((p.stdout or "")[-tail:], (p.stderr or "")[-tail:], flush=True)
    if p.returncode:
        raise SystemExit("failed: " + cmd)


if not os.path.exists(ACE + "/.venv"):
    sh("pip -q install uv")
    if not os.path.exists(ACE):
        sh("git clone --depth 1 https://github.com/ACE-Step/ACE-Step-1.5.git " + ACE)
    sh("uv sync", cwd=ACE)

sh("pkill -f acestep || true")
env = dict(os.environ, MPLBACKEND="Agg", ACESTEP_API_HOST="127.0.0.1", ACESTEP_API_PORT="8001", ACESTEP_OFFLOAD_TO_CPU="true", ACESTEP_LM_BACKEND="pt", ACESTEP_INIT_LLM="false")
log = open("/content/ace-server.log", "w")
server = subprocess.Popen("uv run acestep-api", shell=True, cwd=ACE, env=env, stdout=log, stderr=subprocess.STDOUT)
print("server starting (the first start downloads the models, this takes several minutes)", flush=True)


def call(path, body=None, timeout=60):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request("http://127.0.0.1:8001" + path, data=data, headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=timeout))


for i in range(120):
    try:
        urllib.request.urlopen("http://127.0.0.1:8001/health", timeout=5)
        break
    except Exception:
        try:
            urllib.request.urlopen("http://127.0.0.1:8001/", timeout=5)
            break
        except urllib.error.HTTPError:
            break
        except Exception:
            time.sleep(15)
else:
    print(open("/content/ace-server.log").read()[-3000:])
    raise SystemExit("server did not start")
print("server is up", flush=True)

CAPTION = "cheerful a cappella children's nursery rhyme, simple catchy melody, hand claps, slow tempo, warm friendly child-like voice, no instruments, clear pronunciation"
TASKS = {
    "ba-ar": dict(
        vocal_language="ar",
        lyrics="[Verse]\nبَاء، بَطَّة!\nبَاء، بَطَّة!\nبَ، بَ، بَ!\n\n[Chorus]\nبَاء، بَطَّة! بَاء، بَطَّة!\nبَ، بَ، بَ! بَ، بَ، بَ!",
    ),
    "ba-en": dict(
        vocal_language="en",
        lyrics="[Verse]\nBa for Battah, duck!\nBa for Battah, duck!\nBa, ba, ba!\n\n[Chorus]\nBa for Battah, duck, duck, duck!\nBa, ba, ba!",
    ),
}
for name, t in TASKS.items():
    body = dict(prompt=CAPTION, audio_duration=24, bpm=90, inference_steps=8, thinking=False, use_format=False, batch_size=2, audio_format="mp3", **t)
    r = call("/release_task", body)
    tid = r["data"]["task_id"]
    print(name, "task", tid, flush=True)
    for _ in range(120):
        time.sleep(10)
        q = call("/query_result", {"task_id_list": [tid]})
        item = q["data"][0]
        if item["status"] in (1, 2):
            break
    if item["status"] != 1:
        print(name, "FAILED", str(item)[:800])
        continue
    for k, f in enumerate(json.loads(item["result"])):
        url = f.get("file") or f.get("audio_path")
        dest = f"{OUT}/{name}-{k + 1}.mp3"
        urllib.request.urlretrieve("http://127.0.0.1:8001" + url, dest)
        print(name, "saved", dest, os.path.getsize(dest), "bytes", flush=True)

with zipfile.ZipFile("/content/ace-songs.zip", "w", zipfile.ZIP_STORED) as z:
    for f in sorted(os.listdir(OUT)):
        z.write(f"{OUT}/{f}", f)
print("ace-songs.zip:", len(os.listdir(OUT)), "songs,", os.path.getsize("/content/ace-songs.zip"), "bytes")
server.terminate()
