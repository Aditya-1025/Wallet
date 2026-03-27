package com.smartwallet.dto;

import jakarta.validation.constraints.NotBlank;

public class VkycAdminReviewDto {

    @NotBlank(message = "Admin ID is required")
    private String adminId;

    private String rejectionReason;

    public VkycAdminReviewDto() {}

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
