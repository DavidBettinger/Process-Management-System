package de.bettinger.processmgmt.casemanagement.domain;

import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class ProcessCase {

	@Getter
    private final UUID id;
	@Getter
    private final String tenantId;
	@Getter
    private final String title;
	@Getter
    private final String kitaName;
	@Getter
    private final Instant createdAt;
	private final List<Stakeholder> stakeholders = new ArrayList<>();
	@Getter
    private ProcessCaseStatus status;

	private ProcessCase(UUID id, String tenantId, String title, String kitaName, Instant createdAt) {
		this.id = Objects.requireNonNull(id, "id");
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId");
		this.title = Objects.requireNonNull(title, "title");
		this.kitaName = Objects.requireNonNull(kitaName, "kitaName");
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
		this.status = ProcessCaseStatus.DRAFT;
	}

	public static ProcessCase create(String tenantId, String title, String kitaName) {
		return new ProcessCase(UUID.randomUUID(), tenantId, title, kitaName, Instant.now());
	}

	public void addStakeholder(String userId, StakeholderRole role) {
		stakeholders.add(new Stakeholder(userId, role));
	}

	public void activate() {
		boolean hasConsultant = stakeholders.stream()
				.anyMatch(stakeholder -> stakeholder.role() == StakeholderRole.CONSULTANT);
		if (!hasConsultant) {
			throw new IllegalStateException("Cannot activate case without a consultant");
		}
		status = ProcessCaseStatus.ACTIVE;
	}

    public List<Stakeholder> getStakeholders() {
		return Collections.unmodifiableList(stakeholders);
	}
}
