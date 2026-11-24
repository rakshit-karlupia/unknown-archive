"""Fetch real historical/encyclopedic images from Wikipedia/Wikimedia Commons
for mysteries in The Unknown Archive.

Uses batched Wikipedia API queries (up to 50 titles per call) and polite
rate-limited downloads with retry backoff.
"""
from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend",
    "public",
    "images",
    "dossier",
)
os.makedirs(OUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "TheUnknownArchiveBot/1.0 (https://github.com/unknown-archive; educational@archive.local) Python-urllib/3.12"
}

WIKI_MAP: dict[str, str] = {
    "antarctica-beneath-the-ice": "Vostok Station",
    "bermuda-triangle": "Bermuda Triangle",
    "time-travel": "Spacetime",
    "fermi-paradox": "Fermi paradox",
    "wow-signal": "Wow! signal",
    "mh370": "Malaysia Airlines Flight 370",
    "dyatlov-pass": "Dyatlov Pass incident",
    "lost-city-of-atlantis": "Atlantis",
    "ancient-egyptian-pyramids": "Giza pyramid complex",
    "antikythera-mechanism": "Antikythera mechanism",
    "indus-valley-civilization": "Mohenjo-daro",
    "mariana-trench": "Mariana Trench",
    "dark-matter": "Bullet Cluster",
    "nazca-lines": "Nazca Lines",
    "roopkund-skeleton-lake": "Roopkund",
    "consciousness-terminal-gamma": "Electroencephalography",
    "area-51": "Area 51",
    "dulce-base": "Dulce, New Mexico",
    "mount-weather": "Mount Weather Emergency Operations Center",
    "raven-rock": "Raven Rock Mountain Complex",
    "cheyenne-mountain": "Cheyenne Mountain Complex",
    "s4-papoose-lake": "Papoose Lake",
    "haarp": "High-frequency Active Auroral Research Program",
    "operation-paperclip": "Operation Paperclip",
    "project-azorian": "Project Azorian",
    "john-titor": "John Titor",
    "andrew-carlssin": "Wall Street",
    "rudolph-fentz": "Times Square",
    "moberly-jourdain-versailles": "Petit Trianon",
    "bold-street-time-slip": "Bold Street, Liverpool",
    "philadelphia-experiment": "USS Eldridge",
    "montauk-project": "Camp Hero State Park",
    "chronovisor": "Vatican Apostolic Archive",
    "time-traveller-photographs": "South Fork Bridge",
    "men-in-black": "Men in black",
    "man-from-taured": "Haneda Airport",
    "green-children-of-woolpit": "Woolpit",
    "somerton-man-tamam-shud": "Somerton Man",
    "isdal-woman": "Isdal Woman",
    "circleville-letters": "Circleville, Ohio",
    "voynich-manuscript": "Voynich manuscript",
    "greenbrier-ghost": "Greenbrier Ghost",
    "max-headroom-incident": "Max Headroom signal hijacking",
    "uvb-76-numbers-stations": "UVB-76",
    "loch-ness-monster": "Loch Ness",
    "himalayan-yeti": "Yeti",
    "project-blue-book": "Project Blue Book",
    "project-mogul": "Project Mogul",
    "illuminati": "Illuminati",
    "freemasons": "Freemasonry",
    "skull-and-bones": "Skull and Bones",
    "bilderberg-meetings": "Bilderberg Meeting",
    "bohemian-grove": "Bohemian Grove",
    "rosicrucians": "Rosicrucianism",
    "knights-templar": "Knights Templar",
    "priory-of-sion": "Rennes-le-Château",
    "order-of-the-golden-dawn": "Hermetic Order of the Golden Dawn",
    "the-hashshashin": "Alamut Castle",
    "franklin-expedition": "Franklin's lost expedition",
    "flannan-isles-lighthouse": "Flannan Isles Lighthouse",
    "roanoke-colony": "Roanoke Colony",
    "the-lost-patrol": "Fort McPherson, Northwest Territories",
    "mary-celeste": "Mary Celeste",
    "ambrose-bierce": "Ambrose Bierce",
    "princes-in-the-tower": "Princes in the Tower",
    "sodder-children": "Sodder children disappearance",
    "hinterkaifeck-murders": "Hinterkaifeck murders",
    "lead-masks-case": "Lead Masks Case",
    "mkultra": "MKUltra",
    "project-stargate": "Stargate Project",
    "project-artichoke": "Project ARTICHOKE",
    "operation-midnight-climax": "Operation Midnight Climax",
    "project-mknaomi": "Fort Detrick",
    "manhattan-project": "Trinity (nuclear test)",
    "operation-sea-spray": "Operation Sea-Spray",
    "tuskegee-study": "Tuskegee Syphilis Study",
    "soviet-sleep-experiment": "Russian Sleep Experiment",
}


