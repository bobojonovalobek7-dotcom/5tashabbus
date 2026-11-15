#!/usr/bin/env bash
# Let's Encrypt sertifikatini olish (bir marta, deploy.sh dan keyin):
#     bash deploy/https.sh
# Keyin certbot o'zi avtomatik yangilab turadi.
set -euo pipefail
HOST="${HOST:-root@201.79.42.51}"
KEY="${KEY:-$HOME/.ssh/urdu5t_deploy}"
DOMAIN="${DOMAIN:-5tashabbus.ursu.uz}"
ssh -i "$KEY" -o IdentitiesOnly=yes "$HOST" "DOMAIN=$DOMAIN bash -s" <<'REMOTE'
set -euo pipefail
command -v certbot >/dev/null || { apt-get update -qq && apt-get install -y -qq certbot; }
install -d -m 755 /var/www/letsencrypt
certbot certonly --webroot -w /var/www/letsencrypt -d "$DOMAIN" \
  --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring
# Yangilangandan keyin Nginx qayta yuklansin
install -d /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
install -m 644 /var/www/5tashabbus/deploy/nginx-5tashabbus-ssl.conf /etc/nginx/sites-available/5tashabbus-ssl
ln -sf /etc/nginx/sites-available/5tashabbus-ssl /etc/nginx/sites-enabled/5tashabbus-ssl
nginx -t
systemctl reload nginx
echo "HTTPS yoqildi: https://$DOMAIN/"
REMOTE
