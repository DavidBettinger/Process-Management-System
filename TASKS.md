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
Tasks — Replace custom CSS with Tailwind (Angular) and enforce Tailwind usage going forward

Language: **English** for code/docs/tests.  
UI-visible text can be German.

## Context
Tailwind CSS is integrated in the Angular project, but Codex has been adding regular CSS files/classes.  
Goal:
1) Replace existing custom CSS with a consistent Tailwind-based layout **where reasonable**.
2) Establish rules so future code uses Tailwind by default.

> These tasks are intentionally small (30–90 min each) and can be repeated per feature.

---

## [x] Task 1 — Document Tailwind-only UI rule in SPEC.md + CODEX instructions

**Task ID:** DOC-TW-001  
**Objective:** Make Tailwind usage explicit so Codex stops writing plain CSS.

### Files to touch
- `SPEC.md`
- `CODEX_INSTRUCTIONS.md` (or create it if missing)
- Optional: `ARCHITECTURE.md` (frontend conventions section)

### Required content to add (example)
Add to `SPEC.md` under Constraints → Frontend:
```md
### Styling rules (Tailwind)
- Use Tailwind utility classes for all UI styling.
- Do not add new component CSS/SCSS files unless absolutely necessary (document why).
- Prefer shared Tailwind-based UI components over one-off styles.
- If a style cannot be expressed with Tailwind utilities, use Tailwind config or a single global stylesheet section (no per-component CSS).
```

Add to `CODEX_INSTRUCTIONS.md`:
- “Never introduce new `.css/.scss` files for components.”
- “Prefer Tailwind classes and shared UI components.”
- “When changing HTML structure, update tests.”

### DoD
- Rules exist in docs and are unambiguous.

---

## [x] Task 2 — Add shared Tailwind design primitives (layout, buttons, inputs)

**Task ID:** FE-TW-PRIM-002  
**Objective:** Create a minimal set of reusable primitives so Tailwind usage stays consistent:
- Page container layout
- Card
- Button variants
- Form field layout
- Badge

### Files to touch / create
- `frontend/src/app/shared/ui/tw/*`
  - `tw-page.component.ts/html` (or just a documented class recipe)
  - `tw-card.component.ts/html`
  - `tw-button.directive.ts` (preferred) OR component
  - `tw-field.component.ts/html`
  - `tw-badge.component.ts/html`
- `frontend/src/styles.css` (only if you define Tailwind component classes via `@layer components`)

### Implementation guidance
- Prefer **utility classes** directly in templates.
- Optional: define a few reusable classes (`.btn`, `.card`, `.field-*`) using Tailwind `@layer components` to keep templates readable.

### DoD
- Primitives exist and are used in at least one page.
- `npm test` passes.

---

## [x ] Task 3 — Convert “Locations” UI to Tailwind (remove component CSS)

**Task ID:** FE-TW-LOC-003  
**Objective:** Replace custom CSS in Locations feature with Tailwind classes.

### Files to touch
- `frontend/src/app/features/locations/**/*.html`
- `frontend/src/app/features/locations/**/*.css|scss` (delete or empty if no longer needed)

### Layout requirements
- Standard page skeleton:
  - max-width container
  - title row with primary action button
  - form in a card
  - list in a card
- Input styling: consistent spacing and focus rings
- Empty/loading/error states

### DoD
- No feature-specific CSS remains in Locations (unless documented exception).
- UI looks consistent on desktop and narrow widths.
- `npm test` passes.

---

## [ ] Task 4 — Convert “Kitas” UI to Tailwind (remove component CSS)

**Task ID:** FE-TW-KITA-004  
**Objective:** Replace custom CSS in Kitas feature with Tailwind classes.

### Files to touch
- `frontend/src/app/features/kitas/**/*.html`
- `frontend/src/app/features/kitas/**/*.css|scss` (delete)

### DoD
- No feature-specific CSS remains in Kitas (unless documented exception).
- Dropdown + form layout consistent with Locations.
- `npm test` passes.

---

## [ ] Task 5 — Convert “Meetings” UI to Tailwind (overlay + forms)

**Task ID:** FE-TW-MEET-005  
**Objective:** Tailwind refactor for Meetings UI, including overlays and forms.

### Files to touch
- `frontend/src/app/features/meetings/**/*.html`
- `frontend/src/app/features/meetings/**/*.css|scss` (delete)
- Overlay component templates if they currently use CSS

### DoD
- Meeting list, meeting creation overlay, nested location overlay use Tailwind.
- Overlays: proper backdrop, centered panel, responsive spacing.
- `npm test` passes.

---

## [ ] Task 6 — Convert “Tasks” UI to Tailwind (list, actions, detail sections)

**Task ID:** FE-TW-TASK-006  
**Objective:** Replace custom CSS in Tasks feature with Tailwind classes.

### Files to touch
- `frontend/src/app/features/tasks/**/*.html`
- `frontend/src/app/features/tasks/**/*.css|scss` (delete)

### DoD
- Task list rows use consistent spacing/typography.
- Actions use Tailwind buttons/badges.
- `npm test` passes.

---

## [ ] Task 7 — Add a guard to prevent new component CSS files (enforce Tailwind)

**Task ID:** FE-TW-GUARD-007  
**Objective:** Add an automated check that fails if new component CSS/SCSS files are introduced.

### Option A (recommended): Node script check
Create:
- `frontend/scripts/check-no-component-css.js`
  Add npm script:
- `"check:styles": "node frontend/scripts/check-no-component-css.js"`

Script must:
- fail if it finds `.component.css` or `.component.scss` under `frontend/src/app/**`
- allow exceptions only in a small allowlist (document in code)

### Option B: Unit test meta-check
Add:
- `frontend/src/app/_meta/no-component-css.spec.ts`
  that scans for forbidden files.

### DoD
- `npm run check:styles` fails when forbidden files are present.
- Add to CI (if CI exists) or document how to run locally.

---

## [ ] Task 8 — Repo-wide sweep to unify Tailwind layout (optional after feature conversions)

**Task ID:** FE-TW-SWEEP-008  
**Objective:** A repo-wide sweep to:
- remove leftover CSS usage
- eliminate inline `style=""` where possible
- unify spacing/typography patterns

### Steps
1) Search for:
  - `.component.css`, `.component.scss`
  - `<style>` blocks
  - inline `style="..."`
2) Replace with Tailwind utilities / primitives.

### DoD
- Search results for component CSS files are 0 (or documented allowlist).
- UI looks consistent across features.
- `npm test` passes.

---

## Global Acceptance Criteria
- Tailwind is the default styling method across the frontend.
- No new per-component CSS files are introduced.
- UI follows a consistent layout system (container + cards + form fields + buttons).
- All tests pass: `cd frontend && npm test`
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

  
