import { Observable, combineLatest, map } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";

export class GetAverageLostCarsUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(): Observable<number> {
        return combineLatest([
            this.cartsRepository.getCarts(),
            this.cartsRepository.getTotalOrders()
        ]).pipe(
            map(([carts, totalOrders]) => {
                const abandonedCartsTotal = carts.reduce((sum, cart) => {
                    const value = parseFloat(cart.total);
                    return sum + (isNaN(value) ? 0 : value);
                }, 0);
                
                const totalCompletedOrders = totalOrders.reduce((sum, order) => {
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

    executeWithDate(year: number, month: number): Observable<number> {
        return combineLatest([
            this.cartsRepository.getCarts(),
            this.cartsRepository.getTotalOrders()
        ]).pipe(
            map(([carts, totalOrders]) => {
                const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
                
                const filteredCarts = carts.filter(cart => cart.date === yearMonth);
                const filteredOrders = totalOrders.filter(order => order.date === yearMonth);

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