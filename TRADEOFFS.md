# TRADEOFFS.md

This prototype intentionally prioritizes ingestion reliability, normalization visibility, and analyst review workflows over production-scale integrations.

1. PDF Parsing / OCR
Real utility invoices frequently arrive as PDFs, but robust OCR and table extraction introduces significant edge-case handling and parsing complexity. To keep the prototype focused and stable within the assignment timeline, ingestion was limited to CSV exports.

2. Production API Integrations
The prototype does not integrate directly with SAP APIs or corporate travel platforms such as Concur or Navan. These integrations require authentication management, pagination handling, schema mapping, and sandbox environments that were outside the scope of a 24-hour prototype.

3. Emissions Factor & Tariff Engine
The system focuses on ingestion, normalization, anomaly detection, and analyst review workflows. Full emissions-factor calculations and tariff reconciliation were intentionally deferred because they require domain-specific configuration and regulatory datasets.

4. Authentication & Role Management
The prototype uses a simplified analyst workflow without enterprise authentication or RBAC. This allowed development effort to remain focused on operational data ingestion and review flows.

