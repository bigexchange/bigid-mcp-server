#!/bin/bash

# BigID MCP Server Packaging Script
# Creates a distributable tarball excluding development artifacts

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if we're in the right directory
if [ ! -f "bigid-mcp-server/package.json" ]; then
    print_error "package.json not found in bigid-mcp-server/. Are you in the correct directory?"
    exit 1
fi

# Extract version from package.json
CURRENT_VERSION=$(node -p "require('./bigid-mcp-server/package.json').version" 2>/dev/null || echo "1.0.0")
print_status "Current version: $CURRENT_VERSION"

# Parse version components
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"

print_status "New version will be: $NEW_VERSION"

# Set package name
PACKAGE_NAME="bigid-mcp-server-${NEW_VERSION}"
TARBALL_NAME="${PACKAGE_NAME}.tar.gz"

# Check for existing tarballs and offer to delete
EXISTING_TARBALLS=$(ls bigid-mcp-server-*.tar.gz 2>/dev/null || true)
if [ -n "$EXISTING_TARBALLS" ]; then
    print_warning "Found existing tarballs:"
    echo "$EXISTING_TARBALLS"
    echo
    read -p "Delete existing tarballs? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Removing existing tarballs..."
        rm -f bigid-mcp-server-*.tar.gz
        print_success "Existing tarballs removed"
    else
        print_status "Keeping existing tarballs"
    fi
fi

# Update version in package.json
print_status "Updating package.json version to $NEW_VERSION"
cd bigid-mcp-server
node -e "
    const fs = require('fs');
    const pkg = require('./package.json');
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\\n');
"
cd ..

# Create temporary directory for packaging
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="${TEMP_DIR}/${PACKAGE_NAME}"

print_status "Creating temporary packaging directory: $PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# Build the project first
print_status "Building TypeScript files..."
cd bigid-mcp-server
npm install
npm run build
cd ..

# Copy files to temporary directory
print_status "Copying files..."
cp -r bigid-mcp-server/* "$PACKAGE_DIR/"

# Copy root-level files if they exist
for file in README.md LICENSE CHANGELOG.md INSTALLATION_NOTE.txt; do
    if [ -f "$file" ]; then
        print_status "Including $file"
        cp "$file" "$PACKAGE_DIR/"
    fi
done

# Create .npmignore if it doesn't exist to ensure clean installs
if [ ! -f "$PACKAGE_DIR/.npmignore" ]; then
    cat > "$PACKAGE_DIR/.npmignore" << EOF
# Development files
.git/
.github/
.vscode/
.idea/
*.log
*.swp
.DS_Store
coverage/
.nyc_output/
.env
.env.*

# Build artifacts that will be regenerated
dist/
build/
*.tgz
*.tar.gz

# Development dependencies
node_modules/
.npm/

# TypeScript cache
*.tsbuildinfo
.tscache/

# Testing
test/
tests/
__tests__/
*.test.ts
*.spec.ts

# Documentation sources (keep docs for HTML setup guide)
*.md
!README.md

# Configuration
.eslintrc*
.prettierrc*
jest.config.*
tsconfig.*.json
EOF
fi

# Clean up development artifacts
print_status "Cleaning development artifacts..."
cd "$PACKAGE_DIR"

# Remove directories that should not be distributed
# Note: We keep "dist" since we pre-build the TypeScript
dirs_to_remove=(
    "node_modules"
    ".git"
    ".github"
    "build"
    "coverage"
    ".nyc_output"
    ".vscode"
    ".idea"
    "test"
    "tests"
    "__tests__"
    ".tscache"
    "src"
)

for dir in "${dirs_to_remove[@]}"; do
    if [ -d "$dir" ]; then
        print_status "Removing $dir/"
        rm -rf "$dir"
    fi
done

# Remove development files
files_to_remove=(
    ".env"
    ".env.*"
    "*.log"
    "npm-debug.log*"
    "yarn-debug.log*"
    "yarn-error.log*"
    ".DS_Store"
    "*.swp"
    "*.swo"
    "*.tgz"
    "*.tar.gz"
    ".eslintcache"
    "*.tsbuildinfo"
)

for pattern in "${files_to_remove[@]}"; do
    find . -name "$pattern" -type f -delete 2>/dev/null || true
done

# Create a minimal production package.json if needed
if [ -f "package.json" ]; then
    print_status "Optimizing package.json for production..."
    # Remove scripts that are only needed for development
    node -e "
        const pkg = require('./package.json');
        // Keep only essential scripts (remove build since we pre-build)
        if (pkg.scripts) {
            const keepScripts = ['start'];
            const newScripts = {};
            keepScripts.forEach(script => {
                if (pkg.scripts[script]) {
                    newScripts[script] = pkg.scripts[script];
                }
            });
            pkg.scripts = newScripts;
        }
        // Remove devDependencies from the distributed package.json
        delete pkg.devDependencies;
        console.log(JSON.stringify(pkg, null, 2));
    " > package.json.tmp && mv package.json.tmp package.json
fi

# Return to script directory
cd "$SCRIPT_DIR"

# Create the tarball
print_status "Creating tarball: $TARBALL_NAME"
cd "$TEMP_DIR"
tar -czf "$SCRIPT_DIR/$TARBALL_NAME" "$PACKAGE_NAME"

# Calculate package size
PACKAGE_SIZE=$(du -h "$SCRIPT_DIR/$TARBALL_NAME" | cut -f1)

# Clean up
print_status "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

# Create distribution info file
cat > "$SCRIPT_DIR/dist-info.txt" << EOF
BigID MCP Server Distribution Package
=====================================
Version: $NEW_VERSION
Package: $TARBALL_NAME
Size: $PACKAGE_SIZE
Created: $(date)

Contents:
- BigID MCP Server source code
- Installation and uninstall scripts
- Configuration examples
- Documentation

Installation:
1. Extract: tar -xzf $TARBALL_NAME
2. Enter directory: cd $PACKAGE_NAME
3. Run: ./install.sh

WARNING: If you don't have node or Homebrew installed, the installer will request sudo. If you don't want to grant sudo, install Homebrew first (https://brew.sh)
EOF

# Final summary
echo
print_success "Package created successfully!"
echo
echo "📦 Package: $TARBALL_NAME"
echo "📏 Size: $PACKAGE_SIZE"
echo "📄 Info: dist-info.txt"
echo
echo "To install from this package:"
echo "  tar -xzf $TARBALL_NAME"
echo "  cd $PACKAGE_NAME"
echo "  ./install.sh"