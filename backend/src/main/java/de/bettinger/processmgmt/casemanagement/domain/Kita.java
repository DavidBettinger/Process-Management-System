package de.bettinger.processmgmt.casemanagement.domain;

import de.bettinger.processmgmt.common.domain.LocationId;
import java.util.Objects;
import java.util.UUID;
import lombok.Getter;

@Getter
public class Kita {

	private final KitaId id;
	private final String tenantId;
	private final String name;
	private final LocationId locationId;

	private Kita(KitaId id, String tenantId, String name, LocationId locationId) {
		this.id = Objects.requireNonNull(id, "id");
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId");
		this.name = requireName(name);
		this.locationId = Objects.requireNonNull(locationId, "locationId");
	}

	public static Kita create(String tenantId, String name, LocationId locationId) {
		return new Kita(new KitaId(UUID.randomUUID()), tenantId, name, locationId);
	}

	private static String requireName(String name) {
		if (name == null || name.isBlank()) {
			throw new IllegalArgumentException("Kita name must not be blank");
		}
		return name;
	}
}
