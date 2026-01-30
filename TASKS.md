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


### [x] B1 Add Location domain model + persistence (Address as Value Object)
**Objective:** Introduce a Location model with an Address object and persist it in PostgreSQL.
**Files to touch:**
- `backend/src/main/java/.../common/domain/Address.java` (new, Value Object)
- `backend/src/main/java/.../common/domain/LocationId.java` (new, UUID wrapper or use UUID)
- `backend/src/main/java/.../common/domain/Location.java` (new)
- `backend/src/main/java/.../common/infrastructure/persistence/LocationEntity.java` (new)
- `backend/src/main/java/.../common/infrastructure/persistence/LocationRepository.java` (new)
- DB migration: `backend/src/main/resources/db/migration/Vxxx__create_locations.sql` (Flyway/Liquibase)
  **Model (minimum fields):**
- Location: `id`, `label` (e.g., "Kita Sonnenblume"), `address`
- Address: `street`, `houseNumber`, `postalCode`, `city`, `country` (default "DE" if omitted)
  **Definition of done:**
- Locations table exists; repository can save/load.
- Unit test verifies Address equality/immutability and Location creation.
  **How to test:**
- `./gradlew test`

---

### [x] B2 Add Kita domain model (name + locationId) + persistence
**Objective:** Add `Kita` as a first-class entity referencing a Location.
**Files to touch:**
- `backend/src/main/java/.../casemanagement/domain/Kita.java` (new)
- `backend/src/main/java/.../casemanagement/domain/KitaId.java` (new)
- `backend/src/main/java/.../casemanagement/infrastructure/persistence/KitaEntity.java` (new)
- `backend/src/main/java/.../casemanagement/infrastructure/persistence/KitaRepository.java` (new)
- DB migration: `Vxxx__create_kitas.sql`
  **Model (minimum fields):**
- `id`, `tenantId`, `name`, `locationId`
  **Invariants:**
- name must not be blank
- locationId must exist (validated in application layer)
  **Definition of done:**
- Kita table exists; repository works.
- Tests verify saving Kita requires non-empty name.
  **How to test:**
- `./gradlew test`

---

### [x] B3 Implement Location API endpoints (CRUD-lite)
**Objective:** Provide backend endpoints to create and list Locations for the tenant.
**Files to touch:**
- `backend/src/main/java/.../common/api/locations/LocationsController.java` (new)
- `backend/src/main/java/.../common/application/LocationService.java` (new)
- `backend/src/main/java/.../common/api/locations/dto/*` (new)
- Update `ARCHITECTURE.md` API section with examples
  **Endpoints (minimum):**
- `POST /api/locations` (create)
- `GET /api/locations` (list)
- `GET /api/locations/{locationId}` (detail) (optional but recommended)
  **Request example:**
```json
{
  "label": "Kita Sonnenblume",
  "address": {
    "street": "Musterstraße",
    "houseNumber": "12",
    "postalCode": "10115",
    "city": "Berlin",
    "country": "DE"
  }
}
```
Definition of done:
	•	Validation errors return 400 with field details.
	•	Tenant isolation enforced (location belongs to tenant).
	•	Controller tests cover 201 + 400.
How to test:
	•	./gradlew test
---
[x] B4 Implement Kita API endpoints (create + list + detail)

