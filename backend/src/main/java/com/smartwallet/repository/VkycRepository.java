package com.smartwallet.repository;


import com.smartwallet.model.Vkyc;
import com.smartwallet.enums.VkycStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VkycRepository extends MongoRepository<Vkyc, String> {
    Optional<Vkyc> findByUserId(String userId);
    List<Vkyc> findByStatus(VkycStatus status);
    boolean existsByUserId(String userId);
    long countByStatus(VkycStatus status);
    long countByStatusAndReviewedAtBetween(VkycStatus status, java.time.LocalDateTime from, java.time.LocalDateTime to);
}
