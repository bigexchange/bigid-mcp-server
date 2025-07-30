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
SETUP_GUIDE_PATH="$(pwd)/docs/mcp-server-setup-guide.html"

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

# Step 6: Create generic MCP server configuration template
print_status "Creating MCP server configuration templates..."

# Get the current directory (where the install script is executed)
CURRENT_DIR=$(pwd)
SERVER_JS_PATH="$CURRENT_DIR/dist/server.js"

cat > mcp-server-config.json << EOF
{
  "mcpServers": {
    "bigid-mcp": {
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
      "timeout": 30000
    }
  }
}
EOF

print_success "Generic MCP server configuration template created: mcp-server-config.json"

# Display the configuration
echo ""
echo -e "${BLUE}MCP Server Configuration Template:${NC}"
echo -e "${BLUE}==================================${NC}"
cat mcp-server-config.json
echo ""
echo -e "${BLUE}==================================${NC}"

# Step 7: Display next steps
echo ""
print_success "Installation completed successfully!"
echo ""
print_status "Next steps:"
echo ""
echo "1. Edit the configuration files with your BigID credentials:"
echo "   - Replace 'your-actual-user-token-here' with your BigID user token"
echo "   - Replace 'your-bigid-domain.com' with your BigID domain"
echo ""
echo "2. Copy the configuration to your MCP client settings"
echo ""
echo "3. Restart your MCP client"
echo ""
print_status "Important notes:"
echo "   - Sample configuration file saved as: mcp-server-config.json"
echo "   - Server path configured as: $SERVER_JS_PATH"
echo "   - You may need to replace your user token periodically if it expires"
echo ""

# Step 8: Ask if user wants to set up Gemini
echo ""
print_status "Would you like to set up Gemini CLI as well? (y/n)"
read -r setup_gemini

