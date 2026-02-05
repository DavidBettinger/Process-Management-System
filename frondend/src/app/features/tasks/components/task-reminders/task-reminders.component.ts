import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Input,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { TaskReminder } from '../../../../core/models/task-reminder.model';
import { TaskRemindersStore } from '../../state/task-reminders.store';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../../../shared/ui/toast.service';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';
import { StakeholderSelectComponent } from '../../../../shared/ui/stakeholder-select/stakeholder-select.component';
import { StakeholderLabelPipe } from '../../../../shared/labels/stakeholder-label.pipe';
import { TwFieldComponent } from '../../../../shared/ui/tw/tw-field.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';

@Component({
  selector: 'app-task-reminders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StakeholderSelectComponent,
    StakeholderLabelPipe,
    TwFieldComponent,
    TwButtonDirective
  ],
  templateUrl: './task-reminders.component.html'
})
export class TaskRemindersComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly remindersStore = inject(TaskRemindersStore);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly taskIdSignal = signal<string>('');
  readonly taskIdValue = computed(() => this.taskIdSignal());
  readonly isOpen = signal(false);
  readonly requiredMessage = requiredMessage;

  @Input({ required: true })
  set taskId(value: string) {
    this.taskIdSignal.set(value);
  }

  @Input() stakeholders: Stakeholder[] = [];
  @Input() stakeholdersReady = true;

  readonly taskState = computed(() => this.remindersStore.getTaskState(this.taskIdValue()));
  readonly reminders = computed(() => this.taskState().items);
  readonly status = computed(() => this.taskState().status);
  readonly error = computed(() => this.taskState().error);
  readonly isCreating = computed(() => this.taskState().creating);

  readonly form = this.formBuilder.group({
    stakeholderId: ['', Validators.required],
    remindAt: ['', Validators.required],
    note: ['']
  });

  toggleOpen(): void {
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next && this.taskIdValue()) {
      this.remindersStore
        .loadReminders(this.taskIdValue())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  updateStakeholder(value: string | null): void {
    this.form.controls.stakeholderId.setValue(value ?? '');
    this.form.controls.stakeholderId.markAsDirty();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isCreating() || !this.stakeholdersReady) {
      return;
    }
    const taskId = this.taskIdValue();
    if (!taskId) {
      return;
    }
    const value = this.form.getRawValue();
    const note = value.note?.trim() ? value.note.trim() : null;
    const remindAt = toIsoDateTime(value.remindAt ?? '');

    this.remindersStore
      .createReminder(taskId, {
        stakeholderId: value.stakeholderId ?? '',
        remindAt,
        note
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.resetForm(),
        error: () => {
          const message = this.error()?.message ?? 'Erinnerung konnte nicht erstellt werden.';
          this.toastService.error(message);
        }
      });
  }

  confirmDelete(reminder: TaskReminder): void {
    const taskId = this.taskIdValue();
    if (!taskId || this.remindersStore.isBusy(taskId, reminder.id)) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: 'Erinnerung loeschen',
        message: 'Moechtest du diese Erinnerung wirklich loeschen?',
        confirmLabel: 'Loeschen',
        cancelLabel: 'Abbrechen',
        destructive: true
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((confirmed) =>
          confirmed ? this.remindersStore.deleteReminder(taskId, reminder.id) : of(void 0)
        )
      )
      .subscribe({
        error: () => this.toastService.error('Erinnerung konnte nicht geloescht werden.')
      });
  }

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }

  isEmpty(): boolean {
    return this.status() === 'success' && this.reminders().length === 0;
  }

  isBusy(reminderId: string): boolean {
    return this.remindersStore.isBusy(this.taskIdValue(), reminderId);
  }

  private resetForm(): void {
    this.form.reset({ stakeholderId: '', remindAt: '', note: '' });
  }
}

const toIsoDateTime = (value: string): string => {
  const date = new Date(value);
  return date.toISOString();
};
