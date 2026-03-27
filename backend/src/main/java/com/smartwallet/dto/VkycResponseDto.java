package com.smartwallet.dto;

import com.smartwallet.enums.VkycStatus;
import java.time.LocalDateTime;

public class VkycResponseDto {

    private String id;
    private String userId;
    private String videoFileName;
    private Long fileSize;
    private String otp;
    private boolean otpVerified;
    private LocalDateTime otpExpireAt;
    private VkycStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
    private String rejectionReason;

    public VkycResponseDto() {}

    public VkycResponseDto(String id, String userId, String videoFileName, Long fileSize,
                           String otp, boolean otpVerified, LocalDateTime otpExpireAt,
                           VkycStatus status, LocalDateTime createdAt, LocalDateTime reviewedAt,
                           String reviewedBy, String rejectionReason) {
        this.id = id;
        this.userId = userId;
        this.videoFileName = videoFileName;
        this.fileSize = fileSize;
        this.otp = otp;
        this.otpVerified = otpVerified;
        this.otpExpireAt = otpExpireAt;
        this.status = status;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
        this.reviewedBy = reviewedBy;
        this.rejectionReason = rejectionReason;
    }

    public String getVideoFileName() {
        return videoFileName;
    }

    public void setVideoFileName(String videoFileName) {
        this.videoFileName = videoFileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public boolean isOtpVerified() {
        return otpVerified;
    }

    public void setOtpVerified(boolean otpVerified) {
        this.otpVerified = otpVerified;
    }

    public LocalDateTime getOtpExpireAt() {
        return otpExpireAt;
    }

    public void setOtpExpireAt(LocalDateTime otpExpireAt) {
        this.otpExpireAt = otpExpireAt;
    }

    public VkycStatus getStatus() {
        return status;
    }

    public void setStatus(VkycStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
