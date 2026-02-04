package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.collaboration.infrastructure.attachments.AttachmentStorage;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskAttachmentEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskAttachmentRepository;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.NoSuchFileException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskAttachmentService {

	private final TaskRepository taskRepository;
	private final TaskAttachmentRepository attachmentRepository;
	private final ProcessCaseRepository processCaseRepository;
	private final AttachmentStorage attachmentStorage;

	public TaskAttachmentService(TaskRepository taskRepository, TaskAttachmentRepository attachmentRepository,
								 ProcessCaseRepository processCaseRepository, AttachmentStorage attachmentStorage) {
		this.taskRepository = taskRepository;
		this.attachmentRepository = attachmentRepository;
		this.processCaseRepository = processCaseRepository;
		this.attachmentStorage = attachmentStorage;
	}

	@Transactional
	public TaskAttachmentEntity uploadAttachment(String tenantId, String uploadedBy, UUID taskId, String fileName,
												 String contentType, long sizeBytes, InputStream content) {
		TaskEntity task = loadTaskForTenant(tenantId, taskId);
		UUID attachmentId = UUID.randomUUID();
		String storageKey = storeFile(tenantId, task.getId(), attachmentId, content);
		TaskAttachmentEntity attachment = new TaskAttachmentEntity(
				attachmentId,
				task.getId(),
				fileName,
				contentType,
				sizeBytes,
				storageKey,
				Instant.now(),
				uploadedBy
		);
		return attachmentRepository.save(attachment);
	}

	@Transactional(readOnly = true)
	public List<TaskAttachmentEntity> listAttachments(String tenantId, UUID taskId) {
		loadTaskForTenant(tenantId, taskId);
		return attachmentRepository.findAllByTaskIdOrderByUploadedAtDesc(taskId);
	}

	@Transactional(readOnly = true)
	public AttachmentDownload downloadAttachment(String tenantId, UUID taskId, UUID attachmentId) {
		loadTaskForTenant(tenantId, taskId);
		TaskAttachmentEntity attachment = attachmentRepository.findByIdAndTaskId(attachmentId, taskId)
				.orElseThrow(() -> new NotFoundException("Attachment not found: " + attachmentId));
		try {
			byte[] bytes = attachmentStorage.load(attachment.getStorageKey());
			return new AttachmentDownload(attachment, bytes);
		} catch (NoSuchFileException ex) {
			throw new NotFoundException("Attachment not found: " + attachmentId);
		} catch (IOException ex) {
			throw new RuntimeException("Failed to load attachment", ex);
		}
	}

	@Transactional
	public void deleteAttachment(String tenantId, UUID taskId, UUID attachmentId) {
		loadTaskForTenant(tenantId, taskId);
		TaskAttachmentEntity attachment = attachmentRepository.findByIdAndTaskId(attachmentId, taskId)
				.orElseThrow(() -> new NotFoundException("Attachment not found: " + attachmentId));
		deleteFile(attachment.getStorageKey());
		attachmentRepository.delete(attachment);
	}

	private TaskEntity loadTaskForTenant(String tenantId, UUID taskId) {
		TaskEntity task = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		boolean caseExists = processCaseRepository.findByIdAndTenantId(task.getCaseId(), tenantId).isPresent();
		if (!caseExists) {
			throw new NotFoundException("Task not found: " + taskId);
		}
		return task;
	}

	private String storeFile(String tenantId, UUID taskId, UUID attachmentId, InputStream content) {
		try {
			return attachmentStorage.store(tenantId, taskId, attachmentId, content);
		} catch (IOException ex) {
			throw new RuntimeException("Failed to store attachment", ex);
		}
	}

	private void deleteFile(String storageKey) {
		try {
			attachmentStorage.delete(storageKey);
		} catch (IOException ex) {
			throw new RuntimeException("Failed to delete attachment", ex);
		}
	}

	public record AttachmentDownload(TaskAttachmentEntity attachment, byte[] bytes) {
	}
}
