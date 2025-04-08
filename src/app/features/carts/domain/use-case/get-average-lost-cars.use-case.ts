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
                const roundedPercentage = Math.round(percentage * 100) / 100;


                return roundedPercentage;
            })
        );
    }
}