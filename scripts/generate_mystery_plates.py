"""Generate ONE unique dark-editorial SVG plate per mystery dossier.

77 mysteries → 77 distinct images in frontend/public/images/dossier/
Each plate has a unique composition, colour accent, and symbolic geometry
drawn from the mystery's theme. Seed-based randomness ensures reproducibility.

Palette:
  #0B1020  midnight navy (background)
  #6C9EFF  electric blue (primary accent)
  #E5B66A  warm amber (secondary accent)
  #CBD6F0  pale blue-white (highlight)
  #F4F6FB  near-white (stars, text)
"""
from __future__ import annotations

import math
import os
import random

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend", "public", "images", "dossier",
)
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1200, 750


# ── Helpers ──────────────────────────────────────────────────────────────────

def rng(seed: int) -> random.Random:
    return random.Random(seed)


def stars(seed: int, n: int = 90) -> str:
    r = rng(seed)
    items = []
    for _ in range(n):
        x = r.uniform(0, W)
        y = r.uniform(0, H * 0.72)
        rad = r.choice([0.6, 0.9, 1.1, 1.5, 2.0])
        op = r.uniform(0.18, 0.80)
        c = "#F4F6FB" if r.random() > 0.28 else ("#6C9EFF" if r.random() > 0.45 else "#E5B66A")
        items.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rad}" fill="{c}" opacity="{op:.2f}"/>')
    return "\n  ".join(items)


def grid(step: int = 80, op: float = 0.045) -> str:
    lines = []
    for x in range(step, W, step):
        lines.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="#6C9EFF" stroke-width="0.5" opacity="{op}"/>')
    for y in range(step, H, step):
        lines.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="#6C9EFF" stroke-width="0.5" opacity="{op}"/>')
    return "\n  ".join(lines)


def wrap(body: str, accent: str = "#6C9EFF", accent2: str = "#E5B66A") -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#070B16"/>
      <stop offset="50%" stop-color="#0B1020"/>
      <stop offset="100%" stop-color="#121A2B"/>
    </linearGradient>
    <radialGradient id="gA" cx="40%" cy="38%" r="55%">
      <stop offset="0%" stop-color="{accent}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0B1020" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gB" cx="68%" cy="62%" r="48%">
      <stop offset="0%" stop-color="{accent2}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#0B1020" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect width="{W}" height="{H}" fill="url(#gA)"/>
  <rect width="{W}" height="{H}" fill="url(#gB)"/>
  {body}
