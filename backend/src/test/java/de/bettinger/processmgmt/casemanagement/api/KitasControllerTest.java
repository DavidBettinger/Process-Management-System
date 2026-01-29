package de.bettinger.processmgmt.casemanagement.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.common.application.LocationService;
import de.bettinger.processmgmt.common.domain.Address;
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
class KitasControllerTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private LocationService locationService;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void createsKita() throws Exception {
		UUID locationId = locationService.createLocation(
				"tenant-1",
				"Kita Sonnenblume",
				new Address("Musterstrasse", "12", "10115", "Berlin", "DE")
		).getId();

		String payload = """
			{
			  "name": "Kita Sonnenblume",
			  "locationId": "%s"
			}
			""".formatted(locationId);

		mockMvc.perform(post("/api/kitas")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1")
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
					.andExpect(status().isCreated())
					.andExpect(jsonPath("$.id").isNotEmpty());
	}

	@Test
	void rejectsUnknownLocation() throws Exception {
		String payload = """
			{
			  "name": "Kita Regenbogen",
			  "locationId": "%s"
			}
			""".formatted(UUID.randomUUID());

		mockMvc.perform(post("/api/kitas")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1")
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
					.andExpect(status().isNotFound())
					.andExpect(jsonPath("$.code").value("NOT_FOUND"));
	}

	@Test
	void listsKitasByTenant() throws Exception {
		UUID locationId = locationService.createLocation(
				"tenant-3",
				"Kita Sonnenblume",
				new Address("Musterstrasse", "12", "10115", "Berlin", "DE")
		).getId();
		UUID otherLocationId = locationService.createLocation(
				"tenant-4",
				"Kita Regenbogen",
				new Address("Musterstrasse", "12", "10115", "Berlin", "DE")
		).getId();

		String payload = """
			{
			  "name": "Kita Sonnenblume",
			  "locationId": "%s"
			}
			""".formatted(locationId);
		String otherPayload = """
			{
			  "name": "Kita Regenbogen",
			  "locationId": "%s"
			}
			""".formatted(otherLocationId);

		mockMvc.perform(post("/api/kitas")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-3")
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
					.andExpect(status().isCreated());

		mockMvc.perform(post("/api/kitas")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-4")
						.contentType(MediaType.APPLICATION_JSON)
						.content(otherPayload))
					.andExpect(status().isCreated());

		mockMvc.perform(get("/api/kitas")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-3"))
					.andExpect(status().isOk())
					.andExpect(jsonPath("$.items.length()").value(1))
					.andExpect(jsonPath("$.items[0].name").value("Kita Sonnenblume"))
					.andExpect(jsonPath("$.items[0].locationId").value(locationId.toString()));
	}
}
