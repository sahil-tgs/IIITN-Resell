package com.iiitn.resell.user.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(
            @Value("${cloudinary.cloud-name}") String name,
            @Value("${cloudinary.api-key}")    String key,
            @Value("${cloudinary.api-secret}") String secret) {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", name,
                "api_key",    key,
                "api_secret", secret,
                "secure",     true));
    }
}
