package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.Product;
import com.example.ecoviron.exception.ResourceNotFoundException;
import com.example.ecoviron.repository.ProductRepository;
import com.example.ecoviron.service.ProductService;
import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    @Override
    public Product saveProduct(Product product){
        return productRepository.save(product);
    }

    @Override
    public Product getProductById(Long id){
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID:" +id));
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
    public void deleteProduct(Long id) {
        Product existing = getProductById(id);
        productRepository.delete(existing);
    }
}
