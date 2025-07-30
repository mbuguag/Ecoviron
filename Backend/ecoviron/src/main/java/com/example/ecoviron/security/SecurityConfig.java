package com.example.ecoviron.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configure(http))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        //  Serve images and static files without security
                        .requestMatchers("/uploads/**", "/css/**", "/js/**", "/images/**", "/static/**").permitAll()

                        // Public API endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/users/**",
                                "/api/newsletter/**",
                                "/api/payment/callback",
                                "/api/about/**",
                                "/api/services",
                                "/api/services/**",
                                "/api/cart/**",
                                "/api/contact/**",
                                "/api/public-blogs/**",
                                "/api/images/**",
                                "/api/public-blogs/tags",
                                "/api/public-blogs/public{id}",
                                "/api/public-blogs/public{id}/views"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/quote/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/quote/**").permitAll()



                        // Authenticated user endpoints
                        .requestMatchers(
                                "/api/orders", "/api/orders/**",
                                "/api/payment/**"
                        ).authenticated()

                        // Admin-only endpoints
                        .requestMatchers(
                                "/api/categories/**",
                                "/api/admin/**",
                                "/api/contact/admin/**",
                                "/api/admin/quote-requests/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/services/**").hasRole("ADMIN")
                        .requestMatchers( "/api/admin-blogs/**").hasRole("ADMIN")

                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                .userDetailsService(userDetailsService)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
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
