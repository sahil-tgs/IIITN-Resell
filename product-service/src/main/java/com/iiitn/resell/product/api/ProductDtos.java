package com.iiitn.resell.product.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ProductDtos {

    public record ProductResponse(
            UUID id,
            UUID sellerId,
            String title,
            String description,
            BigDecimal price,
            String imageUrl,
            String category,
            String condition,
            String location,
            boolean sold,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record CreateProductRequest(
            @NotBlank String title,
            String description,
            @NotNull @DecimalMin("0") BigDecimal price,
            String category,
            String condition,
            String location
    ) {}

    public record UpdateProductRequest(
            String title,
            String description,
            BigDecimal price,
            String category,
            String condition,
            String location,
            Boolean sold
    ) {}

    public record PageResponse<T>(
            List<T> products,
            int totalPages,
            long totalProducts,
            int currentPage
    ) {}
}
