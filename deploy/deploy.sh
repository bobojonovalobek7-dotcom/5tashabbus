#!/usr/bin/env bash
# Saytni serverga joylash (kompyuterdan, Git Bash'da ishga tushiriladi):
#     bash deploy/deploy.sh
#
# Nima qiladi:
#   1. Sayt fayllarini arxivlab serverga yuboradi (.git, baza, kalitlar yuborilmaydi)
#   2. /var/www/5tashabbus ga joylaydi
#   3. Dashboard backend xizmatini (urdu5t-api) va Nginx sozlamasini o'rnatadi/yangilaydi
# Serverdagi boshqa xizmatlarga (masalan, kitobxon.service) tegmaydi.
set -euo pipefail

HOST="${HOST:-root@201.79.42.51}"
KEY="${KEY:-$HOME/.ssh/urdu5t_deploy}"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes "$HOST")

cd "$(dirname "$0")/.."

echo "==> Fayllar yuborilmoqda: $HOST"
tar --exclude=.git --exclude=.claude --exclude=backend/data --exclude='__pycache__' \
    --exclude='*.pem' -czf - . | "${SSH[@]}" "cat > /tmp/urdu5t-site.tgz"

echo "==> Serverda o'rnatilmoqda"
"${SSH[@]}" 'bash -s' <<'REMOTE'
set -euo pipefail
command -v python3 >/dev/null || { apt-get update -qq && apt-get install -y -qq python3; }
command -v nginx   >/dev/null || { apt-get update -qq && apt-get install -y -qq nginx; }

id urdu5t >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin urdu5t
install -d -o urdu5t -g urdu5t -m 755 /var/lib/urdu5t /var/lib/urdu5t/uploads

# Yangi versiyani alohida papkaga ochib, keyin almashtiramiz
rm -rf /var/www/5tashabbus.new
mkdir -p /var/www/5tashabbus.new
tar -xzf /tmp/urdu5t-site.tgz -C /var/www/5tashabbus.new
rm -f /tmp/urdu5t-site.tgz
chown -R root:root /var/www/5tashabbus.new
find /var/www/5tashabbus.new -type d -exec chmod 755 {} +
find /var/www/5tashabbus.new -type f -exec chmod 644 {} +
rm -rf /var/www/5tashabbus.old
[ -d /var/www/5tashabbus ] && mv /var/www/5tashabbus /var/www/5tashabbus.old
mv /var/www/5tashabbus.new /var/www/5tashabbus
rm -rf /var/www/5tashabbus.old

install -m 644 /var/www/5tashabbus/deploy/urdu5t-api.service /etc/systemd/system/urdu5t-api.service
systemctl daemon-reload
systemctl enable --quiet urdu5t-api
systemctl restart urdu5t-api

install -m 644 /var/www/5tashabbus/deploy/nginx-5tashabbus.conf /etc/nginx/sites-available/5tashabbus
ln -sf /etc/nginx/sites-available/5tashabbus /etc/nginx/sites-enabled/5tashabbus
# Nginx'ning standart "Welcome" sahifasi 80-portni egallamasin
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --quiet nginx
systemctl reload nginx || systemctl restart nginx

sleep 1
systemctl is-active --quiet urdu5t-api && echo "API: ishlayapti" || { echo "API ishga tushmadi:"; journalctl -u urdu5t-api -n 20 --no-pager; exit 1; }
curl -fsS -o /dev/null http://127.0.0.1/api/clubs && echo "Sayt va API: javob beryapti"
[ -f /var/lib/urdu5t/admin_password ] || echo "DIQQAT: admin paroli hali o'rnatilmagan."
REMOTE

echo "==> Tayyor: http://${HOST#*@}/"
