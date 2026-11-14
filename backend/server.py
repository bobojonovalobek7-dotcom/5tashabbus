#!/usr/bin/env python3
"""
UrDU 5 tashabbus — dashboard backend.

Faqat Python standart kutubxonasi (qo'shimcha paket o'rnatish shart emas).
To'garaklar va tanlovlarni SQLite bazada saqlaydi, admin panel uchun API beradi.

Ishga tushirish:
    python3 server.py                       # API: 127.0.0.1:8090
    python3 server.py --static ..           # lokal sinov: sayt fayllarini ham beradi
    python3 server.py set-password          # admin parolini o'rnatish

Muhit o'zgaruvchilari:
    URDU5T_DATA   ma'lumotlar papkasi (baza, parol, yuklangan rasmlar). Standart: ./data
    URDU5T_PORT   port. Standart: 8090
"""
import base64
import getpass
import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import sys
import threading
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("URDU5T_DATA", os.path.join(HERE, "data"))
DB_PATH = os.path.join(DATA_DIR, "site.db")
PASSWORD_FILE = os.path.join(DATA_DIR, "admin_password")
UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")
SEED_FILE = os.path.join(HERE, "seed.json")
PORT = int(os.environ.get("URDU5T_PORT", "8090"))

KINDS = ("clubs", "contests")
SESSION_TTL = 12 * 3600          # 12 soat
MAX_BODY = 6 * 1024 * 1024       # 6 MB (rasm base64 bilan)
MAX_IMAGE = 4 * 1024 * 1024      # 4 MB
LOGIN_LIMIT = 8                  # 15 daqiqada IP bo'yicha urinishlar soni

_lock = threading.Lock()
_sessions = {}                   # token -> muddati
_login_attempts = {}             # ip -> [vaqtlar]
STATIC_ROOT = None


