package com.pricing.pricing_backend.client;

import com.pricing.pricing_backend.dto.PredictRequest;
import com.pricing.pricing_backend.dto.PredictResponse;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange
public interface MLClient {

    @PostExchange("/ml/predict")
    PredictResponse predict(PredictRequest request);

    @GetExchange("/health")
    Object health();
}