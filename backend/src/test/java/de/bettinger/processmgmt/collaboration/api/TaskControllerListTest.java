package de.bettinger.processmgmt.collaboration.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
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

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void listsTasksByCase() throws Exception {
		UUID caseId = UUID.randomUUID();
		UUID otherCaseId = UUID.randomUUID();
		UUID taskId = taskCommandService.createTask(caseId, "Titel 1", "Desc", 2, null).getId();
		taskCommandService.createTask(otherCaseId, "Titel 2", "Desc", 3, null);

		mockMvc.perform(get("/api/cases/{caseId}/tasks", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(taskId.toString()))
				.andExpect(jsonPath("$.items[0].title").value("Titel 1"))
				.andExpect(jsonPath("$.items[0].description").value("Desc"))
				.andExpect(jsonPath("$.items[0].priority").value(2))
				.andExpect(jsonPath("$.items[0].state").value("OPEN"));
	}
}
