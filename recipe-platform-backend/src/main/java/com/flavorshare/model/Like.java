package com.flavorshare.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity @Table(name="likes",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","recipe_id"}))
@JsonIgnoreProperties({"recipe","user"})
public class Like {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id")
  private User user;

  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="recipe_id")
  private Recipe recipe;

  public Long getId(){ return id; }
  public void setId(Long id){ this.id = id; }
  public User getUser(){ return user; }
  public void setUser(User user){ this.user = user; }
  public Recipe getRecipe(){ return recipe; }
  public void setRecipe(Recipe recipe){ this.recipe = recipe; }
}
