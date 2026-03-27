package com.smartwallet.model;

import com.smartwallet.enums.VkycStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "vkyc_records")
public class Vkyc {

    @Id
    private String id;

    private String userId;

    private String videoFileName;
    private String gridFsId;

    private Long fileSize;
    private String mimeType;

    private String otp;
    private boolean otpVerified;
    private LocalDateTime otpExpireAt;

    private VkycStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    private String reviewedBy;
    private String rejectionReason;

    public Vkyc() {
        this.createdAt = LocalDateTime.now();
        this.status = VkycStatus.NOT_STARTED;
    }

    // ===== Getters & Setters =====

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getVideoFileName() {
        return videoFileName;
    }

    public String getGridFsId() {
        return gridFsId;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public VkycStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getOtp() {
        return otp;
    }

    public boolean isOtpVerified() {
        return otpVerified;
    }

    public LocalDateTime getOtpExpireAt() {
        return otpExpireAt;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setVideoFileName(String videoFileName) {
        this.videoFileName = videoFileName;
    }

    public void setGridFsId(String gridFsId) {
        this.gridFsId = gridFsId;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public void setStatus(VkycStatus status) {
        this.status = status;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setOtpVerified(boolean otpVerified) {
        this.otpVerified = otpVerified;
    }

    public void setOtpExpireAt(LocalDateTime otpExpireAt) {
        this.otpExpireAt = otpExpireAt;
    }
}