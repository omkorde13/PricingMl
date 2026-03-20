package com.pricing.pricing_backend.dto;

import java.time.Instant;

public record PredictResponse(
        ModelPrediction ridge,
        ModelPrediction rf,
        ModelPrediction xgb,
        ModelPrediction lgbm,
        String          recommended,
        double          usdToInr,
        Instant         timestamp
) {}