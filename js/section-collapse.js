/* 二级标题折叠（作用范围：所有带 .gv 的章节，即第一、二章）
   把每个 h4.sec 与其后、下一个 h4.sec 之前的内容包进 .sec-body，
   标题本身变成开关。其他章节不动，确认效果后再决定是否推广。 */
(function () {
  'use strict';

  var roots = [].slice.call(document.querySelectorAll('section.gv'));

  roots.forEach(function (root) {
    var heads = [].slice.call(root.querySelectorAll('h4.sec'));

    heads.forEach(function (head, idx) {
      var nodes = [];
      var n = head.nextSibling;
      while (n && !(n.nodeType === 1 && n.tagName === 'H4')) {
        nodes.push(n);
        n = n.nextSibling;
      }
      if (!nodes.length) return;

      var body = document.createElement('div');
      body.className = 'sec-body';
      body.id = 'sec-body-' + (head.id || idx);
      nodes.forEach(function (node) { body.appendChild(node) });
      head.parentNode.insertBefore(body, head.nextSibling);

      var caret = document.createElement('span');
      caret.className = 'sec-caret';
      caret.setAttribute('aria-hidden', 'true');
      head.appendChild(caret);

      head.classList.add('sec-toggle');
      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-expanded', 'true');
      head.setAttribute('aria-controls', body.id);
      head.dataset.secBody = body.id;

      function toggle(force) {
        var collapse = typeof force === 'boolean' ? force : !head.classList.contains('is-collapsed');
        head.classList.toggle('is-collapsed', collapse);
        body.hidden = collapse;
        head.setAttribute('aria-expanded', collapse ? 'false' : 'true');
      }

      head.addEventListener('click', function () { toggle() });
      head.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          toggle();
        }
      });
    });
  });

  /* 目录点二级标题时，先把被折叠的那节展开，否则滚到空白处 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.toc-sub');
    if (!a) return;
    var id = (a.getAttribute('href') || '').slice(1);
    var head = id && document.getElementById(id);
    if (head && head.classList.contains('is-collapsed')) head.click();
  }, true);
})();
