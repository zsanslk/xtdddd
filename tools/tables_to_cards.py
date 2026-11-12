# -*- coding: utf-8 -*-
"""
将 shouce.html 中的 <table> 批量转换为纵向条目式布局。

两种输出：
1) .tlist/.titem —— 带分类列的信息表（层级 / 类别 / 环节 / 维度 …）
   首列 -> 左侧方框标签(.tk)，第二列 -> 条目标题(h5)或正文(txt)，其余列 -> 要点(ul)
2) .kvlist/.kvrow —— 键值表（一湖一档 / 一河一档，首列为 <th>）
   每个键值对一行，左键右值，去掉表头与底纹

保持不变：id="prefTable"（由 js/index.js 动态渲染并承担展开交互）。
"""
import re
import html
import sys

SRC = 'shouce.html'
DST = 'shouce.cards.html'
SKIP_IDS = {'prefTable'}


def find_tables(s):
    """返回所有 table 的 (start, end) 区间，含嵌套 table 的完整范围。"""
    res, i = [], 0
    while True:
        m = re.search(r'<table\b[^>]*>', s[i:])
        if not m:
            break
        st = i + m.start()
        depth, j, en = 0, st, len(s)
        while j < len(s):
            mt = re.search(r'<table\b|</table>', s[j:])
            if not mt:
                break
            if mt.group(0) != '</table>':
                depth += 1
            else:
                depth -= 1
                if depth == 0:
                    en = j + mt.end()
                    break
            j += mt.end()
        res.append((st, en))
        i = en
    return res


def cells(row_html):
    """拆出同一行里的单元格，返回 [(tag, inner_html), ...]。"""
    out = []
    for m in re.finditer(r'<(td|th)\b[^>]*>(.*?)</\1>', row_html, re.S):
        out.append((m.group(1), m.group(2)))
    return out


def rows(tbody_html):
    return re.findall(r'<tr\b[^>]*>(.*?)</tr>', tbody_html, re.S)


def build_grid(body_html):
    """把 tbody 展开成规整的二维网格。

    原表里有 rowspan 合并的单元格（如“巡查频次”跨五级），展开后会在后续行
    补一个空位，否则后面的值会整体左移一列、串到上一列的列名下面。
    """
    grid, carry = [], {}
    for tr in rows(body_html):
        cs = [(m.group(1), m.group(2), m.group(3))
              for m in re.finditer(r'<(td|th)\b([^>]*)>(.*?)</\1>', tr, re.S)]
        row, ci, col = [], 0, 0
        while ci < len(cs) or any(c >= col for c in carry):
            if col in carry:
                row.append(('td', ''))
                carry[col] -= 1
                if carry[col] == 0:
                    del carry[col]
                col += 1
                continue
            if ci >= len(cs):
                row.append(('td', ''))
                col += 1
                continue
            tag, attrs, inner = cs[ci]
            ci += 1
            row.append((tag, inner))
            m = re.search(r'rowspan="(\d+)"', attrs)
            if m and int(m.group(1)) > 1:
                carry[col] = int(m.group(1)) - 1
            col += 1
        grid.append(row)
    return grid


def text(h):
    h = re.sub(r'<br\s*/?>', ' ', h)
    h = re.sub(r'<[^>]+>', '', h)
    h = re.sub(r'\s+', ' ', html.unescape(h)).strip()
    # 中文之间的折行空格直接吃掉，避免“列名（注）”里混进空格
    h = re.sub(r'(?<=[\u4e00-\u9fa5）】》])\s+(?=[\u4e00-\u9fa5（【《])', '', h)
    return h


def inline(h):
    """保留行内标签，压缩多余空白。"""
    h = re.sub(r'<br\s*/?>', '<br>', h)
    h = re.sub(r'\s+', ' ', h).strip()
    h = re.sub(r'(?<=[\u4e00-\u9fa5）】》])\s+(?=[\u4e00-\u9fa5（【《])', '', h)
    h = re.sub(r'<p>\s*</p>', '', h)
    return h


def dt_text(h):
    """左侧方框只取纯文字，剥掉层级胶囊与加粗。"""
    h = re.sub(r'<span class="tag[^"]*">(.*?)</span>', r'\1', h, flags=re.S)
    h = re.sub(r'</?b>', '', h)
    return text(h)


LONG = 34  # 第二列超过这个字数就不再当标题，改作正文段落
DT_MAX = 5  # 左侧方框每行最多容纳的字数
DT_LINES = 2  # 方框最多排两行，超出即放弃方框、改用无标签的单列条目


def split_dt(t):
    """把分类词切成便于在方框里竖排的行。

    优先剥掉括号补充语（县（市、区）级 → 县级、滇池（全湖） → 滇池），
    其次按顿号 / 冒号分段；切不动或行数过多返回 None（改用单列条目）。
    """
    stripped = re.sub(r'（[^）]*）', '', t).strip()
    if len(stripped) >= 2:
        t = stripped
    if len(t) <= DT_MAX:
        return [t]
    for sep in ('、', '：', '，'):
        if sep in t:
            parts = [p.strip() for p in t.split(sep) if p.strip()]
            if parts and all(len(p) <= DT_MAX for p in parts) and len(parts) <= DT_LINES:
                return parts
    return None



