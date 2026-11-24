"""Generate bespoke dark-editorial SVG visual plates for THE UNKNOWN ARCHIVE.

Each SVG is crafted with deep midnight navy (#0B1020), electric blue (#6C9EFF),
and warm amber (#E5B66A) tones matching a National Geographic / science museum
exhibition aesthetic.
"""
from __future__ import annotations

import math
import os
import random

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend",
    "public",
    "images",
)
os.makedirs(OUT_DIR, exist_ok=True)


def starfield(seed: int, count: int = 85, y_max: int = 460) -> str:
    rng = random.Random(seed)
    items = []
    for _ in range(count):
        x = rng.uniform(10, 1190)
        y = rng.uniform(10, y_max)
        r = rng.choice([0.7, 0.9, 1.2, 1.5, 2.0])
        op = rng.uniform(0.2, 0.85)
        col = "#F4F6FB" if rng.random() > 0.25 else ("#6C9EFF" if rng.random() > 0.4 else "#E5B66A")
        items.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{col}" opacity="{op:.2f}"/>')
    return "\n  ".join(items)


def grid_lines(step: int = 80, opacity: float = 0.05) -> str:
    lines = []
    for x in range(step, 1200, step):
        lines.append(f'<line x1="{x}" y1="0" x2="{x}" y2="750" stroke="#6C9EFF" stroke-width="0.6" opacity="{opacity}"/>')
    for y in range(step, 750, step):
        lines.append(f'<line x1="0" y1="{y}" x2="1200" y2="{y}" stroke="#6C9EFF" stroke-width="0.6" opacity="{opacity}"/>')
    return "\n  ".join(lines)


def svg_wrap(body: str, width: int = 1200, height: int = 750) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#070B16"/>
      <stop offset="55%" stop-color="#0B1020"/>
      <stop offset="100%" stop-color="#121A2B"/>
    </linearGradient>
    <radialGradient id="blueGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#6C9EFF" stop-opacity="0.30"/>
      <stop offset="65%" stop-color="#1D3566" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#0B1020" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="amberGlow" cx="62%" cy="55%" r="50%">
      <stop offset="0%" stop-color="#E5B66A" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="#9A6B2F" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#0B1020" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#BFD6FF" stop-opacity="0.92"/>
      <stop offset="45%" stop-color="#4E78C7" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#0E172E" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A2C50" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#060A15" stop-opacity="0.98"/>
    </linearGradient>
    <linearGradient id="amberStone" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E5B66A" stop-opacity="0.88"/>
      <stop offset="55%" stop-color="#9B7238" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#1B2236" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="desertGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#27241D"/>
      <stop offset="50%" stop-color="#1C1A16"/>
      <stop offset="100%" stop-color="#101420"/>
    </linearGradient>
  </defs>
  <rect width="{width}" height="{height}" fill="url(#bg)"/>
  {body}
