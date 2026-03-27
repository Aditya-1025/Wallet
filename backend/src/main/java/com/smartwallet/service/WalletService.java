package com.smartwallet.service;

import java.util.Optional;
import com.smartwallet.dto.WalletResponseDto;
import com.smartwallet.model.Wallet;
import com.smartwallet.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    /**
     * Get or provision a new wallet for the user.
     * Guaranteed to return a Wallet instance.
     */
    @Transactional
    public Wallet getOrCreateWallet(String userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet();
                    newWallet.setUserId(userId);
                    return walletRepository.save(newWallet);
                });
    }

    /**
     * Retreive safe WalletResponseDto representation
     */
    @Transactional
    public WalletResponseDto getWalletDtoInfo(String userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return convertToDto(wallet);
    }

    /**
     * Non-creative lookup for checking existence
     */
    @Transactional(readOnly = true)
    public Optional<WalletResponseDto> findWallet(String userId) {
        return walletRepository.findByUserId(userId)
                .map(this::convertToDto);
    }

    private WalletResponseDto convertToDto(Wallet wallet) {
        WalletResponseDto dto = new WalletResponseDto();
        dto.setId(wallet.getId());
        dto.setUserId(wallet.getUserId());
        dto.setBalance(wallet.getBalance());
        dto.setTotalReceived(wallet.getTotalReceived());
        dto.setTotalSent(wallet.getTotalSent());
        dto.setTotalDeposit(wallet.getTotalDeposit());
        dto.setTotalWithdrawal(wallet.getTotalWithdrawal());
        dto.setTransactionCount(wallet.getTransactionCount());
        dto.setIsActive(wallet.getIsActive());
        dto.setCreatedAt(wallet.getCreatedAt());
        dto.setUpdatedAt(wallet.getUpdatedAt());
        return dto;
    }
}
