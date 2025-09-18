package com.flavorshare.util;

import com.flavorshare.model.Recipe;
import com.flavorshare.model.User;
import com.flavorshare.repo.RecipeRepository;
import com.flavorshare.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {
  private final UserRepository userRepository;
  private final RecipeRepository recipeRepository;

  public DataLoader(UserRepository userRepository, RecipeRepository recipeRepository) {
    this.userRepository = userRepository;
    this.recipeRepository = recipeRepository;
  }

  @Override
  public void run(String... args) {
    System.out.println("DataLoader starting...");
    System.out.println("Current recipe count: " + recipeRepository.count());
    
    if (recipeRepository.count() > 0) {
      System.out.println("Data already exists, skipping initialization");
      return;
    }

    System.out.println("Loading sample data...");

    // Create users first
    User sarah = new User("chef_sarah", "sarah@example.com", "SecurePass123!");
    sarah.setFullName("Chef Sarah");
    sarah = userRepository.save(sarah);
    System.out.println("Created user: " + sarah.getUsername());

    User mike = new User("baker_mike", "mike@example.com", "BakeLife456@");
    mike.setFullName("Baker Mike");
    mike = userRepository.save(mike);
    System.out.println("Created user: " + mike.getUsername());

    User giovanni = new User("chef_giovanni", "giovanni@example.com", "PastaLover789#");
    giovanni.setFullName("Chef Giovanni");
    giovanni = userRepository.save(giovanni);
    System.out.println("Created user: " + giovanni.getUsername());

    // Create recipes
    Recipe recipe1 = new Recipe("Rainbow Veggie Bowl", 
      "A colorful and nutritious bowl packed with fresh vegetables, quinoa, and a tangy tahini dressing.", 
      sarah);
    recipe1.setCookTime(25);
    recipe1.setServings(2);
    recipe1.setDifficulty(Recipe.Difficulty.EASY);
    recipe1.setCategory(Recipe.Category.HEALTHY);
    recipe1.setIngredients(List.of(
      "Mixed greens", "Cherry tomatoes", "Avocado", "Cooked quinoa", 
      "Chickpeas", "Red cabbage", "Tahini dressing"
    ));
    recipe1.setInstructions(List.of(
      "Cook quinoa according to package directions",
      "Prep all vegetables and wash greens",
      "Whisk tahini dressing ingredients together", 
      "Assemble bowl and drizzle with dressing"
    ));
    recipe1.setImage("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop");

    Recipe recipe2 = new Recipe("Chocolate Chip Cookies",
      "Soft and chewy cookies with crispy edges, loaded with chocolate chips.",
      mike);
    recipe2.setCookTime(15);
    recipe2.setServings(24);
    recipe2.setDifficulty(Recipe.Difficulty.EASY);
    recipe2.setCategory(Recipe.Category.DESSERT);
    recipe2.setIngredients(List.of(
      "All-purpose flour", "Baking soda", "Salt", "Butter", "White sugar",
      "Brown sugar", "Eggs", "Vanilla extract", "Chocolate chips"
    ));
    recipe2.setInstructions(List.of(
      "Preheat oven to 375°F",
      "Cream butter and sugars until fluffy",
      "Add eggs and vanilla, mix well",
      "Gradually fold in dry ingredients",
      "Stir in chocolate chips", 
      "Bake 9-11 minutes until golden"
    ));
    recipe2.setImage("https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop");

    Recipe recipe3 = new Recipe("Creamy Pasta Carbonara",
      "Classic Italian pasta with silky eggs, Parmesan, and crispy pancetta.",
      giovanni);
    recipe3.setCookTime(20);
    recipe3.setServings(4);
    recipe3.setDifficulty(Recipe.Difficulty.MEDIUM);
    recipe3.setCategory(Recipe.Category.MAIN_COURSE);
    recipe3.setIngredients(List.of(
      "Spaghetti", "Pancetta", "Large eggs", "Parmesan cheese", 
      "Garlic", "Black pepper", "Olive oil", "Salt"
    ));
    recipe3.setInstructions(List.of(
      "Boil pasta in salted water until al dente",
      "Crisp pancetta in large pan",
      "Whisk eggs with grated Parmesan",
      "Toss hot pasta with pancetta off heat",
      "Add egg mixture and pasta water, stirring quickly"
    ));
    recipe3.setImage("https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&q=80&auto=format&fit=crop");

    // Save all recipes
    recipeRepository.saveAll(List.of(recipe1, recipe2, recipe3));
    
    System.out.println("Sample data loaded successfully!");
    System.out.println("Final recipe count: " + recipeRepository.count());
  }
}