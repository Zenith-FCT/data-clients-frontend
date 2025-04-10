import { Observable } from "rxjs";
import { TopProductModel } from "../top-products.model";

/**
 * Interfaz que define las operaciones relacionadas con productos más vendidos
 */
export interface ProductsRepository {
    getTopProducts(): Observable<TopProductModel[]>;
}
