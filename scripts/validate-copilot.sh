#!/bin/bash

# BrainSAIT Copilot Validation Script
# Validates that all required instruction files exist and are properly formatted

set -e

echo "🔍 Validating GitHub Copilot instruction files..."

ERRORS=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check file exists
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}❌ Missing: $1${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ Found: $1${NC}"
    fi
}

# Function to check frontmatter in instruction files
check_frontmatter() {
    if [ -f "$1" ]; then
        if grep -q "^---$" "$1" && grep -q "^applyTo:" "$1"; then
            echo -e "${GREEN}✅ Valid frontmatter: $1${NC}"
        else
            echo -e "${YELLOW}⚠️  Missing or invalid frontmatter: $1${NC}"
            ((ERRORS++))
        fi
    fi
}

# Function to check OID usage
check_oid_usage() {
    if [ -f "$1" ]; then
        if grep -q "1.3.6.1.4.1.61026" "$1"; then
            echo -e "${GREEN}✅ BrainSAIT OID found in: $1${NC}"
        else
            echo -e "${YELLOW}⚠️  BrainSAIT OID not found in: $1${NC}"
        fi
    fi
}

echo ""
echo "Checking main files..."
check_file ".github/copilot-instructions.md"
check_file "AGENTS.md"

echo ""
echo "Checking instruction files..."
declare -a instructions=("fhir-instructions" "ui-instructions" "api-instructions")

for inst in "${instructions[@]}"; do
    file=".instructions/${inst}.md"
    check_file "$file"
    check_frontmatter "$file"
done

echo ""
echo "Checking OID namespace usage..."
check_oid_usage ".github/copilot-instructions.md"
check_oid_usage ".instructions/fhir-instructions.md"
check_oid_usage "AGENTS.md"

# Check for required sections in main copilot-instructions.md
if [ -f .github/copilot-instructions.md ]; then
    echo ""
    echo "Checking required sections in copilot-instructions.md..."

    declare -a required_sections=(
        "Project Overview"
        "OID Naming System"
        "Security & Compliance"
        "Core Principles"
    )

    for section in "${required_sections[@]}"; do
        if grep -q "## $section" .github/copilot-instructions.md; then
            echo -e "${GREEN}✅ Section found: $section${NC}"
        else
            echo -e "${RED}⚠️  Section missing: $section${NC}"
            ((ERRORS++))
        fi
    done
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All validation checks passed!${NC}"
    echo -e "${GREEN}BrainSAIT OID (1.3.6.1.4.1.61026) is properly configured${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation failed with $ERRORS error(s)${NC}"
    exit 1
fi
