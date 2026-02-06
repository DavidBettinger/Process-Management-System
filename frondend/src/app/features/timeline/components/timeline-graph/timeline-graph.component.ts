import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, input, signal } from '@angular/core';
import {
  TimelineGraphEdge,
  TimelineGraphMeetingNode,
  TimelineGraphNodeType,
  TimelineGraphRenderModel,
  TimelineGraphResponse,
  TimelineGraphStakeholderNode,
  TimelineGraphTaskNode
} from '../../../../core/models/timeline-graph.model';

interface Point {
  x: number;
  y: number;
}

interface LayoutMeetingNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface LayoutTaskNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  statusLabel: string;
  priorityLabel: string;
}

interface LayoutStakeholderNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface LayoutEdge {
  id: string;
  type: TimelineGraphEdge['type'];
  path: string;
}

interface TimelineGraphLayout {
  width: number;
  height: number;
  axisStartX: number;
  axisEndX: number;
  axisY: number;
  nowX: number;
  meetings: LayoutMeetingNode[];
  tasks: LayoutTaskNode[];
  stakeholders: LayoutStakeholderNode[];
  edges: LayoutEdge[];
  hasContent: boolean;
  unlinkedBucketX: number | null;
}

interface NodeBox {
  type: 'meeting' | 'task' | 'stakeholder';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PanPointer {
  pointerId: number;
  clientX: number;
  clientY: number;
}

interface ZoomInput {
  deltaY: number;
  focusX: number;
  focusY: number;
}

export interface PanState {
  translationX: number;
  translationY: number;
  zoom: number;
  dragging: boolean;
  pointerId: number | null;
  dragStartClientX: number;
  dragStartClientY: number;
  dragStartTranslationX: number;
  dragStartTranslationY: number;
}

const TASK_ROW_Y = 90;
const AXIS_Y = 250;
const STAKEHOLDER_ROW_Y = 335;
const TASK_WIDTH = 220;
const TASK_HEIGHT = 74;
const STAKEHOLDER_WIDTH = 210;
const STAKEHOLDER_HEIGHT = 46;
const MEETING_LABEL_WIDTH = 220;
const MEETING_RADIUS = 11;
const DEFAULT_HEIGHT = 470;
const MIN_AXIS_WIDTH = 760;
const LEFT_PADDING_DEFAULT = 140;
const LEFT_PADDING_WITH_UNLINKED = 320;
export const GRAPH_RIGHT_PADDING_PX = 240;
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2.5;
const WHEEL_ZOOM_IN_FACTOR = 1.1;
const WHEEL_ZOOM_OUT_FACTOR = 1 / WHEEL_ZOOM_IN_FACTOR;

@Component({
  selector: 'app-timeline-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-graph.component.html'
})
export class TimelineGraphComponent {
  readonly renderModel = input<TimelineGraphRenderModel>({ nodes: [], edges: [] });
  readonly graphDto = input<TimelineGraphResponse | null>(null);
  @Input() selectedNodeId: string | null = null;
  @Input() selectedNodeType: TimelineGraphNodeType | null = null;
  @Output() nodeSelected = new EventEmitter<{ nodeId: string; nodeType: TimelineGraphNodeType }>();
  @Output() selectionCleared = new EventEmitter<void>();
  readonly layout = computed(() => buildTimelineGraphLayout(this.renderModel(), this.graphDto()));
  readonly panState = signal<PanState>(initialPanState());
  readonly isDragging = computed(() => this.panState().dragging);
  readonly panTransform = computed(() => toPanTransform(this.panState()));

  truncate(label: string, maxLength: number): string {
    if (!label || label.length <= maxLength) {
      return label;
    }
    return `${label.slice(0, Math.max(0, maxLength - 3))}...`;
  }

  onPointerDown(event: PointerEvent): void {
    this.panState.update((state) => startPan(state, toPanPointer(event)));
    event.preventDefault();
  }

  onPointerMove(event: PointerEvent): void {
    this.panState.update((state) => movePan(state, toPanPointer(event)));
    if (this.isDragging()) {
      event.preventDefault();
    }
  }

  onPointerUp(event: PointerEvent): void {
    this.panState.update((state) => endPan(state, toPanPointer(event)));
  }

  onPointerCancel(event: PointerEvent): void {
    this.panState.update((state) => endPan(state, toPanPointer(event)));
  }

