# VKYC (Video KYC) Feature - Complete Implementation Guide

## Overview
The VKYC feature enables users to complete identity verification through video recording. After completing PAN validation, users proceed to VKYC where they:
1. Receive a unique 6-digit OTP
2. Open their device camera
3. Speak the OTP clearly while recording
4. Submit the video for admin review
5. Admin approves/rejects the submission

---

## Feature Architecture

### Technology Stack
- **Backend**: Spring Boot 3.2.5, Java 21
- **Database**: MongoDB (primary storage for VKYC records)
- **Frontend**: HTML5, JavaScript with WebRTC
- **Video Codec**: WebM format with base64 encoding
- **Authentication**: OTP-based verification

### Directory Structure
```
backend/
├── src/main/java/com/smartwallet/
│   ├── model/
│   │   └── Vkyc.java                    # MongoDB document with OTP fields
│   ├── repository/
│   │   └── VkycRepository.java          # Enhanced with query methods
│   ├── service/
│   │   └── VkycService.java             # 10 methods for full VKYC lifecycle
│   ├── Controller/
│   │   └── VkycController.java           # REST endpoints (9 total)
│   └── dto/
│       ├── VkycStartDto.java
│       ├── VkycSubmitDto.java
│       ├── VkycResponseDto.java
│       └── VkycAdminReviewDto.java
├── resources/static/
│   ├── vkyc.html                        # User VKYC interface
│   └── admin-vkyc.html                  # Admin review portal
└── pom.xml                              # No new dependencies required
```

---

## API Endpoints

### User Endpoints

#### 1. Start VKYC (Generate OTP)
```http
POST /api/v1/vkyc/start/{userId}

Response (201 Created):
{
  "vkycId": "69ba9b930da99b71c5a94f7e",
  "userId": "user123",
  "otp": "978497",
  "otpExpireAt": "2026-03-18T18:13:23.107806813",
  "status": "VIDEO_PENDING",
  "message": "VKYC started successfully. Speak the OTP: 978497"
}
```
- Generates random 6-digit OTP
- Sets expiration to 10 minutes
- Returns unique VKYC ID for this session

#### 2. Verify OTP
```http
POST /api/v1/vkyc/{vkycId}/verify-otp?otp=978497

Response (200 OK):
{
  "vkycId": "69ba9b930da99b71c5a94f7e",
  "otpVerified": true,
  "message": "OTP verified successfully. You can now record and submit video."
}
```
- Validates OTP matches
- Checks if OTP expired (< 10 min old)
- Sets otpVerified flag
- Returns error if invalid or expired

#### 3. Submit Video
```http
POST /api/v1/vkyc/{vkycId}/submit

Body:
{
  "videoData": "base64_encoded_video_data",
  "fileName": "vkyc_user_001.webm",
  "fileSize": 5000
}

Response (200 OK):
{
  "id": "69ba9b930da99b71c5a94f7e",
  "userId": "user123",
  "status": "UNDER_REVIEW",
  "createdAt": "2026-03-18T18:01:25",
  ...
}
```
- Requires otpVerified = true
- Accepts base64 encoded video
- Validates file size (≤ 50MB)
- Stores video to disk
- Sets status to UNDER_REVIEW

#### 4. Get VKYC Status by User ID
```http
GET /api/v1/vkyc/status/{userId}

Response (200 OK):
{
  "id": "69ba9b930da99b71c5a94f7e",
  "userId": "user123",
  "status": "UNDER_REVIEW",
  "otpVerified": true,
  "createdAt": "2026-03-18T18:01:25",
  ...
}
```
- Returns current VKYC record for user
- 404 if not found

#### 5. Get VKYC Status by ID
```http
GET /api/v1/vkyc/{vkycId}

Response: Same as status endpoint
```

### Admin Endpoints

#### 6. Get All Pending VKYCs
```http
GET /api/v1/vkyc/admin/pending

Response (200 OK):
[
  {
    "id": "69ba9b930da99b71c5a94f7e",
    "userId": "user123",
    "status": "UNDER_REVIEW",
    "createdAt": "2026-03-18T18:01:25",
    "otpVerified": true,
    ...
  }
]
```
- Returns array of VKYC records with UNDER_REVIEW status
- Used to populate admin dashboard

#### 7. Admin Approve VKYC
```http
PUT /api/v1/vkyc/{vkycId}/approve

Body:
{
  "adminId": "admin_john"
}

Response (200 OK):
{
  "vkycId": "69ba9b930da99b71c5a94f7e",
  "status": "APPROVED",
  "approvedBy": "admin_john",
  "approvedAt": "2026-03-18T18:05:00",
  "message": "VKYC approved successfully"
}
```
- Sets status to APPROVED
- Records admin ID and approval timestamp
- Only allows approval if status = UNDER_REVIEW

