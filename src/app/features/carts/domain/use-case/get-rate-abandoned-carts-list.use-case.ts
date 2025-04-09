import { Observable, combineLatest, map } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";
import { CartsAbandonedRate } from "../models/carts.model";

export class GetRateAbandonedCartsListUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(): Observable<CartsAbandonedRate[]> {
        return combineLatest([
            this.cartsRepository.getCarts(),
            this.cartsRepository.getTotalOrders()
        ]).pipe(
            map(([carts, orders]) => {
                const ratesByDate = new Map<string, { abandonedCarts: number, totalOrders: number }>();

                carts.forEach(cart => {
                    if (!cart.date) return;
                    const yearMonth = cart.date.substring(0, 7); 
                    const total = parseFloat(cart.total);
                    if (!isNaN(total)) {
                        const current = ratesByDate.get(yearMonth) || { abandonedCarts: 0, totalOrders: 0 };
                        ratesByDate.set(yearMonth, {
                            ...current,
                            abandonedCarts: current.abandonedCarts + total
                        });
                    }
                });

                orders.forEach(order => {
                    if (!order.date) return;
                    const yearMonth = order.date.substring(0, 7);
                    const current = ratesByDate.get(yearMonth) || { abandonedCarts: 0, totalOrders: 0 };
                    ratesByDate.set(yearMonth, {
                        ...current,
                        totalOrders: current.totalOrders + order.total
                    });
                });

                return Array.from(ratesByDate.entries()).map(([date, values]) => {
                    const rate = (values.abandonedCarts / (values.totalOrders + values.abandonedCarts)) * 100;
                    return new CartsAbandonedRate(date, isNaN(rate) ? 0 : rate);
                });
            })
        );
    }
}
