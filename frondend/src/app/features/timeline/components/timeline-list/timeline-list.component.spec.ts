import { TestBed } from '@angular/core/testing';
import { TimelineListComponent } from './timeline-list.component';
import { TimelineEntry } from '../../../../core/models/timeline.model';
import { LabelResolverService } from '../../../../shared/labels/label-resolver.service';

class LabelResolverServiceStub {
  stakeholderLabel(id?: string | null): string {
    return id === 'u-1' ? 'Maria Becker — Beratung' : 'Unbekannt';
  }

  taskLabel(id?: string | null): string {
    return id === 't-1' ? 'Kinderschutz-Konzept' : 'Unbekannt';
  }

  meetingLabel(): string {
    return '01.02.2026, 11:00 — Kita Sonnenblume';
  }
}

describe('TimelineListComponent', () => {
  it('renders labels for timeline entry types', () => {
    const entries: TimelineEntry[] = [
      { type: 'MEETING_HELD', occurredAt: '2026-02-01T10:00:00Z', meetingId: 'm-1' },
      { type: 'TASK_CREATED', occurredAt: '2026-02-01T10:05:00Z', taskId: 't-1' },
      { type: 'TASK_ASSIGNED', occurredAt: '2026-02-01T10:06:00Z', taskId: 't-1', assigneeId: 'u-1' },
      { type: 'TASK_RESOLVED', occurredAt: '2026-02-01T10:10:00Z', taskId: 't-1' }
    ];

    TestBed.configureTestingModule({
      imports: [TimelineListComponent],
      providers: [{ provide: LabelResolverService, useClass: LabelResolverServiceStub }]
    });

    const fixture = TestBed.createComponent(TimelineListComponent);
    fixture.componentInstance.entries = entries;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Termin durchgefuehrt');
    expect(compiled.textContent).toContain('Aufgabe erstellt');
    expect(compiled.textContent).toContain('Aufgabe zugewiesen');
    expect(compiled.textContent).toContain('Aufgabe abgeschlossen');
    expect(compiled.textContent).toContain('Kinderschutz-Konzept');
    expect(compiled.textContent).toContain('Maria Becker');
    expect(compiled.textContent).toContain('Kita Sonnenblume');
    expect(compiled.textContent).not.toContain('m-1');
    expect(compiled.textContent).not.toContain('t-1');
    expect(compiled.textContent).not.toContain('u-1');
  });
});
