export type ScannedItemDraft = {
  name: string;
  quantity: number;   // numeric quantity
  unit: string;       // "pcs", "g", etc.
  count?: number;     // optional, for multi-pack
  barcode?: string | null;
  source: "barcode";
};
