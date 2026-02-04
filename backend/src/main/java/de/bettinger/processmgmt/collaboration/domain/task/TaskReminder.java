package de.bettinger.processmgmt.collaboration.domain.task;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import lombok.Getter;

@Getter
public class TaskReminder {

	public static final int MAX_NOTE_LENGTH = 1000;

	private final UUID id;
	private final UUID taskId;
	private final UUID stakeholderId;
	private final Instant remindAt;
	private final String note;
	private final Instant createdAt;

	private TaskReminder(UUID id, UUID taskId, UUID stakeholderId, Instant remindAt, String note, Instant createdAt) {
		this.id = Objects.requireNonNull(id, "id");
		this.taskId = Objects.requireNonNull(taskId, "taskId");
		this.stakeholderId = Objects.requireNonNull(stakeholderId, "stakeholderId");
		this.remindAt = Objects.requireNonNull(remindAt, "remindAt");
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
		if (!remindAt.isAfter(createdAt)) {
			throw new IllegalArgumentException("remindAt must be in the future");
		}
		this.note = normalizeNote(note);
	}

	public static TaskReminder create(UUID taskId, UUID stakeholderId, Instant remindAt, String note) {
		Instant now = Instant.now();
		return new TaskReminder(UUID.randomUUID(), taskId, stakeholderId, remindAt, note, now);
	}

	private static String normalizeNote(String note) {
		if (note == null) {
			return null;
		}
		String trimmed = note.trim();
		if (trimmed.isBlank()) {
			return null;
		}
		if (trimmed.length() > MAX_NOTE_LENGTH) {
			throw new IllegalArgumentException("note must be at most " + MAX_NOTE_LENGTH + " characters");
		}
		return trimmed;
	}
}
