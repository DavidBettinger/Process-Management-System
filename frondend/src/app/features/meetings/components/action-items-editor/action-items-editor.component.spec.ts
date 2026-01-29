import { TestBed } from '@angular/core/testing';
import { ActionItemsEditorComponent } from './action-items-editor.component';

describe('ActionItemsEditorComponent', () => {
  it('keeps the same key when updating fields', () => {
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

    component.addItem();
    fixture.detectChanges();

    const initialKey = latestItems[0].key;
    component.updateField(0, 'title', 'Konzeptentwurf');

    expect(latestItems[0].key).toBe(initialKey);
  });
});
