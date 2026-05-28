# SOURCES.md

Research notes for each source and sample shape chosen.

SAP (chosen shape): CSV line-item export (common when extracting from FI/CO or MM modules). Typical fields: `posting_date`, `material`, `quantity`, `unit`, `plant_code`, `cost_center`, `vendor`.
What I learned: SAP exports vary widely; dates can be `DD.MM.YYYY` (German locales) or `YYYY-MM-DD`. Units are inconsistent (`L`, `LTR`, `ltr`). Plant codes are opaque and require mapping tables.

Utility (chosen shape): portal CSV of meter readings with `meter_id`, `start_date`, `end_date`, `reading`, `unit`, `bill_amount`.
What I learned: Billing periods do not align to calendar months; readings may be in MWh or kWh and require normalization. Tariff details and timezone can complicate aggregation.

Travel (chosen shape): CSV export from corporate travel tool containing `employee_id`, `trip_id`, `departure_airport`, `arrival_airport`, `distance_km` optional, `amount`.
What I learned: Distances are not always supplied. In production we would use IATA airport coordinates and compute great-circle distance when missing.

Sample data files: included in `samples/` (not committed in this prototype) — fabricated rows mimic the formats above to show normalization edge cases.

The sample datasets were intentionally kept small but realistic to keep the analyst workflow readable during demonstration and review.
