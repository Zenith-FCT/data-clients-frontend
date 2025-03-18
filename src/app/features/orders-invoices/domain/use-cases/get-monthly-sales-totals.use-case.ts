import { Observable, map } from 'rxjs';
import { OrdersRepository } from '../repositories/orders-repository';
import { Order } from '../models/orders-model';

export interface MonthlySalesTotal {
  month: string;
  totalAmount: number;
}

export class GetMonthlySalesTotalsUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  execute(year?: number): Observable<MonthlySalesTotal[]> {
    const targetYear = year || new Date().getFullYear();

    return this.ordersRepository.getOrders().pipe(
      map(orders => {
        const filteredOrders = this.filterOrdersByYear(orders, targetYear);
        
        return this.calculateMonthlySales(filteredOrders);
      })
    );
  }

  private filterOrdersByYear(orders: Order[], year: number): Order[] {
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getFullYear() === year;
    });
  }

  private calculateMonthlySales(orders: Order[]): MonthlySalesTotal[] {
    const monthlyTotals = new Map<number, number>();
    
    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const month = orderDate.getMonth();
      const amount = parseFloat(order.totalOrder);
      
      if (!isNaN(amount)) {
        const currentTotal = monthlyTotals.get(month) || 0;
        monthlyTotals.set(month, currentTotal + amount);
      }
    });
    
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const result: MonthlySalesTotal[] = [];
    
    for (let i = 0; i < 12; i++) {
      result.push({
        month: monthNames[i],
        totalAmount: monthlyTotals.get(i) || 0
      });
    }
    
    return result;
  }
}