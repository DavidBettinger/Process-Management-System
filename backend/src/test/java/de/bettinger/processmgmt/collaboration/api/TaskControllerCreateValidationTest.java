package de.bettinger.processmgmt.collaboration.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
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
class TaskControllerCreateValidationTest {

	@Autowired
	private WebApplicationContext context;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void rejectsInvalidPriority() throws Exception {
		UUID caseId = UUID.randomUUID();
		String payload = "{\"title\":\"Title\",\"description\":\"Desc\",\"priority\":0}";

		mockMvc.perform(post("/api/cases/{caseId}/tasks", caseId)
					.contentType(MediaType.APPLICATION_JSON)
					.content(payload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
				.andExpect(jsonPath("$.details.priority").exists());
	}
}
