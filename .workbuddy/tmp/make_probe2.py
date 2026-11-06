import io, os

SRC = r"E:/code/xtdddd/云南河湖长制十周年成果云展.html"
OUT = r"E:/code/xtdddd/.workbuddy/tmp"

geo_js = """
<script>
window.addEventListener('load', function(){
  var out = [];
  ['hall0','hall1','hall2','hall3b','hall3','hall4','hall5','hall6','hall8','hall7'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) out.push(id + ':' + Math.round(el.getBoundingClientRect().top + window.scrollY));
  });
  document.title = 'RESULT vw=' + window.innerWidth + ' docH=' + document.documentElement.scrollHeight + ' | ' + out.join(' ');
});
</script>
"""
nav_js = """
<script>
window.addEventListener('load', function(){
  var b = document.getElementById('navToggle');
  if (b) b.click();
  document.title = 'nav-open expanded=' + (b ? b.getAttribute('aria-expanded') : '?');
});
</script>
"""

FRAME = """<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>PENDING</title>
<style>html,body{{margin:0;background:#e8e8e8}}iframe{{border:0;display:block;background:#fff}}</style>
</head><body>
<iframe id="f" src="{src}" width="{w}" height="{h}"></iframe>
<script>
var f = document.getElementById('f'), q = f.contentWindow;
function grab(){{
  try {{
    var t = f.contentDocument.title;
    if (t && t.indexOf('RESULT') === 0) document.title = t;
  }} catch(e) {{ document.title = 'ERR ' + e.message; }}
}}
var y = parseInt((location.search.match(/y=(\\d+)/) || [0,0])[1], 10);
f.addEventListener('load', function(){{
  grab();
  try {{ var d=f.contentDocument; d.documentElement.style.scrollBehavior='auto'; d.body.style.scrollBehavior='auto'; f.contentWindow.scrollTo({{top:y,left:0,behavior:'instant'}}); }} catch(e) {{}}
  setTimeout(function(){{ grab(); }}, 350);
}});
</script>
</body></html>
"""

html = io.open(SRC, encoding='utf-8').read()
io.open(os.path.join(OUT, 'probe_geo.html'), 'w', encoding='utf-8').write(html.replace('</body>', geo_js + '</body>'))
io.open(os.path.join(OUT, 'probe_nav.html'), 'w', encoding='utf-8').write(html.replace('</body>', nav_js + '</body>'))

for w, h in [(320, 640), (360, 740), (390, 844), (414, 896), (480, 900),
             (600, 960), (768, 1024), (834, 1112), (1024, 768), (1280, 800)]:
    for name, src in (('frame_%d.html' % w, 'probe_overflow.html'),
                      ('frame_geo_%d.html' % w, 'probe_geo.html'),
                      ('frame_nav_%d.html' % w, 'probe_nav.html')):
        io.open(os.path.join(OUT, name), 'w', encoding='utf-8').write(FRAME.format(src=src, w=w, h=h))
print('ok')
