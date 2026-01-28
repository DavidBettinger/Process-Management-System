package de.bettinger.processmgmt.common.errors;

import java.util.Map;

public record ApiError(String code, String message, Map<String, String> details, String traceId) {
}
