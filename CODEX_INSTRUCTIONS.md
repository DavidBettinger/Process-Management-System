# Codex Instructions (Always-On)

## General
- Write all code, comments, and docs in English.
- Prefer small, PR-sized changes (30–90 minutes).
- Do not invent endpoints, tables, or fields beyond what is specified. If something is missing, add a `TODO:` and a short note in the relevant doc + code.
- Keep domain logic in the domain layer (no business rules in controllers).

## Coding Style
- Backend: Java 21, Spring Boot, Gradle, Checkstyle/Spotless (TODO if not configured yet), prefer records for DTOs.
- Frontend: Angular (latest LTS), TypeScript strict mode, ESLint + Prettier (TODO if not configured yet).
- Frontend styling: use Tailwind utility classes; never introduce new component `.css/.scss` files. Prefer shared Tailwind UI primitives in `frondend/src/app/shared/ui/tw` (page, card, field, badge, button directive). If Tailwind utilities are insufficient, use Tailwind config or a single global stylesheet section (no per-component CSS).
- For Angular SVG templates that use `[attr.*]` bindings (for example `x1`, `y1`, `d`, `transform`), add `<!--suppress HtmlUnknownAttribute -->` at the top of the template to silence IDE false positives. Keep `[attr.*]` bindings; do not rewrite them to `x="{{...}}"`/`y="{{...}}"` because this can trigger Angular `NG8002` compile errors on SVG elements.
- When changing HTML structure, update or add tests as needed.
- Frontend app layer (features/** and shared/**) uses RxJS end-to-end: stores return Observables, components subscribe with takeUntilDestroyed(), and async/await is not used.
- Frontend forms must use the shared helpers in `src/app/shared/forms/form-utils.ts` for required-field errors and invalid-state checks.
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
