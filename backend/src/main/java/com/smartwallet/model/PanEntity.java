package com.smartwallet.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "pan_details",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "pan_number")
        }
)
public class PanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pan_name", nullable = false, length = 100)
    private String panName;

    @Column(name = "pan_number", nullable = false, length = 10)
    private String panNumber;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Column(name = "status", nullable = false)
    private String status; // SUBMITTED, VERIFIED, FAILED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 🔹 Automatically set createdAt before insert
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 🔹 Getters & Setters

    public Long getId() {
        return id;
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
}
