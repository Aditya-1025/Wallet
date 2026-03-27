package com.smartwallet.service;

import com.smartwallet.enums.VkycStatus;
import com.smartwallet.model.Vkyc;
import com.smartwallet.repository.VkycRepository;

import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.Base64;

@Service
public class VkycService {

    private final VkycRepository vkycRepository;
    private final WalletService walletService;
    private final GridFsTemplate gridFsTemplate;

    public VkycService(VkycRepository vkycRepository, WalletService walletService, GridFsTemplate gridFsTemplate) {
        this.vkycRepository = vkycRepository;
        this.walletService = walletService;
        this.gridFsTemplate = gridFsTemplate;
    }

    // 1️⃣ Start VKYC - Generate OTP
    public Vkyc startVkyc(String userId) {
        // Check if user already has an active VKYC
        vkycRepository.findByUserId(userId).ifPresent(existing -> {
            if (!existing.getStatus().equals(VkycStatus.REJECTED)) {
                throw new RuntimeException("VKYC already in progress for this user");
            }
        });

        Vkyc vkyc = new Vkyc();
        vkyc.setUserId(userId);
        vkyc.setStatus(VkycStatus.VIDEO_PENDING);
        
        // Generate 6-digit OTP
        String otp = generateOTP();
        vkyc.setOtp(otp);
        vkyc.setOtpVerified(false);
        vkyc.setOtpExpireAt(LocalDateTime.now().plusMinutes(10)); // OTP valid for 10 minutes

        return vkycRepository.save(vkyc);
    }

    // Generate 6-digit random OTP
    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // 2️⃣ Verify OTP
    public Vkyc verifyOTP(String vkycId, String otp) {
        Vkyc vkyc = vkycRepository.findById(vkycId)
                .orElseThrow(() -> new IllegalArgumentException("VKYC not found"));

        // Check OTP expiration
        if (LocalDateTime.now().isAfter(vkyc.getOtpExpireAt())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        // Verify OTP
        if (!vkyc.getOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        vkyc.setOtpVerified(true);
        return vkycRepository.save(vkyc);
    }

    // 3️⃣ Submit Video with Video Data (Base64 Encoded)
    public Vkyc submitVideo(String vkycId, String videoData, String fileName, Long fileSize) {
        Vkyc vkyc = vkycRepository.findById(vkycId)
                .orElseThrow(() -> new IllegalArgumentException("VKYC not found"));

        if (!vkyc.isOtpVerified()) {
            throw new IllegalArgumentException("OTP not verified yet");
        }

        if (videoData == null || videoData.isEmpty()) {
            throw new IllegalArgumentException("Video data is required");
        }

        // Validate file size (limit to 50MB)
        if (fileSize > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("Video size exceeds 50MB limit");
        }

        // Generate unique file name
        String uniqueFileName = UUID.randomUUID() + "_" + fileName;

        // Save video to GridFS
        try {
            byte[] videoBytes = Base64.getDecoder().decode(videoData);
            InputStream inputStream = new ByteArrayInputStream(videoBytes);
            
            // Store in GridFS
            Object gridFsId = gridFsTemplate.store(inputStream, uniqueFileName, "video/webm");
            
            vkyc.setVideoFileName(uniqueFileName);
            vkyc.setGridFsId(gridFsId.toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to save video to database: " + e.getMessage());
        }

        vkyc.setFileSize(fileSize);
        vkyc.setMimeType("video/webm"); // Default for browser recording
        vkyc.setStatus(VkycStatus.UNDER_REVIEW);

        return vkycRepository.save(vkyc);
    }

    // 4️⃣ Upload Video File (Alternative method using MultipartFile)
    public Vkyc uploadVideo(String userId, MultipartFile file) {

        Vkyc vkyc = vkycRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("VKYC not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Limit file size to 50MB
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 50MB limit");
        }

        // Validate file type
        if (file.getContentType() == null ||
                !file.getContentType().startsWith("video")) {
            throw new RuntimeException("Only video files are allowed");
        }

        // Generate unique file name
        String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        try {
            // Store in GridFS
            Object gridFsId = gridFsTemplate.store(file.getInputStream(), uniqueFileName, file.getContentType());
            vkyc.setGridFsId(gridFsId.toString());
        } catch (IOException e) {
            throw new RuntimeException("Failed to save video to database");
        }

        // Update MongoDB record
        vkyc.setVideoFileName(uniqueFileName);
        vkyc.setFileSize(file.getSize());
        vkyc.setMimeType(file.getContentType());
        vkyc.setStatus(VkycStatus.UNDER_REVIEW);

        return vkycRepository.save(vkyc);
    }

    // 📥 Get Video Resource from GridFS
    public GridFsResource getVideoResource(String gridFsId) {
        GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(gridFsId)));
        if (file == null) {
            throw new RuntimeException("Video not found in database");
        }
        return gridFsTemplate.getResource(file);
    }

    // 5️⃣ Get VKYC by userId
    public Vkyc getByUserId(String userId) {
        return vkycRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("VKYC not found for user: " + userId));
    }

