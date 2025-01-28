package com.iiitn.resell.product.service;

import com.iiitn.resell.common.event.KafkaTopics;
import com.iiitn.resell.common.event.ProductEvent;
import com.iiitn.resell.common.exception.ApiException;
import com.iiitn.resell.product.api.ProductDtos.CreateProductRequest;
import com.iiitn.resell.product.api.ProductDtos.PageResponse;
import com.iiitn.resell.product.api.ProductDtos.ProductResponse;
import com.iiitn.resell.product.api.ProductDtos.UpdateProductRequest;
import com.iiitn.resell.product.domain.Product;
import com.iiitn.resell.product.domain.ProductRepository;
import com.iiitn.resell.product.domain.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final CloudinaryService cloudinary;
    private final KafkaTemplate<String, Object> kafka;

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse create(UUID sellerId, CreateProductRequest req, byte[] image) {
        if (image == null || image.length == 0) {
            throw ApiException.badRequest("Product image is required");
        }
        String imageUrl = cloudinary.upload(image, "iiitn-resell-products");
        Product p = repo.save(Product.builder()
                .sellerId(sellerId)
                .title(req.title())
                .description(req.description() == null ? "" : req.description())
                .price(req.price())
                .imageUrl(imageUrl)
                .category(orEmpty(req.category()))
                .condition(orEmpty(req.condition()))
                .location(orEmpty(req.location()))
                .sold(false)
                .build());
        publish(p, ProductEvent.Type.CREATED);
        return toResponse(p);
    }

    @Cacheable(value = "products", key = "#id")
    public ProductResponse get(UUID id) {
        return toResponse(repo.findById(id).orElseThrow(() -> ApiException.notFound("Product")));
    }

    public PageResponse<ProductResponse> list(String category, String condition,
                                              BigDecimal minPrice, BigDecimal maxPrice,
                                              Boolean sold, int page, int size,
                                              String sortField, String sortOrder) {
        Sort sort = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.by(sortField).ascending() : Sort.by(sortField).descending();
        Specification<Product> spec = Specification
                .where(ProductSpecifications.hasCategory(category))
                .and(ProductSpecifications.hasCondition(condition))
                .and(ProductSpecifications.priceAtLeast(minPrice))
                .and(ProductSpecifications.priceAtMost(maxPrice))
                .and(ProductSpecifications.isSold(sold));
        Page<Product> result = repo.findAll(spec, PageRequest.of(page - 1, size, sort));
        return new PageResponse<>(result.map(this::toResponse).getContent(),
                result.getTotalPages(), result.getTotalElements(), page);
    }

    public PageResponse<ProductResponse> listByUser(UUID sellerId, int page, int size) {
        Page<Product> result = repo.findBySellerId(sellerId,
                PageRequest.of(page - 1, size, Sort.by("createdAt").descending()));
        return new PageResponse<>(result.map(this::toResponse).getContent(),
                result.getTotalPages(), result.getTotalElements(), page);
    }

    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse update(UUID id, UUID sellerId, UpdateProductRequest req, byte[] image) {
        Product p = repo.findById(id).orElseThrow(() -> ApiException.notFound("Product"));
        if (!p.getSellerId().equals(sellerId)) {
            throw ApiException.forbidden("Not authorized to update this product");
        }
        boolean wasSold = p.isSold();
        if (req.title()       != null) p.setTitle(req.title());
        if (req.description() != null) p.setDescription(req.description());
        if (req.price()       != null) p.setPrice(req.price());
        if (req.category()    != null) p.setCategory(req.category());
        if (req.condition()   != null) p.setCondition(req.condition());
        if (req.location()    != null) p.setLocation(req.location());
        if (req.sold()        != null) p.setSold(req.sold());

        if (image != null && image.length > 0) {
            cloudinary.deleteByUrl(p.getImageUrl());
            p.setImageUrl(cloudinary.upload(image, "iiitn-resell-products"));
        }
        Product saved = repo.save(p);
        // Distinct event when a listing transitions to sold — analytics + notifications care.
        publish(saved, !wasSold && saved.isSold() ? ProductEvent.Type.SOLD : ProductEvent.Type.UPDATED);
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void delete(UUID id, UUID sellerId) {
        Product p = repo.findById(id).orElseThrow(() -> ApiException.notFound("Product"));
        if (!p.getSellerId().equals(sellerId)) {
            throw ApiException.forbidden("Not authorized to delete this product");
        }
        cloudinary.deleteByUrl(p.getImageUrl());
        repo.delete(p);
        publish(p, ProductEvent.Type.DELETED);
    }

    private void publish(Product p, ProductEvent.Type type) {
        ProductEvent evt = ProductEvent.builder()
                .type(type)
                .productId(p.getId().toString())
                .sellerId(p.getSellerId().toString())
                .title(p.getTitle())
                .description(p.getDescription())
                .price(p.getPrice())
                .category(p.getCategory())
                .condition(p.getCondition())
                .location(p.getLocation())
                .imageUrl(p.getImageUrl())
                .sold(p.isSold())
                .occurredAt(Instant.now())
                .build();
        kafka.send(KafkaTopics.PRODUCT_EVENTS, p.getId().toString(), evt);
    }

    private static String orEmpty(String s) { return s == null ? "" : s; }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(p.getId(), p.getSellerId(), p.getTitle(), p.getDescription(),
                p.getPrice(), p.getImageUrl(), p.getCategory(), p.getCondition(),
                p.getLocation(), p.isSold(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