</svg>'''


def write(slug: str, content: str) -> None:
    path = os.path.join(OUT_DIR, f"{slug}.svg")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✓ dossier/{slug}.svg")


# ── Shared geometric primitives ───────────────────────────────────────────────

def circles(cx: float, cy: float, radii, color: str, op_start: float = 0.35, dashed: bool = True) -> str:
    out = []
    for i, r in enumerate(radii):
        op = max(0.04, op_start - i * 0.06)
        da = 'stroke-dasharray="6 8"' if dashed else ''
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color}" stroke-width="0.9" {da} opacity="{op}"/>')
    return "\n  ".join(out)


def hexagon(cx: float, cy: float, r: float, color: str, fill: str = "none",
            stroke_w: float = 1.2, op: float = 0.6) -> str:
    pts = " ".join(
        f"{cx + r * math.cos(math.radians(60 * i - 30)):.1f},{cy + r * math.sin(math.radians(60 * i - 30)):.1f}"
        for i in range(6)
    )
    return f'<polygon points="{pts}" fill="{fill}" stroke="{color}" stroke-width="{stroke_w}" opacity="{op}"/>'


def triangle(cx: float, cy: float, r: float, color: str, fill: str = "none",
             op: float = 0.55, rotate: float = 0) -> str:
    pts = " ".join(
        f"{cx + r * math.cos(math.radians(120 * i - 90 + rotate)):.1f},"
        f"{cy + r * math.sin(math.radians(120 * i - 90 + rotate)):.1f}"
        for i in range(3)
    )
    return f'<polygon points="{pts}" fill="{fill}" stroke="{color}" stroke-width="1.1" opacity="{op}"/>'


def wave_band(y: float, seed: int, color: str, count: int = 7) -> str:
    r = rng(seed)
    out = []
    for i in range(count):
        yy = y + i * 22
        op = 0.42 - i * 0.04
        ctrl = r.uniform(yy - 30, yy + 30)
        out.append(f'<path d="M-20,{yy} Q{W//2},{ctrl} {W+20},{yy}" fill="none" stroke="{color}" stroke-width="1.1" opacity="{op:.2f}"/>')
    return "\n  ".join(out)


def scanlines(y_start: float, h: float, seed: int, color: str = "#6C9EFF") -> str:
    r = rng(seed)
    out = []
    for i in range(0, int(h), 14):
        op = r.uniform(0.03, 0.12)
        out.append(f'<line x1="0" y1="{y_start+i}" x2="{W}" y2="{y_start+i}" stroke="{color}" stroke-width="0.7" opacity="{op:.2f}"/>')
    return "\n  ".join(out)


def document_lines(x: float, y: float, width: float, count: int = 8,
                   color: str = "#CBD6F0", op: float = 0.18) -> str:
    out = []
    for i in range(count):
        w2 = width * (0.9 if i % 3 == 2 else 1.0)
        out.append(f'<line x1="{x}" y1="{y + i*22}" x2="{x + w2}" y2="{y + i*22}" stroke="{color}" stroke-width="1.4" opacity="{op}"/>')
    return "\n  ".join(out)


def eye_symbol(cx: float, cy: float, rx: float = 110, ry: float = 55,
               color: str = "#6C9EFF", op: float = 0.55) -> str:
    return f'''
  <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="{color}" stroke-width="1.3" opacity="{op}"/>
  <circle cx="{cx}" cy="{cy}" r="{ry*0.55:.1f}" fill="none" stroke="{color}" stroke-width="1.1" opacity="{op*0.8:.2f}"/>
  <circle cx="{cx}" cy="{cy}" r="{ry*0.22:.1f}" fill="{color}" opacity="{op*0.6:.2f}"/>'''


def pyramid(bx: float, by: float, bw: float, color: str = "#E5B66A",
            fill: str = "none", op: float = 0.6) -> str:
    tx = bx + bw / 2
    ty = by - bw * 0.7
    return f'<polygon points="{bx},{by} {bx+bw},{by} {tx},{ty}" fill="{fill}" stroke="{color}" stroke-width="1.3" opacity="{op}"/>'


def dna_helix(x: float, y: float, seed: int, color1: str = "#6C9EFF",
              color2: str = "#E5B66A") -> str:
    r = rng(seed)
    out = []
    for i in range(0, 420, 15):
        t = i / 420 * 2 * math.pi
        x1 = x + 60 * math.sin(t)
        x2 = x - 60 * math.sin(t)
        yy = y + i
        op = r.uniform(0.3, 0.7)
        out.append(f'<line x1="{x1:.1f}" y1="{yy}" x2="{x2:.1f}" y2="{yy}" stroke="#CBD6F0" stroke-width="0.8" opacity="0.18"/>')
    # strands
    pts1 = " ".join(f"{x + 60 * math.sin(i/420*2*math.pi):.1f},{y+i}" for i in range(0, 420, 8))
    pts2 = " ".join(f"{x - 60 * math.sin(i/420*2*math.pi):.1f},{y+i}" for i in range(0, 420, 8))
    out.append(f'<polyline points="{pts1}" fill="none" stroke="{color1}" stroke-width="2.2" opacity="0.55"/>')
    out.append(f'<polyline points="{pts2}" fill="none" stroke="{color2}" stroke-width="2.2" opacity="0.55"/>')
    return "\n  ".join(out)


def clock_face(cx: float, cy: float, r: float, seed: int,
               color: str = "#6C9EFF", op: float = 0.5) -> str:
    rr = rng(seed)
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color}" stroke-width="1.4" opacity="{op}"/>']
    for i in range(12):
        angle = math.radians(i * 30 - 90)
        x1 = cx + (r - 18) * math.cos(angle)
        y1 = cy + (r - 18) * math.sin(angle)
        x2 = cx + r * math.cos(angle)
        y2 = cy + r * math.sin(angle)
        out.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="1.6" opacity="{op}"/>')
    # Hands
    h_angle = rr.uniform(0, 2 * math.pi)
    m_angle = rr.uniform(0, 2 * math.pi)
    out.append(f'<line x1="{cx}" y1="{cy}" x2="{cx + (r*0.55)*math.cos(h_angle):.1f}" y2="{cy + (r*0.55)*math.sin(h_angle):.1f}" stroke="{color}" stroke-width="2.4" opacity="{op}"/>')
    out.append(f'<line x1="{cx}" y1="{cy}" x2="{cx + (r*0.78)*math.cos(m_angle):.1f}" y2="{cy + (r*0.78)*math.sin(m_angle):.1f}" stroke="#E5B66A" stroke-width="1.6" opacity="{op}"/>')
    return "\n  ".join(out)


def antenna(cx: float, cy: float, h: float, color: str = "#6C9EFF", op: float = 0.55) -> str:
    return f'''
  <line x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy-h}" stroke="{color}" stroke-width="2" opacity="{op}"/>
  <line x1="{cx-h*0.4}" y1="{cy-h*0.3}" x2="{cx+h*0.4}" y2="{cy-h*0.3}" stroke="{color}" stroke-width="1.5" opacity="{op*0.7:.2f}"/>
  <line x1="{cx-h*0.6}" y1="{cy-h*0.6}" x2="{cx+h*0.6}" y2="{cy-h*0.6}" stroke="{color}" stroke-width="1.2" opacity="{op*0.5:.2f}"/>
  <circle cx="{cx}" cy="{cy-h}" r="6" fill="{color}" opacity="{op}"/>'''


def ufo_shape(cx: float, cy: float, color: str = "#6C9EFF", op: float = 0.55) -> str:
    return f'''
  <ellipse cx="{cx}" cy="{cy}" rx="160" ry="40" fill="#0E1826" stroke="{color}" stroke-width="1.4" opacity="{op}"/>
  <ellipse cx="{cx}" cy="{cy-20}" rx="80" ry="38" fill="#0E1826" stroke="{color}" stroke-width="1.1" opacity="{op*0.8:.2f}"/>
  <ellipse cx="{cx}" cy="{cy+8}" rx="180" ry="12" fill="none" stroke="#E5B66A" stroke-width="0.9" stroke-dasharray="8 6" opacity="{op*0.6:.2f}"/>
  <circle cx="{cx-90}" cy="{cy+4}" r="5" fill="{color}" opacity="{op*0.6:.2f}"/>
  <circle cx="{cx-45}" cy="{cy+8}" r="5" fill="{color}" opacity="{op*0.6:.2f}"/>
  <circle cx="{cx}" cy="{cy+10}" r="5" fill="{color}" opacity="{op*0.6:.2f}"/>
  <circle cx="{cx+45}" cy="{cy+8}" r="5" fill="{color}" opacity="{op*0.6:.2f}"/>
  <circle cx="{cx+90}" cy="{cy+4}" r="5" fill="{color}" opacity="{op*0.6:.2f}"/>'''


def ship_silhouette(cx: float, cy: float, color: str = "#6C9EFF", op: float = 0.45) -> str:
    return f'''
  <path d="M{cx-200},{cy} L{cx-180},{cy-55} L{cx+140},{cy-55} L{cx+200},{cy} Z"
        fill="#0D1A30" stroke="{color}" stroke-width="1.3" opacity="{op}"/>
  <rect x="{cx-80}" y="{cy-110}" width="90" height="58" fill="#0D1A30" stroke="{color}" stroke-width="1" opacity="{op*0.8:.2f}"/>
  <line x1="{cx-35}" y1="{cy-110}" x2="{cx-35}" y2="{cy-170}" stroke="{color}" stroke-width="1.4" opacity="{op}"/>'''


def submarine_shape(cx: float, cy: float, color: str = "#6C9EFF", op: float = 0.5) -> str:
    return f'''
  <ellipse cx="{cx}" cy="{cy}" rx="220" ry="60" fill="#0D1826" stroke="{color}" stroke-width="1.4" opacity="{op}"/>
  <rect x="{cx-30}" y="{cy-100}" width="60" height="55" fill="#0D1826" stroke="{color}" stroke-width="1" opacity="{op*0.8:.2f}"/>
  <ellipse cx="{cx-180}" cy="{cy}" rx="40" ry="60" fill="#0D1826" stroke="{color}" stroke-width="1" opacity="{op*0.6:.2f}"/>
  <circle cx="{cx-60}" cy="{cy+20}" r="14" fill="none" stroke="{color}" stroke-width="1" opacity="{op*0.6:.2f}"/>
  <circle cx="{cx+60}" cy="{cy+20}" r="14" fill="none" stroke="{color}" stroke-width="1" opacity="{op*0.6:.2f}"/>'''


def forest_treeline(y: float, seed: int, color: str = "#1B3A2D", stroke: str = "#2E5540") -> str:
    r = rng(seed)
    out = [f'<rect x="0" y="{y}" width="{W}" height="{H-y}" fill="{color}" opacity="0.7"/>']
    for i in range(0, W + 60, r.randint(40, 70)):
        h2 = r.randint(80, 200)
        w2 = r.randint(30, 55)
        out.append(
            f'<polygon points="{i},{y} {i+w2//2},{y-h2} {i+w2},{y}" '
            f'fill="{color}" stroke="{stroke}" stroke-width="0.8" opacity="0.85"/>'
        )
    return "\n  ".join(out)


def mountain_ridge(y: float, seed: int, color: str = "#182540") -> str:
    r = rng(seed)
    pts = [f"0,{y+50}"]
    x = 0
    while x < W:
        x += r.randint(60, 160)
        h2 = r.randint(40, 220)
        pts.append(f"{x},{y - h2}")
    pts.append(f"{W},{y+50}")
    pts.append(f"{W},{H}")
    pts.append(f"0,{H}")
    return f'<polygon points="{" ".join(pts)}" fill="{color}" opacity="0.72"/>'


def radar_sweep(cx: float, cy: float, r: float, angle_deg: float,
                color: str = "#6C9EFF", op: float = 0.4) -> str:
    angle = math.radians(angle_deg)
    ex = cx + r * math.cos(angle)
    ey = cy + r * math.sin(angle)
    # Wedge
    a1, a2 = angle - 0.45, angle
    pts = f"{cx},{cy} " + " ".join(
        f"{cx + r * math.cos(a1 + (a2-a1)*t/8):.1f},{cy + r * math.sin(a1 + (a2-a1)*t/8):.1f}"
        for t in range(9)
    )
    out = [
        f'<polygon points="{pts}" fill="{color}" opacity="{op*0.3:.2f}"/>',
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color}" stroke-width="1" opacity="{op*0.6:.2f}"/>',
        f'<circle cx="{cx}" cy="{cy}" r="{r*0.66:.1f}" fill="none" stroke="{color}" stroke-width="0.7" stroke-dasharray="4 5" opacity="{op*0.4:.2f}"/>',
        f'<circle cx="{cx}" cy="{cy}" r="{r*0.33:.1f}" fill="none" stroke="{color}" stroke-width="0.7" stroke-dasharray="4 5" opacity="{op*0.4:.2f}"/>',
        f'<line x1="{cx}" y1="{cy}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{color}" stroke-width="1.3" opacity="{op}"/>',
    ]
    return "\n  ".join(out)


def map_grid_lines(seed: int, op: float = 0.1) -> str:
    r = rng(seed)
    out = []
    for _ in range(6):
        y = r.uniform(H * 0.1, H * 0.9)
        out.append(f'<line x1="0" y1="{y:.1f}" x2="{W}" y2="{y:.1f}" stroke="#E5B66A" stroke-width="0.7" opacity="{op}"/>')
    for _ in range(8):
        x = r.uniform(0, W)
        out.append(f'<line x1="{x:.1f}" y1="0" x2="{x:.1f}" y2="{H}" stroke="#E5B66A" stroke-width="0.7" opacity="{op}"/>')
    return "\n  ".join(out)


def scattered_dots(seed: int, n: int = 20, color: str = "#6C9EFF",
                   y0: float = 0, y1: float = H) -> str:
    r = rng(seed)
    out = []
    for _ in range(n):
        x = r.uniform(50, W - 50)
        y = r.uniform(y0, y1)
        rad = r.uniform(2, 7)
        op = r.uniform(0.15, 0.55)
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rad:.1f}" fill="{color}" opacity="{op:.2f}"/>')
    return "\n  ".join(out)


def circuit_board(seed: int, x0: float, y0: float, w2: float, h2: float,
                  color: str = "#6C9EFF") -> str:
    r = rng(seed)
    out = []
    nodes = [(r.uniform(x0, x0+w2), r.uniform(y0, y0+h2)) for _ in range(12)]
    for i, (nx, ny) in enumerate(nodes):
        for j in range(i+1, len(nodes)):
            if r.random() > 0.6:
                mx, my = nodes[j]
                op = r.uniform(0.08, 0.22)
                out.append(f'<polyline points="{nx:.1f},{ny:.1f} {nx:.1f},{my:.1f} {mx:.1f},{my:.1f}" fill="none" stroke="{color}" stroke-width="0.9" opacity="{op:.2f}"/>')
        out.append(f'<circle cx="{nx:.1f}" cy="{ny:.1f}" r="4" fill="{color}" opacity="0.3"/>')
    return "\n  ".join(out)


# ── Per-mystery plate builders ────────────────────────────────────────────────

MYSTERIES: list[tuple[str, str]] = [
    # slug, theme-hint
    # ── PART 1 (original 16) ──────────────────────────────────────────────
    ("antarctica-beneath-the-ice",    "ice"),
    ("bermuda-triangle",              "ocean-triangle"),
    ("time-travel",                   "clock"),
    ("fermi-paradox",                 "space-grid"),
    ("wow-signal",                    "signal"),
    ("mh370",                         "plane"),
    ("dyatlov-pass",                  "mountain-snow"),
    ("lost-city-of-atlantis",         "underwater-ruin"),
    ("ancient-egyptian-pyramids",     "pyramid"),
    ("antikythera-mechanism",         "gear"),
    ("indus-valley-civilization",     "script"),
    ("mariana-trench",                "deep-ocean"),
    ("dark-matter",                   "dark-matter"),
    ("nazca-lines",                   "desert-lines"),
    ("roopkund-skeleton-lake",        "mountain-lake"),
    ("consciousness-terminal-gamma",  "neural"),
    # ── EXTRA PART 1 (operations, time, encounters, signals, creatures, ufo) ──
    ("area-51",                       "radar"),
    ("dulce-base",                    "underground"),
    ("mount-weather",                 "bunker"),
    ("raven-rock",                    "rock-bunker"),
    ("cheyenne-mountain",             "mountain-facility"),
    ("s4-papoose-lake",               "desert-facility"),
    ("haarp",                         "antenna-array"),
    ("project-blue-book",             "document-ufo"),
    ("project-mogul",                 "balloon"),
    ("project-stargate",              "eye-remote"),
    ("operation-paperclip",           "document-stamp"),
    ("mkultra",                       "lab-vials"),
    ("project-azorian",               "submarine"),
    ("philadelphia-experiment",       "ship-flash"),
    ("montauk-project",               "radar-bunker"),
    ("john-titor",                    "time-forum"),
    ("andrew-carlssin",               "stock-chart"),
    ("man-from-taured",               "passport"),
    ("rudolph-fentz",                 "victorian-street"),
    ("moberly-jourdain",              "versailles-garden"),
    ("moberly-jourdain-versailles",   "versailles-garden"),
    ("philadelphia-experiment-time",  "ship-wave"),
    ("montauk-project-time",          "camp-dark"),
    ("chronovisor",                   "screen-history"),
    ("men-in-black",                  "black-figure"),
    ("man-from-taured-encounter",     "airport"),
    ("green-children-of-woolpit",     "forest-children"),
    ("somerton-man",                  "beach-cipher"),
    ("somerton-man-tamam-shud",       "beach-cipher"),
    ("isdal-woman",                   "fjord-figure"),
    ("max-headroom-incident",         "tv-static"),
    ("circleville-letters",           "envelope"),
    ("voynich-manuscript",            "manuscript"),
    ("tamam-shud",                    "torn-paper"),
    ("greenbrier-ghost",              "courtroom"),
    ("bold-street-time-slip",         "street-blur"),
    ("versailles-time-slip",          "garden-mist"),
    ("john-titor-predictions",        "timeline"),
    ("time-travelling-hipster",       "photograph"),
    ("time-traveller-photographs",    "photograph"),
    ("1938-time-traveller",           "old-photo"),
    ("uvb-76-numbers-stations",       "antenna-array"),
    ("loch-ness-monster",             "deep-ocean"),
    ("himalayan-yeti",                "mountain-snow"),
    # ── EXTRA PART 2 (societies, disappearances, experiments) ─────────────
    ("illuminati",                    "eye-pyramid"),
    ("freemasons",                    "compass-square"),
    ("skull-and-bones",               "skull"),
    ("bilderberg-meetings",           "conference-table"),
    ("bohemian-grove",                "owl-fire"),
    ("rosicrucians",                  "rose-cross"),
    ("knights-templar",               "cross-sword"),
    ("priory-of-sion",                "cathedral"),
    ("order-golden-dawn",             "occult-star"),
    ("order-of-the-golden-dawn",      "occult-star"),
    ("hashshashin",                   "dagger-castle"),
    ("the-hashshashin",               "dagger-castle"),
    ("franklin-expedition",           "arctic-ship"),
    ("flannan-isles-lighthouse",      "lighthouse"),
    ("roanoke-colony",                "carved-tree"),
    ("lost-patrol",                   "arctic-patrol"),
    ("the-lost-patrol",               "arctic-patrol"),
    ("mary-celeste",                  "ghost-ship"),
    ("ambrose-bierce",                "desert-road"),
    ("princes-in-the-tower",          "tower-window"),
    ("sodder-children",               "burning-house"),
    ("hinterkaifeck-murders",         "farmhouse-dark"),
    ("lead-masks-case",               "masks-hillside"),
    ("mknaomi",                       "biohazard"),
    ("project-mknaomi",               "biohazard"),
    ("manhattan-project",             "atomic"),
    ("operation-sea-spray",           "fog-city"),
    ("tuskegee-study",                "medical-file"),
    ("soviet-sleep-experiment",       "chamber-dark"),
    ("project-artichoke",             "interrogation"),
    ("operation-midnight-climax",     "neon-dark"),
]


def build_plate(slug: str, theme: str, idx: int) -> str:
    seed = abs(hash(slug)) % 999983
    s = stars(seed + idx)
    g = grid(80, 0.04)
    base = f"{s}\n  {g}\n  {map_grid_lines(seed + 7, 0.07)}"

    # ── theme-based symbolic artwork ──────────────────────────────────────
    if theme == "ice":
        art = f"""
  <polygon points="0,520 180,310 320,440 480,260 640,400 820,280 960,380 1200,520 1200,750 0,750"
           fill="#0E1D38" stroke="#BFD6FF" stroke-width="0.9" opacity="0.72"/>
  {circles(640, 400, [100, 180, 270, 370], "#BFD6FF", 0.3, True)}
  <ellipse cx="600" cy="520" rx="420" ry="18" fill="#6C9EFF" opacity="0.12"/>"""

    elif theme == "ocean-triangle":
        art = f"""
  {wave_band(500, seed, "#6C9EFF", 9)}
  <polygon points="600,80 150,640 1050,640" fill="none" stroke="#E5B66A" stroke-width="1.5" opacity="0.5"/>
  <polygon points="600,180 250,580 950,580" fill="none" stroke="#6C9EFF" stroke-width="0.9" stroke-dasharray="8 6" opacity="0.35"/>
  {scattered_dots(seed+1, 12, "#E5B66A", 450, 650)}"""

    elif theme == "clock":
        art = f"""
  {clock_face(600, 400, 220, seed, "#6C9EFF", 0.55)}
  {circles(600, 400, [260, 320, 380], "#E5B66A", 0.14, True)}
  <text x="600" y="680" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#E5B66A" opacity="0.3">TEMPORAL DISPLACEMENT</text>"""

    elif theme == "space-grid":
        art = f"""
  {circles(600, 350, [80, 140, 220, 310, 410, 520], "#6C9EFF", 0.28, True)}
  <ellipse cx="600" cy="350" rx="40" ry="40" fill="#6C9EFF" opacity="0.12"/>
  {scattered_dots(seed+2, 30, "#F4F6FB", 50, 600)}
  <text x="600" y="680" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#CBD6F0" opacity="0.25">WHERE IS EVERYBODY?</text>"""

    elif theme == "signal":
        art = f"""
  {antenna(600, 620, 300, "#6C9EFF", 0.55)}
  {radar_sweep(600, 400, 260, 42, "#6C9EFF", 0.38)}
  <text x="680" y="230" font-family="monospace" font-size="52" fill="#6C9EFF" opacity="0.35">6EQUJ5</text>
  <text x="600" y="680" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#E5B66A" opacity="0.3">WOW SIGNAL · 1977</text>"""

    elif theme == "plane":
        art = f"""
  {wave_band(560, seed, "#6C9EFF", 8)}
  <path d="M300,350 L900,330 L860,380 L340,400 Z" fill="#0E1826" stroke="#6C9EFF" stroke-width="1.2" opacity="0.5"/>
  <path d="M650,330 L750,240 L780,270 L700,350 Z" fill="#0E1826" stroke="#6C9EFF" stroke-width="1" opacity="0.45"/>
  <path d="M650,370 L720,440 L700,460 L630,390 Z" fill="#0E1826" stroke="#6C9EFF" stroke-width="1" opacity="0.45"/>
  {circles(900, 400, [60, 110, 165], "#E5B66A", 0.2, True)}"""

    elif theme == "mountain-snow":
        art = f"""
  {mountain_ridge(480, seed, "#152238")}
  {mountain_ridge(530, seed+1, "#0E1826")}
  {scattered_dots(seed+3, 8, "#F4F6FB", 300, 480)}
  <text x="600" y="680" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#CBD6F0" opacity="0.25">DYATLOV PASS · 1959</text>"""

    elif theme == "underwater-ruin":
        art = f"""
  {wave_band(200, seed, "#1A4080", 12)}
  {pyramid(260, 620, 300, "#E5B66A", "none", 0.5)}
  {pyramid(700, 650, 200, "#6C9EFF", "none", 0.42)}
  {circles(600, 500, [80, 150, 240], "#6C9EFF", 0.2, True)}
  {document_lines(900, 320, 220, 7, "#E5B66A", 0.14)}"""

    elif theme == "pyramid":
        art = f"""
  {pyramid(300, 650, 450, "#E5B66A", "#0E1420", 0.65)}
  {pyramid(820, 620, 280, "#E5B66A", "#0E1420", 0.5)}
  {pyramid(1050, 640, 200, "#6C9EFF", "#0E1420", 0.4)}
  <ellipse cx="600" cy="650" rx="600" ry="12" fill="#E5B66A" opacity="0.08"/>
  {circles(525, 360, [60, 100], "#E5B66A", 0.22, False)}"""

    elif theme == "gear":
        def gear_svg(cx, cy, r, teeth, color, op):
            tooth_h = r * 0.22
            pts = []
            for i in range(teeth * 2):
                angle = math.radians(i * 180 / teeth)
                rr2 = r + tooth_h if i % 2 == 0 else r
                pts.append(f"{cx + rr2*math.cos(angle):.1f},{cy + rr2*math.sin(angle):.1f}")
            return (f'<polygon points="{" ".join(pts)}" fill="none" stroke="{color}" '
                    f'stroke-width="1.2" opacity="{op}"/>'
                    f'<circle cx="{cx}" cy="{cy}" r="{r*0.35:.1f}" fill="none" stroke="{color}" '
                    f'stroke-width="1.0" opacity="{op*0.6:.2f}"/>')
        art = f"""
  {gear_svg(500, 380, 190, 18, "#E5B66A", 0.55)}
  {gear_svg(820, 410, 110, 12, "#6C9EFF", 0.45)}
  {gear_svg(310, 500, 80, 10, "#6C9EFF", 0.38)}
  {document_lines(880, 180, 240, 8, "#CBD6F0", 0.15)}"""

    elif theme == "script":
        art = f"""
  {document_lines(100, 150, 500, 18, "#E5B66A", 0.22)}
  {document_lines(680, 200, 400, 14, "#6C9EFF", 0.18)}
  {scattered_dots(seed+4, 15, "#E5B66A", 100, 650)}
  <rect x="80" y="120" width="520" height="420" fill="none" stroke="#E5B66A" stroke-width="0.8" opacity="0.2"/>"""

    elif theme == "deep-ocean":
        art = f"""
  <rect x="0" y="0" width="{W}" height="{H}" fill="#040A18" opacity="0.5"/>
  {wave_band(80, seed, "#1A4080", 14)}
  {circles(600, 580, [80, 150, 230, 320, 420, 520], "#6C9EFF", 0.22, True)}
  {scattered_dots(seed+5, 18, "#6C9EFF", 300, 700)}
  <text x="600" y="680" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#6C9EFF" opacity="0.25">11,034 METRES BELOW SEA LEVEL</text>"""

    elif theme == "dark-matter":
        art = f"""
  {circles(400, 340, [60, 120, 200, 310, 440], "#6C9EFF", 0.3, True)}
  {circles(820, 440, [50, 100, 180, 270], "#E5B66A", 0.22, True)}
  {scattered_dots(seed+6, 40, "#F4F6FB", 50, 680)}
  <path d="M400,340 Q610,290 820,440" fill="none" stroke="#CBD6F0" stroke-width="0.9" stroke-dasharray="5 7" opacity="0.2"/>"""

    elif theme == "desert-lines":
        art = f"""
  <rect x="0" y="380" width="{W}" height="370" fill="#1C1710" opacity="0.8"/>
  <line x1="0" y1="380" x2="{W}" y2="380" stroke="#E5B66A" stroke-width="0.8" opacity="0.25"/>
  {''.join(f'<line x1="{rng(seed+i).uniform(0,W):.1f}" y1="380" x2="{rng(seed+i+1).uniform(0,W):.1f}" y2="680" stroke="#E5B66A" stroke-width="1.0" opacity="{rng(seed+i+2).uniform(0.1,0.35):.2f}"/>' for i in range(18))}
  {hexagon(600, 500, 100, "#E5B66A", "none", 1.0, 0.3)}"""

    elif theme == "mountain-lake":
        art = f"""
  {mountain_ridge(420, seed, "#152238")}
  <ellipse cx="600" cy="560" rx="380" ry="80" fill="#0D1E38" stroke="#6C9EFF" stroke-width="1" opacity="0.6"/>
  {scattered_dots(seed+7, 10, "#F4F6FB", 460, 540)}
  <text x="600" y="700" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#CBD6F0" opacity="0.25">ROOPKUND · 5,029 M</text>"""

    elif theme == "neural":
        art = f"""
  {circuit_board(seed, 80, 100, 1040, 550, "#6C9EFF")}
  {circles(600, 350, [80, 150, 240], "#E5B66A", 0.25, True)}
  {scattered_dots(seed+8, 20, "#6C9EFF", 100, 620)}"""

    elif theme == "radar":
        art = f"""
  {radar_sweep(600, 420, 280, 55, "#6C9EFF", 0.45)}
  {radar_sweep(600, 420, 180, 125, "#E5B66A", 0.28)}
  {scattered_dots(seed+9, 8, "#E5B66A", 150, 620)}
  <text x="600" y="700" text-anchor="middle" font-family="monospace" font-size="16" fill="#6C9EFF" opacity="0.3">CLASSIFIED · AREA 51</text>"""

    elif theme == "underground":
        art = f"""
  <rect x="0" y="380" width="{W}" height="370" fill="#0C1218" opacity="0.9"/>
  {circuit_board(seed, 50, 390, 1100, 320, "#E5B66A")}
  {circles(600, 580, [60, 120, 200], "#6C9EFF", 0.25, True)}
  {document_lines(100, 420, 350, 6, "#E5B66A", 0.18)}"""

    elif theme in ("bunker", "rock-bunker", "mountain-facility", "desert-facility", "radar-bunker", "bunker-dark"):
        art = f"""
  {mountain_ridge(480, seed, "#152030")}
  <rect x="380" y="430" width="440" height="200" fill="#0D1520" stroke="#6C9EFF" stroke-width="1" opacity="0.5"/>
  {document_lines(420, 460, 360, 7, "#6C9EFF", 0.18)}
  {radar_sweep(900, 300, 160, seed % 360, "#E5B66A", 0.3)}"""

    elif theme == "camp-dark":
        art = f"""
  {forest_treeline(460, seed, "#0D1A12", "#1B3020")}
  <rect x="380" y="390" width="440" height="200" fill="#0D1215" stroke="#6C9EFF" stroke-width="1" opacity="0.4"/>
  {radar_sweep(600, 340, 200, seed % 360, "#6C9EFF", 0.35)}"""

    elif theme == "antenna-array":
        art = f"""
  {antenna(300, 650, 350, "#6C9EFF", 0.5)}
  {antenna(600, 650, 420, "#E5B66A", 0.55)}
  {antenna(900, 650, 350, "#6C9EFF", 0.5)}
  {wave_band(300, seed, "#6C9EFF", 10)}
  <text x="600" y="700" text-anchor="middle" font-family="monospace" font-size="16" fill="#E5B66A" opacity="0.3">HAARP · GAKONA ALASKA</text>"""

    elif theme in ("document-ufo", "document-stamp", "medical-file"):
        art = f"""
  <rect x="150" y="100" width="600" height="560" fill="#0E1522" stroke="#E5B66A" stroke-width="1" opacity="0.4"/>
  {document_lines(185, 140, 530, 18, "#CBD6F0", 0.18)}
  <text x="460" y="380" text-anchor="middle" font-family="Georgia,serif" font-size="64" fill="#E5B66A" opacity="0.12">CLASSIFIED</text>
  {ufo_shape(900, 320, "#6C9EFF", 0.4)}"""

    elif theme == "balloon":
        art = f"""
  <ellipse cx="600" cy="220" rx="160" ry="210" fill="#0E1826" stroke="#E5B66A" stroke-width="1.3" opacity="0.55"/>
  <line x1="520" y1="430" x2="490" y2="560" stroke="#E5B66A" stroke-width="1.0" opacity="0.45"/>
  <line x1="600" y1="430" x2="600" y2="560" stroke="#E5B66A" stroke-width="1.0" opacity="0.45"/>
  <line x1="680" y1="430" x2="710" y2="560" stroke="#E5B66A" stroke-width="1.0" opacity="0.45"/>
  <rect x="510" y="560" width="180" height="80" fill="#0E1826" stroke="#E5B66A" stroke-width="1.0" opacity="0.45"/>
  {document_lines(880, 200, 240, 10, "#6C9EFF", 0.16)}"""

    elif theme == "eye-remote":
        art = f"""
  {eye_symbol(600, 320, 180, 80, "#6C9EFF", 0.55)}
  {circles(600, 320, [120, 200, 300], "#E5B66A", 0.15, True)}
  {document_lines(100, 500, 400, 8, "#CBD6F0", 0.18)}
  <text x="600" y="680" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#6C9EFF" opacity="0.3">PROJECT STARGATE</text>"""

    elif theme == "lab-vials":
        art = f"""
  {''.join(f'<rect x="{200 + i*140}" y="{350 - rng(seed+i).randint(50,200)}" width="60" height="{rng(seed+i).randint(50,200)+120}" rx="8" fill="#0E1826" stroke="{["#6C9EFF","#E5B66A","#4ADE80","#F87171"][i%4]}" stroke-width="1.2" opacity="0.55"/>' for i in range(6))}
  {document_lines(100, 100, 400, 7, "#E5B66A", 0.15)}
  <text x="600" y="700" text-anchor="middle" font-family="monospace" font-size="16" fill="#E5B66A" opacity="0.28">MKULTRA · SUBPROJECT 68</text>"""

    elif theme == "submarine":
        art = f"""
  {wave_band(350, seed, "#1A4080", 10)}
  {submarine_shape(600, 450, "#6C9EFF", 0.55)}
  {circles(600, 450, [100, 180, 270], "#6C9EFF", 0.15, True)}
  <text x="600" y="700" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#6C9EFF" opacity="0.3">PROJECT AZORIAN · K-129</text>"""

    elif theme in ("ship-flash", "ship-wave"):
        art = f"""
  {wave_band(430, seed, "#6C9EFF", 9)}
  {ship_silhouette(600, 500, "#6C9EFF", 0.5)}
  {circles(600, 300, [80, 140, 210], "#E5B66A", 0.22, True)}"""

    elif theme == "time-forum":
        art = f"""
  {clock_face(400, 350, 200, seed, "#6C9EFF", 0.5)}
  {document_lines(680, 180, 420, 14, "#CBD6F0", 0.18)}
  {scattered_dots(seed+10, 15, "#E5B66A", 100, 620)}"""

    elif theme == "stock-chart":
        art = f"""
  <polyline points="{" ".join(f"{100+i*22},{550 - rng(seed+i).uniform(0,350):.0f}" for i in range(50))}"
            fill="none" stroke="#6C9EFF" stroke-width="1.6" opacity="0.55"/>
  <polyline points="{" ".join(f"{100+i*22},{550 - rng(seed+i+1).uniform(0,250):.0f}" for i in range(50))}"
            fill="none" stroke="#E5B66A" stroke-width="1.0" opacity="0.35"/>
  {circles(600, 350, [80, 160, 250], "#E5B66A", 0.15, True)}"""

    elif theme in ("passport", "torn-paper", "envelope"):
        art = f"""
  <rect x="200" y="140" width="440" height="340" rx="12" fill="#0E1522" stroke="#E5B66A" stroke-width="1.2" opacity="0.55"/>
  {document_lines(230, 200, 380, 10, "#CBD6F0", 0.22)}
  <circle cx="430" cy="380" r="60" fill="none" stroke="#6C9EFF" stroke-width="1.0" stroke-dasharray="5 5" opacity="0.35"/>
  {scattered_dots(seed+11, 10, "#E5B66A", 500, 680)}"""

    elif theme == "victorian-street":
        art = f"""
  {mountain_ridge(500, seed, "#1A1510")}
  {document_lines(100, 200, 400, 8, "#E5B66A", 0.15)}
  <ellipse cx="400" cy="500" rx="30" ry="80" fill="#E5B66A" opacity="0.12"/>
  {circles(600, 380, [60, 120], "#E5B66A", 0.2, False)}"""

    elif theme == "versailles-garden":
        art = f"""
  {forest_treeline(420, seed, "#0D1A0E", "#1B3A14")}
  {circles(600, 350, [100, 180, 280], "#E5B66A", 0.22, False)}
  {document_lines(880, 180, 240, 8, "#CBD6F0", 0.15)}"""

    elif theme == "garden-mist":
        art = f"""
  {forest_treeline(440, seed, "#0E1A10", "#1B3515")}
  <ellipse cx="600" cy="440" rx="500" ry="60" fill="#CBD6F0" opacity="0.06"/>
  {circles(600, 380, [120, 220], "#CBD6F0", 0.15, True)}"""

    elif theme == "beach-cipher":
        art = f"""
  <rect x="0" y="480" width="{W}" height="270" fill="#12100E" opacity="0.8"/>
  {wave_band(430, seed, "#6C9EFF", 7)}
  {document_lines(100, 200, 500, 10, "#E5B66A", 0.2)}
  <text x="600" y="680" text-anchor="middle" font-family="monospace" font-size="18" fill="#E5B66A" opacity="0.3">TAMAM SHUD</text>"""

    elif theme == "fjord-figure":
        art = f"""
  {mountain_ridge(420, seed, "#152030")}
  {wave_band(500, seed+1, "#1A4080", 8)}
  <ellipse cx="400" cy="420" rx="18" ry="50" fill="#CBD6F0" opacity="0.2"/>
  {scattered_dots(seed+12, 10, "#6C9EFF", 300, 600)}"""

    elif theme == "tv-static":
        art = f"""
  {scanlines(60, 630, seed, "#6C9EFF")}
  <rect x="180" y="80" width="650" height="500" rx="20" fill="none" stroke="#6C9EFF" stroke-width="1.5" opacity="0.4"/>
  {scattered_dots(seed+13, 50, "#F4F6FB", 80, 580)}
  <text x="600" y="680" text-anchor="middle" font-family="monospace" font-size="18" fill="#E5B66A" opacity="0.3">MAX HEADROOM · 22 NOV 1987</text>"""

    elif theme == "manuscript":
        art = f"""
  <rect x="80" y="60" width="680" height="620" fill="#12100A" stroke="#E5B66A" stroke-width="0.9" opacity="0.5"/>
  {document_lines(110, 100, 620, 22, "#E5B66A", 0.2)}
  {scattered_dots(seed+14, 12, "#E5B66A", 100, 640)}
  <text x="440" y="680" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#E5B66A" opacity="0.3">VOYNICH MS · C.1404–1438</text>"""

    elif theme == "courtroom":
        art = f"""
  {document_lines(100, 150, 500, 14, "#CBD6F0", 0.2)}
  <rect x="80" y="120" width="520" height="480" fill="none" stroke="#E5B66A" stroke-width="0.8" opacity="0.25"/>
  {circles(850, 350, [80, 140, 210], "#6C9EFF", 0.2, True)}"""

    elif theme == "street-blur":
        art = f"""
  {mountain_ridge(520, seed, "#1A1510")}
  {scanlines(300, 400, seed+2, "#6C9EFF")}
  {circles(600, 400, [60, 120, 200], "#E5B66A", 0.2, True)}"""

    elif theme == "timeline":
        art = f"""
  <line x1="80" y1="380" x2="1120" y2="380" stroke="#6C9EFF" stroke-width="1.5" opacity="0.45"/>
  {''.join(f'<circle cx="{180+i*160}" cy="380" r="10" fill="#0E1826" stroke="{["#6C9EFF","#E5B66A"][i%2]}" stroke-width="1.4" opacity="0.55"/>' for i in range(7))}
  {''.join(f'<line x1="{180+i*160}" y1="380" x2="{180+i*160}" y2="{[310,450][i%2]}" stroke="{["#6C9EFF","#E5B66A"][i%2]}" stroke-width="0.9" opacity="0.4"/>' for i in range(7))}
  {clock_face(900, 300, 120, seed, "#E5B66A", 0.4)}"""

    elif theme == "photograph":
        art = f"""
  <rect x="150" y="80" width="560" height="440" fill="#0D1215" stroke="#CBD6F0" stroke-width="2" opacity="0.4"/>
  {scanlines(80, 440, seed, "#F4F6FB")}
  {document_lines(780, 180, 320, 10, "#E5B66A", 0.15)}"""

    elif theme == "old-photo":
        art = f"""
  <rect x="120" y="60" width="600" height="460" fill="#0F0E0A" stroke="#E5B66A" stroke-width="1.5" opacity="0.4"/>
  {scanlines(60, 460, seed, "#E5B66A")}
  {scattered_dots(seed+15, 10, "#E5B66A", 100, 500)}"""

    elif theme == "eye-pyramid":
        art = f"""
  {pyramid(300, 650, 600, "#E5B66A", "#0E1420", 0.6)}
  {eye_symbol(600, 420, 90, 44, "#6C9EFF", 0.6)}
  {circles(600, 420, [140, 220, 310], "#E5B66A", 0.14, True)}"""

    elif theme == "compass-square":
        art = f"""
  {hexagon(600, 360, 200, "#6C9EFF", "none", 1.2, 0.45)}
  <line x1="600" y1="160" x2="600" y2="560" stroke="#E5B66A" stroke-width="1.4" opacity="0.4"/>
  <line x1="400" y1="360" x2="800" y2="360" stroke="#E5B66A" stroke-width="1.4" opacity="0.4"/>
  {circles(600, 360, [80, 140], "#E5B66A", 0.22, False)}"""

    elif theme == "skull":
        art = f"""
  <ellipse cx="600" cy="310" rx="140" ry="160" fill="#0E1522" stroke="#CBD6F0" stroke-width="1.3" opacity="0.5"/>
  <ellipse cx="560" cy="340" rx="38" ry="45" fill="#0B1020" stroke="#6C9EFF" stroke-width="1.0" opacity="0.5"/>
  <ellipse cx="640" cy="340" rx="38" ry="45" fill="#0B1020" stroke="#6C9EFF" stroke-width="1.0" opacity="0.5"/>
  <path d="M558,490 L642,490 L630,560 L570,560 Z" fill="#0E1522" stroke="#CBD6F0" stroke-width="1.0" opacity="0.45"/>
  {document_lines(100, 500, 350, 6, "#E5B66A", 0.15)}"""

    elif theme == "conference-table":
        art = f"""
  <ellipse cx="600" cy="400" rx="400" ry="130" fill="#0E1522" stroke="#6C9EFF" stroke-width="1.2" opacity="0.5"/>
  {''.join(f'<circle cx="{300 + i*120}" cy="{400 + [-20,20][i%2]}" r="14" fill="#0B1020" stroke="#E5B66A" stroke-width="0.9" opacity="0.4"/>' for i in range(6))}
  {document_lines(100, 150, 400, 8, "#CBD6F0", 0.18)}"""

    elif theme == "owl-fire":
        art = f"""
  {forest_treeline(460, seed, "#0D1208", "#1B2E10")}
  <ellipse cx="600" cy="380" rx="80" ry="140" fill="#E5B66A" opacity="0.08"/>
  {circles(600, 380, [100, 180, 270], "#E5B66A", 0.2, True)}
  {scattered_dots(seed+16, 15, "#E5B66A", 400, 650)}"""

    elif theme == "rose-cross":
        art = f"""
  <line x1="600" y1="100" x2="600" y2="680" stroke="#E5B66A" stroke-width="1.5" opacity="0.4"/>
  <line x1="200" y1="380" x2="1000" y2="380" stroke="#E5B66A" stroke-width="1.5" opacity="0.4"/>
  {circles(600, 380, [70, 130], "#E5B66A", 0.3, False)}
  {hexagon(600, 380, 160, "#6C9EFF", "none", 1.0, 0.35)}"""

    elif theme == "cross-sword":
        art = f"""
  <line x1="600" y1="80" x2="600" y2="680" stroke="#CBD6F0" stroke-width="2.0" opacity="0.4"/>
  <line x1="380" y1="260" x2="820" y2="260" stroke="#CBD6F0" stroke-width="1.5" opacity="0.35"/>
  {circles(600, 380, [120, 200, 300], "#6C9EFF", 0.18, True)}
  {scattered_dots(seed+17, 8, "#E5B66A", 300, 650)}"""

    elif theme == "cathedral":
        art = f"""
  <polygon points="600,80 480,500 720,500" fill="#0E1522" stroke="#E5B66A" stroke-width="1.2" opacity="0.5"/>
  <polygon points="600,80 560,400 640,400" fill="#0B1020" stroke="#6C9EFF" stroke-width="0.9" opacity="0.35"/>
  {circles(600, 400, [100, 180], "#E5B66A", 0.22, False)}
  {document_lines(100, 500, 350, 6, "#CBD6F0", 0.15)}"""

    elif theme == "occult-star":
        art = f"""
  {''.join(f'<line x1="{600 + 220*math.cos(math.radians(i*72-90)):.1f}" y1="{350 + 220*math.sin(math.radians(i*72-90)):.1f}" x2="{600 + 220*math.cos(math.radians((i+2)*72-90)):.1f}" y2="{350 + 220*math.sin(math.radians((i+2)*72-90)):.1f}" stroke="#E5B66A" stroke-width="1.3" opacity="0.5"/>' for i in range(5))}
  {circles(600, 350, [90, 150, 240], "#6C9EFF", 0.2, True)}"""

    elif theme == "dagger-castle":
        art = f"""
  {mountain_ridge(420, seed, "#152030")}
  <line x1="600" y1="680" x2="600" y2="300" stroke="#CBD6F0" stroke-width="1.8" opacity="0.4"/>
  <polygon points="590,300 610,300 600,270" fill="#CBD6F0" opacity="0.4"/>
  {circles(600, 350, [80, 150], "#E5B66A", 0.2, True)}"""

    elif theme == "arctic-ship":
        art = f"""
  <polygon points="0,580 180,440 320,520 480,380 640,480 820,420 960,500 1200,580 1200,750 0,750"
           fill="#1A2840" stroke="#BFD6FF" stroke-width="0.8" opacity="0.6"/>
  {ship_silhouette(600, 520, "#CBD6F0", 0.5)}
  {scattered_dots(seed+18, 8, "#F4F6FB", 300, 520)}"""

    elif theme == "lighthouse":
        art = f"""
  {wave_band(530, seed, "#1A4080", 8)}
  <rect x="560" y="150" width="80" height="380" fill="#0E1826" stroke="#CBD6F0" stroke-width="1.2" opacity="0.55"/>
  <ellipse cx="600" cy="150" rx="60" ry="30" fill="#E5B66A" opacity="0.3"/>
  {circles(600, 150, [80, 150, 240], "#E5B66A", 0.18, True)}"""

    elif theme == "carved-tree":
        art = f"""
  {forest_treeline(360, seed, "#0D1A08", "#1A3010")}
  <rect x="560" y="300" width="80" height="280" fill="#12180A" stroke="#E5B66A" stroke-width="1.2" opacity="0.5"/>
  {document_lines(590, 320, 50, 6, "#E5B66A", 0.3)}"""

    elif theme == "arctic-patrol":
        art = f"""
  {mountain_ridge(380, seed, "#152238")}
  {scattered_dots(seed+19, 8, "#F4F6FB", 200, 420)}
  {circles(600, 500, [80, 150], "#6C9EFF", 0.2, True)}"""

    elif theme == "ghost-ship":
        art = f"""
  {wave_band(430, seed, "#1A4080", 10)}
  {ship_silhouette(600, 500, "#CBD6F0", 0.4)}
  <ellipse cx="600" cy="460" rx="300" ry="30" fill="#CBD6F0" opacity="0.05"/>
  {scattered_dots(seed+20, 12, "#F4F6FB", 300, 520)}"""

    elif theme == "desert-road":
        art = f"""
  <rect x="0" y="380" width="{W}" height="370" fill="#1C1710" opacity="0.8"/>
  <line x1="0" y1="380" x2="{W}" y2="380" stroke="#E5B66A" stroke-width="0.8" opacity="0.25"/>
  <polygon points="560,380 640,380 680,700 520,700" fill="#262010" opacity="0.6"/>
  {scattered_dots(seed+21, 10, "#E5B66A", 400, 700)}"""

    elif theme == "tower-window":
        art = f"""
  <rect x="400" y="80" width="400" height="620" fill="#0E1522" stroke="#6C9EFF" stroke-width="1.0" opacity="0.45"/>
  <rect x="560" y="200" width="80" height="120" rx="40" fill="#0B1020" stroke="#E5B66A" stroke-width="1.2" opacity="0.55"/>
  {circles(600, 400, [80, 150, 240], "#6C9EFF", 0.18, True)}"""

    elif theme == "burning-house":
        art = f"""
  <polygon points="400,480 600,200 800,480" fill="#0E1420" stroke="#E5B66A" stroke-width="1.2" opacity="0.55"/>
  <rect x="420" y="480" width="360" height="220" fill="#0E1420" stroke="#E5B66A" stroke-width="1.0" opacity="0.5"/>
  {scattered_dots(seed+22, 20, "#E5B66A", 150, 480)}
  <ellipse cx="600" cy="200" rx="60" ry="80" fill="#E5B66A" opacity="0.1"/>"""

    elif theme == "farmhouse-dark":
        art = f"""
  {forest_treeline(500, seed, "#0C1008", "#182810")}
  <polygon points="380,480 600,280 820,480" fill="#0E1215" stroke="#CBD6F0" stroke-width="1.0" opacity="0.4"/>
  <rect x="400" y="480" width="400" height="200" fill="#0E1215" stroke="#CBD6F0" stroke-width="0.8" opacity="0.35"/>"""

    elif theme == "masks-hillside":
        art = f"""
  {mountain_ridge(460, seed, "#182535")}
  {circles(400, 380, [50, 90], "#E5B66A", 0.3, False)}
  {circles(700, 380, [50, 90], "#6C9EFF", 0.3, False)}
  {document_lines(100, 500, 350, 5, "#CBD6F0", 0.15)}"""

    elif theme == "biohazard":
        art = f"""
  {circles(600, 350, [100, 170, 250], "#4ADE80", 0.3, True)}
  {''.join(f'<circle cx="{600 + 170*math.cos(math.radians(i*120)):.1f}" cy="{350 + 170*math.sin(math.radians(i*120)):.1f}" r="55" fill="none" stroke="#4ADE80" stroke-width="1.0" opacity="0.35"/>' for i in range(3))}
  {document_lines(100, 500, 400, 7, "#4ADE80", 0.14)}"""

    elif theme == "atomic":
        art = f"""
  {circles(600, 350, [80, 140, 220, 320], "#E5B66A", 0.3, True)}
  {''.join(f'<ellipse cx="600" cy="350" rx="250" ry="80" fill="none" stroke="#E5B66A" stroke-width="1.0" opacity="0.35" transform="rotate({i*60} 600 350)"/>' for i in range(3))}
  <circle cx="600" cy="350" r="20" fill="#E5B66A" opacity="0.35"/>"""

    elif theme == "fog-city":
        art = f"""
  <rect x="0" y="380" width="{W}" height="370" fill="#0C1218" opacity="0.9"/>
  {''.join(f'<rect x="{100+i*155}" y="{rng(seed+i).randint(200,420)}" width="{rng(seed+i+1).randint(50,100)}" height="{550 - rng(seed+i).randint(200,420)}" fill="#0E1522" stroke="#6C9EFF" stroke-width="0.7" opacity="0.35"/>' for i in range(7))}
  {wave_band(350, seed, "#CBD6F0", 6)}"""

    elif theme == "chamber-dark":
        art = f"""
  <rect x="150" y="80" width="900" height="600" fill="#080C12" stroke="#6C9EFF" stroke-width="1.0" opacity="0.4"/>
  {scanlines(80, 600, seed, "#F87171")}
  {document_lines(200, 150, 800, 20, "#F87171", 0.14)}
  <text x="600" y="680" text-anchor="middle" font-family="monospace" font-size="16" fill="#F87171" opacity="0.3">SOVIET SLEEP EXPERIMENT</text>"""

    elif theme == "interrogation":
        art = f"""
  <rect x="250" y="120" width="700" height="500" fill="#090D14" stroke="#6C9EFF" stroke-width="1.0" opacity="0.4"/>
  {document_lines(280, 180, 640, 16, "#CBD6F0", 0.18)}
  {circles(900, 250, [60, 110], "#E5B66A", 0.2, True)}"""

    elif theme == "neon-dark":
        art = f"""
  {scanlines(60, 650, seed, "#F87171")}
  <rect x="180" y="80" width="650" height="500" rx="20" fill="none" stroke="#F87171" stroke-width="1.5" opacity="0.35"/>
  {scattered_dots(seed+23, 20, "#F87171", 80, 580)}
  <text x="600" y="680" text-anchor="middle" font-family="monospace" font-size="16" fill="#F87171" opacity="0.28">OPERATION MIDNIGHT CLIMAX</text>"""

    elif theme == "screen-history":
        art = f"""
  <rect x="150" y="80" width="700" height="480" rx="16" fill="#08100A" stroke="#6C9EFF" stroke-width="1.2" opacity="0.4"/>
  {scanlines(80, 480, seed, "#6C9EFF")}
  {circles(850, 400, [80, 140], "#E5B66A", 0.22, True)}
  <text x="500" y="680" text-anchor="middle" font-family="monospace" font-size="16" fill="#6C9EFF" opacity="0.28">CHRONOVISOR</text>"""

    elif theme == "black-figure":
        art = f"""
  {scattered_dots(seed+24, 25, "#F4F6FB", 50, 580)}
  <ellipse cx="600" cy="380" rx="50" ry="140" fill="#06090F" opacity="0.9"/>
  <ellipse cx="600" cy="230" rx="40" ry="45" fill="#06090F" opacity="0.9"/>
  {circles(600, 350, [80, 160, 260], "#6C9EFF", 0.15, True)}"""

    elif theme == "airport":
        art = f"""
  {document_lines(100, 150, 500, 12, "#CBD6F0", 0.18)}
  <rect x="80" y="120" width="520" height="440" fill="none" stroke="#E5B66A" stroke-width="0.8" opacity="0.2"/>
  {circles(850, 350, [80, 150, 230], "#6C9EFF", 0.2, True)}"""

    elif theme == "forest-children":
        art = f"""
  {forest_treeline(380, seed, "#0A1508", "#183010")}
  <ellipse cx="460" cy="380" rx="20" ry="55" fill="#CBD6F0" opacity="0.15"/>
  <ellipse cx="540" cy="380" rx="18" ry="50" fill="#CBD6F0" opacity="0.12"/>
  {circles(600, 500, [60, 120], "#6C9EFF", 0.2, True)}"""

    else:
        # Generic fallback — unique by seed
        art = f"""
  {circles(600, 350, [80 + idx*8, 150 + idx*6, 240 + idx*4, 340 + idx*3], "#6C9EFF", 0.28, True)}
  {hexagon(600 + idx*5 % 100 - 50, 350, 180, "#E5B66A", "none", 1.0, 0.3)}
  {scattered_dots(seed, 20, "#6C9EFF", 100, 620)}"""

    body = f"{base}\n  {art}\n  {scattered_dots(seed+100, 6, '#E5B66A', 50, 300)}"
    return wrap(body)


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"Generating {len(MYSTERIES)} unique mystery plates → {OUT_DIR}")
    for idx, (slug, theme) in enumerate(MYSTERIES):
        svg = build_plate(slug, theme, idx)
        write(slug, svg)
    print(f"\n✅ Done — {len(MYSTERIES)} plates written to frontend/public/images/dossier/")
