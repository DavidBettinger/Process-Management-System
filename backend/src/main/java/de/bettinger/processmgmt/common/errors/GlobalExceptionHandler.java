package de.bettinger.processmgmt.common.errors;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> details = new HashMap<>();
		for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
			details.put(fieldError.getField(), fieldError.getDefaultMessage());
		}
		ApiError error = new ApiError("VALIDATION_ERROR", "Invalid request", details, traceId());
		return ResponseEntity.badRequest().body(error);
	}

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<ApiError> handleNotFound(NotFoundException ex) {
		ApiError error = new ApiError("NOT_FOUND", ex.getMessage(), null, traceId());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
	}

	@ExceptionHandler(MissingRequestHeaderException.class)
	public ResponseEntity<ApiError> handleMissingHeader(MissingRequestHeaderException ex) {
		ApiError error = new ApiError("UNAUTHORIZED", ex.getMessage(), null, traceId());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
		ApiError error = new ApiError("VALIDATION_ERROR", ex.getMessage(), null, traceId());
		return ResponseEntity.badRequest().body(error);
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex) {
		ApiError error = new ApiError("DOMAIN_ERROR", ex.getMessage(), null, traceId());
		return ResponseEntity.badRequest().body(error);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
		ApiError error = new ApiError("INTERNAL_ERROR", "Unexpected error", null, traceId());
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
	}

	private String traceId() {
		return UUID.randomUUID().toString();
	}
}
