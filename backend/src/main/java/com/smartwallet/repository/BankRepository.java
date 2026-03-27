package com.smartwallet.repository;

import com.smartwallet.model.BankEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankRepository extends JpaRepository<BankEntity, Long> {
    List<BankEntity> findByUserId(String userId);
}
