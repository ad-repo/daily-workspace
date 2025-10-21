# UV Package Manager 🚀

Fast Python package management for this project.

## Why UV?

- ⚡ **10-100x faster** than pip
- 🎯 **Drop-in replacement** for pip
- 🔒 **Better dependency resolution**
- 💾 **Built-in caching**

## Installation

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify
uv --version
```

## Usage

### Setup

```bash
cd backend

# Create venv
uv venv

# Activate
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies (fast!)
uv pip install -r requirements.txt
```

### Running

```bash
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Adding Dependencies

```bash
# Add package
uv pip install package-name

# Update requirements
uv pip freeze > requirements.txt
```

## Common Commands

```bash
# Create venv
uv venv

# Install from requirements
uv pip install -r requirements.txt

# Install single package
uv pip install fastapi

# Uninstall
uv pip uninstall package-name

# List packages
uv pip list

# Update requirements
uv pip freeze > requirements.txt

# Clear cache
uv cache clean
```

## Performance

```bash
# Traditional pip
pip install -r requirements.txt
# Time: ~15-30 seconds

# Using uv
uv pip install -r requirements.txt
# Time: ~1-3 seconds ⚡
```

## Docker Support

Already configured in `Dockerfile`:

```dockerfile
# Uses UV for faster builds
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
RUN uv pip install --system --no-cache -r requirements.txt
```

## Fallback to pip

If needed:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Troubleshooting

### UV not found

```bash
# Add to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Or restart terminal
```

### Cache issues

```bash
uv cache clean
```

## Resources

- **Documentation**: https://github.com/astral-sh/uv
- **Installation**: https://astral.sh/uv

---

**Enjoy fast package management! ⚡**
