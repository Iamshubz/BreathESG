# Submission Summary — ESG Ingestion & Analyst Review Prototype

This file summarizes how the prototype maps to the grading rubric and provides concise talking points you can use in the post-submission review.

1) Data model quality (35%)
- What exists: `Tenant`, `SourceFile`, `RawRow`, `NormalizedRow`, `AuditLog` in `backend/core/models.py`.
- Strengths: preserves raw source (`RawRow`) for provenance; `NormalizedRow.normalized` stores canonical fields so downstream logic is decoupled from input variation; status + audit fields enable human-in-the-loop review and immutable `AuditLog` for actions.
- Limitations & next steps: prototype uses JSON fields for flexibility; production should replace some JSON blobs with explicit tables (`meters`, `plants`, `employees`) and add indexes and RLS for scale and correctness.

2) Defense of decisions (25%)
- CSV ingestion: chosen for highest common denominator across SAP/utility/travel exports; simplest repeatable evidence for an interviewer.
- Unit normalization: `UNIT_MAP` and conversion to canonical `reading_kwh`/`quantity_kwh` keeps computations consistent — explain tradeoff vs. full UoM library (faster prototype vs. full accuracy).
- Suspicious detection: implemented at normalization time (threshold rules) to ensure anomalies are flagged before analyst review — defends automation and separation of concerns.
- Storage: SQLite for prototype speed; justify with dev velocity and note migration path to PostgreSQL + object storage.

3) Handling realism per source (20%)
- SAP: modeled as line-item CSVs (dates normalization using `dateutil`); note SAP variability and omission of IDoc/BAPI integrations due to scope.
- Utility: meter-level readings with period boundaries; include unit variety (MWh/kWh) and edge-case handling (missing start/end).
- Travel: accepts provided `distance_km` or computes via IATA coords (distance fallback logic using airport mapping); this is realistic fallback behavior used in production when travel tools don't provide distances.
- Research evidence: differences in CSV locales, unit suffixes, and missing distances are common — documented in `SOURCES.md`.

4) Analyst UX (10%)
- UI features: upload card, KPI cards (Total/Approved/Rejected/Suspicious), formatted record cards, status actions (Approve/Reject). Files: `frontend/src/components/Upload.jsx`, `Dashboard.jsx`.
- Non-engineer friendliness: simple upload flow, clear badges, and a review-first workflow; suspicious rows are highlighted automatically.

5) What I chose not to build (10%)
- PDF/table OCR and robust bill parsing (not included — listed in `TRADEOFFS.md`).
- Real API connectors (SAP API, Concur/Navan) — deferred for auth and mapping complexity.
- Tariff / emissions factor engine and full mapping tables — out of MVP scope.

How to demonstrate quickly
- Start backend and frontend, then upload `samples/utility_sample.csv` and `samples/travel_sample.csv` through the UI. The dashboard should show total records and automatically-detected suspicious rows (2 suspicious rows added to samples).

Notes for post-submission talking points
- Emphasize data lineage: raw → normalized → audit trail.
- Emphasize pragmatic choices to maximize signal for reviewers (CSV input reproducibility, visible suspicious flags, analyst approval flow).
- Roadmap bullets: persist `suspicious` as indexed column, add RLS and tenancy isolation, add mapping import UI for plants/meters, add connectors and PDF parsing.

The prototype intentionally prioritizes workflow clarity and data lineage visibility over full enterprise-scale integrations.

---
Files of interest: `backend/core/models.py`, `backend/core/views.py`, `frontend/src/components/Dashboard.jsx`, `samples/`.

