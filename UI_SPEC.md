# UI Spec

## Meetings Tab

### FE-MEET-RUN-003 (Revised) - Two-stage "Termin durchfuehren" flow

### FE-MEET-LIST-EDIT-001 - Planned-only run dropdown

- The "Termin durchfuehren" dropdown includes only meetings with planned status (`SCHEDULED`).
- Meetings in held/completed states are excluded from selection.
- If no planned meetings exist, show:
  - "Keine geplanten Termine vorhanden."

### FE-MEET-LIST-EDIT-002 - Edit button for planned meetings

- Planned meeting rows in the meetings list show a "Bearbeiten" button.
- Clicking "Bearbeiten" opens the existing planning overlay with the selected meeting values prefilled.
- The selected meeting id is captured as edit context for the next step (prefill/update in Task 3).
- Non-planned meetings do not render a "Bearbeiten" action.

### FE-MEET-LIST-EDIT-003 - Reuse planning overlay for editing

- Edit mode uses the same schedule overlay form as create mode.
- Overlay title in edit mode: "Termin bearbeiten".
- Primary action in edit mode: "Speichern".
- Secondary action in edit mode: "Abbrechen".
- On cancel:
  - overlay closes
  - unsaved changes are discarded
  - reopening edit loads the current persisted meeting values again
- On save:
  - frontend calls update endpoint
  - overlay closes on success
  - meetings list is refreshed

#### Stage A - Selection and Preview
- Initial state shows only:
  - Meeting selector ("Termin auswaehlen")
  - Button "Termin durchfuehren" (disabled until meeting is selected)
- After selecting a meeting, show preview fields:
  - "Durchgefuehrt am" prefilled with planned meeting date/time (editable)
  - "Standort" as read-only label
  - "Teilnehmende" as editable stakeholder list (add/remove supported, labels show name + role)
- Stage B content is hidden while Stage A is active.

#### Stage B - Run mode
- Triggered by clicking "Termin durchfuehren" in Stage A.
- Stage A block is fully hidden (including selector and preview).
- Visible content:
  - "Protokoll"
  - "Aufgabenpunkte"
  - Buttons "Termin abschliessen" and "Termin abbrechen"

#### Reset rules
- "Termin abbrechen":
  - No hold/close API call
  - Discard unsaved protocol/action-item edits
  - Reset to initial state
- "Termin abschliessen":
  - Execute hold/close meeting action
  - After successful response, reset to initial state

#### Visibility rules
- Initial:
  - Stage A preview hidden
  - Stage B hidden
- Meeting selected:
  - Stage A preview visible
  - Stage B hidden
- Run mode:
  - Stage A hidden
  - Stage B visible

### FE-MEET-AI-OVL-005 - Action items via overlay

#### Action items section
- The "Aufgabenpunkte" area shows:
  - current action item list
  - button "Aufgabenpunkt hinzufuegen"
- Inline task/action-item form is removed from the page content.

#### Overlay behavior
- Clicking "Aufgabenpunkt hinzufuegen" opens the existing template dialog overlay.
- Overlay content reuses the shared `app-task-create-form` component used in the Aufgaben tab.
- Available fields in the overlay form:
  - Titel
  - Zustaendig (optional)
  - Prioritaet
  - Beschreibung (optional)
  - Faellig bis (optional)
- Form buttons:
  - Primary: "Aufgabenpunkt hinzufuegen"
  - Secondary: "Abbrechen"

#### Submit/cancel behavior
- On submit:
  - a new action item draft is appended to the list in the run-meeting form
  - overlay closes
- On cancel:
  - overlay closes
  - no item is added

#### Labeling rules
- Action-item list shows human-readable assignee labels (name), not raw IDs.

## Timeline Tab

### FE-TL-LAYOUT-001 - Graph layout and structure

- The timeline tab renders a graph area plus a color legend panel on the right (desktop/tablet widths).
- Node details are shown in a floating overlay near the selected node, not in a fixed side panel.
- The graph is a two-axis mental model:
  - Horizontal axis (X): time.
  - Vertical grouping (Y): tasks above meetings, stakeholders below meetings.
- Meetings are placed on the horizontal timeline line.
- Tasks are placed in the upper row and linked to their source meeting.
- Stakeholders are placed in the lower row and scoped per meeting node.
- Tasks without `createdFromMeetingId` are rendered in an "Ohne Termin" bucket to the left.
- A vertical "Heute" marker line is rendered at the server-provided `now` timestamp.

#### Wireframe (ASCII)
```text
+----------------------------------------------------------------------------------+
| Zeitlinie                                                                        |
|                                                                                  |
|   [Ohne Termin]                                                                  |
|      [Task A]    [Task B]                            [Task C]                    |
|                                                                                  |
|                o-------------------------o-------------------------o              |
|                |                         |                         |              |
|             Meeting 1                 Meeting 2                 Meeting 3         |
|                |                         |                         |              |
|         [Stakeholder 1]          [Stakeholder 3]           [Stakeholder 5]       |
|         [Stakeholder 2]          [Stakeholder 4]           [Stakeholder 6]       |
|                                                                                  |
|                         | Heute                                                   |
+----------------------------------------------------------------------------------+
| Legend panel (right):                                                            |
| - Termine: geplant / durchgefuehrt                                               |
| - Aufgaben: offen / zugewiesen / in Bearbeitung / blockiert / erledigt / overdue|
+----------------------------------------------------------------------------------+
```

### FE-TL-INT-002 - Pan and drag behavior

- Graph panning is implemented via pointer drag on the SVG surface.
- Cursor behavior:
  - default on graph: `grab`
  - during drag: `grabbing`
