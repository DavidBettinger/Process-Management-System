package de.bettinger.processmgmt.analytics.application;

import de.bettinger.processmgmt.analytics.api.TimelineGraphDtos.TimelineGraphMeeting;
import de.bettinger.processmgmt.analytics.api.TimelineGraphDtos.TimelineGraphMeetingStatus;
import de.bettinger.processmgmt.analytics.api.TimelineGraphDtos.TimelineGraphResponse;
import de.bettinger.processmgmt.analytics.api.TimelineGraphDtos.TimelineGraphStakeholder;
import de.bettinger.processmgmt.analytics.api.TimelineGraphDtos.TimelineGraphTask;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.*;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TimelineGraphQueryService {

	private final ProcessCaseRepository processCaseRepository;
	private final MeetingRepository meetingRepository;
	private final TaskRepository taskRepository;
	private final StakeholderRepository stakeholderRepository;
	private final LocationRepository locationRepository;

	public TimelineGraphQueryService(
			ProcessCaseRepository processCaseRepository,
			MeetingRepository meetingRepository,
			TaskRepository taskRepository,
			StakeholderRepository stakeholderRepository,
			LocationRepository locationRepository
	) {
		this.processCaseRepository = processCaseRepository;
		this.meetingRepository = meetingRepository;
		this.taskRepository = taskRepository;
		this.stakeholderRepository = stakeholderRepository;
		this.locationRepository = locationRepository;
	}

	@Transactional(readOnly = true)
	public TimelineGraphResponse getTimelineGraph(UUID caseId) {
		ProcessCaseEntity processCase = processCaseRepository.findById(caseId)
				.orElseThrow(() -> new NotFoundException("Case not found: " + caseId));
		Instant now = Instant.now();

		List<MeetingEntity> meetingsForCase = meetingRepository.findAllByCaseIdOrderByScheduledAtDesc(caseId).stream()
				.filter(this::isIncludedInTimelineGraph)
				.toList();
		Map<UUID, String> locationLabelsById = locationLabelsById(meetingsForCase);

		List<MeetingWithGraphAt> meetingsWithGraphAt = meetingsForCase.stream()
				.map(meeting -> toMeetingWithGraphAt(meeting, locationLabelsById))
				.sorted((left, right) -> {
					int byGraphAt = compareNullableInstants(left.graphAt(), right.graphAt());
					if (byGraphAt != 0) {
						return byGraphAt;
					}
					return left.meeting().id().compareTo(right.meeting().id());
				})
				.toList();
		List<TimelineGraphMeeting> meetings = meetingsWithGraphAt.stream()
				.map(MeetingWithGraphAt::meeting)
				.toList();
		Map<UUID, Instant> graphAtByMeetingId = meetingsWithGraphAt.stream()
				.collect(Collectors.toMap(entry -> entry.meeting().id(), MeetingWithGraphAt::graphAt));

		List<TimelineGraphTask> tasks = taskRepository.findAllByCaseIdOrderByCreatedAtDesc(caseId).stream()
				.map(task -> toTimelineTask(task, graphAtByMeetingId))
				.sorted((left, right) -> {
					Instant leftGraphAt = graphAtByMeetingId.get(left.createdFromMeetingId());
					Instant rightGraphAt = graphAtByMeetingId.get(right.createdFromMeetingId());
					int byGraphAt = compareNullableInstants(leftGraphAt, rightGraphAt);
					if (byGraphAt != 0) {
						return byGraphAt;
					}
					return left.id().compareTo(right.id());
				})
				.toList();

		Set<UUID> referencedStakeholderIds = referencedStakeholderIds(meetings, tasks);
		List<TimelineGraphStakeholder> stakeholders = stakeholderRepository.findAllById(referencedStakeholderIds)
				.stream()
				.filter(stakeholder -> stakeholder.getTenantId().equals(processCase.getTenantId()))
				.map(this::toTimelineStakeholder)
				.sorted(Comparator.comparing(TimelineGraphStakeholder::id))
				.toList();

		return new TimelineGraphResponse(caseId, now, now, meetings, stakeholders, tasks);
	}

	private TimelineGraphTask toTimelineTask(TaskEntity task, Map<UUID, Instant> graphAtByMeetingId) {
		UUID createdFromMeetingId = task.getCreatedFromMeetingId();
		if (createdFromMeetingId != null && !graphAtByMeetingId.containsKey(createdFromMeetingId)) {
			createdFromMeetingId = null;
		}
		return new TimelineGraphTask(
				task.getId(),
				task.getTitle(),
				task.getState(),
				task.getPriority(),
				task.getAssigneeId(),
				createdFromMeetingId,
				task.getDueDate()
		);
	}

	private MeetingWithGraphAt toMeetingWithGraphAt(MeetingEntity meeting, Map<UUID, String> locationLabelsById) {
		Instant graphAt = graphAt(meeting.getScheduledAt(), meeting.getHeldAt());
		TimelineGraphMeeting timelineGraphMeeting = new TimelineGraphMeeting(
				meeting.getId(),
				toTimelineGraphStatus(meeting.getStatus()),
				meeting.getScheduledAt(),
				meeting.getHeldAt(),
				meeting.getTitle(),
				locationLabelsById.get(meeting.getLocationId()),
				meeting.getParticipants().stream()
						.map(MeetingParticipantEntity::getUserId)
						.toList()
		);
		return new MeetingWithGraphAt(timelineGraphMeeting, graphAt);
	}

	private Map<UUID, String> locationLabelsById(List<MeetingEntity> meetings) {
		Set<UUID> locationIds = meetings.stream()
				.map(MeetingEntity::getLocationId)
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());
		return locationRepository.findAllById(locationIds).stream()
				.collect(Collectors.toMap(LocationEntity::getId, LocationEntity::getLabel));
	}

	private boolean isIncludedInTimelineGraph(MeetingEntity meeting) {
		return meeting.getStatus() == MeetingStatus.SCHEDULED || meeting.getStatus() == MeetingStatus.HELD;
	}

	private TimelineGraphMeetingStatus toTimelineGraphStatus(MeetingStatus status) {
		return switch (status) {
			case SCHEDULED -> TimelineGraphMeetingStatus.PLANNED;
			case HELD -> TimelineGraphMeetingStatus.PERFORMED;
			case CANCELLED -> throw new IllegalArgumentException("Cancelled meetings are not part of timeline graph");
		};
	}

	private Set<UUID> referencedStakeholderIds(List<TimelineGraphMeeting> meetings, List<TimelineGraphTask> tasks) {
		Set<UUID> ids = new LinkedHashSet<>();
		for (TimelineGraphMeeting meeting : meetings) {
			for (String participantId : meeting.participantStakeholderIds()) {
				parseUuid(participantId).ifPresent(ids::add);
			}
		}
		for (TimelineGraphTask task : tasks) {
			parseUuid(task.assigneeId()).ifPresent(ids::add);
		}
		return ids;
	}

	private TimelineGraphStakeholder toTimelineStakeholder(StakeholderEntity stakeholder) {
		return new TimelineGraphStakeholder(
				stakeholder.getId(),
				stakeholder.getFirstName(),
				stakeholder.getLastName(),
				stakeholder.getRole()
		);
	}

	private Instant graphAt(Instant plannedAt, Instant performedAt) {
		return performedAt != null ? performedAt : plannedAt;
	}

	private int compareNullableInstants(Instant left, Instant right) {
		if (left == null && right == null) {
			return 0;
		}
		if (left == null) {
			return 1;
		}
		if (right == null) {
			return -1;
		}
		return left.compareTo(right);
	}

	private java.util.Optional<UUID> parseUuid(String value) {
		if (value == null || value.isBlank()) {
			return java.util.Optional.empty();
		}
		try {
			return java.util.Optional.of(UUID.fromString(value));
		} catch (IllegalArgumentException ex) {
			return java.util.Optional.empty();
		}
	}

	private record MeetingWithGraphAt(TimelineGraphMeeting meeting, Instant graphAt) {
	}
}
