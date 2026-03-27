package com.smartwallet.dto;

import java.math.BigDecimal;

public class TransferRequestDto {
    private String senderUserId;
    private String receiverUserId;
    private BigDecimal amount;
    private String description;

    public TransferRequestDto() {}

    public String getSenderUserId() { return senderUserId; }
    public void setSenderUserId(String senderUserId) { this.senderUserId = senderUserId; }

    public String getReceiverUserId() { return receiverUserId; }
    public void setReceiverUserId(String receiverUserId) { this.receiverUserId = receiverUserId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
