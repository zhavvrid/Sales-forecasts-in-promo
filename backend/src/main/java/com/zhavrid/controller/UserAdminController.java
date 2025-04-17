package com.zhavrid.controller;

import com.zhavrid.dto.UserDto;
import com.zhavrid.model.Role;
import com.zhavrid.model.Users;
import com.zhavrid.repo.RoleRepo;
import com.zhavrid.repo.UserRepo;
import com.zhavrid.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserDto> getAllUsers() {
        return userRepo.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        try {
            if (userRepo.existsByUsername(userDto.getUsername())) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            Users user = new Users();
            user.setUsername(userDto.getUsername());
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
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
            return ResponseEntity.internalServerError().body("Error creating user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Users user = userRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            String currentUsername = userService.getCurrentUsername();
            if (user.getUsername().equals(currentUsername)) {
                return ResponseEntity.badRequest().body("Cannot delete yourself");
            }

            userRepo.delete(user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Users user = userRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newPassword = request.get("password");
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body("Password cannot be empty");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepo.save(user);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating password: " + e.getMessage());
        }
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
