package com.pricing.pricing_backend.dto;

import java.time.Instant;

public record ModelPrediction(
        long   priceINR,
        double surgeMultiplier,
        double r2Score,
        double rmse,
        long   trainingTimeMs
) {}