package com.smartwallet.Controller;

import com.smartwallet.dto.DepositWithdrawRequestDto;
import com.smartwallet.dto.ErrorResponse;
import com.smartwallet.dto.TransactionResponseDto;
import com.smartwallet.dto.TransferRequestDto;
import com.smartwallet.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transaction")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/deposit/{userId}")
    public ResponseEntity<?> deposit(@PathVariable String userId, @RequestBody DepositWithdrawRequestDto request) {
        try {
            TransactionResponseDto response = transactionService.deposit(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "Deposit Error"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, e.getMessage(), "Server Error"));
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody TransferRequestDto request) {
        try {
            TransactionResponseDto response = transactionService.transfer(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "Transfer Error"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, e.getMessage(), "Server Error"));
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable String userId) {
        try {
            List<TransactionResponseDto> history = transactionService.getHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, e.getMessage(), "History Error"));
        }
    }
}