</svg>'''


def write_svg(filename: str, content: str) -> None:
    with open(os.path.join(OUT_DIR, filename), "w", encoding="utf-8") as f:
        f.write(content)


def build_hero() -> str:
    nebula = """
  <ellipse cx="640" cy="210" rx="520" ry="200" fill="url(#blueGlow)" transform="rotate(-12 640 210)"/>
  <ellipse cx="780" cy="240" rx="340" ry="130" fill="url(#amberGlow)" transform="rotate(14 780 240)"/>
  <path d="M-40,340 Q280,140 640,210 T1240,140" fill="none" stroke="#6C9EFF" stroke-width="1.2" opacity="0.22"/>
  <path d="M-40,380 Q320,180 680,250 T1240,180" fill="none" stroke="#E5B66A" stroke-width="0.9" opacity="0.18"/>
"""
    ice = """
  <polygon points="0,470 110,360 190,410 295,305 405,390 485,355 585,480 0,480" fill="url(#iceGrad)" opacity="0.88"/>
  <polygon points="0,470 110,360 165,470" fill="#DBE8FF" opacity="0.35"/>
  <polygon points="295,305 340,468 230,468" fill="#A5C3FF" opacity="0.28"/>
  <path d="M0,470 L585,470 L585,750 L0,750 Z" fill="#0B1326" opacity="0.92"/>
  <path d="M40,680 Q130,545 215,610 T380,555 T530,680" fill="none" stroke="#6C9EFF" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.48"/>
  <path d="M80,715 Q165,585 245,640 T410,590 T550,715" fill="none" stroke="#E5B66A" stroke-width="1.2" opacity="0.35"/>
"""
    waves = []
    for i in range(9):
        y = 465 + i * 28
        op = 0.45 - i * 0.035
        waves.append(
            f'<path d="M520,{y} Q700,{y-18} 880,{y+8} T1220,{y-6}" fill="none" stroke="#6C9EFF" stroke-width="1.3" opacity="{op:.2f}"/>'
        )
    ocean = f"""
  <path d="M460,465 Q780,445 1200,465 L1200,750 L460,750 Z" fill="url(#oceanGrad)"/>
  {''.join(waves)}
  <ellipse cx="620" cy="465" rx="420" ry="18" fill="#E5B66A" opacity="0.16"/>
  <circle cx="880" cy="465" r="190" fill="none" stroke="#6C9EFF" stroke-width="0.9" stroke-dasharray="4 6" opacity="0.25"/>
  <circle cx="880" cy="465" r="290" fill="none" stroke="#E5B66A" stroke-width="0.7" stroke-dasharray="3 8" opacity="0.18"/>
"""
    return svg_wrap(grid_lines(100, 0.035) + starfield(42, 130, 440) + nebula + ice + ocean, 1200, 750)


def build_operations_plate() -> str:
    # Satellite view of desert dry lake bed & classified runways (Area 51 / Groom Lake motif)
    contours = "".join(
        f'<path d="M0,{90+i*62} Q320,{60+i*62} 620,{98+i*62} T1200,{82+i*62}" fill="none" stroke="#E5B66A" stroke-width="0.8" opacity="0.14"/>'
        for i in range(11)
    )
    return svg_wrap(
        '<rect width="1200" height="750" fill="url(#desertGrad)"/>'
        + grid_lines(80, 0.07)
        + contours
        + '<ellipse cx="420" cy="180" rx="340" ry="150" fill="#8C7B5C" opacity="0.16"/>'
        + '<polygon points="280,110 470,95 820,560 760,605 320,240" fill="#A99D82" opacity="0.18"/>'
        + '<line x1="360" y1="80" x2="870" y2="635" stroke="#E5B66A" stroke-width="7" opacity="0.72"/>'
        + '<line x1="360" y1="80" x2="870" y2="635" stroke="#F4F6FB" stroke-width="1.5" stroke-dasharray="14 10" opacity="0.75"/>'
        + '<line x1="590" y1="70" x2="640" y2="660" stroke="#CBD6F0" stroke-width="5" opacity="0.48"/>'
        + '<line x1="250" y1="365" x2="730" y2="265" stroke="#6C9EFF" stroke-width="3" stroke-dasharray="8 6" opacity="0.5"/>'
        + '<rect x="260" y="210" width="95" height="65" rx="4" fill="#182238" stroke="#6C9EFF" stroke-width="1.4"/>'
        + '<rect x="285" y="295" width="70" height="45" rx="4" fill="#182238" stroke="#E5B66A" stroke-width="1.2"/>'
        + '<circle cx="620" cy="365" r="215" fill="none" stroke="#6C9EFF" stroke-width="1" stroke-dasharray="5 7" opacity="0.35"/>'
        + '<circle cx="620" cy="365" r="310" fill="none" stroke="#E5B66A" stroke-width="0.9" stroke-dasharray="3 9" opacity="0.25"/>'
        + '<circle cx="582" cy="355" r="7" fill="#E5B66A"/>'
    )


def build_time_anomaly_plate() -> str:
    # Swirling time vortex + classic clock dials + light-cone curves
    rings = "".join(
        f'<circle cx="640" cy="340" r="{85+i*48}" fill="none" stroke="{"#6C9EFF" if i%2==0 else "#E5B66A"}" stroke-width="1.4" stroke-dasharray="{18-i} {8+i}" opacity="{0.65-i*0.07:.2f}"/>'
        for i in range(7)
    )
    clocks = [
        (240, 210, 88),
        (960, 220, 102),
        (640, 340, 118),
        (330, 520, 74),
        (910, 530, 68),
    ]
    clock_svgs = []
    for cx, cy, r in clocks:
        clock_svgs.append(
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#0D1426" fill-opacity="0.82" stroke="#E5B66A" stroke-width="2.2"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r-10}" fill="none" stroke="#6C9EFF" stroke-width="0.9" stroke-dasharray="3 5" opacity="0.6"/>'
            f'<line x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy - int(r*0.58)}" stroke="#F4F6FB" stroke-width="2.6" stroke-linecap="round"/>'
            f'<line x1="{cx}" y1="{cy}" x2="{cx + int(r*0.45)}" y2="{cy + int(r*0.22)}" stroke="#E5B66A" stroke-width="2.2" stroke-linecap="round"/>'
            f'<circle cx="{cx}" cy="{cy}" r="5" fill="#6C9EFF"/>'
        )
    return svg_wrap(
        starfield(202, 120, 720)
        + '<ellipse cx="640" cy="340" rx="460" ry="280" fill="url(#blueGlow)"/>'
        + '<ellipse cx="640" cy="410" rx="340" ry="180" fill="url(#amberGlow)"/>'
        + rings
        + "".join(clock_svgs)
        + '<path d="M120,660 Q640,480 1120,650" fill="none" stroke="#6C9EFF" stroke-width="2" opacity="0.45"/>'
    )


def build_encounters_plate() -> str:
    # Silhouetted figures in misty blue night streetlamp glow
    return svg_wrap(
        '<ellipse cx="600" cy="240" rx="460" ry="260" fill="url(#blueGlow)"/>'
        + '<circle cx="600" cy="185" r="24" fill="#9EC1FF" opacity="0.75"/>'
        + '<circle cx="240" cy="250" r="10" fill="#6C9EFF" opacity="0.45"/>'
        + '<circle cx="960" cy="250" r="10" fill="#6C9EFF" opacity="0.45"/>'
        + '<rect x="0" y="590" width="1200" height="160" fill="#070B16"/>'
        + '<ellipse cx="600" cy="605" rx="460" ry="42" fill="#6C9EFF" opacity="0.16"/>'
        # Left trench-coat & fedora silhouette
        + '<path d="M270,740 L310,410 Q360,360 440,360 Q515,360 550,415 L575,740 Z" fill="#050811"/>'
        + '<ellipse cx="420" cy="290" rx="52" ry="62" fill="#050811"/>'
        + '<ellipse cx="420" cy="255" rx="98" ry="16" fill="#050811" transform="rotate(-7 420 255)"/>'
        + '<path d="M368,250 Q420,185 472,250 Z" fill="#050811"/>'
        + '<path d="M445,255 Q495,295 452,360" fill="none" stroke="#6C9EFF" stroke-width="2" opacity="0.45"/>'
        # Right silhouette
        + '<path d="M680,740 L710,425 Q765,375 835,375 Q905,375 945,425 L970,740 Z" fill="#050811"/>'
        + '<ellipse cx="825" cy="312" rx="48" ry="58" fill="#050811"/>'
        + '<ellipse cx="825" cy="278" rx="92" ry="14" fill="#050811" transform="rotate(6 825 278)"/>'
        + '<path d="M775,274 Q825,212 875,274 Z" fill="#050811"/>'
        + '<path d="M755,285 Q720,330 755,390" fill="none" stroke="#6C9EFF" stroke-width="1.6" opacity="0.35"/>'
    )


def build_societies_plate() -> str:
    # Candlelit secret council chamber + geometric compass/eye emblem
    return svg_wrap(
        '<ellipse cx="600" cy="340" rx="440" ry="260" fill="url(#amberGlow)"/>'
        + '<rect x="180" y="455" width="840" height="220" rx="18" fill="#181512" stroke="#E5B66A" stroke-width="1.4" opacity="0.88"/>'
        + '<polygon points="600,150 770,420 430,420" fill="none" stroke="#E5B66A" stroke-width="2.2" opacity="0.65"/>'
        + '<circle cx="600" cy="315" r="76" fill="none" stroke="#6C9EFF" stroke-width="1.3" stroke-dasharray="6 5" opacity="0.55"/>'
        + '<ellipse cx="600" cy="315" rx="34" ry="18" fill="none" stroke="#E5B66A" stroke-width="2"/>'
        + '<circle cx="600" cy="315" r="7" fill="#E5B66A"/>'
        # Two glowing candles & parchment
        + '<rect x="520" y="490" width="170" height="95" rx="4" fill="#E9DEC4" opacity="0.82" transform="rotate(-4 605 535)"/>'
        + '<rect x="440" y="395" width="16" height="80" rx="3" fill="#CBD6F0" opacity="0.75"/>'
        + '<ellipse cx="448" cy="378" rx="9" ry="16" fill="#E5B66A"/>'
        + '<rect x="744" y="395" width="16" height="80" rx="3" fill="#CBD6F0" opacity="0.75"/>'
        + '<ellipse cx="752" cy="378" rx="9" ry="16" fill="#E5B66A"/>'
    )


def build_signals_plate() -> str:
    # Radio telescope dish under Milky Way + glowing narrowband waveform
    wave_pts = []
    for i in range(60):
        x = 60 + i * 18
        amp = 18 if (i < 22 or i > 38) else (130 * math.exp(-((i - 30) ** 2) / 18.0))
        y = 620 - (amp if i % 2 == 0 else -amp * 0.45)
        wave_pts.append(f"{x},{y:.1f}")
    return svg_wrap(
        starfield(505, 165, 520)
        + '<ellipse cx="600" cy="240" rx="460" ry="220" fill="url(#blueGlow)"/>'
        + '<path d="M360,440 Q560,210 780,290 Q620,490 360,440 Z" fill="#192848" stroke="#6C9EFF" stroke-width="2.2"/>'
        + '<line x1="560" y1="350" x2="695" y2="175" stroke="#E5B66A" stroke-width="2.2"/>'
        + '<line x1="470" y1="395" x2="695" y2="175" stroke="#6C9EFF" stroke-width="1.4" opacity="0.7"/>'
        + '<line x1="690" y1="340" x2="695" y2="175" stroke="#6C9EFF" stroke-width="1.4" opacity="0.7"/>'
        + '<circle cx="695" cy="175" r="8" fill="#E5B66A"/>'
        + '<polygon points="480,680 545,455 615,455 680,680" fill="#111A30" stroke="#6C9EFF" stroke-width="1.5"/>'
        + f'<polyline points="{" ".join(wave_pts)}" fill="none" stroke="#E5B66A" stroke-width="2.6" opacity="0.9"/>'
    )


def build_creatures_plate() -> str:
    # Misty loch horizon + undulating silhouette + sonar rings
    return svg_wrap(
        '<ellipse cx="600" cy="250" rx="460" ry="220" fill="url(#blueGlow)"/>'
        + '<rect x="0" y="450" width="1200" height="300" fill="url(#oceanGrad)"/>'
        + '<ellipse cx="780" cy="450" rx="280" ry="20" fill="#6C9EFF" opacity="0.16"/>'
        # Loch Ness style silhouette rising in mist
        + '<path d="M580,460 Q610,415 645,460 Q690,460 720,405 Q745,355 775,460 L820,460 Q830,360 805,270 Q795,220 825,195 Q850,185 872,202 Q845,215 842,240 Q845,340 865,460 Z" fill="#0B1325" stroke="#6C9EFF" stroke-width="1.4" opacity="0.92"/>'
        + '<path d="M100,510 Q420,490 760,515 T1140,505" fill="none" stroke="#A8C3FF" stroke-width="1.3" opacity="0.32"/>'
        + '<path d="M180,560 Q500,540 840,565 T1120,555" fill="none" stroke="#6C9EFF" stroke-width="1.1" opacity="0.22"/>'
        + '<circle cx="810" cy="470" r="140" fill="none" stroke="#E5B66A" stroke-width="1" stroke-dasharray="5 7" opacity="0.3"/>'
    )


def build_ufo_plate() -> str:
    # Classic saucer silhouette + luminous beam over dark pine ridge
    return svg_wrap(
        starfield(909, 130, 440)
        + '<ellipse cx="600" cy="250" rx="420" ry="200" fill="url(#blueGlow)"/>'
        + '<polygon points="480,320 720,320 860,720 340,720" fill="#6C9EFF" opacity="0.14"/>'
        + '<polygon points="540,320 660,320 740,720 460,720" fill="#E5B66A" opacity="0.10"/>'
        + '<ellipse cx="600" cy="275" rx="220" ry="44" fill="#1C2845" stroke="#CBD6F0" stroke-width="2"/>'
        + '<ellipse cx="600" cy="248" rx="95" ry="34" fill="#2A3C66" stroke="#6C9EFF" stroke-width="1.8"/>'
        + '<ellipse cx="600" cy="288" rx="54" ry="14" fill="#F4F6FB" opacity="0.9"/>'
        + '<polygon points="0,750 0,590 120,520 220,610 340,545 480,630 720,615 880,535 1030,600 1200,540 1200,750" fill="#060A14"/>'
    )


def build_disappearances_plate() -> str:
    # Tall expedition ship emerging through Arctic/ocean fog
    return svg_wrap(
        '<ellipse cx="600" cy="270" rx="460" ry="230" fill="url(#blueGlow)"/>'
        + '<rect x="0" y="510" width="1200" height="240" fill="url(#oceanGrad)"/>'
        # Ship hull & masts
        + '<polygon points="410,515 795,515 755,585 450,585" fill="#0A1020" stroke="#6C9EFF" stroke-width="1.4"/>'
        + '<line x1="510" y1="515" x2="510" y2="210" stroke="#CBD6F0" stroke-width="3"/>'
        + '<line x1="615" y1="515" x2="615" y2="165" stroke="#E5B66A" stroke-width="3.2"/>'
        + '<line x1="715" y1="515" x2="715" y2="235" stroke="#CBD6F0" stroke-width="2.6"/>'
        + '<polygon points="512,235 595,280 512,350" fill="#A8C3FF" opacity="0.28"/>'
        + '<polygon points="617,190 705,250 617,345" fill="#E5B66A" opacity="0.22"/>'
        + '<polygon points="617,355 708,405 617,480" fill="#6C9EFF" opacity="0.24"/>'
        + '<path d="M80,555 Q420,530 780,558 T1150,545" fill="none" stroke="#6C9EFF" stroke-width="1.4" opacity="0.38"/>'
    )


def build_experiments_plate() -> str:
    # Declassified archive dossier plate + EEG / chemical waveform
    return svg_wrap(
        grid_lines(75, 0.06)
        + '<ellipse cx="600" cy="360" rx="440" ry="240" fill="url(#amberGlow)"/>'
        + '<rect x="275" y="95" width="650" height="560" rx="14" fill="#10182C" stroke="#E5B66A" stroke-width="1.8" opacity="0.94"/>'
        + '<rect x="330" y="145" width="540" height="44" rx="4" fill="#1B2846"/>'
        + '<rect x="330" y="218" width="380" height="16" rx="3" fill="#6C9EFF" opacity="0.5"/>'
        + '<rect x="330" y="252" width="490" height="14" rx="3" fill="#CBD6F0" opacity="0.32"/>'
        + '<rect x="330" y="284" width="440" height="14" rx="3" fill="#CBD6F0" opacity="0.32"/>'
        # Redacted black bars + declassified gold seal
        + '<rect x="330" y="330" width="220" height="22" rx="3" fill="#060913"/>'
        + '<rect x="570" y="330" width="180" height="22" rx="3" fill="#060913"/>'
        + '<rect x="330" y="370" width="340" height="22" rx="3" fill="#060913"/>'
        + '<path d="M330,490 Q380,430 430,490 T530,490 T630,490 T730,490 T860,490" fill="none" stroke="#6C9EFF" stroke-width="2.4" opacity="0.8"/>'
        + '<circle cx="805" cy="560" r="52" fill="none" stroke="#E5B66A" stroke-width="2.2" stroke-dasharray="6 4"/>'
        + '<circle cx="805" cy="560" r="34" fill="#E5B66A" opacity="0.22"/>'
    )


def build_scientific_plate() -> str:
    # Wormhole / spacetime curvature grid (like Screenshot 12)
    rings = "".join(
        f'<ellipse cx="600" cy="{220+i*42}" rx="{380 - i*36 if i<5 else 200+(i-4)*45}" ry="{75 - i*8 if i<5 else 35+(i-4)*10}" fill="none" stroke="{"#E5B66A" if i in (3,4,5) else "#6C9EFF"}" stroke-width="1.6" opacity="{0.45 + (0.4 if i==4 else 0):.2f}"/>'
        for i in range(9)
    )
    return svg_wrap(
        starfield(1212, 140, 720)
        + '<ellipse cx="600" cy="375" rx="450" ry="260" fill="url(#blueGlow)"/>'
        + '<ellipse cx="600" cy="375" rx="220" ry="90" fill="url(#amberGlow)"/>'
        + rings
        + '<path d="M220,160 Q520,375 220,590" fill="none" stroke="#6C9EFF" stroke-width="1.5" opacity="0.5"/>'
        + '<path d="M980,160 Q680,375 980,590" fill="none" stroke="#6C9EFF" stroke-width="1.5" opacity="0.5"/>'
        + '<ellipse cx="600" cy="375" rx="145" ry="24" fill="#F4F6FB" opacity="0.22"/>'
    )


def build_cipher_plate() -> str:
    # Ancient coded manuscript + cipher wheel + forensic glyph grid
    wheels = "".join(
        f'<circle cx="600" cy="375" r="{65+i*46}" fill="none" stroke="{"#E5B66A" if i%2==0 else "#6C9EFF"}" stroke-width="1.5" stroke-dasharray="{10+i*2} {6+i}" opacity="{0.7-i*0.09:.2f}"/>'
        for i in range(5)
    )
    return svg_wrap(
        grid_lines(80, 0.05)
        + '<ellipse cx="600" cy="375" rx="440" ry="260" fill="url(#amberGlow)"/>'
        + '<rect x="290" y="130" width="620" height="490" rx="16" fill="#141827" stroke="#E5B66A" stroke-width="1.8" opacity="0.92"/>'
        + wheels
        + '<line x1="340" y1="210" x2="510" y2="210" stroke="#CBD6F0" stroke-width="2" stroke-dasharray="12 6" opacity="0.5"/>'
        + '<line x1="690" y1="540" x2="860" y2="540" stroke="#6C9EFF" stroke-width="2" stroke-dasharray="10 5" opacity="0.5"/>'
        + '<circle cx="600" cy="375" r="14" fill="#E5B66A"/>'
    )


def build_all():
    write_svg("hero-archive.svg", build_hero())

    # Existing mystery plates (kept intact)
    write_svg(
        "mystery-antarctica.svg",
        svg_wrap(
            starfield(101, 70, 310)
            + '<ellipse cx="600" cy="300" rx="460" ry="200" fill="url(#blueGlow)"/>'
            + '<polygon points="0,360 160,250 280,315 440,210 610,305 790,235 980,320 1200,255 1200,390 0,390" fill="url(#iceGrad)"/>'
            + '<rect x="0" y="390" width="1200" height="360" fill="#091122"/>'
            + '<path d="M60,640 Q240,460 410,550 T760,490 T1140,650" fill="none" stroke="#6C9EFF" stroke-width="2" opacity="0.6"/>'
            + '<path d="M120,690 Q310,515 470,600 T820,535 T1100,695" fill="none" stroke="#E5B66A" stroke-width="1.3" stroke-dasharray="6 5" opacity="0.5"/>'
            + '<ellipse cx="600" cy="595" rx="260" ry="38" fill="#6C9EFF" opacity="0.28"/>'
            + '<ellipse cx="600" cy="595" rx="180" ry="20" fill="#A9C8FF" opacity="0.35"/>'
        ),
    )
    waves_b = "".join(
        f'<path d="M0,{340+i*36} Q300,{315+i*36} 600,{345+i*36} T1200,{335+i*36}" fill="none" stroke="#6C9EFF" stroke-width="1.4" opacity="{0.55 - i*0.04:.2f}"/>'
        for i in range(10)
    )
    write_svg(
        "mystery-bermuda.svg",
        svg_wrap(
            starfield(102, 65, 300)
            + '<ellipse cx="600" cy="380" rx="420" ry="210" fill="url(#blueGlow)"/>'
            + '<polygon points="600,190 910,600 290,600" fill="none" stroke="#E5B66A" stroke-width="1.4" stroke-dasharray="8 6" opacity="0.45"/>'
            + '<circle cx="600" cy="190" r="6" fill="#E5B66A"/><circle cx="910" cy="600" r="6" fill="#E5B66A"/><circle cx="290" cy="600" r="6" fill="#E5B66A"/>'
            + waves_b
        ),
    )
    ellipses = "".join(
        f'<ellipse cx="600" cy="375" rx="{90+i*58}" ry="{36+i*22}" fill="none" stroke="{"#6C9EFF" if i%2==0 else "#E5B66A"}" stroke-width="1.2" opacity="{0.55-i*0.06:.2f}"/>'
        for i in range(7)
    )
    write_svg(
        "mystery-timetravel.svg",
        svg_wrap(
            grid_lines(90, 0.05)
            + starfield(103, 95, 700)
            + '<ellipse cx="600" cy="375" rx="400" ry="260" fill="url(#blueGlow)"/>'
            + '<polygon points="410,120 790,120 600,375" fill="#6C9EFF" opacity="0.14"/>'
            + '<polygon points="410,630 790,630 600,375" fill="#E5B66A" opacity="0.12"/>'
            + '<line x1="410" y1="120" x2="790" y2="630" stroke="#6C9EFF" stroke-width="1.5" opacity="0.5"/>'
            + '<line x1="790" y1="120" x2="410" y2="630" stroke="#E5B66A" stroke-width="1.5" opacity="0.5"/>'
            + ellipses
            + '<circle cx="600" cy="375" r="14" fill="#F4F6FB" opacity="0.9"/>'
        ),
    )
    galaxies = "".join(
        f'<ellipse cx="{180+i*185}" cy="{140+(i%3)*120}" rx="48" ry="18" fill="none" stroke="#6C9EFF" stroke-width="1.1" transform="rotate({-25+i*18} {180+i*185} {140+(i%3)*120})" opacity="0.38"/>'
        for i in range(5)
    )
    write_svg(
        "mystery-fermi.svg",
        svg_wrap(
            starfield(104, 150, 720)
            + '<ellipse cx="600" cy="350" rx="480" ry="280" fill="url(#blueGlow)"/>'
            + galaxies
            + '<circle cx="600" cy="400" r="68" fill="#18346B" stroke="#6C9EFF" stroke-width="1.6"/>'
            + '<circle cx="600" cy="400" r="145" fill="none" stroke="#E5B66A" stroke-width="1.1" stroke-dasharray="5 7" opacity="0.5"/>'
            + '<circle cx="600" cy="400" r="245" fill="none" stroke="#6C9EFF" stroke-width="0.9" stroke-dasharray="4 9" opacity="0.3"/>'
        ),
    )
    bars = "".join(
        f'<rect x="{260+i*92}" y="{540-h}" width="54" height="{h}" rx="6" fill="{"#E5B66A" if h>280 else "#6C9EFF"}" opacity="{0.35 + h/500:.2f}"/>'
        for i, h in enumerate([25, 95, 195, 315, 370, 235, 85, 28])
    )
    write_svg(
        "mystery-wow.svg",
        svg_wrap(
            grid_lines(80, 0.05)
            + starfield(105, 110, 420)
            + '<ellipse cx="600" cy="360" rx="450" ry="250" fill="url(#amberGlow)"/>'
            + '<path d="M120,620 Q600,460 1080,620" fill="none" stroke="#6C9EFF" stroke-width="1.8" opacity="0.5"/>'
            + bars
        ),
    )
    arcs = "".join(
        f'<circle cx="240" cy="240" r="{220+i*110}" fill="none" stroke="{"#E5B66A" if i==3 else "#6C9EFF"}" stroke-width="{2.2 if i==3 else 1.0}" stroke-dasharray="8 6" opacity="{0.65 if i==3 else 0.25}"/>'
        for i in range(5)
    )
    write_svg(
        "mystery-mh370.svg",
        svg_wrap(
            grid_lines(100, 0.05)
            + starfield(106, 60, 320)
            + '<rect x="0" y="420" width="1200" height="330" fill="url(#oceanGrad)"/>'
            + arcs
            + '<path d="M240,240 Q540,340 675,545" fill="none" stroke="#E5B66A" stroke-width="2" opacity="0.7"/>'
            + '<circle cx="675" cy="545" r="8" fill="#E5B66A"/>'
        ),
    )
    write_svg(
        "mystery-dyatlov.svg",
        svg_wrap(
            starfield(107, 100, 360)
            + '<ellipse cx="520" cy="300" rx="440" ry="210" fill="url(#blueGlow)"/>'
            + '<polygon points="0,560 280,310 560,430 890,260 1200,460 1200,750 0,750" fill="#16223D"/>'
            + '<polygon points="0,630 340,390 710,490 1200,360 1200,750 0,750" fill="#1D2E52" opacity="0.85"/>'
            + '<path d="M120,560 Q450,415 890,340 T1180,410" fill="none" stroke="#6C9EFF" stroke-width="1.6" stroke-dasharray="6 5" opacity="0.55"/>'
            + '<polygon points="520,495 575,455 620,495" fill="#E5B66A" opacity="0.7"/>'
        ),
    )
    rings = "".join(
        f'<ellipse cx="600" cy="495" rx="{90+i*75}" ry="{28+i*22}" fill="none" stroke="#6C9EFF" stroke-width="1.4" opacity="{0.6-i*0.1:.2f}"/>'
        for i in range(4)
    )
    cols = "".join(
        f'<rect x="{445+i*70}" y="355" width="22" height="130" rx="2" fill="url(#iceGrad)" opacity="0.45"/>'
        for i in range(5)
    )
    write_svg(
        "mystery-atlantis.svg",
        svg_wrap(
            '<ellipse cx="600" cy="240" rx="420" ry="260" fill="url(#blueGlow)"/>'
            + '<path d="M0,180 Q320,140 600,185 T1200,165 L1200,750 L0,750 Z" fill="url(#oceanGrad)"/>'
            + cols
            + rings
            + '<polygon points="490,20 600,470 710,20" fill="#6C9EFF" opacity="0.08"/>'
        ),
    )
    write_svg(
        "mystery-pyramids.svg",
        svg_wrap(
            starfield(109, 120, 420)
            + '<ellipse cx="600" cy="390" rx="450" ry="230" fill="url(#amberGlow)"/>'
            + '<polygon points="220,580 540,210 860,580" fill="url(#amberStone)"/>'
            + '<polygon points="540,210 860,580 710,580" fill="#0F172B" opacity="0.55"/>'
            + '<polygon points="730,580 940,330 1150,580" fill="url(#amberStone)" opacity="0.65"/>'
            + '<line x1="540" y1="210" x2="540" y2="55" stroke="#6C9EFF" stroke-width="1.2" stroke-dasharray="4 5" opacity="0.6"/>'
            + '<rect x="0" y="580" width="1200" height="170" fill="#0B1222"/>'
            + '<path d="M120,655 Q600,610 1080,665" fill="none" stroke="#6C9EFF" stroke-width="2" opacity="0.45"/>'
        ),
    )
    gears = "".join(
        f'<circle cx="600" cy="375" r="{70+i*48}" fill="none" stroke="{"#E5B66A" if i%2==0 else "#6C9EFF"}" stroke-width="{2.2 if i==2 else 1.3}" stroke-dasharray="{12-i} {6+i}" opacity="{0.75-i*0.1:.2f}"/>'
        for i in range(5)
    )
    write_svg(
        "mystery-antikythera.svg",
        svg_wrap(
            grid_lines(90, 0.04)
            + '<ellipse cx="600" cy="375" rx="400" ry="260" fill="url(#amberGlow)"/>'
            + gears
            + '<circle cx="485" cy="340" r="65" fill="none" stroke="#E5B66A" stroke-width="2" stroke-dasharray="9 5" opacity="0.65"/>'
            + '<circle cx="725" cy="410" r="82" fill="none" stroke="#6C9EFF" stroke-width="1.6" stroke-dasharray="7 5" opacity="0.55"/>'
            + '<circle cx="600" cy="375" r="16" fill="#E5B66A" opacity="0.9"/>'
        ),
    )
    steps = "".join(
        f'<rect x="{310+i*32}" y="{320+i*28}" width="{580-i*64}" height="{270-i*42}" rx="4" fill="none" stroke="#E5B66A" stroke-width="1.5" opacity="{0.7-i*0.12:.2f}"/>'
        for i in range(4)
    )
    write_svg(
        "mystery-indus.svg",
        svg_wrap(
            starfield(111, 70, 290)
            + '<ellipse cx="600" cy="400" rx="420" ry="220" fill="url(#amberGlow)"/>'
            + steps
            + '<rect x="430" y="420" width="340" height="90" fill="#6C9EFF" opacity="0.16"/>'
            + '<line x1="160" y1="625" x2="1040" y2="625" stroke="#6C9EFF" stroke-width="1.2" opacity="0.4"/>'
        ),
    )
    write_svg(
        "mystery-mariana.svg",
        svg_wrap(
            '<ellipse cx="600" cy="450" rx="380" ry="250" fill="url(#blueGlow)"/>'
            + '<polygon points="0,120 340,160 560,645 640,645 860,160 1200,120 1200,750 0,750" fill="#070D1D"/>'
            + '<path d="M180,145 L560,645 L640,645 L1020,145" fill="none" stroke="#6C9EFF" stroke-width="2" opacity="0.6"/>'
            + '<polygon points="580,430 490,645 710,645" fill="#6C9EFF" opacity="0.16"/>'
            + '<circle cx="585" cy="425" r="10" fill="#E5B66A"/>'
        ),
    )
    arcs_dm = "".join(
        f'<circle cx="600" cy="375" r="{85+i*52}" fill="none" stroke="{"#6C9EFF" if i%2==0 else "#A8C3FF"}" stroke-width="1.5" stroke-dasharray="42 28" opacity="{0.65-i*0.09:.2f}"/>'
        for i in range(5)
    )
    write_svg(
        "mystery-darkmatter.svg",
        svg_wrap(
            starfield(113, 170, 730)
            + '<ellipse cx="600" cy="375" rx="440" ry="290" fill="url(#blueGlow)"/>'
            + arcs_dm
            + '<ellipse cx="600" cy="375" rx="140" ry="52" fill="#E5B66A" opacity="0.22" transform="rotate(-18 600 375)"/>'
            + '<circle cx="600" cy="375" r="22" fill="#F4F6FB" opacity="0.9"/>'
        ),
    )
    write_svg(
        "mystery-nazca.svg",
        svg_wrap(
            grid_lines(120, 0.04)
            + '<ellipse cx="600" cy="375" rx="460" ry="260" fill="url(#amberGlow)"/>'
            + '<polygon points="180,580 560,180 650,180 1020,580" fill="none" stroke="#E5B66A" stroke-width="2.2" opacity="0.65"/>'
            + '<line x1="120" y1="380" x2="1080" y2="380" stroke="#E5B66A" stroke-width="1.5" opacity="0.5"/>'
            + '<path d="M520,380 Q580,290 640,380 T760,380" fill="none" stroke="#6C9EFF" stroke-width="2" opacity="0.6"/>'
            + '<circle cx="600" cy="380" r="110" fill="none" stroke="#E5B66A" stroke-width="1.4" stroke-dasharray="6 6" opacity="0.5"/>'
        ),
    )
    write_svg(
        "mystery-roopkund.svg",
        svg_wrap(
            starfield(115, 110, 340)
            + '<ellipse cx="600" cy="350" rx="450" ry="220" fill="url(#blueGlow)"/>'
            + '<polygon points="0,470 240,210 470,380 710,165 960,360 1200,235 1200,560 0,560" fill="#172442"/>'
            + '<ellipse cx="600" cy="575" rx="340" ry="68" fill="#1C3768" stroke="#6C9EFF" stroke-width="1.8"/>'
            + '<ellipse cx="600" cy="575" rx="220" ry="38" fill="#6C9EFF" opacity="0.22"/>'
        ),
    )
    nodes = [(340, 350), (470, 250), (610, 295), (760, 240), (860, 380), (700, 490), (500, 470), (600, 375)]
    edges = []
    for i, (x1, y1) in enumerate(nodes):
        for x2, y2 in nodes[i + 1 :]:
            edges.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#6C9EFF" stroke-width="1" opacity="0.32"/>')
    pts = [f'<circle cx="{x}" cy="{y}" r="8" fill="{"#E5B66A" if idx%2==0 else "#6C9EFF"}"/>' for idx, (x, y) in enumerate(nodes)]
    write_svg(
        "mystery-consciousness.svg",
        svg_wrap(
            '<ellipse cx="600" cy="375" rx="440" ry="270" fill="url(#blueGlow)"/>'
            + '<ellipse cx="600" cy="375" rx="280" ry="180" fill="url(#amberGlow)"/>'
            + "".join(edges)
            + "".join(pts)
            + '<path d="M160,610 Q280,530 400,610 T640,610 T880,610 T1060,610" fill="none" stroke="#E5B66A" stroke-width="1.8" opacity="0.65"/>'
        ),
    )

    # 12 Exhibition Category SVGs + matching new mystery plates
    ops = build_operations_plate()
    time_p = build_time_anomaly_plate()
    enc = build_encounters_plate()
    soc = build_societies_plate()
    sig = build_signals_plate()
    cre = build_creatures_plate()
    ufo = build_ufo_plate()
    dis = build_disappearances_plate()
    exp = build_experiments_plate()
    sci = build_scientific_plate()

    write_svg("cat-01-operations.svg", ops)
    write_svg("cat-02-time.svg", time_p)
    write_svg("cat-03-encounters.svg", enc)
    write_svg("cat-04-societies.svg", soc)
    write_svg("cat-05-signals.svg", sig)
    write_svg("cat-06-creatures.svg", cre)
    write_svg("cat-09-ufo.svg", ufo)
    write_svg("cat-10-disappearances.svg", dis)
    write_svg("cat-11-experiments.svg", exp)
    write_svg("cat-12-scientific.svg", sci)

    for dst, src in {
        "cat-07-earth.svg": "mystery-antarctica.svg",
        "cat-08-civilizations.svg": "mystery-antikythera.svg",
    }.items():
        with open(os.path.join(OUT_DIR, src), "r", encoding="utf-8") as f:
            write_svg(dst, f.read())

    # Dedicated mystery plates for new categories
    write_svg("mystery-operations.svg", ops)
    write_svg("mystery-time-anomaly.svg", time_p)
    write_svg("mystery-encounter.svg", enc)
    write_svg("mystery-society.svg", soc)
    write_svg("mystery-signal.svg", sig)
    write_svg("mystery-cryptid.svg", cre)
    write_svg("mystery-ufo.svg", ufo)
    write_svg("mystery-disappearance.svg", dis)
    write_svg("mystery-experiment.svg", exp)
    write_svg("mystery-cipher.svg", build_cipher_plate())

    print(f"Generated SVG artwork plates in {OUT_DIR}")


if __name__ == "__main__":
    build_all()
