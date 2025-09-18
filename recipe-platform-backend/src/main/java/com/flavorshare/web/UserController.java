package com.flavorshare.web;

import com.flavorshare.model.User;
import com.flavorshare.repo.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
  private final UserRepository repo;
  public UserController(UserRepository repo) { this.repo = repo; }

  @GetMapping public List<User> all() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<User> one(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }
}