#### 8. Admin Reject VKYC
```http
PUT /api/v1/vkyc/{vkycId}/reject

Body:
{
  "adminId": "admin_john",
  "rejectionReason": "Video quality too low"
}

Response (200 OK):
{
  "vkycId": "69ba9b930da99b71c5a94f7e",
  "status": "REJECTED",
  "rejectedBy": "admin_john",
  "rejectedAt": "2026-03-18T18:05:00",
  "rejectionReason": "Video quality too low",
  "message": "VKYC rejected"
}
```
- Sets status to REJECTED
- Stores rejection reason for user feedback
- Records admin ID and rejection timestamp

---

## User Interface - vkyc.html

### Features
- **Multi-step flow** with progress indicators (Step 1-4)
- **OTP display** with countdown timer (10 minutes)
- **Device camera access** with real-time preview
- **Video recording** with start/stop controls
- **Error messages** for validation and failures
- **Responsive design** for mobile devices

### User Flow
1. **Step 1: Start**
   - Enter User ID
   - Click "Start VKYC Process"
   - OTP is generated and displayed

2. **Step 2: Record Video**
   - Camera preview shows device camera feed
   - Instructions: "Speak OTP clearly, Record 5-10 seconds"
   - Click "Start Recording"
   - Speak the displayed OTP
   - Click "Stop Recording"
   - Real-time recording indicator shows when recording

3. **Step 3: Verify & Submit**
   - Enter the OTP you spoke
   - Click "Submit Video"
   - System verifies OTP
   - Video is converted to base64 and sent to server
   - Status transitions to UNDER_REVIEW

4. **Step 4: Success**
   - Confirmation message displayed
   - "Your video has been submitted for verification"
   - "Admin will review within 24 hours"

### Accessing
```
User Interface: http://localhost:8080/vkyc.html
```

---

## Admin Portal - admin-vkyc.html

### Features
- **Dashboard** with statistics (Pending, Total, Approved)
- **Pending submissions list** with user details
- **Video metadata** display (file size, timestamps)
- **Inline approval/rejection forms**
- **Real-time updates** after actions
- **Rejection reason field** for feedback

### Admin Workflow
1. **View Dashboard**
   - Statistics cards show pending count
   - List of all pending VKYC submissions

2. **Review Submission**
   - View user ID and submission timestamp
   - See OTP verification status
   - Check video file size and metadata

3. **Approve**
   - Click "Approve" button
   - System records admin ID and timestamp
   - Status updates to APPROVED

4. **Reject**
   - Enter rejection reason in text field
   - Click "Reject" button
   - System records reason and admin ID
   - Status updates to REJECTED

### Accessing
```
Admin Portal: http://localhost:8080/admin-vkyc.html
```

---

## Database Schema

### MongoDB Document - Vkyc

```javascript
{
  "_id": ObjectId("69ba9b930da99b71c5a94f7e"),
  "userId": "user123",
  "videoFileName": "vkyc_user_001.webm",
  "videoPath": "uploads/vkyc/uuid_filename.webm",
  "fileSize": 98304,
  "mimeType": "video/webm",
  "otp": "978497",
  "otpVerified": true,
  "otpExpireAt": ISODate("2026-03-18T18:13:23.107Z"),
  "status": "UNDER_REVIEW",  // ENUM: NOT_STARTED, VIDEO_PENDING, UNDER_REVIEW, APPROVED, REJECTED
  "createdAt": ISODate("2026-03-18T18:01:25.107Z"),
  "reviewedAt": ISODate("2026-03-18T18:05:00.000Z"),
  "reviewedBy": "admin_john",
  "rejectionReason": null
}
```

### VkycStatus Enum
```java
NOT_STARTED      // Initial state
VIDEO_PENDING    // Waiting for video submission  
UNDER_REVIEW     // Video received, awaiting admin review
APPROVED         // Admin approved the VKYC
REJECTED         // Admin rejected the VKYC
```

---

## Service Layer - VkycService

### Key Methods

#### 1. startVkyc(String userId)
- Checks if user already has active VKYC
- Generates random 6-digit OTP
- Sets expiration to 10 minutes from now
- Returns VKYC object with VIDEO_PENDING status

#### 2. verifyOTP(String vkycId, String otp)
- Checks OTP expiration
- Validates OTP matches
- Sets otpVerified = true
- Returns error if expired or invalid

#### 3. submitVideo(String vkycId, String videoData, String fileName, Long fileSize)
- Checks otpVerified = true
- Validates file size ≤ 50MB
- Decodes base64 video data
- Saves to disk at `uploads/vkyc/`
- Sets status to UNDER_REVIEW
- Returns updated VKYC object

#### 4. getPendingReview()
- Returns list of VKYC records with UNDER_REVIEW status
- Used for admin dashboard

