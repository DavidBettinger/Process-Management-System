package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;

@Getter
@Entity
@Table(name = "task_attachments")
public class TaskAttachmentEntity {

	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "task_id", nullable = false)
	private UUID taskId;

	@Column(name = "file_name", nullable = false)
	private String fileName;

	@Column(name = "content_type", nullable = false)
	private String contentType;

	@Column(name = "size_bytes", nullable = false)
	private long sizeBytes;

	@Column(name = "storage_key", nullable = false)
	private String storageKey;

	@Column(name = "uploaded_at", nullable = false)
	private Instant uploadedAt;

	@Column(name = "uploaded_by_stakeholder_id", nullable = false)
	private String uploadedByStakeholderId;

	protected TaskAttachmentEntity() {
	}

	public TaskAttachmentEntity(UUID id, UUID taskId, String fileName, String contentType, long sizeBytes,
								String storageKey, Instant uploadedAt, String uploadedByStakeholderId) {
		this.id = id;
		this.taskId = taskId;
		this.fileName = fileName;
		this.contentType = contentType;
		this.sizeBytes = sizeBytes;
		this.storageKey = storageKey;
		this.uploadedAt = uploadedAt;
		this.uploadedByStakeholderId = uploadedByStakeholderId;
	}
}
