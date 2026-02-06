package de.bettinger.processmgmt.analytics.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.application.CaseCommandService;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaRepository;
import de.bettinger.processmgmt.collaboration.application.MeetingCommandService;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
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
class TimelineControllerIntegrationTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private CaseCommandService caseCommandService;

	@Autowired
	private TaskCommandService taskCommandService;

	@Autowired
	private MeetingCommandService meetingCommandService;

	@Autowired
	private LocationRepository locationRepository;

	@Autowired
	private KitaRepository kitaRepository;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void returnsOrderedTimelineEntriesForCase() throws Exception {
		String tenantId = "t-1";
		UUID locationId = seedLocation(tenantId, "Kita 1");
		UUID kitaId = seedKita(tenantId, "Kita 1", locationId);
		UUID caseId = caseCommandService.createCase(tenantId, "Case 1", kitaId).getId();
		UUID meetingId = meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				locationId,
				"Kickoff",
				"Timeline test meeting",
				Instant.now(),
				List.of("u-1")
		).getId();
		meetingCommandService.holdMeeting(
				tenantId,
				meetingId,
				locationId,
				Instant.now(),
				"Minutes",
				List.of("u-1"),
				List.of()
		);
		UUID taskId = taskCommandService.createTask(caseId, "Title", "Desc", 3, null, null).getId();
		taskCommandService.assignTask(taskId, "u-1");
		taskCommandService.resolveTask(taskId, TaskResolutionKind.COMPLETED, "Done", "u-1");

		mockMvc.perform(get("/api/cases/{caseId}/timeline", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.caseId").value(caseId.toString()))
				.andExpect(jsonPath("$.entries.length()").value(4))
				.andExpect(jsonPath("$.entries[0].type").value("MEETING_HELD"))
				.andExpect(jsonPath("$.entries[0].meetingId").value(meetingId.toString()))
				.andExpect(jsonPath("$.entries[0].locationId").value(locationId.toString()))
				.andExpect(jsonPath("$.entries[1].type").value("TASK_CREATED"))
				.andExpect(jsonPath("$.entries[2].type").value("TASK_ASSIGNED"))
				.andExpect(jsonPath("$.entries[3].type").value("TASK_RESOLVED"))
				.andExpect(jsonPath("$.entries[1].taskId").value(taskId.toString()))
				.andExpect(jsonPath("$.entries[2].assigneeId").value("u-1"));
	}

	private UUID seedKita(String tenantId, String name, UUID locationId) {
		KitaEntity kita = new KitaEntity(UUID.randomUUID(), tenantId, name, locationId);
		kitaRepository.saveAndFlush(kita);
		return kita.getId();
	}

	private UUID seedLocation(String tenantId, String label) {
		UUID locationId = UUID.randomUUID();
		LocationEntity location = new LocationEntity(
				locationId,
				tenantId,
				label,
				new Address("Musterstrasse", "12", "10115", "Berlin", "DE")
		);
		locationRepository.saveAndFlush(location);
		return locationId;
	}
}
