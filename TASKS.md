# Task Plan (MVP 1)

Each task chunk should fit into ~30–90 minutes.
For each task: objective, files to touch, definition of done, how to test.

---

## 1) Backend — Spring Boot MVP
- [x] Implement GET /api/cases/{caseId}/meetings and wire frontend loadMeetings

---
## 2) Frontend — Angular MVP
Important for the frontend: all Angular modules must be in a separate folder. 
Cases should be named process in the ui and the text of the UI must be in German. 
But only the text that the user sees, the rest stays in english.
Readmes should also be in english.
Always make sure that the frontend matches the backend (API calls and DTOs)
Make sure that you don't use deprecated features!


---

# Tasks — Extend Task Model (Priority, Description, Attachments, Reminders)

Language: **English** for code/docs/tests.  
UI text can be **German** (optional), but keep code identifiers English.

This task set implements new requirements:
- Tasks have **priority** 1..5 (1 = very important, 5 = not important)
- Tasks have a **description** (long text)
- Tasks support **documents/files** (attachments)
- Tasks support **reminders** for stakeholders, including:
  - reminder time
  - short description
  - link to the task

> Split into short Codex-sized tasks (30–90 minutes each).  
> Where endpoints are not yet defined, update `ARCHITECTURE.md` first and do not invent behavior silently.

---

## [x] Task 1 — Update API Contracts in `ARCHITECTURE.md` (Task fields + Attachments + Reminders)

**Task ID:** DOC-TASK-EXT-001  
**Objective:** Update `ARCHITECTURE.md` so Codex has a stable contract for:
- Task priority + description
- Attachment upload + listing
- Reminder CRUD-lite (create/list/delete)

### Files to touch
- `ARCHITECTURE.md`

### Contracts to add

#### Task (updated)
Add fields to Task DTOs (create + list + detail):
- `priority` (int 1..5, required; default allowed? choose and document)
- `description` (string, optional; long text)

Example:
```json
{
  "id": "task-uuid",
  "caseId": "case-uuid",
  "title": "Draft concept v1",
  "description": "Longer text describing the task...",
  "priority": 2,
  "state": "OPEN",
  "assigneeId": "stakeholder-uuid",
  "dueDate": "2026-02-10"
}
```

#### Attachments (new)
Define endpoints:
- `POST /api/tasks/{taskId}/attachments` (multipart upload)
- `GET /api/tasks/{taskId}/attachments` (list)
- `GET /api/tasks/{taskId}/attachments/{attachmentId}` (download)
- `DELETE /api/tasks/{taskId}/attachments/{attachmentId}` (optional MVP; recommended)

Attachment DTO:
```json
{
  "id": "att-uuid",
  "taskId": "task-uuid",
  "fileName": "concept-v1.docx",
  "contentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "sizeBytes": 123456,
  "uploadedAt": "2026-02-01T10:00:00Z",
  "uploadedByStakeholderId": "stakeholder-uuid"
}
```

#### Reminders (new)
Define endpoints:
- `POST /api/tasks/{taskId}/reminders`
- `GET /api/tasks/{taskId}/reminders`
- `DELETE /api/tasks/{taskId}/reminders/{reminderId}` (optional but strongly recommended)

Reminder DTO:
```json
{
  "id": "rem-uuid",
  "taskId": "task-uuid",
  "stakeholderId": "stakeholder-uuid",
  "remindAt": "2026-02-05T09:00:00Z",
  "note": "Bitte an die Rückmeldung denken.",
  "createdAt": "2026-02-01T10:00:00Z"
}
```

### Validation rules to document
- `priority` must be integer in range 1..5
- `description` max length (e.g., 10,000 chars) — choose and document
- Attachment max file size (e.g., 25 MB) — choose and document
- `remindAt` must be in the future (or allow past? choose and document)
- `stakeholderId` must exist and belong to tenant

### DoD
- `ARCHITECTURE.md` contains:
  - updated Task DTOs
  - attachment endpoints + DTOs
  - reminder endpoints + DTOs
  - clear validation/error behavior (400 vs 404)
- No ambiguity remains for Codex.

---

## [x] Task 2 — Backend: Add Task priority + description (DB + domain + API + tests)

**Task ID:** BE-TASK-EXT-002  
**Objective:** Extend backend task model with `priority` and `description`, persist them, and expose them via API.

### Files to touch
- Domain:
  - Task entity/value objects (wherever your Task lives)
- Persistence:
  - Task JPA entity + repository
  - DB migration: add `priority` and `description` columns
- API DTOs:
  - CreateTaskRequest, TaskDto, TaskListItemDto (as applicable)
- Tests:
  - domain tests (priority range)
  - controller tests (400 on invalid priority)
  - repository/integration tests (values persisted)

### Invariants
- `priority` required, range 1..5
- `description` optional (long text)

### DoD
- Creating and fetching tasks includes priority+description
- Invalid priority returns 400 with field error
- `./gradlew test` passes

---

## [x] Task 3 — Frontend: Extend Task model + forms (priority + description) + tests

**Task ID:** FE-TASK-EXT-003  
**Objective:** Add priority and description to frontend models, task creation UI, task list UI.

### Files to touch
- Models:
  - `frontend/src/app/core/models/task.model.ts`
  - request model for create task
