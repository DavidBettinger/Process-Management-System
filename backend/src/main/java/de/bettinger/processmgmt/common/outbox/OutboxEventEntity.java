package de.bettinger.processmgmt.common.outbox;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Entity
@Table(name = "outbox_events")
public class OutboxEventEntity {

	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "aggregate_type", nullable = false)
	private String aggregateType;

	@Column(name = "aggregate_id", nullable = false)
	private String aggregateId;

	@Column(name = "event_type", nullable = false)
	private String eventType;

	@Column(name = "occurred_at", nullable = false)
	private Instant occurredAt;

	@Column(name = "payload", columnDefinition = "TEXT", nullable = false)
	private String payload;

	@Column(name = "status")
	private String status;

	@Column(name = "trace_id")
	private String traceId;

	protected OutboxEventEntity() {
	}

	public OutboxEventEntity(UUID id, String aggregateType, String aggregateId, String eventType, Instant occurredAt,
							 String payload, String status, String traceId) {
		this.id = id;
		this.aggregateType = aggregateType;
		this.aggregateId = aggregateId;
		this.eventType = eventType;
		this.occurredAt = occurredAt;
		this.payload = payload;
		this.status = status;
		this.traceId = traceId;
	}

}
