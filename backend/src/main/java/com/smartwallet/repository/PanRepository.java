package com.smartwallet.repository;

import com.smartwallet.model.PanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PanRepository extends JpaRepository<PanEntity, Long> {

    boolean existsByPanNumber(String panNumber);

    Optional<PanEntity> findByPanNumber(String panNumber);

    List<PanEntity> findByStatus(String status);
}
