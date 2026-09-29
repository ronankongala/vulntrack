package com.vulntrack.backend.dto;

import com.vulntrack.backend.domain.Asset;

public record AssetSummary(Integer id, String hostname, String owner, String environment) {

    public static AssetSummary from(Asset a) {
        return new AssetSummary(a.getId(), a.getHostname(), a.getOwner(), a.getEnvironment());
    }
}
