package com.iiitn.resell.user.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.iiitn.resell.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Thin wrapper around the Cloudinary SDK. Used by user-service for profile
 * pictures and (in product-service) for listing images. Centralizing here so
 * tests can stub the upload boundary.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String upload(byte[] bytes, String folder) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(bytes,
                    ObjectUtils.asMap("folder", folder, "resource_type", "image"));
            Object url = result.get("secure_url");
            if (url == null) throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloudinary returned no URL");
            return url.toString();
        } catch (Exception e) {
            log.error("Cloudinary upload failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Image upload failed");
        }
    }

    public void deleteByUrl(String url) {
        try {
            String publicId = extractPublicId(url);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            // Don't fail the surrounding operation just because cleanup failed.
            log.warn("Cloudinary delete failed for {}", url, e);
        }
    }

    private String extractPublicId(String url) {
        if (url == null) return null;
        try {
            String[] parts = url.split("/");
            String filename = parts[parts.length - 1];
            String folder   = parts[parts.length - 2];
            return folder + "/" + filename.split("\\.")[0];
        } catch (Exception e) {
            return null;
        }
    }
}
