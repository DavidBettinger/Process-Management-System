package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.api.TaskAttachmentDtos.CreateAttachmentResponse;
import de.bettinger.processmgmt.collaboration.api.TaskAttachmentDtos.TaskAttachmentResponse;
import de.bettinger.processmgmt.collaboration.api.TaskAttachmentDtos.TaskAttachmentsResponse;
import de.bettinger.processmgmt.collaboration.application.TaskAttachmentService;
import de.bettinger.processmgmt.collaboration.application.TaskAttachmentService.AttachmentDownload;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskAttachmentEntity;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tasks/{taskId}/attachments")
public class TaskAttachmentController {

	private static final long MAX_SIZE_BYTES = 25L * 1024L * 1024L;

	private final TaskAttachmentService taskAttachmentService;

	public TaskAttachmentController(TaskAttachmentService taskAttachmentService) {
		this.taskAttachmentService = taskAttachmentService;
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<CreateAttachmentResponse> uploadAttachment(
			@PathVariable UUID taskId,
			@RequestHeader(DevAuthFilter.USER_HEADER) String userId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@RequestPart("file") MultipartFile file
	) throws IOException {
		validateFile(file);
		String fileName = sanitizeFileName(file.getOriginalFilename());
		String contentType = resolveContentType(file.getContentType());
		TaskAttachmentEntity attachment = taskAttachmentService.uploadAttachment(
				tenantId,
				userId,
				taskId,
				fileName,
				contentType,
				file.getSize(),
				file.getInputStream()
		);
		return ResponseEntity.status(201).body(new CreateAttachmentResponse(attachment.getId()));
	}

	@GetMapping
	public TaskAttachmentsResponse listAttachments(
			@PathVariable UUID taskId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId
	) {
		List<TaskAttachmentResponse> items = taskAttachmentService.listAttachments(tenantId, taskId).stream()
				.map(this::toResponse)
				.toList();
		return new TaskAttachmentsResponse(items);
	}

	@GetMapping("/{attachmentId}")
	public ResponseEntity<ByteArrayResource> downloadAttachment(
			@PathVariable UUID taskId,
			@PathVariable UUID attachmentId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId
	) {
		AttachmentDownload download = taskAttachmentService.downloadAttachment(tenantId, taskId, attachmentId);
		TaskAttachmentEntity attachment = download.attachment();
		ByteArrayResource resource = new ByteArrayResource(download.bytes());
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.parseMediaType(resolveContentType(attachment.getContentType())));
		headers.setContentLength(attachment.getSizeBytes());
		headers.setContentDisposition(ContentDisposition.attachment().filename(attachment.getFileName()).build());
		return ResponseEntity.ok().headers(headers).body(resource);
	}

	@DeleteMapping("/{attachmentId}")
	public ResponseEntity<Void> deleteAttachment(
			@PathVariable UUID taskId,
			@PathVariable UUID attachmentId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId
	) {
		taskAttachmentService.deleteAttachment(tenantId, taskId, attachmentId);
		return ResponseEntity.noContent().build();
	}

	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("File must not be empty");
		}
		if (file.getSize() > MAX_SIZE_BYTES) {
			throw new IllegalArgumentException("File exceeds maximum size of 25 MB");
		}
	}

	private TaskAttachmentResponse toResponse(TaskAttachmentEntity attachment) {
		return new TaskAttachmentResponse(
				attachment.getId(),
				attachment.getTaskId(),
				attachment.getFileName(),
				attachment.getContentType(),
				attachment.getSizeBytes(),
				attachment.getUploadedAt(),
				attachment.getUploadedByStakeholderId()
		);
	}

	private String resolveContentType(String contentType) {
		return (contentType == null || contentType.isBlank()) ? MediaType.APPLICATION_OCTET_STREAM_VALUE : contentType;
	}

	private String sanitizeFileName(String original) {
		if (original == null || original.isBlank()) {
			return "attachment";
		}
		return java.nio.file.Path.of(original).getFileName().toString();
	}
}
