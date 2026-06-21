#!/bin/bash
# build.sh — 零依赖 JS 打包。开发时加载拆分文件，生产时运行此脚本合并。
set -e
cd "$(dirname "$0")/frontend/js"

cat config.js utils.js api.js app.js > bundle.js

echo "✅ bundle.js built ($(wc -c < bundle.js) bytes)"
