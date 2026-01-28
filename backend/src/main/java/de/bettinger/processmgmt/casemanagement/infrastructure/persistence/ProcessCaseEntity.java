package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import de.bettinger.processmgmt.casemanagement.domain.ProcessCaseStatus;
import de.bettinger.processmgmt.casemanagement.domain.StakeholderRole;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Entity
@Table(name = "cases")
public class ProcessCaseEntity {

	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "title", nullable = false)
	private String title;

	@Column(name = "kita_name", nullable = false)
	private String kitaName;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private ProcessCaseStatus status;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@OneToMany(mappedBy = "processCase", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<CaseStakeholderEntity> stakeholders = new ArrayList<>();

	protected ProcessCaseEntity() {
	}

	public ProcessCaseEntity(UUID id, String tenantId, String title, String kitaName, ProcessCaseStatus status,
								Instant createdAt) {
		this.id = id;
		this.tenantId = tenantId;
		this.title = title;
		this.kitaName = kitaName;
		this.status = status;
		this.createdAt = createdAt;
	}

	public void addStakeholder(String userId, StakeholderRole role) {
		stakeholders.add(new CaseStakeholderEntity(this, userId, role));
	}

}
