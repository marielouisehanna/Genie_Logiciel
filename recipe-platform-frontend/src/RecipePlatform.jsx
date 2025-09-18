import React, { useEffect, useMemo, useState } from "react";
import {
  Heart, Search, Plus, Star, Clock, Users, ChefHat, BookOpen, Filter, ArrowLeft,
  MessageCircle, User, LogIn, LogOut, Eye, EyeOff, Settings, Award, ThumbsUp, Edit3, Camera, Save, X
} from "lucide-react";

// ===== API base
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
// Add this function near the top of the component
// Replace the isValidImageUrl function with this simpler version:
const isValidImageUrl = (url) => {
  return url && url.trim().length > 0 && url.startsWith('http');
};
// Real food images
const foodImages = {
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop",
  cookies: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&q=80&auto=format&fit=crop",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&auto=format&fit=crop",
  sushi: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80&auto=format&fit=crop",
  soup: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&q=80&auto=format&fit=crop",};

// local demo users
const sampleUsers = [
  { id: 1, username: "chef_sarah", email: "sarah@example.com", fullName: "Chef Sarah", password: "SecurePass123!" },
  { id: 2, username: "baker_mike", email: "mike@example.com", fullName: "Baker Mike", password: "BakeLife456@" },
  { id: 3, username: "chef_giovanni", email: "giovanni@example.com", fullName: "Chef Giovanni", password: "PastaLover789#" },
];

// email/password validators
const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

export default function RecipePlatform() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showEditRecipe, setShowEditRecipe] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchState, setFetchState] = useState({ loading: true, error: null });

  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [currentView, setCurrentView] = useState("home");

  const [newRecipe, setNewRecipe] = useState({
    title: "", description: "", cookTime: "", servings: "",
    difficulty: "EASY", category: "MAIN_COURSE",
    ingredients: [""], instructions: [""], image: ""
  });

  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "", fullName: "" });

  // categories
  const categories = [
    { value: "All", label: "All" },
    { value: "MAIN_COURSE", label: "Main Course" },
    { value: "DESSERT", label: "Dessert" },
    { value: "HEALTHY", label: "Healthy" },
    { value: "BREAKFAST", label: "Breakfast" },
    { value: "SNACK", label: "Snack" },
    { value: "APPETIZER", label: "Appetizer" },
    { value: "SOUP", label: "Soup" },
    { value: "SALAD", label: "Salad" }
  ];

  const difficulties = [
    { value: "EASY", label: "Easy" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HARD", label: "Hard" }
  ];

  // map backend recipe -> frontend shape
  const mapServerRecipe = (r) => {
    const nice = (s) => (typeof s === "string" ? s.toLowerCase().split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") : s);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      cookTime: r.cookTime,
      servings: r.servings,
      difficulty: r.difficulty ? nice(r.difficulty) : "Easy",
      category: r.category ? nice(r.category) : "Main Course",
      rating: typeof r.averageRating === "number" ? Number(r.averageRating.toFixed(1)) : 0,
      reviews: typeof r.reviewCount === "number" ? r.reviewCount : (r.reviews?.length || 0),
      image: r.image || foodImages.default,
      authorId: r.author?.id,
      author: r.author?.fullName || r.author?.username || "Unknown",
      ingredients: r.ingredients || [],
      instructions: r.instructions || [],
      liked: false,
      comments: (r.reviews || []).map((rev) => ({
        id: rev.id,
        userId: rev.user?.id,
        username: rev.user?.username || "user",
        text: rev.comment,
        timestamp: rev.createdAt || "recently",
      })),
    };
  };

  // fetch from backend
  const fetchRecipes = async () => {
    try {
      setFetchState({ loading: true, error: null });
      const res = await fetch(`${API_BASE}/api/recipes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const mapped = Array.isArray(data) ? data.map(mapServerRecipe) : [];
      setRecipes(mapped);
      setFetchState({ loading: false, error: null });
    } catch (e) {
      console.warn("API error:", e);
      setFetchState({ loading: false, error: e.message || "Failed to load recipes" });
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setCurrentUser(JSON.parse(stored));
    fetchRecipes();
  }, []);

  // search + filter
  const filteredRecipes = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchesSearch = !s || r.title.toLowerCase().includes(s) || r.description.toLowerCase().includes(s);
      const matchesCategory = selectedCategory === "All" || r.category === categories.find(c => c.value === selectedCategory)?.label;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, selectedCategory]);

  // like toggle
  const toggleLike = (id) => {
    if (!currentUser) { setShowAuth(true); return; }
    setRecipes((prev) => prev.map(r => (r.id === id ? { ...r, liked: !r.liked } : r)));
    if (selectedRecipe?.id === id) setSelectedRecipe((sr) => ({ ...sr, liked: !sr.liked }));
  };

  // Create recipe
// In RecipePlatform.jsx, replace the handleCreateRecipe function:

const handleCreateRecipe = async () => {
  if (!currentUser) { setShowAuth(true); return; }
  if (!newRecipe.title.trim() || !newRecipe.description.trim()) {
    alert("Please fill in title and description");
    return;
  }

  setIsLoading(true);
  try {
    const recipeToSend = {
      ...newRecipe,
      cookTime: parseInt(newRecipe.cookTime) || 30,
      servings: parseInt(newRecipe.servings) || 2,
      ingredients: newRecipe.ingredients.filter(i => i.trim()),
      instructions: newRecipe.instructions.filter(i => i.trim()),
      author: { id: currentUser.id },
image: newRecipe.image.trim() || foodImages.default
    };

    const response = await fetch(`${API_BASE}/api/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipeToSend)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    // Get the created recipe from response
    const createdRecipe = await response.json();
    
    // Add the new recipe to the existing list immediately
    const mappedRecipe = mapServerRecipe(createdRecipe);
    setRecipes(prevRecipes => [mappedRecipe, ...prevRecipes]);
    
    // Reset form and close modal
    setNewRecipe({
      title: "", description: "", cookTime: "", servings: "",
      difficulty: "EASY", category: "MAIN_COURSE",
      ingredients: [""], instructions: [""], image: ""
    });
    setShowAddRecipe(false);
    alert("Recipe created successfully!");
    
  } catch (error) {
    console.error("Error creating recipe:", error);
    alert(`Failed to create recipe: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  // Edit recipe
  const handleEditRecipe = (recipe) => {
    if (!currentUser || recipe.authorId !== currentUser.id) {
      alert("You can only edit your own recipes");
      return;
    }

    setEditingRecipe({
      ...recipe,
      difficulty: recipe.difficulty?.toUpperCase().replace(" ", "_") || "EASY",
      category: recipe.category?.toUpperCase().replace(" ", "_") || "MAIN_COURSE",
      ingredients: recipe.ingredients?.length ? recipe.ingredients : [""],
      instructions: recipe.instructions?.length ? recipe.instructions : [""]
    });
    setShowEditRecipe(true);
  };

  const handleUpdateRecipe = async () => {
    if (!editingRecipe || !currentUser) return;

    setIsLoading(true);
    try {
      const recipeToSend = {
        ...editingRecipe,
        cookTime: parseInt(editingRecipe.cookTime) || 30,
        servings: parseInt(editingRecipe.servings) || 2,
        ingredients: editingRecipe.ingredients.filter(i => i.trim()),
        instructions: editingRecipe.instructions.filter(i => i.trim()),
        image: editingRecipe.image.trim() || foodImages.default
      };

      const response = await fetch(`${API_BASE}/api/recipes/${editingRecipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeToSend)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      await fetchRecipes(); // Refresh recipes list
      setShowEditRecipe(false);
      setEditingRecipe(null);
      if (selectedRecipe?.id === editingRecipe.id) {
        const updatedRecipe = recipes.find(r => r.id === editingRecipe.id);
        if (updatedRecipe) setSelectedRecipe(updatedRecipe);
      }
      alert("Recipe updated successfully!");
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert(`Failed to update recipe: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  // Add recipe deletion function
const handleDeleteRecipe = async (recipeId) => {
  if (!currentUser) {
    alert("Please log in to delete recipes");
    return;
  }

  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe || recipe.authorId !== currentUser.id) {
    alert("You can only delete your own recipes");
    return;
  }

  if (!confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
    return;
  }

  setIsLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/recipes/${recipeId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Remove recipe from state
    setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== recipeId));
    
    // Close recipe detail if it's the deleted recipe
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe(null);
    }

    alert("Recipe deleted successfully!");
  } catch (error) {
    console.error("Error deleting recipe:", error);
    alert(`Failed to delete recipe: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  // auth functions
  const handleLogin = async () => {
    if (!isValidEmail(authForm.email)) { alert("Please enter a valid email address"); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const user = sampleUsers.find(u => u.email === authForm.email && u.password === authForm.password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      setShowAuth(false);
      setAuthForm({ username: "", email: "", password: "", fullName: "" });
    } else {
      alert("Invalid email or password");
    }
    setIsLoading(false);
  };

  const handleSignup = async () => {
    const { username, email, password, fullName } = authForm;
    if (!username || !email || !password || !fullName) { alert("Please fill all fields"); return; }
    if (!isValidEmail(email)) { alert("Please enter a valid email"); return; }
    if (!isValidPassword(password)) {
      alert("Password must be 8+ chars and include upper/lower/number/special."); return;
    }
    if (sampleUsers.find(u => u.email === email)) { alert("Email already exists"); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const newUser = { id: sampleUsers.length + 1, username, email, password, fullName };
    sampleUsers.push(newUser);
    setCurrentUser(newUser);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setShowAuth(false);
    setAuthForm({ username: "", email: "", password: "", fullName: "" });
    setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setCurrentView("home");
  };

  // comments
  const addComment = (recipeId) => {
    if (!currentUser) { setShowAuth(true); return; }
    const text = newComment.trim();
    if (!text) return;
    const comment = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      text,
      timestamp: "now",
    };
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, comments: [comment, ...(r.comments || [])] } : r))
    );
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe((sr) => ({ ...sr, comments: [comment, ...(sr.comments || [])] }));
    }
    setNewComment("");
  };

  // profile stats
  const getUserStats = () => {
    if (!currentUser) return { recipes: [], comments: [], likes: [], totalLikes: 0 };
    const userRecipes = recipes.filter(r => r.authorId === currentUser.id);
    const userComments = recipes.flatMap((r) =>
      (r.comments || [])
        .filter(c => c.userId === currentUser.id)
        .map(c => ({ ...c, recipeTitle: r.title, recipeId: r.id }))
    );
    const userLikes = recipes.filter(r => r.liked);
    const totalLikes = userRecipes.reduce((sum, r) => sum + (r.likeCount || r.likes?.length || 0), 0);
    return { recipes: userRecipes, comments: userComments, likes: userLikes, totalLikes };
  };

  // Recipe Modal Component
  const RecipeModal = ({ recipe, isEdit, onSave, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            {isEdit ? <Edit3 className="h-6 w-6 text-stone-600" /> : <BookOpen className="h-6 w-6 text-stone-600" />}
            <span>{isEdit ? "Edit Recipe" : "Share Your Recipe"}</span>
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Recipe Title"
              value={recipe.title}
              onChange={(e) => isEdit 
                ? setEditingRecipe({ ...editingRecipe, title: e.target.value })
                : setNewRecipe({ ...newRecipe, title: e.target.value })
              }
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
              required
            />
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={recipe.image}
              onChange={(e) => isEdit 
                ? setEditingRecipe({ ...editingRecipe, image: e.target.value })
                : setNewRecipe({ ...newRecipe, image: e.target.value })
              }
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
            />
          </div>

{recipe.image?.trim() && (
  <div className="w-full max-w-sm mx-auto">
    <img
      src={recipe.image}
      alt="Recipe preview"
      className="w-full h-48 object-cover rounded-lg border shadow-sm"
      onError={(e) => { 
        console.log('Image failed to load:', recipe.image);
        e.target.style.display = 'none'; 
      }}
      onLoad={(e) => { 
        console.log('Image loaded successfully:', recipe.image);
        e.target.style.display = 'block'; 
      }}
    />
  </div>
)}

          <textarea
            placeholder="Recipe Description"
            value={recipe.description}
            onChange={(e) => isEdit 
              ? setEditingRecipe({ ...editingRecipe, description: e.target.value })
              : setNewRecipe({ ...newRecipe, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none h-24"
            required
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="Cook Time (min)"
              value={recipe.cookTime}
              onChange={(e) => isEdit 
                ? setEditingRecipe({ ...editingRecipe, cookTime: e.target.value })
                : setNewRecipe({ ...newRecipe, cookTime: e.target.value })
              }
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Servings"
              value={recipe.servings}
              onChange={(e) => isEdit 
                ? setEditingRecipe({ ...editingRecipe, servings: e.target.value })
                : setNewRecipe({ ...newRecipe, servings: e.target.value })
              }
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
              required
            />
            <select
              value={recipe.difficulty}
              onChange={(e) => isEdit 
                ? setEditingRecipe({ ...editingRecipe, difficulty: e.target.value })
                : setNewRecipe({ ...newRecipe, difficulty: e.target.value })
              }
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
            >
              {difficulties.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <select
              value={recipe.category}
              onChange={(e) => isEdit 
                ? setEditingRecipe({ ...editingRecipe, category: e.target.value })
                : setNewRecipe({ ...newRecipe, category: e.target.value })
              }
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
            >
              {categories.slice(1).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Ingredients</h3>
            {(recipe.ingredients || []).map((ingredient, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder={`Ingredient ${i + 1}`}
                  value={ingredient}
                  onChange={(e) => {
                    const arr = [...recipe.ingredients];
                    arr[i] = e.target.value;
                    isEdit 
                      ? setEditingRecipe({ ...editingRecipe, ingredients: arr })
                      : setNewRecipe({ ...newRecipe, ingredients: arr });
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
                />
                {recipe.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const arr = recipe.ingredients.filter((_, idx) => idx !== i);
                      isEdit 
                        ? setEditingRecipe({ ...editingRecipe, ingredients: arr })
                        : setNewRecipe({ ...newRecipe, ingredients: arr });
                    }}
                    className="px-3 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const arr = [...recipe.ingredients, ""];
                isEdit 
                  ? setEditingRecipe({ ...editingRecipe, ingredients: arr })
                  : setNewRecipe({ ...newRecipe, ingredients: arr });
              }}
              className="text-stone-600 font-semibold hover:text-stone-800"
            >
              + Add Ingredient
            </button>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Instructions</h3>
            {(recipe.instructions || []).map((instruction, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <textarea
                  placeholder={`Step ${i + 1}`}
                  value={instruction}
                  onChange={(e) => {
                    const arr = [...recipe.instructions];
                    arr[i] = e.target.value;
                    isEdit 
                      ? setEditingRecipe({ ...editingRecipe, instructions: arr })
                      : setNewRecipe({ ...newRecipe, instructions: arr });
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none h-20"
                />
                {recipe.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const arr = recipe.instructions.filter((_, idx) => idx !== i);
                      isEdit 
                        ? setEditingRecipe({ ...editingRecipe, instructions: arr })
                        : setNewRecipe({ ...newRecipe, instructions: arr });
                    }}
                    className="px-3 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const arr = [...recipe.instructions, ""];
                isEdit 
                  ? setEditingRecipe({ ...editingRecipe, instructions: arr })
                  : setNewRecipe({ ...newRecipe, instructions: arr });
              }}
              className="text-stone-600 font-semibold hover:text-stone-800"
            >
              + Add Step
            </button>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              onClick={onSave}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-stone-600 to-gray-700 text-white py-3 rounded-xl font-semibold disabled:opacity-70 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEdit ? "Update Recipe" : "Share Recipe"}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Profile Page Component
  const ProfilePage = () => {
    const userStats = getUserStats();
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50">
        <div className="bg-white/80 backdrop-blur-md shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-stone-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-12 w-12 text-stone-600" />
                </div>
                <div className="absolute inset-0 bg-stone-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{currentUser?.fullName || "User"}</h1>
                <p className="text-gray-600">@{currentUser?.username}</p>
                <p className="text-gray-500">{currentUser?.email}</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700">
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className="ml-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >   
                ← Home
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <StatCard title="Recipes" value={userStats.recipes.length} color="from-blue-500 to-blue-600" icon={<ChefHat className="h-8 w-8 text-blue-200" />} />
              <StatCard title="Comments" value={userStats.comments.length} color="from-green-500 to-green-600" icon={<MessageCircle className="h-8 w-8 text-green-200" />} />
              <StatCard title="Liked Recipes" value={userStats.likes.length} color="from-red-500 to-red-600" icon={<Heart className="h-8 w-8 text-red-200" />} />
              <StatCard title="Total Likes" value={userStats.totalLikes} color="from-amber-500 to-amber-600" icon={<ThumbsUp className="h-8 w-8 text-amber-200" />} />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Section title="My Recipes" icon={<Award className="h-6 w-6 text-stone-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStats.recipes.map((r) => (
                <div key={r.id} className="relative">
                  <MiniRecipeCard recipe={r} onClick={() => setSelectedRecipe(r)} />
                  <button
                    onClick={() => handleEditRecipe(r)}
                    className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                  >
                    <Edit3 className="h-4 w-4 text-stone-600" />
                  </button>
                </div>
              ))}
              {!userStats.recipes.length && <Empty icon={<ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-300" />} text="No recipes yet. Start sharing your culinary creations!" />}
            </div>
          </Section>

          <Section title="My Comments" icon={<MessageCircle className="h-6 w-6 text-stone-600" />}>
            <div className="space-y-4">
              {userStats.comments.map((c) => (
                <div key={c.id} className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">On: {c.recipeTitle}</h3>
                    <span className="text-sm text-gray-500">{c.timestamp}</span>
                  </div>
                  <p className="text-gray-700">{c.text}</p>
                </div>
              ))}
              {!userStats.comments.length && <Empty icon={<MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />} text="No comments yet. Start engaging with the community!" />}
            </div>
          </Section>

          <Section title="Liked Recipes" icon={<Heart className="h-6 w-6 text-stone-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStats.likes.map((r) => <MiniRecipeCard key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} liked />)}
              {!userStats.likes.length && <Empty icon={<Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />} text="No liked recipes yet. Discover and like some amazing recipes!" />}
            </div>
          </Section>
        </div>
      </div>
    );
  };

  // Helper Components
  const StatCard = ({ title, value, color, icon }) => (
    <div className={`bg-gradient-to-r ${color} p-6 rounded-xl text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );

  const Section = ({ title, icon, children }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
        {icon}<span>{title}</span>
      </h2>
      {children}
    </div>
  );

  const Empty = ({ icon, text }) => (
    <div className="col-span-full text-center py-12 text-gray-500">
      {icon}
      <p>{text}</p>
    </div>
  );

  const MiniRecipeCard = ({ recipe, onClick, liked }) => (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer" onClick={onClick}>
      <div className="h-48 rounded-t-xl bg-cover bg-center" style={{ backgroundImage: `url(${recipe.image})` }}>
        <div className="h-full bg-gradient-to-t from-black/50 to-transparent rounded-t-xl flex items-end p-4">
          <span className="text-white font-semibold">{recipe.title}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>{recipe.cookTime} min</span></div>
          <div className="flex items-center space-x-1"><MessageCircle className="h-4 w-4" /><span>{recipe.comments?.length || 0}</span></div>
          {liked && <div className="flex items-center space-x-1"><Heart className="h-4 w-4 text-red-500" /><span>Liked</span></div>}
        </div>
      </div>
    </div>
  );

  // ROUTES
  if (currentView === "profile") return <ProfilePage />;

  if (selectedRecipe) {
    const r = selectedRecipe;
    const canEdit = currentUser && r.authorId === currentUser.id;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50">
        <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setSelectedRecipe(null)} className="p-2 rounded-full hover:bg-gray-100">
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{r.title}</h1>
              </div>
{canEdit && (
  <div className="flex space-x-2">
    <button
      onClick={() => handleEditRecipe(r)}
      className="flex items-center space-x-2 px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700"
    >
      <Edit3 className="h-4 w-4" />
      <span>Edit Recipe</span>
    </button>
    <button
      onClick={() => handleDeleteRecipe(r.id)}
      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
      <X className="h-4 w-4" />
      <span>Delete</span>
    </button>
  </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="h-64 rounded-xl bg-cover bg-center shadow-lg" style={{ backgroundImage: `url(${r.image})` }}>
                  <div className="h-full bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
                </div>
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2"><Clock className="h-5 w-5 text-gray-500" /><span className="text-gray-600">{r.cookTime} min</span></div>
                    <div className="flex items-center space-x-2"><Users className="h-5 w-5 text-gray-500" /><span className="text-gray-600">{r.servings} servings</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm font-medium">{r.difficulty}</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{r.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2"><Star className="h-5 w-5 text-amber-400" /><span className="font-semibold">{r.rating || 0}</span><span className="text-gray-500">({r.reviews || 0})</span></div>
                    <button onClick={() => toggleLike(r.id)} className="p-2 rounded-full hover:bg-gray-100">
                      <Heart className={`h-6 w-6 ${r.liked ? "text-red-500 fill-current" : "text-gray-400"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:w-2/3">
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">{r.description}</p>
                <p className="text-gray-500">by <span className="font-semibold text-gray-700">{r.author}</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ingredients</h2>
            <ul className="space-y-3">
              {(r.ingredients || []).map((ing, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-stone-400 rounded-full mt-2"></div>
                  <span className="text-gray-700">{ing}</span>
                </li>
              ))}
              {!r.ingredients?.length && <p className="text-gray-500">No ingredients listed.</p>}
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Instructions</h2>
            <ol className="space-y-4">
              {(r.instructions || []).map((step, i) => (
                <li key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-stone-100 text-stone-700 rounded-full flex items-center justify-center font-semibold text-sm">{i + 1}</div>
                  <p className="text-gray-700 leading-relaxed">{step}</p>
                </li>
              ))}
              {!r.instructions?.length && <p className="text-gray-500">No instructions provided.</p>}
            </ol>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <MessageCircle className="h-6 w-6" />
              <span>Comments ({r.comments?.length || 0})</span>
            </h2>

            {currentUser ? (
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-stone-600" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this recipe..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-stone-400 outline-none resize-none"
                      rows="3"
                    />
                    <button onClick={() => addComment(r.id)} className="mt-2 px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700">
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-600 mb-4">Please log in to comment</p>
                <button onClick={() => setShowAuth(true)} className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700">
                  Login
                </button>
              </div>
            )}

            <div className="space-y-4">
              {(r.comments || []).map((c) => (
                <div key={c.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                  <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-stone-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-800">@{c.username}</span>
                      <span className="text-gray-500 text-sm">{c.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{c.text}</p>
                  </div>
                </div>
              ))}
              {!r.comments?.length && <p className="text-gray-500">No comments yet.</p>}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // HOME VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-stone-600 to-gray-700 p-2 rounded-full">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-700 to-gray-700 bg-clip-text text-transparent">
                  FlavorShare
                </h1>
                <p className="text-sm text-gray-600">Share your culinary adventures</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {currentUser.fullName}</span>
                  <button onClick={() => setCurrentView("profile")} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                    <Settings className="h-5 w-5" />
                    <span>Profile</span>
                  </button>
                  <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                  <button onClick={() => setShowAddRecipe(true)} className="flex items-center space-x-2 bg-gradient-to-r from-stone-600 to-gray-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg">
                    <Plus className="h-5 w-5" />
                    <span>Add Recipe</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="flex items-center space-x-2 bg-gradient-to-r from-stone-600 to-gray-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg">
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text" 
                placeholder="Search for delicious recipes..."
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none"
              >
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          {fetchState.loading && <p className="text-gray-500 pt-2">Loading recipes…</p>}
          {fetchState.error && <p className="text-red-600 pt-2">Using demo data (API error: {fetchState.error})</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((r) => (
            <div key={r.id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer">
              <div className="relative" onClick={() => setSelectedRecipe(r)}>
<div className="h-48 bg-gray-200 bg-cover bg-center relative" style={{ backgroundImage: r.image ? `url(${r.image})` : 'none' }}>
  {!r.image && (
    <div className="h-full flex items-center justify-center">
      <span className="text-gray-500">No Image</span>
    </div>
  )}
  <div className="h-full bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(r.id); }}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg"
                >
                  <Heart className={`h-5 w-5 ${r.liked ? "text-red-500 fill-current" : "text-gray-400"}`} />
                </button>
                <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm font-semibold text-stone-700">
                  {r.category}
                </div>
              </div>

              <div className="p-6" onClick={() => setSelectedRecipe(r)}>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{r.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{r.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>{r.cookTime} min</span></div>
                  <div className="flex items-center space-x-1"><Users className="h-4 w-4" /><span>{r.servings} servings</span></div>
                  <div className="flex items-center space-x-1"><MessageCircle className="h-4 w-4" /><span>{r.comments?.length || 0}</span></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1"><Star className="h-4 w-4 text-amber-400" /><span className="text-sm font-semibold">{r.rating || 0}</span></div>
                    <span className="text-sm text-gray-500">({r.reviews || 0})</span>
                  </div>
                  <span className="text-sm text-stone-600 font-semibold">by {r.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <User className="h-6 w-6 text-stone-600" />
                <span>{authMode === "login" ? "Login" : "Sign Up"}</span>
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {authMode === "signup" && (
                <>
                  <input type="text" placeholder="Full Name" value={authForm.fullName} onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none" />
                  <input type="text" placeholder="Username" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none" />
                </>
              )}

              <input type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none" />

              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-stone-400 outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex space-x-4 pt-4">
                <button onClick={authMode === "login" ? handleLogin : handleSignup} disabled={isLoading} className="flex-1 bg-gradient-to-r from-stone-600 to-gray-700 text-white py-3 rounded-xl font-semibold disabled:opacity-70">
                  {isLoading ? "Processing..." : authMode === "login" ? "Login" : "Sign Up"}
                </button>
                <button type="button" onClick={() => setShowAuth(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200">
                  Cancel
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                  <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="ml-2 text-stone-600 font-semibold">
                    {authMode === "login" ? "Sign Up" : "Login"}
                  </button>
                </p>
                {authMode === "login" && <p className="text-sm text-gray-500 mt-2">Demo: sarah@example.com / SecurePass123!</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddRecipe && (
        <RecipeModal
          recipe={newRecipe}
          isEdit={false}
          onSave={handleCreateRecipe}
          onClose={() => setShowAddRecipe(false)}
        />
      )}

      {/* Edit Recipe Modal */}
      {showEditRecipe && editingRecipe && (
        <RecipeModal
          recipe={editingRecipe}
          isEdit={true}
          onSave={handleUpdateRecipe}
          onClose={() => {
            setShowEditRecipe(false);
            setEditingRecipe(null);
          }}
        />
      )}

      {/* Utilities */}
      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}