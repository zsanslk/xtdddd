# -*- coding: utf-8 -*-
"""本地预览服务器（比 python -m http.server 多一条 no-cache）

用法：
    python serve.py            默认 8099 端口
    python serve.py 8080       指定端口

和 `python -m http.server` 的唯一区别：所有响应都带
    Cache-Control: no-cache, no-store, must-revalidate
浏览器因此不会拿旧文件，改完 CSS / JS 刷新就能看到。

注：项目的静态引用不带 ?v=，所以不依赖服务器是否支持查询串。
"""

import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
ROOT = os.path.dirname(os.path.abspath(__file__))
HOST = "0.0.0.0"
os.chdir(ROOT)


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # 不想刷屏；排查问题时把下面这行注释掉即可
        pass


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer((HOST, PORT), Handler) as httpd:
    print("serving %s on http://%s:%d" % (ROOT,HOST, PORT), flush=True)
    httpd.serve_forever()
