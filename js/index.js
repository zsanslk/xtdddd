/* 云南省河湖长制履职手册 —— 交互脚本
   由 index.html 末尾的 5 段内联脚本按原顺序合并。 */

/* ==================== 第四章 河湖长数据、名册与州市分布图 ==================== */
    /* ---------- 确定性随机 ---------- */
    function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
    var rnd = mulberry32(20261103);
    function pick(a) { return a[Math.floor(rnd() * a.length)] }
    function ri(n) { return Math.floor(rnd() * n) }

    /* ---------- 基础数据 ---------- */
    var P = [
      { name: '昆明市', total: 4300, c: ['五华区', '盘龙区', '官渡区', '西山区', '东川区', '呈贡区', '晋宁区', '富民县', '宜良县', '石林县', '嵩明县', '禄劝县', '寻甸县', '安宁市'] },
      { name: '曲靖市', total: 3520, c: ['麒麟区', '沾益区', '马龙区', '宣威市', '陆良县', '师宗县', '罗平县', '富源县', '会泽县'] },
      { name: '玉溪市', total: 2200, c: ['红塔区', '江川区', '通海县', '华宁县', '易门县', '峨山县', '新平县', '元江县', '澄江市'] },
      { name: '保山市', total: 2020, c: ['隆阳区', '施甸县', '腾冲市', '龙陵县', '昌宁县'] },
      { name: '昭通市', total: 2960, c: ['昭阳区', '鲁甸县', '巧家县', '盐津县', '大关县', '永善县', '绥江县', '镇雄县', '彝良县', '威信县', '水富市'] },
      { name: '丽江市', total: 1560, c: ['古城区', '玉龙县', '永胜县', '华坪县', '宁蒗县'] },
      { name: '普洱市', total: 2680, c: ['思茅区', '宁洱县', '墨江县', '景东县', '景谷县', '镇沅县', '江城县', '孟连县', '澜沧县', '西盟县'] },
      { name: '临沧市', total: 2460, c: ['临翔区', '凤庆县', '云县', '永德县', '镇康县', '双江县', '耿马县', '沧源县'] },
      { name: '楚雄州', total: 2520, c: ['楚雄市', '双柏县', '牟定县', '南华县', '姚安县', '大姚县', '永仁县', '元谋县', '武定县', '禄丰市'] },
      { name: '红河州', total: 3500, c: ['蒙自市', '个旧市', '开远市', '弥勒市', '建水县', '石屏县', '泸西县', '元阳县', '红河县', '金平县', '绿春县', '屏边县', '河口县'] },
      { name: '文山州', total: 2880, c: ['文山市', '砚山县', '西畴县', '麻栗坡县', '马关县', '丘北县', '广南县', '富宁县'] },
      { name: '西双版纳州', total: 1280, c: ['景洪市', '勐海县', '勐腊县'] },
      { name: '大理州', total: 2960, c: ['大理市', '祥云县', '宾川县', '弥渡县', '永平县', '云龙县', '洱源县', '剑川县', '鹤庆县', '漾濞县', '巍山县', '南涧县'] },
      { name: '德宏州', total: 1240, c: ['芒市', '瑞丽市', '梁河县', '盈江县', '陇川县'] },
      { name: '怒江州', total: 1120, c: ['泸水市', '福贡县', '贡山县', '兰坪县'] },
      { name: '迪庆州', total: 760, c: ['香格里拉市', '德钦县', '维西县'] }
    ];
    P.forEach(function (p) { p.short = p.name.replace(/[市州]$/, '') });

    var BIGRIVERS = ['金沙江', '澜沧江', '怒江', '红河（元江）', '南盘江', '北盘江', '瑞丽江', '大盈江', '李仙江', '把边江', '漾濞江', '黑惠江', '龙川江', '普渡河', '牛栏江', '横江', '盘龙河', '流沙河', '沘江', '勐野江'];
    var LAKES = ['滇池', '洱海', '抚仙湖', '阳宗海', '星云湖', '杞麓湖', '异龙湖', '程海', '泸沽湖'];
    var SMALL = ['清水河', '龙潭河', '黑水河', '白草坪河', '板桥河', '东山河', '西河', '南河', '北庙河', '三岔河', '绿水河', '青鱼湾河', '石门河', '龙川河', '甸溪河', '南溪河', '小河', '大河'];
    var TOWNS = ['金马', '板桥', '青龙', '龙潭', '大营', '新城', '江边', '河口', '河东', '河西', '小街', '黄泥', '马塘', '雨洒', '三岔', '沙溪', '牛街', ' Dor'];
    TOWNS[17] = '渡口';
    var VILLAGES = ['龙树', '白泥', '清水', '河尾', '青松', '马鞍', '箐口', '桃园', '石桥', '新兴', '团结', '平和', '岔河', '大寨', '小寨', '三家', '河湾', '沙坝'];
    var SUR = '李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎易常武乔贺赖龚文'.split('');
    var GIVEN = ['志强', '建国', '文华', '洪斌', '家兴', '顺祥', '云飞', '书明', '光耀', '正平', '丽华', '秀英', '玉芳', '红梅', '春燕', '永康', '德福', '世昌', '宗仁', '学礼', '振华', '明达', '俊峰', '立新', '向阳', '春生', '银花', '翠兰', '美琼', '凤仙', '彩凤', '发科', '兴旺', '富春', '少华', '跃庭', '文光', '克勤', '守信', '和平', '定邦', '安邦', '治国', '齐家', '树声', '万祥', '双全', '朝珍', '桂香', '有福', '德昌', '连科', '金锁', '银柱'];
    var POSTS = {
      0: [['省委书记', '中共云南省委'], ['省长', '云南省人民政府'], ['副省长', '云南省人民政府'], ['省政协副主席', '云南省政协']],
      1: [['市委书记', '中共__市委'], ['市长', '__市人民政府'], ['州委书记', '中共__州委'], ['州长', '__州人民政府'], ['副州长', '__州人民政府'], ['副市长', '__市人民政府']],
      2: [['县委书记', '中共__县委'], ['县长', '__县人民政府'], ['区委书记', '中共__区委'], ['区长', '__区人民政府'], ['市委书记', '中共__市委'], ['市长', '__市人民政府'], ['副市长', '__市人民政府']],
      3: [['镇党委书记', '中共__镇委员会'], ['镇长', '__镇人民政府'], ['乡党委书记', '中共__乡委员会'], ['乡长', '__乡人民政府'], ['街道党工委书记', '中共__街道工作委员会'], ['街道办事处主任', '__街道办事处']],
      4: [['村党总支书记', '__村党总支'], ['村委会主任', '__村民委员会'], ['社区党委书记', '__社区党委'], ['社区居委会主任', '__社区居民委员会']]
    };
    var LVNAMES = ['省级', '州市级', '区县级', '乡镇级', '村（社区）级'];
    var LVCOLORS = ['#0C447C', '#185FA5', '#378ADD', '#85B7EB', '#B5D4F4'];
    var LVNUM = { '省级': 0, '州市级': 1, '区县级': 2, '乡镇级': 3, '村（社区）级': 4 };

    /* ---------- 生成省级示例 ---------- */
    var records = [], seq = 1;
    function code(n) { return 'HLZ-' + String(n).padStart(4, '0') }
    function name_() { return pick(SUR) + (rnd() < 0.85 ? pick(GIVEN) : '') }
    function seg(river, area) { return river + '（' + area + (rnd() < 0.5 ? '左岸' : '右岸') + '段）' }

    [0, 0, 0, 0, 0, 0].forEach(function () {
      var j = pick(POSTS[0]);
      var river = rnd() < 0.6 ? pick(BIGRIVERS) : pick(LAKES);
      records.push({ lv: 0, code: code(seq++), area: '云南省', river: river, reach: river + '（省级责任河湖）', who: name_(), post: j[0], unit: j[1] });
    });

    /* ---------- 各州市样本 ---------- */
    P.forEach(function (p) {
      var n = Math.round(p.total / 100);
      var n1 = 2, m = n - n1;
      var n2 = Math.max(2, Math.round(m * 0.10)), n3 = Math.round(m * 0.30), n4 = m - n2 - n3;
      [n1, n2, n3, n4].forEach(function (cnt, lv) {
        lv = lv + 1;
        for (var i = 0; i < cnt; i++) {
          var county = pick(p.c);
          var river, area, post, unit, reach;
          if (lv === 1) {
            var j = pick(POSTS[1]);
            post = j[0].replace('__', p.short); unit = j[1].replace(/__/g, p.short);
            river = rnd() < 0.5 ? pick(BIGRIVERS) : pick(LAKES);
            area = '云南省·' + p.name;
            reach = seg(river, p.short);
          } else if (lv === 2) {
            var croot2 = county.replace(/[县市区]$/, '');
            var sfx = county.slice(-1);
            var j2 = sfx === '县' ? pick(POSTS[2].slice(0, 2)) : sfx === '区' ? pick(POSTS[2].slice(2, 4)) : pick(POSTS[2].slice(4));
            post = j2[0].replace('__', croot2); unit = j2[1].replace(/__/g, croot2);
            river = pick(BIGRIVERS.concat(LAKES));
            area = '云南省·' + p.name + '·' + county;
            reach = seg(river, county);
          } else if (lv === 3) {
            var croot = county.replace(/[县市区]$/, '');
            var isStreet = rnd() < 0.25, town, tname, j3;
            if (isStreet) {
              town = pick(['兰城', '永昌', '锦屏', '凤翔', '龙泉', '文昌', '金山', '玉带', '秀屏', '大兴']) + '街道';
              tname = town.replace(/街道$/, '');
              j3 = pick([POSTS[3][4], POSTS[3][5]]);
            } else {
              var isTown = rnd() < 0.55;
              town = croot + pick(TOWNS) + (isTown ? '镇' : '乡');
              tname = town;
              j3 = isTown ? pick(POSTS[3].slice(0, 2)) : pick(POSTS[3].slice(2, 4));
            }
            var base = town.replace(/(街道办事处|街道|镇|乡)$/, '');
            post = j3[0].replace('__', base); unit = j3[1].replace(/__/g, base);
            river = pick(SMALL);
            area = '云南省·' + p.name + '·' + county + '·' + town;
            reach = seg(river, tname);
          } else {
            var croot2 = county.replace(/[县市区]$/, '');
            var town2 = croot2 + pick(TOWNS) + '镇';
            var vil = pick(VILLAGES);
            var comm = rnd() < 0.3;
            if (comm) { town2 = croot2 + pick(['城关', '河东', '河西', '新市']) + '街道' }
            var j4 = comm ? pick(POSTS[4].slice(2)) : pick(POSTS[4].slice(0, 2));
            post = j4[0].replace('__', vil); unit = (comm ? '__社区居民委员会' : '__村民委员会').replace('__', vil);
            river = pick(SMALL);
            area = '云南省·' + p.name + '·' + county + '·' + town2 + '·' + vil;
            reach = seg(river, vil);
          }
          records.push({ lv: lv, code: code(seq++), area: area, river: river, reach: reach, who: name_(), post: post, unit: unit });
        }
      });
    });

    /* ---------- 总览：梯形金字塔 ---------- */
    var LEVELS = [
      { n: '省 级', v: 40, pct: '0.1%' },
      { n: '州 市 级', v: 340, pct: '0.9%' },
      { n: '区 县 级', v: 3700, pct: '9.7%' },
      { n: '乡 镇 级', v: 12000, pct: '31.6%' },
      { n: '村（社区）级', v: 21920, pct: '57.7%' }
    ];
    (function () {
      var cx = 500, widths = [340, 500, 660, 820, 980], h = 96, gap = 10, padY = 8;
      var fills = ['#093D6E', '#1565A6', '#2E7FC2', '#9CC4E4', '#DCEAF5'];
      var nameC = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#093D6E', '#0B4F8A'];
      var cntC = ['#D6E6F3', '#D9E9F5', '#EDF6FC', '#1D4E77', '#5B7793'];
      var parts = '';
      LEVELS.forEach(function (l, i) {
        var yT = padY + i * (h + gap);
        var w = widths[i];
        parts += '<rect x="' + (cx - w / 2) + '" y="' + yT + '" width="' + w + '" height="' + h + '" rx="10" fill="' + fills[i] + '"/>';
        parts += '<text x="' + cx + '" y="' + (yT + 44) + '" text-anchor="middle" font-size="18" font-weight="500" fill="' + nameC[i] + '">' + l.n + '</text>';
        parts += '<text x="' + cx + '" y="' + (yT + 74) + '" text-anchor="middle" font-size="13.5" fill="' + cntC[i] + '">' + l.v.toLocaleString() + ' 人 · ' + l.pct + '</text>';
      });
      var H = padY * 2 + LEVELS.length * h + (LEVELS.length - 1) * gap;
      document.getElementById('pyramid').innerHTML = '<svg viewBox="0 0 1000 ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;font-family:inherit" role="img"><title>五级河湖长分布金字塔</title>' + parts + '</svg>';
    })();

    /* ---------- 分州市表 ---------- */
    var maxT = 4300;
    var provChiefs = records.filter(function (r) { return r.lv === 0 });
    var provDetail = provChiefs.map(function (r) {
      return '<tr><td><b style="font-weight:500">' + r.who + '</b></td><td>' + r.post + '</td><td>' + r.unit + '</td><td>' + r.river + '</td><td>' + r.reach + '</td></tr>';
    }).join('');
    var provDetailRow = '<tr class="detail-row" style="display:none"><td colspan="5">' +
      '<table><thead><tr><th>河长姓名</th><th>职务</th><th>所在单位</th><th>河流（湖泊）</th><th>责任河段</th></tr></thead>' +
      '<tbody>' + provDetail + '</tbody></table></td></tr>';
    var tb = document.querySelector('#prefTable tbody');
    var rowsHtml = '<tr class="prov"><td><span class="caret">▶</span>省级</td><td class="r">40</td><td class="r">0.1%</td><td class="r">' + provChiefs.length + '</td><td class="barcell"><div class="hbar" style="width:2%;background:#B5D4F4"></div></td></tr>' + provDetailRow;
    P.forEach(function (p) {
      var sample = records.filter(function (r) { return r.lv > 0 && (r.area === '云南省·' + p.name || r.area.indexOf('·' + p.name + '·') === 0) }).length;
      rowsHtml += '<tr class="rowlink" data-pref="' + p.name + '"><td>' + p.name + '</td><td class="r">' + p.total.toLocaleString() + '</td><td class="r">' + (p.total / 380).toFixed(1) + '%</td><td class="r">' + sample + '</td><td class="barcell"><div class="hbar" style="width:' + (p.total / maxT * 100).toFixed(1) + '%"></div></td></tr>';
    });
    rowsHtml += '<tr class="total"><td>16 州市合计 + 省级</td><td class="r">38,000</td><td class="r">100%</td><td class="r">' + records.length + '</td><td class="barcell"><div class="hbar strong" style="width:100%"></div></td></tr>';
    tb.innerHTML = rowsHtml;
    tb.addEventListener('click', function (e) {
      var prov = e.target.closest('tr.prov');
      if (prov) {
        var d = prov.nextElementSibling;
        var opening = d.style.display === 'none';
        d.style.display = opening ? '' : 'none';
        prov.classList.toggle('open', opening);
        return;
      }
      var tr = e.target.closest('tr.rowlink');
      if (tr) {
        switchTab('roster');
        document.getElementById('q').value = '';
        document.getElementById('fLevel').value = '';
        document.getElementById('fPref').value = tr.dataset.pref;
        apply();
        document.getElementById('tab-roster').scrollIntoView({ behavior: 'smooth' });
      }
    });

    var MAP_GEO = { "昆明市": { "d": "M479 448L490 448L495 434L512 443L511 449L523 440L527 421L526 413L520 412L519 416L517 414L513 417L508 411L510 401L505 395L512 391L510 384L506 383L505 387L498 388L496 382L492 381L497 370L493 369L501 356L506 355L506 347L512 349L517 346L512 339L516 333L514 330L518 327L513 322L511 324L509 319L506 322L496 320L496 300L491 288L479 281L475 255L473 260L469 260L469 273L461 274L460 271L442 287L436 283L438 274L433 272L405 286L406 294L414 299L412 320L417 326L415 341L423 346L425 358L421 365L416 364L414 368L420 377L413 396L404 398L400 393L399 399L405 403L404 410L407 409L409 413L410 424L408 443L401 448L411 460L415 458L417 450L420 451L423 447L426 449L436 445L437 450L442 448L444 452L454 448L452 444L458 429L456 425L463 423L462 415L470 409L473 414L471 424L477 425L473 435L474 443L479 442L479 448Z", "cx": 459, "cy": 365 }, "曲靖市": { "d": "M503 236L504 239L501 236L490 238L488 247L476 248L475 255L479 281L491 288L496 300L496 320L506 322L509 319L511 324L513 322L518 327L514 330L516 333L512 339L517 346L512 349L506 347L506 355L501 356L493 369L497 370L492 381L496 382L498 388L505 387L506 383L510 384L512 391L505 395L510 401L508 411L513 417L517 414L519 416L520 412L526 413L527 427L535 424L532 428L535 430L540 427L550 435L553 434L553 440L559 446L557 454L561 456L571 453L577 463L592 460L592 456L601 455L605 451L597 435L602 419L617 402L615 396L609 395L615 394L620 381L625 386L627 379L626 376L611 373L611 367L602 363L604 351L593 356L592 346L583 341L584 329L588 332L593 323L591 315L596 308L595 298L601 297L602 282L614 272L613 265L605 256L604 250L596 250L592 239L583 248L566 246L560 258L540 256L534 247L536 236L532 236L531 231L537 217L528 206L523 212L506 211L508 216L504 220L503 236Z", "cx": 551, "cy": 335 }, "玉溪市": { "d": "M404 410L395 406L391 414L384 413L385 417L379 423L380 432L376 436L380 440L375 442L377 450L382 453L385 451L384 457L387 459L382 470L368 473L369 467L365 469L356 460L348 473L340 475L337 460L332 456L331 462L322 467L333 492L344 504L333 513L335 523L344 517L347 521L344 526L346 528L347 526L351 531L359 529L355 534L361 538L359 541L366 549L362 554L373 560L376 557L395 560L400 551L411 552L415 545L409 532L403 525L398 525L400 519L396 512L403 505L407 506L403 495L413 492L409 489L411 487L421 492L437 492L441 505L448 494L456 492L460 497L467 490L473 493L483 476L475 455L479 451L479 442L474 443L473 435L477 425L471 424L473 414L470 409L462 415L463 423L456 425L458 429L453 437L454 448L444 452L442 448L437 450L436 445L426 449L423 447L420 451L417 450L415 458L411 460L401 448L409 440L409 413L407 409L404 410Z", "cx": 401, "cy": 483 }, "保山市": { "d": "M117 341L115 349L106 348L103 322L101 320L96 325L86 321L80 336L76 337L75 345L68 350L62 343L55 342L57 347L52 353L54 363L49 364L48 369L57 378L56 388L64 393L59 405L61 408L68 405L69 410L86 412L88 418L78 422L79 432L76 436L82 440L82 445L93 441L100 443L103 450L99 454L103 462L101 485L114 484L119 479L134 474L149 454L155 457L157 473L166 473L181 453L185 454L182 441L196 430L193 421L198 417L196 414L201 410L200 406L216 396L216 392L211 392L206 382L200 385L197 393L186 396L170 390L151 366L151 361L156 362L155 352L148 349L134 357L131 348L127 348L127 341L117 341Z", "cx": 124, "cy": 404 }, "昭通市": { "d": "M475 255L476 248L488 247L490 238L501 236L504 239L502 233L504 220L508 216L506 211L523 212L522 205L527 205L523 202L530 199L534 191L544 184L550 169L557 170L557 175L566 179L571 186L577 184L577 179L586 167L599 172L602 180L607 182L621 178L624 181L627 178L631 184L648 171L656 172L657 176L662 170L662 160L668 153L665 136L669 133L662 132L665 117L658 117L656 109L647 107L640 111L633 120L635 122L630 125L606 131L600 128L581 112L588 111L595 105L590 97L595 93L594 90L591 91L587 84L581 86L577 68L592 59L591 55L583 58L577 53L576 56L570 55L565 59L551 59L543 53L542 61L537 66L545 88L532 97L526 92L519 94L509 104L507 112L513 114L514 119L518 118L513 125L512 135L497 149L495 157L486 161L480 173L475 172L469 176L465 172L460 183L460 216L467 226L475 255Z", "cx": 556, "cy": 149 }, "丽江市": { "d": "M290 290L309 274L338 266L338 259L332 250L338 249L337 239L342 233L338 231L337 237L332 238L329 233L332 226L330 222L321 220L321 215L310 209L313 193L303 192L300 178L295 169L290 168L291 162L286 152L283 153L285 148L279 145L273 135L271 124L267 124L259 134L250 129L244 140L240 143L238 141L238 148L227 166L233 181L218 196L217 217L210 224L203 204L181 181L183 178L174 164L174 158L162 166L164 178L162 190L159 191L164 197L164 207L176 225L178 239L187 247L205 245L214 251L217 250L217 245L224 249L233 240L233 245L242 247L244 253L251 255L253 260L249 261L250 266L255 267L251 268L251 273L246 278L251 287L248 289L249 293L254 295L254 305L261 305L261 308L270 306L268 297L273 292L283 287L287 292L290 290Z", "cx": 258, "cy": 217 }, "普洱市": { "d": "M322 468L305 454L290 425L281 428L268 418L261 429L256 426L247 429L259 451L256 454L255 488L244 491L248 504L242 511L242 520L250 528L244 533L237 530L228 533L216 571L202 567L195 572L184 568L179 573L181 577L177 575L170 581L175 598L172 601L165 597L166 606L161 608L160 614L153 616L160 632L155 644L148 649L150 653L141 669L143 671L140 670L145 676L175 675L188 683L188 680L192 680L198 684L201 680L210 681L220 663L230 662L230 658L242 663L248 645L258 642L263 644L282 630L290 636L301 630L306 634L325 636L336 631L342 648L347 651L346 655L354 655L356 641L364 638L376 650L376 645L388 643L397 648L399 645L407 646L412 634L408 628L391 624L385 612L377 608L375 611L367 603L374 590L381 589L381 592L385 592L390 582L382 575L370 576L369 568L375 564L369 556L362 554L366 549L359 541L361 538L355 534L359 529L351 531L347 526L346 528L344 526L347 521L344 517L335 523L333 513L344 504L333 492L322 468Z", "cx": 274, "cy": 574 }, "临沧市": { "d": "M247 429L238 424L229 426L221 433L230 404L221 402L214 406L212 398L207 400L200 406L201 410L196 414L198 417L193 421L196 430L182 441L185 454L181 453L166 473L157 473L155 457L149 454L134 474L119 479L116 482L118 486L105 498L98 500L101 501L101 512L98 515L108 517L116 532L110 542L111 547L115 545L119 551L120 558L115 560L121 562L117 574L131 576L131 580L136 583L144 581L148 584L156 579L164 584L171 584L170 581L177 575L181 577L179 573L184 568L195 572L202 567L216 571L219 568L219 558L225 548L228 533L237 530L244 533L250 528L242 520L242 511L248 504L244 491L255 488L256 454L259 451L247 429Z", "cx": 184, "cy": 502 }, "楚雄州": { "d": "M404 410L405 403L399 399L400 393L404 398L413 396L420 377L414 368L416 364L421 365L425 358L423 346L415 341L417 326L412 320L414 299L404 289L393 300L377 296L370 302L368 291L357 283L352 285L348 280L351 276L355 277L355 273L342 259L338 259L339 264L335 269L309 274L297 282L290 290L293 302L290 307L295 311L289 324L294 328L293 331L296 330L292 335L297 339L298 348L294 348L293 356L301 363L301 368L296 370L297 377L283 375L283 383L279 382L279 395L276 397L279 401L274 404L278 411L278 425L281 428L290 425L293 427L305 454L320 468L329 464L332 456L337 460L340 475L348 473L356 460L365 469L369 467L368 473L372 473L382 470L387 461L385 451L382 453L377 450L375 442L380 440L376 436L380 432L379 423L383 421L384 413L391 414L395 406L404 410Z", "cx": 347, "cy": 368 }, "红河州": { "d": "M479 448L475 455L483 476L473 494L467 490L460 497L456 492L448 494L441 505L437 492L421 492L411 487L409 489L413 492L403 495L408 503L407 506L398 508L396 512L400 519L397 523L409 532L415 545L411 552L400 551L395 560L373 559L375 564L369 568L370 576L382 575L390 582L385 592L381 592L381 589L374 590L367 603L373 610L377 608L385 612L391 624L408 628L412 634L420 626L417 622L427 612L433 620L436 617L449 623L460 630L464 640L476 644L477 638L486 633L484 628L494 622L498 609L508 615L509 624L516 630L525 611L545 633L553 638L557 637L560 617L566 609L579 608L580 604L571 606L566 601L562 608L558 608L555 619L547 620L546 608L549 607L548 599L552 591L548 572L550 567L546 560L540 559L539 545L533 544L532 539L526 543L521 540L520 536L527 529L524 520L527 509L531 507L519 488L528 478L536 477L544 462L558 453L559 446L553 440L553 434L550 435L540 427L535 430L532 428L535 424L527 427L523 440L511 449L512 443L495 434L490 448L479 448Z", "cx": 473, "cy": 550 }, "文山州": { "d": "M605 451L601 455L592 456L592 460L581 463L574 462L571 453L561 456L553 454L544 462L536 477L528 478L519 488L531 507L527 509L524 520L527 529L520 536L521 540L526 543L532 539L533 544L539 545L539 557L546 560L550 567L548 572L552 591L548 599L549 607L546 608L546 618L549 621L555 619L558 608L562 608L566 601L571 606L580 604L579 616L588 621L606 606L609 609L619 608L622 601L630 597L625 581L631 579L632 575L637 577L639 572L650 566L662 566L664 559L670 554L688 574L687 568L699 558L702 560L697 553L702 553L715 541L726 545L727 549L740 537L739 516L744 513L744 508L727 484L720 485L718 492L710 494L711 491L707 489L697 493L696 484L693 483L686 487L684 495L677 493L669 485L664 490L657 484L657 480L663 477L656 470L659 465L651 457L646 454L636 457L620 453L616 456L617 466L608 460L610 458L605 456L605 451Z", "cx": 617, "cy": 526 }, "西双版纳州": { "d": "M354 655L346 655L347 651L342 648L336 631L325 636L306 634L301 630L290 636L282 630L263 644L258 642L248 645L242 663L230 658L230 662L220 663L209 683L212 689L207 703L216 718L221 714L227 718L222 724L223 733L227 735L228 732L234 737L249 730L254 738L270 735L288 716L309 708L311 728L316 728L318 734L315 741L310 742L320 753L317 759L323 764L344 757L350 759L350 765L356 763L362 768L366 761L370 761L370 757L362 753L361 749L364 732L362 727L369 723L362 712L365 703L358 696L359 693L350 689L352 686L347 675L350 674L345 664L354 655Z", "cx": 293, "cy": 693 }, "大理州": { "d": "M117 341L127 341L127 348L131 348L134 357L148 349L155 352L156 362L151 361L151 366L170 390L186 396L197 393L200 385L206 382L211 392L216 392L216 396L212 398L214 406L221 402L230 404L221 433L229 426L238 424L247 429L256 426L261 429L268 418L276 422L278 411L274 404L279 401L276 397L279 395L279 382L283 383L283 375L297 377L296 370L301 368L301 363L293 356L294 348L298 348L298 345L297 339L292 335L296 330L293 331L294 328L289 324L295 311L290 307L293 303L290 290L287 292L283 287L278 288L268 297L270 306L261 308L261 305L254 305L254 295L249 293L248 289L251 287L246 278L251 273L251 268L255 269L250 266L249 261L253 260L251 255L244 253L242 247L233 245L233 240L224 249L217 245L217 250L214 251L205 245L187 247L183 242L170 251L170 266L163 274L154 276L154 282L140 291L144 295L130 291L127 295L127 310L132 310L138 327L129 324L131 331L128 332L115 327L117 341Z", "cx": 216, "cy": 332 }, "德宏州": { "d": "M48 369L36 380L32 381L27 376L19 394L16 394L17 410L23 416L15 416L2 426L4 432L0 455L12 453L16 461L11 464L12 468L21 472L17 475L17 486L0 502L10 511L23 501L32 499L32 495L50 487L88 484L91 489L101 485L103 462L99 454L103 450L100 443L93 441L82 445L82 440L76 436L79 432L78 422L88 418L86 412L69 410L68 405L61 408L59 405L64 393L56 388L57 378L48 369Z", "cx": 48, "cy": 443 }, "怒江州": { "d": "M182 242L178 239L174 221L165 214L159 220L152 205L148 204L150 209L145 213L135 210L126 212L128 207L125 207L123 195L127 183L126 180L119 179L116 157L119 151L112 142L115 138L109 130L108 111L103 107L100 96L75 106L73 93L66 80L58 82L63 93L53 101L52 118L57 122L55 130L60 134L62 141L59 144L65 149L68 162L72 163L77 159L79 148L84 152L88 150L91 156L96 158L98 155L101 158L99 171L104 184L100 191L102 204L106 206L103 211L106 222L103 225L108 249L98 283L104 289L97 298L97 293L90 295L93 309L97 310L103 322L106 348L115 349L115 327L126 332L131 331L129 324L138 327L132 310L127 310L129 292L143 296L140 291L154 282L154 276L163 274L168 269L171 264L169 252L182 242Z", "cx": 115, "cy": 216 }, "迪庆州": { "d": "M238 141L239 130L227 125L229 122L214 102L227 95L227 86L217 80L219 76L212 72L209 63L189 48L188 36L180 39L179 46L172 52L173 57L160 66L164 78L160 86L161 102L141 78L142 60L135 39L138 26L136 0L124 2L128 17L120 23L119 32L124 34L120 40L112 38L108 21L101 25L95 24L99 47L92 51L94 68L105 84L99 98L108 111L109 130L115 138L112 142L119 151L116 157L119 179L126 180L127 183L123 195L125 207L128 207L126 212L135 210L145 213L150 209L148 204L152 205L159 220L162 214L169 215L163 204L164 197L159 191L162 190L164 178L162 166L174 158L174 164L183 178L181 181L203 204L209 215L209 223L215 221L219 209L218 196L233 181L227 166L238 148L238 141Z", "cx": 164, "cy": 121 } };
    var MAP_VB = [744, 768];
    /* ---------- 各州市河长数量示意图 ---------- */
    (function () {
      var BINS = [[1300, '#EDF5FB'], [2100, '#CFE3F3'], [2700, '#A5C9E8'], [3200, '#78AEDB'], [1e9, '#4784BD']];
      var LBL = ['1—1,300', '1,301—2,100', '2,101—2,700', '2,701—3,200', '3,200 以上'];
      function fill(t) { for (var i = 0; i < BINS.length; i++) { if (t <= BINS[i][0]) return BINS[i][1] } }
      var W = MAP_VB[0], H = MAP_VB[1], parts = '';
      P.forEach(function (p) {
        var g = MAP_GEO[p.name]; if (!g) return;
        parts += '<path class="pf" data-pref="' + p.name + '" d="' + g.d + '" fill="' + fill(p.total) + '" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>';
      });
      P.forEach(function (p) {
        var g = MAP_GEO[p.name]; if (!g) return;
        var r = (15 + 13 * (p.total - 760) / (4300 - 760)).toFixed(1);
        parts += '<circle class="mc" data-pref="' + p.name + '" cx="' + g.cx + '" cy="' + g.cy + '" r="' + r + '" fill="#FFFFFF" fill-opacity="0.9" stroke="#0C447C" stroke-width="3"/>';
        parts += '<text x="' + g.cx + '" y="' + (+g.cy + 4) + '" text-anchor="middle" font-size="12" font-weight="600" fill="#0C447C" style="pointer-events:none">' + p.total + '</text>';
      });
      document.getElementById('mapBox').insertAdjacentHTML('beforeend', '<svg viewBox="-8 -8 ' + (W + 16) + ' ' + (H + 16) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="各州市河长数量示意图">' + parts + '</svg>');
      var lg = '<h4>河长数量（人）</h4>';
      for (var i = 4; i >= 0; i--) { lg += '<div class="sw"><i style="background:' + BINS[i][1] + '"></i>' + LBL[i] + '</div>'; }
      lg += '<div class="circ"><svg width="34" height="22" aria-hidden="true"><circle cx="17" cy="11" r="8" fill="#FFFFFF" fill-opacity="0.9" stroke="#0C447C" stroke-width="3"/></svg><span>蓝圈大小与数量成正比，圈内为数量</span></div>';
      document.getElementById('mapLegend').innerHTML = lg;
      var box = document.getElementById('mapBox'), tip = document.getElementById('mapTip');
      box.addEventListener('mousemove', function (e) {
        var t = e.target.closest ? e.target.closest('[data-pref]') : null;
        if (!t) { tip.style.display = 'none'; return; }
        var p = P.find(function (x) { return x.name === t.dataset.pref });
        tip.innerHTML = '<b>' + p.total.toLocaleString() + '</b> 人 · 占全省 ' + (p.total / 380).toFixed(1) + '%';
        tip.style.display = 'block';
        var rc = box.getBoundingClientRect();
        tip.style.left = (e.clientX - rc.left) + 'px';
        tip.style.top = (e.clientY - rc.top) + 'px';
      });
      box.addEventListener('mouseleave', function () { tip.style.display = 'none' });
      box.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('[data-pref]') : null;
        if (!t) return;
        switchTab('roster');
        document.getElementById('q').value = '';
        document.getElementById('fLevel').value = '';
        document.getElementById('fPref').value = t.dataset.pref;
        apply();
        document.getElementById('tab-roster').scrollIntoView({ behavior: 'smooth' });
      });
    })();

    /* ---------- 名册检索 ---------- */
    var selP = document.getElementById('fPref');
    P.forEach(function (p) { var o = document.createElement('option'); o.value = p.name; o.textContent = p.name; selP.appendChild(o) });
    var PAGE = 20, page = 1;
    function filtered() {
      var q = document.getElementById('q').value.trim().toLowerCase();
      var lv = document.getElementById('fLevel').value, pf = document.getElementById('fPref').value;
      return records.filter(function (r) {
        if (lv && LVNAMES[r.lv] !== lv) return false;
        if (pf && r.area.indexOf('·' + pf) < 0) return false;
        if (q) {
          var blob = (r.code + r.area + r.river + r.reach + r.who + r.post + r.unit + LVNAMES[r.lv]).toLowerCase();
          if (blob.indexOf(q) < 0) return false;
        }
        return true;
      });
    }
    function lvTag(l) { return '<span class="tag lv' + l + '">' + LVNAMES[l] + '</span>' }
    function render() {
      var list = filtered(), start = (page - 1) * PAGE, rows = list.slice(start, start + PAGE);
      document.getElementById('hitCount').textContent = list.length;
      document.getElementById('hitScope').textContent = page > 1 ? '（第 ' + start + '—' + Math.min(start + rows.length, list.length) + ' 条）' : '';
      document.getElementById('rosterBody').innerHTML = rows.length ? rows.map(function (r) {
        return '<tr><td style="color:#93A1AE">' + r.code + '</td><td>' + lvTag(r.lv) + '</td><td>' + r.area + '</td><td>' + r.river + '</td><td>' + r.reach + '</td><td><b style="font-weight:500">' + r.who + '</b></td><td>' + r.post + '</td><td>' + r.unit + '</td></tr>';
      }).join('') : '<tr><td colspan="8" class="empty">没有匹配的记录，试试更换关键词或清空筛选条件。</td></tr>';
      var tp = Math.max(1, Math.ceil(list.length / PAGE));
      document.getElementById('pageInfo').textContent = '第 ' + page + ' / ' + tp + ' 页';
      document.getElementById('prevBtn').disabled = page <= 1;
      document.getElementById('nextBtn').disabled = page >= tp;
    }
    function syncChips() {
      var lv = document.getElementById('fLevel').value;
      document.querySelectorAll('#quickLv button').forEach(function (x) { x.classList.toggle('on', x.dataset.lv === lv) });
    }
    function apply() { page = 1; syncChips(); render() }
    function resetRosterFilters() {
      document.getElementById('q').value = '';
      document.getElementById('fLevel').value = '';
      document.getElementById('fPref').value = '';
      page = 1; syncChips(); render();
    }
    document.getElementById('q').addEventListener('input', apply);
    document.getElementById('fLevel').addEventListener('change', apply);
    document.getElementById('fPref').addEventListener('change', apply);
    document.getElementById('resetBtn').addEventListener('click', resetRosterFilters);
    document.querySelectorAll('#quickLv button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.lv === '' && document.getElementById('fPref').value !== '') { document.getElementById('fPref').value = ''; }
        document.getElementById('fLevel').value = b.dataset.lv;
        apply();
      });
    });
    document.getElementById('prevBtn').addEventListener('click', function () { page--; render() });
    document.getElementById('nextBtn').addEventListener('click', function () { page++; render() });

    /* ---------- Tab 切换 ---------- */
    function switchTab(id) {
      document.querySelectorAll('nav.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === id) });
      document.querySelectorAll('#ch4 > section').forEach(function (s) { s.classList.toggle('on', s.id === 'tab-' + id) });
    }
    document.querySelectorAll('nav.tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        switchTab(b.dataset.tab);
        if (b.dataset.tab === 'roster') resetRosterFilters();
      });
    });
    resetRosterFilters();
    document.getElementById('rosterSub').textContent = '支持按姓名、河流名称、行政区划、单位、职务模糊检索；共入库 ' + records.length + ' 条示例记录（约全省 1% 抽样）。';


    /* ---------- 章节导航（含二级标题目录） ---------- */
    (function () {
      var toc = document.getElementById('toc');
      if (!toc) return;
      var links = [].slice.call(toc.querySelectorAll('a.toc-lv1'));
      var subs = [].slice.call(toc.querySelectorAll('a.toc-sub'));
      var groups = [].slice.call(toc.querySelectorAll('.toc-grp'));
      var order = links.map(function (a) { return a.dataset.ch });
      var pos = document.getElementById('chPos'), prev = document.getElementById('prevCh'), next = document.getElementById('nextCh');

      function showCh(id, keepScroll) {
        document.querySelectorAll('.chapter').forEach(function (s) { s.classList.toggle('on', s.id === id) });
        links.forEach(function (a) { a.classList.toggle('active', a.dataset.ch === id) });
        subs.forEach(function (a) { a.classList.remove('active') });
        lastSub = null;
        groups.forEach(function (g) {
          var a = g.querySelector('a.toc-lv1');
          var open = !!a && a.dataset.ch === id;
          g.classList.toggle('open', open);
          if (a) a.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        var i = order.indexOf(id);
        if (i > -1 && pos) {
          pos.textContent = (i + 1) + ' / ' + order.length;
          if (prev) prev.disabled = i === 0;
          if (next) next.disabled = i === order.length - 1;
        }
        if (!keepScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (prev) prev.addEventListener('click', function () { var i = order.indexOf(document.querySelector('.chapter.on').id); if (i > 0) showCh(order[i - 1]) });
      if (next) next.addEventListener('click', function () { var i = order.indexOf(document.querySelector('.chapter.on').id); if (i < order.length - 1) showCh(order[i + 1]) });

      function setHash(h) { if (history.replaceState) history.replaceState(null, '', '#' + h); }
      function offsetTop(el) { return el.getBoundingClientRect().top + window.pageYOffset - 68; }

      links.forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var g = a.closest('.toc-grp');
          var cur = document.querySelector('.chapter.on');
          // 点“当前章节”的标题只做开合：再走 showCh 会把它强制重新展开，收起后点一下就回来
          if (cur && a.dataset.ch === cur.id) {
            if (!g) return;
            var open = g.classList.toggle('open');
            a.setAttribute('aria-expanded', open ? 'true' : 'false');
            return;
          }
          showCh(a.dataset.ch);
          setHash(a.dataset.ch);
        });
      });

      subs.forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var id = a.getAttribute('href').slice(1);
          showCh(a.dataset.ch, true);
          subs.forEach(function (b) { b.classList.toggle('active', b === a) });
          var t = document.getElementById(id);
          if (t) window.scrollTo({ top: offsetTop(t), behavior: 'smooth' });
          setHash(id);
        });
      });

      /* 滚动时高亮当前二级标题，并让目录跟随滚动 */
      var ticking = false, lastSub = null;
      function spy() {
        ticking = false;
        var cur = document.querySelector('.chapter.on');
        if (!cur) return;
        var mine = subs.filter(function (a) { return a.dataset.ch === cur.id });
        if (!mine.length) return;
        var line = window.pageYOffset + 100, hit = null;
        mine.forEach(function (a) {
          var el = document.getElementById(a.getAttribute('href').slice(1));
          if (el && el.getBoundingClientRect().top + window.pageYOffset <= line) hit = a;
        });
        if (hit === lastSub) return;
        lastSub = hit;
        subs.forEach(function (a) { a.classList.toggle('active', a === hit) });
        if (hit) {
          var grp = hit.closest('.toc-grp');
          if (!grp || !grp.classList.contains('open')) return; // 收起时链接高度为 0，跟着滚会把目录顶到头上
          var r = hit.getBoundingClientRect(), tr = toc.getBoundingClientRect();
          if (r.bottom > tr.bottom - 10) toc.scrollTop += r.bottom - tr.bottom + 26;
          else if (r.top < tr.top + 10) toc.scrollTop -= tr.top - r.top + 26;
        }
      }
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(spy); }
      }, { passive: true });

      // 初始 aria-expanded 与 HTML 上的 .open 对齐
      groups.forEach(function (g) {
        var a = g.querySelector('a.toc-lv1');
        if (a) a.setAttribute('aria-expanded', g.classList.contains('open') ? 'true' : 'false');
      });

      var h = location.hash.replace('#', '');
      if (h) {
        var el = document.getElementById(h);
        if (el && el.classList.contains('chapter')) {
          showCh(h, true);
        } else if (el) {
          var sub = subs.filter(function (a) { return a.getAttribute('href') === '#' + h })[0];
          if (sub) showCh(sub.dataset.ch, true);
          window.setTimeout(function () { window.scrollTo(0, offsetTop(el)) }, 80);
        }
      }
    })();
  

