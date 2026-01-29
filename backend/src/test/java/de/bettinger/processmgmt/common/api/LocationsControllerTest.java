package de.bettinger.processmgmt.common.api;

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
class LocationsControllerTest {

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
	void createsLocation() throws Exception {
		String payload = """
			{
			  "label": "Kita Sonnenblume",
			  "address": {
			    "street": "Musterstrasse",
			    "houseNumber": "12",
			    "postalCode": "10115",
			    "city": "Berlin",
			    "country": "DE"
			  }
			}
			""";

		mockMvc.perform(post("/api/locations")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1")
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
					.andExpect(status().isCreated())
					.andExpect(jsonPath("$.id").isNotEmpty());
	}

	@Test
	void returnsValidationErrorForMissingLabel() throws Exception {
		String payload = """
			{
			  "label": "",
			  "address": {
			    "street": "Musterstrasse",
			    "houseNumber": "12",
			    "postalCode": "10115",
			    "city": "Berlin"
			  }
			}
			""";

		mockMvc.perform(post("/api/locations")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1")
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
					.andExpect(status().isBadRequest())
					.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void listsLocationsByTenant() throws Exception {
		String tenantId = "tenant-" + UUID.randomUUID();
		String otherTenantId = "tenant-" + UUID.randomUUID();
		Address address = new Address("Musterstrasse", "12", "10115", "Berlin", "DE");
		UUID first = locationService.createLocation(tenantId, "Kita Sonnenblume", address).getId();
		locationService.createLocation(otherTenantId, "Kita Regenbogen", address);

		mockMvc.perform(get("/api/locations")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(first.toString()))
				.andExpect(jsonPath("$.items[0].label").value("Kita Sonnenblume"));
	}
}
