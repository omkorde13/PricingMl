package com.pricing.pricing_backend.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;

public record PredictRequest(

        @NotNull @Min(1) @Max(200)
        Integer demand,

        @NotNull @Min(1) @Max(200)
        Integer supply,

        @NotNull @Min(0) @Max(23)
        Integer hour,

        boolean isRaining,
        boolean isWeekend,
        boolean isEvent
) {
    public PredictRequest {
        if (demand == null) demand = 50;
        if (supply == null) supply = 40;
        if (hour   == null) hour   = 12;
    }
}