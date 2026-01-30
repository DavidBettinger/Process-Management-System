package de.bettinger.processmgmt.common.infrastructure.persistence;

import de.bettinger.processmgmt.common.domain.StakeholderRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Entity
@Table(name = "stakeholders")
public class StakeholderEntity {
	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "first_name", nullable = false, length = 100)
	private String firstName;

	@Column(name = "last_name", nullable = false, length = 100)
	private String lastName;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false, length = 50)
	private StakeholderRole role;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected StakeholderEntity() {
	}

	public StakeholderEntity(
			UUID id,
			String tenantId,
			String firstName,
			String lastName,
			StakeholderRole role,
			Instant createdAt
	) {
		this.id = id;
		this.tenantId = tenantId;
		this.firstName = firstName;
		this.lastName = lastName;
		this.role = role;
		this.createdAt = createdAt;
	}

}
