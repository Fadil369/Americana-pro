#!/bin/bash

# BrainSAIT FHIR Server Test Script

set -e

echo "🧪 Testing BrainSAIT FHIR Server..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

FHIR_BASE="http://localhost:8080/fhir"
FAILED_TESTS=0

# Test function
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="${3:-200}"

    echo -e "${BLUE}Testing: $test_name${NC}"

    if eval "$command"; then
        echo -e "${GREEN}✅ PASSED${NC}\n"
    else
        echo -e "${RED}❌ FAILED${NC}\n"
        ((FAILED_TESTS++))
    fi
}

echo ""
echo "=== BrainSAIT FHIR Server Tests ==="
echo ""

# Test 1: Server Metadata
run_test "Server Metadata" \
    "curl -sf ${FHIR_BASE}/metadata | jq -e '.fhirVersion == \"4.0.1\"' > /dev/null"

# Test 2: Create Sudan Patient
echo -e "${BLUE}Creating Sudan Patient with BrainSAIT OID...${NC}"
PATIENT_SD=$(cat <<EOF
{
  "resourceType": "Patient",
  "identifier": [{
    "system": "urn:oid:1.3.6.1.4.1.61026.1.1",
    "value": "SD123456789"
  }],
  "name": [{
    "given": ["Ahmad"],
    "family": "Hassan",
    "use": "official"
  }],
  "gender": "male",
  "birthDate": "1990-01-15"
}
EOF
)

RESPONSE_SD=$(curl -sf -X POST "${FHIR_BASE}/Patient" \
    -H "Content-Type: application/fhir+json" \
    -d "$PATIENT_SD")

if echo "$RESPONSE_SD" | jq -e '.id' > /dev/null 2>&1; then
    PATIENT_SD_ID=$(echo "$RESPONSE_SD" | jq -r '.id')
    echo -e "${GREEN}✅ Sudan Patient created: $PATIENT_SD_ID${NC}"
    echo -e "   OID: 1.3.6.1.4.1.61026.1.1\n"
else
    echo -e "${RED}❌ Failed to create Sudan Patient${NC}\n"
    ((FAILED_TESTS++))
fi

# Test 3: Create Saudi Patient
echo -e "${BLUE}Creating Saudi Patient with BrainSAIT OID...${NC}"
PATIENT_SA=$(cat <<EOF
{
  "resourceType": "Patient",
  "identifier": [{
    "system": "urn:oid:1.3.6.1.4.1.61026.2.1",
    "value": "SA987654321"
  }],
  "name": [{
    "given": ["Mohammed"],
    "family": "AlRashid",
    "use": "official"
  }],
  "gender": "male",
  "birthDate": "1985-06-20"
}
EOF
)

RESPONSE_SA=$(curl -sf -X POST "${FHIR_BASE}/Patient" \
    -H "Content-Type: application/fhir+json" \
    -d "$PATIENT_SA")

if echo "$RESPONSE_SA" | jq -e '.id' > /dev/null 2>&1; then
    PATIENT_SA_ID=$(echo "$RESPONSE_SA" | jq -r '.id')
    echo -e "${GREEN}✅ Saudi Patient created: $PATIENT_SA_ID${NC}"
    echo -e "   OID: 1.3.6.1.4.1.61026.2.1\n"
else
    echo -e "${RED}❌ Failed to create Saudi Patient${NC}\n"
    ((FAILED_TESTS++))
fi

# Test 4: Search Patients
if [ ! -z "$PATIENT_SD_ID" ]; then
    run_test "Retrieve Sudan Patient" \
        "curl -sf ${FHIR_BASE}/Patient/${PATIENT_SD_ID} | jq -e '.resourceType == \"Patient\"' > /dev/null"
fi

if [ ! -z "$PATIENT_SA_ID" ]; then
    run_test "Retrieve Saudi Patient" \
        "curl -sf ${FHIR_BASE}/Patient/${PATIENT_SA_ID} | jq -e '.resourceType == \"Patient\"' > /dev/null"
fi

# Test 5: Search by Identifier
run_test "Search by Sudan OID" \
    "curl -sf '${FHIR_BASE}/Patient?identifier=urn:oid:1.3.6.1.4.1.61026.1.1|SD123456789' | jq -e '.entry | length > 0' > /dev/null"

run_test "Search by Saudi OID" \
    "curl -sf '${FHIR_BASE}/Patient?identifier=urn:oid:1.3.6.1.4.1.61026.2.1|SA987654321' | jq -e '.entry | length > 0' > /dev/null"

# Test 6: Create Observation (Lab Result)
if [ ! -z "$PATIENT_SD_ID" ]; then
    echo -e "${BLUE}Creating Observation for Sudan Patient...${NC}"
    OBSERVATION=$(cat <<EOF
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "2345-7",
      "display": "Glucose"
    }]
  },
  "subject": {
    "reference": "Patient/${PATIENT_SD_ID}"
  },
  "valueQuantity": {
    "value": 95,
    "unit": "mg/dL",
    "system": "http://unitsofmeasure.org"
  }
}
EOF
    )

    OBS_RESPONSE=$(curl -sf -X POST "${FHIR_BASE}/Observation" \
        -H "Content-Type: application/fhir+json" \
        -d "$OBSERVATION")

    if echo "$OBS_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Observation created${NC}\n"
    else
        echo -e "${RED}❌ Failed to create Observation${NC}\n"
        ((FAILED_TESTS++))
    fi
fi

# Test 7: Validate FHIR Resource
run_test "FHIR Validation Endpoint" \
    "curl -sf -X POST '${FHIR_BASE}/Patient/\$validate' \
        -H 'Content-Type: application/fhir+json' \
        -d '{\"resourceType\":\"Patient\"}' | jq -e '.resourceType == \"OperationOutcome\"' > /dev/null"

# Summary
echo ""
echo "================================"
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "BrainSAIT FHIR Server is working correctly with:"
    echo "  - Sudan OID: 1.3.6.1.4.1.61026.1"
    echo "  - Saudi OID: 1.3.6.1.4.1.61026.2"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $FAILED_TESTS test(s) failed${NC}"
    exit 1
fi
