import { PantryItemDraft } from "@/types/pantry";
import { addPantryItem, findPantryItemByBarcode, updatePantryItem } from "@/lib/pantry";

export async function upsertPantryItem(userId: string, draft: PantryItemDraft) {
  // If scanned item has barcode, try to merge
  if (draft.barcode) {
    const existing = await findPantryItemByBarcode(userId, draft.barcode);
    console.log("Existing item found for barcode:", existing);
    if (existing && existing.id) {
        const newCount = (Number(existing.count) || 0) + (Number(draft.count) || 1);
      await updatePantryItem(userId, existing.id!, {
        count: newCount,
        quantity:
          existing.quantity && draft.quantity
            ? existing.quantity + draft.quantity
            : existing.quantity ?? draft.quantity,
      });
      return;
    }
  }

  // Otherwise create new
  await addPantryItem(userId, {
    name: draft.name,
    count: draft.count,
    quantity: draft.quantity ?? 0,
    unit: draft.unit ?? "",
    barcode: draft.barcode,
  });
}
