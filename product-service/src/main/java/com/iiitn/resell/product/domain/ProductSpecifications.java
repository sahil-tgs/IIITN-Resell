package com.iiitn.resell.product.domain;

import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

/**
 * Dynamic JPA Criteria specs for marketplace filtering. Each method returns
 * a non-null Specification — combine with Specification.where(...).and(...).
 */
public final class ProductSpecifications {

    private ProductSpecifications() {}

    public static Specification<Product> hasCategory(String category) {
        return (root, q, cb) -> category == null || category.isBlank()
                ? cb.conjunction()
                : cb.equal(root.get("category"), category);
    }

    public static Specification<Product> hasCondition(String condition) {
        return (root, q, cb) -> condition == null || condition.isBlank()
                ? cb.conjunction()
                : cb.equal(root.get("condition"), condition);
    }

    public static Specification<Product> priceAtLeast(BigDecimal min) {
        return (root, q, cb) -> min == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("price"), min);
    }

    public static Specification<Product> priceAtMost(BigDecimal max) {
        return (root, q, cb) -> max == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("price"), max);
    }

    public static Specification<Product> isSold(Boolean sold) {
        return (root, q, cb) -> sold == null ? cb.conjunction() : cb.equal(root.get("sold"), sold);
    }
}
