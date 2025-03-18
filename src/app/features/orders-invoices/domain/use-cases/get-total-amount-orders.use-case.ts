import { Observable, map } from 'rxjs';
import { OrdersRepository } from '../repositories/orders-repository';

export class GetTotalAmountOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  execute(): Observable<number> {
    return this.ordersRepository.getOrders().pipe(
      map(orders => {
        if (!orders || orders.length === 0) {
          return 0;
        }
        
        return orders.reduce((total, order) => {
          const orderAmount = parseFloat(order.totalOrder);
          return total + (isNaN(orderAmount) ? 0 : orderAmount);
        }, 0);
      })
    );
  }
}