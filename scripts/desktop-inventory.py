#!/usr/bin/env python3
"""Inventory Windows Desktop folders (local + OneDrive)."""
from pathlib import Path

ROOTS = [
    ("LOCAL", Path("/mnt/c/Users/jason/Desktop")),
    ("ONEDRIVE", Path("/mnt/c/Users/jason/OneDrive/Desktop")),
]


def list_dir(root: Path):
    items = []
    if not root.exists():
        return items
    for p in sorted(root.iterdir(), key=lambda x: x.name.lower()):
        if p.name.startswith(".") or p.name.lower() == "desktop.ini":
            continue
        try:
            st = p.stat()
            kind = "DIR" if p.is_dir() else "FILE"
            ext = p.suffix.lower() if p.is_file() else ""
            child_n = None
            if p.is_dir():
                try:
                    child_n = sum(1 for _ in p.iterdir())
                except OSError:
                    child_n = -1
            items.append(
                {
                    "kind": kind,
                    "name": p.name,
                    "size": st.st_size,
                    "ext": ext,
                    "children": child_n,
                    "path": str(p),
                }
            )
        except OSError as exc:
            items.append(
                {
                    "kind": "ERR",
                    "name": p.name,
                    "size": 0,
                    "ext": "",
                    "children": None,
                    "path": str(p),
                    "error": str(exc),
                }
            )
    return items


def main():
    for label, root in ROOTS:
        print(f"### {label} {root}")
        items = list_dir(root)
        if not items and not root.exists():
            print("missing")
            print()
            continue
        files = [i for i in items if i["kind"] == "FILE"]
        dirs = [i for i in items if i["kind"] == "DIR"]
        total = sum(i["size"] for i in files)
        print(f"count={len(items)} files={len(files)} dirs={len(dirs)} file_bytes={total}")
        for i in items:
            if i["kind"] == "DIR":
                print(f"  [DIR] {i['name']}/ ({i['children']} entries)")
            elif i["kind"] == "ERR":
                print(f"  [ERR] {i['name']} {i.get('error')}")
            else:
                print(f"  [FILE] {i['name']}  {i['size']}  {i['ext']}")
        print()


if __name__ == "__main__":
    main()
