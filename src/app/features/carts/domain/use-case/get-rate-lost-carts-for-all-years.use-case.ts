import { Observable, map, zip } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";
import { CartModel, TotalOrders } from "../models/carts.model";

export class GetRateLostCartsForAllYearsUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(): Observable<number> {
        // Usamos zip para combinar los dos observables: carts y orders
        return zip(
            this.cartsRepository.getCarts(),
            this.cartsRepository.getTotalOrders()
        ).pipe(
            map(([carts, orders]: [CartModel[], TotalOrders[]]) => {
                const totalAbandonedCarts = carts.reduce((sum, cart) => sum + parseFloat(cart.total), 0);
                
                const totalCompletedOrders = orders.reduce((sum, order) => sum + order.total, 0);
                
                if (totalAbandonedCarts + totalCompletedOrders === 0) {
                    return 0;
                }
                
                const abandonedRate = (totalAbandonedCarts / (totalAbandonedCarts + totalCompletedOrders)) * 100;
                
                return parseFloat(abandonedRate.toFixed(2));
            })
        );
    }
}