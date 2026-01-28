package de.bettinger.processmgmt.casemanagement.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.application.CaseCommandService;
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

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void listsCasesByTenant() throws Exception {
		String tenantId = "tenant-1";
		UUID first = caseCommandService.createCase(tenantId, "Titel 1", "Kita 1").getId();
		caseCommandService.createCase("tenant-2", "Titel 2", "Kita 2");

		mockMvc.perform(get("/api/cases")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(first.toString()))
				.andExpect(jsonPath("$.items[0].title").value("Titel 1"));
	}
}
