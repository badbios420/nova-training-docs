#!/usr/bin/env python3
import json, re, sys
raw = sys.stdin.read()
m = re.search(r"\{[\s\S]*\}\s*$", raw)
if not m:
    print(raw[:3000]); sys.exit(1)
d = json.loads(m.group(0))
print(f"visibleRows={d.get("visibleRows")} uniqueSenders={d.get("uniqueSenders")}")
print("TOP SENDERS (this page):")
for s in d.get("top", []):
    name = (s.get("name") or "")[:28]
    email = (s.get("email") or "")[:45]
    sample = (s.get("sample") or "")[:50]
    print(f"  {s.get("n", 0):2d}x  {name:28s}  {email}  | {sample}")
