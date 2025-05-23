import { Observable, map } from 'rxjs';
import { MonthlySalesRepository } from '../repositories/monthly-sales-repository';

export class GetTotalAmountOrdersUseCase {
  constructor(private monthlySalesRepository: MonthlySalesRepository) {}

  execute(year: number): Observable<number> {
    return this.monthlySalesRepository.getMonthlySales().pipe(
      map(orders => {
        if (!orders || orders.length === 0) {
          return 0;
        }
        
        const filteredOrders = orders.filter(order => {
          const orderYear = new Date(order.date).getFullYear();
          return orderYear === year;
        });
        
        return filteredOrders.reduce((total, order) => {
          const orderAmount = parseFloat(order.totalSales);
          return total + (isNaN(orderAmount) ? 0 : orderAmount);
        }, 0);
      })
    );
  }
}