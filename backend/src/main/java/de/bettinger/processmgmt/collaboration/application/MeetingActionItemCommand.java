package de.bettinger.processmgmt.collaboration.application;

import java.time.LocalDate;

public record MeetingActionItemCommand(
		String key,
		String title,
		String assigneeId,
		LocalDate dueDate,
		Integer priority,
		String description
) {
}
