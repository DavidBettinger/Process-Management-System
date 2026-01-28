package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import de.bettinger.processmgmt.casemanagement.domain.StakeholderRole;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "case_stakeholders")
public class CaseStakeholderEntity {

	@Getter
    @EmbeddedId
	private CaseStakeholderId id;

	@MapsId("caseId")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "case_id", nullable = false)
	private ProcessCaseEntity processCase;

	@Getter
    @Column(name = "role", nullable = false)
	@Enumerated(EnumType.STRING)
	private StakeholderRole role;

	protected CaseStakeholderEntity() {
	}

	public CaseStakeholderEntity(ProcessCaseEntity processCase, String userId, StakeholderRole role) {
		this.processCase = processCase;
		this.id = new CaseStakeholderId(processCase.getId(), userId);
		this.role = role;
	}

}
