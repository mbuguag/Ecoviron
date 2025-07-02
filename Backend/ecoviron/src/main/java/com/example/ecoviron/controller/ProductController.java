package com.example.ecoviron.controller;

import com.example.ecoviron.entity.Category;
import com.example.ecoviron.entity.Product;
import com.example.ecoviron.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product){
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam(value = "stock", defaultValue = "0") int stock,
            @RequestParam(value = "featured", defaultValue = "false") boolean featured,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam("image") MultipartFile imageFile
    ) {
        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/products/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String filename = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            File dest = new File(dir, filename);
            imageFile.transferTo(dest);

            String imageUrl = "/uploads/products/" + filename;

            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setStock(stock);
            product.setFeatured(featured);
            product.setImageUrl(imageUrl);

            if (categoryId != null) {
                Category category = new Category();
                category.setId(categoryId); // assuming it exists
                product.setCategory(category);
            }

            return ResponseEntity.ok(productService.saveProduct(product));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Image upload failed");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
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
