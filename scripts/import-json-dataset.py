#!/usr/bin/env python3
"""Import a local JSON dataset into data/ without scraping.
Usage:
  python3 scripts/import-json-dataset.py source.json data/driving-official.local.json
Only import data you have the right to use/share. Do not commit copyrighted/private data unless licensed.
"""
import json, shutil, sys
from pathlib import Path
if len(sys.argv)!=3:
    print(__doc__); sys.exit(2)
src=Path(sys.argv[1]); dst=Path(sys.argv[2])
if not src.exists(): raise SystemExit(f"Missing source: {src}")
with src.open('r',encoding='utf-8') as f: json.load(f)
dst.parent.mkdir(parents=True,exist_ok=True)
shutil.copyfile(src,dst)
print(f"Imported {src} -> {dst}")