# ------------------------------------------------------------------ baza
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with db() as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS items (
                   kind TEXT NOT NULL,
                   id TEXT NOT NULL,
                   position INTEGER NOT NULL DEFAULT 0,
                   data TEXT NOT NULL,
                   updated_at INTEGER NOT NULL,
                   PRIMARY KEY (kind, id))"""
        )
        empty = conn.execute("SELECT COUNT(*) FROM items").fetchone()[0] == 0
        if empty and os.path.exists(SEED_FILE):
            seed = json.load(open(SEED_FILE, encoding="utf-8"))
            now = int(time.time())
            for kind in KINDS:
                for pos, item in enumerate(seed.get(kind, [])):
                    conn.execute(
                        "INSERT INTO items(kind, id, position, data, updated_at) VALUES (?,?,?,?,?)",
                        (kind, item["id"], pos, json.dumps(item, ensure_ascii=False), now),
                    )
            print(f"Boshlang'ich ma'lumot yuklandi: {SEED_FILE}")


def list_items(kind):
    with db() as conn:
        rows = conn.execute(
            "SELECT data FROM items WHERE kind=? ORDER BY position, updated_at", (kind,)
        ).fetchall()
    return [json.loads(r["data"]) for r in rows]


def save_item(kind, item, item_id=None):
    now = int(time.time())
    with db() as conn:
        if item_id is None:
            item_id = new_id(kind, item)
            item["id"] = item_id
            pos = conn.execute("SELECT COALESCE(MIN(position), 0) - 1 FROM items WHERE kind=?", (kind,)).fetchone()[0]
            conn.execute(
                "INSERT INTO items(kind, id, position, data, updated_at) VALUES (?,?,?,?,?)",
                (kind, item_id, pos, json.dumps(item, ensure_ascii=False), now),
            )
        else:
            item["id"] = item_id
            cur = conn.execute(
                "UPDATE items SET data=?, updated_at=? WHERE kind=? AND id=?",
                (json.dumps(item, ensure_ascii=False), now, kind, item_id),
            )
            if cur.rowcount == 0:
                return None
    return item


def delete_item(kind, item_id):
    with db() as conn:
        return conn.execute("DELETE FROM items WHERE kind=? AND id=?", (kind, item_id)).rowcount > 0


def new_id(kind, item):
    base = re.sub(r"[^a-z0-9]+", "-", (item.get("name") or item.get("title") or kind).lower()).strip("-")[:40] or kind
    return f"{base}-{secrets.token_hex(3)}"


# ------------------------------------------------------------------ tekshiruv
def text(v, limit=500):
    return str(v or "").strip()[:limit]


def lines(v, limit=40):
    if isinstance(v, list):
        items = v
    else:
        items = str(v or "").split("\n")
    return [text(x, 300) for x in items if text(x)][:limit]


def phone(p):
    digits = re.sub(r"\D", "", p)
    if len(digits) == 12 and digits.startswith("998"):
        digits = digits[3:]
    if len(digits) == 9:
        return {"text": f"+998 {digits[:2]} {digits[2:5]}-{digits[5:7]}-{digits[7:]}", "tel": "+998" + digits}
    return {"text": p, "tel": ""}


def valid_date(v):
    v = text(v, 10)
    return v if re.fullmatch(r"\d{4}-\d{2}-\d{2}", v) else ""


def group_id(v, allowed):
    try:
        n = int(v)
    except (TypeError, ValueError):
        raise ValueError("Yo'nalish noto'g'ri tanlangan")
    if n not in allowed:
        raise ValueError("Yo'nalish noto'g'ri tanlangan")
    return n


def clean_club(d):
    name = text(d.get("name"), 200)
    if not name:
        raise ValueError("To'garak nomi kiritilmagan")
    students = d.get("students")
    try:
        students = int(students) if str(students).strip() != "" else None
    except ValueError:
        raise ValueError("O'quvchilar soni raqam bo'lishi kerak")
    return {
        "initiativeId": group_id(d.get("initiativeId"), range(1, 7)),
        "name": name,
        "schedule": text(d.get("schedule"), 300),
        "place": text(d.get("place"), 300),
        "students": students,
        "mentors": lines(d.get("mentors"), 10),
        "phones": [phone(p) for p in lines(d.get("phones") if not isinstance(d.get("phones"), list)
                                           else [x.get("text", "") if isinstance(x, dict) else x for x in d.get("phones")], 10)],
    }


def fmt_date(iso):
    return ".".join(reversed(iso.split("-"))) if iso else ""


def clean_contest(d):
    title = text(d.get("title"), 250)
    if not title:
        raise ValueError("Tanlov nomi kiritilmagan")
    deadline = valid_date(d.get("deadline"))
    if not deadline:
        raise ValueError("Tugash sanasi kiritilmagan")
    start = valid_date(d.get("start"))
    status = d.get("status") if d.get("status") in ("active", "completed") else "active"
    rules = d.get("rules") or {}
    image = text(d.get("image"), 300)
    if image and not re.fullmatch(r"(assets/images/|uploads/)[\w.\-/]+", image):
        raise ValueError("Rasm manzili noto'g'ri")
    return {
        "initiativeId": group_id(d.get("initiativeId"), range(1, 6)),
        "status": status,
        "title": title,
        "start": start,
        "deadline": deadline,
        "period": f"{fmt_date(start)} — {fmt_date(deadline)}" if start else f"{fmt_date(deadline)} gacha",
        "place": text(d.get("place"), 300),
        "organizer": text(d.get("organizer"), 300),
        "image": image or "assets/images/urdu_main_building.jpg",
        "prize": text(d.get("prize"), 300),
        "desc": text(d.get("desc"), 1000),
        "rules": {
            "purpose": text(rules.get("purpose"), 1500),
            "requirements": lines(rules.get("requirements")),
            "stages": lines(rules.get("stages")),
            "criteria": lines(rules.get("criteria")),
            "awards": text(rules.get("awards"), 1000),
        },
    }


CLEANERS = {"clubs": clean_club, "contests": clean_contest}


# ------------------------------------------------------------------ parol va sessiya
def hash_password(pw, salt=None):
    salt = salt or secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, 240_000)
    return f"pbkdf2_sha256$240000${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def check_password(pw):
    if not os.path.exists(PASSWORD_FILE):
        return False
    stored = open(PASSWORD_FILE, encoding="utf-8").read().strip()
    try:
        _, iters, salt, dk = stored.split("$")
        calc = hashlib.pbkdf2_hmac("sha256", pw.encode(), base64.b64decode(salt), int(iters))
        return hmac.compare_digest(calc, base64.b64decode(dk))
    except ValueError:
        return False


def set_password_cli():
    os.makedirs(DATA_DIR, exist_ok=True)
    pw = os.environ.get("URDU5T_NEW_PASSWORD") or getpass.getpass("Yangi admin paroli: ")
    if len(pw) < 10:
        sys.exit("Parol kamida 10 belgidan iborat bo'lishi kerak.")
    if not os.environ.get("URDU5T_NEW_PASSWORD") and getpass.getpass("Takrorlang: ") != pw:
        sys.exit("Parollar mos emas.")
    with open(PASSWORD_FILE, "w", encoding="utf-8") as f:
        f.write(hash_password(pw))
    os.chmod(PASSWORD_FILE, 0o600)
    print("Admin paroli saqlandi.")


def new_session():
    token = secrets.token_urlsafe(32)
    with _lock:
        now = time.time()
        for t, exp in list(_sessions.items()):
            if exp < now:
                del _sessions[t]
        _sessions[token] = now + SESSION_TTL
    return token


def valid_session(token):
    with _lock:
        exp = _sessions.get(token or "")
        return bool(exp and exp > time.time())


def login_allowed(ip):
    now = time.time()
    with _lock:
        tries = [t for t in _login_attempts.get(ip, []) if now - t < 900]
        _login_attempts[ip] = tries
        if len(tries) >= LOGIN_LIMIT:
            return False
        tries.append(now)
        return True


# ------------------------------------------------------------------ rasm yuklash
IMAGE_TYPES = {b"\xff\xd8\xff": ".jpg", b"\x89PNG\r\n\x1a\n": ".png", b"RIFF": ".webp"}


def save_upload(data_url):
    m = re.fullmatch(r"data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)", data_url or "")
    if not m:
        raise ValueError("Faqat JPG, PNG yoki WEBP rasm yuklash mumkin")
    raw = base64.b64decode(m.group(2))
    if len(raw) > MAX_IMAGE:
        raise ValueError("Rasm 4 MB dan katta")
    ext = next((e for sig, e in IMAGE_TYPES.items() if raw.startswith(sig)), None)
    if ext == ".webp" and raw[8:12] != b"WEBP":
        ext = None
    if not ext:
        raise ValueError("Fayl rasm emas")
    name = f"{time.strftime('%Y%m%d')}-{secrets.token_hex(6)}{ext}"
    with open(os.path.join(UPLOAD_DIR, name), "wb") as f:
        f.write(raw)
    return "uploads/" + name


# ------------------------------------------------------------------ HTTP
class Handler(BaseHTTPRequestHandler):
    server_version = "urdu5t"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.client_ip(), fmt % args))

    def client_ip(self):
        return self.headers.get("X-Real-IP") or self.client_address[0]

    # --- javob yordamchilari
    def send_json(self, obj, status=200, headers=None):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def error(self, status, message):
        self.send_json({"error": message}, status)

    def cookie_token(self):
        for part in (self.headers.get("Cookie") or "").split(";"):
            k, _, v = part.strip().partition("=")
            if k == "urdu5t_session":
                return v
        return None

    def authed(self):
        return valid_session(self.cookie_token())

    def read_json(self):
        if "application/json" not in (self.headers.get("Content-Type") or ""):
            raise ValueError("JSON kutilgan")
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY:
            raise ValueError("So'rov juda katta")
        return json.loads(self.rfile.read(length) or b"{}")

    # --- marshrutlar
    def route(self):
        path = urlparse(self.path).path
        parts = [unquote(p) for p in path.strip("/").split("/")]
        return path, parts

    def do_GET(self):
        path, parts = self.route()
        if parts[:1] == ["api"]:
            if len(parts) == 2 and parts[1] in KINDS:
                return self.send_json(list_items(parts[1]))
            if parts[1:] == ["me"]:
                return self.send_json({"admin": self.authed()})
            return self.error(404, "Topilmadi")
        if parts[:1] == ["uploads"] and len(parts) == 2:
            return self.serve_file(os.path.join(UPLOAD_DIR, os.path.basename(parts[1])))
        if STATIC_ROOT:
            rel = path.lstrip("/") or "index.html"
            full = os.path.realpath(os.path.join(STATIC_ROOT, rel))
            if full.startswith(os.path.realpath(STATIC_ROOT)) and os.path.isfile(full):
                return self.serve_file(full)
        self.error(404, "Topilmadi")

    def serve_file(self, full):
        if not os.path.isfile(full):
            return self.error(404, "Topilmadi")
        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        data = open(full, "rb").read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        _, parts = self.route()
        try:
            if parts == ["api", "login"]:
                if not login_allowed(self.client_ip()):
                    return self.error(429, "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring.")
                body = self.read_json()
                if not check_password(str(body.get("password", ""))):
                    time.sleep(1)
                    return self.error(401, "Parol noto'g'ri")
                token = new_session()
                cookie = f"urdu5t_session={token}; Path=/; HttpOnly; SameSite=Strict; Max-Age={SESSION_TTL}"
                if self.headers.get("X-Forwarded-Proto") == "https":
                    cookie += "; Secure"
                return self.send_json({"ok": True}, headers={"Set-Cookie": cookie})
            if parts == ["api", "logout"]:
                with _lock:
                    _sessions.pop(self.cookie_token() or "", None)
                return self.send_json({"ok": True}, headers={"Set-Cookie": "urdu5t_session=; Path=/; Max-Age=0"})
            if not self.authed():
                return self.error(401, "Avval tizimga kiring")
            if parts == ["api", "upload"]:
                return self.send_json({"path": save_upload(self.read_json().get("data"))})
            if len(parts) == 2 and parts[1] in KINDS:
                item = CLEANERS[parts[1]](self.read_json())
                return self.send_json(save_item(parts[1], item), 201)
            return self.error(404, "Topilmadi")
        except ValueError as e:
            return self.error(400, str(e))

    def do_PUT(self):
        _, parts = self.route()
        if not self.authed():
            return self.error(401, "Avval tizimga kiring")
        if len(parts) == 3 and parts[0] == "api" and parts[1] in KINDS:
            try:
                item = save_item(parts[1], CLEANERS[parts[1]](self.read_json()), parts[2])
            except ValueError as e:
                return self.error(400, str(e))
            return self.send_json(item) if item else self.error(404, "Topilmadi")
        self.error(404, "Topilmadi")

    def do_DELETE(self):
        _, parts = self.route()
        if not self.authed():
            return self.error(401, "Avval tizimga kiring")
        if len(parts) == 3 and parts[0] == "api" and parts[1] in KINDS:
            return self.send_json({"ok": True}) if delete_item(parts[1], parts[2]) else self.error(404, "Topilmadi")
        self.error(404, "Topilmadi")


def main():
    global STATIC_ROOT
    args = sys.argv[1:]
    if args[:1] == ["set-password"]:
        return set_password_cli()
    if "--static" in args:
        STATIC_ROOT = os.path.abspath(args[args.index("--static") + 1])
    init_db()
    if not os.path.exists(PASSWORD_FILE):
        print("DIQQAT: admin paroli o'rnatilmagan. `python3 server.py set-password` ni ishga tushiring.")
    host = "127.0.0.1"
    httpd = ThreadingHTTPServer((host, PORT), Handler)
    print(f"urdu5t backend: http://{host}:{PORT}" + (f"  (sayt: {STATIC_ROOT})" if STATIC_ROOT else ""))
    httpd.serve_forever()


if __name__ == "__main__":
    main()
