#!/usr/bin/env python3
"""
Organize Jason's OneDrive Desktop into content folders.
Moves files only (no deletes). Leaves existing subfolders in place.
Also copies shared-chrome bat from local Desktop if missing.
"""
from __future__ import annotations

import shutil
from pathlib import Path

ONEDRIVE = Path("/mnt/c/Users/jason/OneDrive/Desktop")
LOCAL = Path("/mnt/c/Users/jason/Desktop")

# Destination folders (created under OneDrive Desktop)
FOLDERS = {
    "OpenClaw_Tools": "OpenClaw / agent tools",
    "Art_FractalFuzion": "Fractal / NFT / generative art",
    "Real_Estate_Docs": "RE PDFs, disclosures, licenses, pre-approvals",
    "Branding_Marketing": "Email sig, eXp logos, merch mockups",
    "Photos_Misc": "Screenshots, social downloads, random images",
    "Shortcuts": "Desktop .lnk shortcuts",
    "Videos_Media": "Large video / media files",
}

# Exact-name moves
EXACT: dict[str, str] = {
    "Start-OpenClaw-Shared-Chrome.bat": "OpenClaw_Tools",
    "cardano-ouroboros-vision.jpg": "Art_FractalFuzion",
    "Email Signature (2).gif": "Branding_Marketing",
    "exp-agent.webp": "Branding_Marketing",
    "exp-realty.png": "Branding_Marketing",
    "unisex-long-sleeve-tee-black-heather-front-6a39872954729.png": "Branding_Marketing",
    "Daedalus Mainnet.lnk": "Shortcuts",
    "GrabIt.lnk": "Shortcuts",
    "Microsoft Edge-yo.lnk": "Shortcuts",
    "Interstellar.2014.TS.XViD.AC3.MrSeeN-SiMPLE.avi": "Videos_Media",
    # RE docs
    "360_Property_View1055.pdf": "Real_Estate_Docs",
    "61833 alta mesa active.pdf": "Real_Estate_Docs",
    "61833 alta mesa joshua tree expired.pdf": "Real_Estate_Docs",
    "Agent Visual Inspection Disclosure 1 - 624.pdf": "Real_Estate_Docs",
    "alta mesa.pdf": "Real_Estate_Docs",
    "Buyer Contingency Removal #1 - 6_24 doris.pdf": "Real_Estate_Docs",
    "Buyer Representation and Broker Compensation Agreement - 1225 signed 5.pdf": "Real_Estate_Docs",
    "harris.pdf": "Real_Estate_Docs",
    "Pre Approval Letter - $955K.pdf": "Real_Estate_Docs",
    "shuimei recipt business license4.pdf": "Real_Estate_Docs",
    "sxb dl.pdf": "Real_Estate_Docs",
    "vista grande.pdf": "Real_Estate_Docs",
}

# Prefix rules (checked after exact)
PREFIX_RULES: list[tuple[str, str]] = [
    # Fractal series 01_ ... 10_
    ("01_", "Art_FractalFuzion"),
    ("02_", "Art_FractalFuzion"),
    ("03_", "Art_FractalFuzion"),
    ("04_", "Art_FractalFuzion"),
    ("05_", "Art_FractalFuzion"),
    ("06_", "Art_FractalFuzion"),
    ("07_", "Art_FractalFuzion"),
    ("08_", "Art_FractalFuzion"),
    ("09_", "Art_FractalFuzion"),
    ("10_", "Art_FractalFuzion"),
]

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".heic"}
SKIP_NAMES = {"desktop.ini"}
# Existing dirs we never move
KEEP_DIRS = {
    "pictures",
    "tierra libertia",
    "novas folder",
    "FractalFuzion_Concepts",
    *FOLDERS.keys(),
}


def classify(name: str, ext: str) -> str | None:
    if name in EXACT:
        return EXACT[name]
    for prefix, folder in PREFIX_RULES:
        if name.startswith(prefix):
            return folder
    if ext == ".lnk":
        return "Shortcuts"
    if ext in {".pdf", ".doc", ".docx"}:
        return "Real_Estate_Docs"
    if ext in {".avi", ".mp4", ".mkv", ".mov", ".wmv"}:
        return "Videos_Media"
    if ext in IMAGE_EXTS:
        # leftover images → Photos_Misc
        return "Photos_Misc"
    if ext == ".bat":
        return "OpenClaw_Tools"
    return None


