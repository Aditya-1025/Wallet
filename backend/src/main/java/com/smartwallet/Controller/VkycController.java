package com.smartwallet.Controller;

import com.smartwallet.dto.ErrorResponse;
import com.smartwallet.dto.VkycResponseDto;
import com.smartwallet.dto.VkycAdminReviewDto;
import com.smartwallet.enums.VkycStatus;
import com.smartwallet.model.Vkyc;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.service.VkycService;
import com.smartwallet.model.User;
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/vkyc")
public class VkycController {

    private final VkycService vkycService;
    private final UserRepository userRepository;

    public VkycController(VkycService vkycService, UserRepository userRepository) {
        this.vkycService = vkycService;
        this.userRepository = userRepository;
    }

    // 1️⃣ Start VKYC - Generate OTP
    @PostMapping("/start/{userId}")
    public ResponseEntity<?> startVkyc(@PathVariable String userId) {
        try {
            Vkyc vkyc = vkycService.startVkyc(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("vkycId", vkyc.getId());
            response.put("userId", vkyc.getUserId());
            response.put("otp", vkyc.getOtp());
            response.put("otpExpireAt", vkyc.getOtpExpireAt());
            response.put("status", vkyc.getStatus());
            response.put("message", "VKYC started successfully. Speak the OTP: " + vkyc.getOtp());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "VKYC Error"));
        }
    }

    // 2️⃣ Verify OTP
    @PostMapping("/{vkycId}/verify-otp")
    public ResponseEntity<?> verifyOTP(
            @PathVariable String vkycId,
            @RequestParam String otp
    ) {
        try {
            Vkyc vkyc = vkycService.verifyOTP(vkycId, otp);
            Map<String, Object> response = new HashMap<>();
            response.put("vkycId", vkyc.getId());
            response.put("otpVerified", vkyc.isOtpVerified());
            response.put("message", "OTP verified successfully. You can now record and submit video.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "OTP Verification Error"));
        }
    }

    // 3️⃣ Submit Video with Base64 Encoded Data
    @PostMapping("/{vkycId}/submit")
    public ResponseEntity<?> submitVideo(
            @PathVariable String vkycId,
            @RequestBody Map<String, Object> request
    ) {
        try {
            String videoData = (String) request.get("videoData");
            String fileName = (String) request.get("fileName");
            Long fileSize = ((Number) request.get("fileSize")).longValue();

            if (videoData == null || videoData.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse(400, "videoData is required", "Validation Error"));
            }

            Vkyc vkyc = vkycService.submitVideo(vkycId, videoData, fileName, fileSize);
            return ResponseEntity.ok(convertToResponseDto(vkyc));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "Video Submission Error"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, e.getMessage(), "Server Error"));
        }
    }

    // 4️⃣ Upload Video File (MultipartFile)
    @PostMapping("/{userId}/upload-file")
    public ResponseEntity<?> uploadVideoFile(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            Vkyc vkyc = vkycService.uploadVideo(userId, file);
            return ResponseEntity.ok(convertToResponseDto(vkyc));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "File Upload Error"));
        }
    }

    // 5️⃣ Get VKYC Status by User ID
    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getVkycByUserId(@PathVariable String userId) {
        try {
            // 1. Try by provided ID
            Vkyc vkyc = null;
            try {
                vkyc = vkycService.getByUserId(userId);
            } catch (Exception e) {
                // 2. If not found, try to resolve user and check by email
                // Try by secondary user_id first (common in frontend)
                User user = userRepository.findByUserId(userId).orElse(null);
                
                // Fallback to primary key lookup
                if (user == null) {
                    try {
                        user = userRepository.findById(UUID.fromString(userId)).orElse(null);
                    } catch (Exception ignored) {}
                }

                if (user != null) {
                    try {
                        vkyc = vkycService.getByUserId(user.getEmail());
                    } catch (Exception ignored) {}
                }
            }

            if (vkyc != null) {
                return ResponseEntity.ok(convertToResponseDto(vkyc));
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "VKYC record not found for user: " + userId, "Not Found"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, e.getMessage(), "Not Found"));
        }
    }

    // 6️⃣ Get VKYC by ID
    @GetMapping("/{vkycId}")
    public ResponseEntity<?> getVkycById(@PathVariable String vkycId) {
        try {
            Vkyc vkyc = vkycService.getById(vkycId);
            return ResponseEntity.ok(convertToResponseDto(vkyc));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, e.getMessage(), "Not Found"));
        }
    }

    // 🎬 Stream Video File for Admin Review (from GridFS)
    @GetMapping("/video/{vkycId}")
    public ResponseEntity<GridFsResource> streamVideo(@PathVariable String vkycId) {
        try {
            Vkyc vkyc = vkycService.getById(vkycId);
            if (vkyc.getGridFsId() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            GridFsResource resource = vkycService.getVideoResource(vkyc.getGridFsId());
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + vkyc.getVideoFileName() + "\"")
                    .contentType(MediaType.parseMediaType(vkyc.getMimeType() != null ? vkyc.getMimeType() : "video/webm"))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============ ADMIN ENDPOINTS ============

    // 📊 Admin Stats
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getStats() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        Map<String, Long> stats = new HashMap<>();
        stats.put("pending", vkycService.countByStatus(VkycStatus.UNDER_REVIEW));
        stats.put("total", vkycService.countAll());
        stats.put("approvedToday", vkycService.countByStatusAndDate(VkycStatus.APPROVED, startOfDay, endOfDay));
        stats.put("rejectedToday", vkycService.countByStatusAndDate(VkycStatus.REJECTED, startOfDay, endOfDay));
        return ResponseEntity.ok(stats);
    }

    // 7️⃣ Get All Pending VKYCs for Review
    @GetMapping("/admin/pending")
    public ResponseEntity<?> getPendingReview() {
        try {
            List<Vkyc> pendingVkys = vkycService.getPendingReview();
            List<VkycResponseDto> response = pendingVkys.stream()
                    .map(this::convertToResponseDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, e.getMessage(), "Server Error"));
        }
    }

    // 8️⃣ Admin Approve VKYC
    @PutMapping("/{vkycId}/approve")
    public ResponseEntity<?> approveVkyc(
            @PathVariable String vkycId,
            @Valid @RequestBody VkycAdminReviewDto reviewDto
    ) {
        try {
            Vkyc vkyc = vkycService.approve(vkycId, reviewDto.getAdminId());
            Map<String, Object> response = new HashMap<>();
            response.put("vkycId", vkyc.getId());
            response.put("status", vkyc.getStatus());
            response.put("approvedBy", vkyc.getReviewedBy());
            response.put("approvedAt", vkyc.getReviewedAt());
            response.put("message", "VKYC approved successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "Approval Error"));
        }
    }

    // 9️⃣ Admin Reject VKYC
    @PutMapping("/{vkycId}/reject")
    public ResponseEntity<?> rejectVkyc(
            @PathVariable String vkycId,
            @Valid @RequestBody VkycAdminReviewDto reviewDto
    ) {
        try {
            Vkyc vkyc = vkycService.reject(vkycId, reviewDto.getAdminId(), reviewDto.getRejectionReason());
            Map<String, Object> response = new HashMap<>();
            response.put("vkycId", vkyc.getId());
            response.put("status", vkyc.getStatus());
            response.put("rejectedBy", vkyc.getReviewedBy());
            response.put("rejectedAt", vkyc.getReviewedAt());
            response.put("rejectionReason", vkyc.getRejectionReason());
            response.put("message", "VKYC rejected");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage(), "Rejection Error"));
        }
    }

    // ============ UTILITY METHODS ============

    // Convert Vkyc to VkycResponseDto
    private VkycResponseDto convertToResponseDto(Vkyc vkyc) {
        return new VkycResponseDto(
                vkyc.getId(),
                vkyc.getUserId(),
                vkyc.getVideoFileName(),
                vkyc.getFileSize(),
                vkyc.getOtp(),
                vkyc.isOtpVerified(),
                vkyc.getOtpExpireAt(),
                vkyc.getStatus(),
                vkyc.getCreatedAt(),
                vkyc.getReviewedAt(),
                vkyc.getReviewedBy(),
                vkyc.getRejectionReason()
        );
    }

    // ============ EXCEPTION HANDLERS ============

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, e.getMessage(), "Validation Error"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "An unexpected error occurred: " + e.getMessage(), "Server Error"));
    }
}