package com.iiitn.resell.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {
        // Common ships an MVC argument resolver — gateway is reactive, exclude it.
        org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration.class
})
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
