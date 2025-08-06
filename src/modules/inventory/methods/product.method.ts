export const calculateProductStatus = (
  currentQuantity: number,
  minQuantity: number | null,
  maxQuantity: number | null
): number => {
  if (!minQuantity || !maxQuantity) return 1;
  
  if (currentQuantity <= minQuantity) return 1; // Low
  if (currentQuantity >= maxQuantity) return 3; // High
  return 2; // Moderate
};

export const calculateMarkupPercentage = (
  buyingPrice: number,
  sellingPrice: number
): number => {
  if (buyingPrice === 0) return 0;
  return Math.round(((sellingPrice - buyingPrice) / buyingPrice) * 100);
};