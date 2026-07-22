/** One full cement truck load. Supplier prices are for this whole load. */
export const BAGS_PER_TRUCK_LOAD = 600;

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * Invoice / sale amount for bags at the truck selling price.
 * sellingPrice is per full truck (600 bags), not per bag.
 */
export function calculateTruckLoadAmount(quantityBags, truckPrice) {
  const bags = money(quantityBags);
  const price = money(truckPrice);
  if (price <= 0) return 0;
  if (bags <= 0) return price;
  return (bags / BAGS_PER_TRUCK_LOAD) * price;
}

/**
 * Profit for a shipment: (selling − buying) × truck loads.
 * Prices are per full truck of 600 bags.
 */
export function calculateShipmentProfit({
  quantityBags,
  buyingPrice,
  sellingPrice,
}) {
  const bags = money(quantityBags);
  const buy = money(buyingPrice);
  const sell = money(sellingPrice);
  if (sell <= 0) return 0;
  const truckLoads = bags > 0 ? bags / BAGS_PER_TRUCK_LOAD : 1;
  return (sell - buy) * truckLoads;
}

/** Profit per one full truck for a supplier. */
export function calculateTruckProfit(buyingPrice, sellingPrice) {
  return money(sellingPrice) - money(buyingPrice);
}
