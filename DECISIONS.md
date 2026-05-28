
# DECISIONS.md

1) Input format & ingestion
- Choice: CSV file upload for all sources (SAP/utility/travel).
- Why: CSV is the lowest-common-denominator export across enterprise systems and is easiest to reproduce reliably for reviewers. It lets us focus on normalization and validation logic instead of connector plumbing.

2) Normalization approach
- Strategy: parse CSV → `RawRow` (preserve original) → `NormalizedRow` (canonical fields).
- Rationale: separating raw and normalized data preserves provenance and makes normalization idempotent and auditable. Canonical fields (e.g., `reading_kwh`) enable consistent downstream metrics.
- Strategy: parse CSV → `RawRow` (preserve original) → `NormalizedRow` (canonical fields).
- Rationale: separating raw and normalized data preserves provenance and allows normalization jobs to be safely reprocessed without losing source traceability. Canonical fields (e.g., `reading_kwh`) enable consistent downstream metrics.

3) Validation & anomaly detection
- Implemented: lightweight validation and deterministic anomaly rules applied during normalization (threshold rules such as `reading_kwh > 10000` or `distance_km > 20000` set `suspicious: true`).
- Rationale: Suspicious records are flagged during ingestion so analysts can review anomalies before they affect downstream reporting workflows.

4) Storage & speed tradeoffs
- Prototype: SQLite + JSONFields for speed of iteration.
- Production path: migrate to PostgreSQL, add typed columns for high-use fields, add indexes, and use object storage for file blobs. This balances developer velocity with eventual operational requirements.

5) UX & workflow decisions
- Human-in-the-loop: analysts review & approve/reject `NormalizedRow` entries; approvals write `approved_at` and `approved_by` and are logged in `AuditLog`.
- Why: many edge-cases require human judgment (e.g., billing corrections, meter merges). This flow keeps automation where safe and human oversight where necessary.

6) Deliberate omissions (scope decisions)
- No PDF/OCR bill parsing — out of scope for a 24-hour prototype because it adds substantial edge-case handling.
- No production connectors for SAP/Concur — reduces auth and pagination complexity for the prototype.
- No tariff/emissions-factor engine — that is a separate bounded problem requiring domain inputs.

Questions to prepare for in an interview
- Which thresholds did you choose and why? (Answer: The thresholds were intentionally conservative to ensure suspicious examples appeared clearly during the demo workflow. In production, these thresholds would be configurable and potentially replaced by statistical anomaly detection models.)
- How would you make normalization jobs safely reprocessed? (Answer: include a deterministic hash of raw row + source_file and use upsert semantics, plus jobs that can re-run normalization against stored `RawRow` while preserving source traceability.)
- How to scale validations? (Answer: background workers, schema migration to typed columns, and precomputed search indexes for flagged records.)

Files: `backend/core/views.py` (normalization), `backend/core/models.py` (data model), `samples/` (demo CSVs).

