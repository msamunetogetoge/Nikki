#!/usr/bin/env bash
set -euo pipefail

cd /app

# Install workspace dependencies into the container volume (linux-native)
if [ ! -d node_modules ] || [ -z "$(ls -A node_modules)" ]; then
  npm ci --include=optional
fi

# Ensure Next.js workspace has its own node_modules with the native binary
if [ ! -f apps/nikki_next/node_modules/next/dist/bin/next ]; then
  npm ci --include=optional -w apps/nikki_next
fi

# Run FE (Next.js) and BE (Hono API) together
node ./node_modules/concurrently/dist/bin/concurrently.js \
  "npm run dev -w apps/nikki_next" \
  "deno task dev -C apps/api"
