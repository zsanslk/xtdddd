/* 二级标题折叠（作用范围：所有带 .gv 的章节，即第一、二章）
   把每个 h4.sec 与其后、下一个 h4.sec 之前的内容包进 .sec-body，
   标题本身变成开关，进页面默认收起，只留标题。其他章节不动。 */
(function () {
  'use strict';

  var roots = [].slice.call(document.querySelectorAll('section.gv'));
  var hashId = (location.hash || '').replace('#', '');
  /* 各节的开合函数，键为标题 id，供「切回第一章时自动展开」复用 */
  var secToggles = {};

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

      // 默认收起；地址栏锚点正指向本节时保持展开，深链接不落到空标题上
      // 第一章「一、习近平总书记讲话」例外：进章即展开，让首页直接看到论述原文
      var keepOpen = (hashId && head.id === hashId) || head.id === 'ch1-s1';
      toggle(!keepOpen);
      if (head.id) secToggles[head.id] = toggle;
    });
  });

  /* 切回第一章（含首屏）时自动展开「一、习近平总书记讲话」：
     用户可能在上次浏览中手动收起过，重进章应回到「标题 + 内容」的完整状态 */
  (function () {
    var ch1 = document.getElementById('ch1');
    var openS1 = secToggles['ch1-s1'];
    if (!ch1 || !openS1) return;

    function expandIfInCh1() {
      if (ch1.classList.contains('on')) openS1(false);
    }

    expandIfInCh1();
    /* 切章靠 .chapter 的 .on 类，监听属性即可，无需改动 index.js */
    if (window.MutationObserver) {
      new MutationObserver(expandIfInCh1)
        .observe(ch1, { attributes: true, attributeFilter: ['class'] });
    }
    /* 已停留在第一章时再点「文件总览」，不会触发类变化，这里补一次 */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-ch="ch1"]');
      if (a && ch1.classList.contains('on')) openS1(false);
    }, true);
  })();

  /* 目录点二级标题时，先把被折叠的那节展开，否则滚到空白处 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.toc-sub');
    if (!a) return;
    var id = (a.getAttribute('href') || '').slice(1);
    var head = id && document.getElementById(id);
    if (head && head.classList.contains('is-collapsed')) head.click();
  }, true);

  /* 三级标题折叠（作用范围：.gv 卡片内带 .foldable 的 h3，目前为清四乱四类）
     把 h3 与其后、下一个 h3 之前的内容包进 .h3-body，标题本身变成开关，默认展开。
     四级标题（h4.sec）的折叠在上面单独处理，两者互不干扰。 */
  roots.forEach(function (root) {
    var heads = [].slice.call(root.querySelectorAll('.card h3.foldable'));

    heads.forEach(function (head, idx) {
      var nodes = [];
      var n = head.nextSibling;
      while (n && !(n.nodeType === 1 && n.tagName === 'H3')) {
        nodes.push(n);
        n = n.nextSibling;
      }
      if (!nodes.length) return;

      var body = document.createElement('div');
      body.className = 'h3-body';
      body.id = 'h3-body-' + (head.id || idx);
      nodes.forEach(function (node) { body.appendChild(node) });
      head.parentNode.insertBefore(body, head.nextSibling);

      var caret = document.createElement('span');
      caret.className = 'h3-caret';
      caret.setAttribute('aria-hidden', 'true');
      head.appendChild(caret);

      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-expanded', 'true');
      head.setAttribute('aria-controls', body.id);

      function toggle(force) {
        var collapse = typeof force === 'boolean' ? force : !head.classList.contains('is-collapsed');
        head.classList.toggle('is-collapsed', collapse);
        body.hidden = collapse;
        head.setAttribute('aria-expanded', collapse ? 'false' : 'true');
        /* 卡内三级标题全部收起时同步收紧卡片内边距 */
        var card = head.closest && head.closest('.card');
        if (card) {
          var anyOpen = [].some.call(card.querySelectorAll('h3.foldable'), function (x) {
            return !x.classList.contains('is-collapsed');
          });
          card.classList.toggle('is-h3-collapsed', !anyOpen);
        }
      }

      head.addEventListener('click', function () { toggle() });
      head.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          toggle();
        }
      });

      // 默认收起，先看到四类名称；地址栏锚点正指向本节时保持展开
      toggle(!(hashId && head.id === hashId));
    });
  });
})();

/* ===== ch9 湖泊水系：二级标题折叠 + 九湖三级标题折叠 ===== */
(function () {
  'use strict';
  /* 合并「高原湖泊」与「六大水系」后，.lakebook 内有两个 .part（p1 湖泊 / p2 水系），逐节处理 */
  var parts = [].slice.call(document.querySelectorAll('#ch9 .lakebook .part'));
  if (!parts.length) return;
  var hashId = (location.hash || '').replace('#', '');

  function bindToggle(head, body) {
    function toggle(force) {
      var collapse = typeof force === 'boolean' ? force : !head.classList.contains('is-collapsed');
      head.classList.toggle('is-collapsed', collapse);
      body.hidden = collapse;
      head.setAttribute('aria-expanded', collapse ? 'false' : 'true');
    }
    head.addEventListener('click', function () { toggle(); });
    head.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggle();
      }
    });
    return toggle;
  }

  /* 1) 二级标题：各 .part 的直接子 h3（一、总体概况 … 七、三条重点河流） */
  parts.forEach(function (part, pi) {
    [].slice.call(part.children).filter(function (el) { return el.tagName === 'H3'; })
      .forEach(function (head, hi) {
        var nodes = [];
        var n = head.nextSibling;
        while (n && !(n.nodeType === 1 && n.tagName === 'H3')) { nodes.push(n); n = n.nextSibling; }
        if (!nodes.length) return;

        var body = document.createElement('div');
        body.className = 'sec-body';
        body.id = 'sec-body-' + (head.id || pi + '-' + hi);
        nodes.forEach(function (node) { body.appendChild(node); });
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

        var toggle = bindToggle(head, body);
        toggle(!(hashId && head.id === hashId));
      });
  });

  /* 2) 九湖三级标题：.ws-page 的 .ws-head 做开关，其后内容折叠，默认收起 */
  var pages = [];
  parts.forEach(function (p) { pages = pages.concat([].slice.call(p.querySelectorAll('.ws-page'))); });
  pages.forEach(function (page) {
    var head = page.querySelector('.ws-head');
    if (!head) return;
    var nodes = [];
    var n = head.nextSibling;
    while (n) { var nx = n.nextSibling; nodes.push(n); n = nx; }
    if (!nodes.length) return;

    var body = document.createElement('div');
    body.className = 'lake-body';
    nodes.forEach(function (node) { body.appendChild(node); });
    page.appendChild(body);

    var caret = document.createElement('span');
    caret.className = 'lake-caret';
    caret.setAttribute('aria-hidden', 'true');
    head.appendChild(caret);

    head.classList.add('lake-toggle');
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.setAttribute('aria-expanded', 'true');

    var toggle = bindToggle(head, body);
    toggle(true);
  });
})();
