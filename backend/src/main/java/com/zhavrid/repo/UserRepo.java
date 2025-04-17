package com.zhavrid.repo;

import com.zhavrid.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<Users, Integer> {

    Users findByUsername(String username);
    Optional<Users> findById(Long userId);
    boolean existsByUsername(String username);

}
