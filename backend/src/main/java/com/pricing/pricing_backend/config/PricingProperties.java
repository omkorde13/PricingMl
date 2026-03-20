package com.pricing.pricing_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("pricing")
public record PricingProperties(
        double usdToInr,
        double baseFareUsd
) {}