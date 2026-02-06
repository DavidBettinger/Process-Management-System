import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ActionItemDraft, ActionItemsEditorComponent } from './action-items-editor.component';
import { CreateTaskRequest } from '../../../../core/models/task.model';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { Stakeholder } from '../../../../core/models/stakeholder.model';

@Component({
  standalone: true,
  imports: [ActionItemsEditorComponent, ConfirmDialogComponent],
  template: `
    <app-action-items-editor [items]="items" [stakeholders]="stakeholders" (itemsChange)="items = $event" />
    <app-confirm-dialog />
  `
})
class ActionItemsEditorHostComponent {
  items: ActionItemDraft[] = [];
  stakeholders: Stakeholder[] = [
    { id: 'u-101', firstName: 'Ada', lastName: 'Lovelace', role: 'CONSULTANT' },
    { id: 'u-201', firstName: 'Jonas', lastName: 'Keller', role: 'DIRECTOR' }
  ];
}

describe('ActionItemsEditorComponent', () => {
  it('opens the action item overlay', () => {
    TestBed.configureTestingModule({
      imports: [ActionItemsEditorHostComponent]
    });

    const fixture = TestBed.createComponent(ActionItemsEditorHostComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Aufgabenpunkt hinzufuegen')
    ) as HTMLButtonElement;

    openButton.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Aufgabenpunkt hinzufuegen');
  });

  it('submits from overlay, closes it, and shows the new action item in the list', () => {
    TestBed.configureTestingModule({
      imports: [ActionItemsEditorHostComponent]
    });

    const fixture = TestBed.createComponent(ActionItemsEditorHostComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Aufgabenpunkt hinzufuegen')
    ) as HTMLButtonElement;
    openButton.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const titleInput = dialog.querySelector('#task-title') as HTMLInputElement;
    titleInput.value = 'Konzeptentwurf';
    titleInput.dispatchEvent(new Event('input'));

    const assigneeSelect = dialog.querySelector('#task-assignee') as HTMLSelectElement;
    assigneeSelect.value = 'u-101';
    assigneeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const submitButton = Array.from(dialog.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Aufgabenpunkt hinzufuegen')
    ) as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
    expect(compiled.textContent).toContain('Konzeptentwurf');
    expect(compiled.textContent).toContain('Ada Lovelace');
    expect(compiled.textContent).not.toContain('u-101');
  });

  it('keeps existing keys when adding new items', () => {
    TestBed.configureTestingModule({
      imports: [ActionItemsEditorComponent]
    });

    const fixture = TestBed.createComponent(ActionItemsEditorComponent);
    const component = fixture.componentInstance;

    let latestItems = component.items;
    component.itemsChange.subscribe((items) => {
      latestItems = items;
      component.items = items;
    });

    const firstPayload: CreateTaskRequest = {
      title: 'Konzeptentwurf',
      description: null,
      priority: 3,
      dueDate: '2026-02-10',
      assigneeId: null
    };
    component.handleCreate(firstPayload);
    fixture.detectChanges();

    const initialKey = latestItems[0].key;
    const secondPayload: CreateTaskRequest = {
      title: 'Zweite Aufgabe',
      description: null,
      priority: 2,
      dueDate: null,
      assigneeId: null
    };
    component.handleCreate(secondPayload);

    expect(latestItems[0].key).toBe(initialKey);
  });
});
