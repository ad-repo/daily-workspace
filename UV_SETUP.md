# Using UV with Daily Notes 🚀

This project is optimized to use `uv`, an extremely fast Python package installer and resolver written in Rust by Astral (creators of Ruff).

## Why UV?

- ⚡ **10-100x faster** than pip
- 🎯 **Drop-in replacement** for pip and pip-tools
- 🔒 **Better dependency resolution**
- 💾 **Built-in caching**
- 🛠️ **Modern Python tooling**

## Installation

### Quick Install (Recommended)
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Using pip (if you prefer)
pip install uv
```

### Verify Installation
```bash
uv --version
```

## Using UV with Daily Notes

### 1. Initial Setup

```bash
cd backend

# Create virtual environment
uv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies (super fast!)
uv pip install -r requirements.txt
```

### 2. Running the Backend

```bash
# Make sure venv is activated
source venv/bin/activate

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Adding New Dependencies

```bash
# Activate venv first
source venv/bin/activate

# Add a new package
uv pip install package-name

# Update requirements.txt
uv pip freeze > requirements.txt

# Or use pyproject.toml (preferred)
# Just add to [project.dependencies] in pyproject.toml
# Then run: uv pip install -e .
```

## UV Commands Cheat Sheet

### Virtual Environment
```bash
# Create venv
uv venv

# Create with specific Python version
uv venv --python 3.11

# Create in custom location
uv venv path/to/venv
```

### Package Management
```bash
# Install from requirements.txt
uv pip install -r requirements.txt

# Install single package
uv pip install fastapi

# Install with specific version
uv pip install fastapi==0.104.1

# Install in editable mode
uv pip install -e .

# Uninstall package
uv pip uninstall fastapi

# List installed packages
uv pip list

# Generate requirements.txt
uv pip freeze > requirements.txt

# Sync to exact requirements
uv pip sync requirements.txt
```

### Compilation (pip-tools alternative)
```bash
# Compile pyproject.toml to requirements.txt
uv pip compile pyproject.toml -o requirements.txt

# Compile with extras
uv pip compile pyproject.toml --extra dev -o requirements-dev.txt

# Update all packages to latest compatible versions
uv pip compile pyproject.toml --upgrade
```

## Project Structure with UV

```
backend/
├── pyproject.toml        ← Project metadata (preferred)
├── requirements.txt      ← Locked dependencies
├── venv/                 ← Virtual environment (created by uv)
└── app/                  ← Application code
```

## Using pyproject.toml (Recommended)

The project includes a `pyproject.toml` file for modern Python dependency management:

```bash
# Install project in editable mode
cd backend
uv pip install -e .

# Add a new dependency
# Edit pyproject.toml and add to [project.dependencies]
# Then run:
uv pip install -e .
```

## Performance Comparison

Real-world example with this project:

```bash
# Traditional pip
pip install -r requirements.txt
# Time: ~15-30 seconds

# Using uv
uv pip install -r requirements.txt
# Time: ~1-3 seconds ⚡
```

That's **10-30x faster**!

## Docker with UV

The project's Dockerfile is already configured to use UV:

```dockerfile
# Install uv from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies (much faster than pip!)
RUN uv pip install --system --no-cache -r requirements.txt
```

Build time improvements:
- Traditional pip: ~45 seconds
- With UV: ~10 seconds ⚡

## Automated Setup

Use the provided setup script which automatically installs and uses UV:

```bash
# From project root
./scripts/setup-local.sh

# This will:
# 1. Install uv if not present
# 2. Create venv with uv
# 3. Install dependencies with uv
# 4. Set up frontend
```

## Troubleshooting

### UV not found after installation
```bash
# Add to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Or restart your terminal
```

### Cache issues
```bash
# Clear UV cache
uv cache clean

# Show cache info
uv cache dir
```

### Fallback to pip
If you encounter any issues with UV, you can always fall back to pip:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Benefits for This Project

1. **Faster Development**: Dependencies install in seconds, not minutes
2. **Better CI/CD**: Docker builds are much faster
3. **Consistent Environment**: Better lock file handling
4. **Modern Tooling**: Aligns with latest Python best practices
5. **Less Waiting**: More time coding, less time installing

## Migration from pip

Already using pip? Switch to UV is easy:

```bash
# Your existing requirements.txt works as-is!
uv venv
source venv/bin/activate
uv pip install -r requirements.txt

# Everything works the same, just faster
```

## Resources

- **UV Documentation**: https://github.com/astral-sh/uv
- **Installation Guide**: https://astral.sh/uv
- **Astral Blog**: https://astral.sh/blog

## FAQ

**Q: Do I need to change my code?**  
A: No! UV is a drop-in replacement for pip. Your code stays the same.

**Q: Does UV work with Docker?**  
A: Yes! The project includes UV-optimized Dockerfiles.

**Q: Can I still use pip?**  
A: Yes! requirements.txt works with both pip and UV.

**Q: Is UV production-ready?**  
A: Yes! Used by many companies in production.

**Q: What about Windows support?**  
A: Fully supported! Works great on Windows, macOS, and Linux.

---

**Ready to go fast? Install UV and enjoy lightning-fast dependency management! ⚡**

