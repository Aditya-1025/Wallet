package com.smartwallet.dto;

public class PanStatusUpdateDto {
    private String status; // VERIFIED, REJECTED
    private String remarks;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
