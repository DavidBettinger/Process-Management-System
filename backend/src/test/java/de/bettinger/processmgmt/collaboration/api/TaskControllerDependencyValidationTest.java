package de.bettinger.processmgmt.collaboration.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
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
class TaskControllerDependencyValidationTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private TaskCommandService taskCommandService;

	@Autowired
	private TaskRepository taskRepository;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void rejectsSelfDependency() throws Exception {
		UUID caseId = UUID.randomUUID();
		TaskEntity task = taskCommandService.createTask(caseId, "Task A", "Desc", 3, null, null);
		String payload = "{\"dependsOnTaskIds\":[\"" + task.getId() + "\"]}";

		mockMvc.perform(put("/api/tasks/{taskId}", task.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(payload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void rejectsCrossCaseDependencyOnCreate() throws Exception {
		UUID caseId = UUID.randomUUID();
		UUID otherCaseId = UUID.randomUUID();
		TaskEntity otherCaseTask = taskCommandService.createTask(otherCaseId, "Other task", "Desc", 3, null, null);
		String payload = """
				{
				  "title": "Task A",
				  "description": "Desc",
				  "priority": 3,
				  "dependsOnTaskIds": ["%s"]
				}
				""".formatted(otherCaseTask.getId());

		mockMvc.perform(post("/api/cases/{caseId}/tasks", caseId)
					.contentType(MediaType.APPLICATION_JSON)
					.content(payload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void rejectsCycleWhenUpdatingDependencies() throws Exception {
		UUID caseId = UUID.randomUUID();
		TaskEntity taskA = taskCommandService.createTask(caseId, "Task A", "Desc", 3, null, null);
		String createTaskBPayload = """
				{
				  "title": "Task B",
				  "description": "Desc",
				  "priority": 3,
				  "dependsOnTaskIds": ["%s"]
				}
				""".formatted(taskA.getId());

		mockMvc.perform(post("/api/cases/{caseId}/tasks", caseId)
					.contentType(MediaType.APPLICATION_JSON)
					.content(createTaskBPayload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isCreated());

		TaskEntity taskB = taskRepository.findAllByCaseIdOrderByCreatedAtDesc(caseId).stream()
				.filter(task -> "Task B".equals(task.getTitle()))
				.findFirst()
				.orElseThrow();
		assertThat(taskB.getDependsOnTaskIds()).containsExactly(taskA.getId());
		String updateTaskAPayload = "{\"dependsOnTaskIds\":[\"" + taskB.getId() + "\"]}";

		mockMvc.perform(put("/api/tasks/{taskId}", taskA.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(updateTaskAPayload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}
}
