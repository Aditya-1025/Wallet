package com.smartwallet.service;

import com.smartwallet.model.User;
import com.smartwallet.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    public AuthService(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(String name, String email, String password, String mobileNumber) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists with this email");
        }

        if (userRepository.existsByMobileNumber(mobileNumber)) {
            throw new RuntimeException("Mobile number already in use");
        }

        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User(name, email, hashedPassword, mobileNumber);

        // Generate Registration OTP
        String otp = generateOtp();
        user.setVerificationOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

        // Save to DB
        User savedUser = userRepository.save(user);

        // Send Email
        try {
            emailService.sendVerificationEmail(email, otp);
        } catch (Exception e) {
            logger.error("Failed to send verification email: {}", e.getMessage());
        }

        return savedUser;
    }

    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Wrong credentials"));

        // Verify hashed password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Wrong credentials");
        }

        /* Temporarily disabled verification check for development bypass
        if (!user.isEmailVerified()) {
            throw new RuntimeException("Please verify your email first");
        }
        */

        return user;
    }

    @Transactional
    public void verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setEmailVerified(true);
        user.setVerificationOtp(null);
        userRepository.save(user);
    }

    @Transactional
    public void initiateForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOtp();
        user.setForgotPasswordOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send Email
        try {
            emailService.sendForgotPasswordEmail(email, otp);
        } catch (Exception e) {
            logger.error("CRITICAL: Failed to send forgot password email: {}", e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getForgotPasswordOtp() == null || !user.getForgotPasswordOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        // Hash the new password before resetting
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setForgotPasswordOtp(null);
        userRepository.save(user);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public User getProfile(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
