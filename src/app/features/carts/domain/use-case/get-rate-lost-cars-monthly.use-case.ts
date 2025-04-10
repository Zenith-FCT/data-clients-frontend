import { Observable, combineLatest, map } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";

export class GetRateLostCartsMonthlyUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(year: number, month: number): Observable<number> {
        return combineLatest([
            this.cartsRepository.getCarts(),
            this.cartsRepository.getTotalOrders()
        ]).pipe(
            map(([carts, totalOrders]) => {
                const filteredCarts = carts.filter(cart => {
                    const [cartYear, cartMonth] = cart.date.split('-').map(Number);
                    return cartYear === year && cartMonth === month;
                });
                
                const filteredOrders = totalOrders.filter(order => {
                    const [orderYear, orderMonth] = order.date.split('-').map(Number);
                    return orderYear === year && orderMonth === month;
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
                
                const percentage = (abandonedCartsTotal / (totalCompletedOrders+abandonedCartsTotal)) * 100;
                return Math.round(percentage * 100) / 100;
            })
        );
    }
}