package com.pricing.pricing_backend.service;

import com.pricing.pricing_backend.client.MLClient;
import com.pricing.pricing_backend.config.PricingProperties;
import com.pricing.pricing_backend.dto.*;
import com.pricing.pricing_backend.model.PredictionLog;
import com.pricing.pricing_backend.model.PredictionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MLService {

    private final MLClient                mlClient;
    private final PredictionLogRepository logRepo;
    private final PricingProperties       pricingProps;

    @Cacheable(
            value = "predictions",
            key   = "#req.demand() + '-' + #req.supply() + '-' + #req.hour() + '-' + #req.isRaining() + '-' + #req.isWeekend() + '-' + #req.isEvent()"
    )
    public PredictResponse predict(PredictRequest req) {
        log.debug("ML predict — demand={}, supply={}, hour={}", req.demand(), req.supply(), req.hour());

        PredictResponse response;
        try {
            response = mlClient.predict(req);
        } catch (Exception ex) {
            log.error("ML service error: {}", ex.getMessage());
            throw new RuntimeException("ML service unavailable. Is Python FastAPI running on :8000?");
        }

        // Log to PostgreSQL on a virtual thread — non-blocking
        Thread.ofVirtual().start(() -> logPrediction(req, response));

        return response;
    }

    @CacheEvict(value = "predictions", allEntries = true)
    public void evictAllPredictions() {
        log.info("Redis prediction cache cleared");
    }

    public StatsResponse getStats() {
        long total   = logRepo.count();
        var  recent  = logRepo.findTop100ByOrderByCreatedAtDesc();
        long avgLgbm = (long) recent.stream()
                .mapToLong(PredictionLog::getLgbmPriceInr)
                .average()
                .orElse(0);

        return new StatsResponse(total, avgLgbm, pricingProps.usdToInr());
    }

    private void logPrediction(PredictRequest req, PredictResponse res) {
        try {
            logRepo.save(PredictionLog.builder()
                    .demand(req.demand())
                    .supply(req.supply())
                    .hour(req.hour())
                    .raining(req.isRaining())
                    .weekend(req.isWeekend())
                    .event(req.isEvent())
                    .ridgePriceInr(res.ridge().priceINR())
                    .rfPriceInr(res.rf().priceINR())
                    .xgbPriceInr(res.xgb().priceINR())
                    .lgbmPriceInr(res.lgbm().priceINR())
                    .ridgeSurge(res.ridge().surgeMultiplier())
                    .rfSurge(res.rf().surgeMultiplier())
                    .xgbSurge(res.xgb().surgeMultiplier())
                    .lgbmSurge(res.lgbm().surgeMultiplier())
                    .recommended(res.recommended())
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log prediction (non-critical): {}", ex.getMessage());
        }
    }
}