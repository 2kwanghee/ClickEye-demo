#!/usr/bin/env bash
# clickeye-web-demo — EC2 1회 부트스트랩 (Amazon Linux 2023 / ec2-user)
#
# 서버에서 한 줄로 실행:
#   curl -fsSL https://raw.githubusercontent.com/2kwanghee/ClickEye-demo/main/scripts/server-bootstrap.sh | bash
#
# 하는 일: Docker/git·compose v2 플러그인 설치 → 스왑 2GB → 코드 clone →
#          .env.prod 자동 생성(AUTH_SECRET 랜덤) → 빌드·기동.
# 멱등(idempotent): 다시 실행해도 안전. .env.prod 가 이미 있으면 보존.
set -euo pipefail

REPO=https://github.com/2kwanghee/ClickEye-demo.git
APP_DIR=/opt/apps/clickeye-web-demo
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"

echo "==> 1/6 Docker / git 설치"
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER" || true   # CI(신규 세션)에서 sudo 없이 docker 쓰기 위함

echo "==> 2/6 docker compose v2 + buildx 플러그인"
ARCH=$(uname -m); case "$ARCH" in x86_64) A=amd64;; aarch64) A=arm64;; *) A=amd64;; esac
sudo mkdir -p /usr/local/lib/docker/cli-plugins
if ! sudo docker compose version >/dev/null 2>&1; then
  sudo curl -fSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${ARCH}" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi
# AL2023 번들 buildx(0.12)는 compose build 가 요구하는 0.17+ 미만 → 최신으로 교체
BXV=$(docker buildx version 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+' | head -1 | tr -d v)
if [ -z "${BXV:-}" ] || [ "$(printf '%s\n0.17\n' "$BXV" | sort -V | head -1)" != "0.17" ]; then
  TAG=$(curl -fsSL https://api.github.com/repos/docker/buildx/releases/latest | grep -m1 '"tag_name"' | cut -d'"' -f4)
  sudo curl -fSL "https://github.com/docker/buildx/releases/download/${TAG}/buildx-${TAG}.linux-${A}" \
    -o /usr/local/lib/docker/cli-plugins/docker-buildx
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx
fi
sudo docker compose version && docker buildx version

echo "==> 3/6 스왑 2GB (빌드 OOM 방지, 없을 때만)"
if ! sudo swapon --show 2>/dev/null | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> 4/6 코드 clone/update ($APP_DIR)"
sudo mkdir -p /opt/apps && sudo chown "$USER" /opt/apps
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git fetch --all --prune && git reset --hard origin/main
else
  git clone "$REPO" "$APP_DIR" && cd "$APP_DIR"
fi

echo "==> 5/6 .env.prod (없을 때만 생성, AUTH_SECRET 랜덤)"
if [ ! -f .env.prod ]; then
  cp .env.prod.example .env.prod
  SECRET=$(openssl rand -base64 32)
  sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .env.prod
  echo "    .env.prod 생성 완료 (AUTH_SECRET 자동 설정)"
else
  echo "    기존 .env.prod 보존"
fi

echo "==> 6/6 빌드 + 기동"
sudo $COMPOSE up -d --build
sudo $COMPOSE ps

echo
echo "✅ 완료. 1~2분 후 https://13.237.170.70.sslip.io 접속 확인."
echo "   (Caddy 인증서 자동 발급에 수십 초 걸릴 수 있음)"
echo "   인증서 로그: cd $APP_DIR && sudo $COMPOSE logs -f caddy"
