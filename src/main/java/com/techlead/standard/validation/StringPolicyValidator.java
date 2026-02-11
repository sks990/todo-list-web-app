package com.techlead.standard.validation;

import java.nio.charset.StandardCharsets;

/**
 * 데이터 타입 및 문자열 계산 방식 정책에 따른 유효성 검사 유틸리티
 */
public class StringPolicyValidator {

    /**
     * 논리적 글자 수 검증 (Character-based)
     * DB의 VARCHAR2(N CHAR) 정책에 대응함.
     */
    public static boolean isValidCharLength(String value, int maxLength) {
        if (value == null) return true;
        return value.length() <= maxLength;
    }

    /**
     * 물리적 바이트 수 검증 (Byte-based)
     * 외부 인터페이스 등 Byte 기준 통신 시 사용. UTF-8 기준.
     */
    public static boolean isValidByteLength(String value, int maxBytes) {
        if (value == null) return true;
        return value.getBytes(StandardCharsets.UTF_8).length <= maxBytes;
    }

    /**
     * 표준 공백 처리 및 유효성 검사
     * 필수값인 경우 공백만 있는 문자열은 false 반환
     */
    public static String sanitize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * 문자열이 비어있는지 확인 (공백 포함)
     */
    public static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}