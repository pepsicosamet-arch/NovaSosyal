#!/usr/bin/env bash
# NOVA Sosyal — Ubuntu 22.04/24.04 sunucuya tek seferlik kurulum.
# Kullanım (sunucuda, proje klasörünün içinde):  sudo bash deploy/kurulum.sh sosyal.ornekalanadi.com
set -euo pipefail
DOMAIN="${1:?Alan adını yaz: sudo bash deploy/kurulum.sh sosyal.ornekalanadi.com}"
SRC="$(cd "$(dirname "$0")/.." && pwd)"

echo "== Node.js 22 kuruluyor"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "== Caddy (HTTPS) kuruluyor"
if ! command -v caddy >/dev/null; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gnupg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update && apt-get install -y caddy
fi

echo "== Dosyalar /opt/nova-sosyal klasörüne kopyalanıyor"
id nova >/dev/null 2>&1 || useradd --system --home /opt/nova-sosyal --shell /usr/sbin/nologin nova
mkdir -p /opt/nova-sosyal
if [ "$SRC" != "/opt/nova-sosyal" ]; then
  cp -r "$SRC"/server.js "$SRC"/package.json "$SRC"/public /opt/nova-sosyal/
fi
mkdir -p /opt/nova-sosyal/data
chown -R nova:nova /opt/nova-sosyal

echo "== Servis başlatılıyor"
cp "$SRC"/deploy/nova-sosyal.service /etc/systemd/system/nova-sosyal.service
systemctl daemon-reload
systemctl enable --now nova-sosyal
systemctl restart nova-sosyal

echo "== HTTPS ayarlanıyor: $DOMAIN"
sed "s/sosyal.ornekalanadi.com/$DOMAIN/" "$SRC"/deploy/Caddyfile > /etc/caddy/Caddyfile
systemctl reload caddy || systemctl restart caddy

if command -v ufw >/dev/null; then ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; fi

echo
echo "Hazır: https://$DOMAIN"
echo "Durum: systemctl status nova-sosyal   ·   Kayıtlar: journalctl -u nova-sosyal -f"
