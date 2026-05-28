## Model Summary

Concise description of the prototype data model, rationale, and where it intentionally trades completeness for speed.

Core entities

- `Tenant` — optional tenant record to scope data (name, slug). Enables multi-tenancy in a small proof-of-concept.
- `SourceFile` — metadata for each uploaded file (`source_type`, `filename`, `uploaded_at`, `tenant`). Preserves ingestion provenance.
- `RawRow` — raw row payload stored as JSON. Keeps original headers/values for reproducibility and audit.
- `NormalizedRow` — canonical, analyst-facing row. Key fields:
  - relations: `tenant`, `source_file`, `raw_row`
  - `source_type` (sap|utility|travel)
  - `normalized` (JSON): canonical fields used for calculations (examples: `reading_kwh`, `quantity_kwh`, `distance_km`, `suspicious`)
  - review fields: `status` (PENDING/APPROVED/REJECTED), `received_at`, `approved_at`, `approved_by`
- `AuditLog` — append-only action log (object_type, object_id, action, actor, timestamp, details).

Design rationale (traceability, speed, clarity)

- Traceability first: every normalized row points to its `RawRow` and `SourceFile`. This makes it trivial to reconstruct or rerun normalization for an auditor.
- Flexible normalization: enterprise systems export operational data in inconsistent formats, so the prototype stores normalized fields in a JSON structure during ingestion. This allowed rapid iteration while maintaining a consistent analyst-facing schema across SAP, utility, and travel sources.
- Human-in-the-loop review: `status` + `AuditLog` provide the minimal audit surface required by the assignment: an analyst can approve/reject with timestamps and actor metadata.

The prototype prioritizes traceability and analyst review workflows over strict relational completeness during the initial ingestion phase.

Validation & derived fields

- Unit normalization: incoming consumption/quantity units are converted to canonical units (kWh equivalents) inside normalization.
- Basic validation and automatic anomaly flagging are added at normalization time (e.g., `suspicious` boolean) so analysts only see flagged items for review.

Production scalability considerations

- Promote frequently-queried `normalized` fields (e.g., `reading_kwh`, `suspicious`) to explicit model columns with proper types and indexes for performance and filtering.
- Replace ad-hoc JSON blobs with normalized reference tables for `meters`, `plants`, and `employees` to enforce referential integrity and enable richer joins.
- Use PostgreSQL with row-level security (RLS) and object storage for uploaded files; add background workers for heavy normalization tasks and design jobs so normalization can be safely reprocessed against stored raw rows.

Files: `backend/core/models.py` contains the canonical implementation.

Talking points for interview

- Emphasize provenance: raw → normalized → audit. This is the key property reviewers look for when judging data model quality.
- Explain pragmatic tradeoffs: JSONField for fast iteration vs structured schema for long-term correctness and queries.
- Note migration path: show how to add explicit columns and run migrations once field usage stabilizes.
