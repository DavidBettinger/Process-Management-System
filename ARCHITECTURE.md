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
frontend/

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

### Data Contracts (DTOs)

#### Address (Value Object)
```json
{
  "street": "Musterstraße",
  "houseNumber": "12",
  "postalCode": "10115",
  "city": "Berlin",
  "country": "DE"
}
```
Fields:
- `street` (string, required)
- `houseNumber` (string, required)
- `postalCode` (string, required)
- `city` (string, required)
- `country` (string, optional; default `"DE"`)

#### Location
```json
{
  "id": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "tenantId": "tenant-001",
  "label": "Kita Sonnenblume",
  "address": {
    "street": "Musterstraße",
    "houseNumber": "12",
    "postalCode": "10115",
    "city": "Berlin",
    "country": "DE"
  },
  "createdAt": "2026-01-29T09:00:00Z"
}
```
Fields:
- `id` (UUID string)
- `tenantId` (string; may be implicit in auth/headers)
- `label` (string, required)
- `address` (Address, required)
- `createdAt` (ISO timestamp, optional but recommended)

#### Kita
```json
{
  "id": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
  "tenantId": "tenant-001",
  "name": "Kita Sonnenblume",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "createdAt": "2026-01-29T09:10:00Z"
}
```
Fields:
- `id` (UUID string)
- `tenantId` (string; may be implicit)
- `name` (string, required)
- `locationId` (UUID string, required)
- `createdAt` (ISO timestamp, optional but recommended)

#### ProcessCase (updated)
```json
{
  "id": "2b1e6d57-8b52-41a8-a2d3-7c1f1a9f1d16",
  "tenantId": "tenant-001",
  "title": "Introduce Child Protection Concept",
  "kitaId": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
  "status": "ACTIVE",
  "stakeholders": [
    { "userId": "u-101", "role": "CONSULTANT" },
    { "userId": "u-201", "role": "DIRECTOR" }
  ],
  "createdAt": "2026-01-28T10:00:00Z"
}
```

#### Meeting (updated)
```json
{
  "id": "f8c25b59-5c5b-4d78-9d9c-57cb9d0f3cdb",
  "caseId": "2b1e6d57-8b52-41a8-a2d3-7c1f1a9f1d16",
  "status": "HELD",
  "scheduledAt": "2026-02-01T10:00:00Z",
  "heldAt": "2026-02-01T10:00:00Z",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "participantIds": ["u-101","u-201"],
  "minutesText": "We discussed next steps..."
}
```
Fields:
- `locationId` (UUID string, required)
- UI identification rule:
  - Display label: `heldAt || scheduledAt` + resolved `Location.label`

#### Stakeholder (global)
```json
{
  "id": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f",
  "tenantId": "tenant-001",
  "firstName": "Maria",
  "lastName": "Becker",
  "role": "CONSULTANT",
  "createdAt": "2026-01-30T10:00:00Z"
}
```
Fields:
- `id` (UUID string)
- `tenantId` (string; may be implicit)
- `firstName` (string, required, max 100)
- `lastName` (string, required, max 100)
- `role` (StakeholderRole, required)
- `createdAt` (ISO timestamp, optional but recommended)

#### CreateStakeholderRequest
```json
{
  "firstName": "Maria",
  "lastName": "Becker",
  "role": "CONSULTANT"
}
```

Stakeholder roles vs. case roles:
- `Stakeholder.role` is the global role of a person/entity.
- `ProcessCase.stakeholders[].role` is the role **in that case** (case-specific).

Base path: `/api`

### Health
GET `/api/health`
Response 200:
```json
{ "status": "ok" }
```

### Locations & Kitas

#### Create Location
POST `/api/locations`
Request:
```json
{
  "label": "Kita Sonnenblume",
  "address": {
    "street": "Musterstraße",
    "houseNumber": "12",
    "postalCode": "10115",
    "city": "Berlin",
    "country": "DE"
  }
}
```
Response 201:
```json
{ "id": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8" }
```

#### List Locations
GET `/api/locations`
Response 200:
```json
{
  "items": [
    {
      "id": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
      "label": "Kita Sonnenblume",
      "address": {
        "street": "Musterstraße",
        "houseNumber": "12",
        "postalCode": "10115",
        "city": "Berlin",
        "country": "DE"
      }
    }
  ]
}
```

#### Get Location
GET `/api/locations/{locationId}`
Response 200:
```json
{
  "id": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "label": "Kita Sonnenblume",
  "address": {
    "street": "Musterstraße",
    "houseNumber": "12",
    "postalCode": "10115",
    "city": "Berlin",
    "country": "DE"
  }
}
```

#### Create Kita
POST `/api/kitas`
Request:
```json
{
  "name": "Kita Sonnenblume",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8"
}
```
Response 201:
```json
{ "id": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2" }
```

