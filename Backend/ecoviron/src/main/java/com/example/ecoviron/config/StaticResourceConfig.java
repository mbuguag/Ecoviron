//package com.example.ecoviron.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//import java.nio.file.Path;
//import java.nio.file.Paths;
//
//@Configuration
//public class StaticResourceConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//        // Use absolute path to your uploads directory
//        Path uploadDir = Paths.get("C:/Users/Admin/Desktop/Environ/Backend/ecoviron/uploads");
//        String uploadPath = uploadDir.toFile().getAbsolutePath().replace("\\", "/");
//
//        registry.addResourceHandler("/uploads/**")
//                .addResourceLocations("file:/" + uploadPath + "/");
//    }
//}
