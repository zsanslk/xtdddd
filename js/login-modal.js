/* 登录模态框（替代原 login.html 页面）
   - 顶栏「登录」/ 底栏「我管理的河流」→ 就地弹层，不跳页
   - 接口与加密参数与 js/main.js 保持一致：captcha/login、login/phone，SM2 加密手机号 */
(function () {
  'use strict';

  var CONFIG = {
    apiBase: 'https://app.ynmap.cn/river',
    appId: 'c1af3fe6-b9ef-4270-a02b-32403280f103',
    publicKey: '042c689a61ee2648e9a80b6511a134d59db7d108c1dd49074b0f98431374c67ef9d41955f035a4251464660d292d168c9830f958216074fccd4dfcdfbd2b0dc3d8',
    timeout: 15000
  };

  var KEY = 'hzz_session';

  var mask = document.getElementById('loginMask');
  var form = document.getElementById('loginForm');
  if (!mask || !form) return;

  var box = mask.querySelector('.dlg');
  var panelForm = document.getElementById('dlgFormPanel');
  var panelUser = document.getElementById('dlgUserPanel');
  var userWrap = document.getElementById('dlgUserInfo');
  var closeBtn = document.getElementById('loginClose');
  var codeBtn = document.getElementById('sendCode');
  var submitBtn = form.querySelector('.dlg-submit');
  var toastEl = document.getElementById('dlgToast');
  var topLogin = document.getElementById('login');

  var phoneInput = form.querySelector('[name="phone"]');
  var smsUuid = '';
  var token = '';
  var currentUser = '';
  var lastFocus = null;
  var toastTimer = null;

  /* ------------------------------------------------------------ 工具 */

  function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on') }, 2400);
  }

  function val(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? (el.value || '').trim() : '';
  }

  function fieldOf(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  function setError(name, msg) {
    var wrap = fieldOf(name);
    if (!wrap) return;
    wrap.classList.toggle('is-error', !!msg);
    var box2 = wrap.querySelector('.dlg-msg');
    if (box2) box2.textContent = msg || '';
  }

  function saveSession(userName, tk) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ userName: userName, token: tk }));
      sessionStorage.removeItem(KEY);
      // 真实登录优先：演示用的临时 token 与指定河长标记一并作废
      sessionStorage.removeItem('hzz_tk_tmp');
      sessionStorage.removeItem('hzz_chief');
    } catch (e) { /* 隐私模式忽略 */ }
  }

  function readSession() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) { try { raw = sessionStorage.getItem(KEY); } catch (e) { raw = null; } }
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function clearSession() {
    try { localStorage.removeItem(KEY); } catch (e) { }
    try { sessionStorage.removeItem(KEY); } catch (e) { }
    // 「展示河长管理」写下的演示凭证也在这里清，否则退出后地图仍按演示河长加载
    try { sessionStorage.removeItem('hzz_tk_tmp'); } catch (e) { }
    try { sessionStorage.removeItem('hzz_chief'); } catch (e) { }
  }

  function encryptPhone(phone) {
    // sm-crypto 输出不含 04 前缀，后端按未压缩点解析，需补上
    return '04' + window.sm2.doEncrypt(phone, CONFIG.publicKey, 0);
  }

  function request(url, options) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort() }, CONFIG.timeout);
    options = options || {};
    options.headers = options.headers || {};
    return fetch(url, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .finally(function () { clearTimeout(timer) });
  }

  /* -------------------------------------------------------- 顶栏登录态 */

  function paintTopbar(userName) {
    if (!topLogin) return;
    var lbl = topLogin.querySelector('.lbl');
    if (userName) {
      if (lbl) lbl.textContent = userName;
      topLogin.classList.add('is-in');
      topLogin.title = '已登录，点击查看';
      topLogin.setAttribute('aria-label', userName + '，已登录，点击查看');
    } else {
      if (lbl) lbl.textContent = '登录';
      topLogin.classList.remove('is-in');
      topLogin.title = '登录';
      topLogin.setAttribute('aria-label', '登录');
    }
  }

  /* ------------------------------------------------------------ 开合 */

  function showPanel(which) {
    panelForm.hidden = which !== 'form';
    panelUser.hidden = which !== 'user';
    /* 标题在各面板里，aria-labelledby 得跟着走，否则读屏读不到弹层名字 */
    box.setAttribute('aria-labelledby', which === 'user' ? 'dlgUserTitle' : 'dlgTitle');
    if (which === 'form') box.setAttribute('aria-describedby', 'dlgSub');
    else box.removeAttribute('aria-describedby');
  }

  function open(mode) {
    lastFocus = document.activeElement;
    mode = mode === 'user' ? 'user' : 'form';
    if (mode === 'user') {
      if (userWrap) {
        var u = readSession();
        var name = (u && u.userName) || currentUser;
        userWrap.innerHTML =
          '<div class="dlg-user"><div class="nm">' + escapeHtml(name) + '</div>' +
          '<div class="meta">已登录 · 登录状态保存在本机，仅手动退出才清除</div></div>';
      }
    }
    showPanel(mode);
    mask.hidden = false;
    document.body.classList.add('dlg-open');
    // 锁滚动会让滚动条消失、正文横跳，补回同宽内边距
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = sbw > 0 ? sbw + 'px' : '';
    var target = mode === 'user' ? closeBtn : form.querySelector('[name="username"]');
    if (target) target.focus({ preventScroll: true });
  }

  /* 供「我管理的水域」视图调用：那里的登录按钮只负责拉起表单 */
  window.__hzzOpenLogin = function () { open('form') };

  function close() {
    mask.hidden = true;
    document.body.classList.remove('dlg-open');
    document.body.style.paddingRight = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------ 入口 */

  if (topLogin) {
    topLogin.addEventListener('click', function (e) {
      e.preventDefault();
      var s = readSession();
      if (s && s.userName) open('user');
      else open('form');
    });
  }

  /* 底栏「我管理的水域」由 js/my-waters.js 接管：先进视图，不直接弹登录 */

  if (closeBtn) closeBtn.addEventListener('click', close);

  var closeBtn2 = document.getElementById('loginClose2');
  if (closeBtn2) closeBtn2.addEventListener('click', close);

  mask.addEventListener('mousedown', function (e) {
    if (e.target === mask) close();
  });

  document.addEventListener('keydown', function (e) {
    if (mask.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    // 焦点锁在弹层内，避免 Tab 跑到背后的正文
    var items = [].slice.call(box.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]'))
      .filter(function (el) { return el.offsetParent !== null });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ------------------------------------------------------ 表单交互 */

  form.addEventListener('input', function (e) {
    var name = e.target.name;
    if (name === 'smscode') {
      var digits = e.target.value.replace(/\D/g, '').slice(0, 6);
      if (digits !== e.target.value) e.target.value = digits;
    }
    if (name === 'phone') {
      smsUuid = '';
      syncCodeBtn();
    }
    if (fieldOf(name) && fieldOf(name).classList.contains('is-error')) validate(name);
  });

  form.addEventListener('blur', function (e) {
    var name = e.target.name;
    if (name && val(name)) validate(name);
  }, true);

  var RULES = {
    username: function (v) { return v.length ? '' : '请输入姓名' },
    phone: function (v) { return /^1[3-9]\d{9}$/.test(v) ? '' : (v ? '手机号格式不正确' : '请输入手机号') },
    smscode: function (v) { return /^\d{6}$/.test(v) ? '' : (v ? '验证码为 6 位数字' : '请输入验证码') }
  };

  function validate(name) {
    var msg = RULES[name] ? RULES[name](val(name)) : '';
    setError(name, msg);
    return !msg;
  }

  function phoneValid() {
    return /^1[3-9]\d{9}$/.test(val('phone'));
  }

  function syncCodeBtn() {
    if (!codeBtn) return;
    if (codeBtn.dataset.counting === '1' || codeBtn.dataset.sending === '1') return;
    codeBtn.disabled = !phoneValid();
  }

  function resetCodeBtn() {
    if (!codeBtn) return;
    codeBtn.dataset.sending = '0';
    codeBtn.textContent = '获取验证码';
    syncCodeBtn();
  }

  function startCountdown(seconds) {
    var left = seconds || 60;
    codeBtn.dataset.counting = '1';
    codeBtn.disabled = true;
    codeBtn.textContent = left + 's 后重发';
    var timer = setInterval(function () {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        codeBtn.dataset.counting = '0';
        codeBtn.textContent = '获取验证码';
        syncCodeBtn();
        return;
      }
      codeBtn.textContent = left + 's 后重发';
    }, 1000);
  }

  syncCodeBtn();

  codeBtn.addEventListener('click', function () {
    if (codeBtn.disabled || codeBtn.dataset.counting === '1' || codeBtn.dataset.sending === '1') return;
    if (!validate('phone')) return;
    if (!window.sm2 || typeof window.sm2.doEncrypt !== 'function') {
      toast('加密组件未加载，无法发送验证码');
      return;
    }

    codeBtn.dataset.sending = '1';
    codeBtn.disabled = true;
    codeBtn.textContent = '发送中…';

    var url = CONFIG.apiBase + '/captcha/login?userPhone=' + encodeURIComponent(encryptPhone(val('phone')));
    request(url, { headers: { 'tdt-s-app-id': CONFIG.appId } })
      .then(function (res) {
        if (res && res.code === 200) {
          codeBtn.dataset.sending = '0';
          smsUuid = res.data || '';
          toast(res.msg || '验证码已发送');
          startCountdown(60);
          var codeInput = form.querySelector('[name="smscode"]');
          if (codeInput) codeInput.focus({ preventScroll: true });
        } else {
          var msg = (res && res.msg) || '验证码发送失败';
          if (/手机号|号码/.test(msg)) setError('phone', msg);
          toast(msg);
          resetCodeBtn();
        }
      })
      .catch(function (err) {
        toast(err && err.name === 'AbortError' ? '请求超时，请稍后重试' : '网络异常，请稍后重试');
        resetCodeBtn();
      });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = ['username', 'phone', 'smscode'].map(validate).every(Boolean);
    if (!ok) {
      var firstBad = form.querySelector('.dlg-field.is-error .dlg-input');
      if (firstBad) firstBad.focus({ preventScroll: true });
      return;
    }
    if (!smsUuid) {
      toast('请先获取短信验证码');
      if (codeBtn && codeBtn.dataset.counting !== '1') codeBtn.focus({ preventScroll: true });
      return;
    }
    if (!window.sm2 || typeof window.sm2.doEncrypt !== 'function') {
      toast('加密组件未加载，无法登录');
      return;
    }

    submitBtn.disabled = true;
    var textEl = submitBtn.querySelector('span');
    if (textEl) textEl.textContent = '登录中';

    request(CONFIG.apiBase + '/login/phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'tdt-s-app-id': CONFIG.appId },
      body: JSON.stringify({
        userName: val('username'),
        userPhone: encryptPhone(val('phone')),
        phoneCode: val('smscode'),
        userPassword: null,
        phoneUuid: smsUuid
      })
    })
      .then(function (res) {
        submitBtn.disabled = false;
        if (textEl) textEl.textContent = '登 录';
        if (res && res.code === 200) {
          token = res.data || '';
          currentUser = val('username');
          saveSession(currentUser, token);
          paintTopbar(currentUser);
          close();
          toast('登录成功');
          document.dispatchEvent(new CustomEvent('hzz:session', { detail: { loggedIn: true, user: currentUser } }));
          form.reset();
          smsUuid = '';
          resetCodeBtn();
          ['username', 'phone', 'smscode'].forEach(function (n) { setError(n, '') });
          return;
        }
        toast((res && res.msg) || '登录失败');
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        if (textEl) textEl.textContent = '登 录';
        toast(err && err.name === 'AbortError' ? '请求超时，请稍后重试' : '网络异常，请稍后重试');
      });
  });

  /* ------------------------------------------------------ 退出登录 */

  function doLogout() {
    clearSession();
    paintTopbar('');
    token = '';
    currentUser = '';
    showPanel('form');
    toast('已退出登录');
    document.dispatchEvent(new CustomEvent('hzz:session', { detail: { loggedIn: false, user: '' } }));
  }

  // 视图里的「退出登录」也走这里，避免两套清理逻辑
  window.__hzzLogout = doLogout;

  var logoutBtn = document.getElementById('dlgLogout');
  if (logoutBtn) logoutBtn.addEventListener('click', doLogout);

  /* ------------------------------------------------------ 启动恢复 */

  (function restore() {
    var s = readSession();
    if (s && s.userName) {
      token = s.token || '';
      currentUser = s.userName;
      paintTopbar(s.userName);
    }
  })();
})();
