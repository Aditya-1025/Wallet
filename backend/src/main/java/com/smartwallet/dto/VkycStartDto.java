package com.smartwallet.dto;

import jakarta.validation.constraints.NotBlank;

public class VkycStartDto {

    @NotBlank(message = "User ID is required")
    private String userId;

    public VkycStartDto() {}

    public VkycStartDto(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
