# Codex Instructions (Always-On)

## General
- Write all code, comments, and docs in English.
- Prefer small, PR-sized changes (30–90 minutes).
- Do not invent endpoints, tables, or fields beyond what is specified. If something is missing, add a `TODO:` and a short note in the relevant doc + code.
- Keep domain logic in the domain layer (no business rules in controllers).

## Coding Style
- Backend: Java 21, Spring Boot, Gradle, Checkstyle/Spotless (TODO if not configured yet), prefer records for DTOs.
- Frontend: Angular (latest LTS), TypeScript strict mode, ESLint + Prettier (TODO if not configured yet).
- Use consistent naming:
    - REST paths: kebab-case
    - JSON fields: camelCase
    - IDs: UUID strings
- Keep functions small and testable.

## Testing Expectations
- Backend:
    - Unit tests for domain aggregates + state machines.
    - Controller tests for request validation + status codes.
    - Use Testcontainers for Postgres (later task).
- Frontend:
    - Component tests for key screens and empty/error states.
    - Service tests for API calls.

## Error Handling Rules
- Use a standard error envelope:
    - `code`, `message`, `details?`, `traceId`
- Validation errors return `400` with field-level details.
- Auth errors return `401`; permission errors return `403`.
- Not found returns `404`.
- Concurrency conflict returns `409` (TODO: if/when ETags are added).

## Documentation Rules
- Update `SPEC.md`, `ARCHITECTURE.md`, and `TASKS.md` when behavior changes.
- Add example request/response payloads for each endpoint.

## Security & Privacy
- Minimize personal data. Store only what is required for process management.
- Treat all attachments as sensitive. Access must be permission-checked.
- Never log sensitive payloads (minutes text can be sensitive).