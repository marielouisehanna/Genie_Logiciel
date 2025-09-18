package com.flavorshare.repo;

import com.flavorshare.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
  boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);
}
