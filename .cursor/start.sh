#!/usr/bin/env bash
set -euo pipefail

cd /workspace

if command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo pg_ctlcluster 16 main start >/dev/null 2>&1 || true
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://x00m:x00m@localhost:5432/x00m?schema=public}"
export AUTH_URL="${AUTH_URL:-http://localhost:3000}"
export AUTH_SECRET="${AUTH_SECRET:-dev-auth-secret-change-me}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$AUTH_SECRET}"

# Start WebSocket signaling server in the background.
if ! node -e "const n=require('net');const s=n.createConnection({port:8080,host:'127.0.0.1'});s.on('connect',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));" 2>/dev/null; then
  npm run dev:socket &
  SOCKET_PID=$!
  trap 'kill "$SOCKET_PID" 2>/dev/null || true' EXIT
fi

exec npm run dev
