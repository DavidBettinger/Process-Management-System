# Task Plan (MVP 1)

Each task chunk should fit into ~30–90 minutes.
For each task: objective, files to touch, definition of done, how to test.

---

## 1) Backend — Spring Boot MVP


---
## 2) Frontend — Angular MVP
Important for the frontend: all Angular modules must be in a separate folder. 
Cases should be named process in the ui and the text of the UI must be in German. 
But only the text that the user sees, the rest stays in english.
Readmes should also be in english.
Always make sure that the frontend matches the backend (API calls and DTOs)
Make sure that you don't use deprecated features!


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
# [ ] Task SH Stakeholder Detail Page + Pagination (Backend & Frontend)

Language: **English** (required for repo files)

This task adds:
- Frontend: A **Stakeholder Detail** page that shows the stakeholder profile and the tasks assigned to them (`/api/stakeholders/{id}/tasks`).
- Backend: **Pagination** support for listing stakeholders and stakeholder-assigned tasks.

> This is intentionally structured so Codex has exact contracts to implement and test.

---

## [x] Part A — Backend: Add Pagination to Stakeholders + Stakeholder Tasks

**Task ID:** STKH-PAGE-BE-001  
**Chunk size:** 60–120 minutes (split if needed)  
**Objective:** Add pagination parameters to:
1) `GET /api/stakeholders`
2) `GET /api/stakeholders/{stakeholderId}/tasks`

### Pagination contract (must be documented in `ARCHITECTURE.md`)
Use query params:
- `page` (integer, default `0`, min `0`)
- `size` (integer, default `20`, min `1`, max `100`)
- `sort` (string, optional; for MVP: support limited fields)

Response envelope:
```json
{
  "items": [ /* ... */ ],
  "page": 0,
  "size": 20,
  "totalItems": 123,
  "totalPages": 7
}
```

### Endpoint changes

#### 1) List stakeholders (paginated)
GET `/api/stakeholders?page=0&size=20&sort=lastName,asc`

Response `200`:
```json
{
  "items": [
    { "id": "uuid", "firstName": "Maria", "lastName": "Becker", "role": "CONSULTANT" }
  ],
  "page": 0,
  "size": 20,
  "totalItems": 1,
  "totalPages": 1
}
```

Sorting (MVP):
- Allow only:
  - `lastName,asc|desc`
  - `firstName,asc|desc`
  - `createdAt,asc|desc`
    If `sort` is invalid → `400`.

#### 2) List stakeholder tasks (paginated)
GET `/api/stakeholders/{stakeholderId}/tasks?page=0&size=20&sort=dueDate,asc`

Response `200`:
```json
{
  "stakeholderId": "uuid",
  "items": [
    { "id": "uuid", "caseId": "uuid", "title": "Draft concept", "state": "ASSIGNED", "assigneeId": "uuid", "dueDate": "2026-02-10" }
  ],
  "page": 0,
  "size": 20,
  "totalItems": 42,
  "totalPages": 3
}
```

Sorting (MVP):
- Allow only:
  - `dueDate,asc|desc`
  - `createdAt,asc|desc`
  - `state,asc|desc`
    If `sort` is invalid → `400`.

### Files to touch (Backend)
- Controllers:
  - `backend/src/main/java/.../common/api/stakeholders/StakeholdersController.java`
- DTOs:
  - `backend/src/main/java/.../common/api/stakeholders/dto/ListStakeholdersResponse.java` (update to include pagination fields)
  - `backend/src/main/java/.../common/api/stakeholders/dto/ListStakeholderTasksResponse.java` (new or update)
  - `backend/src/main/java/.../common/api/paging/PageResponse.java` (new generic helper recommended)
- Application/services:
  - `backend/src/main/java/.../common/application/StakeholderService.java`
  - `backend/src/main/java/.../collaboration/application/StakeholderTasksQueryService.java`
- Repositories:
  - `StakeholderRepository` → add `Page<...>` queries (Spring Data Pageable)
  - `TaskRepository` → add paged query for assignee
- Docs:
  - `ARCHITECTURE.md` update for new query params + response format

### Validation / error behavior
- `page < 0` → `400`
- `size < 1` or `size > 100` → `400`
- invalid `sort` format/field → `400`
- unknown stakeholderId → `404` (for tasks endpoint)

