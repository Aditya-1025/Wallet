package com.smartwallet.repository;

import com.smartwallet.enums.TransactionType;
import com.smartwallet.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    // All transactions where user is sender
    List<Transaction> findByUserIdOrderByCreatedAtDesc(String userId);

    // All transactions where user is sender or receiver (full history)
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId OR t.receiverUserId = :userId ORDER BY t.createdAt DESC")
    List<Transaction> findAllByUserOrderByCreatedAtDesc(String userId);

    // Filtered by type
    List<Transaction> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, TransactionType type);
}
