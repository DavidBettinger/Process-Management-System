import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TasksStore } from '../../state/tasks.store';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { AssignTaskRequest, DeclineTaskRequest, ResolveTaskRequest } from '../../../../core/models/task.model';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { Observable, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { ToastService } from '../../../../shared/ui/toast.service';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-tasks-tab-page',
  standalone: true,
  imports: [CommonModule, TaskListComponent],
  templateUrl: './tasks-tab.page.html',
  styleUrl: './tasks-tab.page.css'
})
export class TasksTabPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly tasksStore = inject(TasksStore);
  readonly stakeholdersStore = inject(StakeholdersStore);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly tasks = this.tasksStore.tasks;
  readonly status = this.tasksStore.status;
  readonly error = this.tasksStore.error;
  readonly isLoading = this.tasksStore.isLoading;
  readonly busyTaskIds = this.tasksStore.busyTaskIds;
  readonly stakeholders = this.stakeholdersStore.stakeholders;
  readonly stakeholdersStatus = this.stakeholdersStore.status;
  readonly stakeholdersError = this.stakeholdersStore.error;

  ngOnInit(): void {
    const parentRoute = this.route.parent ?? this.route;
    parentRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const caseId = params.get('caseId');
      if (caseId) {
        this.tasksStore.setCaseId(caseId);
      }
      this.tasksStore.loadTasks().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    });
    this.stakeholdersStore.loadStakeholders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  handleAssign(payload: { taskId: string; assigneeId: string }): void {
    const req: AssignTaskRequest = { assigneeId: payload.assigneeId };
    this.runAction(this.tasksStore.assignTask(payload.taskId, req));
  }

  handleStart(taskId: string): void {
    this.runAction(this.tasksStore.startTask(taskId));
  }

  handleBlock(payload: { taskId: string; reason: string }): void {
    this.runAction(this.tasksStore.blockTask(payload.taskId, payload.reason));
  }

  handleUnblock(taskId: string): void {
    this.runAction(this.tasksStore.unblockTask(taskId));
  }

  handleDecline(payload: { taskId: string; reason: string; suggestedAssigneeId?: string | null }): void {
    const req: DeclineTaskRequest = {
      reason: payload.reason,
      suggestedAssigneeId: payload.suggestedAssigneeId ?? null
    };
    this.runAction(this.tasksStore.declineTask(payload.taskId, req));
  }

  handleResolve(payload: { taskId: string; kind: ResolveTaskRequest['kind']; reason: string }): void {
    const req: ResolveTaskRequest = { kind: payload.kind, reason: payload.reason };
    const message =
      payload.kind === 'CANCELLED'
        ? 'Moechtest du diese Aufgabe wirklich abbrechen?'
        : 'Moechtest du diese Aufgabe wirklich abschliessen?';
    const title = payload.kind === 'CANCELLED' ? 'Aufgabe abbrechen' : 'Aufgabe abschliessen';
    const confirmLabel = payload.kind === 'CANCELLED' ? 'Abbrechen' : 'Bestaetigen';
    const cancelLabel = payload.kind === 'CANCELLED' ? 'Zurueck' : 'Abbrechen';
    const action$ = this.confirmDialog
      .confirm({
        title,
        message,
        confirmLabel,
        cancelLabel,
        destructive: payload.kind === 'CANCELLED'
      })
      .pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((confirmed) => (confirmed ? this.tasksStore.resolveTask(payload.taskId, req) : of(void 0)))
    );
    this.runAction(action$);
  }

  private runAction(action$: Observable<void>): void {
    action$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.tasksStore.status() === 'error') {
            const message = this.tasksStore.error()?.message ?? 'Aktion konnte nicht ausgefuehrt werden.';
            this.toastService.error(message);
          }
        })
      )
      .subscribe();
  }
}
