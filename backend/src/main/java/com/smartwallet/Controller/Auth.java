package com.smartwallet.Controller;

import com.smartwallet.dto.LoginDto;
import com.smartwallet.dto.RegisterDto;
import com.smartwallet.model.User;
import com.smartwallet.service.AuthService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class Auth {

    private final AuthService authService;

    public Auth(AuthService authService){
        this.authService=authService;
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterDto request) {
        return authService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getMobileNumber()
        );
    }
    @PostMapping("/login")
    public User login(@RequestBody LoginDto request){
        return authService.login(
                request.getEmail(),
                request.getPassword()
        );
    }

    @PostMapping("/verify-email")
    public void verifyEmail(@RequestParam String email, @RequestParam String otp) {
        authService.verifyEmail(email, otp);
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestParam String email) {
        authService.initiateForgotPassword(email);
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestParam String email, @RequestParam String otp, @RequestParam String newPassword) {
        authService.resetPassword(email, otp, newPassword);
    }

    @GetMapping("/me/{userId}")
    public User getProfile(@PathVariable String userId) {
        return authService.getProfile(userId);
    }
}
