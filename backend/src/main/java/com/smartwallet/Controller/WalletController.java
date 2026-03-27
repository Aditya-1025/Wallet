package com.smartwallet.Controller;

import java.util.Optional;
import com.smartwallet.dto.ErrorResponse;
import com.smartwallet.dto.WalletResponseDto;
import com.smartwallet.enums.VkycStatus;
import com.smartwallet.model.Vkyc;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.service.VkycService;
import com.smartwallet.service.WalletService;
import com.smartwallet.model.User;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wallet")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WalletController {

    private final WalletService walletService;
    private final VkycService vkycService;
    private final UserRepository userRepository;

    public WalletController(WalletService walletService, VkycService vkycService, UserRepository userRepository) {
        this.walletService = walletService;
        this.vkycService = vkycService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getWalletDetails(@PathVariable String userId) {
        try {
            Optional<WalletResponseDto> walletOpt = walletService.findWallet(userId);
            if (walletOpt.isPresent()) {
                return ResponseEntity.ok(walletOpt.get());
            } 
            
            // If wallet not found, check if user is VKYC approved (resilient lookup)
            try {
                // Get user's email for legacy VKYC record matching
                // Using findByUserId since the frontend provides the secondary String-based ID
                User user = userRepository.findByUserId(userId).orElse(null);
                String email = (user != null) ? user.getEmail() : null;

                if (vkycService.isUserFullyApproved(userId, email)) {
                    // Provision on-the-fly for approved users (both new and legacy)
                    return ResponseEntity.ok(walletService.getWalletDtoInfo(userId));
                }
            } catch (Exception ignored) {} 

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(404, "Wallet not found for user", "Wallet Not Provisioned"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, e.getMessage(), "Wallet Lookup Error"));
        }
    }
}
