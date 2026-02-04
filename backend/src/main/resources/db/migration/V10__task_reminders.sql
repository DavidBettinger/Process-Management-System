CREATE TABLE task_reminders (
	id UUID PRIMARY KEY,
	task_id UUID NOT NULL,
	stakeholder_id UUID NOT NULL,
	remind_at TIMESTAMP NOT NULL,
	note TEXT NULL,
	created_at TIMESTAMP NOT NULL,
	CONSTRAINT fk_task_reminders_task
		FOREIGN KEY (task_id) REFERENCES tasks (id)
);

CREATE INDEX idx_task_reminders_task_id ON task_reminders (task_id);
CREATE INDEX idx_task_reminders_remind_at ON task_reminders (remind_at);
