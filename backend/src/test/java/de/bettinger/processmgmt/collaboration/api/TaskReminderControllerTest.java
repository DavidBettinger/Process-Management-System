package de.bettinger.processmgmt.collaboration.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.domain.ProcessCaseStatus;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskReminderRepository;
import de.bettinger.processmgmt.common.domain.StakeholderRole;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
class TaskReminderControllerTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private ProcessCaseRepository processCaseRepository;

	@Autowired
	private TaskCommandService taskCommandService;

	@Autowired
	private StakeholderRepository stakeholderRepository;

	@Autowired
	private TaskReminderRepository taskReminderRepository;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void createsListsAndDeletesReminders() throws Exception {
		String tenantId = "tenant-1";
		TaskEntity task = seedTask(tenantId);
		StakeholderEntity stakeholder = seedStakeholder(tenantId);
		Instant remindAt = Instant.now().plus(2, ChronoUnit.DAYS);
		String payload = String.format(
				"{\"stakeholderId\":\"%s\",\"remindAt\":\"%s\",\"note\":\"Bitte erinnern\"}",
				stakeholder.getId(),
				remindAt
		);

		mockMvc.perform(post("/api/tasks/{taskId}/reminders", task.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(payload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").exists());

		mockMvc.perform(get("/api/tasks/{taskId}/reminders", task.getId())
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items[0].stakeholderId").value(stakeholder.getId().toString()))
				.andExpect(jsonPath("$.items[0].note").value("Bitte erinnern"));

		UUID reminderId = taskReminderRepository.findAllByTaskIdOrderByRemindAtAsc(task.getId())
				.getFirst()
				.getId();

		mockMvc.perform(delete("/api/tasks/{taskId}/reminders/{reminderId}", task.getId(), reminderId)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/tasks/{taskId}/reminders", task.getId())
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items").isEmpty());
	}

	@Test
	void rejectsPastRemindAt() throws Exception {
		String tenantId = "tenant-1";
		TaskEntity task = seedTask(tenantId);
		StakeholderEntity stakeholder = seedStakeholder(tenantId);
		Instant remindAt = Instant.now().minus(2, ChronoUnit.DAYS);
		String payload = String.format(
				"{\"stakeholderId\":\"%s\",\"remindAt\":\"%s\"}",
				stakeholder.getId(),
				remindAt
		);

		mockMvc.perform(post("/api/tasks/{taskId}/reminders", task.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(payload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void returnsNotFoundForMissingTask() throws Exception {
		String tenantId = "tenant-1";
		StakeholderEntity stakeholder = seedStakeholder(tenantId);
		Instant remindAt = Instant.now().plus(1, ChronoUnit.DAYS);
		String payload = String.format(
				"{\"stakeholderId\":\"%s\",\"remindAt\":\"%s\"}",
				stakeholder.getId(),
				remindAt
		);

		mockMvc.perform(post("/api/tasks/{taskId}/reminders", UUID.randomUUID())
					.contentType(MediaType.APPLICATION_JSON)
					.content(payload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("NOT_FOUND"));
	}

	@Test
	void returnsNotFoundForMissingStakeholder() throws Exception {
		String tenantId = "tenant-1";
		TaskEntity task = seedTask(tenantId);
		Instant remindAt = Instant.now().plus(1, ChronoUnit.DAYS);
		String payload = String.format(
				"{\"stakeholderId\":\"%s\",\"remindAt\":\"%s\"}",
				UUID.randomUUID(),
				remindAt
		);

		mockMvc.perform(post("/api/tasks/{taskId}/reminders", task.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(payload)
					.header(DevAuthFilter.USER_HEADER, "u-1")
					.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("NOT_FOUND"));
	}

	private TaskEntity seedTask(String tenantId) {
		UUID caseId = UUID.randomUUID();
		ProcessCaseEntity processCase = new ProcessCaseEntity(
				caseId,
				tenantId,
				"Case Title",
				UUID.randomUUID(),
				ProcessCaseStatus.DRAFT,
				Instant.now()
		);
		processCaseRepository.saveAndFlush(processCase);
		return taskCommandService.createTask(caseId, "Reminder Task", "Desc", 3, null, null);
	}

	private StakeholderEntity seedStakeholder(String tenantId) {
		StakeholderEntity entity = new StakeholderEntity(
				UUID.randomUUID(),
				tenantId,
				"Maria",
				"Becker",
				StakeholderRole.CONSULTANT,
				Instant.now()
		);
		return stakeholderRepository.saveAndFlush(entity);
	}
}
