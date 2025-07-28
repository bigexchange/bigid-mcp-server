#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  BigID MCP Server Installer${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

# Open the setup guide in Chrome at the beginning
print_status "Opening setup guide in Chrome..."
SETUP_GUIDE_PATH="$(pwd)/docs/claude-desktop-setup-guide.html"

if [ -f "$SETUP_GUIDE_PATH" ]; then
    if command -v google-chrome &> /dev/null; then
        google-chrome "file://$SETUP_GUIDE_PATH" &
    elif command -v google-chrome-stable &> /dev/null; then
        google-chrome-stable "file://$SETUP_GUIDE_PATH" &
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser "file://$SETUP_GUIDE_PATH" &
    elif command -v open &> /dev/null; then
        # macOS
        open -a "Google Chrome" "file://$SETUP_GUIDE_PATH"
    else
        print_warning "Could not automatically open Chrome. Please manually open:"
        echo "   file://$SETUP_GUIDE_PATH"
    fi

    print_success "Setup guide opened in Chrome!"
    echo ""
    print_success "🎉 Installation and setup complete! Follow the guide in Chrome for next steps."
else
    print_warning "Setup guide not found at: $SETUP_GUIDE_PATH"
    print_status "Continuing with installation..."
fi



# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This installer is designed for macOS only"
    exit 1
fi

print_status "Starting BigID MCP Server installation..."

# Step 1: Check if Node.js is installed
print_status "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    print_status "Node.js not found."
    
    # Only check for Homebrew if we need to install Node.js
    print_status "Checking for Homebrew (needed to install Node.js)..."
    if ! command -v brew &> /dev/null; then
        print_status "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        if [ $? -ne 0 ]; then
            print_error "Failed to install Homebrew"
            exit 1
        fi
        
        # Add Homebrew to PATH for this session
        eval "$(/opt/homebrew/bin/brew shellenv)"
        print_success "Homebrew installed successfully"
    else
        print_success "Homebrew is already installed"
    fi
    
    # Now install Node.js
    print_status "Installing Node.js..."
    brew install node
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install Node.js"
        exit 1
    fi
    print_success "Node.js installed successfully"
else
    NODE_VERSION=$(node --version)
    print_success "Node.js is already installed: $NODE_VERSION"
fi

# Step 2: Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Version 18+ is required."
    print_status "Updating Node.js..."
    brew upgrade node
    
    if [ $? -ne 0 ]; then
        print_error "Failed to update Node.js"
        exit 1
    fi
    print_success "Node.js updated successfully"
else
    print_success "Node.js version $NODE_VERSION meets requirements"
fi

# Step 3: Check if npm is available
print_status "Checking for npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm not found. This should have been installed with Node.js"
    exit 1
else
    NPM_VERSION=$(npm --version)
    print_success "npm is available: $NPM_VERSION"
fi

# Step 4: Install project dependencies (includes TypeScript for build)
print_status "Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install npm dependencies"
    exit 1
fi
print_success "Dependencies installed successfully (TypeScript included)"

# Step 5: Check if build is needed (dist directory exists)
if [ ! -d "dist" ]; then
    print_status "Building the project..."
    if [ -f "package.json" ] && grep -q '"build"' package.json; then
        npm run build
        
        if [ $? -ne 0 ]; then
            print_error "Failed to build the project"
            exit 1
        fi
        print_success "Project built successfully"
    else
        print_error "No dist directory found and no build script available"
        print_error "This package requires TypeScript compilation but no build script is available"
        exit 1
    fi
else
    print_success "Project is already built (dist directory exists)"
fi

# Step 6: Create personalized Claude Desktop configuration
print_status "Creating personalized Claude Desktop configuration..."

# Get the current directory (where the install script is executed)
CURRENT_DIR=$(pwd)
SERVER_JS_PATH="$CURRENT_DIR/dist/server.js"

cat > claude-desktop-config.json << EOF
{
  "mcpServers": {
    "bigid-mcp-server": {
      "command": "node",
      "args": ["$SERVER_JS_PATH"],
      "env": {
        "BIGID_USER_TOKEN": "your-actual-user-token-here",
        "BIGID_DOMAIN": "your-bigid-domain.com",
        "BIGID_AUTH_TYPE": "user_token",
        "BIGID_TIMEOUT": "30000",
        "BIGID_RETRY_ATTEMPTS": "3",
        "NODE_ENV": "production",
        "BIGID_MCP_LOG_LEVEL": "info"
      },
      "description": "BigID data discovery, catalog, and security monitoring"
    }
  }
}
EOF

print_success "Claude Desktop configuration template created: claude-desktop-config.json"

# Display the configuration
echo ""
echo -e "${BLUE}Claude Desktop Configuration:${NC}"
echo -e "${BLUE}==============================${NC}"
cat claude-desktop-config.json
echo ""
echo -e "${BLUE}==============================${NC}"

# Step 7: Display next steps
echo ""
print_success "Installation completed successfully!"
echo ""
print_status "Next steps:"
echo ""
echo "1. Edit the configuration above with your BigID credentials:"
echo "   - Replace 'your-actual-user-token-here' with your BigID user token"
echo "   - Replace 'your-bigid-domain.com' with your BigID domain"
echo ""
echo "2. Copy the configuration to Claude Desktop MCP settings"
echo ""
echo "3. Restart Claude Desktop"
echo ""
print_status "Important notes:"
echo "   - Configuration file saved as: claude-desktop-config.json"
echo "   - Server path configured as: $SERVER_JS_PATH"
echo "   - You may need to replace your user token periodically if it expires"
echo ""
print_status "For detailed instructions, see README.md" 