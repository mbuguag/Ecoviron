package com.example.ecoviron.controller;

import com.example.ecoviron.dto.ProductUploadDto;
import com.example.ecoviron.entity.Product;
import com.example.ecoviron.service.OrderItemService;
import com.example.ecoviron.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class AdminProductController {

    private final ProductService productService;

    private final OrderItemService orderItemService;

    public AdminProductController(ProductService productService, OrderItemService orderItemService) {
        this.productService = productService;
        this.orderItemService = orderItemService;
    }


    private static final Logger logger = LoggerFactory.getLogger(AdminProductController.class);

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        logger.info("Admin creating product: {}", product.getName());
        Product saved = productService.saveProduct(product);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/products/{id}")
    public ResponseEntity<?> updateProductViaPost(
            @PathVariable Long id,
            @ModelAttribute ProductUploadDto dto
    ) {
        // logic to update the product
        Product updated = productService.updateProductWithImage(id, dto);
        return ResponseEntity.ok(updated);
    }


    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> uploadProductWithImage(@ModelAttribute ProductUploadDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setFeatured(dto.isFeatured());
        // Handle image saving and category assignment here...
        Product saved = productService.saveProductWithImage(product, dto.getImage(), dto.getCategoryId());
        return ResponseEntity.ok(saved);
    }


    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }


    @GetMapping("/{productId}/order-count")
    public long getProductOrderCount(@PathVariable Long productId) {
        return orderItemService.countOrdersForProduct(productId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return (product != null) ? ResponseEntity.ok(product) : ResponseEntity.notFound().build();
    }



    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @ModelAttribute ProductUploadDto dto
    ) {
        Product updated = productService.updateProductWithImage(id, dto);
        return ResponseEntity.ok(updated);
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("User: " + auth.getName());
        System.out.println("Authorities: " + auth.getAuthorities());
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
