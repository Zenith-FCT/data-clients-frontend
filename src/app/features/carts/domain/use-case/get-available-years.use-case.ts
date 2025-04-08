import { Observable, combineLatest, map } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";

export class GetAvailableYearsUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(): Observable<number[]> {
        return combineLatest([
            this.cartsRepository.getCarts(),
            this.cartsRepository.getTotalOrders()
        ]).pipe(
            map(([carts, orders]) => {
                const yearsSet = new Set<number>();
                
                carts.forEach(cart => {
                    const year = parseInt(cart.date.split('-')[0]);
                    if (!isNaN(year)) {
                        yearsSet.add(year);
                    }
                });
                
                orders.forEach(order => {
                    const year = parseInt(order.date.split('-')[0]);
                    if (!isNaN(year)) {
                        yearsSet.add(year);
                    }
                });

                return Array.from(yearsSet).sort((a, b) => b - a);
            })
        );
    }
}