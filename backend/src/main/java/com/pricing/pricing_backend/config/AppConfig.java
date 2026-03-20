package com.pricing.pricing_backend.config;

import com.pricing.pricing_backend.client.MLClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.support.WebClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.time.Duration;

@Configuration
@EnableCaching
@EnableConfigurationProperties({
        MLServiceProperties.class,
        JwtProperties.class,
        PricingProperties.class,
        CorsProperties.class,
})
public class AppConfig implements WebMvcConfigurer {

    private final MLServiceProperties mlProps;
    private final CorsProperties      corsProps;

    public AppConfig(MLServiceProperties mlProps, CorsProperties corsProps) {
        this.mlProps   = mlProps;
        this.corsProps = corsProps;
    }

    // Spring Boot 4: @HttpExchange client via WebClient
    @Bean
    public MLClient mlClient() {
        WebClient webClient = WebClient.builder()
                .baseUrl(mlProps.url())
                .codecs(c -> c.defaultCodecs().maxInMemorySize(1024 * 1024))
                .filter((request, next) -> next.exchange(request)
                        .timeout(Duration.ofMillis(mlProps.timeout())))
                .build();

        HttpServiceProxyFactory factory = HttpServiceProxyFactory
                .builderFor(WebClientAdapter.create(webClient))
                .build();

        return factory.createClient(MLClient.class);
    }

    // Allow React Vite dev server at :5173
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(corsProps.allowedOrigins())
                .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}