#### List Kitas
GET `/api/kitas`
Response 200:
```json
{
  "items": [
    {
      "id": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
      "name": "Kita Sonnenblume",
      "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8"
    }
  ]
}
```

#### Get Kita
GET `/api/kitas/{kitaId}`
Response 200:
```json
{
  "id": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
  "name": "Kita Sonnenblume",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8"
}
```

### Stakeholders

#### Create Stakeholder
POST `/api/stakeholders`
Request:
```json
{
  "firstName": "Maria",
  "lastName": "Becker",
  "role": "CONSULTANT"
}
```
Response 201:
```json
{ "id": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f" }
```

#### List Stakeholders
GET `/api/stakeholders`
Response 200:
```json
{
  "items": [
    {
      "id": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f",
      "firstName": "Maria",
      "lastName": "Becker",
      "role": "CONSULTANT"
    }
  ]
}
```

#### List Tasks for Stakeholder
GET `/api/stakeholders/{stakeholderId}/tasks`
Response 200:
```json
{
  "stakeholderId": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f",
  "items": [
    {
      "id": "1d4e6c8a-6dc3-4a1b-9a68-5c4e5d2c84f0",
      "caseId": "2b1e6d57-8b52-41a8-a2d3-7c1f1a9f1d16",
      "title": "Draft child protection concept v1",
      "state": "ASSIGNED",
      "assigneeId": "8a4a1cf3-6bbf-4f44-b8b8-6a0a0e5b8d2f",
      "dueDate": "2026-02-10"
    }
  ]
}
```

### Cases
#### Create case
POST `/api/cases`
Request:
```json
{ "title": "Introduce Child Protection Concept", "kitaId": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2" }
```
Response 201:
```json
{ "id": "uuid", "status": "DRAFT" }
```
#### List cases
GET `/api/cases`
Response 200:
```json
{
  "items": [
    {
      "id": "uuid",
      "tenantId": "tenant-1",
      "title": "Introduce Child Protection Concept",
      "kitaId": "a7c9a0bb-2f0b-4f2d-a7c2-2b4bf7a1b6e2",
      "status": "DRAFT",
      "stakeholders": [],
      "createdAt": "2026-01-28T10:00:00Z"
    }
  ]
}
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
{
  "scheduledAt": "2026-02-01T10:00:00Z",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
  "participantIds": ["u-101","u-201"]
}
```
Response 201:
```json
{ "id": "uuid", "status": "SCHEDULED", "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8" }
```

#### Hold meeting (store minutes + create tasks)
POST /api/cases/{caseId}/meetings/{meetingId}/hold
Request:
```json
{
  "heldAt": "2026-02-01T10:00:00Z",
  "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8",
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
Response 201:
```json
{ "id": "uuid", "state": "OPEN" }
```
List tasks
GET /api/cases/{caseId}/tasks
Response 200:
```json
{
  "items": [
    { "id": "uuid", "state": "OPEN", "assigneeId": null }
  ]
}
```
Assign task
POST /api/tasks/{taskId}/assign
Request:
```json
{ "assigneeId": "u-201" }
```
Response 200:
```json
{ "id": "uuid", "state": "ASSIGNED", "assigneeId": "u-201" }
```
Start work
POST /api/tasks/{taskId}/start
Response 200:
```json
{ "id": "uuid", "state": "IN_PROGRESS", "assigneeId": "u-201" }
```

Block/unblock
POST /api/tasks/{taskId}/block
Request:
```json
{ "reason": "Waiting for external input" }
```
POST /api/tasks/{taskId}/unblock
Response 200:
```json
{ "id": "uuid", "state": "IN_PROGRESS", "assigneeId": "u-201" }
```

Decline assignment (not responsible)
POST /api/tasks/{taskId}/decline
Request:
```json
{ "reason": "Not responsible", "suggestedAssigneeId": "u-101" }
```
Response 200:
```json
{ "id": "uuid", "state": "OPEN", "assigneeId": null }
```
Resolve task
POST /api/tasks/{taskId}/resolve
Request:
```json
{ "kind": "COMPLETED", "reason": "Done", "evidenceRefs": [] }
```
Response 200:
```json
{ "id": "uuid", "state": "RESOLVED", "assigneeId": "u-201" }
```
Analytics

Timeline
GET /api/cases/{caseId}/timeline
Response:
```json
{
  "caseId": "uuid",
  "entries": [
    {
      "type": "MEETING_HELD",
      "occurredAt": "2026-02-01T10:00:00Z",
      "meetingId": "...",
      "locationId": "b1f3f7c2-2c9f-4f9f-bb33-4e0f2a6f6bf8"
    },
    { "type": "TASK_CREATED", "occurredAt": "2026-02-01T10:05:00Z", "taskId": "..." },
    { "type": "TASK_ASSIGNED", "occurredAt": "2026-02-01T10:06:00Z", "taskId": "...", "assigneeId": "u-201" }
  ]
}
```

Edge Cases & Validation
1) Location not found:
   - Creating a Kita with unknown `locationId` returns 404.
2) Kita not found:
   - Creating a case with unknown `kitaId` returns 404.
3) Tenant isolation:
   - Cross-tenant IDs must be rejected (404 or 403, pick consistently at implementation time).
4) Meeting identification:
   - If `heldAt` is null (scheduled only), UI uses `scheduledAt + Location.label`.
5) Validation errors:
   - Missing required address fields return 400 with field-level details.
6) Auth Strategy (MVP)
   •	Target: OIDC with Keycloak.
   •	MVP approach:
   •	Dev mode uses fixed headers: X-Dev-UserId and X-Tenant-Id.
   •	Missing dev headers return 401 with the standard error envelope.
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

## Frontend

Frontend State Management (Angular Signals) — Concrete Store API

Principles
•	One store per feature (cases list, case detail, tasks, timeline, meetings).
•	Stores own:
•	state signals
•	computed selectors
•	async methods calling typed API clients
•	Components are mostly “dumb”: they call store methods and read signals/computed.
•	Each store exposes the same base signals: loading, error, lastUpdatedAt.

⸻

Shared State Types

File: frontend/src/app/core/state/state.types.ts
```
export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface StoreError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
}

