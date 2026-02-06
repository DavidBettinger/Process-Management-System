ALTER TABLE tasks
	ADD COLUMN created_from_meeting_id UUID NULL;

UPDATE tasks t
SET created_from_meeting_id = origin_meeting_id
WHERE origin_meeting_id IS NOT NULL
	AND EXISTS (SELECT 1 FROM meetings m WHERE m.id = t.origin_meeting_id);

ALTER TABLE tasks
	ADD CONSTRAINT fk_tasks_created_from_meeting
		FOREIGN KEY (created_from_meeting_id) REFERENCES meetings (id);
