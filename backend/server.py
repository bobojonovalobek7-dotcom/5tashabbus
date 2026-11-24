#!/usr/bin/env python3
"""
UrDU 5 tashabbus — dashboard backend.

Faqat Python standart kutubxonasi (qo'shimcha paket o'rnatish shart emas).
Saytning barcha bo'limlarini SQLite bazada saqlaydi, admin panel uchun API beradi.

Ishga tushirish:
    python3 server.py                       # API: 127.0.0.1:8090
    python3 server.py --static ..           # lokal sinov: sayt fayllarini ham beradi
    python3 server.py set-password          # admin parolini o'rnatish

Muhit o'zgaruvchilari:
    URDU5T_DATA   ma'lumotlar papkasi (baza, parol, yuklangan rasmlar). Standart: ./data
    URDU5T_PORT   port. Standart: 8090
"""
import base64
from html import escape
from html.parser import HTMLParser
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

# ------------------------------------------------------------------ bo'limlar sxemasi
# Admin panel shakllarni shu sxemadan quradi, server ham shu bo'yicha tekshiradi.
# mode: "list" — qo'shish/o'chirish mumkin; "fixed" — faqat tahrirlash; "single" — bitta yozuv.
GROUPS_1_6 = [{"value": i, "label": t} for i, t in enumerate(
    ["Madaniyat va san'at", "Sport", "Axborot texnologiyalari", "Kitobxonlik",
     "Xotin-qizlar bandligi", "Boshqa turdagi to'garaklar"], 1)]
GROUPS_1_5 = GROUPS_1_6[:5]


RATING_OPTIONS = [{"value": "", "label": "Baholanmagan"}, {"value": "green", "label": "🟢 Yashil — a'lo"},
                  {"value": "yellow", "label": "🟡 Sariq — qoniqarli"}, {"value": "red", "label": "🔴 Qizil — qoniqarsiz"}]
RATINGS = ("green", "yellow", "red")


def F(key, label, type="text", **kw):
    return {"key": key, "label": label, "type": type, **kw}


