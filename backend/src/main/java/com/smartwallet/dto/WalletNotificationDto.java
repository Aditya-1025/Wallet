package com.smartwallet.dto;

import java.math.BigDecimal;

public class WalletNotificationDto {
    private String type;
    private BigDecimal amount;
    private String senderId;
    private String message;
    private BigDecimal newBalance;

    public WalletNotificationDto() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public BigDecimal getNewBalance() { return newBalance; }
    public void setNewBalance(BigDecimal newBalance) { this.newBalance = newBalance; }
}
