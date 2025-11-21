#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
ASSET_SRC="${REPO_ROOT}/desktop/tauri/assets"
ASSET_DEST="${REPO_ROOT}/frontend/public/desktop"

LOGO_SRC="${ASSET_SRC}/track-the-thing-logo.png"

if [[ ! -f "${LOGO_SRC}" ]]; then
  echo "✗ ${LOGO_SRC} not found. Add your desktop logo asset first." >&2
  exit 1
fi

mkdir -p "${ASSET_DEST}"
cp "${LOGO_SRC}" "${ASSET_DEST}/track-the-thing-logo.png"

echo "Desktop logo assets synced to frontend/public/desktop"

