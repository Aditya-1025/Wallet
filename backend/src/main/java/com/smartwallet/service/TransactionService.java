package com.smartwallet.service;

import com.smartwallet.dto.DepositWithdrawRequestDto;
import com.smartwallet.dto.TransactionResponseDto;
import com.smartwallet.dto.TransferRequestDto;
import com.smartwallet.enums.TransactionStatus;
import com.smartwallet.enums.TransactionType;
import com.smartwallet.model.Transaction;
import com.smartwallet.model.Wallet;
import com.smartwallet.repository.TransactionRepository;
import com.smartwallet.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.model.User;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.smartwallet.dto.WalletNotificationDto;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public TransactionResponseDto deposit(String userId, DepositWithdrawRequestDto request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be greater than zero");
        }

        // Lock wallet for safe update
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseGet(() -> walletService.getOrCreateWallet(userId));

        // Update Wallet
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        wallet.setTotalDeposit(wallet.getTotalDeposit().add(request.getAmount()));
        wallet.setTransactionCount(wallet.getTransactionCount() + 1);
        walletRepository.save(wallet);

        // Record Transaction
        Transaction tx = new Transaction();
        tx.setUserId(userId);
        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.DEPOSIT);
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setDescription(request.getDescription() != null ? request.getDescription() : "Wallet Deposit via Linked Bank");
        tx.setReferenceId("DEP-" + System.currentTimeMillis());
        transactionRepository.save(tx);

        return convertToDto(tx);
    }

    @Transactional
    public TransactionResponseDto transfer(TransferRequestDto request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer amount must be greater than zero");
        }

        String actualReceiverId = request.getReceiverUserId();
        // Support for number@wallet or 10-digit mobile number
        if (actualReceiverId != null) {
            String mobilePart = null;
            if (actualReceiverId.matches("^\\d{10}$")) {
                mobilePart = actualReceiverId;
            } else if (actualReceiverId.matches("^(\\d{10})@wallet$")) {
                mobilePart = actualReceiverId.split("@")[0];
            }

            if (mobilePart != null) {
                User receiverUser = userRepository.findByMobileNumber(mobilePart)
                        .orElseThrow(() -> new IllegalArgumentException("User with this mobile number or VPA not found"));
                actualReceiverId = receiverUser.getUserId();
            }
        }

        if (request.getSenderUserId().equals(actualReceiverId)) {
            throw new IllegalArgumentException("Cannot transfer money to yourself");
        }

        // Lock Sender Wallet
        Wallet senderWallet = walletRepository.findByUserIdWithLock(request.getSenderUserId())
                .orElseThrow(() -> new IllegalArgumentException("Sender wallet not found"));

        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new IllegalArgumentException("Insufficient funds");
        }

        // Lock Receiver Wallet (Auto-create if it doesn't exist yet to prevent dropped funds)
        final String finalReceiverId = actualReceiverId;
        Wallet receiverWallet = walletRepository.findByUserIdWithLock(finalReceiverId)
                .orElseGet(() -> walletService.getOrCreateWallet(finalReceiverId));

        // Deduct from Sender
        senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
        senderWallet.setTotalSent(senderWallet.getTotalSent().add(request.getAmount()));
        senderWallet.setTransactionCount(senderWallet.getTransactionCount() + 1);
        walletRepository.save(senderWallet);

        // Add to Receiver
        receiverWallet.setBalance(receiverWallet.getBalance().add(request.getAmount()));
        receiverWallet.setTotalReceived(receiverWallet.getTotalReceived().add(request.getAmount()));
        receiverWallet.setTransactionCount(receiverWallet.getTransactionCount() + 1);
        walletRepository.save(receiverWallet);

        // Record Sender Transaction (Negative perspective)
        Transaction senderTx = new Transaction();
        senderTx.setUserId(request.getSenderUserId());
        senderTx.setReceiverUserId(actualReceiverId);
        senderTx.setAmount(request.getAmount());
        senderTx.setType(TransactionType.TRANSFER);
        senderTx.setStatus(TransactionStatus.SUCCESS);
        senderTx.setDescription(request.getDescription() != null ? request.getDescription() : "Money Transfer");
        senderTx.setReferenceId("TRF-" + System.currentTimeMillis());
        transactionRepository.save(senderTx);

        // Record Receiver Transaction (Positive perspective)
        Transaction receiverTx = new Transaction();
        receiverTx.setUserId(actualReceiverId);
        receiverTx.setReceiverUserId(request.getSenderUserId()); // Sender becomes the counterparty
        receiverTx.setAmount(request.getAmount());
        receiverTx.setType(TransactionType.TRANSFER);
        receiverTx.setStatus(TransactionStatus.SUCCESS);
        receiverTx.setDescription("Received from " + request.getSenderUserId());
        receiverTx.setReferenceId(senderTx.getReferenceId());
        transactionRepository.save(receiverTx);

        // Emit STOMP WebSocket notification to receiverUserId
        try {
            WalletNotificationDto notification = new WalletNotificationDto();
            notification.setType("TRANSFER_RECEIVED");
            notification.setSenderId(request.getSenderUserId());
            notification.setAmount(request.getAmount());
            notification.setMessage("You received ₹" + request.getAmount() + " from " + request.getSenderUserId());
            notification.setNewBalance(receiverWallet.getBalance());

            messagingTemplate.convertAndSend("/topic/wallet/" + actualReceiverId, notification);
        } catch (Exception e) {
            // Log error, but do not fail the transaction if push notification fails!
            System.err.println("Failed to send STOMP WebSocket Notification: " + e.getMessage());
        }

        return convertToDto(senderTx);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getHistory(String userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private TransactionResponseDto convertToDto(Transaction transaction) {
        TransactionResponseDto dto = new TransactionResponseDto();
        dto.setId(transaction.getId());
        dto.setUserId(transaction.getUserId());
        dto.setReceiverUserId(transaction.getReceiverUserId());
        dto.setAmount(transaction.getAmount());
        dto.setType(transaction.getType());
        dto.setStatus(transaction.getStatus());
        dto.setDescription(transaction.getDescription());
        dto.setReferenceId(transaction.getReferenceId());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setCompletedAt(transaction.getCompletedAt());
        return dto;
    }
}
