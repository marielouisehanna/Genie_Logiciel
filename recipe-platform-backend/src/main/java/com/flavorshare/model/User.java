package com.flavorshare.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"recipes", "reviews", "likes"}) // avoid cycles when serializing a User
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    @Column(unique = true)
    private String username;

    @NotBlank(message = "Email is required")
    @Email
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // never send password to clients
    private String password;

    @Size(max = 100)
    private String fullName;

    @Size(max = 500)
    private String bio;

    private String profileImage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Recipe> recipes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Like> likes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Recipe> getRecipes() { return recipes; }
    public void setRecipes(List<Recipe> recipes) { this.recipes = recipes; }

    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }

    public List<Like> getLikes() { return likes; }
    public void setLikes(List<Like> likes) { this.likes = likes; }
}
