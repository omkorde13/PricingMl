package com.pricing.pricing_backend.dto;

public record StatsResponse(
        long   totalPredictions,
        long   avgLgbmPriceInr,
        double usdToInr
) {}