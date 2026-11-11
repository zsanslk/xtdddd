/* 典型案例弹层
   - 条目标题旁的「典型案例」按钮 → 就地弹层，不跳页
   - 交互与登录弹层保持一致：点遮罩空白关闭、ESC 关闭、锁背景滚动、焦点还原 */
(function () {
  'use strict';

  var triggers = [].slice.call(document.querySelectorAll('[data-case]'));
  if (!triggers.length) return;

  var lastFocus = null;

  function open(mask, trigger) {
    lastFocus = trigger || document.activeElement;
    mask.hidden = false;
    document.body.classList.add('dlg-open');
    /* 锁滚动会让滚动条消失、正文横跳，补回同宽内边距 */
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = sbw > 0 ? sbw + 'px' : '';
    /* 再次打开时回到顶部，不延续上次的滚动位置 */
    var box = mask.querySelector('.dlg');
    if (box) box.scrollTop = 0;
    var closeBtn = mask.querySelector('[data-case-close]');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close(mask) {
    mask.hidden = true;
    document.body.classList.remove('dlg-open');
    document.body.style.paddingRight = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  var masks = [];

  triggers.forEach(function (btn) {
    var mask = document.getElementById(btn.getAttribute('data-case'));
    if (!mask) return;
    masks.push(mask);

    btn.addEventListener('click', function () { open(mask, btn) });

    var x = mask.querySelector('[data-case-close]');
    if (x) x.addEventListener('click', function () { close(mask) });

    mask.addEventListener('mousedown', function (e) {
      if (e.target === mask) close(mask);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    /* 大图优先关：叠在弹层之上，Esc 一步退一层 */
    if (viewer && !viewer.hidden) {
      closeViewer();
      return;
    }
    masks.forEach(function (mask) {
      if (!mask.hidden) close(mask);
    });
  });

  /* ------------------------------------------------------ 照片查看大图 */

  var viewer = document.getElementById('caseViewer');
  var viewerImg = viewer && viewer.querySelector('img');
  var lastImg = null;

  function openViewer(img) {
    if (!viewer || !viewerImg) return;
    lastImg = img;
    viewerImg.src = img.getAttribute('src');
    viewerImg.alt = img.getAttribute('alt') || '';
    viewer.hidden = false;
    viewer.focus({ preventScroll: true });
  }

  function closeViewer() {
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    viewerImg.removeAttribute('src');
    if (lastImg && lastImg.focus) lastImg.focus({ preventScroll: true });
  }

  if (viewer) {
    /* 点图片本身不关，避免放大细看时一碰就退；点空白处才返回 */
    viewer.addEventListener('click', function (e) {
      if (e.target === viewerImg) return;
      closeViewer();
    });
    viewer.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        closeViewer();
      }
    });
  }

  [].slice.call(document.querySelectorAll('.case-pics img')).forEach(function (img) {
    img.addEventListener('click', function () { openViewer(img) });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        openViewer(img);
      }
    });
  });
})();
