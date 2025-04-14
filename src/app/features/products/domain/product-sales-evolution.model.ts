/**
 * Interface for representing the sales evolution of products over time
 */
export interface ProductSalesEvolutionModel {
  /** Unique identifier for the product */
  productId: string;
  
  /** Name of the product */
  productName: string;
  
  /** Array of monthly sales data */
  monthlySales: MonthlySales[];
}

/**
 * Interface for monthly sales data
 */
export interface MonthlySales {
  /** Month in format 'YYYY-MM' */
  month: string;
  
  /** Number of units sold in that month */
  salesCount: number;
}
