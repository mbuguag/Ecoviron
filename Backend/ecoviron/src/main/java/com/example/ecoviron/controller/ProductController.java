package com.example.ecoviron.controller;

import com.example.ecoviron.entity.Product;
import com.example.ecoviron.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // to adjust later accordingly for security
public class ProductController {

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product){
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }




}
