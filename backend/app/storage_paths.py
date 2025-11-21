"""
Helpers for resolving data directories that differ between Docker and desktop builds.
"""

from __future__ import annotations

import os
from pathlib import Path


def _resolve(path_value: str | None, default: str) -> Path:
    if path_value:
        path = Path(path_value)
    else:
        path = Path(default)
    if not path.is_absolute():
        # Resolve relative paths relative to backend root
        path = (Path(__file__).resolve().parent.parent / path).resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_upload_dir() -> Path:
    """Directory that holds uploaded files."""
    env_value = os.getenv('UPLOADS_DIR')
    if env_value:
        path = Path(os.path.expandvars(os.path.expanduser(env_value)))
        path.mkdir(parents=True, exist_ok=True)
        return path
    return _resolve(None, 'data/uploads')


def get_static_dir() -> Path:
    """Directory used for background images / static exports."""
    env_value = os.getenv('STATIC_FILES_DIR')
    if env_value:
        path = Path(os.path.expandvars(os.path.expanduser(env_value)))
        path.mkdir(parents=True, exist_ok=True)
        return path
    return _resolve(None, 'data/background-images')
