#!/bin/bash

# JobFlow - AI-Powered Job Application Automation Platform
# Installation Script

set -e

echo "🎯 Welcome to JobFlow Installation!"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    print_header "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is installed
check_mongodb() {
    print_header "Checking MongoDB installation..."
    if command -v mongod &> /dev/null; then
        MONGO_VERSION=$(mongod --version | head -n 1)
        print_status "MongoDB is installed: $MONGO_VERSION"
    else
        print_warning "MongoDB is not installed. Please install MongoDB from https://www.mongodb.com/try/download/community"
        print_warning "Or use MongoDB Atlas cloud service"
    fi
}

# Check if Redis is installed (optional)
check_redis() {
    print_header "Checking Redis installation..."
    if command -v redis-server &> /dev/null; then
        REDIS_VERSION=$(redis-server --version)
        print_status "Redis is installed: $REDIS_VERSION"
    else
        print_warning "Redis is not installed. Installing Redis for job queues..."
        
        # Install Redis based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y redis-server
            elif command -v yum &> /dev/null; then
                sudo yum install -y redis
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew &> /dev/null; then
                brew install redis
            else
                print_warning "Please install Homebrew and run: brew install redis"
            fi
        fi
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing project dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install server dependencies
    print_status "Installing server dependencies..."
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    print_status "Installing client dependencies..."
    cd client
    npm install
    cd ..
    
    print_status "All dependencies installed successfully!"
}

# Setup environment files
setup_environment() {
    print_header "Setting up environment configuration..."
    
    # Server environment
    if [ ! -f "server/.env" ]; then
        print_status "Creating server environment file..."
        cp server/.env.example server/.env
        print_warning "Please edit server/.env with your configuration values"
    else
        print_status "Server environment file already exists"
    fi
    
    # Client environment
    if [ ! -f "client/.env" ]; then
        print_status "Creating client environment file..."
        echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env
        print_status "Client environment file created"
    else
        print_status "Client environment file already exists"
    fi
}

# Setup database
setup_database() {
    print_header "Setting up database..."
    
    # Check if MongoDB is running
    if pgrep mongod > /dev/null; then
        print_status "MongoDB is running"
    else
        print_warning "MongoDB is not running. Please start MongoDB:"
        echo "  - On Linux: sudo systemctl start mongod"
        echo "  - On macOS: brew services start mongodb-community"
        echo "  - Or use MongoDB Atlas cloud service"
    fi
    
    # Check if Redis is running
    if pgrep redis-server > /dev/null; then
        print_status "Redis is running"
    else
        print_warning "Redis is not running. Please start Redis:"
        echo "  - On Linux: sudo systemctl start redis"
        echo "  - On macOS: brew services start redis"
        echo "  - Or run: redis-server"
    fi
}

# Create necessary directories
create_directories() {
    print_header "Creating necessary directories..."
    
    mkdir -p server/uploads/resumes
    mkdir -p server/uploads/temp
    mkdir -p server/logs
    mkdir -p client/public/uploads
    
    print_status "Directories created successfully!"
}

# Install system dependencies (Chrome for Puppeteer)
install_system_deps() {
    print_header "Installing system dependencies..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Installing Chrome dependencies for web scraping..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y \
                gconf-service \
                libasound2 \
                libatk1.0-0 \
                libc6 \
                libcairo2 \
                libcups2 \
                libdbus-1-3 \
                libexpat1 \
                libfontconfig1 \
                libgcc1 \
                libgconf-2-4 \
                libgdk-pixbuf2.0-0 \
                libglib2.0-0 \
                libgtk-3-0 \
                libnspr4 \
                libpango-1.0-0 \
                libpangocairo-1.0-0 \
                libstdc++6 \
                libx11-6 \
                libx11-xcb1 \
                libxcb1 \
                libxcomposite1 \
                libxcursor1 \
                libxdamage1 \
                libxext6 \
                libxfixes3 \
                libxi6 \
                libxrandr2 \
                libxrender1 \
                libxss1 \
                libxtst6 \
                ca-certificates \
                fonts-liberation \
                libappindicator1 \
                libnss3 \
                lsb-release \
                xdg-utils \
                wget
        fi
    fi
    
    print_status "System dependencies installed!"
}

# Generate JWT secrets
generate_secrets() {
    print_header "Generating security secrets..."
    
    if [ -f "server/.env" ]; then
        # Generate random JWT secrets
        JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        
        # Update .env file with generated secrets
        if command -v sed &> /dev/null; then
            sed -i.bak "s/your_super_secret_jwt_key_here_make_it_long_and_random/$JWT_SECRET/g" server/.env
            sed -i.bak "s/your_refresh_secret_key_here_also_long_and_random/$JWT_REFRESH_SECRET/g" server/.env
            rm server/.env.bak
            print_status "JWT secrets generated and updated in .env file"
        fi
    fi
}

# Verify installation
verify_installation() {
    print_header "Verifying installation..."
    
    # Check if all package.json files exist
    if [ -f "package.json" ] && [ -f "server/package.json" ] && [ -f "client/package.json" ]; then
        print_status "All package.json files found"
    else
        print_error "Missing package.json files"
        exit 1
    fi
    
    # Check if node_modules exist
    if [ -d "server/node_modules" ] && [ -d "client/node_modules" ]; then
        print_status "Dependencies installed correctly"
    else
        print_error "Dependencies not installed correctly"
        exit 1
    fi
    
    # Check environment files
    if [ -f "server/.env" ] && [ -f "client/.env" ]; then
        print_status "Environment files configured"
    else
        print_error "Environment files missing"
        exit 1
    fi
    
    print_status "Installation verification completed!"
}

# Main installation process
main() {
    print_header "Starting JobFlow Installation Process"
    echo ""
    
    # System checks
    check_nodejs
    check_mongodb
    check_redis
    
    # Installation steps
    install_system_deps
    install_dependencies
    create_directories
    setup_environment
    generate_secrets
    setup_database
    verify_installation
    
    echo ""
    print_header "🎉 Installation Complete!"
    echo ""
    print_status "JobFlow has been successfully installed!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables in server/.env:"
    echo "   - Add your OpenAI API key"
    echo "   - Configure email settings for automation"
    echo "   - Set up MongoDB connection string"
    echo ""
    echo "2. Start the services:"
    echo "   - MongoDB: sudo systemctl start mongod (Linux) or brew services start mongodb-community (macOS)"
    echo "   - Redis: sudo systemctl start redis (Linux) or brew services start redis (macOS)"
    echo ""
    echo "3. Run the application:"
    echo "   - Development: npm run dev"
    echo "   - Server only: npm run server"
    echo "   - Client only: npm run client"
    echo ""
    echo "4. Access the application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000/api"
    echo ""
    print_warning "Don't forget to configure your API keys in server/.env before starting!"
    echo ""
    print_status "Happy job hunting with JobFlow! 🎯"
}

# Run main function
main "$@"