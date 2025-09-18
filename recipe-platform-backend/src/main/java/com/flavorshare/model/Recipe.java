package com.flavorshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "recipes")
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 200)
    private String title;

    @NotBlank
    @Column(length = 1000)
    private String description;

    @ElementCollection
    @CollectionTable(name = "recipe_ingredients", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "ingredient")
    private List<String> ingredients;

    @ElementCollection
    @CollectionTable(name = "recipe_instructions", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "instruction", length = 2000)
    private List<String> instructions;

    @NotNull @Positive
    private Integer cookTime;

    @NotNull @Positive
    private Integer servings;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    private Category category;

    private String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({"recipes", "reviews", "likes", "password"}) // show basic author info only
    private User author;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // break cycles, keep payload light
    private List<Review> reviews;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // break cycles, keep payload light
    private List<Like> likes;

    public enum Difficulty { EASY, MEDIUM, HARD }
    public enum Category { MAIN_COURSE, DESSERT, HEALTHY, BREAKFAST, SNACK, APPETIZER, SOUP, SALAD }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Recipe() {}

    public Recipe(String title, String description, User author) {
        this.title = title;
        this.description = description;
        this.author = author;
    }

    // Convenience (not serialized due to @JsonIgnore on collections)
    public double getAverageRating() {
        if (reviews == null || reviews.isEmpty()) return 0.0;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }
    public int getReviewCount() { return reviews != null ? reviews.size() : 0; }
    public int getLikeCount() { return likes != null ? likes.size() : 0; }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getIngredients() { return ingredients; }
    public void setIngredients(List<String> ingredients) { this.ingredients = ingredients; }

    public List<String> getInstructions() { return instructions; }
    public void setInstructions(List<String> instructions) { this.instructions = instructions; }

    public Integer getCookTime() { return cookTime; }
    public void setCookTime(Integer cookTime) { this.cookTime = cookTime; }

    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }

    public List<Like> getLikes() { return likes; }
    public void setLikes(List<Like> likes) { this.likes = likes; }
}
