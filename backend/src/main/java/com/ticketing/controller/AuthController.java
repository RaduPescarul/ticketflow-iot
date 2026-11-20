package com.ticketing.controller;

import com.ticketing.dto.AuthRequest;
import com.ticketing.dto.AuthResponse;
import com.ticketing.model.Role;
import com.ticketing.model.User;
import com.ticketing.repository.UserRepository;
import com.ticketing.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(err);
        }
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("message", "Email already registered");
            return ResponseEntity.status(409).body(err);
        }
        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        try {
            user.setRole(req.getRole() != null ? Role.valueOf(req.getRole().toUpperCase()) : Role.CLIENT);
        } catch (IllegalArgumentException e) {
            user.setRole(Role.CLIENT);
        }
        user.setNetBalance(BigDecimal.ZERO);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}