def build_tlist(thead_cells, grid, indent):
    cols = [text(c[1]) for c in thead_cells]
    pad = ' ' * indent
    # 一张表里只要有一行的分类词塞不进方框，全表统一改成无方框的单列条目，
    # 避免同一组条目有的带方块、有的不带
    dt_all = [split_dt(dt_text(r[0][1])) if r else None for r in grid]
    force_flat = any(d is None for d in dt_all)
    out = ['<div class="tlist">']
    for ri, cs in enumerate(grid):
        if not cs:
            continue
        dt_lines = dt_all[ri]
        flat = force_flat or dt_lines is None
        cls = 'titem flat' if flat else 'titem'
        out.append(f'{pad}  <div class="{cls}">')
        if not flat:
            out.append(f'{pad}    <div class="tk">{"<br>".join(dt_lines)}</div>')
        out.append(f'{pad}    <div class="tb">')
        rest = cs[1:]
        tail_start = 1
        if rest:
            if flat:
                # 分类词过长，无法收进方框：它本身充当标题，第二列接作正文
                out.append(f'{pad}      <h5>{inline(cs[0][1])}</h5>')
                out.append(f'{pad}      <div class="txt">{inline(rest[0][1])}</div>')
                tail_start = 2
            else:
                head_html = inline(rest[0][1])
                if text(rest[0][1]) and len(text(rest[0][1])) > LONG:
                    out.append(f'{pad}      <div class="txt">{head_html}</div>')
                else:
                    out.append(f'{pad}      <h5>{head_html}</h5>')
                tail_start = 1
            tail = rest[tail_start:]
            tail_items = []
            for i, (_, cell_html) in enumerate(tail):
                k = tail_start + 1 + i  # 对应原表列序
                label = cols[k] if k < len(cols) else ''
                body = inline(cell_html)
                if not text(cell_html):
                    continue
                tail_items.append((label, body))
            # 只有一条极短的附注（典型是“文号”）时收成标题下的一行小字，更像公文条目
            if len(tail_items) == 1 and len(text(tail_items[0][1])) <= 20:
                label, body = tail_items[0]
                pre = f'{label}：' if label else ''
                out.append(f'{pad}      <div class="meta">{pre}{body}</div>')
            elif tail_items:
                out.append(f'{pad}      <ul>')
                for label, body in tail_items:
                    if label:
                        out.append(f'{pad}        <li><b>{label}：</b>{body}</li>')
                    else:
                        out.append(f'{pad}        <li>{body}</li>')
                out.append(f'{pad}      </ul>')
        out.append(f'{pad}    </div>')
        out.append(f'{pad}  </div>')
    out.append(f'{pad}</div>')
    return '\n'.join(out)


def build_kvlist(grid, indent):
    pad = ' ' * indent
    out = ['<div class="kvlist">']
    for cs in grid:
        if len(cs) < 2:
            continue
        k = text(cs[0][1])
        v = inline(cs[1][1])
        out.append(f'{pad}  <div class="kvrow"><span class="k">{k}</span><span class="v">{v}</span></div>')
    out.append(f'{pad}</div>')
    return '\n'.join(out)


def convert(tbl_html, indent):
    thead_m = re.search(r'<thead\b[^>]*>(.*?)</thead>', tbl_html, re.S)
    body_m = re.search(r'<tbody\b[^>]*>(.*?)</tbody>', tbl_html, re.S)
    body = body_m.group(1) if body_m else re.sub(r'<thead\b.*?</thead>', '', tbl_html, flags=re.S)
    grid = build_grid(body)
    if not grid:
        return None
    if thead_m:
        thead = cells(re.search(r'<tr\b[^>]*>(.*?)</tr>', thead_m.group(1), re.S).group(1))
        return build_tlist(thead, grid, indent)
    # 无表头：首列全为 <th> 视为键值表
    first_tags = [r[0][0] if r else '' for r in grid]
    if first_tags and all(t == 'th' for t in first_tags):
        return build_kvlist(grid, indent)
    # 无表头的普通表按两列处理
    return build_tlist([('th', ''), ('th', '')], grid, indent)


def line_indent(s, pos):
    st = s.rfind('\n', 0, pos) + 1
    m = re.match(r'[ \t]*', s[st:pos])
    return len(m.group(0))


def main():
    s = open(SRC, encoding='utf-8').read()
    spans = find_tables(s)
    pieces, last, done, skipped = [], 0, 0, []
    for (a, b) in spans:
        seg = s[a:b]
        head = re.match(r'<table\b[^>]*>', seg).group(0)
        idm = re.search(r'id="([^"]+)"', head)
        if idm and idm.group(1) in SKIP_IDS:
            skipped.append(idm.group(1))
            continue
        indent = line_indent(s, a)
        new = convert(seg, indent)
        if new is None:
            skipped.append(head)
            continue
        pieces.append(s[last:a])
        pieces.append(new)
        last = b
        done += 1
    pieces.append(s[last:])
    open(DST, 'w', encoding='utf-8').write(''.join(pieces))
    print(f'转换 {done} 张表，跳过 {len(skipped)} 处：{skipped}')
    print(f'输出 {DST}')


if __name__ == '__main__':
    main()