if [[ "$setup_gemini" =~ ^[Yy]$ ]]; then
    print_status "Setting up Gemini CLI..."
    
    # Check if gemini CLI is installed
    if command -v gemini &> /dev/null; then
        print_success "Gemini CLI is installed"
        
        # Check if brew is available to check for updates
        if command -v brew &> /dev/null; then
            print_status "Checking Gemini CLI version..."
            CURRENT_VERSION=$(gemini --version 2>/dev/null | head -n1)
            BREW_VERSION=$(brew info gemini-cli 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -n1)
            
            if [ -n "$BREW_VERSION" ] && [ -n "$CURRENT_VERSION" ]; then
                print_status "Current version: $CURRENT_VERSION"
                print_status "Latest available via brew: $BREW_VERSION"
                
                if [[ "$CURRENT_VERSION" != *"$BREW_VERSION"* ]]; then
                    print_status "Your Gemini CLI version may be out of date."
                    print_status "Consider updating with: brew upgrade gemini-cli"
                else
                    print_success "Gemini CLI is up to date"
                fi
            fi
        else
            print_status "Homebrew not available - cannot check for updates"
            print_status "Consider updating Gemini CLI manually if needed"
        fi
    else
        print_status "Gemini CLI not found"
        
        # Check if brew is available to install
        if command -v brew &> /dev/null; then
            print_status "Installing Gemini CLI via Homebrew..."
            brew install gemini-cli
            
            if [ $? -ne 0 ]; then
                print_error "Failed to install Gemini CLI"
                print_status "You can install it manually from: https://github.com/google-gemini/gemini-cli/"
            else
                print_success "Gemini CLI installed successfully"
            fi
        else
            print_error "Homebrew not available and Gemini CLI not installed"
            print_status "Please install Gemini CLI manually from: https://github.com/google-gemini/gemini-cli/"
        fi
    fi
    
    # Create Gemini settings.json
    if command -v gemini &> /dev/null; then
        print_status "Would you like to create a global Gemini configuration at ~/.gemini/settings.json? (y/n)"
        print_status "Note: You can also create .gemini/settings.json in your working directory for local configuration"
        read -r create_gemini_config
        
        if [[ "$create_gemini_config" =~ ^[Yy]$ ]]; then
            print_status "Creating Gemini configuration..."
            
            # Create ~/.gemini directory if it doesn't exist
            GEMINI_CONFIG_DIR="$HOME/.gemini"
            if [ ! -d "$GEMINI_CONFIG_DIR" ]; then
                print_status "Creating Gemini config directory: $GEMINI_CONFIG_DIR"
                mkdir -p "$GEMINI_CONFIG_DIR"
                print_success "Created Gemini config directory: $GEMINI_CONFIG_DIR"
            fi
            
            GEMINI_CONFIG_FILE="$GEMINI_CONFIG_DIR/settings.json"
            
            # Check if settings.json already exists
            if [ -f "$GEMINI_CONFIG_FILE" ]; then
                print_status "Gemini settings.json already exists at: $GEMINI_CONFIG_FILE"
                print_status "Would you like to overwrite it with BigID MCP configuration? (y/n)"
                read -r overwrite_gemini_config
                
                if [[ ! "$overwrite_gemini_config" =~ ^[Yy]$ ]]; then
                    print_status "Skipping Gemini configuration"
                fi
            fi
            
            if [ ! -f "$GEMINI_CONFIG_FILE" ] || [[ "$overwrite_gemini_config" =~ ^[Yy]$ ]]; then
                # Create the Gemini configuration
                cat > "$GEMINI_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "bigid-mcp": {
      "command": "node",
      "args": [
        "$SERVER_JS_PATH"
      ],
      "env": {
        "BIGID_USER_TOKEN": "your-actual-user-token-here",
        "BIGID_DOMAIN": "your-bigid-domain.com",
        "BIGID_AUTH_TYPE": "user_token",
        "BIGID_TIMEOUT": "30000",
        "BIGID_RETRY_ATTEMPTS": "3",
        "NODE_ENV": "production",
        "BIGID_MCP_LOG_LEVEL": "info"
      },
      "timeout": 30000
    }
  }
}
EOF
                print_success "Gemini configuration created at: $GEMINI_CONFIG_FILE"
                
                # Offer to open the file in TextEdit
                print_status "Would you like to open the configuration file in TextEdit to add your user token? (y/n)"
                read -r open_gemini_config
                
                if [[ "$open_gemini_config" =~ ^[Yy]$ ]]; then
                    open -a TextEdit "$GEMINI_CONFIG_FILE"
                    print_success "Opened Gemini configuration in TextEdit"
                fi
            fi
        else
            print_status "Skipping global Gemini configuration. You can create .gemini/settings.json in your working directory for local configuration."
        fi
        
        # Provide authentication options
        echo ""
        print_status "Gemini CLI Authentication Options:"
        echo ""
        echo "Option 1: Google Account Authentication (Recommended)"
        echo "  1. Launch Gemini CLI: gemini"
        echo "  2. Select Google account authentication when prompted"
        echo "  3. No API key needed!"
        echo ""
        echo "Option 2: API Key Authentication"
        echo "  1. Set your API key: export GEMINI_API_KEY='your-api-key'"
        echo "  2. Or add to shell config: echo 'export GEMINI_API_KEY=\"your-api-key\"' >> ~/.zshrc"
        echo ""
        
        print_status "Gemini setup complete!"
        print_status "Next steps for Gemini:"
        echo "  1. Edit the configuration at: $GEMINI_CONFIG_FILE"
        echo "  2. Replace 'your-actual-user-token-here' with your BigID user token"
        echo "  3. Replace 'your-bigid-domain.com' with your BigID domain"
        echo "  4. Launch Gemini CLI: gemini"
        echo "  5. Select Google account authentication when prompted"
        echo "  6. Or set your GEMINI_API_KEY environment variable if desired"
        
    else
        print_error "Gemini CLI is not available. Please install it first."
    fi
fi

echo ""
print_status "🎉 Installation complete!"
if [[ "$setup_gemini" =~ ^[Yy]$ ]] && command -v gemini &> /dev/null; then
    print_status "Create a fresh directory, open a terminal, and execute 'gemini' to start working with your MCP server!"
else
    print_status "Start working with your MCP server!"
fi 