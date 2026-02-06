# Project Spec — Kita Process Management (MVP 1)

## A) One-liner + Goals

### One-liner
A process management app for **Kita consulting** (Fachberatung) to document and steer **process cases** (e.g., introducing child protection), including meetings, tasks, stakeholder roles, and basic analytics/diagrams.

### Who is it for?
- Primary: Kita consultants (Fachberatung)
- Secondary: Kita leadership/team members involved in a case
- Admin: organization/tenant administrators (later)

### Goals (3–5)
1. Create and manage **Process Cases** with assigned **Stakeholders** and roles.
2. Record **Meetings** (agenda + minutes) and create **Tasks** from meetings.
3. Track **Tasks** with a clear lifecycle, including “not completed” and “not applicable / not responsible”.
4. Provide basic **case timeline** and **stakeholder contribution** views powered by domain events.
5. Support a modular architecture that can evolve to templates and advanced analytics.

### Non-goals (2–3)
- Full BPMN workflow engine (no complex branching automation in MVP 1).
- Full event sourcing of all aggregates (we will use domain events + outbox, not reconstruct state from events).
- External integrations (calendar sync, email notifications) in MVP 1.

---

## B) User Stories (Top 10)

(P0 = must for MVP 1, P1 = likely next, P2 = later)

1. **(P0)** As a consultant, I want to create a process case for a specific Kita so that I can manage the engagement over time.
2. **(P0)** As a consultant, I want to add stakeholders with roles to a case so that responsibilities are clear.
3. **(P0)** As a consultant, I want to schedule and hold meetings with minutes so that decisions and progress are documented.
4. **(P0)** As a consultant, I want to create tasks and assign them to stakeholders so that work items are tracked.
5. **(P0)** As a stakeholder, I want to change task status (in progress, blocked, resolved) so that progress is visible.
6. **(P0)** As a consultant, I want to close a task as “not completed” with a reason so that failures are explicitly documented.
7. **(P0)** As a stakeholder, I want to decline an assignment (“not responsible”) so that tasks can be reassigned correctly.
8. **(P0)** As a consultant, I want to see a timeline of meetings and tasks so that I can reconstruct how the process unfolded.
9. **(P1)** As a consultant, I want to upload/link evidence to tasks so that outcomes are verifiable.
10. **(P2)** As an analyst, I want to compare multiple cases by metrics so that we can learn what works.

---

## C) Scope Boundaries

### Included (MVP 1)
- Tenant-aware backend skeleton
- Process cases
- Process case list endpoint (`GET /api/cases`)
- Case stakeholders and roles
- Paginated stakeholder lists and stakeholder task lists
- Meetings (scheduled/held/cancelled) with minutes
- Meetings list endpoint (`GET /api/cases/{caseId}/meetings`)
- Tasks with lifecycle and resolution types:
    - completed, not completed, not applicable, cancelled
- Health check endpoint (`GET /api/health`)
- Basic read models for:
    - timeline
    - stakeholder contribution (minimal)
- Authentication strategy defined (implementation may start minimal)

### Excluded (MVP 1)
- Process templates
- Advanced analytics dashboards (beyond the basic timeline/contribution)
- Real-time collaboration (editing locks, websockets)
- External notifications
- Complex permission matrix beyond simple role-based checks (we keep it simple first)

---

## D) Key Flows

1. **Create case → add stakeholders → activate case**
2. **Schedule meeting → hold meeting → write minutes → create tasks from action items**
   - Action items can include title, priority, description, due date, and optional assignee.
   - Planned meetings can be edited before they are held.
3. **Assign task → assignee works → mark blocked/unblocked → resolve**
4. **Assignee declines assignment → task returns to open → consultant reassigns**
5. **View case timeline → filter by stakeholder/task resolution**

---

## E) Data & Domain

### Core Entities (rough)
- ProcessCase
    - id, tenantId, title, kitaId, status, createdAt
- Kita
    - id, tenantId, name, locationId, createdAt
- Location
    - id, tenantId, label, address, createdAt
- CaseStakeholder
    - stakeholderId (userId), roleInCase
- Meeting
    - id, caseId, title, description?, status, scheduledAt, heldAt, locationId, participants[], minutesText
- Task
    - id, caseId, originMeetingId?, title, description, dueDate?
    - assigneeId?
    - state (OPEN, ASSIGNED, IN_PROGRESS, BLOCKED, RESOLVED)
    - resolutionKind? (COMPLETED, NOT_COMPLETED, NOT_APPLICABLE, CANCELLED)
    - resolutionReason?, resolvedBy?, resolvedAt?
    - If `assigneeId` is provided on creation, the task starts in `ASSIGNED` and a `TaskAssigned` event is emitted.

### Domain Events (minimal)
- CaseCreated
- StakeholderAddedToCase
- CaseActivated (optional but useful)
- MeetingHeld (includes createdTaskIds and participantIds)
- TaskCreated
- TaskAssigned
- TaskAssignmentDeclined
- TaskStateChanged (optional; can be derived but helpful)
- TaskResolved

### Example Objects (JSON)