  onWheel(event: WheelEvent): void {
    const target = event.currentTarget;
    if (!(target instanceof SVGElement)) {
      return;
    }
    const bounds = target.getBoundingClientRect();
    const focusX = event.clientX - bounds.left;
    const focusY = event.clientY - bounds.top;
    this.panState.update((state) =>
      zoomPan(state, {
        deltaY: event.deltaY,
        focusX,
        focusY
      })
    );
    event.preventDefault();
  }

  onMeetingClick(nodeId: string, event: MouseEvent): void {
    this.emitNodeSelected(nodeId, 'meeting', event);
  }

  onTaskClick(nodeId: string, event: MouseEvent): void {
    this.emitNodeSelected(nodeId, 'task', event);
  }

  onStakeholderClick(nodeId: string, event: MouseEvent): void {
    this.emitNodeSelected(nodeId, 'stakeholder', event);
  }

  onBackgroundClick(): void {
    this.selectionCleared.emit();
  }

  isMeetingSelected(nodeId: string): boolean {
    return this.selectedNodeType === 'meeting' && this.selectedNodeId === nodeId;
  }

  isTaskSelected(nodeId: string): boolean {
    return this.selectedNodeType === 'task' && this.selectedNodeId === nodeId;
  }

  isStakeholderSelected(nodeId: string): boolean {
    return this.selectedNodeType === 'stakeholder' && this.selectedNodeId === nodeId;
  }

