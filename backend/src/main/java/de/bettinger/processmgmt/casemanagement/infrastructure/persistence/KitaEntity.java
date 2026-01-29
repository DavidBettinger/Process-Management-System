package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;

@Getter
@Entity
@Table(name = "kitas")
public class KitaEntity {

	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "location_id", nullable = false)
	private UUID locationId;

	protected KitaEntity() {
	}

	public KitaEntity(UUID id, String tenantId, String name, UUID locationId) {
		this.id = id;
		this.tenantId = tenantId;
		this.name = name;
		this.locationId = locationId;
	}
}
