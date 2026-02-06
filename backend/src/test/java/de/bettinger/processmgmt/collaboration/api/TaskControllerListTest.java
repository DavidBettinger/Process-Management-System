package de.bettinger.processmgmt.collaboration.api;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.application.MeetingCommandService;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.common.domain.Address;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class TaskControllerListTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private TaskCommandService taskCommandService;

	@Autowired
	private MeetingCommandService meetingCommandService;

	@Autowired
	private LocationRepository locationRepository;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void listsTasksByCase() throws Exception {
		UUID caseId = UUID.randomUUID();
		UUID otherCaseId = UUID.randomUUID();
		UUID taskId = taskCommandService.createTask(caseId, "Titel 1", "Desc", 2, null, null).getId();
		taskCommandService.createTask(otherCaseId, "Titel 2", "Desc", 3, null, null);

		mockMvc.perform(get("/api/cases/{caseId}/tasks", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(taskId.toString()))
				.andExpect(jsonPath("$.items[0].title").value("Titel 1"))
				.andExpect(jsonPath("$.items[0].description").value("Desc"))
				.andExpect(jsonPath("$.items[0].priority").value(2))
				.andExpect(jsonPath("$.items[0].state").value("OPEN"))
				.andExpect(jsonPath("$.items[0].createdFromMeetingId").value(nullValue()));
	}

	@Test
	void includesCreatedFromMeetingIdInTaskList() throws Exception {
		String tenantId = "tenant-1";
		UUID caseId = UUID.randomUUID();
		UUID locationId = seedLocation(tenantId, "Kita Sonnenblume");
		UUID meetingId = meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				locationId,
				"Kickoff",
				null,
				Instant.parse("2026-02-01T10:00:00Z"),
				List.of("u-1")
		).getId();
		UUID taskId = taskCommandService.createTask(
				caseId,
				"Titel Meeting Task",
				"Desc",
				2,
				null,
				null,
				meetingId
		).getId();

		mockMvc.perform(get("/api/cases/{caseId}/tasks", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(taskId.toString()))
				.andExpect(jsonPath("$.items[0].createdFromMeetingId").value(meetingId.toString()));
	}

	private UUID seedLocation(String tenantId, String label) {
		UUID locationId = UUID.randomUUID();
		LocationEntity entity = new LocationEntity(
				locationId,
				tenantId,
				label,
				new Address("Musterstrasse", "12", "10115", "Berlin", "DE")
		);
		locationRepository.saveAndFlush(entity);
		return locationId;
	}
}
