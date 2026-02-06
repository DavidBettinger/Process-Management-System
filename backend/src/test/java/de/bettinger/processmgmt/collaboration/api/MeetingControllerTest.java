package de.bettinger.processmgmt.collaboration.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.application.MeetingCommandService;
import de.bettinger.processmgmt.common.domain.Address;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class MeetingControllerTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private LocationRepository locationRepository;

	@Autowired
	private MeetingCommandService meetingCommandService;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void schedulesMeetingWithLocation() throws Exception {
		String tenantId = "tenant-1";
		UUID locationId = seedLocation(tenantId, "Kita Sonnenblume");
		UUID caseId = UUID.randomUUID();

		String payload = """
			{
			  "scheduledAt": "2026-02-01T10:00:00Z",
			  "locationId": "%s",
			  "participantIds": ["u-1"],
			  "title": "Kickoff",
			  "description": "Wir besprechen die ersten Schritte."
			}
			""".formatted(locationId);

		mockMvc.perform(post("/api/cases/{caseId}/meetings", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
					.andExpect(status().isCreated())
					.andExpect(jsonPath("$.locationId").value(locationId.toString()))
					.andExpect(jsonPath("$.participantIds[0]").value("u-1"))
					.andExpect(jsonPath("$.status").value("SCHEDULED"))
					.andExpect(jsonPath("$.title").value("Kickoff"))
					.andExpect(jsonPath("$.description").value("Wir besprechen die ersten Schritte."));
	}

	@Test
	void rejectsMissingTitle() throws Exception {
		String tenantId = "tenant-1";
		UUID locationId = seedLocation(tenantId, "Kita Sonnenblume");
		UUID caseId = UUID.randomUUID();

		String payload = """
			{
			  "scheduledAt": "2026-02-01T10:00:00Z",
			  "locationId": "%s",
			  "participantIds": ["u-1"],
			  "title": " "
			}
			""".formatted(locationId);

		mockMvc.perform(post("/api/cases/{caseId}/meetings", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
					.andExpect(status().isBadRequest())
					.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void rejectsUnknownLocation() throws Exception {
		String tenantId = "tenant-1";
		UUID caseId = UUID.randomUUID();
		UUID locationId = UUID.randomUUID();

		String payload = """
			{
			  "scheduledAt": "2026-02-01T10:00:00Z",
			  "locationId": "%s",
			  "participantIds": ["u-1"],
			  "title": "Kickoff"
			}
			""".formatted(locationId);

		mockMvc.perform(post("/api/cases/{caseId}/meetings", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
					.andExpect(status().isNotFound())
					.andExpect(jsonPath("$.code").value("NOT_FOUND"));
	}

	@Test
	void listsMeetingsForCase() throws Exception {
		String tenantId = "tenant-1";
		UUID caseId = UUID.randomUUID();
		UUID locationId = seedLocation(tenantId, "Kita Sonnenblume");
		meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				locationId,
				"Kickoff",
				"Kurze Beschreibung",
				Instant.parse("2026-02-01T10:00:00Z"),
				java.util.List.of("u-1")
		);

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
						"/api/cases/{caseId}/meetings", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items").isArray())
				.andExpect(jsonPath("$.items[0].locationId").value(locationId.toString()))
				.andExpect(jsonPath("$.items[0].participantIds[0]").value("u-1"))
				.andExpect(jsonPath("$.items[0].status").value("SCHEDULED"))
				.andExpect(jsonPath("$.items[0].title").value("Kickoff"))
				.andExpect(jsonPath("$.items[0].description").value("Kurze Beschreibung"));
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
