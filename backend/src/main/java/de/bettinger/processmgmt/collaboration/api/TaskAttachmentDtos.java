package de.bettinger.processmgmt.collaboration.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class TaskAttachmentDtos {

	private TaskAttachmentDtos() {
	}

	public record CreateAttachmentResponse(UUID id) {
	}

	public record TaskAttachmentResponse(
			UUID id,
			UUID taskId,
			String fileName,
			String contentType,
			long sizeBytes,
			Instant uploadedAt,
			String uploadedByStakeholderId
	) {
	}

	public record TaskAttachmentsResponse(List<TaskAttachmentResponse> items) {
	}
}
