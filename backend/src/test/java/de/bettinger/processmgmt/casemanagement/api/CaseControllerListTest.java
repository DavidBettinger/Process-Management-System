package de.bettinger.processmgmt.casemanagement.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.application.CaseCommandService;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaRepository;
import de.bettinger.processmgmt.common.domain.Address;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class CaseControllerListTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private CaseCommandService caseCommandService;

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
	void listsCasesByTenant() throws Exception {
		String tenantId = "tenant-" + UUID.randomUUID();
		String otherTenantId = "tenant-" + UUID.randomUUID();
		UUID kitaId = seedKita(tenantId, "Kita 1");
		UUID otherKitaId = seedKita(otherTenantId, "Kita 2");
		UUID first = caseCommandService.createCase(tenantId, "Titel 1", kitaId).getId();
		caseCommandService.createCase(otherTenantId, "Titel 2", otherKitaId);

		mockMvc.perform(get("/api/cases")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(first.toString()))
				.andExpect(jsonPath("$.items[0].title").value("Titel 1"));
	}

	private UUID seedKita(String tenantId, String name) {
		UUID locationId = UUID.randomUUID();
		LocationEntity location = new LocationEntity(
				locationId,
				tenantId,
				name,
				new Address("Musterstrasse", "12", "10115", "Berlin", "DE")
		);
		locationRepository.saveAndFlush(location);
		KitaEntity kita = new KitaEntity(UUID.randomUUID(), tenantId, name, locationId);
		kitaRepository.saveAndFlush(kita);
		return kita.getId();
	}
}