SCHEMA = {
    "clubs": {"label": "To'garaklar", "one": "To'garak", "mode": "list", "title": "name", "fields": [
        F("name", "Nomi", required=True),
        F("initiativeId", "Yo'nalish", "select", options=GROUPS_1_6, half=True),
        F("students", "O'quvchilar soni", "int", half=True),
        F("schedule", "Kunlari va vaqti", half=True, placeholder="Dushanba, Chorshanba · 15:00–17:00"),
        F("place", "Joyi (xona)", half=True),
        F("mentors", "Rahbar(lar)", "lines", half=True, hint="Har bir rahbar alohida qatorda"),
        F("phones", "Telefon(lar)", "phones", half=True, hint="Har bir raqam alohida qatorda, masalan 93-123-45-67"),
        F("rating", "Baho (faqat admin ko'radi)", "select", half=True, private=True, options=RATING_OPTIONS),
        F("ratingNote", "Baho izohi", half=True, private=True, placeholder="Masalan: davomat past"),
        F("desc", "Qisqa izoh", "textarea", limit=400, rows=2, placeholder="Kartochkada nomning ostida chiqadi"),
    ]},
    "courses": {"label": "Kasbga o'qitish kurslari", "one": "Kurs", "mode": "list", "title": "name",
                "note": "Yoshlarni kasb-hunarga o'qitish kurslari. Saytdagi «To'garak va kurslar» sahifasida alohida bo'lim bo'lib chiqadi.",
                "fields": [
        F("name", "Kurs nomi", required=True),
        F("duration", "Davomiyligi", half=True, placeholder="3 oy, 72 soat"),
        F("schedule", "Dars jadvali", half=True, placeholder="Dushanba, Chorshanba · 14:00–16:00"),
        F("place", "O'qitiladigan joy", half=True),
        F("teacher", "Usta / o'qituvchi", half=True),
        F("phone", "Aloqa telefoni", half=True),
        F("audience", "Kimlar uchun", half=True, placeholder="Talaba-qizlar va mahalla yoshlari"),
        F("certificate", "Sertifikat beriladi", "bool"),
        F("desc", "Kurs haqida", "rich", limit=4000),
    ]},
    "contests": {"label": "Tanlovlar", "one": "Tanlov", "mode": "list", "title": "title", "fields": [
        F("title", "Nomi", required=True),
        F("deadline", "Tugash sanasi", "date", half=True, required=True, hint="Shu kundan keyin tanlov «Yakunlangan» bo'ladi"),
        F("prize", "Mukofot", half=True, placeholder="1-o'rin: 5 mln so'm"),
        F("desc", "Qisqa ma'lumot", "rich", limit=1500, hint="Saytdagi kartochkada ko'rinadi: 2–3 gap"),
        F("body", "Batafsil ma'lumot", "rich", limit=20000, rows=8, hint="«Batafsil» tugmasi bosilganda oynada ochiladi"),
        F("gallery", "Rasm yuklash", "images", hint="Birinchi rasm muqova bo'ladi. Bir nechta bo'lsa, saytda slayd-shou bo'lib almashadi. Tanlanmasa, universitet binosi rasmi qo'yiladi."),
        F("doc", "Nizomi yoki to'liq ma'lumot", "doc", hint="Havola (https://...) yozing yoki PDF yuklang."),
    ]},
    "news": {"label": "Yangiliklar", "one": "Yangilik", "mode": "list", "title": "title", "fields": [
        F("title", "Sarlavha", required=True),
        F("date", "Sana", "date", half=True, required=True),
        F("gallery", "Rasm yuklash", "images", required=True, hint="Birinchi rasm muqova bo'ladi. Bir nechta bo'lsa, saytda slayd-shou bo'lib almashadi."),
        F("excerpt", "Qisqa matn", "rich", limit=2000),
        F("body", "To'liq matn", "rich", limit=20000, rows=8),
    ]},
    "staff": {"label": "Xodimlar", "one": "Xodim", "mode": "list", "title": "name", "sortable": True,
              "note": "Saytdagi «Rahbariyat» sahifasida xodimlar shu tartibda chiqadi: birinchisi katta kartochkada. "
                      "Tartibni o'ng tomondagi ↑ ↓ tugmalari bilan o'zgartiring.", "fields": [
        F("name", "Ism-familiya", required=True),
        F("role", "Lavozim", half=True, placeholder="Markaz rahbari"),
        F("phone", "Telefon", half=True),
        F("telegram", "Telegram", "telegram", placeholder="@username yoki https://t.me/username"),
        F("photo", "Rasm", "image"),
        F("showOnPage", "Rahbariyat sahifasida ko'rsatilsin", "bool"),
    ]},
    "stats": {"label": "Statistika", "one": "Ko'rsatkich", "mode": "fixed", "title": "label",
              "note": "Bosh sahifadagi «Statistika» bloki. Qiymat bo'sh qolsa, raqam to'garaklar, kurslar, "
                      "tanlovlar va kitoblar ro'yxatidan avtomatik hisoblanadi.", "fields": [
        F("label", "Nomi", required=True, half=True),
        F("value", "Asosiy raqam (bo'sh = avtomatik)", half=True, limit=30),
        F("sub", "Pastki raqam (bo'sh = avtomatik)", half=True, limit=30,
          hint="To'garak/kurs a'zolari yoki tanlov ishtirokchilari soni"),
    ]},
    "groups": {"label": "Yo'nalishlar", "one": "Yo'nalish", "mode": "list", "title": "title",
               "note": "Yangi yo'nalish qo'shilsa, to'garak va kurs shakllaridagi tanlovda paydo bo'ladi. "
                       "Asosiy 6 ta yo'nalish va ichida to'garagi bor yo'nalish o'chirilmaydi.", "fields": [
        F("title", "Nomi", required=True),
        F("lead", "Qisqa tavsif", "textarea", limit=400),
        F("about", "Batafsil (Markaz haqida sahifasi)", "textarea", limit=1500),
        F("awards", "Sovrinli o'rinlar soni", "int", half=True),
    ]},
    "winners": {"label": "G'oliblar", "one": "G'olib", "mode": "list", "title": "name",
                "note": "G'oliblar rasmlari bosh sahifadagi slayderda ham chiqadi.", "fields": [
        F("name", "Ism-familiya", required=True),
        F("initiativeId", "Tashabbus", "select", options=GROUPS_1_5, half=True),
        F("place", "O'rin / mukofot", half=True, placeholder="1-o'rin"),
        F("contest", "Tanlov nomi", half=True),
        F("faculty", "Fakultet", half=True),
        F("photo", "Rasm", "image", required=True),
        F("text", "Yutuq haqida", "textarea"),
        F("quote", "Iqtibos (ixtiyoriy)", "textarea"),
    ]},
    "faculties": {"label": "Reyting", "one": "Fakultet", "mode": "list", "title": "name", "fields": [
        F("name", "Fakultet", required=True),
        F("points", "Ball", "number", half=True, required=True),
        F("students", "Faol talabalar", "int", half=True),
        F("note", "Izoh", placeholder="Sport chempioni"),
    ]},
    "books": {"label": "Kutubxona", "one": "Kitob", "mode": "list", "title": "title", "fields": [
        F("title", "Kitob nomi", required=True),
        F("author", "Muallif", half=True),
        F("category", "Turkum", half=True, placeholder="O'zbek adabiyoti"),
        F("pages", "Sahifalar soni", "int", half=True),
        F("cover", "Muqova", "image", half=True),
        F("pdf", "Kitob fayli (PDF)", "pdf", hint="Yuklansa, saytda «Mutolaa qilish» tugmasi chiqadi va kitob sayt ichida o'qiladi. 40 MB gacha."),
        F("desc", "Qisqa izoh", "textarea"),
    ]},
    "faqs": {"label": "Savol-javob", "one": "Savol", "mode": "list", "title": "q", "fields": [
        F("q", "Savol", required=True),
        F("a", "Javob", "textarea", limit=2000, required=True),
    ]},
    "slides": {"label": "Slayder", "one": "Slayd", "mode": "list", "title": "caption", "sortable": True,
               "note": "Bosh sahifadagi katta rasm slayderi. Slaydlar shu tartibda almashadi: ↑ ↓ tugmalari bilan "
                       "o'zgartiring. Hammasi o'chirilsa, g'oliblar rasmlari ko'rsatiladi.", "fields": [
        F("image", "Rasm", "image", required=True, hint="Tavsiya: kamida 1000 px, odam yuzi markazda bo'lsin."),
        F("caption", "Izoh (ixtiyoriy)", placeholder="Masalan: Dostonbek Olloquliyev — Respublika tanlovi g'olibi"),
    ]},
    "settings": {"label": "Aloqa", "one": "Aloqa ma'lumotlari", "mode": "single", "title": "center", "fields": [
        F("name", "Universitet nomi", limit=300),
        F("center", "Markaz nomi", half=True),
        F("hours", "Qabul vaqti", half=True),
        F("address", "Manzil", half=True),
        F("office", "Xona", half=True),
        F("phone", "Asosiy telefon", half=True),
        F("centerEmail", "Markaz pochtasi", "email", half=True),
        F("telegram", "Telegram havolasi", "url", half=True),
        F("instagram", "Instagram havolasi", "url", half=True),
        F("facebook", "Facebook havolasi", "url", half=True),
        F("youtube", "YouTube havolasi", "url", half=True),
        F("website", "Universitet sayti", "url", half=True),
    ]},
}
KINDS = tuple(SCHEMA)
GROUP_COLORS = ["#7C3AED", "#16A34A", "#0284C7", "#D97706", "#DB2777", "#0D9488", "#4F46E5", "#B45309", "#0891B2", "#BE123C"]


