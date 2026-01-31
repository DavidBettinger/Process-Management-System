import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TasksStore } from '../../state/tasks.store';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { AssignTaskRequest, DeclineTaskRequest, ResolveTaskRequest } from '../../../../core/models/task.model';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

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

  readonly tasks = this.tasksStore.tasks;
  readonly status = this.tasksStore.status;
  readonly error = this.tasksStore.error;
  readonly isLoading = this.tasksStore.isLoading;
  readonly busyTaskIds = this.tasksStore.busyTaskIds;
  readonly stakeholders = this.stakeholdersStore.stakeholders;
  readonly stakeholdersStatus = this.stakeholdersStore.status;
  readonly stakeholdersError = this.stakeholdersStore.error;

  readonly toastMessage = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.runAction(this.tasksStore.resolveTask(payload.taskId, req));
  }

  private runAction(action$: Observable<void>): void {
    action$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.tasksStore.status() === 'error') {
            const message = this.tasksStore.error()?.message ?? 'Aktion konnte nicht ausgefuehrt werden.';
            this.showToast(message);
          }
        })
      )
      .subscribe();
  }

  private showToast(message: string): void {
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }
    this.toastMessage.set(message);
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
