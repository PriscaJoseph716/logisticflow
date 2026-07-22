/** One full cement truck/car load. Supplier buying/selling prices are for this whole load. */
export const BAGS_PER_TRUCK_LOAD = 600;

/**
 * Supplier selling price is for ONE full truck (600 bags), not per bag.
 * Invoice total = truck selling price × (bags ÷ 600).
 *
 * Examples:
 * - 600 bags @ 145,000 → 145,000
 * - 1,200 bags @ 145,000 → 290,000
 * Never: bags × sellingPrice (that was the old bug).
 */
export function calculateTruckLoadInvoiceAmount(
  quantityBags: number,
  truckSellingPrice: number,
  bagsPerTruck = BAGS_PER_TRUCK_LOAD,
) {
  const bags = Number(quantityBags);
  const price = Number(truckSellingPrice);
  if (!Number.isFinite(price) || price <= 0) return 0;
  // No bag quantity → bill one full truck.
  if (!Number.isFinite(bags) || bags <= 0) return price;
  return (bags / bagsPerTruck) * price;
}
