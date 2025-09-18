package com.flavorshare.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .cors(Customizer.withDefaults())
      .csrf(csrf -> csrf.disable())
      .headers(h -> h.frameOptions(f -> f.disable())) // allow H2 console
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/", "/api/**", "/h2/**", "/h2-console/**").permitAll()
        .anyRequest().permitAll()
      );
    return http.build();
  }
}
