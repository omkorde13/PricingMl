package com.pricing.pricing_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
@SpringBootApplication
@ConfigurationPropertiesScan("com.pricing.pricing_backend.config")
public class PricingBackendApplication {

	public static void main(String[] args) {
		System.out.println(">>> TIMEZONE: " + java.util.TimeZone.getDefault().getID());
		System.out.println(">>> DB URL: " + System.getProperty("spring.datasource.url"));
		SpringApplication.run(PricingBackendApplication.class, args);
	}
}
//@SpringBootApplication
//@ConfigurationPropertiesScan("com.pricing.pricing_backend.config")
//public class PricingBackendApplication {
//
//	public static void main(String[] args) {
//		SpringApplication.run(PricingBackendApplication.class, args);
//	}
//}