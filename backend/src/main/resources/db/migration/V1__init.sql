CREATE TABLE cases (
	id UUID PRIMARY KEY,
	tenant_id VARCHAR(255) NOT NULL,
	title VARCHAR(255) NOT NULL,
	kita_name VARCHAR(255) NOT NULL,
	status VARCHAR(50) NOT NULL,
	created_at TIMESTAMP NOT NULL
);

CREATE TABLE case_stakeholders (
	case_id UUID NOT NULL,
	user_id VARCHAR(255) NOT NULL,
	role VARCHAR(50) NOT NULL,
	PRIMARY KEY (case_id, user_id),
	CONSTRAINT fk_case_stakeholders_case
		FOREIGN KEY (case_id) REFERENCES cases (id)
);

CREATE TABLE meetings (
	id UUID PRIMARY KEY,
	case_id UUID NOT NULL,
	status VARCHAR(50) NOT NULL,
	scheduled_at TIMESTAMP NULL,
	held_at TIMESTAMP NULL,
	minutes_text TEXT NULL
);

CREATE TABLE tasks (
	id UUID PRIMARY KEY,
	case_id UUID NOT NULL,
	origin_meeting_id UUID NULL,
	title VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	due_date DATE NULL,
	assignee_id VARCHAR(255) NULL,
	state VARCHAR(50) NOT NULL,
	resolution_kind VARCHAR(50) NULL,
	resolution_reason TEXT NULL,
	resolved_by VARCHAR(255) NULL,
	resolved_at TIMESTAMP NULL,
	created_at TIMESTAMP NOT NULL
);

CREATE TABLE outbox_events (
	id UUID PRIMARY KEY,
	aggregate_type VARCHAR(100) NOT NULL,
	aggregate_id VARCHAR(100) NOT NULL,
	event_type VARCHAR(100) NOT NULL,
	occurred_at TIMESTAMP NOT NULL,
	payload TEXT NOT NULL,
	status VARCHAR(50) NULL,
	trace_id VARCHAR(100) NULL
);
