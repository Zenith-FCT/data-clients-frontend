import { Observable } from "rxjs";
import { TotalBillingPerProductModel } from "./total-billing-per-product.model";
import { TotalSalesPerProductModel } from "./total-sales-per-product.model";

export interface IProductsRepository {
    getTotalBillingPerProduct(): Observable<TotalBillingPerProductModel[]>;
    getTotalSalesPerProduct(): Observable<TotalSalesPerProductModel[]>;
}