Objective: Provide endpoints to create and list Kitas (name + locationId).
Files to touch:
	•	backend/src/main/java/.../casemanagement/api/kitas/KitasController.java (new)
	•	backend/src/main/java/.../casemanagement/application/KitaService.java (new)
	•	backend/src/main/java/.../casemanagement/api/kitas/dto/* (new)
	•	Update ARCHITECTURE.md API section with examples
Endpoints (minimum):
	•	POST /api/kitas
	•	GET /api/kitas
	•	GET /api/kitas/{kitaId} (recommended)
Request example:
```json
{ "name": "Kita Sonnenblume", "locationId": "uuid" }
```
Rules:
•	On create: verify locationId exists for tenant; else 400/404 (choose one and document).
Definition of done:
•	Controller tests cover:
•	creating a Kita with valid locationId returns 201
•	invalid/missing locationId returns 400 (or 404, consistently)
How to test:
•	./gradlew test
---
[x] B5 Update ProcessCase to reference Kita (kitaId) instead of free-text kitaName

Objective: Replace kitaName in ProcessCase creation with kitaId, enabling consistent location/name usage.
Files to touch:
•	backend/src/main/java/.../casemanagement/domain/ProcessCase.java (update)
•	backend/src/main/java/.../casemanagement/api/cases/dto/* (update)
•	backend/src/main/java/.../casemanagement/application/CaseService.java (update validation)
•	Persistence entity/migration for cases table (add kita_id, migrate data if needed)
•	Update SPEC.md + ARCHITECTURE.md examples
API change:
•	POST /api/cases request becomes:
```json
{ "title": "Introduce Child Protection Concept", "kitaId": "uuid" }
```
Definition of done:
•	Case creation validates kitaId exists in tenant.
•	Existing tests updated; new tests cover invalid kitaId.
How to test:
•	./gradlew test
---
[x] B6 Add Meeting.locationId and ensure meetings can be identified by date + location

Objective: Add locationId to Meeting (scheduled/held) and store it for UI identification.
Files to touch:
•	backend/src/main/java/.../collaboration/domain/Meeting.java (update)
•	backend/src/main/java/.../collaboration/api/meetings/dto/* (update)
•	backend/src/main/java/.../collaboration/application/MeetingService.java (update)
•	Meeting persistence migration (meetings.location_id)
•	Domain events: extend MeetingHeld payload to include locationId (and scheduled meeting event if present)
•	Update ARCHITECTURE.md endpoint examples for meeting schedule/hold
API changes (minimum):
•	POST /api/cases/{caseId}/meetings includes locationId
•	POST /api/cases/{caseId}/meetings/{meetingId}/hold includes locationId (or inherits from scheduled meeting; pick one and document)
Rule (recommended for MVP):
•	Default meeting location = case’s Kita location (server can fill if request omits).
If you implement defaulting, document it and test it.
Definition of done:
•	Meeting schedule/hold persists locationId.
•	Controller tests verify:
•	invalid locationId rejected
•	returned meeting DTO includes locationId
How to test:
•	./gradlew test

---

[x] B7 Update timeline endpoint to include location information for meeting entries (minimal)

Objective: Ensure timeline entries for meetings include locationId so frontend can resolve it.
Files to touch:
•	backend/src/main/java/.../analytics/application/TimelineService.java (or projector)
•	backend/src/main/java/.../analytics/api/dto/*
Definition of done:
•	Timeline response for meeting entries includes locationId.
How to test:
•	Integration test for /api/cases/{id}/timeline includes locationId for meeting entries.
---
## 2) Frontend — Angular MVP
Important for the frontend: all Angular modules must be in a separate folder. 
Cases should be named process in the ui and the text of the UI must be in German. 
But only the text that the user sees, the rest stays in english.
Readmes should also be in english.
Always make sure that the frontend matches the backend (API calls and DTOs)
Make sure that you don't use deprecated features!

## Frontend — Angular MVP (Codex Tasks)

### [x] T2.0 Establish frontend architecture conventions (feature + core)
**Objective:** Create a clean folder structure and coding conventions for features, core services, shared UI.
**Files to touch:**
- `frontend/src/app/core/` (create)
- `frontend/src/app/shared/` (create)
- `frontend/src/app/features/` (create)
- `frontend/src/app/app.routes.ts` (or routing module)
  **Definition of done:**
- Folder structure exists and is referenced in `ARCHITECTURE.md` (optional).
- Routing skeleton compiles.
  **How to test:**
- `ng serve` starts without errors.

---

### [x] T2.1 Create frontend model classes matching backend contracts (DTOs)
**Objective:** Add TypeScript models/interfaces aligned with backend JSON for Case, Stakeholder, Meeting, Task, Timeline.
**Files to touch:**
- `frontend/src/app/core/models/`:
  - `case.model.ts`
  - `stakeholder.model.ts`
  - `meeting.model.ts`
  - `task.model.ts`
  - `timeline.model.ts`
  - `api-error.model.ts`
    **Include:**
- Enums as union types or `enum`:
  - `CaseStatus`, `RoleInCase`
  - `TaskState`, `TaskResolutionKind`
  - `MeetingStatus`
  - `TimelineEntryType`
- Request/response DTO types:
  - `CreateCaseRequest`, `CreateCaseResponse`
  - `AddStakeholderRequest`
  - `HoldMeetingRequest`, `HoldMeetingResponse`
  - `CreateTaskRequest`, `AssignTaskRequest`, `DeclineTaskRequest`, `ResolveTaskRequest`
    **Definition of done:**
- Models compile; naming matches backend JSON fields (camelCase).
- Includes 1–2 example objects in comments (optional).
  **How to test:**
- `ng test` (or `npm test`) passes, TypeScript build has no errors.

---

### [x] T2.2 Create a typed API client service layer (HTTP wrappers)
**Objective:** Create Angular services that map 1:1 to backend endpoints with typed requests/responses.
**Files to touch:**
- `frontend/src/app/core/api/`:
  - `api.config.ts` (base URL + default headers)
  - `cases.api.ts`
  - `meetings.api.ts`
  - `tasks.api.ts`
  - `analytics.api.ts`
    **Rules:**
- No business logic here—only HTTP calls + typing.
- Centralize base path `/api`.
  **Definition of done:**
- Services expose methods like:
  - `createCase()`, `getCase()`, `addStakeholder()`, `activateCase()`
  - `scheduleMeeting()`, `holdMeeting()`
  - `createTask()`, `assignTask()`, `startTask()`, `blockTask()`, `unblockTask()`, `declineTask()`, `resolveTask()`
  - `getTimeline()`
    **How to test:**
- Basic service tests using Angular HttpTestingController.

---

### [x] T2.3 Implement global error handling + standard API error mapping
**Objective:** Convert backend error envelope into user-friendly UI errors and dev-friendly logs.
**Files to touch:**
- `frontend/src/app/core/http/api-error.interceptor.ts`
- `frontend/src/app/core/errors/error-mapper.ts`
- `frontend/src/app/core/models/api-error.model.ts` (if not already)
  **Definition of done:**
- Interceptor catches non-2xx and returns normalized error object.
- Console logging does not print sensitive fields.
  **How to test:**
- Unit tests for error mapper; interceptor test ensures 400/404/500 handled.

---

### [x] T2.4 Implement Angular Signals State Management Stores (MVP standard)

**Objective:** Implement a consistent, signal-based state management layer (stores) for the MVP, aligned with the backend API and the typed API client services.

---

## Scope (what to build in this task)

Create:
1) Shared state types (`LoadStatus`, `StoreError`, `EntityState`, `ListState`)
2) Feature stores using Angular Signals:
  - `CasesStore` (case list + create)
  - `CaseDetailStore` (case detail + add stakeholder + activate)
  - `TasksStore` (tasks list + task actions)
  - `TimelineStore` (timeline load)
  - `MeetingsStore` (hold meeting + optional meeting list)

Also create:
- Minimal `DevSessionService` that exposes `userId` and `tenantId` as signals for dev-only UI and action rules.

---

## Files to touch / create

### Shared state
- `frontend/src/app/core/state/state.types.ts`

### Dev session (dev-only identity)
- `frontend/src/app/core/auth/dev-session.service.ts`

### Stores
- `frontend/src/app/features/cases/state/cases.store.ts`
- `frontend/src/app/features/case-detail/state/case-detail.store.ts`
- `frontend/src/app/features/tasks/state/tasks.store.ts`
- `frontend/src/app/features/timeline/state/timeline.store.ts`
- `frontend/src/app/features/meetings/state/meetings.store.ts`

### Store tests
- `frontend/src/app/features/cases/state/cases.store.spec.ts`
- `frontend/src/app/features/case-detail/state/case-detail.store.spec.ts`
- `frontend/src/app/features/tasks/state/tasks.store.spec.ts`
- `frontend/src/app/features/timeline/state/timeline.store.spec.ts`
- `frontend/src/app/features/meetings/state/meetings.store.spec.ts`

> Note: Stores depend on typed API client services:
> - `CasesApi`, `TasksApi`, `MeetingsApi`, `AnalyticsApi`
    > If they do not exist yet, add `TODO:` markers and minimal stubs, but do not invent endpoints beyond `ARCHITECTURE.md`.

---

## Required Store APIs (must match exactly)

### 1) `CasesStore`
**State signal**
- `state: ListState<ProcessCase>`

**Selectors (computed)**
- `cases`, `status`, `error`, `isLoading`, `isEmpty`

**Methods**
- `loadCases(): Promise<void>`
- `createCase(req: CreateCaseRequest): Promise<void>`

**Behavior**
- `loadCases()` sets status to `loading`, clears error, fills items on success.
- `createCase()` calls API, then refreshes list via `loadCases()` (simple & canonical).

---

### 2) `CaseDetailStore`
**Signals**
- `caseId: signal<string | null>`
- `state: EntityState<ProcessCase>`

**Computed**
- `caseData`, `status`, `error`, `isLoading`
- `stakeholders`
- `caseStatus`
- `canActivate` (true if case is DRAFT/PAUSED AND at least one stakeholder has role `CONSULTANT`)

**Methods**
- `setCaseId(caseId: string): void`
- `loadCase(): Promise<void>`
- `addStakeholder(req: AddStakeholderRequest): Promise<void>`
- `activateCase(): Promise<void>`

**Behavior**
- `loadCase()` requires caseId; otherwise set error `{code:'MISSING_CASE_ID',...}`.
- After `addStakeholder()` and `activateCase()`, call `loadCase()` to refresh.

---

### 3) `TasksStore`
**Signals**
- `caseId: signal<string | null>`
- `state: ListState<Task>`
- `busyTaskIds: signal<Set<string>>`

**Computed**
- `tasks`, `status`, `error`, `isLoading`

**Methods**
- `setCaseId(caseId: string): void`
- `loadTasks(): Promise<void>` (**TODO** if endpoint not present; must be clearly marked)
- `createTask(req: CreateTaskRequest): Promise<void>`
- `assignTask(taskId: string, req: AssignTaskRequest): Promise<void>`
- `startTask(taskId: string): Promise<void>`
- `blockTask(taskId: string, reason: string): Promise<void>`
- `unblockTask(taskId: string): Promise<void>`
- `declineTask(taskId: string, req: DeclineTaskRequest): Promise<void>`
- `resolveTask(taskId: string, req: ResolveTaskRequest): Promise<void>`
- `isBusy(taskId: string): boolean`

**Behavior**
- All action methods:
  - add taskId to busy set
  - call API
  - refresh via `loadTasks()` on success
  - remove taskId from busy set in `finally`
- If `loadTasks()` endpoint is missing:
  - Add `TODO` and implement a safe fallback only if an existing endpoint can provide tasks without inventing new contracts.
  - Otherwise, keep as `throw new Error('TODO: Implement GET tasks for case')` with TODO note.

---

### 4) `TimelineStore`
**Signals**
- `caseId: signal<string | null>`
- `state: EntityState<CaseTimeline>`

**Computed**
- `timeline`, `status`, `error`, `isLoading`, `isEmpty`

**Methods**
- `setCaseId(caseId: string): void`
- `loadTimeline(): Promise<void>`

**Behavior**
- Loads timeline via `AnalyticsApi.getTimeline(caseId)` and stores it in `state.data`.

---

### 5) `MeetingsStore`
**Signals**
- `caseId: signal<string | null>`
- `meetingsState: ListState<Meeting>` (list can be TODO if not supported yet)
- `holdResult: signal<HoldMeetingResponse | null>`

**Computed**
- `meetings`, `status`, `error`, `isLoading`

**Methods**
- `setCaseId(caseId: string): void`
- `loadMeetings(): Promise<void>` (**TODO** if endpoint missing)
- `scheduleMeeting(req: ScheduleMeetingRequest): Promise<void>` (**TODO** if endpoint missing)
- `holdMeeting(meetingId: string, req: HoldMeetingRequest): Promise<void>`
- `clearHoldResult(): void`

**Behavior**
- `holdMeeting()` sets `holdResult` on success.
- Must not create action item keys in store; UI must provide stable keys.

---

### 6) `DevSessionService`
**Signals**
- `userId: signal<string>`
- `tenantId: signal<string>`

**Behavior**
- Default values:
  - `userId = 'u-101'`
  - `tenantId = 'tenant-001'`
- Later can be replaced by real auth.

---

## Definition of Done (DoD)

- All files compile with strict TypeScript.
- All stores exist with the required API methods and signals/computed selectors.
- Store unit tests exist and cover:
  - Happy path updates `status`, `error`, and data
  - Error path sets `status='error'` and populates `StoreError`
  - `TasksStore` busy set adds/removes taskId around actions
  - `CaseDetailStore.loadCase()` sets error when caseId is missing
- No endpoints are invented. Missing endpoints are explicitly marked with `TODO:` and do not silently fake data.

---

## How to Test

1) Frontend unit tests:
- `cd frontend && npm test`

2) Type check / build (if available):
- `cd frontend && npm run build`

3) Optional quick manual check:
- Start dev server and ensure no runtime injection errors:
  - `cd frontend && npm start`

---

### [x] T2.5 Add authentication/tenant dev strategy (frontend)
**Objective:** Support MVP dev auth with headers (until Keycloak is integrated).
**Files to touch:**
- `frontend/src/app/core/auth/dev-auth.service.ts`
- `frontend/src/app/core/http/auth-header.interceptor.ts`
- `frontend/src/environments/environment*.ts`
  **Behavior:**
- In dev: attach `X-Dev-UserId` and `X-Tenant-Id` headers (configurable).
- In prod: no dev headers (TODO for JWT).
  **Definition of done:**
- All API calls include headers in dev environment.
  **How to test:**
- Interceptor test verifies headers are set.

---

### [x] T2.6 Implement UI shell + routing + navigation
**Objective:** Create a usable navigation for MVP: cases list, case detail, timeline.
**Files to touch:**
- `frontend/src/app/app.component.*`
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/shared/layout/*`
  **Definition of done:**
- Routes:
  - `/cases`
  - `/cases/:caseId` (tabs: tasks, meetings, timeline)
    **How to test:**
- Manual: navigate between routes, refresh works.

---

### [x] T2.7 Build Cases List page (empty/loading/error states)
**Objective:** Users can list cases and create a new case.
**Files to touch:**
- `frontend/src/app/features/cases/pages/case-list/*`
- `frontend/src/app/features/cases/components/case-create-dialog/*` (or inline form)
- `frontend/src/app/features/cases/state/cases.store.ts` (use it)
  **Edge cases:**
- Empty list
- API error
- Loading skeleton
  **Definition of done:**
- Create case form validates required fields.
- On success: navigate to case detail or refresh list.
  **How to test:**
- Component tests: empty + error + success.

---

### [ ] T2.8 Build Case Detail page (stakeholders + status + actions)
**Objective:** Show case header, stakeholders, status, and actions (activate case).
**Files to touch:**
- `frontend/src/app/features/case-detail/pages/case-detail/*`
- `frontend/src/app/features/case-detail/components/stakeholder-list/*`
- `frontend/src/app/features/case-detail/state/case-detail.store.ts`
  **Definition of done:**
- Can add stakeholder with role.
- Can activate case (only if at least one CONSULTANT; UI shows helpful error otherwise).
  **How to test:**
- Component tests for add stakeholder + activate.

---

### [ ] T2.9 Build Tasks tab (list + key actions)
**Objective:** Show tasks for a case and allow MVP actions: assign, start, block, unblock, decline, resolve.
**Files to touch:**
- `frontend/src/app/features/tasks/pages/tasks-tab/*`
- `frontend/src/app/features/tasks/components/task-list/*`
- `frontend/src/app/features/tasks/components/task-actions/*`
- `frontend/src/app/features/tasks/state/tasks.store.ts`
  **Edge cases:**
- No tasks
- Task already RESOLVED (actions disabled)
- Invalid transition (show server error toast)
  **Definition of done:**
- Actions call API and refresh state.
- Buttons disabled when action not allowed.
  **How to test:**
- Component tests for enabled/disabled states and action calls.

---
[x] F1 Add models for Address, Location, Kita and update Meeting identification fields

Objective: Add TypeScript models matching backend DTOs for Location and Kita and adjust Meeting model to include locationId.
Files to touch:
•	frontend/src/app/core/models/address.model.ts (new)
•	frontend/src/app/core/models/location.model.ts (new)
•	frontend/src/app/core/models/kita.model.ts (new)
•	frontend/src/app/core/models/meeting.model.ts (update: add locationId)
•	frontend/src/app/core/models/case.model.ts (update: use kitaId instead of kitaName)
Definition of done:
•	No TypeScript errors; models align with updated backend JSON.
How to test:
•	npm test (or ng test)

---

[x] F2 Add typed API clients for Locations and Kitas

Objective: Create LocationsApi and KitasApi with typed requests/responses.
Files to touch:
•	frontend/src/app/core/api/locations.api.ts (new)
•	frontend/src/app/core/api/kitas.api.ts (new)
•	Update frontend/src/app/core/api/api.config.ts if needed
Endpoints:
•	createLocation(), listLocations(), getLocation() (optional)
•	createKita(), listKitas(), getKita() (optional)
Definition of done:
•	HttpTestingController unit tests for both API clients.
How to test:
•	npm test

---

[x] F3 Add stores: LocationsStore + KitasStore (Signals)

Objective: Provide consistent state management for locations/kitas lists and creation.
Files to touch:
•	frontend/src/app/features/locations/state/locations.store.ts (new)
•	frontend/src/app/features/locations/state/locations.store.spec.ts (new)
•	frontend/src/app/features/kitas/state/kitas.store.ts (new)
•	frontend/src/app/features/kitas/state/kitas.store.spec.ts (new)
Store API (both):
•	state: ListState<T>
•	loadX(): Promise<void>
•	createX(req): Promise<void> → refresh list
Definition of done:
•	Happy path + error path tests
•	Stores compile and follow the same patterns as existing stores.
How to test:
•	npm test

---

[x] F4 Create Locations UI (Add + List)

Objective: Create a usable UI to add and list locations with address.
Files to touch:
•	frontend/src/app/features/locations/pages/locations-page/* (new)
•	frontend/src/app/features/locations/components/location-form/* (new)
•	frontend/src/app/features/locations/components/location-list/* (new)
•	Routing: add /locations
UI requirements:
•	Form fields: label, street, houseNumber, postalCode, city, country (default DE)
•	Empty/loading/error states
•	On create success: toast + list refresh
Definition of done:
•	Page is navigable and functional with mocks or backend.
•	Component tests cover validation + create call.
How to test:
•	npm test, manual check via ng serve

---

[x] F5 Create Kitas UI (Add + List, selecting a Location)

Objective: Create UI to add a Kita (name + location selection) and list Kitas.
Files to touch:
•	frontend/src/app/features/kitas/pages/kitas-page/* (new)
•	frontend/src/app/features/kitas/components/kita-form/* (new)
•	frontend/src/app/features/kitas/components/kita-list/* (new)
•	Routing: add /kitas
•	Reuse LocationsStore for location dropdown
UI requirements:
•	Kita form:
•	name (required)
•	location dropdown (required)
•	link/button: “Create new location” reuse existing LocationCreate UI and show it as an overlay (close it when location is created).
•	Kitas list shows: name + location label (resolve location)
Definition of done:
•	Creating a Kita refreshes list.
•	Empty state guides user to create locations first.
How to test:
•	npm test, manual flow:
•	create location → create kita → see kita in list

---

[x] F6 Update Case creation flow to select Kita (instead of typing kitaName)

Objective: Update case create UI and store to use kitaId, and show selected Kita name + location in case header.
Files to touch:
•	frontend/src/app/features/cases/pages/case-list/* (create case form/dialog)
•	frontend/src/app/features/cases/state/cases.store.ts (create payload update)
•	frontend/src/app/features/case-detail/pages/case-detail/* (display)
•	Possibly add a shared kita-picker component:
•	frontend/src/app/shared/ui/kita-picker/* (new)
UI requirements:
•	Create case form:
•	title
•	kita dropdown (required)
•	quick links to /kitas and /locations if empty
Definition of done:
•	Create case sends {title, kitaId}.
•	Case detail shows Kita name and its location label/address (resolved via stores or detail endpoint).
How to test:
•	Component tests for create-case form validation and payload.

---

### [x] F7 Refactor Meetings UI: Create Meeting with Date + Location (Picker + Inline Create Location Overlay)

**Objective:** Refactor the Meetings UI so that creating/scheduling a meeting requires **only**
1) a **date/time** and
2) a **location**.

The user must be able to:
- select a location from a list of existing locations, or
- create a new location inline via an **overlay** (modal/dialog) that **reuses** the existing Location Create UI.

**Important:** All code and tests in English. UX text must be in german.

---

## Scope

### Meeting creation UX changes (MVP)
- Meeting creation form only asks for:
  - `scheduledAt` (date/time)
  - `location: label + city (of the address)` (selected location)
- Participants/minutes/action items are NOT part of “create meeting” (they remain in the “hold meeting” UI if it exists).

### Location selection + inline creation
- Location field:
  - Dropdown/select populated from `LocationsStore`
  - Button/link: “Create new location”
- Clicking “Create new location” opens an **overlay** that embeds the **existing location create form component** (do not duplicate form logic).
- On successful location creation:
  - overlay closes
  - locations list refreshes
  - newly created location becomes selected in the meeting form

---

## Files to touch

### Meetings feature
- `frontend/src/app/features/meetings/pages/meetings-tab/*`
- `frontend/src/app/features/meetings/components/meeting-create-form/*` *(new or refactor existing)*
- `frontend/src/app/features/meetings/state/meetings.store.ts` *(ensure schedule/create meeting method exists)*
- `frontend/src/app/features/meetings/state/meetings.store.spec.ts`

### Locations feature (reuse existing)
- `frontend/src/app/features/locations/components/location-form/*` *(must be reusable in overlay)*
- `frontend/src/app/features/locations/state/locations.store.ts`

### Shared UI overlay
- `frontend/src/app/shared/ui/overlay/*` *(new) OR reuse existing dialog implementation*
- `frontend/src/app/shared/ui/confirm-dialog/*` *(if you already have one, can be reused)*
- `frontend/src/app/shared/ui/toast.service.ts` *(reuse for success/error feedback)*

### Tests
- `frontend/src/app/features/meetings/components/meeting-create-form/meeting-create-form.component.spec.ts` *(new)*
- `frontend/src/app/features/meetings/pages/meetings-tab/meetings-tab.component.spec.ts` *(update/add)*
- `frontend/src/app/shared/ui/overlay/overlay.component.spec.ts` *(if new overlay added)*
- Optionally add/extend:
  - `frontend/src/app/features/locations/components/location-form/location-form.component.spec.ts`

---

## Required API / Store behavior

### LocationsStore
Must already provide:
- `loadLocations(): Promise<void>`
- `createLocation(req): Promise<void>`

### MeetingsStore
Must provide a schedule/create method (choose one and use consistently):
- `scheduleMeeting(req: ScheduleMeetingRequest): Promise<void>`

**ScheduleMeetingRequest** must include:
- `scheduledAt: string` (ISO datetime)
- `locationId: string` (UUID)

If the backend endpoint for schedule meeting does not exist yet:
- Add a clear `TODO:` in `ARCHITECTURE.md`
- Disable the submit button and show a message “Scheduling endpoint not available yet (TODO)”
- Do not fake the API call.

---

## UI Requirements (Acceptance)

### Meeting Create Form
- Fields:
  1) Date/time picker → required
  2) Location select → required
- Location select behavior:
  - shows loading state while locations are loading
  - shows empty state:
    - “No locations yet. Create one.”
  - button “Create new location” always visible
- On submit success:
  - show success toast
  - clear form (or navigate/refresh meeting list)
- On submit failure:
  - show error toast (mapped)

### Create Location Overlay
- Opens as modal/overlay on top of the meeting form.
- Contains the existing **LocationFormComponent** (reuse).
- On successful location creation:
  - closes overlay
  - ensures LocationsStore has the new location in its list (refresh or optimistic update)
  - sets selected `locationId` in meeting form to the new location’s id

---

## Edge Cases
- User opens overlay, cancels → meeting form remains unchanged.
- Location creation fails (400 validation) → overlay stays open and shows field errors.
- Locations list API fails → meeting form shows error state + retry button.

---

## Definition of Done (DoD)
- Meeting creation UI only requires **date + location**.
- Overlay for creating a new location is implemented and reuses the existing LocationForm.
- New location is auto-selected after creation.
- Tests are implemented and passing:
  - `meeting-create-form` tests cover:
    - required validation (cannot submit without date or location)
    - selecting existing location enables submit
    - opening overlay renders LocationForm
    - successful location creation closes overlay and selects new location
    - API error shows error state
  - If overlay component is new:
    - overlay open/close behavior has unit tests
- `npm test` passes.

---

## How to Test
1) Unit tests:
- `cd frontend && npm test`

---

[ ] F8 End-to-end frontend smoke checklist update

Objective: Extend smoke test to include Location/Kita flows and meeting identification.
Files to touch:
•	frontend/SMOKE_TEST.md
Checklist additions:
•	Create location → create kita → create case selecting kita
•	Hold meeting and confirm it shows date + location
Definition of done:
•	Updated checklist is complete and runnable.
How to test:
•	Follow checklist manually

### [ ] T2.15 Implement Stakeholders Feature (Create/List + Select)

**Objective:** Add a Stakeholders feature to create and manage people/entities that can participate in cases and be assigned tasks.

**Assumptions / TODO (must not invent contracts):**
- Backend endpoints for stakeholders may not exist yet.
- If backend endpoints are missing, add `TODO:` markers in:
  - `ARCHITECTURE.md` (API section)
  - `frontend/src/app/core/api/stakeholders.api.ts`
- Do not fake persistence. UI can be built to compile, but actions that require missing endpoints must show a clear TODO error.

**Files to touch / create:**
- Models:
  - `frontend/src/app/core/models/stakeholder.model.ts` (extend if needed)
  - `frontend/src/app/core/models/stakeholder-requests.model.ts` (new)
- API client:
  - `frontend/src/app/core/api/stakeholders.api.ts` (new)
- Store:
  - `frontend/src/app/features/stakeholders/state/stakeholders.store.ts` (new)
  - `frontend/src/app/features/stakeholders/state/stakeholders.store.spec.ts` (new)
- UI:
  - `frontend/src/app/features/stakeholders/pages/stakeholders-page/*` (new)
  - `frontend/src/app/features/stakeholders/components/stakeholder-form/*` (new)
  - `frontend/src/app/features/stakeholders/components/stakeholder-list/*` (new)
- Routing:
  - Add route `/stakeholders` in `app.routes.ts`
- Shared UI (if needed):
  - Use existing toast/error system

**Required frontend contracts (DTOs):**
- `Stakeholder`:
  - `id: string` (UUID string)
  - `displayName: string`
  - `email?: string`
  - `type: 'PERSON' | 'ORG'` (optional; if backend does not support yet, keep TODO)
- `CreateStakeholderRequest`:
  - `displayName: string`
  - `email?: string`

**Store API (must match):**
- Signals:
  - `state: ListState<Stakeholder>`
- Computed:
  - `stakeholders`, `status`, `error`, `isLoading`, `isEmpty`
- Methods:
  - `loadStakeholders(): Promise<void>`
  - `createStakeholder(req: CreateStakeholderRequest): Promise<void>`

**UI requirements:**
- Stakeholders page shows:
  - loading state
  - empty state ("No stakeholders yet")
  - error state (mapped error message)
  - create stakeholder form (required: displayName)
- On create success:
  - show toast
  - refresh list

**Definition of Done:**
- Stakeholders page is reachable and renders correctly.
- Store + tests exist (happy path + error path).
- No invented endpoints: missing backend routes are marked as TODO and UI shows a clear error message if used.

**How to test:**
- `npm test`
- Manual: open `/stakeholders`, verify empty/loading/error states, validate form.

---

### [ ] T2.16 Case Stakeholders + Task Assignment UX (Add to Case + Assign Tasks)

**Objective:** Make it easy to:
1) Add existing stakeholders to a case with a role, and
2) Assign case tasks to those stakeholders.

**Assumptions / TODO (must not invent contracts):**
- Case stakeholder endpoints exist per `ARCHITECTURE.md`:
  - `POST /api/cases/{caseId}/stakeholders`
- Task assignment endpoint exists:
  - `POST /api/tasks/{taskId}/assign`
- If any are missing, add `TODO:` markers and do not fake.

**Files to touch:**
- Case detail UI:
  - `frontend/src/app/features/case-detail/pages/case-detail/*`
  - `frontend/src/app/features/case-detail/components/stakeholder-list/*`
  - `frontend/src/app/features/case-detail/components/add-stakeholder-dialog/*` (new)
- Stores:
  - `frontend/src/app/features/case-detail/state/case-detail.store.ts` (use `addStakeholder`)
  - `frontend/src/app/features/tasks/state/tasks.store.ts` (use `assignTask`)
  - `frontend/src/app/features/stakeholders/state/stakeholders.store.ts` (consume list)
- Shared components (optional but recommended):
  - `frontend/src/app/shared/forms/role-select/*` (new)
  - `frontend/src/app/shared/ui/user-picker/*` (new) OR reuse simple dropdown

**Required UI behavior:**

1) **Add stakeholder to case**
- In Case Detail → Stakeholders section:
  - Button: "Add stakeholder"
  - Dialog:
    - Select stakeholder (from StakeholdersStore list)
    - Select role in case (`CONSULTANT | DIRECTOR | TEAM_MEMBER | SPONSOR`)
  - Submit calls `CaseDetailStore.addStakeholder({ userId, role })`
  - On success:
    - show toast
    - refresh case details
- Error modes:
  - Stakeholders list empty → show link/button to create stakeholders
  - API error → show mapped toast

2) **Assign tasks to case stakeholders**
- In Tasks tab:
  - Each task row has "Assign" action (if allowed by task state)
  - Assign dialog/dropdown shows **only stakeholders in the case**
  - On selection:
    - call `TasksStore.assignTask(taskId, { assigneeId })`
  - On success:
    - show toast
    - refresh tasks
- Edge cases:
  - Case has no stakeholders → disable assign and show message
  - Task is RESOLVED → assign disabled
  - If server rejects assignee (not in case) → show error toast

**Definition of Done:**
- From a fresh run:
  1) Create stakeholder(s) in `/stakeholders`
  2) Create a case
  3) Add stakeholder(s) to the case with roles
  4) Create a task and assign it to a case stakeholder
- UI includes loading/empty/error states for stakeholder pickers.
- Component tests cover:
  - Add stakeholder happy path (calls store method)
  - Assign task happy path (calls store method)
  - Disabled states (no stakeholders, resolved task)

**How to test:**
- `npm test`
- Manual MVP flow:
  - Create stakeholder → add to case → assign task → verify task shows assignee

---

### [ ] T2.10 Build Meetings tab (schedule + hold meeting + action items)
**Objective:** Provide minimal meeting workflow and create tasks from action items.
**Files to touch:**
- `frontend/src/app/features/meetings/pages/meetings-tab/*`
- `frontend/src/app/features/meetings/components/meeting-hold-form/*`
- `frontend/src/app/features/meetings/components/action-items-editor/*`
  **Important:**
- Each action item has a stable `key` (UUID generated client-side).
  **Definition of done:**
- Hold meeting sends minutes + action items; shows created task IDs.
- After holding, tasks tab shows new tasks.
  **How to test:**
- Component test ensures stable keys and correct payload.

---

### [ ] T2.11 Build Timeline tab (case timeline)
**Objective:** Display timeline entries in chronological order with readable labels.
**Files to touch:**
- `frontend/src/app/features/timeline/pages/timeline-tab/*`
- `frontend/src/app/features/timeline/components/timeline-list/*`
- `frontend/src/app/features/timeline/state/timeline.store.ts`
  **Definition of done:**
- Renders MEETING_HELD, TASK_CREATED, TASK_ASSIGNED, TASK_RESOLVED entries.
- Handles empty/error/loading.
  **How to test:**
- Component tests for rendering types.

---

### [ ] T2.12 Add UI feedback system: toasts + confirmation dialogs
**Objective:** Make MVP usable and safe (confirm destructive actions).
**Files to touch:**
- `frontend/src/app/shared/ui/toast.service.ts`
- `frontend/src/app/shared/ui/confirm-dialog/*`
  **Definition of done:**
- Success toast on save.
- Error toast shows mapped message.
- Confirm dialog for resolve/cancel actions (optional).
  **How to test:**
- Unit tests for toast service; manual smoke test.

---

### [ ] T2.13 Add shared form utilities + validation helpers
**Objective:** Standardize required/enum validation and error display.
**Files to touch:**
- `frontend/src/app/shared/forms/*`
  **Definition of done:**
- Consistent error messages for required fields.
  **How to test:**
- Component test for create case form.

---

### [ ] T2.14 Add end-to-end MVP smoke script (manual checklist)
**Objective:** Document how to verify the MVP works end-to-end.
**Files to touch:**
- `frontend/SMOKE_TEST.md`
  **Definition of done:**
- Checklist includes:
  - create case
  - add stakeholders
  - activate case
  - hold meeting with action items
  - assign/decline/resolve task
  - view timeline
    **How to test:**
- Follow checklist manually.
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

  

---

### [x] Doc1.0 Update `ARCHITECTURE.md` so it becomes the **single source of truth** for the API contracts after introducing:

- **Address** model
- **Location** model (label + address)
- **Kita** model (name + locationId)
- **ProcessCase** now references **kitaId** (instead of `kitaName`)
- **Meeting** includes **locationId** and UI identification uses **date + location**

This task is documentation-only but must be precise and example-driven so Codex doesn’t guess.

---

## Files to Touch

- `ARCHITECTURE.md`
- *(Optional, recommended)* `SPEC.md` (update examples to match the new contracts)

---

## Required Updates in `ARCHITECTURE.md`

### 1) Add / Update “Data Contracts” Section

Add a section named **“Data Contracts (DTOs)”** containing the definitions below.

#### Address (Value Object)
```json
{
  "street": "Musterstraße",
  "houseNumber": "12",
  "postalCode": "10115",
  "city": "Berlin",
  "country": "DE"
}
```

**Fields**
- `street` (string, required)
- `houseNumber` (string, required)
- `postalCode` (string, required)
- `city` (string, required)
- `country` (string, optional; default `"DE"`)

---

#### Location
```json
{
  "id": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "tenantId": "tenant-001",
  "label": "Kita Sonnenblume",
  "address": {
    "street": "Musterstraße",
    "houseNumber": "12",
    "postalCode": "10115",
    "city": "Berlin",
    "country": "DE"
  },
  "createdAt": "2026-01-29T09:00:00Z"
}
```

**Fields**
- `id` (UUID string)
- `tenantId` (string; may be implicit in auth/headers—document whichever is used)
- `label` (string, required)
- `address` (Address, required)
- `createdAt` (ISO timestamp, optional but recommended)

---

#### Kita
```json
{
  "id": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
  "tenantId": "tenant-001",
  "name": "Kita Sonnenblume",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "createdAt": "2026-01-29T09:10:00Z"
}
```

**Fields**
- `id` (UUID string)
- `tenantId` (string; may be implicit)
- `name` (string, required)
- `locationId` (UUID string, required)
- `createdAt` (ISO timestamp, optional but recommended)

---

#### ProcessCase (updated)
Replace `kitaName` with `kitaId`.

```json
{
  "id": "2b1e6d57-8b52-41a8-a2d3-7c1f1a9f1d16",
  "tenantId": "tenant-001",
  "title": "Introduce Child Protection Concept",
  "kitaId": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
  "status": "ACTIVE",
  "stakeholders": [
    { "userId": "u-101", "role": "CONSULTANT" },
    { "userId": "u-201", "role": "DIRECTOR" }
  ],
  "createdAt": "2026-01-28T10:00:00Z"
}
```

---

#### Meeting (updated)
Meeting must include `locationId` so UI can identify it by **date + location**.

```json
{
  "id": "f8c25b59-5c5b-4d78-9d9c-57cb9d0f3cdb",
  "caseId": "2b1e6d57-8b52-41a8-a2d3-7c1f1a9f1d16",
  "status": "HELD",
  "scheduledAt": "2026-02-01T10:00:00Z",
  "heldAt": "2026-02-01T10:00:00Z",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "participantIds": ["u-101","u-201"],
  "minutesText": "We discussed next steps..."
}
```

**Fields**
- `locationId` (UUID string, required)
- UI identification rule (document explicitly):
  - Display label: `heldAt || scheduledAt` + resolved `Location.label`

---

### 2) Add / Update API Endpoints Section

Add the endpoints below under a new heading: **“Locations & Kitas”**.

#### Locations
**Create Location**  
POST `/api/locations`

Request:
```json
{
  "label": "Kita Sonnenblume",
  "address": {
    "street": "Musterstraße",
    "houseNumber": "12",
    "postalCode": "10115",
    "city": "Berlin",
    "country": "DE"
  }
}
```

Response `201`:
```json
{
  "id": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8"
}
```

**List Locations**  
GET `/api/locations`

Response `200`:
```json
{
  "items": [
    {
      "id": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
      "label": "Kita Sonnenblume",
      "address": {
        "street": "Musterstraße",
        "houseNumber": "12",
        "postalCode": "10115",
        "city": "Berlin",
        "country": "DE"
      }
    }
  ]
}
```

---

#### Kitas
**Create Kita**  
POST `/api/kitas`

Request:
```json
{
  "name": "Kita Sonnenblume",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8"
}
```

Response `201`:
```json
{
  "id": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2"
}
```

**List Kitas**  
GET `/api/kitas`

Response `200`:
```json
{
  "items": [
    {
      "id": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
      "name": "Kita Sonnenblume",
      "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8"
    }
  ]
}
```

---

### 3) Update Existing Endpoints (Breaking Changes)

#### Cases (create)
Update **Create case** request to use `kitaId`:

POST `/api/cases`

Request:
```json
{
  "title": "Introduce Child Protection Concept",
  "kitaId": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2"
}
```

Document validation behavior:
- If `kitaId` does not exist for tenant → return `400` **or** `404` (pick one and document consistently).

---

#### Meetings (schedule + hold)
Update meeting schedule and hold requests to include `locationId` OR define defaulting.

**Option A (explicit in payload; simplest)**
- `POST /api/cases/{caseId}/meetings` requires `locationId`
- `POST /api/cases/{caseId}/meetings/{meetingId}/hold` requires `locationId`

**Option B (default to Kita location)**
- schedule/hold may omit `locationId`
- server sets `locationId = case.kita.locationId`
- Document this rule clearly and show examples for both “provided” and “defaulted”.

Pick **one option** and document it. Do not leave ambiguity.

Example for Hold Meeting (explicit location):
```json
{
  "heldAt": "2026-02-01T10:00:00Z",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "participantIds": ["u-101","u-201"],
  "minutesText": "We discussed next steps...",
  "actionItems": [
    { "key": "ai-1", "title": "Draft concept v1", "assigneeId": "u-201", "dueDate": "2026-02-10" }
  ]
}
```

---

### 4) Update Timeline Contract (Meeting entries include locationId)
Ensure meeting timeline entries include `locationId`:

```json
{
  "type": "MEETING_HELD",
  "occurredAt": "2026-02-01T10:00:00Z",
  "meetingId": "f8c25b59-5c5b-4d78-9d9c-57cb9d0f3cdb",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8"
}
```

---

## Edge Cases to Document (must add to ARCHITECTURE.md)

1) **Location not found**
- Creating a Kita with unknown `locationId` returns `400` or `404` (choose and document).

2) **Tenant isolation**
- Cross-tenant IDs must be rejected.

3) **Meeting identification**
- If `heldAt` is null (scheduled only), UI uses `scheduledAt + location`.

4) **Validation errors**
- Missing required address fields return `400` with field-level details.

---

## Definition of Done

- `ARCHITECTURE.md` contains:
  - DTO definitions for Address, Location, Kita, updated ProcessCase and Meeting
  - Endpoints: Locations + Kitas (create/list with examples)
  - Updated Cases create contract (kitaId)
  - Updated Meetings schedule/hold contract (locationId rule chosen)
  - Timeline meeting entry includes locationId
  - Documented edge cases and validation rules
- No conflicting examples remain (search for `kitaName` and remove/replace all occurrences).

---

## How to Verify

1) Manual doc consistency checks:
- Search `ARCHITECTURE.md` for:
  - `kitaName` → should be **0 matches**
  - `locationId` in meeting payloads → should appear in schedule/hold examples
- Ensure all JSON is valid (no trailing commas).

2) Optional: run a quick markdown preview to ensure formatting is readable.

"""
path = Path("/mnt/data/TASK_API_CONTRACT_UPDATE.md")
path.write_text(content, encoding="utf-8")
str(path)

---

## [x] Task R1 — Refactor Stakeholder Model (Backend + Frontend)

**Task ID:** STKH-REF-001  
**Chunk size:** 30–90 minutes  
**Objective:** Update the Stakeholder model across backend and frontend so a stakeholder has:
- `firstName` (required)
- `lastName` (required)
- `role` (required; global stakeholder role, not case role)

> Note: This is about the **Stakeholder entity** itself. Case-specific roles (`roleInCase`) may still exist separately. If both are needed, document the difference explicitly in `ARCHITECTURE.md` (recommended).

### Files to touch (Backend)
- Models / DTOs:
  - `backend/src/main/java/.../common/api/stakeholders/dto/StakeholderDto.java` (new or update)
  - `backend/src/main/java/.../common/api/stakeholders/dto/CreateStakeholderRequest.java` (new or update)
  - `backend/src/main/java/.../common/api/stakeholders/dto/ListStakeholdersResponse.java` (new)
- Domain:
  - `backend/src/main/java/.../common/domain/Stakeholder.java` (new or update)
  - `backend/src/main/java/.../common/domain/StakeholderId.java` (new or update)
  - `backend/src/main/java/.../common/domain/StakeholderRole.java` (new enum)
- Persistence:
  - `backend/src/main/java/.../common/infrastructure/persistence/StakeholderEntity.java` (new or update)
  - `backend/src/main/java/.../common/infrastructure/persistence/StakeholderRepository.java` (new or update)
- DB migration:
  - `backend/src/main/resources/db/migration/Vxxx__stakeholders_first_last_role.sql`
    - If stakeholders table doesn’t exist: create it
    - If it exists: add columns + backfill strategy (see notes)

### Files to touch (Frontend)
- Models:
  - `frontend/src/app/core/models/stakeholder.model.ts` (update)
  - `frontend/src/app/core/models/stakeholder-requests.model.ts` (update or create)
- UI (if stakeholder form already exists):
  - `frontend/src/app/features/stakeholders/components/stakeholder-form/*` (update fields)
- Store + API typings:
  - `frontend/src/app/core/api/stakeholders.api.ts` (update types)
  - `frontend/src/app/features/stakeholders/state/stakeholders.store.ts` (update)
- Tests:
  - Update corresponding frontend tests for form validation and payload shape

### Data Contracts (must be reflected in `ARCHITECTURE.md`)
#### Stakeholder
```json
{
  "id": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f",
  "tenantId": "tenant-001",
  "firstName": "Maria",
  "lastName": "Becker",
  "role": "CONSULTANT",
  "createdAt": "2026-01-30T10:00:00Z"
}
```

#### CreateStakeholderRequest
```json
{
  "firstName": "Maria",
  "lastName": "Becker",
  "role": "CONSULTANT"
}
```

### StakeholderRole (global)
Use a global enum with a small initial set (can be extended later):
- `CONSULTANT`
- `DIRECTOR`
- `TEAM_MEMBER`
- `SPONSOR`
- `EXTERNAL`

> If you prefer a different set, document it and keep it consistent across backend + frontend.

### Validation Rules
- `firstName` and `lastName`: non-blank, max length e.g. 100 (document exact constraint)
- `role`: required, must match enum

### Definition of Done (DoD)
- Backend compiles and tests pass:
  - Stakeholder domain entity enforces required fields (unit tests)
  - DTO validation returns `400` for missing names/role (controller tests if endpoints exist)
- Frontend compiles and tests pass:
  - Stakeholder form validates required fields
  - API client uses the new request/response typing
- No remaining references to old stakeholder fields (search and remove/replace).

### How to test
- Backend: `cd backend && ./gradlew test`
- Frontend: `cd frontend && npm test`

### Notes (migration)
- If a stakeholders table already exists (e.g., with `displayName`):
  - Add `first_name`, `last_name`, `role` columns
  - Keep `display_name` temporarily or remove it with a follow-up migration
  - Backfill can set `first_name=display_name`, `last_name=''` as a temporary migration **only** if documented; otherwise require manual migration.

---

## [x] Task R2 — Add Stakeholder Endpoints + Assigned Tasks Query (Backend)

**Task ID:** STKH-API-002  
**Chunk size:** 30–90 minutes (may split if needed)  
**Objective:** Refactor backend to support:
1) Create a stakeholder
2) List all stakeholders for a tenant
3) Fetch all tasks assigned to a given stakeholder

### Endpoints to implement

#### 1) Create stakeholder
POST `/api/stakeholders`

Request:
```json
{
  "firstName": "Maria",
  "lastName": "Becker",
  "role": "CONSULTANT"
}
```

Response `201`:
```json
{ "id": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f" }
```

#### 2) List stakeholders
GET `/api/stakeholders`

Response `200`:
```json
{
  "items": [
    {
      "id": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f",
      "firstName": "Maria",
      "lastName": "Becker",
      "role": "CONSULTANT"
    }
  ]
}
```

#### 3) List tasks assigned to stakeholder
GET `/api/stakeholders/{stakeholderId}/tasks`

Response `200`:
```json
{
  "stakeholderId": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f",
  "items": [
    {
      "id": "1d4e6c8a-6dc3-4a1b-9a68-5c4e5d2c84f0",
      "caseId": "2b1e6d57-8b52-41a8-a2d3-7c1f1a9f1d16",
      "title": "Draft child protection concept v1",
      "state": "ASSIGNED",
      "assigneeId": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f",
      "dueDate": "2026-02-10"
    }
  ]
}
```

> The task DTO can be a **summary** DTO (recommended). Do not return minutes/evidence unless needed.

### Files to touch (Backend)
- API layer:
  - `backend/src/main/java/.../common/api/stakeholders/StakeholdersController.java` (new)
  - `backend/src/main/java/.../common/api/stakeholders/dto/*` (create/update)
- Application layer:
  - `backend/src/main/java/.../common/application/StakeholderService.java` (new)
  - `backend/src/main/java/.../collaboration/application/StakeholderTasksQueryService.java` (new) OR add to `TaskService` as query method
- Domain / persistence:
  - `Stakeholder` domain + repository (from Task 1)
  - Task repository query method:
    - `findByTenantIdAndAssigneeId(tenantId, stakeholderId)` (recommended)
- Error handling:
  - If stakeholder not found: return `404`
  - Validation errors: `400`
- Documentation:
  - Update `ARCHITECTURE.md` with all endpoint definitions + examples

### Authorization (MVP rule)
- Tenant isolation: all endpoints must filter by `tenantId`
- Keep it simple:
  - Allow if authenticated (or dev auth profile) AND tenant matches
  - More granular RBAC can be added later

### Tests (required for DoD)
Add controller tests using MockMvc (or WebTestClient) verifying:
1) POST `/api/stakeholders`:
  - returns `201` on valid request
  - returns `400` when firstName/lastName/role missing
2) GET `/api/stakeholders`:
  - returns `200` with list
3) GET `/api/stakeholders/{id}/tasks`:
  - returns `200` with only tasks assigned to that stakeholder
  - returns `404` when stakeholder does not exist (for tenant)

### Definition of Done (DoD)
- Endpoints implemented and documented in `ARCHITECTURE.md`
- All tests pass:
  - `./gradlew test`
- No endpoint behavior is ambiguous (choose 400 vs 404 consistently for missing related IDs and document it)

### How to test
- `cd backend && ./gradlew test`
- Optional manual smoke:
  - create stakeholder → list stakeholders → create/assign task → fetch stakeholder tasks

---

# [x] Task SH UI Stakeholder Creation + Replace ID Inputs with Stakeholder Dropdowns

Language: **English** (required for repo files)

This change makes stakeholders usable end-to-end in the UI:
1) Create stakeholders in the UI
2) Replace any previous “enter stakeholderId” flows with dropdowns showing **name + role**
3) Ensure selected stakeholders are used when adding participants to meetings or assigning tasks

> This is split into 3 sub-tasks to keep changes PR-sized.

---

## [x] Sub-Task A — Stakeholders UI: Create + List (usable CRUD-lite)

**Task ID:** FE-STKH-UI-001A  
**Chunk size:** 30–90 minutes  
**Objective:** Add/finish a Stakeholders page where users can create stakeholders and see all stakeholders.

### Preconditions
- Backend endpoints exist (from STKH-API-002):
  - `POST /api/stakeholders`
  - `GET /api/stakeholders`
- Frontend models + API client typings exist (from STKH-REF-001 + STKH-API-002).

### Files to touch
- Models (verify):
  - `frontend/src/app/core/models/stakeholder.model.ts`
  - `frontend/src/app/core/models/stakeholder-requests.model.ts`
- API client (verify):
  - `frontend/src/app/core/api/stakeholders.api.ts`
- Store:
  - `frontend/src/app/features/stakeholders/state/stakeholders.store.ts`
  - `frontend/src/app/features/stakeholders/state/stakeholders.store.spec.ts`
- UI:
  - `frontend/src/app/features/stakeholders/pages/stakeholders-page/*`
  - `frontend/src/app/features/stakeholders/components/stakeholder-form/*`
  - `frontend/src/app/features/stakeholders/components/stakeholder-list/*`
- Routing:
  - `frontend/src/app/app.routes.ts` (add `/stakeholders`)

### UI requirements
- Form fields (required):
  - `firstName`
  - `lastName`
  - `role` (dropdown)
- List shows:
  - Full name: “firstName lastName”
  - Role label
- Empty/loading/error states
- After create:
  - toast success
  - refresh list automatically

### Definition of Done (DoD)
- Stakeholders page works end-to-end with backend:
  - create stakeholder
  - list stakeholders
- Tests pass:
  - store tests: happy path + error path
  - component tests: required validation + submit triggers store
- `npm test` passes

### How to test
- `cd frontend && npm test`
- Manual: visit `/stakeholders`, create 2 stakeholders, confirm list updates.

---

## [x] Sub-Task B — Create reusable StakeholderSelect dropdown component (name + role)

**Task ID:** FE-STKH-UI-001B  
**Chunk size:** 30–90 minutes  
**Objective:** Replace stakeholderId inputs with a reusable dropdown component that displays stakeholder **name + role** and returns `stakeholderId`.

### Files to touch / create
- Shared UI:
  - `frontend/src/app/shared/ui/stakeholder-select/stakeholder-select.component.ts` (new)
  - `frontend/src/app/shared/ui/stakeholder-select/stakeholder-select.component.html` (new)
  - `frontend/src/app/shared/ui/stakeholder-select/stakeholder-select.component.spec.ts` (new)
- Integration:
  - `frontend/src/app/features/stakeholders/state/stakeholders.store.ts` (ensure it exposes current list + load method)
- Optional helper:
  - `frontend/src/app/shared/pipes/stakeholder-label.pipe.ts` (new) OR inline label formatting

### Component API (must be implemented)
Inputs:
- `stakeholders: Stakeholder[]`
- `selectedId: string | null`
- `disabled?: boolean`
- `required?: boolean`
- `placeholder?: string`

Outputs:
- `selectedIdChange: EventEmitter<string | null>`

UI behavior:
- Each option label must show:
  - `"FirstName LastName — ROLE"`
- If list is empty:
  - show message: “No stakeholders available. Create one.”
  - provide optional link/button to navigate to `/stakeholders` (optional; keep it simple)

### Definition of Done (DoD)
- Component renders correct labels (name + role)
- Component emits selectedIdChange when selection changes
- Unit tests cover:
  - renders options from input list
  - emits correct id
  - empty list state

### How to test
- `cd frontend && npm test`

---

## [x] Sub-Task C — Replace stakeholderId inputs in Meetings + Tasks with StakeholderSelect

**Task ID:** FE-STKH-UI-001C  
**Chunk size:** 60–120 minutes (split further if needed)  
**Objective:** Wherever the UI previously asked for a stakeholder by **ID** (participants, assignee, suggested assignee), replace it with the new StakeholderSelect dropdown and wire it to the correct store/API payload.

### Targets (update all occurrences)
1) **Meeting scheduling / creation**
- Replace any participant id inputs with stakeholder selection.
- Minimum: allow selecting 0..N participants as stakeholders (multi-select or repeated selects).

2) **Hold meeting (participants + action items assignee)**
- Replace participant ids with selection.
- Replace actionItems[].assigneeId input with dropdown per action item row.

3) **Task actions**
- Assign task dialog: replace id input with StakeholderSelect.
- Decline assignment: if UI collects `suggestedAssigneeId`, use StakeholderSelect.

### Data loading rule
- On any page/dialog that needs stakeholder options:
  - ensure `StakeholdersStore.loadStakeholders()` is called on init or on open
  - show loading indicator until list available
  - if load fails: show error state and disable submit

### Files to touch
(Adjust to your actual names)
- Meetings:
  - `frontend/src/app/features/meetings/pages/meetings-tab/*`
  - `frontend/src/app/features/meetings/components/meeting-create-form/*`
  - `frontend/src/app/features/meetings/components/meeting-hold-form/*`
- Tasks:
  - `frontend/src/app/features/tasks/components/task-actions/*`
  - `frontend/src/app/features/tasks/pages/tasks-tab/*`
- Stores:
  - `frontend/src/app/features/stakeholders/state/stakeholders.store.ts`
  - `frontend/src/app/features/meetings/state/meetings.store.ts`
  - `frontend/src/app/features/tasks/state/tasks.store.ts`
- Tests:
  - Update existing tests or add:
    - `meeting-hold-form.component.spec.ts`
    - `task-actions.component.spec.ts`
    - `meetings-tab.component.spec.ts`

### Acceptance criteria
- Meeting payload contains `participantIds: string[]` derived from UI selection.
- Hold meeting action items payload contains `assigneeId` derived from selection (or null).
- Assign task payload contains `assigneeId` derived from selection.
- Dropdown labels show: “FirstName LastName — ROLE” everywhere.

### Definition of Done (DoD)
- No stakeholder selection is done via raw ID inputs anymore in the UI (remove/replace all such inputs).
- Tests added/updated and passing:
  - Assign task uses dropdown and calls store with correct id
  - Hold meeting action item assignee uses dropdown and produces correct payload
  - Participant selection produces correct participantIds
- `npm test` passes.

### How to test
- `cd frontend && npm test`
- Manual smoke:
  - Create 2 stakeholders in `/stakeholders`
  - Create/schedule meeting → select participants → save
  - Hold meeting → add action item with assignee selected
  - Create task → assign task using dropdown
