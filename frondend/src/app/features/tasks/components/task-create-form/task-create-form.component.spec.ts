import { TestBed } from '@angular/core/testing';
import { CreateTaskRequest } from '../../../../core/models/task.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { TaskCreateFormComponent } from './task-create-form.component';

describe('TaskCreateFormComponent', () => {
  it('does not emit when form is invalid', () => {
    TestBed.configureTestingModule({
      imports: [TaskCreateFormComponent]
    });

    const fixture = TestBed.createComponent(TaskCreateFormComponent);
    const component = fixture.componentInstance;

    const emitted: CreateTaskRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(0);
  });

  it('shows required errors for title and priority after submit', () => {
    TestBed.configureTestingModule({
      imports: [TaskCreateFormComponent]
    });

    const fixture = TestBed.createComponent(TaskCreateFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.controls.priority.setValue(null);
    component.submit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Titel ist erforderlich.');
    expect(compiled.textContent).toContain('Prioritaet ist erforderlich.');
  });

  it('emits a create request when form is valid', () => {
    TestBed.configureTestingModule({
      imports: [TaskCreateFormComponent]
    });

    const fixture = TestBed.createComponent(TaskCreateFormComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      title: 'Konzept vorbereiten',
      priority: 2,
      description: 'Bitte erste Version',
      dueDate: '2026-02-10',
      assigneeId: ''
    });

    const emitted: CreateTaskRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({
      title: 'Konzept vorbereiten',
      description: 'Bitte erste Version',
      priority: 2,
      dueDate: '2026-02-10',
      assigneeId: null
    });
  });

  it('renders stakeholder options and includes selected assignee in payload', () => {
    const stakeholders: Stakeholder[] = [
      { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' },
      { id: 's-2', firstName: 'Jonas', lastName: 'Keller', role: 'DIRECTOR' }
    ];

    TestBed.configureTestingModule({
      imports: [TaskCreateFormComponent]
    });

    const fixture = TestBed.createComponent(TaskCreateFormComponent);
    const component = fixture.componentInstance;
    component.showAssignee = true;
    component.stakeholders = stakeholders;
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('option')
    ) as HTMLOptionElement[];
    const labels = options.map((option) => option.textContent?.trim());
    expect(labels).toContain('Maria Becker — Beratung');
    expect(labels).toContain('Jonas Keller — Leitung');

    component.form.controls.title.setValue('Aufgabe');
    component.form.controls.priority.setValue(3);
    component.handleAssigneeChange('s-2');

    const emitted: CreateTaskRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted[0]).toEqual({
      title: 'Aufgabe',
      description: null,
      priority: 3,
      dueDate: null,
      assigneeId: 's-2'
    });
  });
});
