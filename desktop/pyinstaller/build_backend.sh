#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "▶ Building Track the Thing backend sidecar"
echo "   project root: ${REPO_ROOT}"

if [[ -f "${REPO_ROOT}/.tourienv" ]]; then
  echo "▶ Loading .tourienv"
  set -a
  # shellcheck source=/dev/null
  source "${REPO_ROOT}/.tourienv"
  set +a
fi

cd "${REPO_ROOT}"

if ! command -v pyinstaller >/dev/null 2>&1; then
  echo "✗ PyInstaller is not installed. Install it with 'pip install pyinstaller'." >&2
  exit 1
fi

PLATFORM="macos"
case "$(uname -s)" in
  Linux*) PLATFORM="linux" ;;
  Darwin*) PLATFORM="macos" ;;
  CYGWIN*|MINGW*|MSYS*) PLATFORM="windows" ;;
esac

DIST_DIR="${REPO_ROOT}/desktop/tauri/src-tauri/bin/${PLATFORM}"
WORK_DIR="${REPO_ROOT}/desktop/pyinstaller/build"
mkdir -p "${DIST_DIR}" "${WORK_DIR}"

pyinstaller \
  "desktop/pyinstaller/backend.spec" \
  --noconfirm \
  --distpath "${DIST_DIR}" \
  --workpath "${WORK_DIR}"

echo "✓ Backend sidecar built."
echo "  Output directory: ${DIST_DIR}/track-the-thing-backend"