def group_options():
    """Bazadagi barcha yo'nalishlar (yangi qo'shilganlari ham) — to'garak va kurs shakllari uchun."""
    try:
        with db() as conn:
            rows = conn.execute("SELECT id, data FROM items WHERE kind='groups'").fetchall()
    except sqlite3.Error:
        rows = []
    opts = sorted(({"value": int(r[0]), "label": json.loads(r[1]).get("title") or r[0]} for r in rows if str(r[0]).isdigit()),
                  key=lambda o: o["value"])
    return opts or GROUPS_1_6


def group_ids():
    return {o["value"] for o in group_options()}


def dynamic_schema():
    """SCHEMA nusxasi: to'garak va kurslardagi «Yo'nalish» tanlovi bazadagi yo'nalishlardan olinadi."""
    out = json.loads(json.dumps(SCHEMA))
    opts = group_options()
    for kind in ("clubs", "courses"):
        for f in out[kind]["fields"]:
            if f["key"] == "initiativeId":
                f["options"] = opts
    return out


def group_locked(group_id):
    """Yo'nalishni o'chirib bo'lmasa — sababi, bo'lsa — bo'sh satr."""
    if str(group_id).isdigit() and int(group_id) <= 6:
        return "Asosiy yo'nalishlarni o'chirib bo'lmaydi"
    with db() as conn:
        for kind in ("clubs", "courses"):
            for r in conn.execute("SELECT data FROM items WHERE kind=?", (kind,)):
                if str(json.loads(r[0]).get("initiativeId")) == str(group_id):
                    return "Bu yo'nalishda to'garak yoki kurs bor: avval ularni boshqa yo'nalishga o'tkazing"
    return ""

# Bosh sahifadagi «Statistika» plitkalari. value/sub bo'sh bo'lsa, sayt ro'yxatlardan hisoblaydi.
STATS_V2 = [
    {"id": "students", "label": "Jami talabalar", "icon": "fa-user-graduate", "value": "25 602", "sub": "", "unit": "nafar"},
    {"id": "clubs", "label": "Jami to'garaklar", "icon": "fa-people-group", "value": "", "sub": ""},
    {"id": "courses", "label": "Kasbga o'qitish kurslari", "icon": "fa-briefcase", "value": "", "sub": ""},
    {"id": "contests", "label": "Tanlovlar", "icon": "fa-trophy", "value": "", "sub": ""},
    {"id": "books", "label": "Kitoblar", "icon": "fa-book", "value": "", "sub": ""},
]
# Faqat admin ko'radigan maydonlar: tizimga kirmagan foydalanuvchiga API ularni bermaydi
PRIVATE = {k: {f["key"] for f in v["fields"] if f.get("private")} | ({"ratedAt", "ratingAuto"} if k == "clubs" else set())
           for k, v in SCHEMA.items()}


def public(kind, item):
    hidden = PRIVATE.get(kind)
    return {k: v for k, v in item.items() if k not in hidden} if hidden else item
SESSION_TTL = 12 * 3600          # 12 soat
MAX_BODY = 6 * 1024 * 1024       # 6 MB (rasm base64 bilan)
MAX_IMAGE = 4 * 1024 * 1024      # 4 MB
MAX_PDF = 40 * 1024 * 1024       # 40 MB (kitob fayli)
READ_GAP = 6 * 3600              # bir kishining bir kitobni qayta ochishi 6 soatda bir marta sanaladi
LOGIN_LIMIT = 8                  # 15 daqiqada IP bo'yicha urinishlar soni

