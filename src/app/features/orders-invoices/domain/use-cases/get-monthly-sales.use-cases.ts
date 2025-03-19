import { Observable, map } from 'rxjs';
import { OrdersRepository } from '../repositories/orders-repository';
import { Order } from '../models/orders-model';

export class GetMonthlySalesUseCase {
    constructor(private ordersRepository: OrdersRepository) {}
    
    execute(month: number, year: number): Observable<number> {
        return this.ordersRepository.getOrders().pipe(
            map(orders => {
                if (!orders || orders.length === 0) {
                    return 0;
                }
                return orders
                    .filter(order => {
                        const orderDate = new Date(order.orderDate);
                        return orderDate.getMonth() === month && 
                               orderDate.getFullYear() === year;
                    })
                    .reduce((total, order) => {
                        const orderAmount = parseFloat(order.totalOrder);
                        return total + (isNaN(orderAmount) ? 0 : orderAmount);
                    }, 0);
            })
        );
    }
}