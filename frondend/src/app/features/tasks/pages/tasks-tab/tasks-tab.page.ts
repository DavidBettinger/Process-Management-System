import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TasksStore } from '../../state/tasks.store';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { AssignTaskRequest, DeclineTaskRequest, ResolveTaskRequest } from '../../../../core/models/task.model';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';

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
      void this.tasksStore.loadTasks();
    });
    void this.stakeholdersStore.loadStakeholders();
  }

  async handleAssign(payload: { taskId: string; assigneeId: string }): Promise<void> {
    const req: AssignTaskRequest = { assigneeId: payload.assigneeId };
    await this.runAction(() => this.tasksStore.assignTask(payload.taskId, req));
  }

  async handleStart(taskId: string): Promise<void> {
    await this.runAction(() => this.tasksStore.startTask(taskId));
  }

  async handleBlock(payload: { taskId: string; reason: string }): Promise<void> {
    await this.runAction(() => this.tasksStore.blockTask(payload.taskId, payload.reason));
  }

  async handleUnblock(taskId: string): Promise<void> {
    await this.runAction(() => this.tasksStore.unblockTask(taskId));
  }

  async handleDecline(payload: { taskId: string; reason: string; suggestedAssigneeId?: string | null }): Promise<void> {
    const req: DeclineTaskRequest = {
      reason: payload.reason,
      suggestedAssigneeId: payload.suggestedAssigneeId ?? null
    };
    await this.runAction(() => this.tasksStore.declineTask(payload.taskId, req));
  }

  async handleResolve(payload: { taskId: string; kind: ResolveTaskRequest['kind']; reason: string }): Promise<void> {
    const req: ResolveTaskRequest = { kind: payload.kind, reason: payload.reason };
    await this.runAction(() => this.tasksStore.resolveTask(payload.taskId, req));
  }

  private async runAction(action: () => Promise<void>): Promise<void> {
    await action();
    if (this.tasksStore.status() === 'error') {
      const message = this.tasksStore.error()?.message ?? 'Aktion konnte nicht ausgefuehrt werden.';
      this.showToast(message);
    }
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
