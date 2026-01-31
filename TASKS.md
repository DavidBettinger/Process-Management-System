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

---Task ID: FE-RXJS-REF-002
Objective: Refactor existing stores so all async methods return Observables, and internal state updates happen in RxJS operators.

Target (start with one store: TasksStore, then apply pattern to others)

Refactor methods like:
•	loadTasks()
•	createTask()
•	assignTask(), startTask(), blockTask(), resolveTask() …

Required pattern for actions (busy id + error + refresh)

Example behavior (conceptual):
•	on subscribe:
•	mark status loading
•	add id to busyTaskIds
•	call API observable
•	tap() update state / trigger refresh
•	catchError() set store error + set status error
•	finalize() remove id from busy set

Files to touch
•	frontend/src/app/features/tasks/state/tasks.store.ts
•	Similar stores after pattern proven:
•	case-detail.store.ts, meetings.store.ts, timeline.store.ts, kitas.store.ts, locations.store.ts, etc.

DoD
•	No store method returns Promise.
•	No store method uses async / await.
•	All store methods return Observable<...>.
•	Busy-id logic uses finalize() (so it always clears).
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

  
