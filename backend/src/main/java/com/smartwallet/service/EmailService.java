package com.smartwallet.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    // Verified sender address for Brevo
    private String fromEmail = "adityakanoujia30@gmail.com";
    private String verificationSenderName = "welcome";
    private String resetSenderName = "reset-wallet";

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String otp) {
        logger.info("PRE-SEND: Attempting to send verification email to {} from {} <{}>", to, verificationSenderName, fromEmail);
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, "UTF-8");
            
            helper.setFrom(fromEmail, verificationSenderName);
            helper.setTo(to);
            helper.setSubject("Smart Wallet - Verify Your Email");
            helper.setText("Welcome to Smart Wallet! Your verification code is: " + otp + 
                           "\n\nThis code will expire in 10 minutes.");
            
            mailSender.send(message);
            logger.info("POST-SEND: Verification email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("POST-SEND ERROR: Failed to send verification email for {}: {}", to, e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage());
        }
    }

    public void sendForgotPasswordEmail(String to, String otp) {
        logger.info("PRE-SEND: Attempting to send reset email to {} from {} <{}>", to, resetSenderName, fromEmail);
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, "UTF-8");
            
            helper.setFrom(fromEmail, resetSenderName);
            helper.setTo(to);
            helper.setSubject("Smart Wallet - Password Reset Request");
            helper.setText("You requested a password reset. Your OTP is: " + otp + 
                           "\n\nIf you didn't request this, please ignore this email.");
            
            mailSender.send(message);
            logger.info("POST-SEND: Password reset email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("POST-SEND ERROR: Failed to send reset email: {}", e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage());
        }
    }
}
