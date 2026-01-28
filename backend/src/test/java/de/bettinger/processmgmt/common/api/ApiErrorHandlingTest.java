package de.bettinger.processmgmt.common.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class ApiErrorHandlingTest {

	@Autowired
	private WebApplicationContext context;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void rejectsMissingAuthHeaders() throws Exception {
		mockMvc.perform(post("/api/cases")
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"title\":\"Case\",\"kitaName\":\"Kita\"}"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
	}

	@Test
	void returnsValidationErrors() throws Exception {
		mockMvc.perform(post("/api/cases")
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, "tenant-1")
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"title\":\"\",\"kitaName\":\"Kita\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void returnsNotFoundForMissingCase() throws Exception {
		mockMvc.perform(get("/api/cases/00000000-0000-0000-0000-000000000000")
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("NOT_FOUND"));
	}
}
