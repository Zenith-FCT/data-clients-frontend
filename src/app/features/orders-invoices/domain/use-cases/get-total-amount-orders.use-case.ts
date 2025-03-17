import { Observable, catchError, map, of } from "rxjs";
import { Order } from "../models/orders-model";
import { inject, Injectable } from "@angular/core";
import { OrdersDataRepository } from "../../data/data-repositories/orders.data-repository";

@Injectable({
    providedIn: 'root'
})
export class GetTotalAmountOrdersUseCase {
    private ordersDataRepository = inject(OrdersDataRepository);
    
    constructor() { 
    }

    /**
     * Ejecuta el caso de uso para obtener el monto total de pedidos
     * @returns Observable<number> con el monto total o 0 en caso de error
     */
    execute(): Observable<number> {
        return this.ordersDataRepository.getOrders().pipe(
            map((orders: Order[]) => {
                // Calcular el total de manera funcional con protección contra valores no numéricos
                return orders.reduce((total, order) => {
                    const orderValue = parseFloat(order.totalOrder || '0');
                    return total + (isNaN(orderValue) ? 0 : orderValue);
                }, 0);
            }),
            catchError(error => {
                console.error('Error al obtener el total de pedidos en el caso de uso:', error);
                return of(0); // Retorna 0 en caso de error para que la UI siga funcionando
            })
        );
    }
}