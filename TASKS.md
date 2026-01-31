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

---

# [x] Task RRI Replace Raw IDs in UI With Human-Readable Labels (Stakeholders, Tasks, Processes, Meetings)

Language rules:
- **UI-visible text in German**
- Code/comments/docs in English

## Problem
Multiple screens currently display raw technical IDs (`stakeholderId`, `taskId`, `caseId`, `meetingId`). This reduces usability.  
Goal: show **names/titles** instead, and only show IDs in rare debugging contexts (if at all).

---

## Task ID
FE-UX-LABELS-001

## Objective
Replace ID displays across the UI with human-readable labels:
- Stakeholders: `firstName lastName — role`
- Tasks: `title`
- Processes (Cases): `name/title` (UI wording: **Prozess**)
- Meetings: `date + location label` (per your rule: meeting identified by date + location)

Where the UI only has an ID, it must resolve it using cached reference data (stores) or (if missing) load minimal data from the API.

---

## Scope
### In scope
- Timeline tab entries (currently show taskId/meetingId/assigneeId)
- Stakeholder detail page (currently shows stakeholder ID and caseId in task rows)
- Task list / task actions / meeting views (any place IDs are rendered)
- Any table/list/detail view showing IDs instead of labels

### Out of scope (for this task)
- New analytics features
- Full-text search
- Major redesign of layouts (only label replacements + small UI tweaks)

---

## Approach (Implementation Strategy)

### 1) Add a shared “Label Resolver” layer (frontend)
Create a small shared utility that maps IDs → labels using existing stores.

**Preferred**: a set of small pipes + a helper service:
- Pipes (pure + testable):
  - `StakeholderLabelPipe` (`stakeholderId` → `Vorname Nachname — Rolle`)
  - `ProcessLabelPipe` (`caseId` → process title)
  - `MeetingLabelPipe` (`meetingId` → `DD.MM.YYYY HH:mm — Standortname`)
- Optional shared service:
  - `LabelResolverService` used by pipes to query stores

**Location for shared code**
- `frontend/src/app/shared/labels/*`
  - `label-resolver.service.ts`
  - `stakeholder-label.pipe.ts`
  - `process-label.pipe.ts`
  - `meeting-label.pipe.ts`

Label rules (German strings):
- Unknown entity: `"Unbekannt"`
- Loading: `"Wird geladen ..."` (only if you show a placeholder)
- Meeting: `"${date} — ${locationLabel}"` (no meetingId shown)

### 2) Ensure necessary reference data is available
For each screen that needs labels:
- Make sure required stores are loaded:
  - `StakeholdersStore.loadStakeholders()`
  - `Processes/CasesStore.loadCases()` (or equivalent)
  - `MeetingsStore.loadMeetings(caseId)` (for mapping meetingId → meeting label)
  - `LocationsStore.loadLocations()` (if meeting label uses location name)

**Rule:** Do not add HttpClient calls inside components for label resolution.  
Always load via store → API.

### 3) Replace ID output in templates
Examples:
- Timeline list:
  - Replace `Termin-ID: ...` with meeting label (date + location).
  - Replace `Zugewiesen an ${assigneeId}` with stakeholder label.
  - Replace `Aufgabe-ID` with task title (if available) or a fallback label.

- Stakeholder detail page:
  - Remove `"ID {profile.id}"` line (or move to hidden debug section).
  - Replace `Prozess-ID` column with process title (and optional link).
  - If tasks endpoint only returns `caseId`, resolve it to process name via CasesStore.

---

## Backend considerations (only if needed)
Try to solve this in the frontend first via label resolution.  
If the UI cannot resolve reliably (missing endpoints / too many joins), add minimal DTO enrichment:

- Add optional fields in DTOs:
  - Task summaries: `caseTitle`, `assigneeDisplayName`
  - Timeline entries: `taskTitle`, `meetingLabel`, `assigneeDisplayName`

**Only do this if** it significantly reduces frontend complexity or avoids N+1 API patterns.

---

## Files to touch (expected)
### Frontend
- Shared labels:
  - `frontend/src/app/shared/labels/label-resolver.service.ts` (new)
  - `frontend/src/app/shared/labels/stakeholder-label.pipe.ts` (new)
  - `frontend/src/app/shared/labels/process-label.pipe.ts` (new)
  - `frontend/src/app/shared/labels/meeting-label.pipe.ts` (new)

- Timeline:
  - `frontend/src/app/features/timeline/components/timeline-list/*`

- Stakeholders:
  - `frontend/src/app/features/stakeholders/pages/stakeholder-detail-page/*`

- Tasks:
  - `frontend/src/app/features/tasks/components/task-list/*`
  - `frontend/src/app/features/tasks/components/task-actions/*`
  - `frontend/src/app/features/tasks/pages/tasks-tab/*`

- Meetings:
  - wherever meeting list/detail is rendered (search for `meetingId` usage)

### Backend (optional)
- `ARCHITECTURE.md` if DTOs are enriched
- DTOs + controller tests if endpoints change

---

## Acceptance Criteria
1) No raw IDs are shown in the UI for:
  - stakeholders, tasks, processes, meetings
2) Timeline entries show meaningful labels:
  - Meeting: date + location
  - Task: task title
  - Assignee: stakeholder name + role
3) Stakeholder detail page shows:
  - Header name + role
  - Assigned tasks list shows **process title**, not `caseId`
  - No standalone stakeholder ID visible
4) If a label cannot be resolved, show `"Unbekannt"` (not the ID)

---

## Tests (required for DoD)
Add/update component tests asserting labels are rendered and IDs are not.

### Suggested tests
- TimelineListComponent:
  - with entry `{type:'TASK_ASSIGNED', assigneeId:'s-1'}` and store has stakeholder `s-1`
  - expect text contains `"Maria Becker"` and **does not** contain `"s-1"`

- StakeholderDetailPageComponent:
  - tasks contain `caseId:'case-1'`, cases store has `{id:'case-1', title:'Kinderschutz'}`
  - expect `"Kinderschutz"` rendered and **does not** contain `"case-1"`

- Task list component:
  - assignee label rendered, no `assigneeId` shown

---

## Definition of Done (DoD)
- All relevant UI screens use labels instead of IDs (verified by search for patterns like `ID `, `-ID`, `caseId`, `taskId`, `meetingId` in templates).
- Component tests added/updated and passing.
- `cd frontend && npm test` passes.
- No deprecated Angular features introduced.

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

  
