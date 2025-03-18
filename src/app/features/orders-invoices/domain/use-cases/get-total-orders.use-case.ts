import { Observable, map, catchError, of } from 'rxjs';
import { OrdersRepository } from '../repositories/orders-repository';

export class GetTotalOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  execute(): Observable<number> {
    return this.ordersRepository.getOrders().pipe(
      map(orders => orders?.length || 0),
      catchError(error => {
        console.error('Error al obtener el total de pedidos en el caso de uso:', error);
        return of(0);
      })
    );
  }
}