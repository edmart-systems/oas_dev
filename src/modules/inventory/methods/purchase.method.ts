export const calculateProductStatus = (
  currentQuantity: number,
  minQuantity: number | null,
  maxQuantity: number | null
): number => {
  if (!minQuantity) return 1;
  
  if (currentQuantity <= minQuantity) return 1; // Low
  
  if (!maxQuantity) {
    // If only minQuantity is provided, use it as threshold
    return currentQuantity > minQuantity * 2 ? 3 : 2; // High if > 2x min, else Moderate
  }
  
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

// Purchase calculation methods
export const calculatePurchaseTotals = (items: any[]) => {
  const totalCost = items.reduce((sum, item) => sum + item.total_cost, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalUnitCost = totalQuantity ? totalCost / totalQuantity : 0;
  
  return { totalCost, totalQuantity, totalUnitCost };
};

// Sale calculation methods
export const calculateSaleTotals = (items: any[]) => {
  const sale_total_amount = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const sale_total_discount = items.reduce((sum, i) => sum + i.discount, 0);
  const sale_total_tax = items.reduce((sum, i) => sum + i.tax, 0);
  const sale_net_amount = sale_total_amount - sale_total_discount;
  const sale_grand_total = sale_net_amount + sale_total_tax;
  
  return {
    sale_total_amount,
    sale_total_discount,
    sale_total_tax,
    sale_net_amount,
    sale_grand_total
  };
};

export const updateProductWithCalculations = (
  productData: any,
  quantity?: number,
  minQuantity?: number | null,
  maxQuantity?: number | null,
  buyingPrice?: number,
  sellingPrice?: number
) => {
  const updatedData = { ...productData };
  
  // Calculate product status if quantity data is provided
  if (quantity !== undefined && (minQuantity !== undefined || maxQuantity !== undefined)) {
    updatedData.product_status = calculateProductStatus(quantity, minQuantity || null, maxQuantity || null);
  }
  
  // Calculate markup percentage if price data is provided
  if (buyingPrice !== undefined && sellingPrice !== undefined) {
    updatedData.markup_percentage = calculateMarkupPercentage(buyingPrice, sellingPrice);
  }
  
  return updatedData;
};