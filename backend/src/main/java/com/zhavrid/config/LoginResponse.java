package com.zhavrid.config;

import com.zhavrid.model.Users;

import java.util.Set;

public class LoginResponse {
    private String token;
    private Users user;
    private Set<String> roles;

    public LoginResponse(String token, Users user, Set<String> roles) {
        this.token = token;
        this.user = user;
        this.roles = roles;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public LoginResponse(String token, Users user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }
}