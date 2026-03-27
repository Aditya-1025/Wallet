package com.smartwallet.Controller;

import com.smartwallet.dto.BankAccountDto;
import com.smartwallet.dto.ErrorResponse;
import com.smartwallet.model.BankEntity;
import com.smartwallet.repository.BankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bank")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BankController {

    @Autowired
    private BankRepository bankRepository;

    @PostMapping("/link/{userId}")
    public ResponseEntity<?> linkBank(@PathVariable String userId, @RequestBody BankAccountDto request) {
        try {
            if (request.getAccountNumber() == null || request.getIfscCode() == null) {
                throw new IllegalArgumentException("Account number and IFSC are required");
            }
            
            BankEntity bank = new BankEntity();
            bank.setUserId(userId);
            bank.setAccountNumber(request.getAccountNumber());
            bank.setIfscCode(request.getIfscCode());
            bank.setBankName(request.getBankName() != null ? request.getBankName() : "Mock Bank");
            
            BankEntity saved = bankRepository.save(bank);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "Validation Error"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, e.getMessage(), "Server Error"));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserBanks(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(bankRepository.findByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, e.getMessage(), "Lookup Error"));
        }
    }
}
