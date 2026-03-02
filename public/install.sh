#!/bin/sh
# Orchestra install script
# Usage: curl -fsSL https://orchestra-mcp.dev/install.sh | sh

set -e

REPO="orchestra-mcp/orchestra"
INSTALL_DIR="/usr/local/bin"
BINARY="orchestra"

# Detect OS and arch
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux)  PLATFORM="linux" ;;
  Darwin) PLATFORM="darwin" ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

# Get latest release tag from GitHub
echo "Fetching latest Orchestra release..."
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST" ]; then
  echo "Could not determine latest release. Check https://github.com/${REPO}/releases"
  exit 1
fi

echo "Latest version: $LATEST"

TARBALL="${BINARY}-${PLATFORM}-${ARCH}.tar.gz"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST}/${TARBALL}"

# Download to temp dir
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading $TARBALL..."
curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/$TARBALL"

echo "Extracting..."
tar -xzf "$TMP_DIR/$TARBALL" -C "$TMP_DIR"

# Install binary
if [ -w "$INSTALL_DIR" ]; then
  mv "$TMP_DIR/$BINARY" "$INSTALL_DIR/$BINARY"
  chmod +x "$INSTALL_DIR/$BINARY"
else
  echo "Installing to $INSTALL_DIR requires sudo..."
  sudo mv "$TMP_DIR/$BINARY" "$INSTALL_DIR/$BINARY"
  sudo chmod +x "$INSTALL_DIR/$BINARY"
fi

echo ""
echo "Orchestra $LATEST installed to $INSTALL_DIR/$BINARY"
echo ""
echo "Next steps:"
echo "  orchestra init    # Initialize in your project"
echo "  orchestra serve   # Start the plugin server"
echo "  orchestra --help  # Show all commands"
echo ""
echo "Docs: https://orchestra-mcp.dev/docs"
