"""
Local entrypoint used by the Tauri desktop build.

This script mirrors backend/start.sh but is pure Python so it can be frozen
with PyInstaller. It is responsible for:

1. Reading desktop-specific configuration from environment variables
   (populated via `.tourienv`).
2. Ensuring the desktop data directories exist and pointing DATABASE_URL at
   a desktop-only SQLite file so Docker deployments remain untouched.
3. Running database initialization + migrations.
4. Starting uvicorn bound to the requested loopback host/port.
"""

from __future__ import annotations

import logging
import os
import signal
import sys
from pathlib import Path
from typing import Optional

import uvicorn

from app.db_init import ensure_database
from migrations import run_migrations


def _expand(path_value: str) -> Path:
    """Expand ~ and environment variables for a filesystem path."""
    expanded = os.path.expandvars(os.path.expanduser(path_value.strip('"').strip("'")))
    return Path(expanded).resolve()


def _configure_logging(log_path: Optional[str]) -> None:
    handlers: list[logging.Handler] = [logging.StreamHandler(sys.stdout)]

    if log_path:
        log_file = _expand(log_path)
        log_file.parent.mkdir(parents=True, exist_ok=True)
        handlers.append(logging.FileHandler(log_file, encoding="utf-8"))

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=handlers,
    )


def _prepare_environment() -> tuple[str, str]:
    host = os.getenv("TAURI_BACKEND_HOST", "127.0.0.1")
    port = os.getenv("TAURI_BACKEND_PORT", "18765")
    data_dir = os.getenv("TAURI_DESKTOP_DATA_DIR")
    uploads_dir = os.getenv("TAURI_UPLOADS_DIR")
    static_dir = os.getenv("TAURI_STATIC_DIR")
    db_path = os.getenv("TAURI_DATABASE_PATH")

    if not data_dir:
        data_dir = "~/.local/share/track-the-thing-desktop"
    data_path = _expand(data_dir)
    data_path.mkdir(parents=True, exist_ok=True)

    resolved_db_path: Path
    if db_path:
        resolved_db_path = _expand(db_path)
    else:
        resolved_db_path = data_path / "ttt_desktop.db"

    resolved_db_path.parent.mkdir(parents=True, exist_ok=True)
    os.environ["DATABASE_URL"] = f"sqlite:///{resolved_db_path}"

    if uploads_dir:
        resolved_uploads = _expand(uploads_dir)
    else:
        resolved_uploads = data_path / "uploads"
    resolved_uploads.mkdir(parents=True, exist_ok=True)
    os.environ["UPLOADS_DIR"] = str(resolved_uploads)

    if static_dir:
        resolved_static = _expand(static_dir)
    else:
        resolved_static = data_path / "static"
    resolved_static.mkdir(parents=True, exist_ok=True)
    os.environ["STATIC_FILES_DIR"] = str(resolved_static)

    return host, port


def main() -> None:
    _configure_logging(os.getenv("TAURI_BACKEND_LOG"))

    host, port = _prepare_environment()
    logging.info("Starting Track the Thing desktop backend on %s:%s", host, port)

    logging.info("Ensuring SQLite database exists and has default settings")
    ensure_database()

    logging.info("Running migrations")
    migration_rc = run_migrations.main()
    if migration_rc != 0:
        logging.warning("One or more migrations reported issues (code=%s)", migration_rc)

    server_config = uvicorn.Config(
        "app.main:app",
        host=host,
        port=int(port),
        reload=False,
        log_level="info",
    )
    server = uvicorn.Server(server_config)

    # Allow Ctrl+C / SIGTERM to stop uvicorn cleanly when spawned as a sidecar.
    def _handle_signal(signum, frame):  # type: ignore[override]
        logging.info("Received signal %s, shutting down backend", signum)
        server.should_exit = True

    signal.signal(signal.SIGTERM, _handle_signal)
    signal.signal(signal.SIGINT, _handle_signal)

    server.run()


if __name__ == "__main__":
    main()

