package de.bettinger.processmgmt.analytics.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.application.CaseCommandService;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
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

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void returnsOrderedTimelineEntriesForCase() throws Exception {
		UUID caseId = caseCommandService.createCase("t-1", "Case 1", "Kita 1").getId();
		UUID taskId = taskCommandService.createTask(caseId, "Title", "Desc", null).getId();
		taskCommandService.assignTask(taskId, "u-1");
		taskCommandService.resolveTask(taskId, TaskResolutionKind.COMPLETED, "Done", "u-1");

		mockMvc.perform(get("/api/cases/{caseId}/timeline", caseId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "t-1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.caseId").value(caseId.toString()))
				.andExpect(jsonPath("$.entries.length()").value(3))
				.andExpect(jsonPath("$.entries[0].type").value("TASK_CREATED"))
				.andExpect(jsonPath("$.entries[1].type").value("TASK_ASSIGNED"))
				.andExpect(jsonPath("$.entries[2].type").value("TASK_RESOLVED"))
				.andExpect(jsonPath("$.entries[0].taskId").value(taskId.toString()))
				.andExpect(jsonPath("$.entries[1].assigneeId").value("u-1"));
	}
}
