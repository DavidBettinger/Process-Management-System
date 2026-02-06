# UI Spec

## Meetings Tab

### FE-MEET-RUN-003 (Revised) - Two-stage "Termin durchfuehren" flow

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
