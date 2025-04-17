package com.zhavrid.controller;

import com.zhavrid.config.LoginResponse;
import com.zhavrid.config.PasswordChangeRequest;
import com.zhavrid.dto.UserDto;
import com.zhavrid.dto.UserRegistrationRequest;
import com.zhavrid.model.Role;
import com.zhavrid.model.Users;
import com.zhavrid.repo.RoleRepo;
import com.zhavrid.repo.UserRepo;
import com.zhavrid.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest request) {
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Roles are required"));
        }

        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());

        Users registeredUser = service.register(user, request.getRoles());

        return ResponseEntity.ok(Collections.singletonMap("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Users user) {
        LoginResponse response = service.verify(user);

        if (response == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid credentials"));
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {

        Users user = userRepo.findByUsername(request.getUsername());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Пользователь не найден");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный текущий пароль");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
        return ResponseEntity.ok("Пароль успешно изменён");
    }
    private UserDto convertToDto(Users user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRoles(user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()));
        return dto;
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        try {
            Users user = userRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getUsername().equals(userDto.getUsername())) {
                if (userRepo.existsByUsername(userDto.getUsername())) {
                    return ResponseEntity.badRequest().body("Username already exists");
                }
                user.setUsername(userDto.getUsername());
            }

            if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDto.getPassword()));
            }

            Set<Role> roles = new HashSet<>();
            for (String roleName : userDto.getRoles()) {
                Role role = roleRepo.findByName(roleName);
                if (role == null) {
                    role = new Role(roleName);
                    roleRepo.save(role);
                }
                roles.add(role);
            }
            user.setRoles(roles);

            userRepo.save(user);
            return ResponseEntity.ok(convertToDto(user));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating user: " + e.getMessage());
        }
    }

}
