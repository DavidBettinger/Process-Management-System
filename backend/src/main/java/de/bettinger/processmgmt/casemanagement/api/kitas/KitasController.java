package de.bettinger.processmgmt.casemanagement.api.kitas;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.casemanagement.api.kitas.dto.CreateKitaRequest;
import de.bettinger.processmgmt.casemanagement.api.kitas.dto.CreateKitaResponse;
import de.bettinger.processmgmt.casemanagement.api.kitas.dto.KitaResponse;
import de.bettinger.processmgmt.casemanagement.api.kitas.dto.KitasResponse;
import de.bettinger.processmgmt.casemanagement.application.KitaService;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaEntity;
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
@RequestMapping("/api/kitas")
public class KitasController {

	private final KitaService kitaService;

	public KitasController(KitaService kitaService) {
		this.kitaService = kitaService;
	}

	@PostMapping
	public ResponseEntity<CreateKitaResponse> createKita(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@Valid @RequestBody CreateKitaRequest request
	) {
		KitaEntity entity = kitaService.createKita(tenantId, request.name(), request.locationId());
		return ResponseEntity.status(HttpStatus.CREATED).body(new CreateKitaResponse(entity.getId()));
	}

	@GetMapping
	public KitasResponse listKitas(@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId) {
		List<KitaResponse> items = kitaService.listKitas(tenantId).stream()
				.map(this::toResponse)
				.toList();
		return new KitasResponse(items);
	}

	@GetMapping("/{kitaId}")
	public KitaResponse getKita(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@PathVariable UUID kitaId
	) {
		KitaEntity entity = kitaService.getKita(tenantId, kitaId);
		return toResponse(entity);
	}

	private KitaResponse toResponse(KitaEntity entity) {
		return new KitaResponse(entity.getId(), entity.getName(), entity.getLocationId());
	}
}