def unique_dest(dest: Path) -> Path:
    if not dest.exists():
        return dest
    stem, suffix = dest.stem, dest.suffix
    n = 2
    while True:
        cand = dest.with_name(f"{stem}__dup{n}{suffix}")
        if not cand.exists():
            return cand
        n += 1


def main() -> int:
    if not ONEDRIVE.exists():
        print("ERROR: OneDrive Desktop missing", ONEDRIVE)
        return 1

    # Ensure target folders
    for folder in FOLDERS:
        (ONEDRIVE / folder).mkdir(exist_ok=True)

    # Copy bat from local Desktop if present
    local_bat = LOCAL / "Start-OpenClaw-Shared-Chrome.bat"
    od_bat = ONEDRIVE / "Start-OpenClaw-Shared-Chrome.bat"
    tools_bat = ONEDRIVE / "OpenClaw_Tools" / "Start-OpenClaw-Shared-Chrome.bat"
    if local_bat.exists():
        shutil.copy2(local_bat, tools_bat)
        # Also leave a copy on Desktop root for easy double-click
        shutil.copy2(local_bat, od_bat)
        print(f"COPIED bat → OneDrive root + OpenClaw_Tools")
    elif not od_bat.exists() and tools_bat.exists():
        shutil.copy2(tools_bat, od_bat)
        print("COPIED bat tools → root")

    moved = []
    skipped = []
    unknown = []

    for p in sorted(ONEDRIVE.iterdir(), key=lambda x: x.name.lower()):
        if p.name.startswith(".") or p.name.lower() in SKIP_NAMES:
            continue
        if p.is_dir():
            if p.name in KEEP_DIRS or p.name in FOLDERS:
                skipped.append((p.name, "keep-dir"))
            else:
                skipped.append((p.name, "other-dir-left"))
            continue
        if not p.is_file():
            continue

        # Keep one easy bat on root (after copy); still also have tools copy
        if p.name == "Start-OpenClaw-Shared-Chrome.bat":
            # Ensure tools copy exists; leave root copy
            if not tools_bat.exists():
                shutil.copy2(p, tools_bat)
                moved.append((p.name, "OpenClaw_Tools (copy)", "bat-root-kept"))
            else:
                skipped.append((p.name, "bat-root-kept"))
            continue

        folder = classify(p.name, p.suffix.lower())
        if not folder:
            unknown.append(p.name)
            continue

        dest_dir = ONEDRIVE / folder
        dest = unique_dest(dest_dir / p.name)
        shutil.move(str(p), str(dest))
        moved.append((p.name, folder, dest.name))

    # README in OpenClaw_Tools
    readme = ONEDRIVE / "OpenClaw_Tools" / "README_shared_browser.txt"
    readme.write_text(
        "Shared browser (Nova + Jason)\r\n"
        "==============================\r\n"
        "1. Double-click Start-OpenClaw-Shared-Chrome.bat (also on Desktop root).\r\n"
        "2. Wait for JSON from curl (Browser / Protocol-Version).\r\n"
        "3. Tell Nova in chat: chrome up\r\n"
        "\r\n"
        "Uses a DEDICATED Chrome profile at %LOCALAPPDATA%\\OpenClaw\\ChromeCDP\r\n"
        "— not your personal Chrome / password manager.\r\n",
        encoding="utf-8",
    )

    print("\n=== MOVED ===")
    for name, folder, dest in moved:
        print(f"  {name}  →  {folder}/" + (f" (as {dest})" if dest != name else ""))
    print(f"\ncount_moved={len(moved)}")

    print("\n=== SKIPPED ===")
    for name, why in skipped:
        print(f"  {name}  ({why})")

    if unknown:
        print("\n=== UNKNOWN (left on Desktop) ===")
        for name in unknown:
            print(f"  {name}")

    # Remaining top-level
    print("\n=== REMAINING TOP-LEVEL ===")
    for p in sorted(ONEDRIVE.iterdir(), key=lambda x: x.name.lower()):
        if p.name.lower() == "desktop.ini":
            continue
        mark = "DIR " if p.is_dir() else "FILE"
        print(f"  [{mark}] {p.name}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
