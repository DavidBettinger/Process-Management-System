package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Getter
@Embeddable
public class CaseStakeholderId implements Serializable {

	@Column(name = "case_id", nullable = false)
	private UUID caseId;

	@Column(name = "user_id", nullable = false)
	private String userId;

	protected CaseStakeholderId() {
	}

	public CaseStakeholderId(UUID caseId, String userId) {
		this.caseId = caseId;
		this.userId = userId;
	}

    @Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (!(o instanceof CaseStakeholderId that)) {
			return false;
		}
		return Objects.equals(caseId, that.caseId)
				&& Objects.equals(userId, that.userId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(caseId, userId);
	}
}
