package de.bettinger.processmgmt.analytics.api;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.application.CaseCommandService;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaRepository;
import de.bettinger.processmgmt.collaboration.application.MeetingCommandService;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingRepository;
import de.bettinger.processmgmt.common.domain.Address;
import de.bettinger.processmgmt.common.domain.StakeholderRole;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderRepository;
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
class TimelineGraphControllerIntegrationTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private CaseCommandService caseCommandService;

	@Autowired
	private MeetingCommandService meetingCommandService;

	@Autowired
	private TaskCommandService taskCommandService;

	@Autowired
	private MeetingRepository meetingRepository;

	@Autowired
	private StakeholderRepository stakeholderRepository;

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
	void returnsTimelineGraphWithAllowedMeetingsReferencedStakeholdersAndTaskLinks() throws Exception {
		String tenantId = "tenant-1";
		UUID locationId = seedLocation(tenantId, "Kita Sonnenblume");
		UUID kitaId = seedKita(tenantId, "Kita Sonnenblume", locationId);
		UUID caseId = caseCommandService.createCase(tenantId, "Case Timeline Graph", kitaId).getId();

		StakeholderEntity participantStakeholder = seedStakeholder(tenantId, "Anna", "L.");
		StakeholderEntity assigneeStakeholder = seedStakeholder(tenantId, "Bernd", "M.");

		MeetingEntity plannedMeeting = meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				locationId,
				"Planned Meeting",
				"Planned",
				Instant.parse("2026-02-20T11:06:00Z"),
				List.of(participantStakeholder.getId().toString())
		);
		MeetingEntity heldMeeting = meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				locationId,
				"Held Meeting",
				"Held",
				Instant.parse("2026-02-10T10:00:00Z"),
				List.of(participantStakeholder.getId().toString())
		);
		meetingCommandService.holdMeeting(
				tenantId,
				heldMeeting.getId(),
				locationId,
				Instant.parse("2026-02-15T09:00:00Z"),
				"Minutes",
				List.of(participantStakeholder.getId().toString()),
				List.of()
		);

		MeetingEntity cancelledMeeting = meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				locationId,
				"Cancelled Meeting",
				"Cancelled",
				Instant.parse("2026-02-25T10:00:00Z"),
				List.of(assigneeStakeholder.getId().toString())
		);
		cancelledMeeting.setStatus(MeetingStatus.CANCELLED);
		meetingRepository.saveAndFlush(cancelledMeeting);

		UUID taskFromHeldMeetingId = taskCommandService.createTask(
				caseId,
				"Task from held",
				"Desc",
				2,
				null,
				assigneeStakeholder.getId().toString(),
				heldMeeting.getId()
		).getId();
		UUID taskFromPlannedMeetingId = taskCommandService.createTask(
				caseId,
				"Task from planned",
				"Desc",
				3,
				null,
				null,
				plannedMeeting.getId()
		).getId();
		UUID taskWithoutMeetingId = taskCommandService.createTask(
				caseId,
				"Task unlinked",
				"Desc",
				4,
				null,
				null
		).getId();

		mockMvc.perform(get("/api/cases/{caseId}/timeline-graph", caseId)
						.header(DevAuthFilter.USER_HEADER, participantStakeholder.getId().toString())
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.caseId").value(caseId.toString()))
				.andExpect(jsonPath("$.generatedAt").exists())
				.andExpect(jsonPath("$.now").exists())
				.andExpect(jsonPath("$.meetings.length()").value(2))
				.andExpect(jsonPath("$.meetings[0].id").value(heldMeeting.getId().toString()))
				.andExpect(jsonPath("$.meetings[0].status").value("PERFORMED"))
				.andExpect(jsonPath("$.meetings[0].locationLabel").value("Kita Sonnenblume"))
				.andExpect(jsonPath("$.meetings[1].id").value(plannedMeeting.getId().toString()))
				.andExpect(jsonPath("$.meetings[1].status").value("PLANNED"))
				.andExpect(jsonPath("$.meetings[?(@.id=='%s')]", cancelledMeeting.getId()).isEmpty())
				.andExpect(jsonPath("$.stakeholders.length()").value(2))
				.andExpect(jsonPath("$.stakeholders[?(@.id=='%s')]", participantStakeholder.getId()).isNotEmpty())
				.andExpect(jsonPath("$.stakeholders[?(@.id=='%s')]", assigneeStakeholder.getId()).isNotEmpty())
				.andExpect(jsonPath("$.tasks.length()").value(3))
				.andExpect(jsonPath("$.tasks[0].id").value(taskFromHeldMeetingId.toString()))
				.andExpect(jsonPath("$.tasks[0].createdFromMeetingId").value(heldMeeting.getId().toString()))
				.andExpect(jsonPath("$.tasks[1].id").value(taskFromPlannedMeetingId.toString()))
				.andExpect(jsonPath("$.tasks[1].createdFromMeetingId").value(plannedMeeting.getId().toString()))
				.andExpect(jsonPath("$.tasks[2].id").value(taskWithoutMeetingId.toString()))
				.andExpect(jsonPath("$.tasks[2].createdFromMeetingId").value(nullValue()));
	}

	private UUID seedKita(String tenantId, String name, UUID locationId) {
		KitaEntity kita = new KitaEntity(UUID.randomUUID(), tenantId, name, locationId);
		kitaRepository.saveAndFlush(kita);
		return kita.getId();
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

	private StakeholderEntity seedStakeholder(String tenantId, String firstName, String lastName) {
		StakeholderEntity entity = new StakeholderEntity(
				UUID.randomUUID(),
				tenantId,
				firstName,
				lastName,
				StakeholderRole.CONSULTANT,
				Instant.now()
		);
		return stakeholderRepository.saveAndFlush(entity);
	}
}
