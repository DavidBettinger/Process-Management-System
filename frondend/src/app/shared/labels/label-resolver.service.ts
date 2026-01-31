import { Injectable, computed } from '@angular/core';
import { StakeholderRole } from '../../core/models/stakeholder.model';
import { CasesStore } from '../../features/cases/state/cases.store';
import { LocationsStore } from '../../features/locations/state/locations.store';
import { MeetingsStore } from '../../features/meetings/state/meetings.store';
import { StakeholdersStore } from '../../features/stakeholders/state/stakeholders.store';
import { TasksStore } from '../../features/tasks/state/tasks.store';

@Injectable({ providedIn: 'root' })
export class LabelResolverService {
  private readonly stakeholderMap = computed(() => {
    const map = new Map<string, { firstName: string; lastName: string; role: StakeholderRole }>();
    for (const stakeholder of this.stakeholdersStore.stakeholders()) {
      map.set(stakeholder.id, stakeholder);
    }
    return map;
  });

  private readonly processMap = computed(() => {
    const map = new Map<string, { title: string }>();
    for (const processCase of this.casesStore.cases()) {
      map.set(processCase.id, processCase);
    }
    return map;
  });

  private readonly taskMap = computed(() => {
    const map = new Map<string, { title?: string | null }>();
    for (const task of this.tasksStore.tasks()) {
      map.set(task.id, task);
    }
    return map;
  });

  private readonly meetingMap = computed(() => {
    const map = new Map<string, { heldAt?: string | null; scheduledAt?: string | null; locationId: string }>();
    for (const meeting of this.meetingsStore.meetings()) {
      map.set(meeting.id, meeting);
    }
    return map;
  });

  private readonly locationMap = computed(() => {
    const map = new Map<string, { label: string }>();
    for (const location of this.locationsStore.locations()) {
      map.set(location.id, location);
    }
    return map;
  });

  constructor(
    private readonly stakeholdersStore: StakeholdersStore,
    private readonly casesStore: CasesStore,
    private readonly tasksStore: TasksStore,
    private readonly meetingsStore: MeetingsStore,
    private readonly locationsStore: LocationsStore
  ) {}

  stakeholderLabel(stakeholderId?: string | null, roleOverride?: string | null): string {
    if (!stakeholderId) {
      return 'Unbekannt';
    }
    const stakeholder = this.stakeholderMap().get(stakeholderId);
    if (!stakeholder) {
      return 'Unbekannt';
    }
    const resolvedRole = roleOverride?.trim() ? roleOverride.trim() : this.roleLabel(stakeholder.role);
    const roleSuffix = resolvedRole ? ` — ${resolvedRole}` : '';
    return `${stakeholder.firstName} ${stakeholder.lastName}${roleSuffix}`;
  }

  processLabel(caseId?: string | null): string {
    if (!caseId) {
      return 'Unbekannt';
    }
    return this.processMap().get(caseId)?.title ?? 'Unbekannt';
  }

  taskLabel(taskId?: string | null): string {
    if (!taskId) {
      return 'Unbekannt';
    }
    const title = this.taskMap().get(taskId)?.title ?? '';
    return title.trim().length > 0 ? title : 'Unbekannt';
  }

  meetingLabel(meetingId?: string | null, occurredAt?: string | null, locationId?: string | null): string {
    const meeting = meetingId ? this.meetingMap().get(meetingId) : undefined;
    const dateValue = meeting?.heldAt ?? meeting?.scheduledAt ?? occurredAt ?? null;
    const resolvedLocationId = meeting?.locationId ?? locationId ?? null;
    if (!dateValue && !resolvedLocationId) {
      return 'Unbekannt';
    }
    const dateLabel = this.formatDate(dateValue);
    const locationLabel = this.locationLabel(resolvedLocationId);
    return `${dateLabel} — ${locationLabel}`;
  }

  private locationLabel(locationId?: string | null): string {
    if (!locationId) {
      return 'Standort unbekannt';
    }
    return this.locationMap().get(locationId)?.label ?? 'Standort unbekannt';
  }

  private roleLabel(role: StakeholderRole): string {
    switch (role) {
      case 'CONSULTANT':
        return 'Beratung';
      case 'DIRECTOR':
        return 'Leitung';
      case 'TEAM_MEMBER':
        return 'Teammitglied';
      case 'SPONSOR':
        return 'Traeger';
      case 'EXTERNAL':
        return 'Extern';
      default:
        return role;
    }
  }

  private formatDate(value: string | null): string {
    if (!value) {
      return 'Datum offen';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Datum offen';
    }
    return parsed.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
