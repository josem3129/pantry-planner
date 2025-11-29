"use client";

import { useEffect, useState } from "react";
import { PantryItem, subscribeToPantry } from "@/lib/pantry";
import {
  Recipe,
  addRecipe,
  deleteRecipe,
  subscribeToRecipes,
} from "@/lib/recipes";

export default function RecipesPage() {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [newRecipe, setNewRecipe] = useState({
    name: "",
    description: "",
    ingredients: [] as { pantryItemId: string; quantity: number }[],
  });

  // Load pantry (for ingredient selection)
  useEffect(() => {
    const unsub = subscribeToPantry((items) => setPantry(items));
    return () => unsub();
  }, []);

  // Load recipes (real-time)
  useEffect(() => {
    const unsub = subscribeToRecipes((items) => setRecipes(items));
    return () => unsub();
  }, []);

  function addIngredientField() {
    setNewRecipe({
      ...newRecipe,
      ingredients: [
        ...newRecipe.ingredients,
        { pantryItemId: pantry[0]?.id || "", quantity: 1 },
      ],
    });
  }

  function updateIngredient(index: number, key: string, value: string | number) {
    const updated = [...newRecipe.ingredients];
    const ingredient = updated[index];
    if (key === "pantryItemId") {
      ingredient.pantryItemId = value as string;
    } else if (key === "quantity") {
      ingredient.quantity = value as number;
    }
    setNewRecipe({ ...newRecipe, ingredients: updated });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!newRecipe.name.trim()) return;

    await addRecipe({
      name: newRecipe.name,
      description: newRecipe.description,
      ingredients: newRecipe.ingredients.map((i) => ({
        pantryItemId: i.pantryItemId,
        quantity: Number(i.quantity),
      })),
    });

    // Reset form
    setNewRecipe({ name: "", description: "", ingredients: [] });
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Recipes</h1>

      {/* Create Recipe */}
      <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-3">Add New Recipe</h2>

        <input
          type="text"
          placeholder="Recipe name"
          value={newRecipe.name}
          onChange={(e) =>
            setNewRecipe({ ...newRecipe, name: e.target.value })
          }
          className="border p-2 rounded w-full mb-3"
        />

        <textarea
          placeholder="Description"
          value={newRecipe.description}
          onChange={(e) =>
            setNewRecipe({ ...newRecipe, description: e.target.value })
          }
          className="border p-2 rounded w-full mb-3"
        />

        <h3 className="font-semibold mb-2">Ingredients</h3>

        {newRecipe.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-3 mb-3">
            <select
              value={ingredient.pantryItemId}
              onChange={(e) =>
                updateIngredient(index, "pantryItemId", e.target.value)
              }
              className="border p-2 rounded w-1/2"
            >
              {pantry.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={ingredient.quantity}
              onChange={(e) =>
                updateIngredient(index, "quantity", Number(e.target.value))
              }
              className="border p-2 rounded w-1/2"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredientField}
          className="text-blue-600 font-semibold hover:underline mb-4 block"
        >
          + Add Ingredient
        </button>

        <button className="bg-green-600 text-white py-2 px-4 rounded">
          Save Recipe
        </button>
      </form>

      {/* Recipe List */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Saved Recipes</h2>

        {recipes.length === 0 ? (
          <p className="text-gray-600">No recipes yet.</p>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="border-b py-3 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{recipe.name}</h3>
                <p className="text-gray-600 text-sm">
                  {recipe.ingredients.length} ingredients
                </p>
              </div>

              <button
                onClick={() => deleteRecipe(recipe.id!)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
