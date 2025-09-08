package com.example.ecoviron.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    // Public endpoints
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/api/users/register",
            "/api/newsletter/**",
            "/api/payment/callback",
            "/api/about/**",
            "/api/services/**",
            "/api/cart/**",
            "/api/contact/**",
            "/api/public-blogs/**",
            "/api/images/**",
            "/actuator/health",
            "/api/products",        // root products endpoint
            "/api/products/**",     // products subpaths
            "/api/quote/**"         // quote requests
    };

    // Static resources
    private static final String[] STATIC_RESOURCES = {
            "/uploads/**",
            "/css/**",
            "/js/**",
            "/images/**",
            "/static/**",
            "/favicon.ico"
    };

    // Admin endpoints
    private static final String[] ADMIN_ENDPOINTS = {
            "/api/categories/**",
            "/api/admin/**",
            "/api/contact/admin/**",
            "/api/admin/quote-requests/**",
            "/api/admin-blogs/**",
            "/api/services/**" // only POST restricted, GET is public
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Static resources
                        .requestMatchers(STATIC_RESOURCES).permitAll()

                        // Public API endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        // Admin endpoints (write access restricted)
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/services/**").hasRole("ADMIN")
                        .requestMatchers(ADMIN_ENDPOINTS).hasRole("ADMIN")

                        // Authenticated endpoints
                        .requestMatchers("/api/orders/**", "/api/payment/**").authenticated()

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .userDetailsService(userDetailsService)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:3000",
                "https://bionix-hse.co.ke",
                "https://www.bionix-hse.co.ke",
                "https://*.vercel.app"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