_lock = threading.Lock()
_sessions = {}                   # token -> muddati
_login_attempts = {}             # ip -> [vaqtlar]
_reads = {}                      # (ip, kitob id) -> oxirgi sanalgan vaqt
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
        conn.execute("CREATE TABLE IF NOT EXISTS seeded (kind TEXT PRIMARY KEY)")
        seed = json.load(open(SEED_FILE, encoding="utf-8")) if os.path.exists(SEED_FILE) else {}
        done = {r[0] for r in conn.execute("SELECT kind FROM seeded")}
        now = int(time.time())
        for kind in KINDS:
            if kind in done:
                continue
            # Har bo'lim bir marta to'ldiriladi: keyin admin hammasini o'chirsa ham qayta tiklanmaydi
            if not conn.execute("SELECT 1 FROM items WHERE kind=? LIMIT 1", (kind,)).fetchone():
                items = seed.get(kind, [])
                if kind == "slides" and not items:
                    # Slayder avval g'oliblar rasmlaridan chiqardi: o'sha rasmlar boshlang'ich slaydlar bo'ladi
                    winners = [json.loads(r[0]) for r in conn.execute(
                        "SELECT data FROM items WHERE kind='winners' ORDER BY position, updated_at")]
                    items = [{"id": f"slide-{n}", "image": w["photo"],
                              "caption": " — ".join(x for x in (w.get("name"), w.get("contest")) if x)}
                             for n, w in enumerate((w for w in winners if w.get("photo")), 1)]
                for pos, item in enumerate(items):
                    conn.execute(
                        "INSERT INTO items(kind, id, position, data, updated_at) VALUES (?,?,?,?,?)",
                        (kind, str(item["id"]), pos, json.dumps(item, ensure_ascii=False), now),
                    )
                if items:
                    print(f"Boshlang'ich ma'lumot yuklandi: {kind}")
            conn.execute("INSERT INTO seeded(kind) VALUES (?)", (kind,))
        # Bosh sahifa statistikasi yangi ko'rsatkichlarga o'tdi: eski plitkalar bir marta almashtiriladi
        if not conn.execute("SELECT 1 FROM seeded WHERE kind='stats_v2'").fetchone():
            conn.execute("DELETE FROM items WHERE kind='stats'")
            for pos, item in enumerate(STATS_V2):
                conn.execute(
                    "INSERT INTO items(kind, id, position, data, updated_at) VALUES (?,?,?,?,?)",
                    ("stats", item["id"], pos, json.dumps(item, ensure_ascii=False), now),
                )
            conn.execute("INSERT INTO seeded(kind) VALUES ('stats_v2')")
            print("Statistika yangi ko'rsatkichlarga o'tkazildi")
        # 6-yo'nalish endi «Boshqa turdagi to'garaklar» (admin nomini o'zi o'zgartirgan bo'lsa, tegilmaydi)
        if not conn.execute("SELECT 1 FROM seeded WHERE kind='groups_v2'").fetchone():
            row = conn.execute("SELECT data FROM items WHERE kind='groups' AND id='6'").fetchone()
            if row:
                g = json.loads(row[0])
                if g.get("title") == "Ilmiy to'garaklar":
                    g["title"] = "Boshqa turdagi to'garaklar"
                    conn.execute("UPDATE items SET data=?, updated_at=? WHERE kind='groups' AND id='6'",
                                 (json.dumps(g, ensure_ascii=False), now))
                    print("6-yo'nalish nomi yangilandi")
            conn.execute("INSERT INTO seeded(kind) VALUES ('groups_v2')")
        # Yangilik va tanlovlarda «Asosiy rasm» + «Qo'shimcha rasmlar» bitta ro'yxatga birlashdi
        if not conn.execute("SELECT 1 FROM seeded WHERE kind='media_v1'").fetchone():
            for kind in ("news", "contests"):
                for row in conn.execute("SELECT id, data FROM items WHERE kind=?", (kind,)).fetchall():
                    it = json.loads(row[1])
                    imgs = []
                    for x in [it.get("image")] + list(it.get("gallery") or []):
                        if x and x not in imgs and not (kind == "contests" and x.endswith("urdu_main_building.jpg")):
                            imgs.append(x)
                    it["gallery"] = imgs
                    conn.execute("UPDATE items SET data=? WHERE kind=? AND id=?",
                                 (json.dumps(it, ensure_ascii=False), kind, row[0]))
            conn.execute("INSERT INTO seeded(kind) VALUES ('media_v1')")
            print("Yangilik va tanlov rasmlari bitta ro'yxatga o'tkazildi")
        # 2026/2027 o'quv yili kasbga o'qitish raja-grafigi (nomi bir xil bo'lgan kurs qayta qo'shilmaydi)
        if not conn.execute("SELECT 1 FROM seeded WHERE kind='courses_v1'").fetchone():
            path = os.path.join(HERE, "courses_v1.json")
            have = {json.loads(r[0]).get("name", "").lower() for r in conn.execute("SELECT data FROM items WHERE kind='courses'")}
            pos = conn.execute("SELECT COALESCE(MAX(position), 0) + 1 FROM items WHERE kind='courses'").fetchone()[0]
            added = 0
            for name, duration, schedule, place, teacher, count in (json.load(open(path, encoding="utf-8")) if os.path.exists(path) else []):
                if name.lower() in have:
                    continue
                item = {"name": name, "duration": duration, "schedule": schedule, "place": place, "teacher": teacher,
                        "phone": "", "audience": f"Talabalar · {count} o'rin", "certificate": False, "desc": ""}
                item["id"] = new_id("courses", item)
                conn.execute("INSERT INTO items(kind, id, position, data, updated_at) VALUES (?,?,?,?,?)",
                             ("courses", item["id"], pos + added, json.dumps(item, ensure_ascii=False), now))
                added += 1
            conn.execute("INSERT INTO seeded(kind) VALUES ('courses_v1')")
            print(f"Kasbga o'qitish kurslari qo'shildi: {added} ta")


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
            if kind == "groups":
                # Yo'nalish raqam bilan belgilanadi (to'garaklar initiativeId orqali bog'lanadi)
                ids = [int(r[0]) for r in conn.execute("SELECT id FROM items WHERE kind='groups'") if str(r[0]).isdigit()]
                item_id = str(max(ids + [6]) + 1)
                item.setdefault("color", GROUP_COLORS[int(item_id) % len(GROUP_COLORS)])
                item.setdefault("icon", "fa-solid fa-layer-group")
            else:
                item_id = new_id(kind, item)
            item["id"] = item_id
            # Tartiblanadigan bo'limlarda va yo'nalishlarda yangi yozuv oxiriga, qolganlarida boshiga qo'shiladi
            agg = "MAX(position), 0) + 1" if SCHEMA[kind].get("sortable") or kind == "groups" else "MIN(position), 0) - 1"
            pos = conn.execute(f"SELECT COALESCE({agg} FROM items WHERE kind=?", (kind,)).fetchone()[0]
            conn.execute(
                "INSERT INTO items(kind, id, position, data, updated_at) VALUES (?,?,?,?,?)",
                (kind, item_id, pos, json.dumps(item, ensure_ascii=False), now),
            )
        else:
            row = conn.execute("SELECT data FROM items WHERE kind=? AND id=?", (kind, item_id)).fetchone()
            if row is None:
                return None
            # Shaklda yo'q maydonlar (rang, belgi va h.k.) saqlanib qoladi
            merged = json.loads(row["data"])
            if "rating" in item and item["rating"] != merged.get("rating", ""):
                item["ratedAt"] = time.strftime("%Y-%m-%d") if item["rating"] else ""
                item["ratingAuto"] = False
            merged.update(item)
            merged["id"] = item_id
            item = merged
            conn.execute(
                "UPDATE items SET data=?, updated_at=? WHERE kind=? AND id=?",
                (json.dumps(item, ensure_ascii=False), now, kind, item_id),
            )
    return item


