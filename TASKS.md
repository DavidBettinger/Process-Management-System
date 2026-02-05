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
# Tasks — Update “Aufgaben” UI Flow (Overlay Create + Assignee + Accordion)

Language: **English** for code/docs/tests.  
UI labels can remain **German** (as shown in screenshot).

Source: Screenshot notes (red annotations inside black frames).

---

## [x] Task 1 — Open “Aufgabe erstellen” as an Overlay (Modal) with Create/Cancel

**Task ID:** FE-TASK-UI-OVL-001  
**Objective:** Replace the inline “Aufgabe erstellen” form with an overlay/modal opened by the “Aufgabe erstellen” button.

### Requirements
- Clicking **“Aufgabe erstellen”** opens an overlay (modal).
- Overlay contains:
  - Title: “Aufgabe erstellen”
  - Form fields (existing + see Task 2 for assignee field)
  - Buttons:
    - Primary: **„Erstellen“**
    - Secondary: **„Abbrechen“** (closes overlay, resets form)
- Closing overlay via:
  - Cancel button
  - ESC
  - clicking backdrop (optional; choose and document)

### Reuse
- Reuse the existing overlay/dialog component (do not create a second modal system).

### Files to touch (likely)
- `frontend/src/app/features/tasks/pages/tasks-tab/*`
- `frontend/src/app/features/tasks/components/task-create-form/*`
- `frontend/src/app/shared/ui/overlay/*` (only if enhancements needed)

### Tests (required for DoD)
- Component test:
  - clicking “Aufgabe erstellen” opens overlay
  - clicking “Abbrechen” closes overlay and clears form state
  - clicking backdrop/ESC closes overlay if supported

### DoD
- Inline create form removed from page.
- Overlay open/close works.
- `npm test` passes.

---

## [ ] Task 2 — Add “Zuständig” (Assignee) dropdown to Create Task Form

**Task ID:** FE-TASK-UI-ASSIGNEE-002  
**Objective:** The create task form must include a stakeholder dropdown to assign the task during creation.

### Requirements
- Add field to create task overlay:
  - Label: “Zuständig (optional)” (or similar)
  - Control: stakeholder dropdown showing **“Vorname Nachname — Rolle”**
- If a stakeholder is selected:
  - Task is created with `assigneeId` set
  - UI should show the created task with that assignee already set (see Task 4)
- If no stakeholder is selected:
  - Create with `assigneeId = null`

### Data loading
- Ensure stakeholders are loaded before dropdown is used:
  - call `StakeholdersStore.loadStakeholders()` when overlay opens (or on Tasks tab init)

### API/Store implications
- If backend `createTask` does not accept `assigneeId` yet:
  - Add a backend task to extend CreateTaskRequest (document in `ARCHITECTURE.md`)
  - Do not fake assignment on frontend.

### Files to touch (likely)
- `frontend/src/app/features/tasks/components/task-create-form/*`
- `frontend/src/app/features/tasks/state/tasks.store.ts`
- `frontend/src/app/core/api/tasks.api.ts` (typing updates)
- `frontend/src/app/features/stakeholders/state/stakeholders.store.ts`

### Tests (required for DoD)
- Form test:
  - stakeholder dropdown renders labels (name + role)
  - selected stakeholder id is included in create payload
- Store test:
  - createTask sends `assigneeId` when present

### DoD
- Assignee selection available during create.
- Works end-to-end (with backend support).
- `npm test` passes.

---

## [ ] Task 3 — Tasks List as Accordion: Collapse by default, show summary row (title/status/priority/assignee)

**Task ID:** FE-TASK-UI-ACC-003  
**Objective:** When multiple tasks exist, tasks should be collapsed (accordion). Only summary is visible for collapsed items.

### Requirements
- When there is **more than one** task:
  - show tasks as an accordion list:
    - collapsed state shows only:
      - **Titel**
      - **Status** (badge)
      - **Priorität** (badge)
      - **Zuständig** (label; “Nicht zugewiesen” if null)
- Expanded state shows the full task detail/actions UI (the big panel).

### UX rules
- Tasks are **collapsed by default** when list loads.
- If there is **exactly one** task:
  - it may be expanded by default (optional; choose and document)

### Implementation suggestion
- Keep expanded task id in component/store state:
  - `expandedTaskId: signal<string|null>`
- Render list:
  - summary row is clickable to expand/collapse

### Files to touch (likely)
- `frontend/src/app/features/tasks/pages/tasks-tab/*`
- `frontend/src/app/features/tasks/components/task-accordion/*` (new) or refactor existing list component

### Tests (required for DoD)
- Component test:
  - when tasks length > 1, only summaries are visible by default
  - summary displays title/status/priority/assignee label
  - expanding shows detail UI

### DoD
- Accordion behavior implemented.
- Summary row never shows raw IDs.
- `npm test` passes.

---

## [ ] Task 4 — Only one task expanded at a time + assignee dropdown preselected when task already assigned

**Task ID:** FE-TASK-UI-ACC-004  
**Objective:** Ensure only one task can be expanded at a time and the “Zuweisen” dropdown preselects the currently assigned stakeholder.

### Requirements
- Accordion rule:
  - Expanding a task collapses any other expanded task.
- “Zuweisen” action panel:
  - If `task.assigneeId` exists, the dropdown must show that stakeholder selected by default.
  - If task is created with assignee, it must be selected immediately once the task appears.
- If stakeholder list is not loaded yet:
  - show loading placeholder and disable assign action until loaded.

### Files to touch (likely)
- `frontend/src/app/features/tasks/components/task-actions/*`
- `frontend/src/app/shared/ui/stakeholder-select/*` (if exists)
- `frontend/src/app/features/tasks/pages/tasks-tab/*`

### Tests (required for DoD)
- Accordion test:
  - expand task A then expand task B → task A collapses
- Assign UI test:
  - given task with assigneeId and stakeholder list contains that id → dropdown preselects it
  - ensure UI does not show the raw assigneeId

### DoD
- Exactly one expanded task at a time.
- Assignee dropdown reflects current assignment.
- `npm test` passes.

---

## Documentation Update (required)
Add a small section to `UI_SPEC.md` (or create it if missing) describing:
- Tasks tab create flow via overlay
- Accordion behavior and summary fields
- Assignee selection during create and assign

**DoD:** Docs updated and aligned with implementation.

---

## Optional follow-up (nice-to-have, not required)
- Add “Anhänge anzeigen” and “Erinnerungen anzeigen” sections as collapsible panels inside the expanded task card, with consistent Tailwind spacing.
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

  
