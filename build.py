#!/usr/bin/env python3
"""Bundle src/ into a single self-contained page.

Outputs
  index.html                 full HTML document; open it directly in any browser (works offline,
                             except for the optional Google Fonts)
  dist/genai-sprint.html     the same page as an HTML fragment for publishing as a claude.ai Artifact
"""
import base64
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
KATEX = ROOT / "vendor" / "katex"
SCRIPTS = (
    ["lectures.js"]
    + [f"content/w{n:02d}.js" for n in range(0, 13)]
    + ["content/finals.js", "content/formulas.js", "content/glossary.js",
       "figures.js", "widgets1.js", "widgets2.js", "widgets3.js", "math.js", "game.js", "app.js"]
)
TITLE = "GenAI 16-Hour Sprint"
FONTS = ("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400"
         "&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=JetBrains+Mono:wght@400;600&display=swap")


def katex_css() -> str:
    """KaTeX stylesheet with its woff2 fonts embedded, so equations render offline."""
    css = (KATEX / "katex.min.css").read_text(encoding="utf-8")

    def font(m: re.Match) -> str:
        data = base64.b64encode((KATEX / "fonts" / f"{m.group(1)}.woff2").read_bytes()).decode()
        return f'src:url(data:font/woff2;base64,{data}) format("woff2")'

    return re.sub(r'src:url\(fonts/([\w-]+)\.woff2\) format\("woff2"\)[^;}]*', font, css)


def body() -> str:
    css = katex_css() + "\n" + (SRC / "styles.css").read_text(encoding="utf-8")
    js = [(KATEX / "katex.min.js").read_text(encoding="utf-8"),
          "var R = String.raw;\nwindow.COURSE = { weeks: [], finals: [], formulas: [], glossary: [] };"]
    for name in SCRIPTS:
        js.append(f"/* ===== {name} ===== */\n" + (SRC / name).read_text(encoding="utf-8"))
    script = "\n".join(js).replace("</script", "<\\/script")
    return (
        f'<title>{TITLE}</title>\n'
        f'<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        f'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        f'<link rel="stylesheet" href="{FONTS}">\n'
        f"<style>\n{css}\n</style>\n"
        f'<noscript><p style="padding:24px">This study system needs JavaScript enabled.</p></noscript>\n'
        f"<script>\n{script}\n</script>\n"
    )


def main() -> None:
    frag = body()
    full = (
        "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
        "<meta name=\"description\" content=\"A 16-hour, interactive preparation system for the NPTEL / IISc course "
        "Fundamentals of Generative AI and Large Language Models.\">\n"
        "</head>\n<body>\n" + frag + "</body>\n</html>\n"
    )
    (ROOT / "index.html").write_text(full, encoding="utf-8")
    (ROOT / "dist").mkdir(exist_ok=True)
    (ROOT / "dist" / "genai-sprint.html").write_text(frag, encoding="utf-8")
    print(f"index.html: {len(full) / 1024:.0f} KB · dist/genai-sprint.html: {len(frag) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