def fetch_batch_urls(titles: list[str]) -> dict[str, str]:
    """Return {normalized_or_original_title: image_url} via 1 Wikipedia API call."""
    params = urllib.parse.urlencode({
        "action": "query",
        "prop": "pageimages",
        "piprop": "thumbnail",
        "pithumbsize": "960",
        "redirects": "1",
        "format": "json",
        "titles": "|".join(titles),
    })
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    query = data.get("query", {})
    # Map redirects and normalizations back to requested titles
    norm_map = {n["from"]: n["to"] for n in query.get("normalized", [])}
    redir_map = {r["from"]: r["to"] for r in query.get("redirects", [])}

    page_by_title: dict[str, str] = {}
    for page in query.get("pages", {}).values():
        t = page.get("title")
        thumb = page.get("thumbnail", {})
        src = thumb.get("source")
        w = thumb.get("width", 0)
        if t and src and w >= 320 and ".svg" not in src.lower():
            page_by_title[t] = src

    resolved: dict[str, str] = {}
    for orig in titles:
        cur = norm_map.get(orig, orig)
        cur = redir_map.get(cur, cur)
        if cur in page_by_title:
            resolved[orig] = page_by_title[cur]
    return resolved


def download_with_backoff(url: str, dest: str) -> int:
    delay = 1.5
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=25) as resp:
                data = resp.read()
            with open(dest, "wb") as f:
                f.write(data)
            return len(data)
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempt < 3:
                wait = delay * (2 ** attempt)
                time.sleep(wait)
                continue
            raise
    return 0


def existing_raster(slug: str) -> str | None:
    for ext in (".jpg", ".png", ".webp"):
        p = os.path.join(OUT_DIR, f"{slug}{ext}")
        if os.path.exists(p) and os.path.getsize(p) >= 8000:
            return f"/images/dossier/{slug}{ext}"
    return None


def main() -> None:
    all_items = list(WIKI_MAP.items())
    # Batch into chunks of 40 titles (2 API calls total)
    title_to_url: dict[str, str] = {}
    titles = [t for _, t in all_items]
    for i in range(0, len(titles), 40):
        chunk = titles[i : i + 40]
        title_to_url.update(fetch_batch_urls(chunk))
        time.sleep(0.5)

    print(f"API resolved {len(title_to_url)}/{len(all_items)} image URLs.")

    results: dict[str, str] = {}
    for slug, title in all_items:
        cached = existing_raster(slug)
        if cached:
            results[slug] = cached
            continue
        img_url = title_to_url.get(title)
        if not img_url:
            print(f"  - {slug}: no raster image ({title})")
            continue
        ext = ".jpg"
        lower = img_url.lower().split("?")[0]
        if lower.endswith(".png"):
            ext = ".png"
        elif lower.endswith(".webp"):
            ext = ".webp"
        filename = f"{slug}{ext}"
        dest = os.path.join(OUT_DIR, filename)
        try:
            size = download_with_backoff(img_url, dest)
            if size < 8000:
                if os.path.exists(dest):
                    os.remove(dest)
                print(f"  - {slug}: skipped tiny ({size} bytes)")
                continue
            results[slug] = f"/images/dossier/{filename}"
            print(f"  ✓ {slug} <- {filename} ({size // 1024} KB)")
            time.sleep(1.1)
        except Exception as exc:
            print(f"  ! {slug}: error ({exc})")
            time.sleep(2.0)

    manifest_path = os.path.join(OUT_DIR, "_real_images_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nTotal real images available: {len(results)}/{len(WIKI_MAP)}")


if __name__ == "__main__":
    main()
