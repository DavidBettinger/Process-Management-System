package de.bettinger.processmgmt.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.util.Objects;
import lombok.Getter;

@Getter
@Embeddable
public class Address {

	@Column(name = "street", nullable = false)
	private String street;

	@Column(name = "house_number", nullable = false)
	private String houseNumber;

	@Column(name = "postal_code", nullable = false)
	private String postalCode;

	@Column(name = "city", nullable = false)
	private String city;

	@Column(name = "country", nullable = false)
	private String country;

	protected Address() {
	}

	public Address(String street, String houseNumber, String postalCode, String city, String country) {
		this.street = Objects.requireNonNull(street, "street");
		this.houseNumber = Objects.requireNonNull(houseNumber, "houseNumber");
		this.postalCode = Objects.requireNonNull(postalCode, "postalCode");
		this.city = Objects.requireNonNull(city, "city");
		this.country = normalizeCountry(country);
	}

	private String normalizeCountry(String value) {
		if (value == null || value.isBlank()) {
			return "DE";
		}
		return value;
	}

	@Override
	public boolean equals(Object other) {
		if (this == other) {
			return true;
		}
		if (!(other instanceof Address address)) {
			return false;
		}
		return Objects.equals(street, address.street)
				&& Objects.equals(houseNumber, address.houseNumber)
				&& Objects.equals(postalCode, address.postalCode)
				&& Objects.equals(city, address.city)
				&& Objects.equals(country, address.country);
	}

	@Override
	public int hashCode() {
		return Objects.hash(street, houseNumber, postalCode, city, country);
	}
}
