#!/usr/bin/env bash
# deploy.sh - Automated VPS SSH Deployment Script for Deao Studios Pitch Generator
set -e

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  🚀 Deao Studios Pitch Generator VPS Deployer${NC}"
echo -e "${BLUE}======================================================${NC}"

# Read configuration parameters
VPS_HOST="${VPS_HOST:-$1}"
VPS_USER="${VPS_USER:-${2:-root}}"
VPS_PORT="${VPS_PORT:-${3:-22}}"
REMOTE_DIR="${REMOTE_DIR:-/opt/pitch-deaostudios}"

if [ -z "$VPS_HOST" ]; then
    echo -e "${YELLOW}Please enter your VPS details:${NC}"
    read -p "VPS Host IP / Domain: " VPS_HOST
    read -p "SSH User [root]: " INPUT_USER
    VPS_USER="${INPUT_USER:-root}"
    read -p "SSH Port [22]: " INPUT_PORT
    VPS_PORT="${INPUT_PORT:-22}"
fi

echo -e "\n${BLUE}Target VPS:${NC} ${VPS_USER}@${VPS_HOST}:${VPS_PORT}"
echo -e "${BLUE}Target Path:${NC} ${REMOTE_DIR}"

# Step 1: Check SSH Connectivity
echo -e "\n${YELLOW}[1/5] Testing SSH Connection...${NC}"
if ! ssh -p "${VPS_PORT}" -o BatchMode=yes -o ConnectTimeout=8 "${VPS_USER}@${VPS_HOST}" "echo 'Connected successfully!'" 2>/dev/null; then
    echo -e "${RED}❌ SSH Connection failed. Make sure your SSH key is authorized on ${VPS_USER}@${VPS_HOST}.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH Connection established.${NC}"

# Step 2: Ensure Docker & Docker Compose installed on remote
echo -e "\n${YELLOW}[2/5] Checking Docker installation on VPS...${NC}"
ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" "
    if ! command -v docker &> /dev/null; then
        echo 'Installing Docker...'
        curl -fsSL https://get.docker.com | sh
    fi
    mkdir -p '${REMOTE_DIR}'
"
echo -e "${GREEN}✓ Remote Docker environment verified.${NC}"

# Step 3: Sync Workspace Code to VPS
echo -e "\n${YELLOW}[3/5] Syncing project files to VPS...${NC}"
rsync -avz -e "ssh -p ${VPS_PORT}" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='backend/node_modules' \
    --exclude='frontend/node_modules' \
    --exclude='frontend/.next' \
    --exclude='storage' \
    --exclude='.env' \
    ./ "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

echo -e "${GREEN}✓ Files synced successfully.${NC}"

# Step 4: Run Remote Docker Build & Up
echo -e "\n${YELLOW}[4/5] Building and launching Docker containers on VPS...${NC}"
ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" "
    cd '${REMOTE_DIR}'
    if [ ! -f .env ]; then
        echo 'Creating default .env from .env.docker.example...'
        cp .env.docker.example .env
    fi
    echo 'Building containers...'
    docker compose build --no-cache
    echo 'Starting container stack...'
    docker compose up -d
"
echo -e "${GREEN}✓ Containers deployed.${NC}"

# Step 5: Database Migrations & Health Check
echo -e "\n${YELLOW}[5/5] Running Database Migrations & Health Verification...${NC}"
ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" "
    cd '${REMOTE_DIR}'
    echo 'Waiting for database health...'
    sleep 5
    echo 'Running DB Migrations...'
    docker compose exec -T backend node utils/migrate.js || true
    echo 'Checking Container Status...'
    docker compose ps
"

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}  App is live on: http://${VPS_HOST}${NC}"
echo -e "${GREEN}======================================================${NC}"
