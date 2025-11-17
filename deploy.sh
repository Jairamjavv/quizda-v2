#!/bin/bash

# Quizda Deployment Script
# Usage: ./deploy.sh [client|server|all] [--skip-build]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse arguments
TARGET=${1:-all}
SKIP_BUILD=${2:-}

echo -e "${BLUE}🚀 Quizda Deployment Script${NC}"
echo -e "${BLUE}Target: $TARGET${NC}\n"

# Deploy Server
deploy_server() {
    echo -e "${GREEN}📦 Building Server...${NC}"
    cd server
    
    if [ "$SKIP_BUILD" != "--skip-build" ]; then
        npm run build:worker
    else
        echo "Skipping build..."
    fi
    
    echo -e "${GREEN}☁️  Deploying Server to Cloudflare Workers...${NC}"
    npx wrangler deploy --env production
    
    echo -e "${GREEN}✅ Server deployed successfully!${NC}\n"
    cd ..
}

# Deploy Client
deploy_client() {
    echo -e "${GREEN}📦 Building Client...${NC}"
    cd client
    
    if [ "$SKIP_BUILD" != "--skip-build" ]; then
        npm run build
    else
        echo "Skipping build..."
    fi
    
    echo -e "${GREEN}☁️  Deploying Client to Cloudflare Pages...${NC}"
    npx wrangler pages deploy dist --project-name quizda-v2-client --branch main
    
    echo -e "${GREEN}✅ Client deployed successfully!${NC}\n"
    cd ..
}

# Main deployment logic
case $TARGET in
    server)
        deploy_server
        ;;
    client)
        deploy_client
        ;;
    all)
        deploy_server
        deploy_client
        ;;
    *)
        echo -e "${RED}❌ Invalid target: $TARGET${NC}"
        echo "Usage: ./deploy.sh [client|server|all] [--skip-build]"
        exit 1
        ;;
esac

echo -e "${BLUE}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}Frontend: https://quizda-v2-client.pages.dev${NC}"
echo -e "${BLUE}Backend:  https://quizda-worker-prod.b-jairam0512.workers.dev${NC}"
