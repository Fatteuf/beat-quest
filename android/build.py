"""Build the Beat Quest Android app (APK) from ../beat-quest.html.

Run:  python build.py
Output: ../BeatQuest.apk and ../BeatQuest-android.zip

Toolchain (all under tools/): aapt2, zipalign, dx.jar, apksigner.jar (Android
build-tools 30.0.3), android.jar (Android 14 platform), ecj (Eclipse Java
compiler). Java 8+ is required; MATLAB's bundled runtime is used if no JAVA_HOME.
The signing key (beatquest.jks + signing.properties) must be kept: Android only
accepts an update signed with the same key.
"""
import os, re, secrets, shutil, struct, subprocess, sys, urllib.request, zipfile, zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
TOOLS = HERE / "tools"
BIN = TOOLS / "bin"
ANDROID_JAR = TOOLS / "sdk" / "android.jar"
BUILD = HERE / "build"
FONTS = HERE / "src" / "fonts"
APK_OUT = ROOT / "BeatQuest-2.0.apk"
ZIP_OUT = ROOT / "BeatQuest-2.0-android.zip"
VERSION_CODE, VERSION_NAME = 5, "2.0"
MIN_SDK, TARGET_SDK = 24, 34


def find_java(tool):
    cands = []
    if os.environ.get("JAVA_HOME"):
        cands.append(Path(os.environ["JAVA_HOME"]) / "bin" / f"{tool}.exe")
    cands.append(Path(r"C:\Program Files\MATLAB\R2024b\sys\java\jre\win64\jre\bin") / f"{tool}.exe")
    for c in cands:
        if c.exists():
            return str(c)
    found = shutil.which(tool)
    if found:
        return found
    sys.exit(f"Could not find {tool}. Install Java 8+ or set JAVA_HOME.")


JAVA, KEYTOOL = find_java("java"), find_java("keytool")


def run(*args, **kw):
    print("  $", " ".join(str(a) for a in args)[:160])
    r = subprocess.run([str(a) for a in args], capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(r.stdout)
        print(r.stderr)
        sys.exit(f"Step failed: {args[0]}")
    return r.stdout + r.stderr


# ---------------------------------------------------------------- web assets
def fonts_css():
    css = (FONTS / "google.css").read_text(encoding="utf-8")
    out = []
    for subset, body in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S):
        if subset != "latin":
            continue
        fam = re.search(r"font-family:\s*'([^']+)'", body).group(1)
        wt = re.search(r"font-weight:\s*(\d+)", body).group(1)
        url = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
        name = fam.lower().replace(" ", "-") + "-" + url.rsplit("/", 1)[1]
        dst = FONTS / name
        if not dst.exists():
            print("  downloading font", name)
            urllib.request.urlretrieve(url, dst)
        out.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{wt};font-display:swap;"
                   f"src:url(fonts/{name}) format('woff2')}}")
    if len(out) < 4:
        sys.exit("Font list looks wrong; check src/fonts/google.css")
    return "\n".join(out)


def build_web(assets):
    src = (ROOT / "beat-quest.html").read_text(encoding="utf-8")
    head, sep, body = src.partition('<div id="app">')
    if not sep:
        sys.exit("beat-quest.html: could not find <div id=\"app\">")
    head = re.sub(r"<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*", "", head)
    doc = (
        "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover\">\n"
        "<meta name=\"theme-color\" content=\"#0f0b1c\">\n"
        f"<style>\n{fonts_css()}\n</style>\n{head.strip()}\n</head>\n<body>\n"
        "<script>window.BQ_PLATFORM='android';</script>\n"
        f"{sep}{body.rstrip()}\n</body>\n</html>\n"
    )
    www = assets / "www"
    (www / "fonts").mkdir(parents=True, exist_ok=True)
    (www / "index.html").write_text(doc, encoding="utf-8")
    for f in FONTS.glob("*.woff2"):
        shutil.copy(f, www / "fonts" / f.name)


# ---------------------------------------------------------------- icons (PIP sprite)
PIP = [
    ".....ka.....",
    ".....k......",
    "..kkkkkkkk..",
    ".kmmmmmmmmk.",
    ".kmkkmmkkmk.",
    ".kmkekkekmk.",
    ".kmmmmmmmmk.",
    ".kmmggggmmk.",
    ".kmmgkgkmmk.",
    ".kmmggggmmk.",
    "..kkkkkkkk..",
    "...k....k...",
]
PAL = {"k": "#140d1f", "m": "#ffb547", "e": "#3ef0c8", "g": "#7a4a1a", "a": "#ff4f9a"}
BG = "#1a1430"