export interface EntityState<T> {
  status: LoadStatus;
  data: T | null;
  error: StoreError | null;
  lastUpdatedAt: string | null; // ISO
}

export interface ListState<T> {
  status: LoadStatus;
  items: T[];
  error: StoreError | null;
  lastUpdatedAt: string | null; // ISO
}
```

Standard Store Conventions

Store method naming
•	loadX() for GET requests
•	createX() for POST create
•	updateX() for updates (if needed)
•	performXAction() for command endpoints (assign/resolve/decline/etc.)
•	Always return Promise<void> (store updates are in signals)

Store signals

Every store should expose:
•	status (or state().status)
•	error
•	isLoading computed
•	hasError computed

⸻

Store 1: CasesStore (Case List)

File: frontend/src/app/features/cases/state/cases.store.ts

State
•	list of cases
•	optional “creating” flag (or reuse status)

API
```
export class CasesStore {
  // signals
  readonly state = signal<ListState<ProcessCase>>({
    status: 'idle',
    items: [],
    error: null,
    lastUpdatedAt: null,
  });

  // selectors
  readonly cases = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);

  // methods
  loadCases(): Promise<void>;

  createCase(req: CreateCaseRequest): Promise<void>;
}
```

Behavior rules
•	loadCases() sets status=loading, clears error, fills items on success.
•	createCase():
•	calls API
•	on success either:
•	Option A (simple): re-call loadCases()
•	Option B (faster): append created case and set status success
•	show toast in component (or in store if you centralize UI side effects)

⸻

Store 2: CaseDetailStore (Case Header + Stakeholders + Status)

File: frontend/src/app/features/case-detail/state/case-detail.store.ts

State
•	selected case details (includes stakeholders)
•	selected caseId

API
```
export class CaseDetailStore {
  readonly caseId = signal<string | null>(null);

  readonly state = signal<EntityState<ProcessCase>>({
    status: 'idle',
    data: null,
    error: null,
    lastUpdatedAt: null,
  });

  readonly caseData = computed(() => this.state().data);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');

  // convenience selectors
  readonly stakeholders = computed(() => this.state().data?.stakeholders ?? []);
  readonly caseStatus = computed(() => this.state().data?.status ?? null);
  readonly canActivate = computed(() => {
    const c = this.state().data;
    if (!c) return false;
    const hasConsultant = (c.stakeholders ?? []).some(s => s.role === 'CONSULTANT');
    return c.status === 'DRAFT' || c.status === 'PAUSED' ? hasConsultant : false;
  });

  // methods
  setCaseId(caseId: string): void;

  loadCase(): Promise<void>; // uses caseId()
  addStakeholder(req: AddStakeholderRequest): Promise<void>;
  activateCase(): Promise<void>;
}
```
Behavior rules
•	setCaseId() sets caseId and resets state to idle (optional).
•	loadCase() requires caseId not null; otherwise set error with code MISSING_CASE_ID.
•	After addStakeholder() and activateCase():
•	simplest is await loadCase() to refresh canonical state.

⸻

Store 3: TasksStore (Tasks Tab)

File: frontend/src/app/features/tasks/state/tasks.store.ts

State
•	caseId
•	list of tasks for that case
•	optional busyTaskIds set to disable buttons per task while a request is running

API
```
export class TasksStore {
  readonly caseId = signal<string | null>(null);

