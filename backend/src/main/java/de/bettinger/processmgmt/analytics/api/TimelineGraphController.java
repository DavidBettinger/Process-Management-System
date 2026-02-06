package de.bettinger.processmgmt.analytics.api;

import de.bettinger.processmgmt.analytics.api.TimelineGraphDtos.TimelineGraphResponse;
import de.bettinger.processmgmt.analytics.application.TimelineGraphQueryService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cases/{caseId}/timeline-graph")
public class TimelineGraphController {

	private final TimelineGraphQueryService timelineGraphQueryService;

	public TimelineGraphController(TimelineGraphQueryService timelineGraphQueryService) {
		this.timelineGraphQueryService = timelineGraphQueryService;
	}

	@GetMapping
	public TimelineGraphResponse getTimelineGraph(@PathVariable UUID caseId) {
		return timelineGraphQueryService.getTimelineGraph(caseId);
	}
}
