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


### [x] T2.9 Build Tasks tab (list + key actions)
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


### [x] T2.11 Build Timeline tab (case timeline)
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

  
