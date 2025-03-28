import { Observable, map, catchError, of } from 'rxjs';
import { MonthlySalesRepository } from '../repositories/monthly-sales-repository';

export class GetTotalOrdersUseCase {
  constructor(private monthlySalesRepository: MonthlySalesRepository) {}
  
  execute(year: number): Observable<number> {
    return this.monthlySalesRepository.getOrders().pipe(
      map(orders => {
        if (!orders || orders.length === 0) {
          return 0;
        }
        
        const filteredOrders = orders.filter(order => {
          const orderYear = new Date(order.date).getFullYear();
          return orderYear === year;
        });
        
        return filteredOrders.reduce((total, order) => {
          const salesNumber = parseInt(order.totalSalesNumber) || 0;
          return total + salesNumber;
        }, 0);
      }),
      catchError(error => {
        console.error('Error al obtener el total de ventas en el caso de uso:', error);
        return of(0);
      })
    );
  }
}