def all_items():
    with db() as conn:
        rows = conn.execute("SELECT kind, data FROM items ORDER BY position, updated_at").fetchall()
    out = {k: [] for k in KINDS}
    for r in rows:
        if r["kind"] in out:
            out[r["kind"]].append(json.loads(r["data"]))
    return out


def rate_clubs(ratings, auto=False):
    """ratings: {to'garak id: "green" | "yellow" | "red" | ""} — faqat baho o'zgaradi."""
    if not isinstance(ratings, dict) or not all(v in RATINGS + ("",) for v in ratings.values()):
        raise ValueError("Baho noto'g'ri")
    today = time.strftime("%Y-%m-%d")
    now = int(time.time())
    with db() as conn:
        for item_id, rating in ratings.items():
            row = conn.execute("SELECT data FROM items WHERE kind='clubs' AND id=?", (str(item_id),)).fetchone()
            if row is None:
                continue
            club = json.loads(row["data"])
            club.update({"rating": rating, "ratedAt": today if rating else "", "ratingAuto": bool(auto and rating)})
            if not rating:
                club["ratingNote"] = ""
            conn.execute("UPDATE items SET data=?, updated_at=? WHERE kind='clubs' AND id=?",
                         (json.dumps(club, ensure_ascii=False), now, str(item_id)))
    return list_items("clubs")


def reorder_items(kind, ids):
    if not isinstance(ids, list) or not all(isinstance(i, str) for i in ids):
        raise ValueError("Tartib noto'g'ri")
    with db() as conn:
        existing = {r[0] for r in conn.execute("SELECT id FROM items WHERE kind=?", (kind,))}
        if set(ids) != existing or len(ids) != len(existing):
            raise ValueError("Ro'yxat eskirgan, sahifani yangilang")
        for pos, item_id in enumerate(ids):
            conn.execute("UPDATE items SET position=? WHERE kind=? AND id=?", (pos, kind, item_id))
    return list_items(kind)


def count_read(book_id, ip):
    """Kitob o'qilganini sanaydi (bir IP — 6 soatda bir marta). Yangi sonni qaytaradi."""
    now = time.time()
    key = (ip, str(book_id))
    # Butun o'qish-yozish qulf ostida: bir vaqtda kelgan so'rovlar sonni yo'qotmaydi
    with _lock, db() as conn:
        row = conn.execute("SELECT data FROM items WHERE kind='books' AND id=?", (str(book_id),)).fetchone()
        if row is None:
            return None
        book = json.loads(row["data"])
        if now - _reads.get(key, 0) > READ_GAP:
            _reads[key] = now
            if len(_reads) > 50000:  # xotira cheksiz o'smasin
                for k in [k for k, t in _reads.items() if now - t > READ_GAP]:
                    _reads.pop(k, None)
            book["reads"] = int(book.get("reads") or 0) + 1
            conn.execute("UPDATE items SET data=? WHERE kind='books' AND id=?",
                         (json.dumps(book, ensure_ascii=False), str(book_id)))
    return book.get("reads", 0)


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
        "initiativeId": group_id(d.get("initiativeId"), group_ids()),
        "name": name,
        "schedule": text(d.get("schedule"), 300),
        "place": text(d.get("place"), 300),
        "students": students,
        "mentors": lines(d.get("mentors"), 10),
        "phones": [phone(p) for p in lines(d.get("phones") if not isinstance(d.get("phones"), list)
                                           else [x.get("text", "") if isinstance(x, dict) else x for x in d.get("phones")], 10)],
        "rating": d.get("rating") if d.get("rating") in RATINGS else "",
        "ratingNote": text(d.get("ratingNote"), 300),
        "desc": text(d.get("desc"), 400),
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
    # Rasmlar ro'yxati; birinchisi muqova (eski yozuvlardagi "image" ham hisobga olinadi)
    gallery = clean_field(F("gallery", "Rasm", "images"), d.get("gallery") or ([d["image"]] if d.get("image") else []))
    # Holat tugash sanasidan aniqlanadi: muddati o'tgan tanlov — yakunlangan
    status = "completed" if deadline < time.strftime("%Y-%m-%d") else "active"
    return {
        "status": status,
        "title": title,
        "deadline": deadline,
        "period": f"{fmt_date(deadline)} gacha",
        "image": gallery[0] if gallery else "assets/images/urdu_main_building.jpg",
        "gallery": gallery,
        "prize": text(d.get("prize"), 300),
        "desc": clean_field(F("desc", "Qisqa ma'lumot", "rich", limit=1500), d.get("desc")),
        "body": clean_field(F("body", "Batafsil ma'lumot", "rich", limit=20000), d.get("body")),
        "doc": clean_field(F("doc", "Nizomi", "doc"), d.get("doc")),
    }


