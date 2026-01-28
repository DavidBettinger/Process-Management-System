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

### [ ] T2.7 Build Cases List page (empty/loading/error states)
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
