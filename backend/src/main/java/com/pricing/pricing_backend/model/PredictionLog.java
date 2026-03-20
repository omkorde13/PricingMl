package com.pricing.pricing_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "prediction_logs", indexes = {
        @Index(name = "idx_hour",       columnList = "hour"),
        @Index(name = "idx_created_at", columnList = "created_at"),
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PredictionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private Integer demand;
    @Column(nullable = false) private Integer supply;
    @Column(nullable = false) private Integer hour;
    private boolean raining;
    private boolean weekend;
    private boolean event;

    private long   ridgePriceInr;
    private long   rfPriceInr;
    private long   xgbPriceInr;
    private long   lgbmPriceInr;

    private double ridgeSurge;
    private double rfSurge;
    private double xgbSurge;
    private double lgbmSurge;

    @Column(nullable = false)
    private String recommended;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { this.createdAt = Instant.now(); }
}