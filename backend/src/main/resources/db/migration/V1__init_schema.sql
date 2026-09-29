CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    cvss_score NUMERIC(3,1),
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Remediated', 'Accepted Risk')),
    discovered_date DATE NOT NULL,
    remediation_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(255) NOT NULL,
    owner VARCHAR(255),
    environment VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vulnerability_assets (
    vulnerability_id INTEGER REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    PRIMARY KEY (vulnerability_id, asset_id)
);
