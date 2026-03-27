package com.smartwallet.service;

import com.smartwallet.repository.PanRepository;
import com.smartwallet.model.PanEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class PanService {

    private final PanRepository panRepository;

    private static final Pattern PAN_PATTERN =
            Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]$");

    private static final Pattern NAME_PATTERN =
            Pattern.compile("^[A-Za-z ]{3,100}$");

    public PanService(PanRepository panRepository) {
        this.panRepository = panRepository;
    }

    /**
     * Submit PAN for verification
     */
    public PanEntity submitPan(String panName, String panNumber, LocalDate dob) {

        if (panNumber == null || !PAN_PATTERN.matcher(panNumber).matches()) {
            throw new IllegalArgumentException("Invalid PAN format. Must be: 5 uppercase letters, 4 digits, 1 uppercase letter");
        }

        if (panName == null || !NAME_PATTERN.matcher(panName).matches()) {
            throw new IllegalArgumentException("Invalid name on PAN. Must be 3-100 characters with letters and spaces only");
        }

        if (dob == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }

        int age = Period.between(dob, LocalDate.now()).getYears();
        if (age < 18) {
            throw new IllegalArgumentException("User must be at least 18 years old");
        }

        if (panRepository.existsByPanNumber(panNumber)) {
            throw new IllegalArgumentException("PAN number already exists in the system");
        }

        PanEntity pan = new PanEntity();
        pan.setPanName(panName);
        pan.setPanNumber(panNumber);
        pan.setDob(dob);
        pan.setStatus("SUBMITTED");

        return panRepository.save(pan);
    }

    /**
     * Get PAN details by ID
     */
    public Optional<PanEntity> getPanById(Long id) {
        return panRepository.findById(id);
    }

    /**
     * Get PAN details by PAN number
     */
    public Optional<PanEntity> getPanByPanNumber(String panNumber) {
        return panRepository.findByPanNumber(panNumber);
    }

    /**
     * Get all PAN submissions
     */
    public List<PanEntity> getAllPans() {
        return panRepository.findAll();
    }

    /**
     * Get all PANs with specific status
     */
    public List<PanEntity> getPansByStatus(String status) {
        return panRepository.findByStatus(status);
    }

    /**
     * Verify PAN (approve)
     */
    public PanEntity verifyPan(Long panId) {
        PanEntity pan = panRepository.findById(panId)
                .orElseThrow(() -> new IllegalArgumentException("PAN not found with ID: " + panId));

        if (!pan.getStatus().equals("SUBMITTED")) {
            throw new IllegalArgumentException("Only SUBMITTED PAN can be verified. Current status: " + pan.getStatus());
        }

        pan.setStatus("VERIFIED");
        return panRepository.save(pan);
    }

    /**
     * Reject PAN (with reason)
     */
    public PanEntity rejectPan(Long panId, String reason) {
        PanEntity pan = panRepository.findById(panId)
                .orElseThrow(() -> new IllegalArgumentException("PAN not found with ID: " + panId));

        if (!pan.getStatus().equals("SUBMITTED")) {
            throw new IllegalArgumentException("Only SUBMITTED PAN can be rejected. Current status: " + pan.getStatus());
        }

        pan.setStatus("REJECTED");
        return panRepository.save(pan);
    }

    /**
     * Update PAN status
     */
    public PanEntity updatePanStatus(Long panId, String newStatus) {
        PanEntity pan = panRepository.findById(panId)
                .orElseThrow(() -> new IllegalArgumentException("PAN not found with ID: " + panId));

        // Validate status
        if (!newStatus.matches("^(SUBMITTED|VERIFIED|REJECTED)$")) {
            throw new IllegalArgumentException("Invalid status. Must be: SUBMITTED, VERIFIED, or REJECTED");
        }

        pan.setStatus(newStatus);
        return panRepository.save(pan);
    }
}
