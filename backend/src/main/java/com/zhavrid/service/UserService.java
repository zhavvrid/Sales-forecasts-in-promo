package com.zhavrid.service;

import com.zhavrid.config.LoginResponse;
import com.zhavrid.model.Role;
import com.zhavrid.model.Users;
import com.zhavrid.repo.RoleRepo;
import com.zhavrid.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private JWTService jwtService;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Users register(Users user, Set<String> roleNames) {
        user.setPassword(encoder.encode(user.getPassword()));

        Set<Role> userRoles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepo.findByName(roleName);
            if (role == null) {
                role = new Role(roleName);
                roleRepo.save(role);
            }
            userRoles.add(role);
        }
        if (userRoles.isEmpty()) {
            Role defaultRole = roleRepo.findByName("ROLE_USER");
            if (defaultRole == null) {
                defaultRole = new Role("ROLE_USER");
                roleRepo.save(defaultRole);
            }
            userRoles.add(defaultRole);
        }

        user.setRoles(userRoles);
        return userRepo.save(user);
    }


    public LoginResponse verify(Users user) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );
        if (authentication.isAuthenticated()) {
            Users authenticatedUser = userRepo.findByUsername(user.getUsername());

            // Генерируем токен для аутентифицированного пользователя
            String token = jwtService.generateToken(authenticatedUser.getUsername());

            // Возвращаем как токен, так и данные пользователя
            return new LoginResponse(token, authenticatedUser);
        }

        return null;
    }
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
