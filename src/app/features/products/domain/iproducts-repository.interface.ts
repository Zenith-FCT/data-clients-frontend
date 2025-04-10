import { Observable } from "rxjs";
import { TotalBillingPerProductModel } from "./total-billing-per-product.model";
import { TotalSalesPerProductModel } from "./total-sales-per-product.model";
import { TopProductModel } from "./top-products.model";

export interface IProductsRepository {
    getTotalBillingPerProduct(): Observable<TotalBillingPerProductModel[]>;
    getTotalSalesPerProduct(): Observable<TotalSalesPerProductModel[]>;
    getTopProducts(): Observable<TopProductModel[]>;
}