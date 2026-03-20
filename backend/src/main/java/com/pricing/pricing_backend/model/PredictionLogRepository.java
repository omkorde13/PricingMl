package com.pricing.pricing_backend.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.OptionalDouble;

@Repository
public interface PredictionLogRepository extends JpaRepository<PredictionLog, Long> {

    List<PredictionLog> findTop100ByOrderByCreatedAtDesc();

    List<PredictionLog> findByCreatedAtBetween(Instant from, Instant to);

    @Query("SELECT AVG(p.lgbmPriceInr) FROM PredictionLog p WHERE p.hour = :hour")
    OptionalDouble avgLgbmPriceByHour(int hour);

    @Query("SELECT COUNT(p) FROM PredictionLog p WHERE p.raining = true")
    long countRainyPredictions();
}