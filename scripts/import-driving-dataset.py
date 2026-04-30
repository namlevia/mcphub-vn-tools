#!/usr/bin/env python3
"""Normalize a legally obtained driving-question JSON dataset.
Input format can be:
  [{"question":"...","choices":[...],"answer":0,"topic":"...","vehicle":"oto|xe_may"}, ...]
Output format matches data/driving-samples.json.
"""
import json, sys
from pathlib import Path
if len(sys.argv)<3:
    print(__doc__); sys.exit(2)
src=Path(sys.argv[1]); dst=Path(sys.argv[2])
items=json.load(src.open(encoding='utf-8'))
out={"note":"User-imported dataset. Ensure you have legal rights to use/share it.","oto":[],"xe_may":[]}
for it in items:
    v=it.get('vehicle') or it.get('loai') or 'oto'
    key='xe_may' if str(v).lower() in {'xe_may','xemay','a1','moto','motorbike'} else 'oto'
    q={"question":it['question'],"choices":it.get('choices') or it.get('options') or [],"answer":it.get('answer',0),"topic":it.get('topic','')}
    out[key].append(q)
dst.parent.mkdir(parents=True,exist_ok=True)
json.dump(out,dst.open('w',encoding='utf-8'),ensure_ascii=False,indent=2)
print(f"Wrote {dst}: oto={len(out['oto'])}, xe_may={len(out['xe_may'])}")