#### ProcessCase
```json
{
  "id": "2b1e6d57-8b52-41a8-a2d3-7c1f1a9f1d16",
  "tenantId": "tenant-001",
  "title": "Introduce Child Protection Concept",
  "kitaId": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
  "status": "ACTIVE",
  "stakeholders": [
    { "userId": "u-101", "role": "CONSULTANT" },
    { "userId": "u-201", "role": "DIRECTOR" },
    { "userId": "u-301", "role": "TEAM_MEMBER" }
  ],
  "createdAt": "2026-01-28T10:00:00Z"
}
```
#### Task (resolved as NOT_COMPLETED)
```json
{
  "id": "1d4e6c8a-6dc3-4a1b-9a68-5c4e5d2c84f0",
  "caseId": "2b1e6d57-8b52-41a8-a2d3-7c1f1a9f1d16",
  "originMeetingId": "f8c25b59-5c5b-4d78-9d9c-57cb9d0f3cdb",
  "title": "Draft child protection concept v1",
  "state": "RESOLVED",
  "assigneeId": "u-201",
  "resolutionKind": "NOT_COMPLETED",
  "resolutionReason": "Team capacity constraints; postponed to next quarter",
  "resolvedBy": "u-101",
  "resolvedAt": "2026-02-10T12:00:00Z"
}
```
#### Task summary (list response)
```json
{
  "id": "1d4e6c8a-6dc3-4a1b-9a68-5c4e5d2c84f0",
  "title": "Draft child protection concept v1",
  "state": "ASSIGNED",
  "assigneeId": "u-201"
}
```
#### Task assignment declined (not responsible)
```json
{
  "taskId": "1d4e6c8a-6dc3-4a1b-9a68-5c4e5d2c84f0",
  "declinedBy": "u-301",
  "reason": "I am not responsible for concept drafting; director should own this",
  "suggestedAssigneeId": "u-201"
}
```
### Acceptance Criteria (for each P0 story)

#### P0-1 Create a process case
•	Given I am authenticated
•	When I POST /cases with a valid payload
•	Then I receive 201 and the new case id
•	And a CaseCreated event is stored in the outbox

#### P0-2 Add stakeholders to a case
•	Given a case exists
•	When I POST /cases/{id}/stakeholders with a valid userId and role
•	Then the stakeholder is added
•	And StakeholderAddedToCase event is stored

#### P0-3 Hold a meeting with minutes
•	Given a case is ACTIVE and participants belong to the case
•	When I POST /cases/{id}/meetings/{meetingId}/hold with minutes
•	Then the meeting status becomes HELD
•	And MeetingHeld event is stored

#### P0-4 Create and assign tasks
•	Given a case is ACTIVE
•	When I POST /cases/{id}/tasks
•	Then task is created with state OPEN
•	When I POST /tasks/{taskId}/assign with an assignee in the case
•	Then state becomes ASSIGNED and TaskAssigned event is stored

#### P0-5 Task lifecycle updates
•	Given a task is ASSIGNED
•	When I POST /tasks/{taskId}/start
•	Then state becomes IN_PROGRESS
•	When I POST /tasks/{taskId}/block with a reason
•	Then state becomes BLOCKED

#### P0-6 Close task as NOT_COMPLETED
•	Given a task is not RESOLVED
•	When I POST /tasks/{taskId}/resolve with kind NOT_COMPLETED and reason
•	Then state becomes RESOLVED and resolution is stored
•	And TaskResolved event is stored

#### P0-7 Decline assignment (not responsible)
•	Given I am the current assignee of the task
•	When I POST /tasks/{taskId}/decline with a reason
•	Then assignee becomes null and state becomes OPEN
•	And TaskAssignmentDeclined event is stored

#### P0-8 View timeline
•	Given a case exists
•	When I GET /cases/{id}/timeline
•	Then I receive events or projected entries ordered by occurredAt
•	And entries include meeting/task creation/assignment/resolution

#### P0-9 View case list
•	Given I am authenticated
•	When I GET /cases
•	Then I receive 200 and a list of cases for my tenant

### Constraints

#### Tech stack
•	Backend: Java 25, Spring Boot, Gradle, PostgreSQL
•	Frontend: Angular, TypeScript strict
•	Auth: Keycloak or OIDC provider (MVP can start with mocked auth in dev)

#### Performance
•	MVP targets: < 300ms for typical reads (case list, case details, timeline) on small datasets.
•	Writes: must be consistent; use single DB transaction per command.

#### Security & privacy
•	Tenant isolation required (tenantId on all data).
•	Basic role-based access: user must be a stakeholder in the case to view/edit it (MVP rule).
•	Logs must not contain full minutes text.

#### Accessibility
•	Frontend should support keyboard navigation and readable contrast (WCAG-minded; full audit later).

#### Hosting
•	Local dev via Docker Compose (Postgres + Keycloak later).
•	Production target: containerized deployment.

#### Browser support
•	Latest Chrome/Firefox/Edge, plus current Safari.

### Styling rules (Tailwind)
- Use Tailwind utility classes for all UI styling.
- Do not add new component CSS/SCSS files unless absolutely necessary (document why).
- Prefer shared Tailwind-based UI primitives over one-off styles.
- If a style cannot be expressed with Tailwind utilities, use Tailwind config or a single global stylesheet section (no per-component CSS).

### Tailwind UI primitives
Reusable primitives live in `frondend/src/app/shared/ui/tw` and must be reused before creating custom markup:
- `app-tw-page` (page container + header)
- `app-tw-card` (surface container)
- `app-tw-field` (label + hint + error wrapper)
- `app-tw-badge` (status labels)
- `appTwButton` (button directive with variants)

### Frontend (Angular) rules
- Use Angular built-in control flow: `@if`, `@for`, `@switch`.
- Do not use deprecated structural directives: `*ngIf`, `*ngFor`, `*ngSwitch`.
- Always use `track` in `@for` loops (e.g., `track item.id`).
