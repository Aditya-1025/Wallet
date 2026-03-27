package com.smartwallet.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PanResponseDto {
    private Long id;
    private String panName;
    private String panNumber;
    private LocalDate dob;
    private String status;
    private LocalDateTime createdAt;

    public PanResponseDto(Long id, String panName, String panNumber, LocalDate dob, String status, LocalDateTime createdAt) {
        this.id = id;
        this.panName = panName;
        this.panNumber = panNumber;
        this.dob = dob;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPanName() {
        return panName;
    }

    public void setPanName(String panName) {
        this.panName = panName;
    }

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
