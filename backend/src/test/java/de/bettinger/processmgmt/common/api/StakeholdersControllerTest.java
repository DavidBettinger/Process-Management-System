package de.bettinger.processmgmt.common.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.domain.ProcessCaseStatus;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.common.application.StakeholderService;
import de.bettinger.processmgmt.common.domain.StakeholderRole;
import java.time.Instant;
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
class StakeholdersControllerTest {

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private StakeholderService stakeholderService;

	@Autowired
	private ProcessCaseRepository processCaseRepository;

	@Autowired
	private TaskCommandService taskCommandService;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void createsStakeholder() throws Exception {
		String payload = """
			{
			  "firstName": "Maria",
			  "lastName": "Becker",
			  "role": "CONSULTANT"
			}
			""";

		mockMvc.perform(post("/api/stakeholders")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1")
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNotEmpty());
	}

	@Test
	void returnsValidationErrorForMissingFirstName() throws Exception {
		String payload = """
			{
			  "firstName": "",
			  "lastName": "Becker",
			  "role": "CONSULTANT"
			}
			""";

		mockMvc.perform(post("/api/stakeholders")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1")
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void listsStakeholdersByTenant() throws Exception {
		String tenantId = "tenant-" + UUID.randomUUID();
		String otherTenantId = "tenant-" + UUID.randomUUID();
		UUID stakeholderId = stakeholderService.createStakeholder(tenantId, "Maria", "Becker",
				StakeholderRole.CONSULTANT).getId();
		stakeholderService.createStakeholder(otherTenantId, "Lena", "Meyer", StakeholderRole.DIRECTOR);

		mockMvc.perform(get("/api/stakeholders")
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(stakeholderId.toString()))
				.andExpect(jsonPath("$.items[0].firstName").value("Maria"))
				.andExpect(jsonPath("$.items[0].lastName").value("Becker"))
				.andExpect(jsonPath("$.items[0].role").value("CONSULTANT"));
	}

	@Test
	void listsTasksAssignedToStakeholderWithinTenant() throws Exception {
		String tenantId = "tenant-" + UUID.randomUUID();
		String otherTenantId = "tenant-" + UUID.randomUUID();
		UUID stakeholderId = stakeholderService.createStakeholder(tenantId, "Maria", "Becker",
				StakeholderRole.CONSULTANT).getId();
		UUID caseId = UUID.randomUUID();
		processCaseRepository.save(new ProcessCaseEntity(caseId, tenantId, "Fall A",
				UUID.randomUUID(), ProcessCaseStatus.ACTIVE, Instant.now()));

		UUID taskId = taskCommandService.createTask(caseId, "Task 1", "Desc", null).getId();
		taskCommandService.assignTask(taskId, stakeholderId.toString());

		UUID otherCaseId = UUID.randomUUID();
		processCaseRepository.save(new ProcessCaseEntity(otherCaseId, tenantId, "Fall B",
				UUID.randomUUID(), ProcessCaseStatus.ACTIVE, Instant.now()));
		UUID otherTaskId = taskCommandService.createTask(otherCaseId, "Task 2", "Desc", null).getId();
		taskCommandService.assignTask(otherTaskId, "someone-else");

		UUID otherTenantCaseId = UUID.randomUUID();
		processCaseRepository.save(new ProcessCaseEntity(otherTenantCaseId, otherTenantId, "Fall C",
				UUID.randomUUID(), ProcessCaseStatus.ACTIVE, Instant.now()));
		UUID otherTenantTaskId = taskCommandService.createTask(otherTenantCaseId, "Task 3", "Desc", null).getId();
		taskCommandService.assignTask(otherTenantTaskId, stakeholderId.toString());

		mockMvc.perform(get("/api/stakeholders/{stakeholderId}/tasks", stakeholderId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.stakeholderId").value(stakeholderId.toString()))
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(taskId.toString()))
				.andExpect(jsonPath("$.items[0].assigneeId").value(stakeholderId.toString()));
	}

	@Test
	void returnsNotFoundWhenStakeholderMissing() throws Exception {
		mockMvc.perform(get("/api/stakeholders/{stakeholderId}/tasks", UUID.randomUUID())
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-1"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("NOT_FOUND"));
	}
}
