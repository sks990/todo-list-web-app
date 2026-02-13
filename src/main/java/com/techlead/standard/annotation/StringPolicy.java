<ctrl60>package com.techlead.standard.annotation;

import java.lang.annotation.*;

/**
 * 엔티티 필드에 적용하여 문자열 정책을 명시하기 위한 어노테이션
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface StringPolicy {
    int maxLength() default 255;
    boolean useByteCheck() default false; // false 면 Character 기준, true 면 Byte 기준
    boolean allowLeadingTrailingSpaces() default false;
}