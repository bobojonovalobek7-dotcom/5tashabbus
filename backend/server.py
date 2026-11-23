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
     "Xotin-qizlar bandligi", "Ilmiy to'garaklar"], 1)]
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
    "courses": {"label": "Kasb-hunar kurslari", "one": "Kurs", "mode": "list", "title": "name",
                "note": "Xotin-qizlar va yoshlarni kasb-hunarga o'qitish kurslari: o'rinlar, o'qiyotganlar, bitirganlar va bandlik hisobi.",
                "fields": [
        F("name", "Kurs nomi", required=True),
        F("initiativeId", "Yo'nalish", "select", options=GROUPS_1_6, half=True, default=5),
        F("status", "Holati", "select", half=True, options=[
            {"value": "open", "label": "Qabul ochiq"}, {"value": "running", "label": "O'qish davom etmoqda"},
            {"value": "planned", "label": "Rejalashtirilgan"}, {"value": "finished", "label": "Yakunlangan"}]),
        F("start", "Boshlanish sanasi", "date", half=True),
        F("end", "Tugash sanasi", "date", half=True),
        F("duration", "Davomiyligi", half=True, placeholder="3 oy, 72 soat"),
        F("price", "Narxi", half=True, placeholder="Bepul"),
        F("schedule", "Dars jadvali", half=True, placeholder="Dushanba, Chorshanba · 14:00–16:00"),
        F("place", "O'qitiladigan joy", half=True),
        F("teacher", "Usta / o'qituvchi", half=True),
        F("phone", "Aloqa telefoni", half=True),
        F("audience", "Kimlar uchun", placeholder="Talaba-qizlar va mahalla yoshlari"),
        F("capacity", "O'rinlar soni", "int", half=True),
        F("enrolled", "O'qiyotganlar", "int", half=True),
        F("graduates", "Bitirganlar", "int", half=True),
        F("employed", "Ishga joylashganlar", "int", half=True, hint="Bitirganlardan ish yoki daromad topganlar"),
        F("certificate", "Sertifikat beriladi", "bool"),
        F("image", "Rasm", "image"),
        F("desc", "Kurs haqida", "textarea", limit=1500),
    ]},
    "contests": {"label": "Tanlovlar", "one": "Tanlov", "mode": "list", "title": "title", "fields": [
        F("title", "Nomi", required=True),
        F("initiativeId", "Tashabbus", "select", options=GROUPS_1_5, half=True),
        F("status", "Holati", "select", half=True, options=[
            {"value": "active", "label": "Faol (qabul ochiq)"}, {"value": "completed", "label": "Yakunlangan"}]),
        F("start", "Boshlanish sanasi", "date", half=True),
        F("deadline", "Tugash sanasi", "date", half=True, required=True),
        F("place", "Joyi", half=True),
        F("organizer", "Tashkilotchi", half=True),
        F("prize", "Mukofot", half=True, placeholder="1-o'rin: 5 mln so'm"),
        F("participants", "Ishtirokchilar soni", "int", half=True, hint="Bosh sahifa statistikasida jamlanadi"),
        F("desc", "Qisqa izoh", "textarea"),
        F("image", "Rasm", "image", hint="Tanlanmasa, universitet binosi rasmi qo'yiladi."),
        F("rules.purpose", "Nizom: maqsad", "textarea"),
        F("rules.requirements", "Nizom: talablar", "lines", half=True, hint="Har bir band alohida qatorda"),
        F("rules.stages", "Nizom: bosqichlar", "lines", half=True, hint="Har bir band alohida qatorda"),
        F("rules.criteria", "Nizom: baholash", "lines", half=True, hint="Har bir band alohida qatorda"),
        F("rules.awards", "Nizom: mukofotlar", "textarea", half=True),
    ]},
    "news": {"label": "Yangiliklar", "one": "Yangilik", "mode": "list", "title": "title", "fields": [
        F("title", "Sarlavha", required=True),
        F("initiativeId", "Tashabbus", "select", options=GROUPS_1_5, half=True),
        F("date", "Sana", "date", half=True, required=True),
        F("image", "Rasm", "image", required=True),
        F("excerpt", "Qisqa matn", "textarea", limit=600),
        F("body", "To'liq matn", "textarea", limit=5000, rows=6),
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
    "groups": {"label": "Tashabbuslar", "one": "Tashabbus", "mode": "fixed", "title": "title", "fields": [
        F("title", "Nomi", required=True),
        F("lead", "Qisqa tavsif (bosh sahifa)", "textarea", limit=400),
        F("about", "Batafsil (Markaz haqida sahifasi)", "textarea", limit=1500),
        F("awards", "Sovrinli o'rinlar soni", "int", half=True),
        F("image", "Rasm", "image"),
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
        F("youthPhone", "Qo'shimcha telefon", half=True),
        F("centerEmail", "Markaz pochtasi", "email", half=True),
        F("email", "Universitet pochtasi", "email", half=True),
        F("telegram", "Telegram havolasi", "url", half=True),
        F("instagram", "Instagram havolasi", "url", half=True),
        F("facebook", "Facebook havolasi", "url", half=True),
        F("youtube", "YouTube havolasi", "url", half=True),
        F("hemis", "HEMIS havolasi", "url", half=True),
        F("library", "Elektron kutubxona havolasi", "url", half=True),
        F("website", "Universitet sayti", "url", half=True),
    ]},
}
KINDS = tuple(SCHEMA)

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
            # Tartiblanadigan bo'limlarda yangi yozuv oxiriga, qolganlarida boshiga qo'shiladi
            agg = "MAX(position), 0) + 1" if SCHEMA[kind].get("sortable") else "MIN(position), 0) - 1"
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
        "participants": clean_field(F("participants", "Ishtirokchilar soni", "int"), d.get("participants")),
        "desc": text(d.get("desc"), 1000),
        "rules": {
            "purpose": text(rules.get("purpose"), 1500),
            "requirements": lines(rules.get("requirements")),
            "stages": lines(rules.get("stages")),
            "criteria": lines(rules.get("criteria")),
            "awards": text(rules.get("awards"), 1000),
        },
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
    raise ValueError(f"Noma'lum maydon turi: {t}")


def clean_generic(kind, d):
    out = {}
    for f in SCHEMA[kind]["fields"]:
        v = clean_field(f, d.get(f["key"]))
        if f.get("required") and v in ("", None, []):
            raise ValueError(f"{f['label']} kiritilmagan")
        out[f["key"]] = v
    return out


CLEANERS = {"clubs": clean_club, "contests": clean_contest}


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
                return self.send_json(SCHEMA)
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
        if len(parts) == 3 and parts[0] == "api" and parts[1] in KINDS:
            if SCHEMA[parts[1]]["mode"] != "list":
                return self.error(405, "Bu bo'limdan yozuv o'chirilmaydi")
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
