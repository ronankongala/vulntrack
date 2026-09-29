package com.vulntrack.backend.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Maps Severity to the labels allowed by the vulnerabilities.severity CHECK constraint. */
@Converter
public class SeverityConverter implements AttributeConverter<Severity, String> {

    @Override
    public String convertToDatabaseColumn(Severity attribute) {
        return attribute == null ? null : attribute.getDbValue();
    }

    @Override
    public Severity convertToEntityAttribute(String dbData) {
        return dbData == null ? null : Severity.fromDbValue(dbData);
    }
}