### Backend tests (required for DoD)
Add or update tests (MockMvc/WebTestClient):
1) `GET /api/stakeholders` returns pagination fields and respects `size`
2) `GET /api/stakeholders?page=-1` returns `400`
3) `GET /api/stakeholders?size=999` returns `400`
4) `GET /api/stakeholders?sort=unknown,asc` returns `400`
5) `GET /api/stakeholders/{id}/tasks` returns paged results and respects `sort`
6) `GET /api/stakeholders/{missingId}/tasks` returns `404`

### Definition of Done (Backend)
- Pagination implemented for both endpoints
- Sorting whitelist enforced with 400 on invalid sort
- `./gradlew test` passes
- `ARCHITECTURE.md` documents pagination + sorting contract

### How to test
- `cd backend && ./gradlew test`

---

## [ ] Part B — Frontend: Stakeholder Detail Page (profile + assigned tasks)

**Task ID:** STKH-DETAIL-FE-002  
**Chunk size:** 60–120 minutes (split if needed)  
**Objective:** Add a Stakeholder Detail page:
- Shows stakeholder profile (name + role)
- Shows tasks assigned to the stakeholder (paginated) using `/api/stakeholders/{id}/tasks`

### Routes
- Add:
  - `/stakeholders/:stakeholderId`

### UI requirements
- Header:
  - “FirstName LastName — ROLE”
- Assigned tasks section:
  - table/list of tasks showing:
    - title
    - state
    - dueDate (if present)
    - caseId (optional; link later)
- Pagination controls:
  - next/prev
  - page indicator
  - page size selector (optional MVP)
- States:
  - loading skeleton
  - empty state (“No tasks assigned”)
  - error state with retry

### Files to touch (Frontend)
- Models:
  - `frontend/src/app/core/models/paging.model.ts` (new; PageResponse type)
  - `frontend/src/app/core/models/task.model.ts` (ensure summary DTO matches backend)
- API:
  - `frontend/src/app/core/api/stakeholders.api.ts` (add):
    - `getStakeholders(page,size,sort)`
    - `getStakeholderTasks(stakeholderId,page,size,sort)`
    - `getStakeholderById(stakeholderId)` (optional; if not available, derive from list or add backend endpoint later)
- Store:
  - `frontend/src/app/features/stakeholders/state/stakeholder-detail.store.ts` (new)
  - `frontend/src/app/features/stakeholders/state/stakeholder-detail.store.spec.ts` (new)
- UI:
  - `frontend/src/app/features/stakeholders/pages/stakeholder-detail-page/*` (new)
- Routing:
  - `frontend/src/app/app.routes.ts` update

### Store API (Signals, must match)
Signals:
- `stakeholderId: signal<string | null>`
- `profileState: EntityState<Stakeholder>` (optional if you fetch profile)
- `tasksState: { status, items, page, size, totalItems, totalPages, error }`

Methods:
- `setStakeholderId(id: string): void`
- `loadProfile(): Promise<void>` (optional)
- `loadTasks(page?: number, size?: number, sort?: string): Promise<void>`
- `nextPage(): Promise<void>`
- `prevPage(): Promise<void>`
- `setPageSize(size: number): Promise<void>`

### Frontend tests (required for DoD)
- Store tests:
  - `loadTasks()` success updates pagination fields
  - error path sets status=error
  - `nextPage()` increments and reloads (when page < totalPages-1)
- Component tests:
  - renders header label
  - empty state when no tasks
  - pagination buttons enabled/disabled correctly

### Definition of Done (Frontend)
- Stakeholder detail route works and shows assigned tasks
- Uses paginated API calls (`page`, `size`, `sort`)
- `npm test` passes

### How to test
- `cd frontend && npm test`
- Manual smoke:
  - Create stakeholders
  - Assign tasks to one stakeholder
  - Open `/stakeholders/{id}` and verify tasks list + pagination

---

## Deliverables Checklist
- [ ] Backend pagination + tests passing
- [ ] `ARCHITECTURE.md` updated with pagination contract
- [ ] Frontend stakeholder detail page + store + tests passing
- [ ] No hardcoded fake data in UI
