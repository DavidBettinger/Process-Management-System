CREATE TABLE task_dependencies (
	task_id UUID NOT NULL,
	depends_on_task_id UUID NOT NULL,
	PRIMARY KEY (task_id, depends_on_task_id),
	CONSTRAINT fk_task_dependencies_task
		FOREIGN KEY (task_id) REFERENCES tasks (id),
	CONSTRAINT fk_task_dependencies_depends_on_task
		FOREIGN KEY (depends_on_task_id) REFERENCES tasks (id)
);
