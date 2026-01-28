package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingActionItemEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeetingCommandService {

	private final MeetingRepository meetingRepository;

	public MeetingCommandService(MeetingRepository meetingRepository) {
		this.meetingRepository = meetingRepository;
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
		entity.setStatus(MeetingStatus.HELD);
		entity.setHeldAt(heldAt);
		entity.setMinutesText(minutesText);
		entity.replaceParticipants(participantIds);
		entity.replaceActionItems(toActionItems(entity, actionItems));
		// TODO: Create tasks from action items and persist created task IDs.
		return meetingRepository.save(entity);
	}

	private List<MeetingActionItemEntity> toActionItems(MeetingEntity meeting, List<MeetingActionItemCommand> commands) {
		List<MeetingActionItemEntity> items = new ArrayList<>();
		if (commands == null) {
			return items;
		}
		for (MeetingActionItemCommand command : commands) {
			items.add(new MeetingActionItemEntity(meeting, command.key(), command.title(), command.assigneeId(),
					command.dueDate(), null));
		}
		return items;
	}
}
