#!/bin/bash

# Docker Setup Validation Script
# This script checks if all Docker services are properly configured and running

set -e

echo "========================================="
echo "  Aidvocacy Docker Setup Validation"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo -n "Checking Docker installation... "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    docker --version
else
    echo -e "${RED}✗${NC}"
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

echo ""

# Check if Docker Compose is installed
echo -n "Checking Docker Compose installation... "
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    docker-compose --version
else
    echo -e "${RED}✗${NC}"
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo ""

# Check if .env file exists
echo -n "Checking .env file... "
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "Warning: .env file not found. Creating from template..."
    if [ -f .env.docker.example ]; then
        cp .env.docker.example .env
        echo "Created .env from .env.docker.example"
        echo "Please edit .env with your configuration before running docker-compose up"
    else
        echo -e "${RED}✗${NC}"
        echo "Error: .env.docker.example not found"
        exit 1
    fi
fi

echo ""

# Validate environment variables
echo "Validating environment variables..."

required_vars=(
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_PHONE_NUMBER"
    "OPENAI_API_KEY"
)

missing_vars=0
for var in "${required_vars[@]}"; do
    echo -n "  - $var... "
    value=$(grep "^${var}=" .env | cut -d '=' -f2-)
    if [ -z "$value" ] || [[ "$value" == "your_"* ]]; then
        echo -e "${RED}✗${NC} (not configured)"
        missing_vars=$((missing_vars + 1))
    else
        echo -e "${GREEN}✓${NC}"
    fi
done

if [ $missing_vars -gt 0 ]; then
    echo -e "\n${YELLOW}Warning: $missing_vars required variable(s) not configured${NC}"
    echo "Please edit .env file with your actual credentials"
fi

echo ""

# Check if services are running
echo "Checking if services are running..."
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}Services are running${NC}"
    echo ""
    docker-compose ps

    echo ""
    echo "Testing service health endpoints..."

    # Test API health
    echo -n "  - API (http://localhost:3001/health)... "
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

    # Test Agent Service health
    echo -n "  - Agent Service (http://localhost:3002/health)... "
    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

    # Test Frontend
    echo -n "  - Frontend (http://localhost:3000/health)... "
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi

else
    echo -e "${YELLOW}Services are not running${NC}"
    echo "Run 'docker-compose up -d' to start services"
fi

echo ""
echo "========================================="
echo "  Validation Complete"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your credentials (if not done)"
echo "  2. Run: docker-compose up -d"
echo "  3. Access frontend: http://localhost:3000"
echo "  4. View logs: docker-compose logs -f"
echo ""
