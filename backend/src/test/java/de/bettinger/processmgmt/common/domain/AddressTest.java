package de.bettinger.processmgmt.common.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import org.junit.jupiter.api.Test;

class AddressTest {

	@Test
	void defaultsCountryToGermany() {
		Address address = new Address("Musterstraße", "12", "10115", "Berlin", null);

		assertThat(address.getCountry()).isEqualTo("DE");
	}

	@Test
	void equalityUsesAllFields() {
		Address first = new Address("Musterstraße", "12", "10115", "Berlin", "DE");
		Address second = new Address("Musterstraße", "12", "10115", "Berlin", "DE");

		assertThat(first).isEqualTo(second);
		assertThat(first.hashCode()).isEqualTo(second.hashCode());
	}

	@Test
	void addressHasNoSetters() {
		Method[] methods = Address.class.getMethods();
		boolean hasSetter = false;
		for (Method method : methods) {
			if (method.getName().startsWith("set") && method.getParameterCount() == 1) {
				hasSetter = true;
				break;
			}
		}
		assertThat(hasSetter).isFalse();
	}
}
