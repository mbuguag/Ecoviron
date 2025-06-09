package com.example.ecoviron.util;

import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.UserRepository;
import com.example.ecoviron.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserUtil {

    private static JwtUtil jwtUtil;
    private static UserRepository userRepository;

    @Autowired
    public UserUtil(JwtUtil jwtUtil, UserRepository userRepository) {
        UserUtil.jwtUtil = jwtUtil;
        UserUtil.userRepository = userRepository;
    }


    public static User getUserFromToken(String token) {
        String jwt = token.replace("Bearer ", "");
        String email = jwtUtil.extractUsername(jwt);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
