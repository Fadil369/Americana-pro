-- BrainSAIT FHIR Database Initialization Script
-- Creates necessary extensions and initial configuration

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create BrainSAIT specific schemas
CREATE SCHEMA IF NOT EXISTS brainsait;

-- BrainSAIT OID Registry Table
CREATE TABLE IF NOT EXISTS brainsait.oid_registry (
    id SERIAL PRIMARY KEY,
    oid VARCHAR(255) UNIQUE NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert BrainSAIT OID namespaces
INSERT INTO brainsait.oid_registry (oid, country_code, resource_type, description) VALUES
    -- Sudan Branch (1.3.6.1.4.1.61026.1)
    ('1.3.6.1.4.1.61026.1.1', 'SD', 'Patient', 'Sudan Patient Identifiers'),
    ('1.3.6.1.4.1.61026.1.2', 'SD', 'Practitioner', 'Sudan Practitioner Identifiers'),
    ('1.3.6.1.4.1.61026.1.3', 'SD', 'Organization', 'Sudan Organization Identifiers'),
    ('1.3.6.1.4.1.61026.1.4', 'SD', 'Location', 'Sudan Facility/Location Identifiers'),
    ('1.3.6.1.4.1.61026.1.5', 'SD', 'Observation', 'Sudan Observation Identifiers'),

    -- Saudi Arabia Branch (1.3.6.1.4.1.61026.2)
    ('1.3.6.1.4.1.61026.2.1', 'SA', 'Patient', 'Saudi Arabia Patient Identifiers'),
    ('1.3.6.1.4.1.61026.2.2', 'SA', 'Practitioner', 'Saudi Arabia Practitioner Identifiers'),
    ('1.3.6.1.4.1.61026.2.3', 'SA', 'Organization', 'Saudi Arabia Organization Identifiers'),
    ('1.3.6.1.4.1.61026.2.4', 'SA', 'Location', 'Saudi Arabia Facility/Location Identifiers'),
    ('1.3.6.1.4.1.61026.2.5', 'SA', 'Observation', 'Saudi Arabia Observation Identifiers')
ON CONFLICT (oid) DO NOTHING;

-- Audit Log Table
CREATE TABLE IF NOT EXISTS brainsait.audit_log (
    id SERIAL PRIMARY KEY,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    operation VARCHAR(20),
    user_id VARCHAR(255),
    user_role VARCHAR(50),
    country_code VARCHAR(2),
    ip_address INET,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_data JSONB,
    response_status INTEGER
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oid_country ON brainsait.oid_registry(country_code);
CREATE INDEX IF NOT EXISTS idx_oid_resource ON brainsait.oid_registry(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON brainsait.audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON brainsait.audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON brainsait.audit_log(user_id);

-- Function to get OID for resource
CREATE OR REPLACE FUNCTION brainsait.get_oid(
    p_country_code VARCHAR(2),
    p_resource_type VARCHAR(50)
) RETURNS VARCHAR(255) AS $$
DECLARE
    v_oid VARCHAR(255);
BEGIN
    SELECT oid INTO v_oid
    FROM brainsait.oid_registry
    WHERE country_code = p_country_code
      AND resource_type = p_resource_type
      AND active = true
    LIMIT 1;

    RETURN v_oid;
END;
$$ LANGUAGE plpgsql;

-- Function to log FHIR operations
CREATE OR REPLACE FUNCTION brainsait.log_operation(
    p_resource_type VARCHAR(50),
    p_resource_id VARCHAR(255),
    p_operation VARCHAR(20),
    p_user_id VARCHAR(255),
    p_user_role VARCHAR(50),
    p_country_code VARCHAR(2),
    p_ip_address INET,
    p_request_data JSONB,
    p_response_status INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO brainsait.audit_log (
        resource_type,
        resource_id,
        operation,
        user_id,
        user_role,
        country_code,
        ip_address,
        request_data,
        response_status
    ) VALUES (
        p_resource_type,
        p_resource_id,
        p_operation,
        p_user_id,
        p_user_role,
        p_country_code,
        p_ip_address,
        p_request_data,
        p_response_status
    );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA brainsait TO fhiruser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA brainsait TO fhiruser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA brainsait TO fhiruser;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA brainsait TO fhiruser;

-- Create view for active OIDs
CREATE OR REPLACE VIEW brainsait.active_oids AS
SELECT
    country_code,
    resource_type,
    oid,
    description
FROM brainsait.oid_registry
WHERE active = true
ORDER BY country_code, resource_type;

GRANT SELECT ON brainsait.active_oids TO fhiruser;

COMMENT ON TABLE brainsait.oid_registry IS 'BrainSAIT OID namespace registry for FHIR resources';
COMMENT ON TABLE brainsait.audit_log IS 'Audit trail for all FHIR operations (HIPAA compliance)';
