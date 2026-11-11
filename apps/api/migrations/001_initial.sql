-- Legal MX | PostgreSQL initial schema | no personal records or sample lawyers
-- Apply only to a controlled database. Future migrations should use a versioned migration runner.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE jurisdictions (
  id text PRIMARY KEY CHECK (id IN ('CDMX','EDOMEX')),
  name text NOT NULL
);
INSERT INTO jurisdictions (id,name) VALUES ('CDMX','Ciudad de México'),('EDOMEX','Estado de México');

CREATE TABLE specialties (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT ''
);
INSERT INTO specialties (id,name) VALUES
 ('familiar','Derecho familiar'),('laboral','Derecho laboral'),
 ('civil','Derecho civil'),('penal','Derecho penal'),
 ('inmobiliario','Derecho inmobiliario'),('mercantil','Derecho mercantil');

CREATE TABLE lawyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  professional_license text NOT NULL,
  license_verified_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','suspended')),
  public_bio text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lawyer_license_not_blank CHECK (length(trim(professional_license)) > 0)
);
CREATE UNIQUE INDEX ux_lawyer_license ON lawyer_profiles (professional_license);

CREATE TABLE lawyer_specialties (
  lawyer_id uuid NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  specialty_id text NOT NULL REFERENCES specialties(id),
  PRIMARY KEY(lawyer_id, specialty_id)
);
CREATE TABLE lawyer_jurisdictions (
  lawyer_id uuid NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  jurisdiction_id text NOT NULL REFERENCES jurisdictions(id),
  PRIMARY KEY(lawyer_id, jurisdiction_id)
);
CREATE INDEX idx_lawyers_status ON lawyer_profiles(status);
CREATE INDEX idx_lawyer_specialties_specialty ON lawyer_specialties(specialty_id);
CREATE INDEX idx_lawyer_jurisdictions_jurisdiction ON lawyer_jurisdictions(jurisdiction_id);

CREATE TABLE legal_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id text NOT NULL REFERENCES jurisdictions(id),
  title text NOT NULL,
  official_url text NOT NULL CHECK (official_url ~ '^https://'),
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','outdated')),
  verified_at timestamptz,
  effective_from date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Do not expose pending/unverified lawyer records or legal sources as authoritative.
