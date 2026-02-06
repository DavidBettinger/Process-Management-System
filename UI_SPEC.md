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
