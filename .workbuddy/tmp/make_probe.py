import io, os, re, sys

SRC = r"E:/code/xtdddd/云南河湖长制十周年成果云展.html"
OUT = r"E:/code/xtdddd/.workbuddy/tmp"

overflow_js = """
<script>
(function(){
  function run(){
    var vw = window.innerWidth;
    var docW = document.documentElement.scrollWidth;
    var bad = [];
    var all = document.querySelectorAll('body *');
    for (var i=0;i<all.length;i++){
      var el = all[i];
      var r = el.getBoundingClientRect();
      if (r.width <= 0) continue;
      if (r.right <= vw + 1 && r.left >= -1) continue;
      var p = el.parentElement, scroller = false;
      while (p && p !== document.body){
        var cs = getComputedStyle(p);
        if (cs.overflowX === 'auto' || cs.overflowX === 'scroll'){ scroller = true; break; }
        p = p.parentElement;
      }
      if (scroller) continue;
      bad.push(el.tagName.toLowerCase() + '.' + (el.className || '-') + '[' + Math.round(r.left) + '~' + Math.round(r.right) + ']');
    }
    document.title = 'RESULT vw=' + vw + ' docW=' + docW + ' | ' + (bad.length ? bad.slice(0,10).join(' ;; ') : 'NO-OVERFLOW');
  }
  if (document.readyState === 'complete') run(); else window.addEventListener('load', run);
})();
</script>
"""

nav_js = """
<script>
window.addEventListener('load', function(){
  var b = document.getElementById('navToggle');
  if (b) b.click();
});
</script>
"""

html = io.open(SRC, encoding='utf-8').read()

def emit(name, extra):
    io.open(os.path.join(OUT, name), 'w', encoding='utf-8').write(html.replace('</body>', extra + '</body>'))

emit('probe_overflow.html', overflow_js)
emit('probe_nav.html', nav_js)
print('ok')
