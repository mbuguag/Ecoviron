package com.example.ecoviron.dto;

import com.example.ecoviron.entity.User;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String profileImageUrl;

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getFullName();
        this.email = user.getEmail();
        this.role = user.getRoles().stream().findFirst().map(Enum::name).orElse("USER");
        this.profileImageUrl = user.getProfilePicture();
    }
}
