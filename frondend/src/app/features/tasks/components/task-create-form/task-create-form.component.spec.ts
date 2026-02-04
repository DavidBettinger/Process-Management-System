import { TestBed } from '@angular/core/testing';
import { CreateTaskRequest } from '../../../../core/models/task.model';
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
      dueDate: '2026-02-10'
    });

    const emitted: CreateTaskRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({
      title: 'Konzept vorbereiten',
      description: 'Bitte erste Version',
      priority: 2,
      dueDate: '2026-02-10'
    });
  });
});
