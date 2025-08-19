#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the package directory
PACKAGE_DIR="bigid-mcp-server"

# Navigate into the package directory
cd $PACKAGE_DIR

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building TypeScript project..."
npm run build

# Create a new package.json for publishing
echo "Creating new package.json for publishing..."
node -e "
const fs = require('fs');
const sourcePkg = require('./package.json');
const newPkg = {
  name: sourcePkg.name,
  version: sourcePkg.version,
  description: sourcePkg.description,
  main: 'server.js',
  bin: 'server.js',
  author: sourcePkg.author,
  license: sourcePkg.license,
  dependencies: sourcePkg.dependencies,
};
fs.writeFileSync('dist/package.json', JSON.stringify(newPkg, null, 2));
"

# Navigate into the dist folder
cd dist

# Add shebang to the server.js file
echo "Adding shebang to server.js..."
echo '#!/usr/bin/env node' | cat - server.js > temp && mv temp server.js

# Make the server.js script executable
echo "Making server.js executable..."
chmod +x server.js

# Copy other necessary files from the package root directory
echo "Copying additional files..."
cp ../README.md .
cp ../install.sh .
cp ../bigid-filter-spec.yml .
cp -r ../docs .
cp -r ../config .

echo "Ready to publish. Running npm publish..."
# Run npm publish. The --access=public might be needed for scoped packages.
npm publish

echo "Successfully published!"

# Return to the original directory
cd ../..
