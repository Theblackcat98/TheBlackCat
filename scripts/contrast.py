"""WCAG contrast check for the design tokens in assets/css/00-tokens.css (light-dark() pairs).
Fails (exit 1) if a text pairing drops below its threshold. Usage: python3 scripts/contrast.py"""
import re, sys

src = open("assets/css/00-tokens.css").read() + open("assets/css/40-code.css").read()
tok = {}
for name, a, b in re.findall(r"--([\w-]+):\s*light-dark\((#[0-9a-fA-F]{6}),\s*(#[0-9a-fA-F]{6})\)", src):
    tok[name] = (a, b)

def lum(h):
    r, g, b = (int(h[i:i+2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

# (foreground, background, minimum ratio, what it is)
PAIRS = [
    ("ink", "paper", 7, "body text"), ("ink", "paper-2", 7, "text on raised surface"),
    ("ink-2", "paper", 4.5, "secondary text"), ("ink-2", "paper-2", 4.5, "secondary text on cards"),
    ("ink-3", "paper", 4.5, "muted metadata"), ("ink-3", "paper-2", 4.5, "muted metadata on cards"),
    ("ink-3", "paper-3", 4.5, "muted text on hover"), ("ink-3", "code-bg", 4.5, "code label"),
    ("accent", "paper", 4.5, "accent text / links"), ("accent", "paper-2", 4.5, "accent on cards"),
    ("accent", "paper-3", 4.5, "accent on hover"), ("accent", "accent-wash", 4.5, "accent on wash"),
    ("ink", "accent-wash", 7, "text on wash"),
    ("t-str", "code-bg", 4.5, "code: strings"), ("t-num", "code-bg", 4.5, "code: numbers"),
    ("t-cmt", "code-bg", 4.5, "code: comments"), ("t-ty", "code-bg", 4.5, "code: types"),
    ("paper", "ink", 7, "button text (light: paper on ink)"), ("paper", "accent", 4.5, "button hover text"),
]
bad = 0
print(f"{'pair':<44}{'light':>8}{'dark':>8}   min")
for fg, bg, need, what in PAIRS:
    row = []
    for i in (0, 1):
        f = tok[fg][i]; b = tok[bg][i]
        if fg == "paper" and bg == "ink":     # buttons: text=paper on bg=ink in light, same tokens in dark
            pass
        row.append(ratio(f, b))
    ok = all(r >= need for r in row)
    bad += not ok
    print(f"{('%s on %s (%s)' % (fg, bg, what)):<44}{row[0]:8.2f}{row[1]:8.2f}   {need}  {'ok' if ok else 'FAIL'}")
sys.exit(1 if bad else 0)
