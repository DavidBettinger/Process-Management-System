# Architecture & Decisions (MVP 1)

## 1) Overview
We build a modular monolith with clear bounded contexts:
- Case Management (ProcessCase + stakeholders)
- Collaboration (Meetings + Tasks)
- Analytics Read Models (timeline/contribution projections)
- Identity & Access (OIDC/Keycloak integration later)

We use Hexagonal Architecture:
- Presentation (REST controllers)
- Application (use cases, commands, policies)
- Domain (aggregates, invariants, events)
- Infrastructure (persistence, outbox, projections)

## 2) Folder Structure (proposed)

### Backend (`/backend`)
backend/

src/main/java/de/bettinger/processmgmt/

common/

auth/

errors/

time/

outbox/

casemanagement/

api/

application/

domain/

infrastructure/

collaboration/

api/

application/

domain/

infrastructure/

analytics/

api/

application/

infrastructure/

src/test/java/…
### Frontend (`/frontend`)
processmgmt-frontend/

src/app/

core/ (auth, http, error handling)

features/

cases/

meetings/

tasks/

timeline/

shared/

## 3) Major Components

### Backend
- CaseManagementService: create/activate cases, manage stakeholders
- CollaborationService: meetings + tasks use cases and validation policies
- OutboxPublisher (later): forwards domain events to message bus (optional in MVP)
- AnalyticsProjector: builds read models from outbox events (MVP can project inside the same app)

### Frontend
- Case List + Case Detail
- Meeting Editor (schedule/hold)
- Task Board (list + actions)
- Timeline View

## 4) Persistence

### Primary OLTP database (PostgreSQL)
Tables (initial, minimal; exact DDL is TODO):
- cases
- case_stakeholders
- meetings
- tasks
- outbox_events
- timeline_projection (optional, can also be derived on-the-fly in MVP)

Decision: Start with normal tables for aggregates + an Outbox table for events.
We are NOT doing full event sourcing in MVP 1.

### Outbox Event Schema (minimal)
- id (UUID)
- aggregateType
- aggregateId
- eventType
- occurredAt (timestamp)
- payload (jsonb)
- status (NEW, PUBLISHED) [optional in MVP]
- traceId [optional]

## 5) APIs (MVP 1)

Base path: `/api`

### Health
GET `/api/health`
Response 200:
```json
{ "status": "ok" }
```

### Cases
#### Create case
POST `/api/cases`
Request:
```json
{ "title": "Introduce Child Protection Concept", "kitaName": "Kita Sonnenblume" }
```
Response 201:
```json
{ "id": "uuid", "status": "DRAFT" }
```
#### Add stakeholder
POST /api/cases/{caseId}/stakeholders
Request:
```json
{ "userId": "u-201", "role": "DIRECTOR" }
```
Response 200:
```json
{ "caseId": "uuid", "stakeholders": [ ... ] }
```
#### Activate case
POST /api/cases/{caseId}/activate
Response 200:
```json
{ "id": "uuid", "status": "ACTIVE" }
```

#### Get case details
GET /api/cases/{caseId}
Response 200: (includes stakeholders)

Meetings

#### Schedule meeting
POST /api/cases/{caseId}/meetings
Request:
```json
{ "scheduledAt": "2026-02-01T10:00:00Z", "participantIds": ["u-101","u-201"] }
```

#### Hold meeting (store minutes + create tasks)
POST /api/cases/{caseId}/meetings/{meetingId}/hold
Request:
```json
{
  "heldAt": "2026-02-01T10:00:00Z",
  "participantIds": ["u-101","u-201"],
  "minutesText": "We discussed next steps...",
  "actionItems": [
    { "key": "ai-1", "title": "Draft concept v1", "assigneeId": "u-201", "dueDate": "2026-02-10" },
    { "key": "ai-2", "title": "Collect existing policies", "assigneeId": null, "dueDate": null }
  ]
}
```
Response 200:
```json
{ "meetingId": "uuid", "createdTaskIds": ["uuid1","uuid2"] }
```
Idempotency rule:
•	actionItems[].key must be stable per meeting. If repeated, do not create duplicates.

Tasks

Create task (standalone)
POST /api/cases/{caseId}/tasks
Request:
```json
{ "title": "Prepare checklist", "description": "", "dueDate": "2026-02-10" }
```
Assign task
POST /api/tasks/{taskId}/assign
Request:
```json
{ "assigneeId": "u-201" }
```
Start work
POST /api/tasks/{taskId}/start

Block/unblock
POST /api/tasks/{taskId}/block
Request:
```json
{ "reason": "Waiting for external input" }
```
POST /api/tasks/{taskId}/unblock

Decline assignment (not responsible)
POST /api/tasks/{taskId}/decline
Request:
```json
{ "reason": "Not responsible", "suggestedAssigneeId": "u-101" }
```
Resolve task
POST /api/tasks/{taskId}/resolve
Request:
```json
{ "kind": "COMPLETED", "reason": "Done", "evidenceRefs": [] }
```
Analytics

Timeline
GET /api/cases/{caseId}/timeline
Response:
```json
{
  "caseId": "uuid",
  "entries": [
    { "type": "MEETING_HELD", "occurredAt": "2026-02-01T10:00:00Z", "meetingId": "..." },
    { "type": "TASK_CREATED", "occurredAt": "2026-02-01T10:05:00Z", "taskId": "..." },
    { "type": "TASK_ASSIGNED", "occurredAt": "2026-02-01T10:06:00Z", "taskId": "...", "assigneeId": "u-201" }
  ]
}
```
6) Auth Strategy (MVP)
   •	Target: OIDC with Keycloak.
   •	MVP approach:
   •	Dev mode can use a fixed user header (e.g., X-Dev-UserId) behind a dev profile.
   •	Always include tenantId (e.g., header X-Tenant-Id) in dev mode.
   TODO:
   •	Add proper JWT validation and mapping to userId + tenantId.

Authorization rule (MVP):
•	A user can view/edit a case only if they are a stakeholder of the case.
•	Consultant role can do all actions; other roles can update tasks assigned to them and view the case.

7) Error Handling

Standard error response:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "details": { "field": "must not be blank" },
  "traceId": "abc-123"
}
```
8) Logging & Metrics
   •	Log:
   •	request method/path, status, traceId
   •	do not log minutesText or sensitive fields
   •	Metrics (later):
   •	request latency, error rates
   •	outbox backlog size

9) UI Wireframes (ASCII)

Case Detail
```
[Case: Introduce Child Protection Concept]  Status: ACTIVE

Stakeholders:
- u-101 (CONSULTANT)
- u-201 (DIRECTOR)

Tabs: [Tasks] [Meetings] [Timeline]

Tasks tab:
- Draft concept v1   ASSIGNED to u-201   due 2026-02-10
- Collect policies   OPEN               no due date
```
Timeline
```
2026-02-01 10:00  Meeting held (participants: u-101,u-201)
2026-02-01 10:05  Task created: Draft concept v1
2026-02-01 10:06  Task assigned to u-201
```
