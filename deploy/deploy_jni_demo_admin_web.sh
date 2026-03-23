#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/tsi/dl/jni-inscriptions-demo"
BRANCH="${1:-codexdeploy}"

cd "$APP_DIR/vue-inscriptions-admin"
git fetch origin --prune

if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git checkout -B "$BRANCH" "origin/$BRANCH"
  git pull origin "$BRANCH"
else
  DEFAULT_BRANCH="$(git symbolic-ref --short refs/remotes/origin/HEAD | sed 's|^origin/||')"
  echo "Branch '$BRANCH' not found in vue-inscriptions-admin remote. Falling back to '$DEFAULT_BRANCH'."
  git checkout -B "$DEFAULT_BRANCH" "origin/$DEFAULT_BRANCH"
  git pull origin "$DEFAULT_BRANCH"
fi

cd "$APP_DIR"

if [[ ! -f .env.demo ]]; then
  cp .env.demo.example .env.demo
fi

docker compose --env-file .env.demo -f docker-compose.yml -f docker-compose.demo.yml -p jni_demo up -d --build admin_web
docker compose --env-file .env.demo -f docker-compose.yml -f docker-compose.demo.yml -p jni_demo ps
docker logs jni_demo_admin_web --tail 80
