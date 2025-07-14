package com.example.ecoviron.service;

import com.example.ecoviron.dto.UserDto;
import com.example.ecoviron.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    User getCurrentUser();
    List<UserDto> getAllUsers();
    UserDto updateUser(String email, String fullName, String password, MultipartFile profileImage);
}
