package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@Transactional
class KitaRepositoryTest {

	@Autowired
	private KitaRepository kitaRepository;

	@Test
	void savesAndLoadsKita() {
		UUID id = UUID.randomUUID();
		UUID locationId = UUID.randomUUID();
		KitaEntity entity = new KitaEntity(id, "tenant-1", "Kita Sonnenblume", locationId);

		kitaRepository.saveAndFlush(entity);

		KitaEntity saved = kitaRepository.findById(id).orElseThrow();
		assertThat(saved.getName()).isEqualTo("Kita Sonnenblume");
		assertThat(saved.getLocationId()).isEqualTo(locationId);
	}
}
