package com.smartwallet.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletResponseDto {
    private Long id;
    private String userId;
    private BigDecimal balance;
    private BigDecimal totalReceived;
    private BigDecimal totalSent;
    private BigDecimal totalDeposit;
    private BigDecimal totalWithdrawal;
    private Integer transactionCount;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WalletResponseDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public BigDecimal getTotalReceived() { return totalReceived; }
    public void setTotalReceived(BigDecimal totalReceived) { this.totalReceived = totalReceived; }

    public BigDecimal getTotalSent() { return totalSent; }
    public void setTotalSent(BigDecimal totalSent) { this.totalSent = totalSent; }

    public BigDecimal getTotalDeposit() { return totalDeposit; }
    public void setTotalDeposit(BigDecimal totalDeposit) { this.totalDeposit = totalDeposit; }

    public BigDecimal getTotalWithdrawal() { return totalWithdrawal; }
    public void setTotalWithdrawal(BigDecimal totalWithdrawal) { this.totalWithdrawal = totalWithdrawal; }

    public Integer getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Integer transactionCount) { this.transactionCount = transactionCount; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
