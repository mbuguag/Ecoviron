package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.WishListItemDto;
import com.example.ecoviron.entity.Product;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.entity.WishListItem;
import com.example.ecoviron.repository.ProductRepository;
import com.example.ecoviron.repository.UserRepository;
import com.example.ecoviron.repository.WishListRepository;
import com.example.ecoviron.service.WishListService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishListServiceImpl implements WishListService {
    private final WishListRepository wishlistRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;



    public List<WishListItemDto> getUserWishlist(String username) {
        User user =  userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return wishlistRepo.findByUser(user).stream().map(item -> {
            Product p = item.getProduct();
            return new WishListItemDto(item.getId(), p.getId(), p.getName(), p.getImageUrl(), p.getPrice());
        }).collect(Collectors.toList());
    }

    public void addToWishList(String username, Long productId) {
        User user = userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Product product = productRepo.findById(productId).orElseThrow();
        if (!wishlistRepo.existsByUserAndProduct(user, product)) {
            wishlistRepo.save(new WishListItem(null, user, product));
        }
    }

    public void removeFromWishList(String username, Long productId) {
        User user =  userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Product product = productRepo.findById(productId).orElseThrow();
        wishlistRepo.deleteByUserAndProduct(user, product);
    }
}
