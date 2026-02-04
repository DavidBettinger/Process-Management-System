import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TaskListComponent } from './task-list.component';
import { LabelResolverService } from '../../../../shared/labels/label-resolver.service';

class LabelResolverServiceStub {
  stakeholderLabel(id?: string | null): string {
    return id === 's-1' ? 'Maria Becker — Beratung' : 'Unbekannt';
  }
}

describe('TaskListComponent', () => {
  it('renders task title and assignee label without showing ids', () => {
    TestBed.configureTestingModule({
      imports: [TaskListComponent, HttpClientTestingModule],
      providers: [{ provide: LabelResolverService, useClass: LabelResolverServiceStub }]
    });

    const fixture = TestBed.createComponent(TaskListComponent);
    fixture.componentInstance.tasks = [
      {
        id: 'task-1',
        title: 'Kinderschutz-Konzept',
        description: 'Kurzbeschreibung',
        priority: 1,
        state: 'ASSIGNED',
        assigneeId: 's-1'
      }
    ];
    fixture.componentInstance.stakeholders = [
      { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' }
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kinderschutz-Konzept');
    expect(compiled.textContent).toContain('Sehr wichtig');
    expect(compiled.textContent).toContain('Maria Becker');
    expect(compiled.textContent).not.toContain('task-1');
    expect(compiled.textContent).not.toContain('s-1');
  });
});