  private emitNodeSelected(nodeId: string, nodeType: TimelineGraphNodeType, event: MouseEvent): void {
    event.stopPropagation();
    this.nodeSelected.emit({ nodeId, nodeType });
  }
}

export const buildTimelineGraphLayout = (
  renderModel: TimelineGraphRenderModel,
  graphDto: TimelineGraphResponse | null
): TimelineGraphLayout => {
  const meetingNodes = renderModel.nodes.filter((node): node is TimelineGraphMeetingNode => node.type === 'meeting');
  const taskNodes = renderModel.nodes.filter((node): node is TimelineGraphTaskNode => node.type === 'task');
  const stakeholderNodes = renderModel.nodes.filter(
    (node): node is TimelineGraphStakeholderNode => node.type === 'stakeholder'
  );

  const unlinkedTaskNodes = taskNodes.filter((task) => !task.meetingId);
  const leftPadding = unlinkedTaskNodes.length > 0 ? LEFT_PADDING_WITH_UNLINKED : LEFT_PADDING_DEFAULT;
  const axisWidth = Math.max(MIN_AXIS_WIDTH, meetingNodes.length * 260);
  const axisStartX = leftPadding;
  const axisEndX = axisStartX + axisWidth;

  const meetingById = new Map((graphDto?.meetings ?? []).map((meeting) => [meeting.id, meeting]));
  const taskById = new Map((graphDto?.tasks ?? []).map((task) => [task.id, task]));
  const stakeholderById = new Map((graphDto?.stakeholders ?? []).map((stakeholder) => [stakeholder.id, stakeholder]));

  const nowTime = toMillis(graphDto?.now) ?? Date.now();
  const meetingTimes = meetingNodes
    .map((meetingNode) => toMillis(meetingById.get(meetingNode.meetingId)?.performedAt ?? meetingById.get(meetingNode.meetingId)?.plannedAt))
    .filter((value): value is number => value !== null);

  const minTime = meetingTimes.length > 0 ? Math.min(nowTime, ...meetingTimes) : nowTime;
  let maxTime = meetingTimes.length > 0 ? Math.max(nowTime, ...meetingTimes) : nowTime;
  if (maxTime <= minTime) {
    maxTime = minTime + 60 * 60 * 1000;
  }

  const meetingsSorted = [...meetingNodes].sort((left, right) => {
    const leftTime = toMillis(meetingById.get(left.meetingId)?.performedAt ?? meetingById.get(left.meetingId)?.plannedAt);
    const rightTime = toMillis(meetingById.get(right.meetingId)?.performedAt ?? meetingById.get(right.meetingId)?.plannedAt);
    if (leftTime !== null && rightTime !== null && leftTime !== rightTime) {
      return leftTime - rightTime;
    }
    if (leftTime !== null && rightTime === null) {
      return -1;
    }
    if (leftTime === null && rightTime !== null) {
      return 1;
    }
    return left.label.localeCompare(right.label);
  });

  const meetingPositions = new Map<string, NodeBox>();
  const positionedMeetings: LayoutMeetingNode[] = meetingsSorted.map((meetingNode, index) => {
    const meeting = meetingById.get(meetingNode.meetingId);
    const graphAt = toMillis(meeting?.performedAt ?? meeting?.plannedAt);
    const x =
      graphAt === null
        ? distribute(index, meetingsSorted.length, axisStartX, axisEndX)
        : axisStartX + ((graphAt - minTime) / (maxTime - minTime)) * (axisEndX - axisStartX);
    const label = buildMeetingLabel(meeting?.performedAt ?? meeting?.plannedAt, meeting?.locationLabel);
    meetingPositions.set(meetingNode.id, {
      type: 'meeting',
      x,
      y: AXIS_Y,
      width: MEETING_RADIUS * 2,
      height: MEETING_RADIUS * 2
    });
    return {
      id: meetingNode.id,
      x,
      y: AXIS_Y,
      label
    };
  });

  const tasksByMeetingId = groupBy(taskNodes.filter((taskNode) => !!taskNode.meetingId), (taskNode) => taskNode.meetingId as string);

  const positionedTasks: LayoutTaskNode[] = [];
  for (const meetingNode of meetingsSorted) {
    const position = meetingPositions.get(meetingNode.id);
    if (!position) {
      continue;
    }
    const tasksForMeeting = tasksByMeetingId.get(meetingNode.meetingId) ?? [];
    tasksForMeeting.forEach((taskNode, index) => {
      const x = position.x + centeredOffset(index, tasksForMeeting.length, TASK_WIDTH, 20) - TASK_WIDTH / 2;
      const task = taskById.get(taskNode.taskId);
      const title = (task?.title?.trim() || taskNode.label || 'Aufgabe').trim();
      const statusLabel = stateLabel(task?.state);
      const priorityValue = normalizePriority(task?.priority);
      const layoutTask: LayoutTaskNode = {
        id: taskNode.id,
        x,
        y: TASK_ROW_Y,
        width: TASK_WIDTH,
        height: TASK_HEIGHT,
        title,
        statusLabel,
        priorityLabel: `P${priorityValue}`
      };
      positionedTasks.push(layoutTask);
      meetingPositions.set(taskNode.id, {
        type: 'task',
        x: layoutTask.x,
        y: layoutTask.y,
        width: layoutTask.width,
        height: layoutTask.height
      });
    });
  }

  const unlinkedBucketX = unlinkedTaskNodes.length > 0 ? leftPadding - 240 : null;
  unlinkedTaskNodes.forEach((taskNode, index) => {
    const x = (unlinkedBucketX as number) + index * (TASK_WIDTH + 16);
    const task = taskById.get(taskNode.taskId);
    const title = (task?.title?.trim() || taskNode.label || 'Aufgabe').trim();
    const statusLabel = stateLabel(task?.state);
    const priorityValue = normalizePriority(task?.priority);
    const layoutTask: LayoutTaskNode = {
      id: taskNode.id,
      x,
      y: TASK_ROW_Y,
      width: TASK_WIDTH,
      height: TASK_HEIGHT,
      title,
      statusLabel,
      priorityLabel: `P${priorityValue}`
    };
    positionedTasks.push(layoutTask);
    meetingPositions.set(taskNode.id, {
      type: 'task',
      x: layoutTask.x,
      y: layoutTask.y,
      width: layoutTask.width,
      height: layoutTask.height
    });
  });

  const stakeholdersByMeetingId = groupBy(stakeholderNodes, (stakeholderNode) => stakeholderNode.meetingId);
  const positionedStakeholders: LayoutStakeholderNode[] = [];
  for (const meetingNode of meetingsSorted) {
    const position = meetingPositions.get(meetingNode.id);
    if (!position) {
      continue;
    }
    const stakeholdersForMeeting = stakeholdersByMeetingId.get(meetingNode.meetingId) ?? [];
    stakeholdersForMeeting.forEach((stakeholderNode, index) => {
      const x =
        position.x + centeredOffset(index, stakeholdersForMeeting.length, STAKEHOLDER_WIDTH, 18) - STAKEHOLDER_WIDTH / 2;
      const stakeholder = stakeholderById.get(stakeholderNode.stakeholderId);
      const label = buildStakeholderLabel(stakeholder?.firstName, stakeholder?.lastName, stakeholder?.role);
      const layoutStakeholder: LayoutStakeholderNode = {
        id: stakeholderNode.id,
        x,
        y: STAKEHOLDER_ROW_Y,
        width: STAKEHOLDER_WIDTH,
        height: STAKEHOLDER_HEIGHT,
        label
      };
      positionedStakeholders.push(layoutStakeholder);
      meetingPositions.set(stakeholderNode.id, {
        type: 'stakeholder',
        x: layoutStakeholder.x,
        y: layoutStakeholder.y,
        width: layoutStakeholder.width,
        height: layoutStakeholder.height
      });
    });
  }

  const positionedEdges: LayoutEdge[] = renderModel.edges
    .map((edge) => positionEdge(edge, meetingPositions))
    .filter((edge): edge is LayoutEdge => edge !== null);

  const maxNodeRightEdge = Math.max(
    axisEndX,
    ...positionedMeetings.map((meeting) => meeting.x + MEETING_LABEL_WIDTH / 2),
    ...positionedTasks.map((task) => task.x + task.width),
    ...positionedStakeholders.map((stakeholder) => stakeholder.x + stakeholder.width)
  );
  const width = Math.ceil(maxNodeRightEdge + GRAPH_RIGHT_PADDING_PX);
  const nowX = axisStartX + ((nowTime - minTime) / (maxTime - minTime)) * (axisEndX - axisStartX);

  return {
    width,
    height: DEFAULT_HEIGHT,
    axisStartX,
    axisEndX,
    axisY: AXIS_Y,
    nowX: clamp(nowX, axisStartX, axisEndX),
    meetings: positionedMeetings,
    tasks: positionedTasks,
    stakeholders: positionedStakeholders,
    edges: positionedEdges,
    hasContent: positionedMeetings.length > 0 || positionedTasks.length > 0 || positionedStakeholders.length > 0,
    unlinkedBucketX: unlinkedBucketX === null ? null : unlinkedBucketX + TASK_WIDTH / 2
  };
};

const positionEdge = (edge: TimelineGraphEdge, nodePositions: Map<string, NodeBox>): LayoutEdge | null => {
  const source = nodePositions.get(edge.sourceId);
  const target = nodePositions.get(edge.targetId);
  if (!source || !target) {
    return null;
  }

  if (edge.type === 'created-from' && source.type === 'meeting' && target.type === 'task') {
    const start: Point = { x: source.x, y: source.y - MEETING_RADIUS };
    const end: Point = { x: target.x + target.width / 2, y: target.y + target.height };
    return { id: edge.id, type: edge.type, path: toCurve(start, end) };
  }

  if (edge.type === 'participation' && source.type === 'meeting' && target.type === 'stakeholder') {
    const start: Point = { x: source.x, y: source.y + MEETING_RADIUS };
    const end: Point = { x: target.x + target.width / 2, y: target.y };
    return { id: edge.id, type: edge.type, path: toCurve(start, end) };
  }

  if (edge.type === 'assignment' && source.type === 'task' && target.type === 'stakeholder') {
    const start: Point = { x: source.x + source.width / 2, y: source.y + source.height };
    const end: Point = { x: target.x + target.width / 2, y: target.y };
    return { id: edge.id, type: edge.type, path: toCurve(start, end) };
  }

  return null;
};

const toCurve = (start: Point, end: Point): string => {
  const midY = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} C ${start.x} ${midY} ${end.x} ${midY} ${end.x} ${end.y}`;
};

const buildMeetingLabel = (graphAt: string | null | undefined, locationLabel: string | null | undefined): string => {
  const dateLabel = formatDateTime(graphAt);
  const location = locationLabel?.trim() || 'Ort offen';
  return `${dateLabel} — ${location}`;
};

const buildStakeholderLabel = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  role: string | null | undefined
): string => {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  const nameLabel = fullName || 'Unbekannt';
  return `${nameLabel} — ${role ?? 'Rolle offen'}`;
};

const formatDateTime = (value: string | null | undefined): string => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return 'Datum offen';
  }
  const day = pad(parsed.getUTCDate());
  const month = pad(parsed.getUTCMonth() + 1);
  const year = parsed.getUTCFullYear();
  const hour = pad(parsed.getUTCHours());
  const minute = pad(parsed.getUTCMinutes());
  return `${day}.${month}.${year} ${hour}:${minute}`;
};

const pad = (value: number): string => value.toString().padStart(2, '0');

const distribute = (index: number, total: number, min: number, max: number): number => {
  if (total <= 1) {
    return (min + max) / 2;
  }
  const step = (max - min) / (total - 1);
  return min + step * index;
};

const centeredOffset = (index: number, total: number, width: number, gap: number): number => {
  const slot = width + gap;
  return (index - (total - 1) / 2) * slot;
};

const groupBy = <T>(items: T[], keySelector: (item: T) => string): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const key = keySelector(item);
    const current = grouped.get(key) ?? [];
    current.push(item);
    grouped.set(key, current);
  }
  return grouped;
};

const toMillis = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const stateLabel = (state: string | null | undefined): string => {
  if (!state) {
    return 'Status offen';
  }
  switch (state) {
    case 'OPEN':
      return 'Offen';
    case 'ASSIGNED':
      return 'Zugewiesen';
    case 'IN_PROGRESS':
      return 'In Bearbeitung';
    case 'BLOCKED':
      return 'Blockiert';
    case 'RESOLVED':
      return 'Erledigt';
    default:
      return state;
  }
};

const normalizePriority = (priority: number | null | undefined): number => {
  if (!Number.isFinite(priority)) {
    return 3;
  }
  return clamp(Math.trunc(priority as number), 1, 5);
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const initialPanState = (): PanState => ({
  translationX: 0,
  translationY: 0,
  zoom: 1,
  dragging: false,
  pointerId: null,
  dragStartClientX: 0,
  dragStartClientY: 0,
  dragStartTranslationX: 0,
  dragStartTranslationY: 0
});

export const startPan = (state: PanState, pointer: PanPointer): PanState => ({
  ...state,
  dragging: true,
  pointerId: pointer.pointerId,
  dragStartClientX: pointer.clientX,
  dragStartClientY: pointer.clientY,
  dragStartTranslationX: state.translationX,
  dragStartTranslationY: state.translationY
});

export const movePan = (state: PanState, pointer: PanPointer): PanState => {
  if (!state.dragging) {
    return state;
  }
  if (state.pointerId !== null && pointer.pointerId !== state.pointerId) {
    return state;
  }
  return {
    ...state,
    translationX: state.dragStartTranslationX + (pointer.clientX - state.dragStartClientX),
    translationY: state.dragStartTranslationY + (pointer.clientY - state.dragStartClientY)
  };
};

export const endPan = (state: PanState, pointer?: PanPointer): PanState => {
  if (!state.dragging) {
    return state;
  }
  if (pointer && state.pointerId !== null && pointer.pointerId !== state.pointerId) {
    return state;
  }
  return {
    ...state,
    dragging: false,
    pointerId: null
  };
};

export const zoomPan = (state: PanState, input: ZoomInput): PanState => {
  const factor = input.deltaY < 0 ? WHEEL_ZOOM_IN_FACTOR : WHEEL_ZOOM_OUT_FACTOR;
  const nextZoom = clamp(state.zoom * factor, ZOOM_MIN, ZOOM_MAX);
  if (Math.abs(nextZoom - state.zoom) < 0.000001) {
    return state;
  }

  const worldFocusX = (input.focusX - state.translationX) / state.zoom;
  const worldFocusY = (input.focusY - state.translationY) / state.zoom;
  const nextTranslationX = input.focusX - worldFocusX * nextZoom;
  const nextTranslationY = input.focusY - worldFocusY * nextZoom;

  return {
    ...state,
    zoom: nextZoom,
    translationX: nextTranslationX,
    translationY: nextTranslationY
  };
};

export const toPanTransform = (state: PanState): string =>
  `translate(${state.translationX},${state.translationY}) scale(${state.zoom})`;

const toPanPointer = (event: PointerEvent): PanPointer => ({
  pointerId: Number.isFinite(event.pointerId) ? event.pointerId : 1,
  clientX: Number.isFinite(event.clientX) ? event.clientX : 0,
  clientY: Number.isFinite(event.clientY) ? event.clientY : 0
});
