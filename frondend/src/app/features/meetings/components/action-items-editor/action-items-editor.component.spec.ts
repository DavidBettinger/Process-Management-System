import { TestBed } from '@angular/core/testing';
import { ActionItemsEditorComponent } from './action-items-editor.component';
import { CreateTaskRequest } from '../../../../core/models/task.model';

describe('ActionItemsEditorComponent', () => {
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
      dueDate: '2026-02-10'
    };
    component.handleCreate(firstPayload);
    fixture.detectChanges();

    const initialKey = latestItems[0].key;
    const secondPayload: CreateTaskRequest = {
      title: 'Zweite Aufgabe',
      description: null,
      priority: 2,
      dueDate: null
    };
    component.handleCreate(secondPayload);

    expect(latestItems[0].key).toBe(initialKey);
  });
});
