import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  Input,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TaskAttachment } from '../../../../core/models/task-attachment.model';
import { TaskAttachmentsStore } from '../../state/task-attachments.store';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../../../shared/ui/toast.service';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';

@Component({
  selector: 'app-task-attachments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-attachments.component.html',
  styleUrl: './task-attachments.component.css'
})
export class TaskAttachmentsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly attachmentsStore = inject(TaskAttachmentsStore);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly taskIdSignal = signal<string>('');
  readonly taskIdValue = computed(() => this.taskIdSignal());
  readonly isOpen = signal(false);
  readonly requiredMessage = requiredMessage;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  @Input({ required: true })
  set taskId(value: string) {
    this.taskIdSignal.set(value);
  }

  readonly taskState = computed(() => this.attachmentsStore.getTaskState(this.taskIdValue()));
  readonly attachments = computed(() => this.taskState().items);
  readonly status = computed(() => this.taskState().status);
  readonly error = computed(() => this.taskState().error);
  readonly isUploading = computed(() => this.taskState().uploading);

  readonly form = this.formBuilder.group({
    file: [null as File | null, Validators.required]
  });

  toggleOpen(): void {
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next && this.taskIdValue()) {
      this.attachmentsStore
        .loadAttachments(this.taskIdValue())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    this.form.patchValue({ file });
    if (file) {
      this.form.get('file')?.markAsDirty();
    }
  }

  submitUpload(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isUploading()) {
      return;
    }
    const taskId = this.taskIdValue();
    if (!taskId) {
      return;
    }
    const file = this.form.getRawValue().file;
    if (!file) {
      return;
    }

    this.attachmentsStore
      .uploadAttachment(taskId, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.resetForm(),
        error: () => {
          const message = this.error()?.message ?? 'Upload fehlgeschlagen.';
          this.toastService.error(message);
        }
      });
  }

  downloadAttachment(attachment: TaskAttachment): void {
    const taskId = this.taskIdValue();
    if (!taskId || this.attachmentsStore.isBusy(taskId, attachment.id)) {
      return;
    }
    this.attachmentsStore
      .downloadAttachment(taskId, attachment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => this.triggerDownload(blob, attachment.fileName),
        error: () => this.toastService.error('Download fehlgeschlagen.')
      });
  }

  confirmDelete(attachment: TaskAttachment): void {
    const taskId = this.taskIdValue();
    if (!taskId || this.attachmentsStore.isBusy(taskId, attachment.id)) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: 'Anhang loeschen',
        message: `Moechtest du "${attachment.fileName}" wirklich loeschen?`,
        confirmLabel: 'Loeschen',
        cancelLabel: 'Abbrechen',
        destructive: true
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((confirmed) =>
          confirmed ? this.attachmentsStore.deleteAttachment(taskId, attachment.id) : of(void 0)
        )
      )
      .subscribe({
        error: () => this.toastService.error('Anhang konnte nicht geloescht werden.')
      });
  }

  isBusy(attachmentId: string): boolean {
    return this.attachmentsStore.isBusy(this.taskIdValue(), attachmentId);
  }

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }

  isEmpty(): boolean {
    return this.status() === 'success' && this.attachments().length === 0;
  }

  formatBytes(sizeBytes: number): string {
    if (sizeBytes < 1024) {
      return `${sizeBytes} B`;
    }
    const units = ['KB', 'MB', 'GB'];
    let size = sizeBytes / 1024;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  private resetForm(): void {
    this.form.reset({ file: null });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
