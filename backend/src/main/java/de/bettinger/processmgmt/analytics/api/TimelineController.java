package de.bettinger.processmgmt.analytics.api;

import de.bettinger.processmgmt.analytics.api.TimelineDtos.TimelineResponse;
import de.bettinger.processmgmt.analytics.application.TimelineQueryService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cases/{caseId}/timeline")
public class TimelineController {

	private final TimelineQueryService timelineQueryService;

	public TimelineController(TimelineQueryService timelineQueryService) {
		this.timelineQueryService = timelineQueryService;
	}

	@GetMapping
	public TimelineResponse getTimeline(@PathVariable UUID caseId) {
		return timelineQueryService.getTimeline(caseId);
	}
}
