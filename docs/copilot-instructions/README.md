# BrainSAIT GitHub Copilot Instructions

## Quick Start

### 1. Setup
```bash
# Run the setup script
chmod +x scripts/setup-copilot.sh
./scripts/setup-copilot.sh
```

### 2. Validate
```bash
# Validate all instruction files
chmod +x scripts/validate-copilot.sh
./scripts/validate-copilot.sh
```

### 3. Test
1. Restart VS Code
2. Open GitHub Copilot Chat (Ctrl+Shift+I / Cmd+Shift+I)
3. Ask: "Create a FHIR patient resource for Sudan"
4. Verify it uses OID `1.3.6.1.4.1.61026.1.1`

## File Structure

```
.
├── .github/
│   ├── copilot-instructions.md      # Main global instructions
│   └── workflows/
│       └── validate-copilot.yml     # CI/CD validation
├── .instructions/
│   ├── fhir-instructions.md         # FHIR resource patterns
│   ├── ui-instructions.md           # UI component patterns
│   └── api-instructions.md          # API development patterns
├── AGENTS.md                        # AI agents configuration
├── scripts/
│   ├── setup-copilot.sh            # Setup automation
│   ├── validate-copilot.sh         # Validation script
│   └── update-copilot.sh           # Update script
└── docs/
    └── copilot-instructions/
        └── README.md                # This file
```

## BrainSAIT OID Namespace

**Base OID**: `1.3.6.1.4.1.61026`

### Country Branches
- **Sudan**: `1.3.6.1.4.1.61026.1`
  - Patients: `.1.1`
  - Providers: `.1.2`
  - Organizations: `.1.3`
  - Facilities: `.1.4`

- **Saudi Arabia**: `1.3.6.1.4.1.61026.2`
  - Patients: `.2.1`
  - Providers: `.2.2`
  - Organizations: `.2.3`
  - Facilities: `.2.4`

## Testing Copilot Instructions

### Test 1: FHIR Patient Creation
Ask Copilot:
```
Create a function to create a FHIR patient resource for a Sudanese patient
```

**Expected**: Function should:
- Use OID `urn:oid:1.3.6.1.4.1.61026.1.1`
- Include FHIR validation
- Have audit logging
- Support bilingual names

### Test 2: UI Component
Ask Copilot:
```
Create a glass card component following BrainSAIT design system
```

**Expected**: Component should:
- Use BrainSAIT colors
- Include glass morphism
- Support RTL/LTR
- Have bilingual text support

### Test 3: API Endpoint
Ask Copilot:
```
Create a FastAPI endpoint to retrieve patient data
```

**Expected**: Endpoint should:
- Include JWT authentication
- Have role-based access control
- Log all requests with audit trail
- Validate country-specific OID usage

## Customization

### Adding New Instructions
1. Create new file in `.instructions/`
2. Add frontmatter with `applyTo` patterns
3. Write your instructions
4. Run `./scripts/validate-copilot.sh`
5. Commit changes

### Updating OID Namespace
If BrainSAIT OID changes:
1. Update `.github/copilot-instructions.md`
2. Update `.instructions/fhir-instructions.md`
3. Update `AGENTS.md`
4. Run validation script
5. Update all code examples

## Troubleshooting

### Copilot Not Following Instructions
1. Verify file location: `.github/copilot-instructions.md` (exact path)
2. Check file encoding: UTF-8
3. Restart VS Code
4. Wait 30 seconds for initialization
5. Clear Copilot cache: `rm -rf ~/.config/github-copilot/`

### Instructions Not Applied
1. Check frontmatter syntax:
   ```yaml
   ---
   applyTo:
     - "**/*pattern*"
   ---
   ```
2. Verify glob patterns match your files
3. Restart VS Code

### OID Not Being Used
1. Run: `grep -r "1.3.6.1.4.1.61026" .github/ .instructions/`
2. Verify all instruction files contain BrainSAIT OID
3. Run validation: `./scripts/validate-copilot.sh`

## Maintenance

### Monthly Tasks
- [ ] Review and update code examples
- [ ] Check for new FHIR patterns
- [ ] Update security requirements
- [ ] Review agent configurations

### Quarterly Tasks
- [ ] Major instruction file review
- [ ] Update BrainSAIT design tokens
- [ ] Review OID namespace usage
- [ ] Team feedback integration

## Support

- **Documentation**: This folder
- **Issues**: Create GitHub issue with label `copilot-instructions`
- **OID Reference**: https://oid-base.com/get/1.3.6.1.4.1.61026

## Contributing

1. Create feature branch
2. Update instruction files
3. Run validation script
4. Create pull request
5. Request code review

---

**BrainSAIT OID**: `1.3.6.1.4.1.61026`
**Last Updated**: 2025-10-02
