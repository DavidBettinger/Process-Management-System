import { TestBed } from '@angular/core/testing';
import { TaskActionsComponent } from './task-actions.component';
import { Task } from '../../../../core/models/task.model';

describe('TaskActionsComponent', () => {
  const buildTask = (state: Task['state']): Task => ({
    id: 'task-1',
    title: 'Konzept',
    state,
    assigneeId: 'u-1'
  });

  it('enables assign only for OPEN tasks', () => {
    TestBed.configureTestingModule({
      imports: [TaskActionsComponent]
    });

    const fixture = TestBed.createComponent(TaskActionsComponent);
    fixture.componentInstance.task = buildTask('OPEN');
    fixture.componentInstance.stakeholders = [
      { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' }
    ];
    fixture.detectChanges();

    const selects = Array.from(fixture.nativeElement.querySelectorAll('select')) as HTMLSelectElement[];
    const assigneeSelect = selects[0];
    assigneeSelect.value = 's-1';
    assigneeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const assignButton = buttons.find((btn) => btn.textContent?.includes('Zuweisen'))!;
    const startButton = buttons.find((btn) => btn.textContent?.includes('Starten'))!;
    expect(assignButton.disabled).toBe(false);
    expect(startButton.disabled).toBe(true);
  });

  it('emits start for ASSIGNED tasks', () => {
    TestBed.configureTestingModule({
      imports: [TaskActionsComponent]
    });

    const fixture = TestBed.createComponent(TaskActionsComponent);
    const component = fixture.componentInstance;
    component.task = buildTask('ASSIGNED');
    fixture.detectChanges();

    let started: string | null = null;
    component.start.subscribe((taskId) => {
      started = taskId;
    });

    const startButton = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button) => (button as HTMLButtonElement).textContent?.includes('Starten')) as HTMLButtonElement;
    startButton.click();
    fixture.detectChanges();

    expect(started).toBe('task-1');
  });

  it('disables actions for RESOLVED tasks', () => {
    TestBed.configureTestingModule({
      imports: [TaskActionsComponent]
    });

    const fixture = TestBed.createComponent(TaskActionsComponent);
    fixture.componentInstance.task = buildTask('RESOLVED');
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });
});
