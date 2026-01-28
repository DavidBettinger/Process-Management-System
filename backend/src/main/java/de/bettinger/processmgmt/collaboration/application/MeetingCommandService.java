package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingActionItemEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingRepository;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import de.bettinger.processmgmt.common.outbox.OutboxEventEntity;
import de.bettinger.processmgmt.common.outbox.OutboxEventRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeetingCommandService {

	private final MeetingRepository meetingRepository;
	private final TaskRepository taskRepository;
	private final OutboxEventRepository outboxEventRepository;

	public MeetingCommandService(MeetingRepository meetingRepository, TaskRepository taskRepository,
								 OutboxEventRepository outboxEventRepository) {
		this.meetingRepository = meetingRepository;
		this.taskRepository = taskRepository;
		this.outboxEventRepository = outboxEventRepository;
	}

	@Transactional
	public MeetingEntity scheduleMeeting(UUID caseId, Instant scheduledAt, List<String> participantIds) {
		MeetingEntity entity = new MeetingEntity(
				UUID.randomUUID(),
				caseId,
				MeetingStatus.SCHEDULED,
				scheduledAt,
				null,
				null
		);
		entity.replaceParticipants(participantIds);
		return meetingRepository.save(entity);
	}

	@Transactional
	public MeetingEntity holdMeeting(UUID meetingId, Instant heldAt, String minutesText, List<String> participantIds,
									 List<MeetingActionItemCommand> actionItems) {
		MeetingEntity entity = meetingRepository.findById(meetingId)
				.orElseThrow(() -> new NotFoundException("Meeting not found: " + meetingId));
		Map<String, UUID> existingTaskIdsByKey = existingTaskIdsByKey(entity);
		entity.setStatus(MeetingStatus.HELD);
		entity.setHeldAt(heldAt);
		entity.setMinutesText(minutesText);
		entity.replaceParticipants(participantIds);
		entity.replaceActionItems(toActionItems(entity, actionItems, existingTaskIdsByKey));
		MeetingEntity saved = meetingRepository.save(entity);
		outboxEventRepository.save(outboxEvent("Meeting", saved.getId(), "MeetingHeld",
				"{\"meetingId\":\"" + saved.getId() + "\",\"caseId\":\"" + saved.getCaseId() + "\"}"));
		return saved;
	}

	private List<MeetingActionItemEntity> toActionItems(MeetingEntity meeting,
			List<MeetingActionItemCommand> commands, Map<String, UUID> existingTaskIdsByKey) {
		List<MeetingActionItemEntity> items = new ArrayList<>();
		if (commands == null) {
			return items;
		}
		for (MeetingActionItemCommand command : commands) {
			UUID createdTaskId = existingTaskIdsByKey.get(command.key());
			if (createdTaskId == null) {
				createdTaskId = createTaskFromActionItem(meeting, command);
			}
			items.add(new MeetingActionItemEntity(meeting, command.key(), command.title(), command.assigneeId(),
					command.dueDate(), createdTaskId));
		}
		return items;
	}

	private UUID createTaskFromActionItem(MeetingEntity meeting, MeetingActionItemCommand command) {
		UUID taskId = UUID.randomUUID();
		TaskEntity task = new TaskEntity(
				taskId,
				meeting.getCaseId(),
				meeting.getId(),
				command.title(),
				"",
				command.dueDate(),
				command.assigneeId(),
				de.bettinger.processmgmt.collaboration.domain.task.TaskState.OPEN,
				null,
				null,
				null,
				null,
				null,
				null,
				Instant.now()
		);
		taskRepository.save(task);
		outboxEventRepository.save(outboxEvent("Task", taskId, "TaskCreated",
				"{\"taskId\":\"" + taskId + "\",\"caseId\":\"" + meeting.getCaseId() + "\",\"meetingId\":\""
						+ meeting.getId() + "\"}"));
		return taskId;
	}

	private Map<String, UUID> existingTaskIdsByKey(MeetingEntity meeting) {
		Map<String, UUID> existing = new HashMap<>();
		for (MeetingActionItemEntity item : meeting.getActionItems()) {
			if (item.getCreatedTaskId() != null) {
				existing.put(item.getItemKey(), item.getCreatedTaskId());
			}
		}
		return existing;
	}

	private OutboxEventEntity outboxEvent(String aggregateType, UUID aggregateId, String eventType, String payload) {
		return new OutboxEventEntity(
				UUID.randomUUID(),
				aggregateType,
				aggregateId.toString(),
				eventType,
				Instant.now(),
				payload,
				null,
				null
		);
	}
}
