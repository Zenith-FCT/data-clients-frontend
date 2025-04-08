import { Observable } from "rxjs";
import { CartModel, TotalOrders } from "../models/carts.model";

export interface CartsRepository {
    getCarts(): Observable<CartModel[]>;
    getTotalOrders(): Observable<TotalOrders[]>;
}