package de.bettinger.processmgmt.casemanagement.api;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.application.CaseCommandService;
import de.bettinger.processmgmt.casemanagement.application.CaseQueryService;
import de.bettinger.processmgmt.casemanagement.api.CaseDtos.AddStakeholderRequest;
import de.bettinger.processmgmt.casemanagement.api.CaseDtos.ActivateCaseResponse;
import de.bettinger.processmgmt.casemanagement.api.CaseDtos.CaseDetailsResponse;
import de.bettinger.processmgmt.casemanagement.api.CaseDtos.CreateCaseRequest;
import de.bettinger.processmgmt.casemanagement.api.CaseDtos.CreateCaseResponse;
import de.bettinger.processmgmt.casemanagement.api.CaseDtos.StakeholderResponse;
import de.bettinger.processmgmt.casemanagement.api.CaseDtos.StakeholdersResponse;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseEntity;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

	private final CaseCommandService caseCommandService;
	private final CaseQueryService caseQueryService;

	public CaseController(CaseCommandService caseCommandService, CaseQueryService caseQueryService) {
		this.caseCommandService = caseCommandService;
		this.caseQueryService = caseQueryService;
	}

	@PostMapping
	public ResponseEntity<CreateCaseResponse> createCase(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@Valid @RequestBody CreateCaseRequest request
	) {
		ProcessCaseEntity entity = caseCommandService.createCase(tenantId, request.title(), request.kitaName());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new CreateCaseResponse(entity.getId(), entity.getStatus()));
	}

	@PostMapping("/{caseId}/stakeholders")
	public StakeholdersResponse addStakeholder(
			@PathVariable UUID caseId,
			@Valid @RequestBody AddStakeholderRequest request
	) {
		ProcessCaseEntity entity = caseCommandService.addStakeholder(caseId, request.userId(), request.role());
		return new StakeholdersResponse(entity.getId(), toStakeholders(entity));
	}

	@PostMapping("/{caseId}/activate")
	public ActivateCaseResponse activateCase(@PathVariable UUID caseId) {
		ProcessCaseEntity entity = caseCommandService.activateCase(caseId);
		return new ActivateCaseResponse(entity.getId(), entity.getStatus());
	}

	@GetMapping("/{caseId}")
	public CaseDetailsResponse getCase(@PathVariable UUID caseId) {
		ProcessCaseEntity entity = caseQueryService.getCase(caseId);
		return new CaseDetailsResponse(
				entity.getId(),
				entity.getTenantId(),
				entity.getTitle(),
				entity.getKitaName(),
				entity.getStatus(),
				toStakeholders(entity),
				entity.getCreatedAt()
		);
	}

	private List<StakeholderResponse> toStakeholders(ProcessCaseEntity entity) {
		return entity.getStakeholders().stream()
				.map(stakeholder -> new StakeholderResponse(stakeholder.getId().getUserId(), stakeholder.getRole()))
				.toList();
	}
}
