import { TestBed } from '@angular/core/testing';
import { HoldMeetingPayload, MeetingHoldFormComponent } from './meeting-hold-form.component';

describe('MeetingHoldFormComponent', () => {
  it('emits a hold payload with action items', () => {
    TestBed.configureTestingModule({
      imports: [MeetingHoldFormComponent]
    });

    const fixture = TestBed.createComponent(MeetingHoldFormComponent);
    const component = fixture.componentInstance;

    const heldAtInput = '2026-02-01T10:00';
    component.form.setValue({
      meetingId: 'meeting-1',
      heldAt: heldAtInput,
      participantIds: 'u-101, u-201',
      minutesText: 'Ergebnisse wurden festgehalten.'
    });

    component.actionItems = [
      {
        key: 'item-1',
        title: 'Konzept vorbereiten',
        assigneeId: 'u-201',
        dueDate: '2026-02-10'
      }
    ];

    let payload: HoldMeetingPayload | null = null;
    component.hold.subscribe((value) => {
      payload = value;
    });

    component.submit();

    expect(payload).not.toBeNull();
    expect(payload?.meetingId).toBe('meeting-1');
    expect(payload?.request.participantIds).toEqual(['u-101', 'u-201']);
    expect(payload?.request.minutesText).toBe('Ergebnisse wurden festgehalten.');
    expect(payload?.request.actionItems?.length).toBe(1);
    expect(payload?.request.actionItems?.[0].key).toBe('item-1');
    expect(payload?.request.actionItems?.[0].title).toBe('Konzept vorbereiten');
    expect(new Date(payload?.request.heldAt ?? '').toISOString()).toBe(payload?.request.heldAt);
  });
});
