package de.bettinger.processmgmt.common.infrastructure.persistence;

import de.bettinger.processmgmt.ProcessManagementApplication;
import de.bettinger.processmgmt.common.domain.StakeholderRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DatabasePersistenceIT {

	@TempDir
	static Path tempDir;

	@Test
	void persistsDataAcrossContextRestart() {
		String dbPath = tempDir.resolve("app-db").toAbsolutePath().toString();
		Map<String, String> configuredProperties = Map.of(
				"spring.profiles.active", "dev",
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
		Map<String, String> previousProperties = captureProperties(configuredProperties.keySet().stream().toList());
		configuredProperties.forEach(System::setProperty);

		UUID stakeholderId = UUID.randomUUID();

		try {
			try (ConfigurableApplicationContext context = new SpringApplicationBuilder(ProcessManagementApplication.class)
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
					.run()) {
				StakeholderRepository repository = context.getBean(StakeholderRepository.class);
				assertThat(repository.findById(stakeholderId)).isPresent();
			}
		} finally {
			previousProperties.forEach(DatabasePersistenceIT::restoreSystemProperty);
		}
	}

	private static Map<String, String> captureProperties(List<String> keys) {
		java.util.Map<String, String> values = new java.util.HashMap<>();
		for (String key : keys) {
			values.put(key, System.getProperty(key));
		}
		return values;
	}

	private static void restoreSystemProperty(String key, String value) {
		if (value == null) {
			System.clearProperty(key);
		} else {
			System.setProperty(key, value);
		}
	}
}
