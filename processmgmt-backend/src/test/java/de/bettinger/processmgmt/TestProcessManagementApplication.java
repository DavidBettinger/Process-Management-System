package de.bettinger.processmgmt;

import org.springframework.boot.SpringApplication;

public class TestProcessManagementApplication {

	public static void main(String[] args) {
		SpringApplication.from(ProcessManagementApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
