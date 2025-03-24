import { Observable, map } from 'rxjs';
import { MonthlySalesRepository } from '../repositories/monthly-sales-repository';

export class GetTotalAmountOrdersUseCase {
  constructor(private monthlySalesRepository: MonthlySalesRepository) {}

  execute(): Observable<number> {
    return this.monthlySalesRepository.getOrders().pipe(
      map(orders => {
        if (!orders || orders.length === 0) {
          return 0;
        }
        
        return orders.reduce((total, order) => {
          const orderAmount = parseFloat(order.totalSales);
          return total + (isNaN(orderAmount) ? 0 : orderAmount);
        }, 0);
      })
    );
  }
}