package com.smartwallet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VkycSubmitDto {

    @NotBlank(message = "VKYC ID is required")
    private String vkycId;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Video data (base64 encoded) is required")
    private String videoData;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotNull(message = "File size is required")
    private Long fileSize;

    public VkycSubmitDto() {}

    public String getVkycId() {
        return vkycId;
    }

    public void setVkycId(String vkycId) {
        this.vkycId = vkycId;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getVideoData() {
        return videoData;
    }

    public void setVideoData(String videoData) {
        this.videoData = videoData;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
}
