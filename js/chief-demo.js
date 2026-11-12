/* 「展示河长管理」演示入口
   用途：评审 / 演示时不必走短信登录，直接以指定河长的身份进入「水域管理」，
        展示其级别、职务、所属区划与管辖水域清单。
   做法：
     1) 把演示 token 放进 sessionStorage 的 hzz_tk_tmp（mine-map.js 的 getToken 优先读它）；
     2) 把河长 id / 姓名写进 hzz_chief，my-waters.js 与 mine-map.js 据此走演示分支；
     3) 正式登录成功或点「退出登录」时由 login-modal.js 的 saveSession / clearSession 清掉，
        不会污染 localStorage 里的真实登录态。
   注意：token 为技术支持账号的查询凭证，会过期；过期后卡片会提示「凭证失效」，
        换新 token 只需改下面的 DEMO.token 这一处。 */
(function () {
  'use strict';

  var DEMO = {
    // 技术支持账号（具备 /user/info、/riverLeader/* 查询权限）
    token: 'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6IjU4ZjIxYTFmLWZkMzUtNDk3NC1hYjMxLTllOWU5MTY0NDNhMCJ9.7f_cir6_K3gwM6PsIH4I5eAaLstSvg9RL8ds-IWreJixC3OY_80aY2IPM6Ws4STs0qp6OpLVAjicAeGwR6dhJA',
    // 指定河长：夏照林（临沧市耿马县耿马镇允捧村，村级河长）
    chief: {
      id: 'c8f931a0-4e43-4a6b-a4ac-506af9b50c15',
      name: '夏照林',
      loginName: '夏照林13888909471'
    }
  };

  var API = 'https://app.ynmap.cn/river';
  var APP_ID = 'c1af3fe6-b9ef-4270-a02b-32403280f103';
  var TK_KEY = 'hzz_tk_tmp';
  var CHIEF_KEY = 'hzz_chief';

  // 5 级河长体系
  var RANK = { '1': '省级河长', '2': '市级河长', '3': '县级河长', '4': '乡级河长', '5': '村级河长' };
  // 五类水域：接口字段 → 台账叫法
  var WATER_TYPES = [
    ['river', '河段'], ['lake', '湖片'], ['chan', '渠段'], ['pond', '塘片'], ['reservoir', '库片']
  ];

  var trigger = document.getElementById('vmChiefDemo');
  var card = document.getElementById('vmChief');
  if (!trigger || !card) return;

  var el = {
    av: document.getElementById('vmChiefAv'),
    name: document.getElementById('vmChiefName'),
    level: document.getElementById('vmChiefLevel'),
    org: document.getElementById('vmChiefOrg'),
    duty: document.getElementById('vmChiefDuty'),
    rank: document.getElementById('vmChiefRank'),
    tel: document.getElementById('vmChiefTel'),
    water: document.getElementById('vmChiefWater'),
    list: document.getElementById('vmChiefList'),
    state: document.getElementById('vmStateTxt')
  };

  /* ------------------------------------------------------------ 存储 */

  function readChief() {
    try { return JSON.parse(sessionStorage.getItem(CHIEF_KEY) || 'null'); } catch (e) { return null; }
  }

  function writeChief(chief) {
    try {
      sessionStorage.setItem(TK_KEY, DEMO.token);
      sessionStorage.setItem(CHIEF_KEY, JSON.stringify(chief));
    } catch (e) { /* 隐私模式忽略 */ }
  }

  function clearChief() {
    try {
      sessionStorage.removeItem(TK_KEY);
      sessionStorage.removeItem(CHIEF_KEY);
    } catch (e) { /* 忽略 */ }
  }

  function token() {
    try { return sessionStorage.getItem(TK_KEY) || ''; } catch (e) { return ''; }
  }

  /* ------------------------------------------------------------ 请求 */

  function api(path) {
    var h = { 'tdt-s-app-id': APP_ID };
    var tk = token();
    if (tk) h['Tdt-S-Token'] = tk;
    return fetch(API + path, { headers: h }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ------------------------------------------------------------ 渲染 */

  function paint(on) {
    card.hidden = !on;
    if (on) card.removeAttribute('aria-hidden');
    else card.setAttribute('aria-hidden', 'true');

    // 统计栏第四格：河长本人视角看「下级河长」没有意义，改成「河长级别」
    var lbl = document.getElementById('vmStChiefLabel');
    var val = document.getElementById('vmStChief');
    if (lbl) lbl.textContent = on ? '河长级别' : '下级河长';
    if (!on && val) val.textContent = '—';
  }

  function paintUser(u) {
    var name = u.userName || DEMO.chief.name;
    var rank = RANK[String(u.gmLevel)] || '河长';
    var area = (u.adCodeEntity && u.adCodeEntity.ascription) || '—';

    el.av.textContent = name.slice(0, 1);
    el.name.textContent = name;
    el.level.textContent = rank;
    el.org.textContent = area;
    el.duty.textContent = u.gmDuties || '—';
    el.rank.textContent = u.gmLevel ? rank + '（第 ' + u.gmLevel + ' 级）' : rank;
    el.tel.textContent = u.userPhone || '—';

    var stChief = document.getElementById('vmStChief');
    if (stChief) stChief.textContent = rank.replace('河长', '');
  }

  function paintWaters(data) {
    var items = [];
    WATER_TYPES.forEach(function (t) {
      (data[t[0]] || []).forEach(function (it) {
        if (it && it.waterName) items.push({ name: it.waterName, type: t[1] });
      });
    });

    el.water.textContent = items.length + ' 处';
    el.list.innerHTML = items.length
      ? items.map(function (it) {
        return '<li><span>' + esc(it.name) + '</span><em>' + it.type + '</em></li>';
      }).join('')
      : '<li><span>暂无关联水域</span></li>';
  }

  function fail(msg) {
    el.list.innerHTML = '<li><span>' + esc(msg) + '</span></li>';
    if (el.state) el.state.textContent = '演示数据加载失败 · ' + msg;
  }

  function load() {
    var id = DEMO.chief.id;
    el.list.innerHTML = '<li><span>加载中…</span></li>';

    api('/user/info?id=' + encodeURIComponent(id))
      .then(function (res) {
        if (!res || res.code !== 200 || !res.data) {
          throw new Error((res && res.msg) || '河长信息查询失败');
        }
        paintUser(res.data);
      })
      .catch(function (err) {
        var m = err && err.message ? err.message : '网络异常';
        if (el.state) el.state.textContent = '演示数据加载失败 · ' + m;
      });

    api('/riverLeader/waterListByKeywords?userId=' + encodeURIComponent(id))
      .then(function (res) {
        if (!res || res.code !== 200) {
          throw new Error((res && res.msg) || '管辖水域查询失败');
        }
        paintWaters(res.data || {});
      })
      .catch(function (err) {
        fail(err && err.message ? err.message : '网络异常');
      });
  }

  /* ------------------------------------------------------------ 进入 */

  var loading = false;

  function enter(chief, silent) {
    if (loading) return;
    loading = true;

    writeChief(chief);
    paint(true);
    load();

    // 视图没开就顺手打开，已开时 show() 自己会 return
    if (window.__hzzMine) {
      if (!window.__hzzMine.isOpen()) window.__hzzMine.show();
    }
    document.dispatchEvent(new CustomEvent('hzz:session', {
      detail: { loggedIn: true, demo: true, user: chief.name }
    }));

    if (!silent && el.state) {
      el.state.textContent = '演示模式 · ' + chief.name + ' · 数据来自河湖长制信息管理系统';
    }
    loading = false;
  }

  trigger.addEventListener('click', function () {
    enter({ id: DEMO.chief.id, name: DEMO.chief.name, loginName: DEMO.chief.loginName }, false);
  });

  // 登录成功后演示标记就失效：真实会话优先
  document.addEventListener('hzz:session', function (e) {
    var d = (e && e.detail) || {};
    if (d.demo) return;
    if (!d.loggedIn) {
      clearChief();
      paint(false);
      return;
    }
    // 走正式登录：清掉演示凭证，卡片收起
    clearChief();
    paint(false);
  });

  /* ------------------------------------------------------------ 启动 */

  // 刷新后保持：sessionStorage 里还有演示标记就自动恢复
  var saved = readChief();
  if (saved && token()) {
    paint(true);
    load();
  }

  // ?chief=1 直接进演示，便于把链接发给别人看
  if (/[?&]chief=1\b/.test(location.search)) {
    enter({ id: DEMO.chief.id, name: DEMO.chief.name, loginName: DEMO.chief.loginName }, false);
  }
})();
