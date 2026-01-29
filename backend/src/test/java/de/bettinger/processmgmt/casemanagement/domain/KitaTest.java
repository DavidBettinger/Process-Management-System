package de.bettinger.processmgmt.casemanagement.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import de.bettinger.processmgmt.common.domain.LocationId;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class KitaTest {

	@Test
	void requiresNonBlankName() {
		LocationId locationId = new LocationId(UUID.randomUUID());

		assertThatThrownBy(() -> Kita.create("tenant-1", " ", locationId))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("Kita name");
	}

	@Test
	void createsKita() {
		LocationId locationId = new LocationId(UUID.randomUUID());
		Kita kita = Kita.create("tenant-1", "Kita Sonnenblume", locationId);

		assertThat(kita.getId()).isNotNull();
		assertThat(kita.getTenantId()).isEqualTo("tenant-1");
		assertThat(kita.getName()).isEqualTo("Kita Sonnenblume");
		assertThat(kita.getLocationId()).isEqualTo(locationId);
	}
}
