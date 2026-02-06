package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.collaboration.api.MeetingDtos.HoldMeetingRequest;
import de.bettinger.processmgmt.collaboration.api.MeetingDtos.HoldMeetingResponse;
import de.bettinger.processmgmt.collaboration.api.MeetingDtos.MeetingSummaryResponse;
import de.bettinger.processmgmt.collaboration.api.MeetingDtos.MeetingsResponse;
import de.bettinger.processmgmt.collaboration.api.MeetingDtos.ScheduleMeetingRequest;
import de.bettinger.processmgmt.collaboration.api.MeetingDtos.ScheduleMeetingResponse;
import de.bettinger.processmgmt.collaboration.application.MeetingActionItemCommand;
import de.bettinger.processmgmt.collaboration.application.MeetingCommandService;
import de.bettinger.processmgmt.collaboration.application.MeetingQueryService;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingActionItemEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingEntity;
import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingParticipantEntity;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cases/{caseId}/meetings")
public class MeetingController {

	private final MeetingCommandService meetingCommandService;
	private final MeetingQueryService meetingQueryService;

	public MeetingController(MeetingCommandService meetingCommandService, MeetingQueryService meetingQueryService) {
		this.meetingCommandService = meetingCommandService;
		this.meetingQueryService = meetingQueryService;
	}

	@GetMapping
	public MeetingsResponse listMeetings(@PathVariable UUID caseId) {
		List<MeetingSummaryResponse> items = meetingQueryService.listMeetings(caseId).stream()
				.map(meeting -> new MeetingSummaryResponse(
						meeting.getId(),
						meeting.getStatus(),
						meeting.getLocationId(),
						meeting.getParticipants().stream()
								.map(MeetingParticipantEntity::getUserId)
								.toList(),
						meeting.getTitle(),
						meeting.getDescription(),
						meeting.getScheduledAt(),
						meeting.getHeldAt()
				))
				.toList();
		return new MeetingsResponse(items);
	}

	@PostMapping
	public ResponseEntity<ScheduleMeetingResponse> scheduleMeeting(
			@PathVariable UUID caseId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@Valid @RequestBody ScheduleMeetingRequest request
	) {
		MeetingEntity meeting = meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				request.locationId(),
				request.title(),
				request.description(),
				request.scheduledAt(),
				request.participantIds()
		);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ScheduleMeetingResponse(
						meeting.getId(),
						meeting.getStatus(),
						meeting.getLocationId(),
						meeting.getParticipants().stream()
								.map(MeetingParticipantEntity::getUserId)
								.toList(),
						meeting.getTitle(),
						meeting.getDescription()
				));
	}

	@PostMapping("/{meetingId}/hold")
	public HoldMeetingResponse holdMeeting(
			@PathVariable UUID meetingId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@Valid @RequestBody HoldMeetingRequest request
	) {
		List<MeetingActionItemCommand> actionItems = toCommands(request.actionItems());
		MeetingEntity meeting = meetingCommandService.holdMeeting(
				tenantId,
				meetingId,
				request.locationId(),
				request.heldAt(),
				request.minutesText(),
				request.participantIds(),
				actionItems
		);
		List<UUID> createdTaskIds = meeting.getActionItems().stream()
				.map(MeetingActionItemEntity::getCreatedTaskId)
				.filter(Objects::nonNull)
				.toList();
		return new HoldMeetingResponse(meeting.getId(), createdTaskIds);
	}

	private List<MeetingActionItemCommand> toCommands(List<MeetingDtos.ActionItemRequest> actionItems) {
		if (actionItems == null) {
			return List.of();
		}
		return actionItems.stream()
				.map(item -> new MeetingActionItemCommand(
						item.key(),
						item.title(),
						item.assigneeId(),
						item.dueDate(),
						item.priority(),
						item.description()
				))
				.toList();
	}
}
