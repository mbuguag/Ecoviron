package com.example.ecoviron.service;

import com.example.ecoviron.entity.Category;

import java.util.List;

public interface CategoryService {
    Category saveCategory(Category category);
    Category getCategoryById(Long id);
    List<Category> getAllCategories();
    Category updateCategory(Long id, Category updatedCategory);
    void deleteCategory(Long id);
}
