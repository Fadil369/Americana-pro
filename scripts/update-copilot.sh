#!/bin/bash

# BrainSAIT Copilot Update Script
# Updates instruction files from templates while preserving customizations

set -e

echo "🔄 Updating GitHub Copilot instructions..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Backup existing files
BACKUP_DIR=".copilot-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}📦 Creating backup in $BACKUP_DIR...${NC}"
cp -r .github/copilot-instructions.md "$BACKUP_DIR/" 2>/dev/null || true
cp -r AGENTS.md "$BACKUP_DIR/" 2>/dev/null || true
cp -r .instructions "$BACKUP_DIR/" 2>/dev/null || true

echo ""
echo -e "${BLUE}Current BrainSAIT OID configuration:${NC}"
echo "Base: 1.3.6.1.4.1.61026"
echo "  - Sudan: .1"
echo "  - Saudi Arabia: .2"

echo ""
echo -e "${GREEN}✅ Backup complete!${NC}"
echo ""
echo "Backup created in: $BACKUP_DIR"
echo "Review changes and commit if satisfied."