    // 6️⃣ Get VKYC by ID
    public Vkyc getById(String vkycId) {
        return vkycRepository.findById(vkycId)
                .orElseThrow(() -> new IllegalArgumentException("VKYC not found"));
    }

    // 7️⃣ Get all pending VKYCs for admin (UNDER_REVIEW status)
    public List<Vkyc> getPendingReview() {
        return vkycRepository.findByStatus(VkycStatus.UNDER_REVIEW);
    }

    // 8️⃣ Admin Approve VKYC
    public Vkyc approve(String vkycId, String adminId) {
        Vkyc vkyc = vkycRepository.findById(vkycId)
                .orElseThrow(() -> new IllegalArgumentException("VKYC not found"));

        if (!vkyc.getStatus().equals(VkycStatus.UNDER_REVIEW)) {
            throw new IllegalArgumentException("Only UNDER_REVIEW VKYCs can be approved");
        }

        vkyc.setStatus(VkycStatus.APPROVED);
        vkyc.setReviewedAt(LocalDateTime.now());
        vkyc.setReviewedBy(adminId);

        Vkyc savedVkyc = vkycRepository.save(vkyc);
        
        // Provision wallet upon successful VKYC approval
        walletService.getOrCreateWallet(vkyc.getUserId());
        
        return savedVkyc;
    }

    // 9️⃣ Admin Reject VKYC
    public Vkyc reject(String vkycId, String adminId, String reason) {
        Vkyc vkyc = vkycRepository.findById(vkycId)
                .orElseThrow(() -> new IllegalArgumentException("VKYC not found"));

        if (!vkyc.getStatus().equals(VkycStatus.UNDER_REVIEW)) {
            throw new IllegalArgumentException("Only UNDER_REVIEW VKYCs can be rejected");
        }

        vkyc.setStatus(VkycStatus.REJECTED);
        vkyc.setRejectionReason(reason);
        vkyc.setReviewedAt(LocalDateTime.now());
        vkyc.setReviewedBy(adminId);

        return vkycRepository.save(vkyc);
    }

    // 🔟 Move To Review (manual override for admin)
    public Vkyc moveToReview(String userId) {
        Vkyc vkyc = vkycRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("VKYC not found"));

        vkyc.setStatus(VkycStatus.UNDER_REVIEW);

        return vkycRepository.save(vkyc);
    }

    // 📊 Stats helpers
    public long countByStatus(VkycStatus status) {
        return vkycRepository.countByStatus(status);
    }

    public long countAll() {
        return vkycRepository.count();
    }

    public long countByStatusAndDate(VkycStatus status, java.time.LocalDateTime from, java.time.LocalDateTime to) {
        return vkycRepository.countByStatusAndReviewedAtBetween(status, from, to);
    }

    // Check for existing record by any identifier (UUID or Email)
    public boolean isUserFullyApproved(String uuid, String email) {
        // 1. Try by UUID
        Optional<Vkyc> byUuid = vkycRepository.findByUserId(uuid);
        if (byUuid.isPresent() && byUuid.get().getStatus() == VkycStatus.APPROVED) {
            return true;
        }

        // 2. Try by Email (legacy/migration)
        if (email != null) {
            Optional<Vkyc> byEmail = vkycRepository.findByUserId(email);
            if (byEmail.isPresent() && byEmail.get().getStatus() == VkycStatus.APPROVED) {
                return true;
            }
        }

        return false;
    }
}