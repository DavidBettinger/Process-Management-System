CREATE TABLE meeting_participants (
	meeting_id UUID NOT NULL,
	user_id VARCHAR(255) NOT NULL,
	PRIMARY KEY (meeting_id, user_id),
	CONSTRAINT fk_meeting_participants_meeting
		FOREIGN KEY (meeting_id) REFERENCES meetings (id)
);

CREATE TABLE meeting_action_items (
	meeting_id UUID NOT NULL,
	item_key VARCHAR(100) NOT NULL,
	title VARCHAR(255) NOT NULL,
	assignee_id VARCHAR(255) NULL,
	due_date DATE NULL,
	created_task_id UUID NULL,
	PRIMARY KEY (meeting_id, item_key),
	CONSTRAINT fk_meeting_action_items_meeting
		FOREIGN KEY (meeting_id) REFERENCES meetings (id)
);

ALTER TABLE tasks ADD COLUMN last_decline_reason TEXT NULL;
ALTER TABLE tasks ADD COLUMN last_suggested_assignee_id VARCHAR(255) NULL;
