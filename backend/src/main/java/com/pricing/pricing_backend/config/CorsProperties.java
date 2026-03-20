package com.pricing.pricing_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("cors")
public record CorsProperties(
        String allowedOrigins
) {}