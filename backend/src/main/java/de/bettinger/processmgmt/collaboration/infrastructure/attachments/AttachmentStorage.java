package de.bettinger.processmgmt.collaboration.infrastructure.attachments;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

public interface AttachmentStorage {

	String store(String tenantId, UUID taskId, UUID attachmentId, InputStream content) throws IOException;

	byte[] load(String storageKey) throws IOException;

	void delete(String storageKey) throws IOException;
}
