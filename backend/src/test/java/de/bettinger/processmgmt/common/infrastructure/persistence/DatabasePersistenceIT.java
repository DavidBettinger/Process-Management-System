package de.bettinger.processmgmt.common.infrastructure.persistence;

import de.bettinger.processmgmt.ProcessManagementApplication;
import de.bettinger.processmgmt.common.domain.StakeholderRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import java.nio.file.Path;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DatabasePersistenceIT {

	@TempDir
	static Path tempDir;

	@Test
	void persistsDataAcrossContextRestart() {
		String dbPath = tempDir.resolve("app-db").toAbsolutePath().toString();
		Map<String, Object> properties = Map.of(
				"spring.datasource.url",
				"jdbc:h2:file:" + dbPath + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;DATABASE_TO_UPPER=false",
				"spring.datasource.driver-class-name", "org.h2.Driver",
				"spring.datasource.username", "sa",
				"spring.datasource.password", "",
				"spring.jpa.database-platform", "org.hibernate.dialect.H2Dialect",
				"spring.jpa.hibernate.ddl-auto", "none",
				"spring.flyway.enabled", "true",
				"spring.flyway.locations", "classpath:db/migration",
				"spring.main.web-application-type", "none"
		);

		UUID stakeholderId = UUID.randomUUID();

		try (ConfigurableApplicationContext context = new SpringApplicationBuilder(ProcessManagementApplication.class)
				.properties(properties)
				.run()) {
			StakeholderRepository repository = context.getBean(StakeholderRepository.class);
			repository.save(new StakeholderEntity(
					stakeholderId,
					"tenant-001",
					"Maria",
					"Becker",
					StakeholderRole.CONSULTANT,
					Instant.parse("2026-01-30T10:00:00Z")
			));
		}

		try (ConfigurableApplicationContext context = new SpringApplicationBuilder(ProcessManagementApplication.class)
				.properties(properties)
				.run()) {
			StakeholderRepository repository = context.getBean(StakeholderRepository.class);
			assertThat(repository.findById(stakeholderId)).isPresent();
		}
	}
}
