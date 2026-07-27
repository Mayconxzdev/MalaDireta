# Mala Direta — n8n Email Operations Automation

[Português](README.md)

This repository documents an internal email-operations product I built: a browser-based interface for non-technical operators, backed by n8n workflows, PostgreSQL-backed Data Tables, scheduled delivery, SMTP, audit events and controlled error handling.

The public export is deliberately **inactive and sanitized**. Company identity, contacts, domains, credentials, IDs and operational records were replaced with examples. It is evidence of architecture and implementation, not a ready-to-send email tool.

## What the current public export demonstrates

| Capability | Implementation evidence |
|---|---|
| Operator-facing workflow | GET panel, POST action router and dedicated CSV export webhook |
| Durable delivery state | 9 domain Data Tables over PostgreSQL |
| Campaign safety | recipient-level state, deduplication, suppression and status revalidation before every send |
| Signature governance | versioned library, default restore, per-campaign choice and an immutable campaign snapshot |
| Dashboard reliability | stable aggregates rather than pagination over a changing queue |
| Failure isolation | separate Error Trigger workflow and audit records |
| Public-export safety | no active workflow, no n8n credential, no real record or internal reference |

The main workflow currently contains **158 nodes**: 72 Data Table nodes, 49 Code nodes, 3 public webhooks, 2 schedules and a `Split In Batches` secure delivery loop.

## Architecture

The panel is rendered by a GET webhook. Commands go through a POST action router; a dedicated GET endpoint exports CSV. The workflow stores contacts, groups, memberships, campaigns, recipient delivery state, settings, suppressions, errors and audit events. Scheduled triggers process delivery batches and cleanup. A separate Error Trigger workflow records technical failures.

See the full [Portuguese README](README.md), [architecture](docs/ARCHITECTURE.md), [case study](docs/CASE_STUDY.md), [test strategy](docs/TESTING.md), and [public setup](docs/DEPLOYMENT.md).

## Local validation

```powershell
npm ci
npm test
```

The validation compiles Code nodes, checks critical topology and routes, and blocks credentials, private addresses, local paths and internal identity from public exports.

Built by [Maycon Ferreira](https://github.com/Mayconxzdev) · [mayconxz00dev@gmail.com](mailto:mayconxz00dev@gmail.com)
