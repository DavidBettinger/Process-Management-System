package de.bettinger.processmgmt.collaboration.infrastructure.attachments;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalFileStorageTest {

	@TempDir
	Path tempDir;

	@Test
	void storesLoadsAndDeletesFiles() throws Exception {
		LocalFileStorage storage = new LocalFileStorage(tempDir.toString());
		byte[] content = "hello".getBytes(java.nio.charset.StandardCharsets.UTF_8);
		UUID taskId = UUID.randomUUID();
		UUID attachmentId = UUID.randomUUID();

		String key = storage.store("tenant-1", taskId, attachmentId, new ByteArrayInputStream(content));

		Path storedPath = tempDir.resolve(key);
		assertThat(Files.exists(storedPath)).isTrue();
		assertThat(storage.load(key)).isEqualTo(content);

		storage.delete(key);
		assertThat(Files.exists(storedPath)).isFalse();
	}
}
