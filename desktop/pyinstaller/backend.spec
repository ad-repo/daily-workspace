# -*- mode: python ; coding: utf-8 -*-

"""
PyInstaller specification for the Track the Thing desktop backend sidecar.

The spec adds the backend folder to PYTHONPATH and bundles the migrations
directory as data so the runtime script can continue to load migration files
via importlib.
"""

from pathlib import Path
import sys


def _spec_path() -> Path:
    candidate = globals().get("__file__")
    if candidate:
        return Path(candidate).resolve()
    if sys.argv and sys.argv[0]:
        return Path(sys.argv[0]).resolve()
    return (Path.cwd() / "desktop/pyinstaller/backend.spec").resolve()


SPEC_FILE = _spec_path()
project_root = SPEC_FILE.parents[2]
backend_root = project_root / "backend"

block_cipher = None

a = Analysis(
    [str(backend_root / "desktop_launcher.py")],
    pathex=[str(backend_root)],
    binaries=[],
    datas=[(str(backend_root / "migrations"), "migrations")],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="track-the-thing-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="track-the-thing-backend",
)

