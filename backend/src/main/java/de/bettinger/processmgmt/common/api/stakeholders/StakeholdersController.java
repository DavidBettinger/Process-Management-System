package de.bettinger.processmgmt.common.api.stakeholders;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.application.StakeholderTasksQueryService;
import de.bettinger.processmgmt.common.api.paging.PageResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.CreateStakeholderRequest;
import de.bettinger.processmgmt.common.api.stakeholders.dto.CreateStakeholderResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.ListStakeholdersResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.StakeholderSummaryResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.StakeholderTaskSummaryResponse;
import de.bettinger.processmgmt.common.api.stakeholders.dto.StakeholderTasksResponse;
import de.bettinger.processmgmt.common.application.StakeholderService;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderEntity;
import jakarta.validation.Valid;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stakeholders")
public class StakeholdersController {

	private static final int DEFAULT_PAGE = 0;
	private static final int DEFAULT_SIZE = 20;
	private static final int MAX_SIZE = 100;
	private static final Set<String> STAKEHOLDER_SORT_FIELDS = Set.of("lastName", "firstName", "createdAt");
	private static final Set<String> TASK_SORT_FIELDS = Set.of("dueDate", "createdAt", "state");

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
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@RequestParam(defaultValue = "" + DEFAULT_PAGE) int page,
			@RequestParam(defaultValue = "" + DEFAULT_SIZE) int size,
			@RequestParam(required = false) String sort
	) {
		Pageable pageable = toPageable(page, size, sort, STAKEHOLDER_SORT_FIELDS,
				Sort.by("createdAt").descending());
		Page<StakeholderSummaryResponse> pageResult = stakeholderService.listStakeholders(tenantId, pageable)
				.map(this::toSummary);
		return ListStakeholdersResponse.from(PageResponse.from(pageResult));
	}

	@GetMapping("/{stakeholderId}/tasks")
	public StakeholderTasksResponse listStakeholderTasks(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@PathVariable UUID stakeholderId,
			@RequestParam(defaultValue = "" + DEFAULT_PAGE) int page,
			@RequestParam(defaultValue = "" + DEFAULT_SIZE) int size,
			@RequestParam(required = false) String sort
	) {
		stakeholderService.getStakeholder(tenantId, stakeholderId);
		Pageable pageable = toPageable(page, size, sort, TASK_SORT_FIELDS,
				Sort.by("createdAt").descending());
		Page<StakeholderTaskSummaryResponse> pageResult = stakeholderTasksQueryService
				.listAssignedTasks(tenantId, stakeholderId, pageable)
				.map(task -> new StakeholderTaskSummaryResponse(
						task.getId(),
						task.getCaseId(),
						task.getTitle(),
						task.getState(),
						task.getAssigneeId(),
						task.getDueDate()
				));
		return StakeholderTasksResponse.from(stakeholderId, PageResponse.from(pageResult));
	}

	private Pageable toPageable(int page, int size, String sort, Set<String> allowedFields, Sort defaultSort) {
		if (page < 0) {
			throw new IllegalArgumentException("page must be >= 0");
		}
		if (size < 1 || size > MAX_SIZE) {
			throw new IllegalArgumentException("size must be between 1 and " + MAX_SIZE);
		}
		Sort sortSpec = parseSort(sort, allowedFields, defaultSort);
		return PageRequest.of(page, size, sortSpec);
	}

	private Sort parseSort(String sort, Set<String> allowedFields, Sort defaultSort) {
		if (sort == null || sort.isBlank()) {
			return defaultSort;
		}
		String[] parts = sort.split(",", -1);
		if (parts.length != 2) {
			throw new IllegalArgumentException("sort must be in format field,asc|desc");
		}
		String field = parts[0].trim();
		String direction = parts[1].trim().toLowerCase();
		if (field.isEmpty() || !allowedFields.contains(field)) {
			throw new IllegalArgumentException("Unsupported sort field: " + field);
		}
		Sort.Direction sortDirection;
		if ("asc".equals(direction)) {
			sortDirection = Sort.Direction.ASC;
		} else if ("desc".equals(direction)) {
			sortDirection = Sort.Direction.DESC;
		} else {
			throw new IllegalArgumentException("sort direction must be asc or desc");
		}
		return Sort.by(sortDirection, field);
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
