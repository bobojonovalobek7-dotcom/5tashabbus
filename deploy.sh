#!/bin/bash
# ===================================================================
# Urganch Davlat Universiteti — 5 Muhim Tashabbus
# Avtomatlashtirilgan AWS / Ubuntu Server Deploy Skripti
# ===================================================================

set -e

REPO_URL="https://github.com/bobojonovalobek7-dotcom/5tashabbus.git"
TARGET_DIR="/var/www/5tashabbus"

echo "=========================================="
echo "🚀 UrDU 5 Tashabbus portali yangilanmoqda..."
echo "=========================================="

# Nginx o'rnatilganligini tekshirish
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginx topilmadi, o'rnatilmoqda..."
    sudo apt update
    sudo apt install -y nginx git
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi

# Loyiha papkasini tekshirish va kodni olish
if [ ! -d "$TARGET_DIR" ]; then
    echo "📥 Yangi repozitoriya klonlanmoqda: $TARGET_DIR ..."
    sudo git clone "$REPO_URL" "$TARGET_DIR"
else
    echo "🔄 Mavjud repozitoriyadan eng so'nggi o'zgarishlar olinmoqda..."
    cd "$TARGET_DIR"
    sudo git fetch origin
    sudo git reset --hard origin/main
fi

# Ruxsatlarni to'g'rilash (Nginx uchun www-data)
echo "🔒 Papka ruxsatlari sozlanmoqda..."
sudo chown -R www-data:www-data "$TARGET_DIR"
sudo chmod -R 755 "$TARGET_DIR"

# Nginx konfiguratsiyasini tekshirish
if [ -f "/etc/nginx/sites-available/5tashabbus" ]; then
    echo "⚙️ Nginx qayta yuklanmoqda..."
    sudo nginx -t && sudo systemctl reload nginx
fi

echo "=========================================="
echo "✅ Deploy muvaffaqiyatli yakunlandi!"
echo "🌐 Serveringiz IP manzili orqali tekshirishingiz mumkin."
echo "=========================================="
