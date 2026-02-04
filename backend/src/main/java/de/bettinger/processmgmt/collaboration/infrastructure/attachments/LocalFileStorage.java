package de.bettinger.processmgmt.collaboration.infrastructure.attachments;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class LocalFileStorage implements AttachmentStorage {

	private final Path root;

	public LocalFileStorage(
			@Value("${app.attachments.storage-root:${java.io.tmpdir}/processmgmt-attachments}") String storageRoot) {
		this.root = Path.of(storageRoot).toAbsolutePath().normalize();
	}

	@Override
	public String store(String tenantId, UUID taskId, UUID attachmentId, InputStream content) throws IOException {
		String safeTenant = sanitizeSegment(tenantId);
		Path target = root.resolve(Path.of(safeTenant, taskId.toString(), attachmentId.toString())).normalize();
		ensureWithinRoot(target);
		Files.createDirectories(target.getParent());
		try (InputStream in = content) {
			Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
		}
		return root.relativize(target).toString().replace('\\', '/');
	}

	@Override
	public byte[] load(String storageKey) throws IOException {
		Path target = resolveStorageKey(storageKey);
		return Files.readAllBytes(target);
	}

	@Override
	public void delete(String storageKey) throws IOException {
		Path target = resolveStorageKey(storageKey);
		Files.deleteIfExists(target);
	}

	private Path resolveStorageKey(String storageKey) {
		Path target = root.resolve(storageKey).normalize();
		ensureWithinRoot(target);
		return target;
	}

	private void ensureWithinRoot(Path target) {
		if (!target.startsWith(root)) {
			throw new IllegalArgumentException("Invalid storage key");
		}
	}

	private String sanitizeSegment(String value) {
		return value.replaceAll("[^a-zA-Z0-9_-]", "_");
	}
}
