import { Observable, catchError, map, of } from "rxjs";
import { Order } from "../models/orders-model";
import { inject, Injectable } from "@angular/core";
import { OrdersDataRepository } from "../../data/data-repositories/orders-repository.service";

@Injectable({
    providedIn: 'root'
})
export class GetTotalAmountOrdersUseCase {
    private ordersDataRepository = inject(OrdersDataRepository);
    
    constructor() { 
    }

    execute(): Observable<number> {
        return this.ordersDataRepository.getOrders().pipe(
            map((orders: Order[]) => {
               return orders.reduce((total, order) => {
                    const orderValue = parseFloat(order.totalOrder || '0');
                    return total + (isNaN(orderValue) ? 0 : orderValue);
                }, 0);
            }),
            catchError(error => {
                console.error('Error al obtener el total de pedidos en el caso de uso:', error);
                return of(0); 
            })
        );
    }
}