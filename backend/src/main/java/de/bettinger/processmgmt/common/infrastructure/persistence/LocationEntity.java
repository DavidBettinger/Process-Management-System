package de.bettinger.processmgmt.common.infrastructure.persistence;

import de.bettinger.processmgmt.common.domain.Address;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;

@Getter
@Entity
@Table(name = "locations")
public class LocationEntity {

	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "label", nullable = false)
	private String label;

	@Embedded
	private Address address;

	protected LocationEntity() {
	}

	public LocationEntity(UUID id, String tenantId, String label, Address address) {
		this.id = id;
		this.tenantId = tenantId;
		this.label = label;
		this.address = address;
	}
}
