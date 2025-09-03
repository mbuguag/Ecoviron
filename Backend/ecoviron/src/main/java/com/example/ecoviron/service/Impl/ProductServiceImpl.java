package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.ProductUploadDto;
import com.example.ecoviron.entity.Category;
import com.example.ecoviron.entity.Product;
import com.example.ecoviron.exception.ResourceNotFoundException;
import com.example.ecoviron.repository.CategoryRepository;
import com.example.ecoviron.repository.ProductRepository;
import com.example.ecoviron.service.FileStorageService;
import com.example.ecoviron.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID:" + id));
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = getProductById(id);
        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setImageUrl(updatedProduct.getImageUrl());
        existing.setCategory(updatedProduct.getCategory());
        return productRepository.save(existing);
    }

    @Override
    public Product updateProductWithImage(Long id, ProductUploadDto dto) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            existing.setPrice(dto.getPrice());
            existing.setStock(dto.getStock());
            existing.setFeatured(dto.isFeatured());

            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                existing.setCategory(category);
            }

            // Replace old image if new one is uploaded
            if (dto.getImage() != null && !dto.getImage().isEmpty()) {
                try {
                    fileStorageService.deleteFile(existing.getImageUrl()); // remove old Cloudinary image
                    String imagePath = fileStorageService.saveFile(dto.getImage(), "products");
                    existing.setImageUrl(imagePath);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to save new image", e);
                }
            } else if (dto.getExistingImageUrl() != null) {
                existing.setImageUrl(dto.getExistingImageUrl());
            }

            return productRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    public void deleteProduct(Long id) {
        Product existing = getProductById(id);
        try {
            fileStorageService.deleteFile(existing.getImageUrl());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from Cloudinary", e);
        }
        productRepository.delete(existing);
    }

    @Override
    public List<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue();
    }

    @Override
    public Product saveProductWithImage(Product product, MultipartFile image, Long categoryId) {
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        if (image != null && !image.isEmpty()) {
            try {
                String imagePath = fileStorageService.saveFile(image, "products");
                product.setImageUrl(imagePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store product image", e);
            }
        }

        return productRepository.save(product);
    }

    @Override
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }
}
