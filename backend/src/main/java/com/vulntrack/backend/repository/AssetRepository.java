package com.vulntrack.backend.repository;

import com.vulntrack.backend.domain.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Integer> {
}
