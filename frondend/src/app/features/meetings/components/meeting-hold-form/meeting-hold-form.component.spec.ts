import { TestBed } from '@angular/core/testing';
import { HoldMeetingPayload, MeetingHoldFormComponent } from './meeting-hold-form.component';
import { Meeting } from '../../../../core/models/meeting.model';
import { Location } from '../../../../core/models/location.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';

const meetings: Meeting[] = [
  {
    id: 'meeting-1',
    status: 'SCHEDULED',
    locationId: 'location-1',
    participantIds: ['u-101', 'u-201'],
    title: 'Kickoff',
    description: null,
    scheduledAt: '2026-02-01T10:00:00'
  }
];

const locations: Location[] = [
  {
    id: 'location-1',
    label: 'Standort A',
    address: { street: 'Musterstrasse', houseNumber: '12', postalCode: '10115', city: 'Berlin', country: 'DE' }
  }
];

const stakeholders: Stakeholder[] = [
  { id: 'u-101', firstName: 'Ada', lastName: 'Lovelace', role: 'CONSULTANT' },
  { id: 'u-201', firstName: 'Jonas', lastName: 'Keller', role: 'DIRECTOR' }
];

describe('MeetingHoldFormComponent', () => {
  const findButton = (root: ParentNode, text: string): HTMLButtonElement => {
    const buttons = Array.from(root.querySelectorAll('button')) as HTMLButtonElement[];
    return buttons.find((button) => button.textContent?.includes(text)) as HTMLButtonElement;
  };

  const setup = () => {
    TestBed.configureTestingModule({
      imports: [MeetingHoldFormComponent]
    });

    const fixture = TestBed.createComponent(MeetingHoldFormComponent);
    const component = fixture.componentInstance;
    component.meetings = meetings;
    component.locations = locations;
    component.stakeholders = stakeholders;
    component.stakeholdersReady = true;
    fixture.detectChanges();

    return { fixture, component };
  };

  const selectMeeting = (fixture: ReturnType<typeof setup>['fixture']) => {
    const select = fixture.nativeElement.querySelector('#hold-meeting-id') as HTMLSelectElement;
    select.value = 'meeting-1';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };

  it('shows initial state with disabled run button and hidden preview/stage B', () => {
    const { fixture } = setup();

    const runButton = findButton(fixture.nativeElement, 'Termin durchfuehren');

    expect(fixture.nativeElement.querySelector('#hold-meeting-id')).not.toBeNull();
    expect(runButton.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-a-preview"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-b"]')).toBeNull();
  });

  it('shows preview with prefilled datetime, location and participant labels after selection', () => {
    const { fixture } = setup();

    selectMeeting(fixture);

    const runButton = findButton(fixture.nativeElement, 'Termin durchfuehren');
    const heldAtInput = fixture.nativeElement.querySelector('#hold-held-at') as HTMLInputElement;
    const locationPreview = fixture.nativeElement.querySelector('#hold-location-preview') as HTMLElement;
    const participantsPreview = fixture.nativeElement.querySelector('[data-testid="meeting-preview-participants"]') as HTMLElement;

    expect(runButton.disabled).toBe(false);
    expect(heldAtInput).not.toBeNull();
    expect(heldAtInput.value).toBe('2026-02-01T10:00');
    expect(locationPreview.textContent).toContain('Standort A');
    expect(participantsPreview.textContent).toContain('Ada Lovelace');
    expect(participantsPreview.textContent).toContain('Beratung');
    expect(participantsPreview.textContent).toContain('Jonas Keller');
    expect(participantsPreview.textContent).toContain('Leitung');
    expect(participantsPreview.textContent).not.toContain('u-101');
    expect(participantsPreview.textContent).not.toContain('u-201');
    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-b"]')).toBeNull();
  });

  it('allows adding and removing stakeholders in stage A', () => {
    const { fixture } = setup();
    selectMeeting(fixture);

    let selects = fixture.nativeElement.querySelectorAll('[data-testid="meeting-preview-participants"] app-stakeholder-select select');
    expect(selects.length).toBe(2);

    const addButton = findButton(fixture.nativeElement, 'Teilnehmende hinzufuegen');
    addButton.click();
    fixture.detectChanges();

    selects = fixture.nativeElement.querySelectorAll('[data-testid="meeting-preview-participants"] app-stakeholder-select select');
    expect(selects.length).toBe(3);

    const editableSelect = selects[2] as HTMLSelectElement;
    editableSelect.value = 'u-101';
    editableSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const removeButtons = Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="meeting-preview-participants"] button')
    ) as HTMLButtonElement[];
    const removeButton = removeButtons.find((button) => button.textContent?.includes('Entfernen')) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    selects = fixture.nativeElement.querySelectorAll('[data-testid="meeting-preview-participants"] app-stakeholder-select select');
    expect(selects.length).toBe(2);
  });

  it('switches to stage B and hides stage A when run is started', () => {
    const { fixture } = setup();

    selectMeeting(fixture);

    const runButton = findButton(fixture.nativeElement, 'Termin durchfuehren');

    runButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-b"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#hold-meeting-id')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-a-preview"]')).toBeNull();
  });

  it('resets to initial state on cancel without calling hold action', () => {
    const { fixture, component } = setup();
    const emitted: HoldMeetingPayload[] = [];
    component.hold.subscribe((payload) => emitted.push(payload));

    selectMeeting(fixture);

    const runButton = findButton(fixture.nativeElement, 'Termin durchfuehren');
    runButton.click();
    fixture.detectChanges();

    const cancelButton = findButton(fixture.nativeElement, 'Termin abbrechen');
    cancelButton.click();
    fixture.detectChanges();

    const resetRunButton = findButton(fixture.nativeElement, 'Termin durchfuehren');

    expect(emitted.length).toBe(0);
    expect(fixture.nativeElement.querySelector('#hold-meeting-id')).not.toBeNull();
    expect(resetRunButton.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-a-preview"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-b"]')).toBeNull();
  });

  it('calls hold action once and resets after success result', () => {
    const { fixture, component } = setup();
    const emitted: HoldMeetingPayload[] = [];
    component.hold.subscribe((payload) => emitted.push(payload));

    selectMeeting(fixture);

    const runButton = findButton(fixture.nativeElement, 'Termin durchfuehren');
    runButton.click();
    fixture.detectChanges();

    const minutesInput = fixture.nativeElement.querySelector('#hold-minutes') as HTMLTextAreaElement;
    minutesInput.value = 'Wichtige Ergebnisse';
    minutesInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const finishButton = findButton(fixture.nativeElement, 'Termin abschliessen');
    finishButton.click();
    fixture.detectChanges();

    expect(emitted.length).toBe(1);
    expect(emitted[0].meetingId).toBe('meeting-1');
    expect(emitted[0].request.locationId).toBe('location-1');
    expect(emitted[0].request.participantIds).toEqual(['u-101', 'u-201']);
    expect(emitted[0].request.minutesText).toBe('Wichtige Ergebnisse');

    fixture.componentRef.setInput('holdResult', { meetingId: 'meeting-1', createdTaskIds: [] });
    fixture.detectChanges();

    const resetRunButton = findButton(fixture.nativeElement, 'Termin durchfuehren');

    expect(fixture.nativeElement.querySelector('#hold-meeting-id')).not.toBeNull();
    expect(resetRunButton.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-a-preview"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="meeting-stage-b"]')).toBeNull();
  });

  it('includes action item priority and description in hold request', () => {
    const { fixture, component } = setup();
    const emitted: HoldMeetingPayload[] = [];
    component.hold.subscribe((payload) => emitted.push(payload));

    selectMeeting(fixture);

    const runButton = findButton(fixture.nativeElement, 'Termin durchfuehren');
    runButton.click();
    fixture.detectChanges();

    component.actionItems = [
      {
        key: 'ai-1',
        title: 'Konzeptentwurf',
        assigneeId: 'u-101',
        dueDate: '2026-02-11',
        priority: 2,
        description: 'Ersten Entwurf schreiben'
      }
    ];
    component.form.controls.minutesText.setValue('Wichtige Ergebnisse');
    component.submit();

    expect(emitted.length).toBe(1);
    expect(emitted[0].request.actionItems).toEqual([
      {
        key: 'ai-1',
        title: 'Konzeptentwurf',
        assigneeId: 'u-101',
        dueDate: '2026-02-11',
        priority: 2,
        description: 'Ersten Entwurf schreiben'
      }
    ]);
  });
});
