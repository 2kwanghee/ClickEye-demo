# clickeye-web-demo 배포 가이드 (EC2 + Docker + 내장 Caddy + GitHub Actions)

`main` 브랜치에 push 하면 **GitHub Actions가 EC2에 SSH 접속 → 서버에서 빌드 → 재기동**하는
자동 배포 구조입니다. HTTPS는 **Caddy가 자동 발급**(Let's Encrypt)합니다.
백엔드 0 의존 프론트 단독 데모라 DB/Redis/공용 프록시 없이 **단일 프로젝트(내장 Caddy)** 로 구성합니다.

> TTO 프로젝트의 멀티프로젝트(공용 Caddy + edge) 모델을 단일 프로젝트용으로 단순화한 버전입니다.
> 나중에 같은 EC2에 다른 앱을 더 올릴 계획이면 TTO `docs/DEPLOYMENT.md`의 공용 프록시 모델로 전환하세요.

## 0. 아키텍처

```
        인터넷 (80/443)
             │
       ┌─────▼──────┐   EC2 1대 (Elastic IP 13.237.170.70)
       │   caddy    │   80/443 소유, 자동 HTTPS
       └─────┬──────┘
             │ reverse_proxy web:3000  (내부 appnet 네트워크)
       ┌─────▼──────┐
       │    web     │   Next.js standalone (포트 외부 미게시)
       └────────────┘
```

- 호스트네임: **`13.237.170.70.sslip.io`** (sslip.io = IP 기반 무료 호스트네임, DNS 설정 불필요)
- 외부 노출 포트: **80/443 (Caddy)** 뿐. web의 3000은 내부 전용.

레포에 포함된 배포 산출물:
- `Dockerfile.prod` — Next.js standalone 멀티스테이지 이미지 (빌드 검증 완료)
- `docker-compose.prod.yml` — web + caddy 스택
- `Caddyfile` — `{$DOMAIN}` 자동 HTTPS, web으로 프록시
- `.env.prod.example` — 런타임 시크릿 템플릿 (서버에서 `.env.prod`로 복사)
- `.github/workflows/deploy.yml` — push→자동 배포 워크플로
- `.dockerignore`

---

## A. 서버 1회 구성 (EC2당 한 번) — Amazon Linux 2023 기준 (사용자: `ec2-user`)

### A-1. Docker + git 설치
```bash
# PuTTY 또는: ssh -i AWS_Linux_Key.pem ec2-user@13.237.170.70

sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER        # 그룹 반영 위해 재로그인(또는 newgrp docker)

# Docker Compose v2 플러그인 (AL2023: 패키지로 시도)
sudo dnf install -y docker-compose-plugin 2>/dev/null
docker compose version || {
  ARCH=$(uname -m)   # x86_64 또는 aarch64
  sudo mkdir -p /usr/local/lib/docker/cli-plugins
  sudo curl -fSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${ARCH}" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
}
```
재로그인 후 `docker ps` 가 권한 에러 없이 빈 목록을 출력하면 OK.

### A-2. 80포트 점유 확인
```bash
sudo ss -ltnp | grep -E ':80|:443' || echo "80/443 비어있음 OK"
# httpd(Apache) 가 잡고 있으면: sudo systemctl disable --now httpd 2>/dev/null
```

### A-3. 보안 그룹(인바운드)
| 포트 | 소스 | 용도 |
|---|---|---|
| 80, 443 | 0.0.0.0/0 (또는 사내 CIDR) | Caddy(HTTPS/HTTP) |
| 22 | **관리자 IP만** | SSH |
| 3000 | **열지 않음** | web 내부 전용 |

Elastic IP(13.237.170.70)가 이미 붙어 있어 재부팅에도 IP/호스트네임이 유지됩니다.

---

## B. GitHub 저장소 연결 (로컬 → 원격)

이 프로젝트는 아직 git 저장소가 아니므로 init부터:
```bash
cd /mnt/c/workspace/clickeye-web-demo
git init -b main
# .gitignore 에 .env / .env.local / .env.prod 가 제외돼 있는지 확인 (시크릿 커밋 금지!)
grep -E '\.env' .gitignore
git add .
git commit -m "chore: production-ready (Docker + Caddy + Actions)"
```
GitHub에서 **빈 저장소**(README 없이) 생성 후 연결:
```bash
git remote add origin git@github.com:<org>/clickeye-web-demo.git   # SSH 방식
# 또는 HTTPS+PAT: git remote add origin https://github.com/<org>/clickeye-web-demo.git
git push -u origin main
```

---

## C. 서버에서 코드 받기 (read-only deploy key)

```bash
# EC2에서 — GitHub pull 용 배포 키
ssh-keygen -t ed25519 -C "clickeye-demo-deploy@ec2" -f ~/.ssh/ckdemo_deploy -N ""
cat ~/.ssh/ckdemo_deploy.pub    # 출력 → GitHub repo → Settings → Deploy keys → Add (Read only)
cat >> ~/.ssh/config <<'EOF'
Host github.com-ckdemo
  HostName github.com
  User git
  IdentityFile ~/.ssh/ckdemo_deploy
EOF

# clone + 시크릿 작성
sudo mkdir -p /opt/apps && sudo chown $USER /opt/apps
cd /opt/apps
git clone git@github.com-ckdemo:<org>/clickeye-web-demo.git clickeye-web-demo
cd clickeye-web-demo
cp .env.prod.example .env.prod
openssl rand -base64 32          # 출력값 복사
vi .env.prod                     # AUTH_SECRET= 에 붙여넣기 (DOMAIN/AUTH_URL 은 이미 설정됨)
```

---

## D. 첫 배포 (수동 1회)

```bash
cd /opt/apps/clickeye-web-demo
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml ps        # web, caddy 가 Up
docker compose -f docker-compose.prod.yml logs -f caddy   # "certificate obtained" 류 로그 확인 (Ctrl-C)
```
브라우저에서 **https://13.237.170.70.sslip.io** → 자물쇠 + 데모 화면.

> ⚠️ Caddy 인증서 발급이 실패하면(로그에 rate limit / sslip.io 관련) → §트러블슈팅 참고.

---

## E. CI/CD 자동화 (push → 자동 배포)

GitHub repo → **Settings → Secrets and variables → Actions → New secret**:
| 시크릿 | 값 |
|---|---|
| `EC2_HOST` | `13.237.170.70` |
| `EC2_USER` | `ec2-user` |
| `EC2_SSH_KEY` | EC2 접속용 **개인키(PEM)** 전체 내용 (`-----BEGIN…END-----`) |
| `EC2_SSH_PORT` | (선택) 22 외 포트 쓸 때만 |

이후 `main` 에 push 하면 `.github/workflows/deploy.yml` 이 자동으로:
`ssh EC2 → cd /opt/apps/clickeye-web-demo → git reset --hard origin/main → docker compose build web → up -d → image prune` 수행.
(수동 실행은 Actions 탭의 **Run workflow** 버튼.)

> 전제: §C에서 `/opt/apps/clickeye-web-demo` 가 같은 origin으로 clone 돼 있고, `.env.prod` 는 **서버에만** 존재(레포엔 없음).

---

## F. 배포 후 확인

```bash
cd /opt/apps/clickeye-web-demo
docker compose -f docker-compose.prod.yml ps                 # 모두 Up
docker compose -f docker-compose.prod.yml logs -f web        # 앱 로그
curl -I https://13.237.170.70.sslip.io                       # 200/307, 유효 인증서
```
화면 진입 후: 아무 이메일/비번 → mock 로그인 → New solution 위저드 (DEMO-README.md 참고).

---

## H. 운영 (Day-2)

- **재배포**: `main` push 시 자동. 수동은 서버에서
  `git pull && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`.
- **롤백**: `git checkout <이전 커밋> && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`.
- **디스크 관리**: `docker image prune -f` (워크플로에 포함됨), 가끔 `docker system df`.
- **t3.small 빌드 메모리**: 2GB면 대개 충분하나 불안하면 스왑 2GB:
  ```bash
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

---

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `npm ci ... not in sync` (빌드 실패) | package-lock.json 이 package.json 과 불일치 → 로컬에서 `npm install` 후 lock 재커밋 |
| Caddy가 80에서 안 뜸 | httpd(Apache) 잔존 → `sudo systemctl disable --now httpd` (§A-2) |
| `permission denied ... docker.sock` | docker 그룹 반영 안 됨 → 재로그인 또는 `newgrp docker` |
| 인증서 발급 실패 (rate limit) | sslip.io 공용 도메인 한도 → 잠시 후 재시도, 또는 `13.237.170.70.nip.io` 로 교체(`.env.prod` 의 DOMAIN/AUTH_URL/NEXT_PUBLIC_API_URL 반영 후 `up -d`), 또는 도메인 확보 |
| 로그인 리다이렉트 깨짐 | `.env.prod` 의 `AUTH_URL` 이 실제 https 호스트네임인지, `AUTH_TRUST_HOST=true` 인지 확인 후 `up -d` |
| 502 / 연결 안 됨 | web 컨테이너가 떠 있는지 `docker compose ... ps` + `logs web` 확인 |
