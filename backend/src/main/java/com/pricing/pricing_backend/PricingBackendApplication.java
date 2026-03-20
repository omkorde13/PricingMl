package com.pricing.pricing_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan("com.pricing.pricing_backend.config")
public class PricingBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PricingBackendApplication.class, args);
	}
}