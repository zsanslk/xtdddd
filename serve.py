# -*- coding: utf-8 -*-
"""本地预览服务器（比 python -m http.server 多两条：no-cache 与瓦片代理）

用法：
    python serve.py            默认 8099 端口
    python serve.py 8080       指定端口

和 `python -m http.server` 的区别：
  1. 所有响应都带 Cache-Control: no-cache, no-store, must-revalidate
     浏览器因此不会拿旧文件，改完 CSS / JS 刷新就能看到。
  2. `/tile-proxy/<host>/<path>` 转发到地图院瓦片服务，并代填 Referer。
     瓦片服务按 Referer 域名白名单放行，白名单里只有 yunnan.tianditu.gov.cn
     和 app.ynmap.cn，localhost 一律 401。浏览器禁止 JS 改 Referer，
     只能由本地服务器代发。

注：项目的静态引用不带 ?v=，所以不依赖服务器是否支持查询串。
"""

import http.server
import os
import socketserver
import sys
import urllib.error
import urllib.request
from urllib.parse import urlsplit

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
ROOT = os.path.dirname(os.path.abspath(__file__))
HOST = "0.0.0.0"
os.chdir(ROOT)

TILE_REFERER = "https://app.ynmap.cn"
# 只放行地图院瓦片主机，避免变成开放代理
ALLOWED_TILE_HOSTS = {"smap%d.ynmap.cn" % i for i in range(1, 6)}


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # 不想刷屏；排查问题时把下面这行注释掉即可
        pass

    def do_GET(self):
        # 反向代理（frp 之类）可能发 absolute-form 请求行，self.path 会是完整 URL，
        # 直接 startswith 判断会漏，必须先取出真正的 path
        parts = urlsplit(self.path)
        path = parts.path
        if path.startswith("/tiles/"):
            return self.serve_tiles(path[len("/tiles/"):], parts.query)
        if path.startswith("/tile-proxy/"):
            return self.serve_tile(path[len("/tile-proxy/"):], parts.query)
        if path == "/__diag":
            return self.serve_diag(path)
        return super().do_GET()

    def serve_diag(self, path):
        import json
        info = {
            "raw_path": self.path,
            "path": path,
            "host": self.headers.get("Host"),
            "note": "瓦片应走 /tiles/{s}/{service}/{z}/{y}/{x}?key=",
        }
        body = json.dumps(info, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_tiles(self, raw, query):
        """/tiles/1/ynVecMS/12/1743/3218?key=...
        路径里不带域名，避免某些反向代理把路径中的主机名当 Host 处理。"""
        seg = raw.split("/")
        if len(seg) != 5:
            self.send_error(404, "bad tile path")
            return
        sub, service, z, y, x = seg
        if sub not in ("1", "2", "3", "4", "5") or not service.isalnum():
            self.send_error(403, "bad tile args")
            return
        url = "https://smap%s.ynmap.cn/tileServer/service/smap/%s/3857/wmts/tile/default/%s/%s/%s" % (
            sub, service, z, y, x)
        if query:
            url += "?" + query
        self.fetch_and_send(url)

    def serve_tile(self, raw, query):
        host, _, tail = raw.partition("/")
        if host not in ALLOWED_TILE_HOSTS or not tail:
            self.send_error(403, "host not allowed")
            return
        url = "https://%s/%s" % (host, tail)
        if query:
            url += "?" + query
        self.fetch_and_send(url)

    def fetch_and_send(self, url):
        req = urllib.request.Request(url, headers={
            "Referer": TILE_REFERER,
            "User-Agent": "hzz-preview/1.0",
        })
        try:
            with urllib.request.urlopen(req, timeout=20) as res:
                body = res.read()
                self.send_response(res.status)
                self.send_header("Content-Type", res.headers.get("Content-Type", "image/png"))
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
        except urllib.error.HTTPError as e:
            self.send_error(e.code, "upstream error")
        except Exception as e:
            self.send_error(502, "upstream failed: %s" % e)


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer((HOST, PORT), Handler) as httpd:
    print("serving %s on http://%s:%d" % (ROOT, HOST, PORT), flush=True)
    httpd.serve_forever()
