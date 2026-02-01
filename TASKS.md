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

# [ ] Task FE-ANG-CF-001 Replace deprecated `*ngIf` / `*ngFor` with `@if` / `@for` and update SPEC.md

Language: **English** (required)

## Context
Angular’s new built-in control flow syntax (`@if`, `@for`) should be used instead of legacy structural directives (`*ngIf`, `*ngFor`).  
Goal: remove deprecated usage across the frontend and ensure Codex does not reintroduce deprecated templates.

## Objective
1) Replace **all** occurrences of:
- `*ngIf` → `@if (...) { ... }`
- `*ngFor` → `@for (...) { ... }`

2) Update `SPEC.md` with an explicit rule:
- “Do not use deprecated Angular template features (`*ngIf`, `*ngFor`). Use the built-in control flow (`@if`, `@for`).”

3) Add/adjust tests so `npm test` passes.

---

## Scope
### In scope
- All Angular templates (`.html`) under:
  - `frontend/src/app/**`
- Any inline templates in `.ts` files (search for backticks with `*ngIf` / `*ngFor`)
- Any shared components and feature templates

### Out of scope
- Full UI redesign
- Refactoring business logic unrelated to templates

---

## Preconditions / Compatibility Check
Before changing templates, verify:
- Angular version supports built-in control flow (Angular 17+).
- `tsconfig` / build is configured to use it (usually default in Angular 17+).

If the repo is not on Angular 17+, add a **TODO** note and stop; do not partially convert.

---

## Implementation Steps

### 1) Add a “Frontend Rules” section in `SPEC.md`
Update `SPEC.md` (or add a subsection under “Constraints”):
- Use Angular built-in control flow:
  - `@if`, `@for`, `@switch` (if applicable)
- Do not use:
  - `*ngIf`, `*ngFor`, `*ngSwitch`
- Prefer `track` in `@for`

Example snippet for SPEC.md:
```md
### Frontend (Angular) rules
- Use Angular built-in control flow: `@if`, `@for`, `@switch`.
- Do not use deprecated structural directives: `*ngIf`, `*ngFor`, `*ngSwitch`.
- Always use `track` in `@for` loops (e.g., `track item.id`).
```

### 2) Replace `*ngIf` with `@if`
Common patterns:

**Before**
```html
<div *ngIf="isLoading">Loading...</div>
```

**After**
```html
@if (isLoading) {
  <div>Loading...</div>
}
```

**Before (else block)**
```html
<div *ngIf="items?.length; else empty">...</div>
<ng-template #empty>Empty</ng-template>
```

**After**
```html
@if (items?.length) {
  <div>...</div>
} @else {
  <div>Empty</div>
}
```

> Replace `<ng-template #...>` else blocks with `@else` where possible.

### 3) Replace `*ngFor` with `@for`
**Before**
```html
<li *ngFor="let item of items; trackBy: trackById">{{ item.title }}</li>
```

**After**
```html
@for (item of items; track item.id) {
  <li>{{ item.title }}</li>
}
```

If there is no stable id, use index:
```html
@for (item of items; track $index) { ... }
```

### 4) Handle `*ngIf` + `*ngFor` combinations
If nested directives exist, refactor with nested blocks:

```html
@if (items?.length) {
  @for (item of items; track item.id) {
    <app-item [item]="item" />
  }
} @else {
  <app-empty-state />
}
```

### 5) Update inline templates (if any)
Search for `template: \`` and update control flow blocks similarly.

---

## Files to touch
- `SPEC.md`
- All affected Angular templates:
  - `frontend/src/app/**/*.html`
- Potentially affected inline templates:
  - `frontend/src/app/**/*.ts`

---

## Tests
### Required checks
1) `cd frontend && npm test`
2) `cd frontend && npm run build` (if available)

### Add a guard test (recommended)
Add a lightweight test or script check that fails if deprecated directives are present.

**Option A (preferred): Jest/Vitest test**
Create `frontend/src/app/_meta/no-deprecated-template-syntax.spec.ts`:
- Read template files and assert they do not contain `*ngIf` or `*ngFor`.

**Option B: npm script**
Add `"check:templates": "grep -R \"\\*ngIf\\|\\*ngFor\" -n frontend/src/app && exit 1 || exit 0"`  
(Only if your CI environment supports grep; otherwise prefer Option A.)

---

## Acceptance Criteria
- There are **zero** `*ngIf` and `*ngFor` in the frontend codebase.
- All templates compile using `@if` / `@for`.
- SPEC.md contains the rule preventing deprecated syntax from being used again.
- All unit tests pass.

---

## Definition of Done (DoD)
- Search result count for `*ngIf` and `*ngFor` is 0.
- `npm test` passes.
- `SPEC.md` updated with the Angular template rules.

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

  