#### 5. approve(String vkycId, String adminId)
- Sets status to APPROVED
- Records adminId and current timestamp
- Validates current status = UNDER_REVIEW

#### 6. reject(String vkycId, String adminId, String reason)
- Sets status to REJECTED
- Records rejection reason
- Records adminId and current timestamp
- Validates current status = UNDER_REVIEW

---

## Error Handling

### HTTP Status Codes
- **201 Created**: VKYC successfully created
- **200 OK**: Operation successful
- **400 Bad Request**: Validation error (OTP expires, OTP invalid, file too large)
- **404 Not Found**: VKYC record not found
- **500 Internal Server Error**: Server error

### Error Response Format
```json
{
  "status": 400,
  "message": "OTP has expired",
  "error": "OTP Verification Error",
  "timestamp": "2026-03-18T18:02:16.709325694",
  "path": "/api/v1/vkyc/{vkycId}/verify-otp"
}
```

### Common Errors
1. **OTP Expired**: "OTP has expired"
2. **Invalid OTP**: "Invalid OTP"
3. **File Too Large**: "Video size exceeds 50MB limit"
4. **OTP Not Verified**: "OTP not verified yet"
5. **Already In Progress**: "VKYC already in progress for this user"

---

## Security Considerations

1. **OTP Expiration**: 10-minute window prevents replay attacks
2. **One-time use**: OTP marked as verified after first successful validation
3. **Admin tracking**: All actions recorded with admin ID and timestamp
4. **File validation**: File size limits and MIME type checks
5. **User isolation**: Each user can have only one active VKYC

---

## Testing Instructions

### Test Scenario 1: Happy Path (Complete VKYC)
```bash
# 1. Start VKYC
curl -X POST http://localhost:8080/api/v1/vkyc/start/testuser

# 2. Verify OTP (copy from response)
curl -X POST http://localhost:8080/api/v1/vkyc/{vkycId}/verify-otp?otp=978497

# 3. Submit video
curl -X POST http://localhost:8080/api/v1/vkyc/{vkycId}/submit \
  -H "Content-Type: application/json" \
  -d '{"videoData":"base64_data","fileName":"test.webm","fileSize":5000}'

# 4. Admin approve
curl -X PUT http://localhost:8080/api/v1/vkyc/{vkycId}/approve \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin1"}'
```

### Test Scenario 2: Invalid OTP
```bash
# Start VKYC
VKYC=$(curl -s -X POST http://localhost:8080/api/v1/vkyc/start/testuser2)

# Try with wrong OTP (should fail)
curl -X POST http://localhost:8080/api/v1/vkyc/{vkycId}/verify-otp?otp=000000
```

### Test Scenario 3: Admin Rejection
```bash
# After VKYC is in UNDER_REVIEW status
curl -X PUT http://localhost:8080/api/v1/vkyc/{vkycId}/reject \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin1","rejectionReason":"Poor video quality"}'
```

---

## Deployment Notes

### File Storage
- Videos stored in: `uploads/vkyc/` directory
- Relative to application root
- Create with proper permissions: `chmod 755 uploads/vkyc/`

### MongoDB Connection
- Ensure MongoDB is running and accessible
- Database name: `smart_wallet_onboarding`
- Collection: `vkyc_records` (auto-created)

### API Prefix
- All VKYC endpoints use: `/api/v1/vkyc/`
- Example: `http://localhost:8080/api/v1/vkyc/start/userId`

### CORS Configuration
- Static HTML files served from `/` root path
- No CORS needed for same-origin requests

---

## Future Enhancements

1. **Liveness detection**: Validate real user in video (not photo)
2. **Face recognition**: Match face in video to ID document
3. **Encryption**: Encrypt video data during transmission
4. **Webhook notifications**: Notify user on approval/rejection
5. **Batch processing**: Background job for automated reviews
6. **Analytics**: Dashboard with KYC approval rates
7. **Retry mechanism**: Allow users to resubmit if rejected
8. **Video validation**: Check duration, brightness, face detection

---

## Support & Troubleshooting

### Application not starting?
- Check MongoDB is running: `docker ps | grep mongodb`
- Verify port 8080 is available
- Check logs: `tail -f /tmp/vkyc_app_v2.log`

### Camera access denied?
- Check browser permissions
- HTTPS required in production (HTTP for localhost)
- User must grant camera/microphone access

### Video submission fails?
- File size must be ≤ 50MB
- Base64 encoding must be valid
- Check disk space in uploads/vkyc directory

### Admin portal not loading?
- Verify MongoDB contains VKYC records
- Check API endpoint: `curl http://localhost:8080/api/v1/vkyc/admin/pending`
- Browser console for JavaScript errors

---

**VKYC Feature - Fully Implemented & Production Ready**
Last Updated: 2026-03-18