- While dragging, text selection is prevented.
- Dragging updates the graph transform translation only.
- Node click targets remain clickable (meeting/task/stakeholder).

### FE-TL-INT-003 - Zoom behavior

- Wheel zoom is supported on the graph surface.
- Zoom is cursor-centric (focus point under cursor remains stable during zoom).
- Zoom limits:
  - minimum: `0.5x`
  - maximum: `2.5x`
- The "Heute" marker and all nodes/edges are transformed together with the graph layer.
- No viewport persistence between page reloads/sessions (MVP behavior).

### FE-TL-SEL-004 - Node selection and context highlight

- Clicking a meeting/task/stakeholder node selects it and highlights the related subgraph context.
- Clicking empty graph background clears selection.
- Subgraph highlighting rules:
  - highlighted edges = edges directly connected to selected node (1-hop)
  - highlighted nodes = selected node + directly connected neighbor nodes
  - non-highlighted edges are faded
- Meeting context rule:
  - if selected node is task or stakeholder, the associated meeting node is also highlighted
  - derived from scoped node ids:
    - `meeting:{meetingId}:task:{taskId}`
    - `meeting:{meetingId}:stakeholder:{stakeholderId}`
- Visual intent:
  - selected node: strong highlight
  - connected neighbors: subtle highlight
  - connected edges: stronger stroke/color than non-connected edges

### FE-TL-OVL-006 - Floating details overlay behavior

- Node details are rendered in a floating overlay near the click anchor.
- Overlay content is context-sensitive by selected node type:
  - meeting: title, date, location, participants
  - task: title, status, priority, assignee label
  - stakeholder: name, role, related meeting label
- Dismissal rules:
  - `X` button closes
  - `ESC` key closes
  - click outside (backdrop) closes
- When nothing is selected, a small hint box is shown over the graph.
- Overlay placement stays within viewport bounds:
  - near right edge -> flip left
  - near bottom edge -> flip upward
- Overlay is draggable via its header.
- Dragged overlay position is remembered for the current app session (until app/browser session ends) and reused on reopen.

### FE-TL-LABEL-005 - Label and text rules

- UI labels must always be human-readable and domain-facing.
- Raw technical IDs (meetingId/taskId/stakeholderId) must never be displayed in graph labels or overlay text.
- Required label formats:
  - Meeting node: `DD.MM.YYYY HH:mm — {locationLabel}`
  - Task node: truncated task title + status + priority badge (`P1..P5`)
  - Stakeholder node: `{FirstName} {LastName} — {Role}`
- Stakeholder role labels in timeline must use German display mapping from shared source:
  - implementation source: `frondend/src/app/shared/labels/stakeholder-role-label.ts`
  - `CONSULTANT` -> `Beratung`
  - `DIRECTOR` -> `Leitung`
  - `TEAM_MEMBER` -> `Teammitglied`
  - `SPONSOR` -> `Traeger`
  - `EXTERNAL` -> `Extern`
- Fallback labels:
  - missing location: `Ort offen`
  - missing date: `Datum offen`
  - unknown person: `Unbekannt`

### FE-TL-POLISH-001 - Viewport width and right padding

- The timeline graph width is calculated from the right-most visible graph element plus a fixed right padding.
- Right padding constant: `GRAPH_RIGHT_PADDING_PX = 240`.
- Width rule:
  - `graphWidth = ceil(maxNodeRightEdge + GRAPH_RIGHT_PADDING_PX)`
- Covered node types for `maxNodeRightEdge`:
  - meeting labels
  - task cards
  - stakeholder cards
  - timeline axis end
- Expected behavior:
  - right-most meeting/task/stakeholder nodes are not clipped
  - horizontal scroll area includes the extra right margin
  - the "Heute" marker remains positioned on the same time scale and is not shifted by padding logic

### FE-TL-POLISH-002 - Stakeholder collision avoidance stacking

- Stakeholder nodes are stacked into lanes when rectangles would overlap.
- Stacking applies to stakeholder nodes in the lower timeline section.
- Deterministic placement order:
  - primary sort: `x` ascending
  - tie-breaker: `id` ascending
- Collision test uses rectangle intersection of node bounds.
- Lane placement rule:
  - keep original `x`
  - move down by lane step until no collision
  - lane step: `node.height + STAKEHOLDER_LANE_GAP`
- Gap constant: `STAKEHOLDER_LANE_GAP = 12`.
- Graph height is expanded dynamically from the lowest rendered node so stacked lanes are never clipped.

### FE-TL-POLISH-003 - Status-based meeting/task colors + legend

- Meeting status colors:
  - `PLANNED`: blue palette
  - `PERFORMED`: emerald palette
  - fallback/unknown: slate palette
- Task state colors:
  - `OPEN`: slate palette
  - `ASSIGNED`: blue palette
  - `IN_PROGRESS`: amber palette
  - `BLOCKED`: rose palette
  - `RESOLVED`: emerald palette
  - fallback/unknown: slate palette
- Status colors are implemented with Tailwind utility class tokens on SVG nodes.
- Timeline legend includes dedicated entries for all meeting and task status colors.

### FE-TL-POLISH-004 - Overdue task highlighting

- Overdue evaluation:
  - task has `dueDate`
  - task state is not `RESOLVED`
  - parsed due timestamp is strictly earlier than the graph reference time (`now`)
- Time source:
  - preferred: DTO `timelineGraph.now` from backend
  - fallback: client current time
- Date-only due dates (`YYYY-MM-DD`) are interpreted as end-of-day UTC (`23:59:59.999`) before comparison.
- Overdue style has priority over normal task status colors.
  - visual: stronger rose/red border + fill palette
  - badge: `Ueberfaellig`
- Legend includes overdue entry:
  - `Ueberfaellig (hat Vorrang)`
