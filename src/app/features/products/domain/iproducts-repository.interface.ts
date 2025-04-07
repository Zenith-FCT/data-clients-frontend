import { Observable } from "rxjs";
import { TotalBillingPerProductModel } from "./total-billing-per-product.model";

export interface IProductsRepository {
    getTotalBillingPerProduct(): Observable<TotalBillingPerProductModel[]>;
}