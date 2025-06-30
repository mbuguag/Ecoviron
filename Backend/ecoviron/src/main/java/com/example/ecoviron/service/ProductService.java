package com.example.ecoviron.service;

import com.example.ecoviron.entity.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    Product saveProduct(Product product);
    Product getProductById(Long id);
    List<Product> getAllProducts();
    Product updateProduct(Long id, Product updatedProduct);
    void deleteProduct(Long id);
    public List<Product> getFeaturedProducts();
    Product saveProductWithImage(Product product, MultipartFile image, Long categoryId);

}
