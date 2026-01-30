package de.bettinger.processmgmt.common.api.stakeholders;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.application.StakeholderTasksQueryService;
import de.bettinger.processmgmt.common.api.stakeholders.dto.CreateStakeholderRequest;
import de.bettinger.processmgmt.common.api.stakeholders.dto.CreateStakeholderResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.ListStakeholdersResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.StakeholderSummaryResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.StakeholderTaskSummaryResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.StakeholderTasksResponse;
import de.bettinger.processmgmt.common.application.StakeholderService;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderEntity;
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
@RequestMapping("/api/stakeholders")
public class StakeholdersController {

	private final StakeholderService stakeholderService;
	private final StakeholderTasksQueryService stakeholderTasksQueryService;

	public StakeholdersController(StakeholderService stakeholderService,
								  StakeholderTasksQueryService stakeholderTasksQueryService) {
		this.stakeholderService = stakeholderService;
		this.stakeholderTasksQueryService = stakeholderTasksQueryService;
	}

	@PostMapping
	public ResponseEntity<CreateStakeholderResponse> createStakeholder(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@Valid @RequestBody CreateStakeholderRequest request
	) {
		StakeholderEntity entity = stakeholderService.createStakeholder(
				tenantId,
				request.firstName(),
				request.lastName(),
				request.role()
		);
		return ResponseEntity.status(HttpStatus.CREATED).body(new CreateStakeholderResponse(entity.getId()));
	}

	@GetMapping
	public ListStakeholdersResponse listStakeholders(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId
	) {
		List<StakeholderSummaryResponse> items = stakeholderService.listStakeholders(tenantId).stream()
				.map(this::toSummary)
				.toList();
		return new ListStakeholdersResponse(items);
	}

	@GetMapping("/{stakeholderId}/tasks")
	public StakeholderTasksResponse listStakeholderTasks(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@PathVariable UUID stakeholderId
	) {
		stakeholderService.getStakeholder(tenantId, stakeholderId);
		List<StakeholderTaskSummaryResponse> items = stakeholderTasksQueryService
				.listAssignedTasks(tenantId, stakeholderId).stream()
				.map(task -> new StakeholderTaskSummaryResponse(
						task.getId(),
						task.getCaseId(),
						task.getTitle(),
						task.getState(),
						task.getAssigneeId(),
						task.getDueDate()
				))
				.toList();
		return new StakeholderTasksResponse(stakeholderId, items);
	}

	private StakeholderSummaryResponse toSummary(StakeholderEntity entity) {
		return new StakeholderSummaryResponse(
				entity.getId(),
				entity.getFirstName(),
				entity.getLastName(),
				entity.getRole()
		);
	}
}
