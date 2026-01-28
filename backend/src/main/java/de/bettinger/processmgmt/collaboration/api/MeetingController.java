package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.collaboration.api.MeetingDtos.HoldMeetingRequest;
import de.bettinger.processmgmt.collaboration.api.MeetingDtos.HoldMeetingResponse;
import de.bettinger.processmgmt.collaboration.api.MeetingDtos.ScheduleMeetingRequest;
import de.bettinger.processmgmt.collaboration.api.MeetingDtos.ScheduleMeetingResponse;
import de.bettinger.processmgmt.collaboration.application.MeetingActionItemCommand;
import de.bettinger.processmgmt.collaboration.application.MeetingCommandService;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingEntity;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cases/{caseId}/meetings")
public class MeetingController {

	private final MeetingCommandService meetingCommandService;

	public MeetingController(MeetingCommandService meetingCommandService) {
		this.meetingCommandService = meetingCommandService;
	}

	@PostMapping
	public ResponseEntity<ScheduleMeetingResponse> scheduleMeeting(
			@PathVariable UUID caseId,
			@Valid @RequestBody ScheduleMeetingRequest request
	) {
		MeetingEntity meeting = meetingCommandService.scheduleMeeting(caseId, request.scheduledAt(), request.participantIds());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ScheduleMeetingResponse(meeting.getId(), meeting.getStatus()));
	}

	@PostMapping("/{meetingId}/hold")
	public HoldMeetingResponse holdMeeting(
			@PathVariable UUID meetingId,
			@Valid @RequestBody HoldMeetingRequest request
	) {
		List<MeetingActionItemCommand> actionItems = toCommands(request.actionItems());
		MeetingEntity meeting = meetingCommandService.holdMeeting(meetingId, request.heldAt(), request.minutesText(),
				request.participantIds(), actionItems);
		return new HoldMeetingResponse(meeting.getId(), Collections.emptyList());
	}

	private List<MeetingActionItemCommand> toCommands(List<MeetingDtos.ActionItemRequest> actionItems) {
		if (actionItems == null) {
			return Collections.emptyList();
		}
		return actionItems.stream()
				.map(item -> new MeetingActionItemCommand(item.key(), item.title(), item.assigneeId(), item.dueDate()))
				.toList();
	}
}
