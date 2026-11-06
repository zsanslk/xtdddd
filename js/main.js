/* 云南省·河长制 登录页交互（短信验证码登录）
   - 表单校验 / 短信验证码接口 / 提交态
   验证码接口：GET /river/captcha/login?userPhone=<SM2 密文>，请求头 tdt-s-app-id 鉴权 */
(function () {
  "use strict";

  var CONFIG = {
    apiBase: "https://app.ynmap.cn/river",
    appId: "c1af3fe6-b9ef-4270-a02b-32403280f103",
    // 与河长制前端一致的 SM2 公钥（04 开头、未压缩）
    publicKey:
      "042c689a61ee2648e9a80b6511a134d59db7d108c1dd49074b0f98431374c67ef9d41955f035a4251464660d292d168c9830f958216074fccd4dfcdfbd2b0dc3d8",
    timeout: 15000
  };

  var RULES = {
    username: {
      test: function (v) {
        return v.length > 0;
      },
      empty: "请输入姓名!",
      invalid: "请输入姓名!"
    },
    phone: {
      test: function (v) {
        return /^1[3-9]\d{9}$/.test(v);
      },
      empty: "请输入电话号码!",
      invalid: "电话号码格式不正确!"
    },
    smscode: {
      test: function (v) {
        return /^\d{6}$/.test(v);
      },
      empty: "请输入短信验证码!",
      invalid: "短信验证码为 6 位数字!"
    }
  };

  var form = document.getElementById("login-form");
  if (!form) return;

  var phoneInput = form.querySelector("[name='phone']");
  var codeBtn = form.querySelector("[data-send-code]");
  var toastEl = document.querySelector(".toast");
  var toastTimer = null;
  // 验证码接口返回的 data，登录时作为 phoneUuid 回传
  var smsUuid = "";
  // 登录接口返回的 data（裸 token），后续查询接口放在 Tdt-S-Token 头里
  var token = "";

  /* ------------------------------------------------------------ 提示条 */

  function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  /* ------------------------------------------------------------ 字段校验 */

  function fieldValue(input) {
    return (input.value || "").trim();
  }

  function setError(wrap, message) {
    wrap.classList.toggle("is-error", !!message);
    var msg = wrap.querySelector(".field__msg");
    if (msg) msg.textContent = message || "";
  }

  function validateWrap(wrap) {
    var input = wrap.querySelector(".field__input");
    var rule = RULES[wrap.dataset.rule];
    if (!input || !rule) return true;

    var value = fieldValue(input);

    if (!value) {
      setError(wrap, rule.empty);
      return false;
    }
    if (!rule.test(value)) {
      setError(wrap, rule.invalid);
      return false;
    }
    setError(wrap, "");
    return true;
  }

  function validateForm() {
    var wraps = Array.prototype.slice.call(form.querySelectorAll(".field-wrap"));
    var firstBad = null;
    wraps.forEach(function (wrap) {
      if (!validateWrap(wrap) && !firstBad) firstBad = wrap;
    });
    if (firstBad) {
      var input = firstBad.querySelector(".field__input");
      if (input) input.focus({ preventScroll: true });
    }
    return !firstBad;
  }

  /* ------------------------------------------------------------ 输入反馈 */

  form.addEventListener("input", function (e) {
    // 验证码只收数字，避免中文输入法带进全角字符
    if (e.target.name === "smscode") {
      var digits = e.target.value.replace(/\D/g, "").slice(0, 6);
      if (digits !== e.target.value) e.target.value = digits;
    }

    var wrap = e.target.closest(".field-wrap");
    if (!wrap) return;
    // 已报错的字段边输入边复查，避免红框一直挂着
    if (wrap.classList.contains("is-error")) {
      validateWrap(wrap);
    }
    if (e.target === phoneInput) {
      // 换号后旧验证码作废，避免拿旧 phoneUuid 去登录
      smsUuid = "";
      syncCodeBtn();
    }
  });

  form.addEventListener("blur", function (e) {
    var wrap = e.target.closest && e.target.closest(".field-wrap");
    if (!wrap) return;
    if (fieldValue(e.target)) validateWrap(wrap);
  }, true);

  /* ------------------------------------------------------ 短信验证码接口 */

  function phoneValid() {
    return /^1[3-9]\d{9}$/.test(fieldValue(phoneInput));
  }

  // sm-crypto 的 doEncrypt 输出不含 04 前缀，后端按未压缩点解析，必须补上
  function encryptPhone(phone) {
    return "04" + window.sm2.doEncrypt(phone, CONFIG.publicKey, 0);
  }

  function requestSmsCode(phone) {
    var url = CONFIG.apiBase + "/captcha/login?userPhone=" + encodeURIComponent(encryptPhone(phone));
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, CONFIG.timeout);

    return fetch(url, {
      method: "GET",
      headers: { "tdt-s-app-id": CONFIG.appId },
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  function requestLogin(payload) {
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, CONFIG.timeout);

    return fetch(CONFIG.apiBase + "/login/phone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "tdt-s-app-id": CONFIG.appId
      },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  function syncCodeBtn() {
    if (!codeBtn) return;
    if (codeBtn.dataset.counting === "1" || codeBtn.dataset.sending === "1") return;
    codeBtn.disabled = !phoneValid();
  }

  function resetCodeBtn() {
    codeBtn.dataset.sending = "0";
    codeBtn.textContent = "获取验证码";
    syncCodeBtn();
  }

  function startCountdown(seconds) {
    var left = seconds || 60;
    codeBtn.dataset.counting = "1";
    codeBtn.disabled = true;
    codeBtn.textContent = left + "s 后重发";

    var timer = setInterval(function () {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        codeBtn.dataset.counting = "0";
        codeBtn.textContent = "获取验证码";
        syncCodeBtn();
        return;
      }
      codeBtn.textContent = left + "s 后重发";
    }, 1000);
  }

  if (codeBtn) {
    syncCodeBtn();

    codeBtn.addEventListener("click", function () {
      if (codeBtn.disabled || codeBtn.dataset.counting === "1" || codeBtn.dataset.sending === "1") return;

      var phoneWrap = form.querySelector('.field-wrap[data-rule="phone"]');
      if (!validateWrap(phoneWrap)) return;

      if (!window.sm2 || typeof window.sm2.doEncrypt !== "function") {
        toast("加密组件未加载，无法发送验证码");
        return;
      }

      codeBtn.dataset.sending = "1";
      codeBtn.disabled = true;
      codeBtn.textContent = "发送中…";

      requestSmsCode(fieldValue(phoneInput))
        .then(function (res) {
          if (res && res.code === 200) {
            codeBtn.dataset.sending = "0";
            // data 即登录要用的 phoneUuid
            smsUuid = res.data || "";
            toast(res.msg || "验证码发送成功");
            startCountdown(60);
            var codeInput = form.querySelector("[name='smscode']");
            if (codeInput) codeInput.focus({ preventScroll: true });
          } else {
            var msg = (res && res.msg) || "验证码发送失败";
            // 号码本身的问题直接标在对应字段上，比只弹提示更直观
            if (/手机号|号码/.test(msg)) setError(phoneWrap, msg);
            toast(msg);
            resetCodeBtn();
          }
        })
        .catch(function (err) {
          var aborted = err && err.name === "AbortError";
          toast(aborted ? "请求超时，请稍后重试" : "网络异常，请稍后重试");
          resetCodeBtn();
        });
    });
  }

  /* ------------------------------------------------------------ 提交 */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    var codeInput = form.querySelector("[name='smscode']");
    if (!smsUuid) {
      toast("请先获取短信验证码");
      if (codeBtn && codeBtn.dataset.counting !== "1") codeBtn.focus({ preventScroll: true });
      return;
    }
    if (!window.sm2 || typeof window.sm2.doEncrypt !== "function") {
      toast("加密组件未加载，无法登录");
      return;
    }

    var btn = form.querySelector(".submit");
    var text = form.querySelector(".submit__text");
    btn.classList.add("is-loading");
    if (text) text.textContent = "登录中";

    requestLogin({
      userName: fieldValue(form.querySelector("[name='username']")),
      userPhone: encryptPhone(fieldValue(phoneInput)),
      phoneCode: fieldValue(codeInput),
      userPassword: null,
      phoneUuid: smsUuid
      // uuid / code 属图形验证码，本页未启用，后端 LoginBody 上对应校验亦已注释
    })
      .then(function (res) {
        btn.classList.remove("is-loading");
        if (text) text.textContent = "登 录";

        if (res && res.code === 200) {
          token = res.data || "";
          var name = fieldValue(form.querySelector("[name='username']"));
          saveSession(name, token);
          toast("登录成功");
          window.location.assign('./index2.html')
          enterResult(name);
        } else {
          toast((res && res.msg) || "登录失败");
        }
      })
      .catch(function (err) {
        btn.classList.remove("is-loading");
        if (text) text.textContent = "登 录";
        var aborted = err && err.name === "AbortError";
        toast(aborted ? "请求超时，请稍后重试" : "网络异常，请稍后重试");
      });
  });

  /* ------------------------------------------------------ 管护水系视图 */

  var loginCard = document.querySelector(".panel > .card:not(.card--result)");
  var resultCard = document.getElementById("result-card");
  var resultMeta = document.getElementById("result-meta");
  var resultStats = document.getElementById("result-stats");
  var resultBody = document.getElementById("result-body");
  var logoutBtn = document.getElementById("logout-btn");

  // 五类水系：数组键 / 中文名
  var WATER_GROUPS = [
    { key: "river", label: "河段" },
    { key: "lake", label: "湖片" },
    { key: "chan", label: "渠段" },
    { key: "pond", label: "坝塘片" },
    { key: "reservoir", label: "水库片" }
  ];

  // 流域代码 → 名称，按 drainageBasinType 分档：0 二级流域 1 六大流域 2 三水系 3 九湖
  var basinNames = { 0: {}, 1: {}, 2: {}, 3: {} };
  var SESSION_KEY = "hzz_session";
  var MAX_ITEMS = 30;

  function authHeaders() {
    var h = { "tdt-s-app-id": CONFIG.appId };
    if (token) h["Tdt-S-Token"] = token;
    return h;
  }

  function readJson(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  function saveSession(userName, tk) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userName: userName, token: tk }));
    } catch (e) {
      /* 隐私模式下 sessionStorage 不可用，忽略 */
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      /* 同上 */
    }
  }

  function enterResult(userName) {
    if (!resultCard) return;
    if (loginCard) loginCard.hidden = true;
    resultCard.hidden = false;
    if (resultMeta) resultMeta.textContent = userName;
    if (resultStats) resultStats.innerHTML = "";
    if (resultBody) resultBody.innerHTML = '<p class="result__hint">正在加载管护水系…</p>';
    loadChiefWater(userName);
  }

  function backToLogin() {
    token = "";
    smsUuid = "";
    clearSession();
    if (resultCard) resultCard.hidden = true;
    if (loginCard) loginCard.hidden = false;
    form.reset();
    document.querySelectorAll(".field-wrap").forEach(function (w) {
      setError(w, "");
    });
    if (codeBtn) {
      codeBtn.dataset.counting = "0";
      codeBtn.dataset.sending = "0";
      codeBtn.textContent = "获取验证码";
      codeBtn.disabled = true;
    }
  }

  if (logoutBtn) logoutBtn.addEventListener("click", backToLogin);

  function loadBasinNames() {
    var types = [0, 1, 2, 3];
    return Promise.all(
      types.map(function (type) {
        var url = CONFIG.apiBase + "/drainageBasin/getNameList?drainageBasinType=" + type;
        return fetch(url, { headers: authHeaders() })
          .then(readJson)
          .then(function (res) {
            (res && res.data ? res.data : []).forEach(function (item) {
              if (item && item.drainageBasinCode) {
                basinNames[type][item.drainageBasinCode] = item.drainageBasinName;
              }
            });
          })
          .catch(function () {
            /* 流域字典拿不到就退回显示代码，不影响主流程 */
          });
      })
    );
  }

  function basinLabel(item) {
    var code = item.ynbasCode || item.basCode;
    if (!code) return "";
    return basinNames[1][code] || basinNames[0][code] || code;
  }

  function loadChiefWater(userName) {
    var url =
      CONFIG.apiBase +
      "/riverLeader/selectWaterRiverLeaderList?userName=" +
      encodeURIComponent(userName) +
      "&userType=1&pageNum=1&pageSize=10";

    Promise.all([
      fetch(url, { headers: authHeaders() }).then(readJson),
      loadBasinNames()
    ])
      .then(function (out) {
        var res = out[0];
        if (res && res.code === 401) {
          // 后端原文较长（含请求路径），控制台留证据，界面给用户看的说法
          console.warn("[hzz] 认证失败：", res.msg);
          toast("登录状态已失效，请重新登录");
          backToLogin();
          return;
        }
        if (!res || res.code !== 200) {
          renderHint((res && res.msg) || "管护水系查询失败");
          return;
        }
        var rows = res.rows || [];
        if (!rows.length) {
          renderHint("未查询到「" + userName + "」的管护水系，请联系管理员核对姓名或关联关系。");
          return;
        }
        renderChief(rows[0], rows.length, userName);
      })
      .catch(function (err) {
        renderHint(err && err.message ? "查询失败：" + err.message : "网络异常，管护水系加载失败");
      });
  }

  function renderHint(text) {
    if (resultBody) resultBody.innerHTML = '<p class="result__hint">' + escapeHtml(text) + "</p>";
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderChief(row, matchCount, userName) {
    var groups = WATER_GROUPS.map(function (g) {
      var list = Array.isArray(row[g.key]) ? row[g.key] : [];
      return { key: g.key, label: g.label, items: list };
    });
    var total = groups.reduce(function (n, g) {
      return n + g.items.length;
    }, 0);

    var displayName = row.userName || userName;
    var metaParts = [displayName];
    if (row.gmDuties) metaParts.push(row.gmDuties);
    if (row.adName) metaParts.push(row.adName);
    metaParts.push("共 " + total + " 项");
    if (resultMeta) resultMeta.textContent = metaParts.join(" · ");

    if (resultStats) {
      resultStats.innerHTML = groups
        .map(function (g) {
          return '<span class="stat' + (g.items.length ? "" : " is-zero") + '">' + g.label + " <b>" + g.items.length + "</b></span>";
        })
        .join("");
    }

    // 重复渲染时先清掉上一次的提示，避免叠加
    var oldNote = resultCard ? resultCard.querySelector(".result__note") : null;
    if (oldNote) oldNote.remove();

    if (matchCount > 1) {
      var note = document.createElement("p");
      note.className = "result__note";
      note.textContent = "按姓名匹配到 " + matchCount + " 位河长，当前展示：" + displayName;
      if (resultStats && resultStats.parentNode) resultStats.parentNode.insertBefore(note, resultBody);
    }

    var html = groups
      .filter(function (g) {
        return g.items.length;
      })
      .map(function (g) {
        var shown = g.items.slice(0, MAX_ITEMS);
        var listHtml = shown
          .map(function (item) {
            var name = item.waterName || item.areaName || item.waterCode || "未命名";
            var basin = basinLabel(item);
            return (
              '<li class="wi-item"><span class="wi-item__name">' +
              escapeHtml(name) +
              "</span>" +
              (basin ? '<span class="wi-item__basin">' + escapeHtml(basin) + "</span>" : "") +
              "</li>"
            );
          })
          .join("");
        var more = g.items.length > shown.length ? '<li class="wi-item wi-item--more">其余 ' + (g.items.length - shown.length) + " 条未显示</li>" : "";
        return (
          '<section class="wi-group"><h3 class="wi-group__title">' +
          g.label +
          "<em>" +
          g.items.length +
          "</em></h3><ul class=\"wi-list\">" +
          listHtml +
          more +
          "</ul></section>"
        );
      })
      .join("");

    if (resultBody) {
      resultBody.innerHTML = html || '<p class="result__hint">该河长暂未关联任何水系。</p>';
      updateScrollHint();
    }
  }

  // 列表溢出时给底部一点渐隐，提示还能往下滚
  function updateScrollHint() {
    if (!resultBody) return;
    resultBody.classList.toggle("is-scrollable", resultBody.scrollHeight > resultBody.clientHeight + 2);
  }

  /* ------------------------------------------------------------ 会话恢复 */

  (function restore() {
    var raw = null;
    try {
      raw = sessionStorage.getItem(SESSION_KEY);
    } catch (e) {
      raw = null;
    }
    if (!raw) return;
    try {
      var saved = JSON.parse(raw);
      if (saved && saved.token && saved.userName) {
        token = saved.token;
        var nameInput = form.querySelector("[name='username']");
        var phoneField = form.querySelector("[name='phone']");
        if (nameInput) nameInput.value = saved.userName;
        if (phoneField) phoneField.value = "";
        enterResult(saved.userName);
      }
    } catch (e) {
      clearSession();
    }
  })();

  /* ------------------------------------------------------------ 占位链接 */

  document.querySelectorAll("[data-demo]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast("「" + a.dataset.demo + "」页面待接入");
    });
  });
})();
