# Task Plan (MVP 1)

Each task chunk should fit into ~30–90 minutes.
For each task: objective, files to touch, definition of done, how to test.

---

## 0) Repo Setup

### [x] T0.1 Create mono-repo skeleton
**Objective:** Create `/backend` and `/frontend` folders, add root docs.
**Files:** (root) `SPEC.md`, `ARCHITECTURE.md`, `TASKS.md`, `CODEX_INSTRUCTIONS.md`, `.gitignore`, `README.md`
**DoD:** Repo builds are not required yet; docs exist.
**Test:** N/A

### [x] T0.2 Add basic .editorconfig and formatting config
**Objective:** Ensure consistent formatting across tools.
**Files:** `.editorconfig` (plus Prettier config later)
**DoD:** EditorConfig present.
**Test:** N/A

---

## 1) Backend — Spring Boot MVP

### [x] T1.1 Initialize Spring Boot project (Gradle)
**Objective:** Add folder Structure to the Spring Boot app with web + validation.
**Files:** `backend/build.gradle.kts`, `backend/src/main/...`
**DoD:** `./gradlew test` passes (even if only context loads).
**TODO:** Add Checkstyle/Spotless configuration for the backend build.
**Test:** Run backend tests.

### [x] T1.2 Implement domain model for ProcessCase
**Objective:** Add `ProcessCase` aggregate, statuses, stakeholder roles, invariants.
**Files:** `backend/.../casemanagement/domain/*`
**DoD:** Unit tests cover:
- activation requires at least one CONSULTANT
- adding stakeholders stores role
  **Test:** `./gradlew test`

### [x] T1.3 Implement domain model for Task state machine
**Objective:** Add `Task` aggregate with states + resolution kinds + transitions.
**Files:** `backend/.../collaboration/domain/task/*`
**DoD:** Unit tests cover:
- allowed transitions
- resolving sets resolution and becomes terminal
- declining assignment clears assignee and returns to OPEN
  **Test:** `./gradlew test`

### [x] T1.4 Add persistence (JPA) for cases, meetings, tasks
**Objective:** Map aggregates to tables.
**Files:** `backend/.../infrastructure/persistence/*`
**DoD:** App starts, basic repository operations tested with H2
**Test:** `./gradlew test`

### [x] T1.5 Implement Outbox events (minimal)
**Objective:** Persist domain events on writes in same transaction.
**Files:** `backend/.../common/outbox/*`
**DoD:** When creating/assigning/resolving tasks, an outbox row is written.
**Test:** Integration test verifies outbox row exists.

### [x] T1.6 Implement application services + REST controllers for P0 endpoints
**Objective:** Implement endpoints for cases, stakeholders, meetings hold, tasks operations, timeline.
**Files:** `backend/.../api/*`, `backend/.../application/*`
**DoD:** Controller tests:
- invalid payload returns 400
- not found returns 404
- unauthorized returns 401 (or dev auth rule)
  **Test:** `./gradlew test`

### [x] T1.7 Timeline projection (MVP)
**Objective:** Return ordered timeline entries for a case.
**Approach:** Start by querying outbox_events filtered by caseId and sorting by occurredAt.
**Files:** `backend/.../analytics/*`
**DoD:** GET timeline returns entries in correct order and types.
**Test:** Integration test for timeline endpoint.

### [x] T1.8 Add outbox events for meeting-held and meeting-created tasks
**Objective:** Emit outbox events when a meeting is held and when tasks are created from action items.
**Files:** `backend/.../collaboration/application/*`, `backend/.../common/outbox/*`
**DoD:** Outbox rows are written for meeting held and meeting task creation; integration tests verify rows.
**Test:** `./gradlew test`

### [x] T1.9 Add repository queries for meeting tasks by meeting ID
**Objective:** Query tasks created from a meeting via originMeetingId.
**Files:** `backend/.../collaboration/infrastructure/persistence/*`
**DoD:** Repository method returns tasks for a meeting; integration test verifies.
**Test:** `./gradlew test`

---

## 2) Frontend — Angular MVP

### [ ] T2.1 Initialize Angular app + routing + basic layout
**Objective:** Shell app with navigation: Cases, Timeline (in case view).
**Files:** `frontend/*`
**DoD:** `npm test` passes (or `ng test`).
**Test:** Run Angular tests and `ng serve`.

### [ ] T2.2 Cases list + create case screen
**Objective:** Create/list cases with empty/error states.
**Files:** `frontend/src/app/features/cases/*`
**DoD:** UI shows:
- empty state when no cases
- error state on 500
- success toast on create
  **Test:** Component tests + manual click-through.

### [ ] T2.3 Case detail screen (stakeholders + tasks)
**Objective:** Add tabs and basic task list.
**Files:** `frontend/src/app/features/cases/*`, `.../tasks/*`
**DoD:** Task list renders status, assignee, due date.
**Test:** Component tests.

### [ ] T2.4 Meeting hold screen (minutes + action items)
**Objective:** Hold meeting, create tasks from action items, show result.
**Files:** `frontend/src/app/features/meetings/*`
**DoD:** On save:
- success shows created task IDs
- failure shows error toast
  **Test:** Component tests + manual.

### [ ] T2.5 Timeline view
**Objective:** Display timeline entries.
**Files:** `frontend/src/app/features/timeline/*`
**DoD:** Timeline renders meeting/task events; handles empty and error.
**Test:** Component tests.

---

## 3) DevOps / Local Dev

### [ ] T3.1 Add docker-compose for Postgres (and Keycloak later)
**Objective:** Local environment for persistence.
**Files:** `docker-compose.yml`
**DoD:** `docker compose up` starts Postgres; backend connects.
**Test:** Start backend and perform a create case request.

---

## How to Test (Global)
- Backend: `cd backend && ./gradlew test && ./gradlew bootRun`
- Frontend: `cd frontend && npm install && npm test && npm start`
- Manual smoke:
    - Create case → add stakeholders → hold meeting with action items → resolve/decline task → view timeline
