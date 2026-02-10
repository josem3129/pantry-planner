export interface FoodProduct {
    barcode: string;
    name: string;
    brand?: string;
    quantity?: number;
    unit?: string;
}
// The lookupProductByBarcode function takes a barcode as input and queries the Open Food Facts API to retrieve product information. 
// It returns a FoodProduct object containing details such as the product name, brand, quantity, and unit if the product is found, 
// or null if the product is not found or if an error occurs during the fetch operation.
export async function lookupProductByBarcode(barcode: string): Promise<FoodProduct | null> {
  try {
    // 1. Use the Production API URL (v2)
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        // 2. REQUIRED: Custom User-Agent (AppName/Version (Email))
        // This prevents you from being identified as a bot and blocked.
        'User-Agent': 'Pantry-Planner/1.0 (josem3129@gmail.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // 3. Documentation check: Status 1 (or 'product_found' in v2) means success.
    if (!data.product || data.status === 0) {
      console.log("Product not found in Open Food Facts database.");
      return null;
    }

    const p = data.product;
    console.log("Fetched product data:", p);
    return {
    barcode,
    // API returns 'product_name', your app wants 'name'
    name: p.product_name || p.generic_name || "Unknown Product", 
    
    // API returns numeric quantity as 'product_quantity'
    quantity: p.product_quantity ? Number(p.product_quantity) : 0,
    
    // API returns unit as 'product_quantity_unit' (e.g., "g")
    unit: p.product_quantity_unit || "pcs",
    
    brand: p.brands,
};
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}