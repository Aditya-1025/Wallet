package com.smartwallet.repository;

import com.smartwallet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Find by email (used for login / registration check)
    Optional<User> findByEmail(String email);

    // Find by mobile number (used for transfers and registration check)
    Optional<User> findByMobileNumber(String mobileNumber);

    // Find by business userId
    Optional<User> findByUserId(String userId);

    // Check existence (fast & efficient)
    boolean existsByEmail(String email);

    boolean existsByMobileNumber(String mobileNumber);
}
