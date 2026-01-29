package de.bettinger.processmgmt.common.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import de.bettinger.processmgmt.common.domain.Address;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@Transactional
class LocationRepositoryTest {

	@Autowired
	private LocationRepository locationRepository;

	@Test
	void savesAndLoadsLocation() {
		UUID id = UUID.randomUUID();
		Address address = new Address("Musterstrasse", "12", "10115", "Berlin", "DE");
		LocationEntity entity = new LocationEntity(id, "tenant-1", "Kita Sonnenblume", address);

		locationRepository.saveAndFlush(entity);

		LocationEntity saved = locationRepository.findById(id).orElseThrow();
		assertThat(saved.getLabel()).isEqualTo("Kita Sonnenblume");
		assertThat(saved.getAddress().getCity()).isEqualTo("Berlin");
		assertThat(saved.getAddress().getPostalCode()).isEqualTo("10115");
	}
}
