"""Assemble beat-quest.html from the parts in this folder (in name order)."""
from pathlib import Path
here = Path(__file__).resolve().parent
parts = sorted(p for p in here.iterdir() if p.suffix in ('.html', '.js') and p.name[:2].isdigit())
out = here.parent / 'beat-quest.html'
out.write_text(''.join(p.read_text(encoding='utf-8') for p in parts), encoding='utf-8')
print('built', out, out.stat().st_size // 1024, 'KB from', [p.name for p in parts])
