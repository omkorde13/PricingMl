package com.pricing.pricing_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("ml.service")
public record MLServiceProperties(
        String url,
        int    timeout
) {}