package com.iiitn.resell.product.api;

import com.iiitn.resell.common.security.AuthenticatedUser;
import com.iiitn.resell.common.security.CurrentUser;
import com.iiitn.resell.product.api.ProductDtos.CreateProductRequest;
import com.iiitn.resell.product.api.ProductDtos.PageResponse;
import com.iiitn.resell.product.api.ProductDtos.ProductResponse;
import com.iiitn.resell.product.api.ProductDtos.UpdateProductRequest;
import com.iiitn.resell.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> create(
            @CurrentUser AuthenticatedUser user,
            @RequestPart("title") String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart("price") String price,
            @RequestPart(value = "category", required = false) String category,
            @RequestPart(value = "condition", required = false) String condition,
            @RequestPart(value = "location", required = false) String location,
            @RequestPart("image") MultipartFile image) throws IOException {
        CreateProductRequest req = new CreateProductRequest(
                title, description, new BigDecimal(price), category, condition, location);
        return ResponseEntity.status(201).body(
                service.create(UUID.fromString(user.userId()), req, image.getBytes()));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean sold,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "createdAt") String sortField,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        return ResponseEntity.ok(service.list(category, condition, minPrice, maxPrice,
                sold, page, limit, sortField, sortOrder));
    }

    @GetMapping("/user")
    public ResponseEntity<PageResponse<ProductResponse>> mine(
            @CurrentUser AuthenticatedUser user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(service.listByUser(UUID.fromString(user.userId()), page, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> byId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> update(
            @CurrentUser AuthenticatedUser user,
            @PathVariable UUID id,
            @RequestPart(value = "title", required = false) String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "price", required = false) String price,
            @RequestPart(value = "category", required = false) String category,
            @RequestPart(value = "condition", required = false) String condition,
            @RequestPart(value = "location", required = false) String location,
            @RequestPart(value = "isSold", required = false) String isSold,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        UpdateProductRequest req = new UpdateProductRequest(
                title, description,
                price == null ? null : new BigDecimal(price),
                category, condition, location,
                isSold == null ? null : Boolean.parseBoolean(isSold));
        byte[] bytes = (image != null && !image.isEmpty()) ? image.getBytes() : null;
        return ResponseEntity.ok(service.update(id, UUID.fromString(user.userId()), req, bytes));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductResponse> updateJson(
            @CurrentUser AuthenticatedUser user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest req) {
        return ResponseEntity.ok(service.update(id, UUID.fromString(user.userId()), req, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@CurrentUser AuthenticatedUser user, @PathVariable UUID id) {
        service.delete(id, UUID.fromString(user.userId()));
        return ResponseEntity.noContent().build();
    }
}
