package com.flavorshare.repo;

import com.flavorshare.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {}
