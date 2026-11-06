import io, os

OUT = r"E:/code/xtdddd/.workbuddy/tmp"

TPL = """<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>PENDING</title>
<style>html,body{{margin:0;background:#ddd}}iframe{{border:0;display:block;background:#fff}}</style>
</head><body>
<iframe id="f" src="{src}" width="{w}" height="{h}" scrolling="no"></iframe>
<script>
var f = document.getElementById('f');
function grab(){{
  try {{
    var t = f.contentDocument.title;
    if (t && t.indexOf('RESULT') === 0) document.title = t;
    else if (t && t.indexOf('nav-open') === 0) document.title = t;
  }} catch(e) {{ document.title = 'ERR ' + e.message; }}
}}
f.addEventListener('load', function(){{ grab(); setTimeout(grab, 300); setTimeout(grab, 900); }});
</script>
</body></html>
"""

for w, h in [(320, 640), (360, 740), (390, 844), (414, 896), (480, 900),
             (600, 960), (768, 1024), (834, 1112), (1024, 768), (1280, 800)]:
    io.open(os.path.join(OUT, 'frame_%d.html' % w), 'w', encoding='utf-8').write(
        TPL.format(src='probe_overflow.html', w=w, h=h))
    io.open(os.path.join(OUT, 'frame_nav_%d.html' % w), 'w', encoding='utf-8').write(
        TPL.format(src='probe_nav.html', w=w, h=h))
print('ok')