/* ==================== 图框轮播（流域图集） ==================== */
    /* 图框轮播：每个 .ws-slider 内两张图（地理位置图 / 水系分布图），支持箭头、圆点、滑动切换 */
    (function () {
      function init(box) {
        var view = box.querySelector('.ws-view'),
          track = box.querySelector('.ws-track'),
          slides = [].slice.call(track.children),
          cap = box.querySelector('.ws-cap'),
          dots = [].slice.call(box.querySelectorAll('.ws-dot')),
          i = 0;
        if (slides.length < 2) return;
        function fit() {
          var cur = slides[i], im = cur.querySelector('img');
          var pad = (parseFloat(getComputedStyle(cur).paddingTop) || 0) + (parseFloat(getComputedStyle(cur).paddingBottom) || 0);
          var hh = im ? Math.round(im.getBoundingClientRect().height) + pad : 0;
          if (hh > 0 && Math.abs((parseFloat(view.style.height) || 0) - hh) > 1) view.style.height = hh + 'px';
        }
        function go(n) {
          i = (n + slides.length) % slides.length;
          track.style.transform = 'translateX(' + (-i * 100) + '%)';
          if (cap) cap.textContent = slides[i].getAttribute('data-cap') || '';
          dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
          fit();
        }
        box.querySelector('.ws-nav.prev').addEventListener('click', function () { go(i - 1); });
        box.querySelector('.ws-nav.next').addEventListener('click', function () { go(i + 1); });
        dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
        // 触摸滑动
        var x0 = null, y0 = null, locked = null;
        view.addEventListener('touchstart', function (e) {
          x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; locked = null;
        }, { passive: true });
        view.addEventListener('touchmove', function (e) {
          if (x0 === null) return;
          var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
          if (locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) locked = Math.abs(dx) > Math.abs(dy);
        }, { passive: true });
        view.addEventListener('touchend', function (e) {
          if (x0 === null) return;
          var dx = e.changedTouches[0].clientX - x0;
          if (locked && Math.abs(dx) > 45) go(i + (dx < 0 ? 1 : -1));
          x0 = null;
        });
        // 键盘左右键（聚焦到轮播区时）
        box.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
          if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
        });
        slides.forEach(function (sl) {
          var im = sl.querySelector('img');
          if (!im) return;
          if (im.complete) fit();
          im.addEventListener('load', fit);
          im.addEventListener('error', function () { sl.setAttribute('data-err', '1'); fit(); });
        });
        window.addEventListener('resize', fit);
        window.addEventListener('orientationchange', fit);
        // 切换章节（图框由隐藏变可见）时重新贴合高度
        if (window.IntersectionObserver) {
          new IntersectionObserver(function (es) {
            es.forEach(function (en) { if (en.isIntersecting) fit(); });
          }, { threshold: 0 }).observe(box);
        }
        // 章节切换显隐、字体变化等尺寸变动时重新贴合当前图片高度
        if (window.ResizeObserver) { new ResizeObserver(function () { fit(); }).observe(view); }
        go(0);
      }
      var t = document.querySelectorAll('[data-slider]');
      Array.prototype.forEach.call(t, init);
      window.addEventListener('load', function () {
        Array.prototype.forEach.call(t, function (box) {
          var ev = document.createEvent('Event'); ev.initEvent('resize', false, false); window.dispatchEvent(ev);
        });
      });
    })();
  