IMAGE_RE = re.compile(r"(assets/images/|uploads/)[\w.\-/]+")


def clean_field(f, v):
    t, label = f["type"], f["label"]
    if t in ("text", "textarea", "email", "url"):
        v = text(v, f.get("limit", 2000 if t == "textarea" else 300))
        if v and t == "url" and not re.match(r"https?://", v):
            raise ValueError(f"{label}: havola http:// yoki https:// bilan boshlanishi kerak")
        if v and t == "email" and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", v):
            raise ValueError(f"{label}: pochta manzili noto'g'ri")
        return v
    if t in ("int", "number"):
        if str(v if v is not None else "").strip() == "":
            return None
        try:
            n = int(v) if t == "int" else round(float(str(v).replace(",", ".")), 2)
        except ValueError:
            raise ValueError(f"{label}: raqam bo'lishi kerak")
        if n < 0:
            raise ValueError(f"{label}: manfiy bo'lmasin")
        return n
    if t == "date":
        return valid_date(v)
    if t == "lines":
        return lines(v)
    if t == "bool":
        return v is True or v in ("1", "true", "on")
    if t == "select":
        for o in f["options"]:
            if str(o["value"]) == str(v):
                return o["value"]
        raise ValueError(f"{label}: noto'g'ri tanlangan")
    if t == "telegram":
        v = text(v, 200)
        if not v:
            return ""
        m = re.fullmatch(r"(?:https?://)?(?:www\.)?(?:t\.me|telegram\.me)/([A-Za-z0-9_]{4,32})/?|@?([A-Za-z0-9_]{4,32})", v)
        if not m:
            raise ValueError(f"{label}: @username yoki https://t.me/username ko'rinishida yozing")
        return "https://t.me/" + (m.group(1) or m.group(2))
    if t == "image":
        v = text(v, 300)
        if v and (not IMAGE_RE.fullmatch(v) or ".." in v):
            raise ValueError(f"{label}: rasm manzili noto'g'ri")
        return v
    if t == "pdf":
        v = text(v, 300)
        if v and not re.fullmatch(r"uploads/[\w.\-]+\.pdf", v):
            raise ValueError(f"{label}: fayl manzili noto'g'ri")
        return v
    if t == "images":  # bir nechta rasm (galereya)
        items = v if isinstance(v, list) else str(v or "").split("\n")
        out = []
        for x in items:
            x = text(x, 300)
            if not x:
                continue
            if not IMAGE_RE.fullmatch(x) or ".." in x:
                raise ValueError(f"{label}: rasm manzili noto'g'ri")
            if x not in out:
                out.append(x)
        if len(out) > 30:
            raise ValueError(f"{label}: ko'pi bilan 30 ta rasm")
        return out
    if t == "doc":  # havola yoki yuklangan PDF
        v = text(v, 500)
        if v and not (re.fullmatch(r"https?://\S+", v) or re.fullmatch(r"uploads/[\w.\-]+\.pdf", v)):
            raise ValueError(f"{label}: https:// bilan boshlanadigan havola yozing yoki PDF yuklang")
        return v
    if t == "rich":  # formatlangan matn: faqat ruxsat etilgan teglar qoladi
        v = sanitize_html(str(v or ""))
        if len(v) > f.get("limit", 20000):
            raise ValueError(f"{label}: matn juda uzun")
        return v
    raise ValueError(f"Noma'lum maydon turi: {t}")


# ------------------------------------------------------------------ formatlangan matn
RICH_TAGS = {"b", "strong", "i", "em", "u", "s", "br", "p", "div", "ul", "ol", "li", "a", "h3", "h4", "blockquote", "span"}
RICH_VOID = {"br"}
RICH_SIZES = {"fs-s", "fs-l", "fs-xl"}
FONT_SIZE = {"1": "fs-s", "2": "fs-s", "4": "fs-l", "5": "fs-l", "6": "fs-xl", "7": "fs-xl"}  # <font size> → sinf


