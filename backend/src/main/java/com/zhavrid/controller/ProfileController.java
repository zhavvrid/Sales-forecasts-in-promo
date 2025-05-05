package com.zhavrid.controller;

import com.zhavrid.dto.PasswordChangeRequest;
import com.zhavrid.dto.UserDto;
import com.zhavrid.model.Role;
import com.zhavrid.model.Users;
import com.zhavrid.repo.RoleRepo;
import com.zhavrid.repo.UserRepo;
import com.zhavrid.service.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTService jwtService;

    @GetMapping
    public ResponseEntity<?> getProfile(Principal principal) {
        Users user = userRepo.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToDto(user));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(Principal principal, @RequestBody UserDto userDto) {
        Users currentUser = userRepo.findByUsername(principal.getName());

        if (!currentUser.getUsername().equals(userDto.getUsername())) {
            if (userRepo.existsByUsername(userDto.getUsername())) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            currentUser.setUsername(userDto.getUsername());
        }

        if (currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"))) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : userDto.getRoles()) {
                Role role = roleRepo.findByName(roleName);
                if (role == null) {
                    role = new Role(roleName);
                    roleRepo.save(role);
                }
                roles.add(role);
            }
            currentUser.setRoles(roles);
        }

        userRepo.save(currentUser);
        return ResponseEntity.ok(convertToDto(currentUser));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            Principal principal,
            @RequestBody PasswordChangeRequest request) {

        Users user = userRepo.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Текущий пароль неверен");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        String newToken = jwtService.generateToken(user.getUsername());

        return ResponseEntity.ok(Map.of(
                "message", "Пароль успешно изменён",
                "token", newToken
        ));
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
}