- API client:
  - `tasks.api.ts` typing updates
- Store:
  - `tasks.store.ts` mapping updates
- UI:
  - Task create form (This form should be shown in the task list and it should replace the old form in the hold meeting): add 
    - priority select (1..5) with labels:
      - 1 = „Sehr wichtig“
      - 2 = „Wichtig“
      - 3 = „Mittel“
      - 4 = „Eher unwichtig“
      - 5 = „Nicht wichtig“
    - description textarea (optional)
  - Task list row shows priority (badge or text) and title; description optionally in detail/expand
- Tests:
  - component form validation (priority required)
  - store mapping test ensures fields are stored and sent

### DoD
- UI can create task with priority + description
- UI shows priority in task list
- `npm test` passes

---

## [x] Task 4 — Backend: Implement Task Attachments (upload/list/download) with storage strategy + tests

**Task ID:** BE-TASK-ATT-004  
**Objective:** Add attachments to tasks: upload, list, download.

### Storage strategy (MVP recommendation)
- Store file bytes in filesystem or object storage
- Store metadata in DB:
  - attachment_id, task_id, file_name, content_type, size_bytes, storage_key, uploaded_at, uploaded_by
- Use tenant isolation in storage key.

### Files to touch
- DB migration:
  - create `task_attachments` table
- Domain:
  - `TaskAttachment` entity
- Infrastructure:
  - `AttachmentStorage` interface + `LocalFileStorage` implementation (MVP)
- API:
  - `TaskAttachmentsController`
  - multipart upload handling
- Tests:
  - controller tests for upload/list/download
  - storage test using temp directory
  - tenant isolation test (cannot access other tenant’s attachment)

### Validation
- max file size (per contract)
- content type allowed list (optional MVP; document)
- taskId must exist

### DoD
- Upload returns attachment id
- List returns metadata
- Download returns correct content type and bytes
- `./gradlew test` passes

---

## [x] Task 5 — Frontend: Attachments UI (add/list/download/delete) + tests

**Task ID:** FE-TASK-ATT-005  
**Objective:** Allow users to add files to a task and see attached files.

### Files to touch
- Models:
  - `task-attachment.model.ts` (new)
- API client:
  - `tasks.api.ts` add attachment methods:
    - `uploadAttachment(taskId, file)`
    - `listAttachments(taskId)`
    - `downloadAttachment(taskId, attachmentId)` (or provide URL)
    - `deleteAttachment(...)` (if supported)
- Store:
  - `task-detail.store.ts` (recommended) or extend `tasks.store.ts` with per-task attachment state
- UI:
  - Task detail view (or expandable section in task list):
    - File picker + upload button
    - Attachment list with:
      - fileName, size, uploadedAt, download button
      - optional delete
- Tests:
  - component test: upload triggers api method
  - empty/loading/error states
  - attachment list renders file names (no ids shown)

### DoD
- Upload works and list refreshes
- Download action triggers browser download (or opens)
- Tests pass: `npm test`

---

## [x] Task 6 — Backend: Implement Task Reminders (create/list/delete) + tests

**Task ID:** BE-TASK-REM-006  
**Objective:** Add reminders linked to tasks and stakeholders.

### Reminder behavior (MVP)
- Reminder is a record stored in DB.
- For MVP: only CRUD-lite + retrieval; no email sending required.

### Files to touch
- DB migration:
  - create `task_reminders` table
- Domain:
  - `TaskReminder` entity
- API:
  - `TaskRemindersController`
- Tests:
  - create reminder returns 201
  - list returns reminders for task
  - delete removes reminder
  - 404 if task not found
  - 400 if remindAt invalid (past, if future-only rule)

### Validation
- `stakeholderId` must exist for tenant
- `remindAt` ISO datetime
- `note` optional but max length (document)

### DoD
- Endpoints implemented as in architecture contract
- `./gradlew test` passes

---

## [ ] Task 7 — Frontend: Reminders UI (create/list/delete) + tests

**Task ID:** FE-TASK-REM-007  
**Objective:** Add a reminders section to task detail:
- create reminder (select stakeholder, choose time, add note)
- list reminders
- delete reminder

### Files to touch
- Models:
  - `task-reminder.model.ts` (new)
- API client:
  - `tasks.api.ts` add reminder methods
- Store:
  - `task-detail.store.ts` (recommended)
- UI:
  - Reminders section in task detail:
    - stakeholder dropdown (name + role)
    - datetime picker
    - note input
    - create button
    - reminder list: remindAt + stakeholder label + note
    - delete action
- Tests:
  - create reminder calls API with correct ids
  - list renders human labels (not ids)
  - delete removes row
  - validation: cannot create without stakeholder + remindAt

### DoD
- Reminders feature usable end-to-end
- No ids displayed in reminder list
- `npm test` passes

---

## Global Documentation + Quality Requirements (apply to all tasks)
- Update `ARCHITECTURE.md` whenever a DTO or endpoint changes.
- Ensure UI shows **titles/names** (no raw IDs).
- All new endpoints must have controller tests.
- All new UI components must have unit tests.
- DoD for each task requires tests to pass:
  - Backend: `./gradlew test`
  - Frontend: `npm test`
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

  
