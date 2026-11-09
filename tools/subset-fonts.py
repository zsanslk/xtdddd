# -*- coding: utf-8 -*-
"""从站点 HTML 提取字符集，把 assets/font 下的整包字体子集化为 woff2。

用法：
    python tools/subset-fonts.py

产物：assets/font/web/*.woff2（供 css/fonts.css 的 @font-face 引用）

说明：
- 思源黑体/宋体是 16~28MB 的 OTF，整包直接上网页会拖死移动端；
  站点是静态手册，字符可穷举，子集后单文件约 200~290KB。
- 正文增删文字后需要重跑本脚本，否则新出现的字会回落到系统字体。
- 需要依赖：pip install fonttools brotli
- 字体源文件（*.zip / OTF / TTF）不进 git，克隆后需要重新下载到对应目录：
    思源黑体  https://github.com/adobe-fonts/source-han-sans/releases
    思源宋体  https://github.com/adobe-fonts/source-han-serif/releases
    方正新楷体 商业字体，由项目方提供 assets/font/kaiti/FZ_XKTJW.TTF
  解压后放成 assets/font/heiti|songti|kaiti/，文件名见下方 FONTS 表。
- 思源黑体/宋体为 SIL OFL 1.1，许可证随产物放在 assets/font/web/OFL-*.txt。
- 方正新楷体（FZNewKai-Z03S）是**商业字体**，网页嵌入同样属于使用行为，
  需在方正字库授权范围内使用；本仓库只做子集化，不改变授权归属。
"""
import os
import re
import sys

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, 'assets', 'font')
OUT_DIR = os.path.join(FONT_DIR, 'web')

# 参与字符集提取的页面
PAGES = ['shouce.html', 'index.html', 'login.html', '云南河湖长制十周年成果云展.html']

# 需要子集化的字体：族名 / 字重 / 源文件 / 输出名
FONTS = [
    ('Source Han Sans SC', 400, 'heiti/SourceHanSansSC-Regular.otf', 'SourceHanSansSC-400.woff2'),
    ('Source Han Sans SC', 700, 'heiti/SourceHanSansSC-Bold.otf', 'SourceHanSansSC-700.woff2'),
    ('Source Han Serif SC', 400, 'songti/SourceHanSerifSC-Regular.otf', 'SourceHanSerifSC-400.woff2'),
    ('Source Han Serif SC', 700, 'songti/SourceHanSerifSC-Bold.otf', 'SourceHanSerifSC-700.woff2'),
    ('FZNewKai-Z03S', 400, 'kaiti/FZ_XKTJW.TTF', 'FZNewKai-400.woff2'),
]

# 安全字符：ASCII 可打印区 + 常用中文标点，防止子集漏字
SAFE = ''.join(chr(c) for c in range(0x20, 0x7F))
SAFE += '　、。，．·；：？！…—～《》〈〉「」『』（）〔〕【】％‰℃×÷±≤≥≠≈±°√∞'


def collect_chars():
    """从 HTML 的可见文本里收集字符（剔除 script/style/标签）。"""
    chars = set(SAFE)
    for name in PAGES:
        path = os.path.join(ROOT, name)
        if not os.path.exists(path):
            continue
        s = open(path, encoding='utf-8').read()
        s = re.sub(r'<script[\s\S]*?</script>', '', s)
        s = re.sub(r'<style[\s\S]*?</style>', '', s)
        s = re.sub(r'<[^>]+>', '', s)
        chars |= set(s)
    chars.discard('\n')
    chars.discard('\r')
    chars.discard('\t')
    return ''.join(sorted(chars))


def main():
    chars = collect_chars()
    os.makedirs(OUT_DIR, exist_ok=True)
    print('字符集 %d 个（其中汉字 %d 个）' % (
        len(chars), sum(1 for c in chars if '\u4e00' <= c <= '\u9fff')))

    for family, weight, src, out in FONTS:
        src_path = os.path.join(FONT_DIR, src)
        if not os.path.exists(src_path):
            print('  [跳过] 缺少源文件 %s' % src)
            continue
        opt = subset.Options()
        opt.flavor = 'woff2'
        # 三个压缩项对纯中文正文没有视觉影响，但能把体积再砍掉约 55%：
        # 中文不用合字/字距调整，桌面端也不需要 hinting
        opt.layout_features = []
        opt.hinting = False
        opt.desubroutinize = True
        opt.drop_tables += ['DSIG']
        font = subset.load_font(src_path, opt)
        sub = subset.Subsetter(options=opt)
        sub.populate(text=chars)
        sub.subset(font)
        dst = os.path.join(OUT_DIR, out)
        subset.save_font(font, dst, opt)
        font.close()
        print('  %-22s %8.1f KB  %s' % (family + ' ' + str(weight),
                                        os.path.getsize(dst) / 1024.0, out))


if __name__ == '__main__':
    sys.exit(main())
