package com.flavorshare.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity @Table(name="reviews")
@JsonIgnoreProperties({"recipe","user"})
public class Review {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Min(1) @Max(5) private int rating;
  @NotBlank @Column(length=1000) private String comment;

  private LocalDateTime createdAt;

  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="recipe_id")
  private Recipe recipe;

  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id")
  private User user;

  @PrePersist protected void onCreate(){ createdAt = LocalDateTime.now(); }

  public Long getId(){ return id; }
  public void setId(Long id){ this.id = id; }
  public int getRating(){ return rating; }
  public void setRating(int rating){ this.rating = rating; }
  public String getComment(){ return comment; }
  public void setComment(String comment){ this.comment = comment; }
  public LocalDateTime getCreatedAt(){ return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt){ this.createdAt = createdAt; }
  public Recipe getRecipe(){ return recipe; }
  public void setRecipe(Recipe recipe){ this.recipe = recipe; }
  public User getUser(){ return user; }
  public void setUser(User user){ this.user = user; }
}
