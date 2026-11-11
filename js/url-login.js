/* URL 登录态注入
   - 访问形如 ?userName=张三&token=xxx 时，等价于表单登录成功：写入本地登录态
   - index.html（封面）与 shouce.html（正文）都引入：
       封面页先写一次（同源 localStorage 共享），正文页再兜底一次；
       这样隐私模式下 localStorage 写不进时，正文页仍能靠 query 兜底
   - 写入格式与表单登录 saveSession 完全一致：{ userName, token }，键 hzz_session */
(function () {
  'use strict';

  var KEY = 'hzz_session';

  var q = new URLSearchParams(window.location.search);
  var userName = (q.get('userName') || '').trim();
  var token = (q.get('token') || '').trim();
  if (!userName || !token) return;

  try {
    localStorage.setItem(KEY, JSON.stringify({ userName: userName, token: token }));
    // 清掉旧版本存在 sessionStorage 里的那份，避免两份打架
    sessionStorage.removeItem(KEY);
  } catch (e) {
    /* 隐私模式下 localStorage 不可用，忽略；正文页仍会再试一次 */
  }
})();