class _RichCleaner(HTMLParser):
    """Admin tahrirlagichidan kelgan HTML'ni oq ro'yxat bo'yicha qayta quradi (skript, uslub, hodisalar tushib qoladi)."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.stack, self.skip = [], [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "iframe", "object", "svg", "math"):
            self.skip += 1
            return
        if self.skip:
            return
        a = dict(attrs)
        if tag == "font":  # brauzerning execCommand("fontSize") natijasi
            cls = FONT_SIZE.get((a.get("size") or "").strip())
            tag, a = ("span", {"class": cls}) if cls else (None, {})
        if tag not in RICH_TAGS:
            self.stack.append(None)
            return
        # <li> va <p> yopilmay kelsa, brauzerdagidek oldingisini yopamiz
        if tag in ("li", "p") and self.stack and self.stack[-1] == tag:
            self.out.append(f"</{self.stack.pop()}>")
        attr = ""
        if tag == "a":
            href = (a.get("href") or "").strip()
            if not re.match(r"(https?://|mailto:|tel:)", href, re.I):
                self.stack.append(None)
                return
            attr = f' href="{escape(href, quote=True)}" target="_blank" rel="noopener"'
        elif tag == "span":
            cls = [c for c in (a.get("class") or "").split() if c in RICH_SIZES]
            if not cls:
                self.stack.append(None)
                return
            attr = f' class="{cls[0]}"'
        self.out.append(f"<{tag}{attr}>")
        if tag not in RICH_VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in ("script", "style", "iframe", "object", "svg", "math"):
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or tag in RICH_VOID:
            return
        if tag == "font":
            tag = "span"
        if tag not in self.stack:  # ochilmagan yoki tashlab yuborilgan teg
            if self.stack and self.stack[-1] is None:
                self.stack.pop()
            return
        while self.stack:  # mos teggacha hammasini yopamiz
            t = self.stack.pop()
            if t:
                self.out.append(f"</{t}>")
            if t == tag:
                break

    def handle_data(self, data):
        if not self.skip:
            self.out.append(escape(data, quote=False))

    def result(self):
        self.out.extend(f"</{t}>" for t in reversed(self.stack) if t)
        return "".join(self.out).strip()


def sanitize_html(v):
    if not re.search(r"<[a-zA-Z/]", v):  # oddiy matn: qatorlar saqlanadi
        return escape(v.strip(), quote=False).replace("\n", "<br>")
    p = _RichCleaner()
    p.feed(v)
    p.close()
    html = p.result()
    return "" if re.fullmatch(r"(<br>|<p></p>|<div></div>|<div><br></div>|\s)*", html) else html


def clean_generic(kind, d):
    out = {}
    for f in dynamic_schema()[kind]["fields"]:
        v = clean_field(f, d.get(f["key"]))
        if f.get("required") and v in ("", None, []):
            raise ValueError(f"{f['label']} kiritilmagan")
        out[f["key"]] = v
    return out


def clean_news(d):
    out = clean_generic("news", d)
    out["image"] = out["gallery"][0]  # muqova: kartochka va eski sahifalar uchun
    return out


CLEANERS = {"clubs": clean_club, "contests": clean_contest, "news": clean_news}


def clean(kind, d):
    if not isinstance(d, dict):
        raise ValueError("Ma'lumot noto'g'ri")
    return CLEANERS[kind](d) if kind in CLEANERS else clean_generic(kind, d)


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


# ------------------------------------------------------------------ murojaatlar
# Saytdagi «Aloqa» xabarlari va to'garakka a'zo bo'lish arizalari. Shaxsiy ma'lumot bo'lgani uchun
# KINDS ga kirmaydi: /api/all va ochiq ro'yxatlarda ko'rinmaydi, faqat admin o'qiydi.
REQUEST_LIMIT = 5                # 10 daqiqada IP bo'yicha murojaatlar soni
REQUEST_STATUS = ("new", "read", "done")
_request_attempts = {}


def requests_allowed(ip):
    now = time.time()
    with _lock:
        tries = [t for t in _request_attempts.get(ip, []) if now - t < 600]
        _request_attempts[ip] = tries
        if len(tries) >= REQUEST_LIMIT:
            return False
        tries.append(now)
        return True


def clean_request(d):
    if not isinstance(d, dict):
        raise ValueError("Ma'lumot noto'g'ri")
    kind = d.get("type")
    if kind not in ("contact", "join"):
        raise ValueError("Murojaat turi noto'g'ri")
    name, phone = text(d.get("name"), 120), text(d.get("phone"), 60)
    if not name:
        raise ValueError("Ism kiritilmagan")
    if not phone:
        raise ValueError("Telefon kiritilmagan")
    item = {"type": kind, "name": name, "phone": phone, "status": "new", "createdAt": int(time.time())}
    if kind == "contact":
        item["topic"] = text(d.get("topic"), 120)
        item["message"] = text(d.get("message"), 3000)
        if not item["message"]:
            raise ValueError("Xabar matni kiritilmagan")
    else:
        item["group"] = text(d.get("group"), 160)
        club_id = text(d.get("club"), 120)
        with db() as conn:
            row = conn.execute("SELECT data FROM items WHERE kind='clubs' AND id=?", (club_id,)).fetchone()
        if row is None:
            raise ValueError("To'garak tanlanmagan")
        club = json.loads(row["data"])
        item.update({"clubId": club_id, "club": club.get("name", ""), "initiativeId": club.get("initiativeId")})
    return item


def add_request(item):
    item["id"] = f"r{int(time.time() * 1000)}-{secrets.token_hex(2)}"
    with db() as conn:
        # Yangisi tepada turishi uchun pozitsiya manfiy vaqt
        conn.execute(
            "INSERT INTO items(kind, id, position, data, updated_at) VALUES ('requests',?,?,?,?)",
            (item["id"], -item["createdAt"], json.dumps(item, ensure_ascii=False), item["createdAt"]),
        )
    return item


def set_request_status(req_id, status):
    if status not in REQUEST_STATUS:
        raise ValueError("Holat noto'g'ri")
    with db() as conn:
        row = conn.execute("SELECT data FROM items WHERE kind='requests' AND id=?", (req_id,)).fetchone()
        if row is None:
            return None
        item = json.loads(row["data"])
        item["status"] = status
        conn.execute("UPDATE items SET data=? WHERE kind='requests' AND id=?", (json.dumps(item, ensure_ascii=False), req_id))
    return item


# ------------------------------------------------------------------ rasm yuklash
IMAGE_TYPES = {b"\xff\xd8\xff": ".jpg", b"\x89PNG\r\n\x1a\n": ".png", b"RIFF": ".webp"}


def save_pdf(stream, length):
    """Kitob faylini (PDF) qismlab diskka yozadi: butun fayl xotiraga olinmaydi."""
    if length <= 0:
        raise ValueError("Fayl bo'sh")
    if length > MAX_PDF:
        raise ValueError("PDF 40 MB dan katta")
    head = stream.read(min(5, length))
    if head != b"%PDF-":
        raise ValueError("Fayl PDF emas")
    name = f"{time.strftime('%Y%m%d')}-{secrets.token_hex(6)}.pdf"
    path = os.path.join(UPLOAD_DIR, name)
    left = length - len(head)
    with open(path, "wb") as f:
        f.write(head)
        while left > 0:
            chunk = stream.read(min(1 << 20, left))
            if not chunk:
                break
            f.write(chunk)
            left -= len(chunk)
    if left:
        os.remove(path)
        raise ValueError("Fayl to'liq yuklanmadi")
    return "uploads/" + name


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
            admin = self.authed()
            if len(parts) == 2 and parts[1] in KINDS:
                items = list_items(parts[1])
                return self.send_json(items if admin else [public(parts[1], x) for x in items])
            if parts[1:] == ["all"]:
                data = all_items()
                if not admin:
                    data = {k: [public(k, x) for x in v] for k, v in data.items()}
                return self.send_json(data)
            if parts[1:] == ["schema"]:
                return self.send_json(dynamic_schema())
            if parts[1:] == ["me"]:
                return self.send_json({"admin": self.authed()})
            if parts[1:] == ["requests"]:
                return self.send_json(list_items("requests")) if admin else self.error(401, "Avval tizimga kiring")
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
            # Kitob o'qildi (ochiq): bir kishi 6 soatda bir marta sanaladi
            if len(parts) == 4 and parts[1] == "books" and parts[3] == "read":
                n = count_read(parts[2], self.client_ip())
                return self.send_json({"reads": n}) if n is not None else self.error(404, "Topilmadi")
            # Murojaat yoki a'zolik arizasi (ochiq). website — botlar uchun yashirin maydon
            if parts == ["api", "requests"]:
                body = self.read_json()
                if body.get("website"):
                    return self.send_json({"ok": True}, 201)
                if not requests_allowed(self.client_ip()):
                    return self.error(429, "Juda ko'p murojaat. 10 daqiqadan keyin qayta urinib ko'ring.")
                add_request(clean_request(body))
                return self.send_json({"ok": True}, 201)
            if not self.authed():
                return self.error(401, "Avval tizimga kiring")
            if parts == ["api", "upload-pdf"]:
                if (self.headers.get("Content-Type") or "").split(";")[0].strip() != "application/pdf":
                    return self.error(400, "Faqat PDF fayl yuklash mumkin")
                return self.send_json({"path": save_pdf(self.rfile, int(self.headers.get("Content-Length") or 0))})
            if parts == ["api", "upload"]:
                return self.send_json({"path": save_upload(self.read_json().get("data"))})
            if parts == ["api", "clubs", "rating"]:
                body = self.read_json()
                return self.send_json(rate_clubs(body.get("ratings"), body.get("auto") is True))
            if len(parts) == 3 and parts[1] in KINDS and parts[2] == "order":
                if not SCHEMA[parts[1]].get("sortable"):
                    return self.error(405, "Bu bo'lim tartiblanmaydi")
                return self.send_json(reorder_items(parts[1], self.read_json().get("ids")))
            if len(parts) == 2 and parts[1] in KINDS:
                if SCHEMA[parts[1]]["mode"] != "list":
                    return self.error(405, "Bu bo'limga yangi yozuv qo'shilmaydi")
                return self.send_json(save_item(parts[1], clean(parts[1], self.read_json())), 201)
            return self.error(404, "Topilmadi")
        except ValueError as e:
            return self.error(400, str(e))

    def do_PUT(self):
        _, parts = self.route()
        if not self.authed():
            return self.error(401, "Avval tizimga kiring")
        if len(parts) == 3 and parts[:2] == ["api", "requests"]:
            try:
                item = set_request_status(parts[2], self.read_json().get("status"))
            except ValueError as e:
                return self.error(400, str(e))
            return self.send_json(item) if item else self.error(404, "Topilmadi")
        if len(parts) == 3 and parts[0] == "api" and parts[1] in KINDS:
            try:
                item = save_item(parts[1], clean(parts[1], self.read_json()), parts[2])
            except ValueError as e:
                return self.error(400, str(e))
            return self.send_json(item) if item else self.error(404, "Topilmadi")
        self.error(404, "Topilmadi")

    def do_DELETE(self):
        _, parts = self.route()
        if not self.authed():
            return self.error(401, "Avval tizimga kiring")
        if len(parts) == 3 and parts[:2] == ["api", "requests"]:
            return self.send_json({"ok": True}) if delete_item("requests", parts[2]) else self.error(404, "Topilmadi")
        if len(parts) == 3 and parts[0] == "api" and parts[1] in KINDS:
            if SCHEMA[parts[1]]["mode"] != "list":
                return self.error(405, "Bu bo'limdan yozuv o'chirilmaydi")
            if parts[1] == "groups":
                why = group_locked(parts[2])
                if why:
                    return self.error(409, why)
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