/* ==================== 原图查看器（浅色遮罩） ==================== */
    /* 点击图件查看原图（浅色遮罩，支持 Esc 关闭） */
    (function () {
      var lb = document.createElement('div');
      lb.className = 'ws-lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-label', '查看原图');
      lb.innerHTML = '<button class="lb-close" type="button" aria-label="关闭">&#10005;</button><img alt="">';
      document.body.appendChild(lb);
      var big = lb.querySelector('img');
      function open(src, alt) {
        big.src = src; big.alt = alt || '';
        lb.classList.add('on'); document.body.style.overflow = 'hidden';
      }
      function close() {
        lb.classList.remove('on'); document.body.style.overflow = '';
        setTimeout(function () { if (!lb.classList.contains('on')) big.removeAttribute('src'); }, 260);
      }
      document.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.tagName === 'IMG' && (t.closest('.ws-slide') || t.closest('.ws-map-img'))) {
          open(t.getAttribute('src'), t.alt);
        }
      });
      lb.addEventListener('click', function (e) {
        if (e.target === lb || (e.target.classList && e.target.classList.contains('lb-close'))) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lb.classList.contains('on')) close();
      });
    })();
  

/* ==================== 顶部菜单栏：目录开关与字号切换 ==================== */
    /* 顶部菜单栏：目录开关（PC 收展侧栏 / Pad·手机抽屉） + 字号切换 */
    (function () {
      var toc = document.getElementById('toc');
      var mask = document.getElementById('tocMask');
      var btn = document.getElementById('tocBtn');
      if (!toc || !btn) return;

      function narrow() { return window.matchMedia('(max-width:1024px)').matches; }

      function setToc(open) {
        if (narrow()) {
          toc.classList.toggle('open', open);
          if (mask) mask.classList.toggle('show', open);
          document.body.classList.toggle('toc-lock', open);
        } else {
          document.body.classList.toggle('toc-hidden', !open);
        }
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      function tocIsOpen() {
        return narrow() ? toc.classList.contains('open') : !document.body.classList.contains('toc-hidden');
      }

      btn.addEventListener('click', function () { setToc(!tocIsOpen()); });
      if (mask) mask.addEventListener('click', function () { setToc(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setToc(false); });
      toc.addEventListener('click', function (e) {
        if (narrow() && e.target.closest('a')) setToc(false);
      });

      var lastNarrow = narrow();
      window.addEventListener('resize', function () {
        var n = narrow();
        if (n !== lastNarrow) {
          lastNarrow = n;
          toc.classList.remove('open');
          if (mask) mask.classList.remove('show');
          document.body.classList.remove('toc-hidden', 'toc-lock');
        }
        btn.setAttribute('aria-expanded', tocIsOpen() ? 'true' : 'false');
      });

      if (narrow()) { btn.setAttribute('aria-expanded', 'false'); }
      else { btn.setAttribute('aria-expanded', 'true'); }

      /* ---- 字号 ---- */
      var fsBtns = [].slice.call(document.querySelectorAll('.fontset button'));
      function applyFs(v) {
        var de = document.documentElement;
        de.classList.remove('fs-s', 'fs-l');
        if (v === 's') de.classList.add('fs-s');
        if (v === 'l') de.classList.add('fs-l');
        fsBtns.forEach(function (b) {
          var on = b.getAttribute('data-fs') === v;
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        try { localStorage.setItem('ynhhz-fs', v); } catch (e) { }
      }

      var saved = 'm';
      try { saved = localStorage.getItem('ynhhz-fs') || 'm'; } catch (e) { }
      fsBtns.forEach(function (b) {
        b.addEventListener('click', function () { applyFs(b.getAttribute('data-fs')); });
      });
      applyFs(saved);
    })();
  

/* ==================== 图件双指缩放：九湖示意图与原图查看器 ==================== */
    /* 图件双指缩放：九湖示意图（SVG）与原图查看器 */
    (function () {
      var MAX_SCALE = 5;

      function zoomify(box, media, opts) {
        if (!box || !media) return null;
        opts = opts || {};
        box.classList.add('zoomable');
        var maxS = opts.max || MAX_SCALE;
        var s = 1, tx = 0, ty = 0;
        var pinching = false, dragging = false, moved = false, suppressClick = false;
        var startS = 1, startDist = 0, startTx = 0, startTy = 0, midX = 0, midY = 0;
        var startX = 0, startY = 0, lastTap = 0;

        function center() {
          var r = box.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }

        function layout() {
          var r = media.getBoundingClientRect();
          return { w: r.width / s, h: r.height / s };
        }

        function clamp() {
          var l = layout();
          var mx = Math.max(0, (l.w * s - box.clientWidth) / 2);
          var my = Math.max(0, (l.h * s - box.clientHeight) / 2);
          tx = Math.min(mx, Math.max(-mx, tx));
          ty = Math.min(my, Math.max(-my, ty));
        }

        function apply(anim) {
          if (anim) {
            media.style.transition = 'transform .22s cubic-bezier(.2,.8,.3,1)';
            setTimeout(function () { if (!dragging && !pinching) media.style.transition = ''; }, 250);
          } else {
            media.style.transition = 'none';
          }
          media.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + s + ')';
          box.classList.toggle('is-zoomed', s > 1.01);
        }

        function zoomTo(ns, cx, cy, anim) {
          ns = Math.min(maxS, Math.max(1, ns));
          var k = ns / s;
          tx = cx - (cx - tx) * k;
          ty = cy - (cy - ty) * k;
          s = ns;
          if (s <= 1.001) { s = 1; tx = 0; ty = 0; }
          clamp();
          apply(anim);
        }

        function reset(anim) {
          s = 1; tx = 0; ty = 0;
          apply(anim !== false);
        }

        function dist(t) {
          var dx = t[0].clientX - t[1].clientX;
          var dy = t[0].clientY - t[1].clientY;
          return Math.sqrt(dx * dx + dy * dy);
        }

        box.addEventListener('touchstart', function (e) {
          if (e.touches.length === 2) {
            pinching = true; dragging = false; suppressClick = true;
            setTimeout(function () { if (!pinching) suppressClick = false; }, 800);
            startDist = dist(e.touches);
            startS = s; startTx = tx; startTy = ty;
            var c = center();
            midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - c.x;
            midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - c.y;
            if (e.cancelable) e.preventDefault();
          } else if (e.touches.length === 1) {
            var c2 = center();
            var px = e.touches[0].clientX - c2.x;
            var py = e.touches[0].clientY - c2.y;
            var now = Date.now();
            if (now - lastTap < 300) {
              lastTap = 0;
              if (s > 1.2) reset(true); else zoomTo(2.4, px, py, true);
              dragging = false;
              return;
            }
            lastTap = now;
            dragging = true; moved = false;
            startX = e.touches[0].clientX; startY = e.touches[0].clientY;
            startTx = tx; startTy = ty;
          }
        }, { passive: false });

        box.addEventListener('touchmove', function (e) {
          if (pinching && e.touches.length === 2) {
            if (e.cancelable) e.preventDefault();
            if (startDist > 0) {
              var ns = Math.min(maxS, Math.max(1, startS * dist(e.touches) / startDist));
              var k = ns / startS;
              s = ns;
              tx = midX - (midX - startTx) * k;
              ty = midY - (midY - startTy) * k;
              if (s <= 1.001) { s = 1; tx = 0; ty = 0; }
              clamp();
              apply(false);
            }
          } else if (dragging && e.touches.length === 1 && s > 1.01) {
            var dx = e.touches[0].clientX - startX;
            var dy = e.touches[0].clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
            if (e.cancelable) e.preventDefault();
            tx = startTx + dx; ty = startTy + dy;
            clamp();
            apply(false);
          }
        }, { passive: false });

        box.addEventListener('touchend', function (e) {
          if (e.touches.length === 0) {
            pinching = false; dragging = false;
            setTimeout(function () { suppressClick = false; }, moved ? 320 : 0);
          }
        });

        box.addEventListener('touchcancel', function () {
          pinching = false; dragging = false;
          setTimeout(function () { suppressClick = false; }, 0);
        });

        box.addEventListener('mousedown', function (e) {
          if (e.button !== 0 || s <= 1.01) return;
          dragging = true; moved = false;
          startX = e.clientX; startY = e.clientY;
          startTx = tx; startTy = ty;
          box.classList.add('is-panning');
          e.preventDefault();
        });

        window.addEventListener('mousemove', function (e) {
          if (!dragging || pinching) return;
          var dx = e.clientX - startX, dy = e.clientY - startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
          tx = startTx + dx; ty = startTy + dy;
          clamp();
          apply(false);
        });

        window.addEventListener('mouseup', function () {
          if (!dragging) return;
          dragging = false;
          box.classList.remove('is-panning');
        });

        box.addEventListener('dblclick', function (e) {
          var c = center();
          if (s > 1.2) reset(true); else zoomTo(2.4, e.clientX - c.x, e.clientY - c.y, true);
          e.preventDefault();
        });

        box.addEventListener('wheel', function (e) {
          if (opts.wheel === 'always' || e.ctrlKey) {
            e.preventDefault();
            var c = center();
            zoomTo(s * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX - c.x, e.clientY - c.y, false);
          }
        }, { passive: false });

        box.addEventListener('click', function (e) {
          if (suppressClick && !e.target.closest('.zoom-reset, .lb-close')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true);

        box.addEventListener('gesturestart', function (e) { e.preventDefault(); });

        window.addEventListener('resize', function () {
          if (s > 1.01) { clamp(); apply(false); }
        });

        if (opts.hint) {
          var hint = document.createElement('span');
          hint.className = 'zoom-hint' + (opts.hintPos === 'bottom' ? ' bottom' : '');
          hint.textContent = opts.hint;
          box.appendChild(hint);
        }

        if (opts.reset !== false) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'zoom-reset' + (opts.resetLeft ? ' left' : '');
          btn.textContent = '⟲ 复位';
          btn.addEventListener('click', function (e) {
            e.stopPropagation();
            reset(true);
          });
          box.appendChild(btn);
        }

        media._zoomReset = function () { reset(false); };
        return { reset: reset };
      }

      /* 九湖示意图 */
      var lakeMap = document.querySelector('#ch9 .mapbox.map-prov');
      if (lakeMap) {
        zoomify(lakeMap, lakeMap.querySelector('svg'), {
          hint: '双指缩放 · 双击放大',
          wheel: 'ctrl'
        });
      }

      /* 原图查看器 */
      var lb = document.querySelector('.ws-lightbox');
      if (lb) {
        var big = lb.querySelector('img');
        zoomify(lb, big, {
          hint: '双指缩放 · 双击放大',
          hintPos: 'bottom',
          resetLeft: true,
          max: 6,
          wheel: 'always'
        });
        new MutationObserver(function () {
          if (!lb.classList.contains('on') && big._zoomReset) big._zoomReset();
        }).observe(lb, { attributes: true, attributeFilter: ['class'] });
      }
    })();

/* ==================== 底部快捷菜单（Pad / 手机） ==================== */
(function () {
  var bar = document.querySelector('.tabbar');
  if (!bar) return;
  var items = [].slice.call(bar.querySelectorAll('.tabbar__item'));
  var navPrev = document.getElementById('prevChBar');
  var navNext = document.getElementById('nextChBar');

  function chLinks() {
    return [].slice.call(document.querySelectorAll('.toc a.toc-lv1'));
  }

  function curIndex() {
    var cur = document.querySelector('.chapter.on');
    if (!cur) return -1;
    var ls = chLinks();
    for (var i = 0; i < ls.length; i++) {
      if (ls[i].dataset.ch === cur.id) return i;
    }
    return -1;
  }

  function sync() {
    var cur = document.querySelector('.chapter.on');
    var id = cur ? cur.id : '';
    items.forEach(function (it) {
      it.classList.toggle('is-on', !!it.dataset.ch && it.dataset.ch === id);
    });

    /* 首末章要把对应的翻页按钮置灰，否则点了没反应 */
    var i = curIndex(), total = chLinks().length;
    if (navPrev) navPrev.disabled = i <= 0;
    if (navNext) navNext.disabled = i < 0 || i >= total - 1;
  }

  /* 点「政策」直接触发目录里对应章节的链接，复用已有的切章 + 记 hash 逻辑 */
  bar.addEventListener('click', function (e) {
    var item = e.target.closest('.tabbar__item[data-ch]');
    if (!item) return;
    e.preventDefault();
    var link = document.querySelector('.toc a.toc-lv1[data-ch="' + item.dataset.ch + '"]');
    if (link) link.click();
  });

  /* 翻页同样走目录链接，不依赖正文底部那组按钮存不存在 */
  function step(delta) {
    var i = curIndex();
    if (i < 0) return;
    var target = chLinks()[i + delta];
    if (target) target.click();
  }

  if (navPrev) navPrev.addEventListener('click', function () { step(-1) });
  if (navNext) navNext.addEventListener('click', function () { step(1) });

  /* 高亮跟着当前章节走：showCh 只改 .chapter 的 .on，盯这一处最省事 */
  if (window.MutationObserver) {
    var mo = new MutationObserver(sync);
    [].forEach.call(document.querySelectorAll('.chapter'), function (c) {
      mo.observe(c, { attributes: true, attributeFilter: ['class'] });
    });
  }
  sync();
})();
