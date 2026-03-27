package com.smartwallet.Controller;

import com.smartwallet.dto.PanDto;
import com.smartwallet.dto.PanResponseDto;
import com.smartwallet.dto.PanStatusUpdateDto;
import com.smartwallet.dto.ErrorResponse;
import com.smartwallet.model.PanEntity;
import com.smartwallet.service.PanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/pan-screen")
public class PanController {

    private final PanService panService;

    public PanController(PanService panService) {
        this.panService = panService;
    }

    /**
     * Submit PAN for verification
     * POST /api/v1/pan-screen/details
     */
    @PostMapping("/details")
    public ResponseEntity<?> submitPan(@Valid @RequestBody PanDto request) {
        try {
            PanEntity pan = panService.submitPan(
                    request.getPanName(),
                    request.getPanNumber(),
                    request.getDob()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new PanResponseDto(
                            pan.getId(),
                            pan.getPanName(),
                            pan.getPanNumber(),
                            pan.getDob(),
                            pan.getStatus(),
                            pan.getCreatedAt()
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ErrorResponse(400, e.getMessage(), "Validation Error")
            );
        }
    }

    /**
     * Get PAN details by ID
     * GET /api/v1/pan-screen/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPanById(@PathVariable Long id) {
        try {
            PanEntity pan = panService.getPanById(id)
                    .orElseThrow(() -> new IllegalArgumentException("PAN not found with ID: " + id));
            return ResponseEntity.ok(
                    new PanResponseDto(
                            pan.getId(),
                            pan.getPanName(),
                            pan.getPanNumber(),
                            pan.getDob(),
                            pan.getStatus(),
                            pan.getCreatedAt()
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse(404, e.getMessage(), "Not Found")
            );
        }
    }

    /**
     * Get PAN by PAN Number
     * GET /api/v1/pan-screen/number/{panNumber}
     */
    @GetMapping("/number/{panNumber}")
    public ResponseEntity<?> getPanByNumber(@PathVariable String panNumber) {
        try {
            PanEntity pan = panService.getPanByPanNumber(panNumber)
                    .orElseThrow(() -> new IllegalArgumentException("PAN not found with number: " + panNumber));
            return ResponseEntity.ok(
                    new PanResponseDto(
                            pan.getId(),
                            pan.getPanName(),
                            pan.getPanNumber(),
                            pan.getDob(),
                            pan.getStatus(),
                            pan.getCreatedAt()
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse(404, e.getMessage(), "Not Found")
            );
        }
    }

    /**
     * Get all PAN submissions
     * GET /api/v1/pan-screen/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<PanResponseDto>> getAllPans() {
        List<PanEntity> pans = panService.getAllPans();
        List<PanResponseDto> responses = pans.stream()
                .map(pan -> new PanResponseDto(
                        pan.getId(),
                        pan.getPanName(),
                        pan.getPanNumber(),
                        pan.getDob(),
                        pan.getStatus(),
                        pan.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * Get PANs by status (SUBMITTED, VERIFIED, REJECTED)
     * GET /api/v1/pan-screen/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getPansByStatus(@PathVariable String status) {
        try {
            if (!status.matches("^(SUBMITTED|VERIFIED|REJECTED)$")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        new ErrorResponse(400, "Invalid status. Must be: SUBMITTED, VERIFIED, or REJECTED", "Validation Error")
                );
            }
            List<PanEntity> pans = panService.getPansByStatus(status);
            List<PanResponseDto> responses = pans.stream()
                    .map(pan -> new PanResponseDto(
                            pan.getId(),
                            pan.getPanName(),
                            pan.getPanNumber(),
                            pan.getDob(),
                            pan.getStatus(),
                            pan.getCreatedAt()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse(500, e.getMessage(), "Internal Server Error")
            );
        }
    }

    /**
     * Verify/Approve PAN
     * PUT /api/v1/pan-screen/{id}/verify
     */
    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyPan(@PathVariable Long id) {
        try {
            PanEntity pan = panService.verifyPan(id);
            return ResponseEntity.ok(
                    new PanResponseDto(
                            pan.getId(),
                            pan.getPanName(),
                            pan.getPanNumber(),
                            pan.getDob(),
                            pan.getStatus(),
                            pan.getCreatedAt()
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ErrorResponse(400, e.getMessage(), "Bad Request")
            );
        }
    }

    /**
     * Reject PAN
     * PUT /api/v1/pan-screen/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectPan(@PathVariable Long id, @RequestParam(required = false) String reason) {
        try {
            PanEntity pan = panService.rejectPan(id, reason != null ? reason : "");
            return ResponseEntity.ok(
                    new PanResponseDto(
                            pan.getId(),
                            pan.getPanName(),
                            pan.getPanNumber(),
                            pan.getDob(),
                            pan.getStatus(),
                            pan.getCreatedAt()
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ErrorResponse(400, e.getMessage(), "Bad Request")
            );
        }
    }

    /**
     * Update PAN Status
     * PUT /api/v1/pan-screen/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePanStatus(@PathVariable Long id, @Valid @RequestBody PanStatusUpdateDto request) {
        try {
            PanEntity pan = panService.updatePanStatus(id, request.getStatus());
            return ResponseEntity.ok(
                    new PanResponseDto(
                            pan.getId(),
                            pan.getPanName(),
                            pan.getPanNumber(),
                            pan.getDob(),
                            pan.getStatus(),
                            pan.getCreatedAt()
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ErrorResponse(400, e.getMessage(), "Bad Request")
            );
        }
    }

    /**
     * Global exception handler for validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ErrorResponse(400, message, "Validation Error")
        );
    }

    /**
     * Global exception handler for generic exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse(500, e.getMessage(), "Internal Server Error")
        );
    }
}
