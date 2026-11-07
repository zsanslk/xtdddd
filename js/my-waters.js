/* 「我管理的水域」独立视图
   页面级组件，不是弹层：进入后目录与正文让位，返回或切章即退出。
   登录/退出的状态由 login-modal.js 通过 hzz:session 事件广播。 */
(function () {
  'use strict';

  var view = document.getElementById('viewMine');
  var layout = document.querySelector('.layout');
  if (!view || !layout) return;

  var KEY = 'hzz_session';
  var guest = document.getElementById('vmGuest');
  var userBox = document.getElementById('vmUser');
  var userName = document.getElementById('vmUserName');
  var tabItem = document.querySelector('[data-open-login]');
  var isOpen = false;

  function readSession() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) { try { raw = sessionStorage.getItem(KEY); } catch (e) { raw = null; } }
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function render() {
    var s = readSession();
    var logged = !!(s && s.userName);
    if (guest) guest.hidden = logged;
    if (userBox) userBox.hidden = !logged;
    if (logged && userName) userName.textContent = s.userName;
    // 底栏高亮只在视图打开时算数
    if (tabItem) tabItem.classList.toggle('is-view', isOpen);
  }

  function setHash(h) {
    if (history.replaceState) history.replaceState(null, '', '#' + h);
  }

  function show() {
    if (isOpen) return;
    isOpen = true;
    layout.classList.add('is-mine');
    document.body.classList.add('view-mine-on');
    render();
    setHash('my');
    // 视图是覆盖层，只把自己的滚动条归零；底层正文的阅读位置原地不动
    if (view) {
      view.scrollTop = 0;
      view.focus({ preventScroll: true });
    }
    if (window.__hzzSyncNav) window.__hzzSyncNav();
  }

  function hide(refocus, keepHash) {
    if (!isOpen) return;
    isOpen = false;
    layout.classList.remove('is-mine');
    document.body.classList.remove('view-mine-on');
    if (tabItem) tabItem.classList.remove('is-view');
    if (!keepHash) {
      var cur = document.querySelector('.chapter.on');
      setHash(cur ? cur.id : 'ch1');
    }
    if (refocus && tabItem) tabItem.focus({ preventScroll: true });
    if (window.__hzzSyncNav) window.__hzzSyncNav();
  }

  /* 供 index.js 切章时调用，避免视图和正文同时在场；
     keepHash=true 时由调用方自己写 hash（切章后那是新章节的 id） */
  window.__hzzMine = {
    show: show,
    hide: function (opts) { hide(opts && opts.refocus, opts && opts.keepHash) },
    isOpen: function () { return isOpen }
  };

  if (tabItem) {
    tabItem.addEventListener('click', function (e) {
      e.preventDefault();
      show();
    });
  }

  var loginBtn = document.getElementById('vmLogin');
  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      if (window.__hzzOpenLogin) window.__hzzOpenLogin();
    });
  }

  var logoutBtn = document.getElementById('vmLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      if (window.__hzzLogout) window.__hzzLogout();
    });
  }

  document.addEventListener('hzz:session', render);

  if (location.hash === '#my') show();

  render();
})();
