package de.bettinger.processmgmt.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class DevAuthFilter extends OncePerRequestFilter {

	public static final String USER_HEADER = "X-Dev-UserId";
	public static final String TENANT_HEADER = "X-Tenant-Id";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String path = request.getRequestURI();
		if (path.startsWith("/api") && !path.equals("/api/health")) {
			String userId = request.getHeader(USER_HEADER);
			String tenantId = request.getHeader(TENANT_HEADER);
			if (userId == null || userId.isBlank() || tenantId == null || tenantId.isBlank()) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.setContentType("application/json");
				response.setCharacterEncoding("UTF-8");
				response.getWriter().write(unauthorizedBody());
				return;
			}
		}
		filterChain.doFilter(request, response);
	}

	private String traceId() {
		return UUID.randomUUID().toString();
	}

	private String unauthorizedBody() {
		return "{\"code\":\"UNAUTHORIZED\",\"message\":\"Missing dev auth headers\",\"details\":null,\"traceId\":\""
				+ traceId() + "\"}";
	}
}
