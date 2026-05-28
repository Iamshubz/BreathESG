# Breathe ESG — Prototype

Project Overview

This prototype simulates an ESG operational data ingestion and analyst review workflow for enterprise sustainability reporting.

The system accepts CSV exports from SAP procurement systems, utility billing platforms, and corporate travel tools, normalizes inconsistent operational data into a unified schema, automatically flags suspicious records, and supports an analyst approval workflow with audit logging.

Features

- CSV ingestion for SAP, utility, and travel sources
- Normalization pipeline for inconsistent enterprise exports
- Automatic suspicious/anomaly detection during ingestion
- Analyst review dashboard with approve/reject actions
- Audit trail metadata for each approval action
- Multi-source operational data handling with raw preservation

Architecture Flow

Upload CSV
↓
Raw row preservation
↓
Normalization pipeline
↓
Validation & suspicious detection
↓
Analyst review dashboard
↓
Approval / rejection workflow
↓
Audit logging

Tech Stack

Frontend:
- React
- Vite
- TailwindCSS

Backend:
- Django
- Django REST Framework
- SQLite (prototype)

Why CSV?

CSV ingestion was intentionally selected because enterprise operational systems commonly export reporting data in CSV format. This allowed the prototype to focus on normalization and analyst workflows rather than authentication-heavy API integrations.

See `MODEL.md`, `DECISIONS.md`, `TRADEOFFS.md`, and `SOURCES.md` for design details and rationale.
