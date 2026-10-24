#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
playwright_version=$(node -p 'require("@playwright/test/package.json").version')
package_manager=$(node -p 'require("./package.json").packageManager')
docker info >/dev/null
mkdir -p test-results/linux

# Copy tracked working-tree files, including staged additions, without host dependencies or untracked files.
git ls-files -z | COPYFILE_DISABLE=1 tar --no-xattrs --null -T - -cf - | docker run --rm -i --init --ipc=host \
  --mount "type=bind,src=$PWD/test-results/linux,dst=/results" \
  --mount type=volume,src=timtim-linux-test-cache,dst=/cache \
  --env npm_config_cache=/cache/npm \
  "mcr.microsoft.com/playwright:v${playwright_version}-noble" \
  bash -euc '
    mkdir /app
    tar -xf - -C /app
    cd /app
    git init -q
    npm install --global "$1"
    shift
    pnpm install --frozen-lockfile --store-dir /cache/pnpm
    pnpm test:browser "$@" --output=/results
  ' -- "$package_manager" "$@"
