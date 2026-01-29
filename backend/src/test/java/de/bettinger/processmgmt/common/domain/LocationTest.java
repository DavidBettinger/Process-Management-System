package de.bettinger.processmgmt.common.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LocationTest {

	@Test
	void createsLocationWithId() {
		Address address = new Address("Musterstraße", "12", "10115", "Berlin", "DE");
		Location location = Location.create("tenant-1", "Kita Sonnenblume", address);

		assertThat(location.getId()).isNotNull();
		assertThat(location.getTenantId()).isEqualTo("tenant-1");
		assertThat(location.getLabel()).isEqualTo("Kita Sonnenblume");
		assertThat(location.getAddress()).isEqualTo(address);
	}
}
