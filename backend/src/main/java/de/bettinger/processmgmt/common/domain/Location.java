package de.bettinger.processmgmt.common.domain;

import java.util.Objects;
import java.util.UUID;
import lombok.Getter;

@Getter
public class Location {

	private final LocationId id;
	private final String tenantId;
	private final String label;
	private final Address address;

	private Location(LocationId id, String tenantId, String label, Address address) {
		this.id = Objects.requireNonNull(id, "id");
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId");
		this.label = Objects.requireNonNull(label, "label");
		this.address = Objects.requireNonNull(address, "address");
	}

	public static Location create(String tenantId, String label, Address address) {
		return new Location(new LocationId(UUID.randomUUID()), tenantId, label, address);
	}
}
