#!/bin/bash

# BrainSAIT Copilot Setup Script
# Automates the setup of GitHub Copilot instructions

set -e

echo "🚀 Setting up BrainSAIT GitHub Copilot instructions..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in git repo
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Create directories
echo -e "${BLUE}Creating directory structure...${NC}"
mkdir -p .github
mkdir -p .instructions
mkdir -p scripts
mkdir -p docs/copilot-instructions
mkdir -p templates

# Check if files already exist
if [ -f .github/copilot-instructions.md ]; then
    echo -e "${YELLOW}⚠️  copilot-instructions.md already exists${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✓ Will update copilot-instructions.md${NC}"
    else
        echo "Skipping copilot-instructions.md"
    fi
else
    echo -e "${GREEN}✓ Will create copilot-instructions.md${NC}"
fi

# Check AGENTS.md
if [ -f AGENTS.md ]; then
    echo -e "${YELLOW}⚠️  AGENTS.md already exists${NC}"
else
    echo -e "${GREEN}✓ Will create AGENTS.md${NC}"
fi

# Check instruction files
declare -a instructions=("fhir-instructions" "ui-instructions" "api-instructions")

for inst in "${instructions[@]}"; do
    target=".instructions/${inst}.md"
    if [ ! -f "$target" ]; then
        echo -e "${GREEN}✓ Will create ${inst}.md${NC}"
    else
        echo -e "${YELLOW}⚠️  ${inst}.md already exists, skipping${NC}"
    fi
done

# Git add
echo -e "${BLUE}Adding files to git...${NC}"
git add .github/copilot-instructions.md AGENTS.md .instructions/*.md 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review and customize the instruction files"
echo "2. Commit the changes: git commit -m 'Add GitHub Copilot instructions'"
echo "3. Push to remote: git push"
echo "4. Restart VS Code to load the instructions"
echo ""
echo -e "${BLUE}BrainSAIT OID Namespace: 1.3.6.1.4.1.61026${NC}"
echo "  - Sudan: .1"
echo "  - Saudi Arabia: .2"
