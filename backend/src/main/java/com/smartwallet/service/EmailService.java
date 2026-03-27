package com.smartwallet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.mail.password}")
    private String apiKey;

    // Verified sender address for Brevo
    private String fromEmail = "adityakanoujia30@gmail.com";
    private String senderName = "Smart Wallet";

    private final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    public void sendVerificationEmail(String to, String otp) {
        String subject = "Smart Wallet - Verify Your Email";
        String content = "Welcome to Smart Wallet! Your verification code is: " + otp + 
                         "\n\nThis code will expire in 10 minutes.";
        sendEmailViaHttp(to, subject, content, "Email Verification");
    }

    public void sendForgotPasswordEmail(String to, String otp) {
        String subject = "Smart Wallet - Password Reset Request";
        String content = "You requested a password reset. Your OTP is: " + otp + 
                         "\n\nIf you didn't request this, please ignore this email.";
        sendEmailViaHttp(to, subject, content, "Password Reset");
    }

    private void sendEmailViaHttp(String to, String subject, String content, String context) {
        logger.info("PRE-SEND (HTTP): Attempting to send {} to {}", context, to);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("sender", Map.of("name", senderName, "email", fromEmail));
            body.put("to", List.of(Map.of("email", to)));
            body.put("subject", subject);
            body.put("textContent", content);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_API_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("POST-SEND (HTTP) SUCCESS: {} sent to {}", context, to);
            } else {
                logger.error("POST-SEND (HTTP) ERROR: Brevo returned status {}: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Email delivery failed via HTTP API");
            }
        } catch (Exception e) {
            logger.error("POST-SEND (HTTP) CRITICAL ERROR: Failed to send {}: {}", context, e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage());
        }
    }
}
