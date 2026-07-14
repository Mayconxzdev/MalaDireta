# Mala Direta — n8n Email Campaign Automation

[Português](README.md)

This repository documents a real internal product I built to replace manual bulk-email work with a browser-based operation: message editing, contact management, campaigns, scheduled batches, deduplication, suppression, SMTP delivery, audit events and error handling.

The public version preserves the production workflow topology while removing credentials, internal addresses and customer data. Screenshots come from the running interface with visible records replaced by fictional examples.

## Production snapshot

| Metric | Value |
|---|---:|
| Main workflow nodes | 147 |
| Data Table nodes | 67 |
| Code nodes | 46 |
| Production webhooks | 3 |
| Domain Data Tables | 9 |
| Migrated contacts | 997 |
| Suppressed invalid contacts | 20 |
| Preserved historical events | 1,522 |

## Architecture

The panel is rendered by a GET webhook. User commands go through a POST action router, and CSV export has a dedicated GET webhook. PostgreSQL-backed n8n Data Tables store contacts, groups, memberships, campaigns, recipients, settings, suppressions, errors and events. Scheduled triggers process campaign batches and attachment cleanup. A separate Error Trigger workflow records operational failures.

See the [full Portuguese README](README.md), [architecture](docs/ARCHITECTURE.md), [case study](docs/CASE_STUDY.md), and [test strategy](docs/TESTING.md).

## Local validation

```powershell
npm ci
npm test
```

The portfolio exports are intentionally inactive and contain no SMTP credentials. Data Table identifiers are placeholders and must be rebound after import.

Built by [Mayconxzdev](https://github.com/Mayconxzdev) · [mayconxz00dev@gmail.com](mailto:mayconxz00dev@gmail.com)