  readonly state = signal<ListState<Task>>({
    status: 'idle',
    items: [],
    error: null,
    lastUpdatedAt: null,
  });

  // Track per-task busy state to avoid double clicks
  readonly busyTaskIds = signal<Set<string>>(new Set());

  readonly tasks = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');

  setCaseId(caseId: string): void;

  loadTasks(): Promise<void>; // GET tasks by case

  createTask(req: CreateTaskRequest): Promise<void>;

  assignTask(taskId: string, req: AssignTaskRequest): Promise<void>;
  startTask(taskId: string): Promise<void>;
  blockTask(taskId: string, reason: string): Promise<void>;
  unblockTask(taskId: string): Promise<void>;
  declineTask(taskId: string, req: DeclineTaskRequest): Promise<void>;
  resolveTask(taskId: string, req: ResolveTaskRequest): Promise<void>;

  // helpers
  isBusy(taskId: string): boolean;
}
```

Action enablement helpers (recommended)

Add pure helpers in task.model.ts:
•	canAssign(task)
•	canStart(task)
•	canBlock(task)
•	canUnblock(task)
•	canDecline(task) (only if user is assignee; in MVP dev, use dev userId)
•	canResolve(task) (not resolved)

Behavior rules
•	Every action method:
1.	marks task busy (busyTaskIds.add(taskId))
2.	calls API
3.	on success refreshes tasks (await loadTasks()) or patch updates locally
4.	clears busy in finally block
•	On invalid transition:
•	API returns 400/409 → show toast via component using errorMapper.

⸻

Store 4: MeetingsStore (Meetings Tab + Hold Meeting)

File: frontend/src/app/features/meetings/state/meetings.store.ts

State
•	caseId
•	list of meetings (if endpoint exists)
•	last hold result (created task IDs)

API
```
export class MeetingsStore {
  readonly caseId = signal<string | null>(null);

  readonly meetingsState = signal<ListState<Meeting>>({
    status: 'idle',
    items: [],
    error: null,
    lastUpdatedAt: null,
  });

  readonly holdResult = signal<HoldMeetingResponse | null>(null);

  readonly meetings = computed(() => this.meetingsState().items);
  readonly status = computed(() => this.meetingsState().status);
  readonly error = computed(() => this.meetingsState().error);
  readonly isLoading = computed(() => this.meetingsState().status === 'loading');

  setCaseId(caseId: string): void;

  loadMeetings(): Promise<void>; // TODO if endpoint not ready
  scheduleMeeting(req: ScheduleMeetingRequest): Promise<void>; // TODO if endpoint not ready

  holdMeeting(meetingId: string, req: HoldMeetingRequest): Promise<void>;
  clearHoldResult(): void;
}
```
Hold meeting: stable action item keys
•	In UI, when adding action items, generate key with crypto.randomUUID().
•	Ensure keys persist while editing, so retries don’t duplicate tasks.

⸻

Store 5: TimelineStore (Timeline Tab)

File: frontend/src/app/features/timeline/state/timeline.store.ts

State
•	caseId
•	entries list

API
```
export class TimelineStore {
  readonly caseId = signal<string | null>(null);

  readonly state = signal<EntityState<CaseTimeline>>({
    status: 'idle',
    data: null,
    error: null,
    lastUpdatedAt: null,
  });

  readonly timeline = computed(() => this.state().data?.entries ?? []);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isEmpty = computed(() => this.state().status === 'success' && (this.state().data?.entries?.length ?? 0) === 0);

  setCaseId(caseId: string): void;
  loadTimeline(): Promise<void>;
}
```

Cross-Store Coordination (Case Detail Page)

On the Case Detail route (/cases/:caseId), do:
•	caseDetailStore.setCaseId(id); caseDetailStore.loadCase();
•	tasksStore.setCaseId(id); tasksStore.loadTasks();
•	meetingsStore.setCaseId(id); meetingsStore.loadMeetings(); (if supported)
•	timelineStore.setCaseId(id); timelineStore.loadTimeline();

When holding a meeting:
•	await meetingsStore.holdMeeting(...)
•	then refresh:
•	await tasksStore.loadTasks()
•	await timelineStore.loadTimeline()

⸻

Minimal Dev User Identity (for actions like decline)

Add a DevSessionStore (or service) that exposes:
•	userId (from env or local storage)
•	tenantId

Stores can use it to decide whether “Decline” button is visible.

File: frontend/src/app/core/auth/dev-session.service.ts
```
export class DevSessionService {
  readonly userId = signal<string>('u-101');
  readonly tenantId = signal<string>('tenant-001');
}
```
