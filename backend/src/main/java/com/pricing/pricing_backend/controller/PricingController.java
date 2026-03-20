package com.pricing.pricing_backend.controller;

import com.pricing.pricing_backend.dto.*;
import com.pricing.pricing_backend.service.MLService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PricingController {

    private final MLService mlService;

    // POST /api/predict — React sends ride conditions, gets all 4 model predictions
    @PostMapping("/predict")
    public ResponseEntity<PredictResponse> predict(@Valid @RequestBody PredictRequest request) {
        log.info("Predict — demand={}, supply={}, hour={}",
                request.demand(), request.supply(), request.hour());
        return ResponseEntity.ok(mlService.predict(request));
    }

    // GET /api/health — React polls every 30s to show backend status badge
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse("UP", "pricing-backend", true, true));
    }

    // GET /api/stats — total predictions, average price from PostgreSQL
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> stats() {
        return ResponseEntity.ok(mlService.getStats());
    }

    // DELETE /api/cache — force-clear Redis (call after retraining models)
    @DeleteMapping("/cache")
    public ResponseEntity<String> clearCache() {
        mlService.evictAllPredictions();
        return ResponseEntity.ok("Cache cleared");
    }
}