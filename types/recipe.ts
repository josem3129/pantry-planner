// src/types/recipe.ts
export interface RecipeIngredient {
  /** If you link to a pantry item: use this id (string) */
  pantryItemId?: string;
  /** Human-readable name (optional when pantryItemId exists) */
  name?: string;
  quantity: number;
  unit?: string;
}

export interface Recipe {
  id?: string;
  title: string;
  servings?: number;
  ingredients: RecipeIngredient[];
  instructions?: string;
  category?: string;
}
