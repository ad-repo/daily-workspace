#!/usr/bin/env python3
"""
Build script to create a standalone FastAPI backend binary using PyInstaller.
This binary will be bundled with the Tauri app as a sidecar process.
"""

import os
import sys
import shutil
import platform
from pathlib import Path

def main():
    # Get the backend directory
    backend_dir = Path(__file__).parent
    project_root = backend_dir.parent
    
    # Output directory for the binary
    output_dir = project_root / "src-tauri" / "binaries"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Determine the binary name based on platform
    system = platform.system().lower()
    arch = platform.machine().lower()
    
    if system == "darwin":
        if "arm" in arch or "aarch64" in arch:
            binary_name = "daily-notes-backend-aarch64-apple-darwin"
        else:
            binary_name = "daily-notes-backend-x86_64-apple-darwin"
    elif system == "windows":
        binary_name = "daily-notes-backend-x86_64-pc-windows-msvc.exe"
    elif system == "linux":
        binary_name = "daily-notes-backend-x86_64-unknown-linux-gnu"
    else:
        print(f"Unsupported platform: {system}")
        sys.exit(1)
    
    print(f"Building backend binary for {system} ({arch})...")
    print(f"Output: {output_dir / binary_name}")
    
    # PyInstaller command
    cmd = [
        "pyinstaller",
        "--onefile",  # Single executable
        "--name", "backend",
        "--clean",
        "--noconfirm",
        "--add-data", f"{backend_dir}/app:app",  # Include app module
        "--hidden-import", "uvicorn.logging",
        "--hidden-import", "uvicorn.loops",
        "--hidden-import", "uvicorn.loops.auto",
        "--hidden-import", "uvicorn.protocols",
        "--hidden-import", "uvicorn.protocols.http",
        "--hidden-import", "uvicorn.protocols.http.auto",
        "--hidden-import", "uvicorn.protocols.websockets",
        "--hidden-import", "uvicorn.protocols.websockets.auto",
        "--hidden-import", "uvicorn.lifespan",
        "--hidden-import", "uvicorn.lifespan.on",
        "--collect-all", "fastapi",
        "--collect-all", "pydantic",
        "--collect-all", "sqlalchemy",
        str(backend_dir / "start_server.py"),  # Entry point
    ]
    
    # Create a simple entry point script
    entry_script = backend_dir / "start_server.py"
    entry_script.write_text("""
import sys
import os
from pathlib import Path

# Add the app directory to the path
if getattr(sys, 'frozen', False):
    # Running in PyInstaller bundle
    base_path = Path(sys._MEIPASS)
else:
    # Running in normal Python
    base_path = Path(__file__).parent

sys.path.insert(0, str(base_path))

# Set up the database path to use app data directory
# This will be configured by Tauri
os.environ.setdefault('DATABASE_URL', 'sqlite:///./daily_notes.db')

# Start the server
import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
""")
    
    # Run PyInstaller
    import subprocess
    result = subprocess.run(cmd, cwd=backend_dir)
    
    if result.returncode != 0:
        print("PyInstaller build failed!")
        sys.exit(1)
    
    # Move the binary to the correct location
    dist_binary = backend_dir / "dist" / "backend"
    if system == "windows":
        dist_binary = backend_dir / "dist" / "backend.exe"
    
    if dist_binary.exists():
        final_binary = output_dir / binary_name
        shutil.copy2(dist_binary, final_binary)
        
        # Make it executable on Unix systems
        if system != "windows":
            os.chmod(final_binary, 0o755)
        
        print(f"✓ Binary created successfully: {final_binary}")
        print(f"  Size: {final_binary.stat().st_size / 1024 / 1024:.2f} MB")
    else:
        print(f"Error: Binary not found at {dist_binary}")
        sys.exit(1)
    
    # Clean up
    print("Cleaning up build artifacts...")
    shutil.rmtree(backend_dir / "build", ignore_errors=True)
    shutil.rmtree(backend_dir / "dist", ignore_errors=True)
    (backend_dir / "backend.spec").unlink(missing_ok=True)
    entry_script.unlink(missing_ok=True)
    
    print("✓ Build complete!")

if __name__ == "__main__":
    main()

