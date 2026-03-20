package com.pricing.pricing_backend.dto;

import jakarta.validation.constraints.*;

public record PredictRequest(

        // ── Time ──────────────────────────────────────────────────────────
        @NotNull @Min(0) @Max(23)
        Integer hour,

        boolean isWeekend,
        boolean isRushHour,

        // ── Ride details ──────────────────────────────────────────────────
        String  vehicleType,

        @NotNull @DecimalMin("0.5") @DecimalMax("55.0")
        Double  rideDistance,

        @DecimalMin("1.0") @DecimalMax("30.0")
        Double  avgVtat,

        @DecimalMin("1.0") @DecimalMax("40.0")
        Double  avgCtat,

        @DecimalMin("1.0") @DecimalMax("5.0")
        Double  driverRating,

        @DecimalMin("1.0") @DecimalMax("5.0")
        Double  customerRating,

        // ── Legacy fields ─────────────────────────────────────────────────
        boolean isRaining,
        boolean isEvent,

        @Min(1) @Max(200)
        Integer demand,

        @Min(1) @Max(200)
        Integer supply
) {
    public PredictRequest {
        if (hour           == null) hour           = 12;
        if (rideDistance   == null) rideDistance   = 10.0;
        if (avgVtat        == null) avgVtat         = 10.0;
        if (avgCtat        == null) avgCtat         = 15.0;
        if (driverRating   == null) driverRating    = 4.5;
        if (customerRating == null) customerRating  = 4.5;
        if (vehicleType    == null) vehicleType     = "Mini";
        if (demand         == null) demand          = 50;
        if (supply         == null) supply          = 40;
    }
}