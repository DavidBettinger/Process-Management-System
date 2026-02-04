CREATE TABLE task_attachments (
	id UUID PRIMARY KEY,
	task_id UUID NOT NULL,
	file_name VARCHAR(255) NOT NULL,
	content_type VARCHAR(255) NOT NULL,
	size_bytes BIGINT NOT NULL,
	storage_key VARCHAR(500) NOT NULL,
	uploaded_at TIMESTAMP NOT NULL,
	uploaded_by_stakeholder_id VARCHAR(255) NOT NULL,
	CONSTRAINT fk_task_attachments_task
		FOREIGN KEY (task_id) REFERENCES tasks (id)
);

CREATE INDEX idx_task_attachments_task_id ON task_attachments (task_id);
