package de.bettinger.processmgmt.casemanagement.api;

import de.bettinger.processmgmt.casemanagement.domain.ProcessCaseStatus;
import de.bettinger.processmgmt.casemanagement.domain.StakeholderRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class CaseDtos {

	private CaseDtos() {
	}

	public record CreateCaseRequest(@NotBlank String title, @NotNull UUID kitaId) {
	}

	public record CreateCaseResponse(UUID id, ProcessCaseStatus status) {
	}

	public record AddStakeholderRequest(@NotBlank String userId, @NotNull StakeholderRole role) {
	}

	public record StakeholderResponse(String userId, StakeholderRole role) {
	}

	public record StakeholdersResponse(UUID caseId, List<StakeholderResponse> stakeholders) {
	}

	public record ActivateCaseResponse(UUID id, ProcessCaseStatus status) {
	}

	public record CaseDetailsResponse(UUID id, String tenantId, String title, UUID kitaId, ProcessCaseStatus status,
			List<StakeholderResponse> stakeholders, Instant createdAt) {
	}

	public record CasesResponse(List<CaseDetailsResponse> items) {
	}
}
