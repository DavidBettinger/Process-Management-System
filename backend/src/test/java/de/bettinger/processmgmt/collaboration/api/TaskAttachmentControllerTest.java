package de.bettinger.processmgmt.collaboration.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.domain.ProcessCaseStatus;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskAttachmentRepository;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.mock.web.MockMultipartFile;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class TaskAttachmentControllerTest {

	@TempDir
	static java.nio.file.Path tempDir;

	@DynamicPropertySource
	static void overrideStorageRoot(DynamicPropertyRegistry registry) {
		registry.add("app.attachments.storage-root", () -> tempDir.toString());
	}

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private ProcessCaseRepository processCaseRepository;

	@Autowired
	private TaskCommandService taskCommandService;

	@Autowired
	private TaskAttachmentRepository taskAttachmentRepository;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void uploadsListsAndDownloadsAttachments() throws Exception {
		String tenantId = "tenant-1";
		TaskEntity task = seedTask(tenantId);

		MockMultipartFile file = new MockMultipartFile(
				"file",
				"notes.txt",
				"text/plain",
				"Hallo".getBytes(java.nio.charset.StandardCharsets.UTF_8)
		);

		mockMvc.perform(MockMvcRequestBuilders.multipart("/api/tasks/{taskId}/attachments", task.getId())
						.file(file)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").exists());

		mockMvc.perform(get("/api/tasks/{taskId}/attachments", task.getId())
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items[0].fileName").value("notes.txt"))
				.andExpect(jsonPath("$.items[0].contentType").value("text/plain"));

		UUID attachmentId = taskAttachmentRepository.findAllByTaskIdOrderByUploadedAtDesc(task.getId())
				.getFirst()
				.getId();

		mockMvc.perform(get("/api/tasks/{taskId}/attachments/{attachmentId}", task.getId(), attachmentId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
				.andExpect(content().bytes("Hallo".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
	}

	@Test
	void rejectsCrossTenantAccess() throws Exception {
		String tenantId = "tenant-1";
		TaskEntity task = seedTask(tenantId);

		MockMultipartFile file = new MockMultipartFile(
				"file",
				"notes.txt",
				"text/plain",
				"Hallo".getBytes(java.nio.charset.StandardCharsets.UTF_8)
		);

		mockMvc.perform(MockMvcRequestBuilders.multipart("/api/tasks/{taskId}/attachments", task.getId())
						.file(file)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, tenantId))
				.andExpect(status().isCreated());

		UUID attachmentId = taskAttachmentRepository.findAllByTaskIdOrderByUploadedAtDesc(task.getId())
				.getFirst()
				.getId();

		mockMvc.perform(get("/api/tasks/{taskId}/attachments/{attachmentId}", task.getId(), attachmentId)
						.header(DevAuthFilter.USER_HEADER, "u-1")
						.header(DevAuthFilter.TENANT_HEADER, "tenant-2"))
				.andExpect(status().isNotFound());
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
		return taskCommandService.createTask(caseId, "Attachment Task", "Desc", 3, null, null);
	}
}
