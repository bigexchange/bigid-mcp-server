#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Preamble: Check for required tools ---
if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) could not be found. Please install it to use this script."
    echo "See: https://cli.github.com/"
    exit 1
fi

# --- Configuration ---
PACKAGE_DIR="bigid-mcp-server"

# --- Script Body ---
echo "Navigating to $PACKAGE_DIR..."
cd $PACKAGE_DIR

# Get package version
VERSION=$(node -p "require('./package.json').version")
TAG="v$VERSION"
echo "Package version found: $VERSION. Will create Git tag: $TAG"

# Check if the tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "Tag $TAG already exists. Aborting."
    exit 1
fi

# Build the project
echo "Building TypeScript project..."
npm run build

# Copy manifest.json and installation note to the dist folder
echo "Copying manifest.json and installation note to dist folder..."
cp manifest.json dist/
cp ../INSTALLATION_NOTE.txt dist/

# Navigate into the dist folder
echo "Navigating to dist folder..."
cd dist

# Run dxt pack
echo "Running dxt pack..."
dxt pack

# Find the generated DXT file (assuming it's the only .dxt file)
DXT_FILE=$(find . -maxdepth 1 -name "*.dxt" | head -n 1)
if [ -z "$DXT_FILE" ]; then
    echo "No .dxt file found in dist/ directory after packing. Aborting."
    exit 1
fi
echo "Found DXT file: $DXT_FILE"

# Return to the package root to perform git operations
cd ..

# Create and push the git tag
echo "Creating and pushing Git tag: $TAG..."
git tag "$TAG"
git push origin "$TAG"

# Create GitHub release and upload the DXT file
echo "Creating GitHub release and uploading asset..."
gh release create "$TAG" "dist/$DXT_FILE" --title "Release $TAG" --notes-file ../INSTALLATION_NOTE.txt

echo "Successfully created GitHub release and uploaded the DXT package!"

# Return to the original directory
cd ..