def rgba(hexcol, a=255):
    h = hexcol.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def write_png(path, px):
    h, w = len(px), len(px[0])
    raw = b"".join(b"\x00" + bytes(c for p in row for c in p) for row in px)

    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
                     + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def draw_icon(size, sc, legacy):
    clear = (0, 0, 0, 0)
    px = [[clear] * size for _ in range(size)]
    if legacy:  # notched square tile, like the game's RPG windows
        n = max(2, size // 16)
        for y in range(size):
            for x in range(size):
                cx, cy = min(x, size - 1 - x), min(y, size - 1 - y)
                if cx + cy >= n:
                    px[y][x] = rgba(BG)
    off = (size - 12 * sc) // 2
    for y, row in enumerate(PIP):
        for x, ch in enumerate(row):
            if ch in PAL:
                for yy in range(sc):
                    for xx in range(sc):
                        px[off + y * sc + yy][off + x * sc + xx] = rgba(PAL[ch])
    return px


def build_icons(res):
    # density, legacy size, legacy scale, adaptive foreground size, foreground scale
    for d, ls, lsc, fs, fsc in [("mdpi", 48, 3, 108, 4), ("hdpi", 72, 4, 162, 6), ("xhdpi", 96, 6, 216, 8),
                                ("xxhdpi", 144, 9, 324, 12), ("xxxhdpi", 192, 12, 432, 16)]:
        write_png(res / f"mipmap-{d}" / "ic_launcher.png", draw_icon(ls, lsc, True))
        write_png(res / f"drawable-{d}" / "ic_launcher_fg.png", draw_icon(fs, fsc, False))
    write_png(ROOT / "android" / "icon-preview.png", draw_icon(192, 12, True))


# ---------------------------------------------------------------- signing key
def signing():
    props = HERE / "signing.properties"
    ks = HERE / "beatquest.jks"
    if not props.exists():
        props.write_text(f"password={secrets.token_urlsafe(18)}\nalias=beatquest\n", encoding="utf-8")
    kv = dict(line.split("=", 1) for line in props.read_text(encoding="utf-8").split() if "=" in line)
    if not ks.exists():
        print("  creating signing key")
        run(KEYTOOL, "-genkeypair", "-keystore", ks, "-storetype", "JKS", "-alias", kv["alias"], "-keyalg", "RSA",
            "-keysize", "2048", "-validity", "10000", "-storepass", kv["password"], "-keypass", kv["password"],
            "-dname", "CN=Beat Quest, O=Beat Quest")
    return ks, kv


# ---------------------------------------------------------------- build
def main():
    if BUILD.exists():
        shutil.rmtree(BUILD)
    BUILD.mkdir()
    res = BUILD / "res"
    shutil.copytree(HERE / "res", res)
    print("1/7 web assets + icons")
    build_web(BUILD / "assets")
    build_icons(res)

    print("2/7 compile resources")
    run(BIN / "aapt2.exe", "compile", "--dir", res, "-o", BUILD / "res.zip")
    print("3/7 link")
    run(BIN / "aapt2.exe", "link", "-o", BUILD / "base.apk", "-I", ANDROID_JAR, "--manifest", HERE / "AndroidManifest.xml",
        "-A", BUILD / "assets", "--min-sdk-version", MIN_SDK, "--target-sdk-version", TARGET_SDK,
        "--version-code", VERSION_CODE, "--version-name", VERSION_NAME, BUILD / "res.zip")

    print("4/7 compile Java")
    classes = BUILD / "classes"
    classes.mkdir()
    java_src = [str(p) for p in (HERE / "java").rglob("*.java")]
    run(JAVA, "-jar", BIN / "ecj-4.6.1.jar", "-1.8", "-encoding", "UTF-8", "-nowarn", "-bootclasspath", ANDROID_JAR,
        "-d", classes, *java_src)
    print("5/7 dex")
    run(JAVA, "-Xmx1g", "-jar", BIN / "dx.jar", "--dex", f"--min-sdk-version={MIN_SDK}", f"--output={BUILD / 'classes.dex'}", classes)
    with zipfile.ZipFile(BUILD / "base.apk", "a", zipfile.ZIP_DEFLATED) as z:
        z.write(BUILD / "classes.dex", "classes.dex")

    print("6/7 align + sign")
    run(BIN / "zipalign.exe", "-p", "-f", "4", BUILD / "base.apk", BUILD / "aligned.apk")
    ks, kv = signing()
    run(JAVA, "-jar", BIN / "apksigner.jar", "sign", "--ks", ks, "--ks-key-alias", kv["alias"],
        "--ks-pass", f"pass:{kv['password']}", "--key-pass", f"pass:{kv['password']}",
        "--min-sdk-version", MIN_SDK, "--v4-signing-enabled", "false", "--out", APK_OUT, BUILD / "aligned.apk")

    print("7/7 verify")
    print(run(JAVA, "-jar", BIN / "apksigner.jar", "verify", "--verbose", "--min-sdk-version", MIN_SDK, APK_OUT).strip())
    print(run(BIN / "zipalign.exe", "-c", "-p", "4", APK_OUT).strip() or "zipalign: ok")
    badge = run(BIN / "aapt2.exe", "dump", "badging", APK_OUT)
    print("\n".join(l for l in badge.splitlines() if l.startswith(("package:", "sdkVersion", "targetSdkVersion",
                                                                   "application-label:", "launchable-activity", "uses-permission"))))
    with zipfile.ZipFile(ZIP_OUT, "w", zipfile.ZIP_STORED) as z:
        z.write(APK_OUT, APK_OUT.name)
    # download page (published as an artifact): the zip is embedded as base64
    tpl = (HERE / "download-page.html").read_text(encoding="utf-8")
    b64 = __import__("base64").b64encode(ZIP_OUT.read_bytes()).decode("ascii")
    (ROOT / "beat-quest-android.html").write_text(tpl.replace("__ZIP_B64__", b64).replace("__VERSION__", VERSION_NAME).replace("__SIZE__", str(round(APK_OUT.stat().st_size / 1024))).replace("__ZIPNAME__", ZIP_OUT.name).replace("__APKNAME__", APK_OUT.name), encoding="utf-8")
    shutil.rmtree(BUILD)
    print(f"\nDone: {APK_OUT} ({APK_OUT.stat().st_size // 1024} KB) and {ZIP_OUT.name}")


if __name__ == "__main__":
    main()
