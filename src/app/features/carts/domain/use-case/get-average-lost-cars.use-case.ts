import { Observable, combineLatest, map } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";

export class GetAverageLostCarsUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(year: number): Observable<number> {
        return combineLatest([
            this.cartsRepository.getCarts(),
            this.cartsRepository.getTotalOrders()
        ]).pipe(
            map(([carts, totalOrders]) => {
                // Filter by year only
                const filteredCarts = carts.filter(cart => {
                    const cartYear = parseInt(cart.date.split('-')[0]);
                    return cartYear === year;
                });
                
                const filteredOrders = totalOrders.filter(order => {
                    const orderYear = parseInt(order.date.split('-')[0]);
                    return orderYear === year;
                });

                const abandonedCartsTotal = filteredCarts.reduce((sum, cart) => {
                    const value = parseFloat(cart.total);
                    return sum + (isNaN(value) ? 0 : value);
                }, 0);
                
                const totalCompletedOrders = filteredOrders.reduce((sum, order) => {
                    return sum + (order.total || 0);
                }, 0);

                if (totalCompletedOrders === 0) {
                    return 0;
                }
                
                const percentage = (abandonedCartsTotal / totalCompletedOrders) * 100;
                return Math.round(percentage * 100) / 100;
            })
        );
    }
}