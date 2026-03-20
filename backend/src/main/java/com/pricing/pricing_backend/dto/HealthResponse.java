package com.pricing.pricing_backend.dto;

public record HealthResponse(
        String  status,
        String  service,
        boolean mlServiceOnline,
        boolean redisOnline
) {}