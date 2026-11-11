/* 「我管理的水域」地图与概览
   登录态下按当前用户所属区划渲染；未登录时可用 ?uid= 走演示（该接口免 token）。
   统计类接口不对外开放，未登录时显示为「—」。 */
(function () {
  'use strict';

  var API = 'https://app.ynmap.cn/river';
  var APP_ID = 'c1af3fe6-b9ef-4270-a02b-32403280f103';
  var TILE_KEY = '3887eac79c524f069b592db50f31878c';
  var TILE_SUBS = ['1', '2', '3', '4', '5'];
  var SESSION_KEY = 'hzz_session';
  var YUNNAN = [25.05, 102.71];
  // 演示默认账号：邓文华（河长，勐腊县关累镇藤蔑山村委会）
  // 未登录只有占位图，没有演示账号兜底
  (function () {
    var t = new URLSearchParams(location.search).get('tk');
    if (t) { try { sessionStorage.setItem('hzz_tk_tmp', t); } catch (e) { } }
  })();

  var view = document.getElementById('viewMine');
  var userBox = document.getElementById('vmUser');
  var mapEl = document.getElementById('vmMap');
  if (!view || !userBox || !mapEl || !window.L) return;

  var el = {
    meta: document.getElementById('vmStateTxt'),
    flag: document.getElementById('vmMapFlag'),
    baseBtn: document.getElementById('vmBaseBtn'),
    waterChip: document.getElementById('vmWaterChip'),
    kidsChip: document.getElementById('vmKidsChip'),
    stArea: document.getElementById('vmStArea'),
    stKids: document.getElementById('vmStKids'),
    stWater: document.getElementById('vmStWater'),
    stChief: document.getElementById('vmStChief'),
    foldCount: document.getElementById('vmFoldCount'),
    foldTitle: document.getElementById('vmFoldTitle'),
    kidList: document.getElementById('vmKidList'),
    warn: document.getElementById('vmWarn')
  };

  var map = null;
  var baseGroups = null;
  var selfLayer = null;
  var kidLayer = null;
  var waterLayer = null;
  var kidLabels = [];
  var kidMarkers = {};
  var showKids = true;
  var showWater = true;
  var waterCount = 0;
  // 只有矢量与影像两档，默认影像；?base=vec 可切回矢量
  var baseMode = new URLSearchParams(location.search).get('base') === 'vec' ? 'vec' : 'img';
  var started = false;

  /* ------------------------------------------------------------ 基础工具 */

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (e) { return null; }
  }

  // 临时 token：地址带 ?tk= 时存进 sessionStorage，仅本标签页有效，便于演示
  function getToken() {
    try {
      var tmp = sessionStorage.getItem('hzz_tk_tmp');
      if (tmp) return tmp;
      var s = readSession();
      return (s && s.token) || '';
    } catch (e) { return ''; }
  }

  function api(path) {
    var h = { 'tdt-s-app-id': APP_ID };
    var tk = getToken();
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

  function shortName(n) {
    return String(n || '')
      .replace(/社区居民委员会$/, '社区')
      .replace(/村民委员会$/, '村')
      .replace(/村委会$/, '村');
  }

  function note(text) {
    var li = document.createElement('li');
    li.textContent = text;
    el.warn.appendChild(li);
  }

  /* -------------------------------------------------------------- 底图 */

  function tileUrl(service) {
    var white = /(^|\.)(ynmap\.cn|tianditu\.gov\.cn)$/.test(location.hostname);
    if (white) {
      return 'https://smap{s}.ynmap.cn/tileServer/service/smap/' + service +
        '/3857/wmts/tile/default/{z}/{y}/{x}?key=' + TILE_KEY;
    }
    return '/tiles/{s}/' + service + '/{z}/{y}/{x}?key=' + TILE_KEY;
  }

  function wmts(service) {
    return L.tileLayer(tileUrl(service), {
      subdomains: TILE_SUBS, minZoom: 3, maxZoom: 18, crossOrigin: true
    });
  }

  function applyBase(mode) {
    if (!baseGroups || !baseGroups[mode]) return;
    ['vec', 'img'].forEach(function (k) {
      baseGroups[k].forEach(function (ly) { map.removeLayer(ly); });
    });
    baseGroups[mode].forEach(function (ly) { ly.addTo(map); });
    baseMode = mode;
    el.baseBtn.textContent = mode === 'vec' ? '底图 · 矢量' : '底图 · 影像';
    el.flag.textContent = mode === 'vec' ? '天地图云南 · 矢量' : '天地图云南 · 影像';
  }

  /* -------------------------------------------------------------- 地图 */

  function ensureMap() {
    if (map) { map.invalidateSize(); return; }
    map = L.map(mapEl, {
      zoomControl: true, attributionControl: false, preferCanvas: true
    }).setView(YUNNAN, 7);
    // 拖出省界就是空白瓦片，限制一下可拖范围
    map.setMaxBounds([[20.8, 96.8], [29.6, 106.6]]);

    baseGroups = {
      vec: [wmts('ynVecMS')],
      img: [wmts('ynImgMS')]
    };
    selfLayer = L.layerGroup().addTo(map);
    kidLayer = L.layerGroup().addTo(map);
    waterLayer = L.layerGroup().addTo(map);
    applyBase(baseMode);

    map.on('zoomend', syncLabels);
    // 视图刚从 hidden 切过来，容器尺寸可能还没定，晚一帧再量一次
    setTimeout(function () { if (map) map.invalidateSize(); }, 160);
    el.baseBtn.addEventListener('click', function () {
      applyBase(baseMode === 'vec' ? 'img' : 'vec');
    });
    el.waterChip.addEventListener('click', function () {
      showWater = !showWater;
      el.waterChip.setAttribute('aria-pressed', String(showWater));
      if (showWater) { map.addLayer(waterLayer); } else { map.removeLayer(waterLayer); }
    });
    el.kidsChip.addEventListener('click', function () {
      showKids = !showKids;
      el.kidsChip.setAttribute('aria-pressed', String(showKids));
      if (showKids) { map.addLayer(kidLayer); syncLabels(); } else { map.removeLayer(kidLayer); }
    });
  }

  function dot(latlng, opts) {
    return L.circleMarker(latlng, Object.assign({
      radius: 4.5, color: '#fff', weight: 1.4, fillColor: '#0B4F8A', fillOpacity: 1
    }, opts));
  }

  function label(latlng, text, cls, dir, offset) {
    return L.marker(latlng, {
      interactive: false,
      icon: L.divIcon({ className: 'vm-pt-anchor', html: '', iconSize: [0, 0], iconAnchor: [0, 0] })
    }).bindTooltip(text, {
      permanent: true, direction: dir || 'right', offset: offset || [7, 0],
      className: 'vm-pt ' + (cls || '')
    });
  }

  function syncLabels() {
    // 阈值放低一档：省级（z7）仍隐藏，州市及以下显示，河长办才看得到人数
    var on = map.getZoom() >= 8;
    kidLabels.forEach(function (m) { if (on) { m.openTooltip(); } else { m.closeTooltip(); } });
  }

  /* -------------------------------------------------------------- 渲染 */

  function render(user, self, list) {
    var isDemo = !getToken() && !new URLSearchParams(location.search).get('uid');

    el.meta.textContent = (isDemo ? '演示 · ' : '') + (self.ascription || '') +
      (list.length ? ' · ' + list.length + ' 个下辖区划' : '');

    el.stArea.textContent = self.adName || '—';
    el.stKids.textContent = list.length;
    el.foldCount.textContent = list.length;

    el.kidList.innerHTML = list.length
      ? list.map(function (k, i) {
          return '<li><i>' + (i + 1) + '</i><span>' + esc(k.adName) + '</span></li>';
        }).join('')
      : '<li><i>—</i><span>暂无下辖区划</span></li>';

    var center = [self.coreLat, self.coreLon];
    selfLayer.clearLayers();
    selfLayer.addLayer(dot(center, { radius: 9, fillColor: '#16324A', weight: 2 }));
    selfLayer.addLayer(label(center, self.adName, 'vm-pt--self', 'top', [0, -18]));

    kidLayer.clearLayers();
    kidLabels = [];
    list.forEach(function (k) {
      if (k.coreLat == null || k.coreLon == null) return;
      var p = [k.coreLat, k.coreLon];
      L.polyline([center, p], {
        color: '#0B4F8A', weight: 1, opacity: .22, dashArray: '3 5'
      }).addTo(kidLayer);
      dot(p).addTo(kidLayer);

      var dLat = k.coreLat - self.coreLat;
      var dLon = k.coreLon - self.coreLon;
      var dir, off;
      if (Math.abs(dLat) > Math.abs(dLon)) {
        dir = dLat > 0 ? 'top' : 'bottom';
        off = [0, dLat > 0 ? -8 : 8];
      } else {
        dir = dLon > 0 ? 'right' : 'left';
        off = [dLon > 0 ? 8 : -8, 0];
      }
      var m = label(p, esc(shortName(k.adName)), '', dir, off);
      m.addTo(kidLayer);
      kidLabels.push(m);
      kidMarkers[k.adName] = m;
    });

    var pts = [center];
    list.forEach(function (k) { if (k.coreLat != null) pts.push([k.coreLat, k.coreLon]); });
    map.invalidateSize();
    map.fitBounds(L.latLngBounds(pts), {
      paddingTopLeft: [40, 40], paddingBottomRight: [110, 50], maxZoom: 13
    });
    syncLabels();

    if (!self.geom) note('行政区划边界数据为空，本级仅以中心点标注，未绘制辖域范围。');
    if (isDemo) note('当前为演示模式，统计数字需登录后获取。');

    // 河长看自己负责的流域线；河长办看辖区点 + 按区划的河长人数
    if (user.userType === '1') {
      map.removeLayer(kidLayer);
      showKids = false;
      el.kidsChip.setAttribute('aria-pressed', 'false');
      el.kidsChip.hidden = true;
      loadLeaderWaters(user, self);
    } else {
      loadChiefs(self, list);
    }
  }

  // 按区划统计河长：县级传县码，返回各乡镇的乡级(level 4)/村级(level 5)人数
  function loadChiefs(self, list) {
    if (!getToken()) return;
    api('/statistics/getAreaRiverChief?adCode=' + encodeURIComponent(self.adCode))
      .then(function (res) {
        if (!res || res.code !== 200) return;
        var rows = res.data || [];
        var township = {};
        var total = 0;
        // 统计接口按 level 分组，取本级下一级（省→市、县→乡）
        var target = String((Number(self.adRank) || 1) + 1);

        rows.forEach(function (r) {
          var n = Number(r.number) || 0;
          if (String(r.level) === target) {
            // 统计侧用简称（楚雄州），区划侧是全称（楚雄彝族自治州），按前两字对
            township[String(r.areaName || '').slice(0, 2)] = n;
            total += n;
          }
        });

        // 地图标签只有名字，人数放到列表右侧，避免标签叠成一团
        el.kidList.innerHTML = list.map(function (k, i) {
          var n = township[String(k.adName || '').slice(0, 2)];
          return '<li><i>' + (i + 1) + '</i><span>' + esc(k.adName) + '</span>' +
            (n != null ? '<em>' + n + '</em>' : '') + '</li>';
        }).join('');

        if (total) el.stChief.textContent = total;
        if (!Object.keys(township).length) {
          note('未取到下级区划的河长统计，可能是该区划暂无数据。');
        }
      })
      .catch(function () { /* 统计失败保持原样 */ });
  }

  function loadStats(self) {
    var s = readSession();
    if (!s || !s.token) return;
    api('/statistics/getWaterNumber?adCode=' + encodeURIComponent(self.adCode))
      .then(function (res) {
        var d = res && res.data;
        if (d == null) { el.stWater.textContent = '0'; return; }
        el.stWater.textContent = typeof d === 'object'
          ? Object.keys(d).reduce(function (n, k) { return n + (Number(d[k]) || 0); }, 0)
          : d;
      })
      .catch(function () { /* 统计失败不影响主视图 */ });
  }

  /* -------------------------------------------------------------- 水域线 */

  var WATER_STYLE = { color: '#22C3E6', weight: 3, opacity: .95, lineCap: 'round', lineJoin: 'round' };
  var AREA_STYLE = { color: '#22C3E6', weight: 1.5, opacity: .9, fillColor: '#22C3E6', fillOpacity: .18 };
  var SEG_ENDPOINT = {
    river: 'riverSegments',
    lake: 'lakeSegment',
    chan: 'chanSegment',
    pond: 'pondSegment',
    reservoir: 'reservoirSegment'
  };

  var TYPE_LABEL = { river: '河段', lake: '湖片', chan: '渠段', pond: '塘片', reservoir: '库片' };

  function loadLeaderWaters(user, self) {
    api('/riverLeader/waterListByKeywords?userId=' + encodeURIComponent(user.id))
      .then(function (res) {
        if (!res || res.code !== 200) return;
        var data = res.data || {};
        var jobs = [];
        var items = [];

        Object.keys(SEG_ENDPOINT).forEach(function (key) {
          (data[key] || []).forEach(function (item) {
            if (!item || !item.id) return;
            items.push({ name: item.waterName || '未命名', type: TYPE_LABEL[key] });
            jobs.push(
              api('/' + SEG_ENDPOINT[key] + '/getInfo?id=' + encodeURIComponent(item.id))
                .then(function (r) { return r && r.data; })
                .catch(function () { return null; })
            );
          });
        });

        // 河长关心的是自己的水域清单，不是下辖区划
        el.foldTitle.textContent = '管辖水域';
        el.foldCount.textContent = items.length;
        el.stKids.textContent = items.length;
        var kidsLabel = document.getElementById('vmStKidsLabel');
        if (kidsLabel) kidsLabel.textContent = '管辖水域';
        if (self) {
          el.meta.textContent = (self.ascription || '') +
            (items.length ? ' · ' + items.length + ' 处管辖水域' : '');
        }
        el.kidList.innerHTML = items.length
          ? items.map(function (it, i) {
              return '<li><i>' + (i + 1) + '</i><span>' + esc(it.name) + '</span><em>' + it.type + '</em></li>';
            }).join('')
          : '<li><i>—</i><span>暂无关联水域</span></li>';

        return Promise.all(jobs).then(function (list) {
          var rows = list.filter(function (x) { return x && x.shape; });
          if (!rows.length) {
            note('该河长名下暂未关联水域几何。');
            return;
          }
          drawWaters(rows, true);
        });
      })
      .catch(function () { /* 静默，保持区划视图 */ });
  }

  function drawWaters(rows, fit) {
    waterLayer.clearLayers();
    waterCount = 0;

    rows.forEach(function (r) {
      if (!r.shape) return;
      var g;
      try { g = JSON.parse(r.shape); } catch (e) { return; }

      var isArea = /Polygon$/.test(g.type || '');
      var feat = { type: 'Feature', geometry: g, properties: r };

      // 深色影像上单色线不够醒目，先铺一层浅色描边
      L.geoJSON(feat, {
        style: function () { return { color: '#FFFFFF', weight: isArea ? 3 : 6.5, opacity: .5 }; }
      }).addTo(waterLayer);

      var layer = L.geoJSON(feat, {
        style: function () { return isArea ? AREA_STYLE : WATER_STYLE; }
      });
      layer.bindTooltip(r.waterName || '未命名', { sticky: true, className: 'vm-pt' });
      layer.addTo(waterLayer);
      waterCount += 1;
    });

    if (waterCount) el.stWater.textContent = waterCount;
    if (!waterCount) return;

    // 有河段线时点位自动让位，否则一层圈一层线看不清
    if (showKids) {
      showKids = false;
      el.kidsChip.setAttribute('aria-pressed', 'false');
      map.removeLayer(kidLayer);
    }

    // 河长模式下水域就是全部管辖范围，贴合视野；区划模式保持镇域视野
    if (!fit) return;
    var all = null;
    waterLayer.eachLayer(function (ly) {
      try {
        var b = ly.getBounds && ly.getBounds();
        if (b && b.isValid()) all = all ? all.extend(b) : b;
      } catch (e) { /* 单个图层算不出范围就跳过 */ }
    });
    if (all) map.fitBounds(all, { padding: [40, 40], maxZoom: 14 });
  }

  /* -------------------------------------------------------------- 启动 */

  function visible() {
    return document.body.classList.contains('view-mine-on') && !userBox.hidden;
  }

  function start() {
    if (!visible()) return;
    if (started) {
      // 视图重新打开时容器尺寸变了，重量一次
      if (map) setTimeout(function () { map.invalidateSize(); }, 80);
      return;
    }

    // 没登录也没有显式 uid 就不加载，保持占位图
    var uidParam = new URLSearchParams(location.search).get('uid');
    if (!uidParam && !getToken()) return;

    started = true;
    ensureMap();

    var p;
    if (uidParam) {
      p = api('/user/info?id=' + encodeURIComponent(uidParam)).then(function (r) { return r.data; });
    } else {
      p = api('/login/getInfo')
        .then(function (r) {
          var u = r && r.data && r.data.user;
          if (!u || !u.id) throw new Error('未取到当前用户');
          return api('/user/info?id=' + u.id);
        })
        .then(function (r) { return r.data; });
    }

    p.then(function (user) {
      if (!user || !user.adCodeId) throw new Error('未查到该账号的所属区划');
      return api('/adCode/getInfo?id=' + user.adCodeId + '&returnGeom=false')
        .then(function (a) {
          var self = a && a.data;
          if (!self) throw new Error('未查到区划信息');
          return api('/adCode/attrListByParentId?parentId=' + user.adCodeId + '&nextChild=false')
            .then(function (c) {
              render(user, self, (c && c.data) || []);
            });
        });
    }).catch(function (err) {
      el.meta.textContent = '辖区数据加载失败';
      el.flag.textContent = '数据未加载';
      note('加载失败：' + (err && err.message ? err.message : '未知错误'));
    });
  }

  // 登录态变化：清掉上一轮渲染再重来，否则登出后还停在上一个人的数据上
  document.addEventListener('hzz:session', function () {
    started = false;
    resetView();
    setTimeout(start, 120);
  });

  function resetView() {
    if (!map) return;
    selfLayer.clearLayers();
    kidLayer.clearLayers();
    waterLayer.clearLayers();
    kidLabels = [];
    kidMarkers = {};
    showKids = true;
    showWater = true;

    el.stArea.textContent = '—';
    el.stKids.textContent = '—';
    el.stWater.textContent = '—';
    el.stChief.textContent = '—';
    el.foldCount.textContent = '0';
    el.foldTitle.textContent = '下辖区划';
    el.kidList.innerHTML = '';
    el.meta.textContent = '加载中…';

    var kl = document.getElementById('vmStKidsLabel');
    if (kl) kl.textContent = '下辖区划';

    el.kidsChip.hidden = false;
    el.kidsChip.setAttribute('aria-pressed', 'true');
    el.waterChip.setAttribute('aria-pressed', 'true');
    if (!map.hasLayer(kidLayer)) map.addLayer(kidLayer);
    if (!map.hasLayer(waterLayer)) map.addLayer(waterLayer);
  }

  var obs = new MutationObserver(start);
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  // 登录后 #vmUser 才解除 hidden，这一次变化也要触发加载
  var obsBox = new MutationObserver(start);
  obsBox.observe(userBox, { attributes: true, attributeFilter: ['hidden'] });
  if (visible()) start();
})();
