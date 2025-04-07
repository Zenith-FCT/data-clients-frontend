import { Observable } from "rxjs";
import { CartModel } from "../models/carts.model";

export interface CartsRepository {
    getCarts(): Observable<CartModel[]>;
}