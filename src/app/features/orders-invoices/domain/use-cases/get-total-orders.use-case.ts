import { Observable, catchError, map, of } from "rxjs";
import { Order } from "../models/orders-model";
import { inject, Injectable } from "@angular/core";
import { OrdersDataRepository } from "../../data/data-repositories/orders.data-repository";

@Injectable({
    providedIn: 'root'
})

export class GetTotalOrdersUseCase{
    private ordersDataRepository = inject(OrdersDataRepository);

    constructor(){}

    execute(): Observable<number>{
        return this.ordersDataRepository.getOrders().pipe(
            map((orders: Order[]) => {
                // Devolvemos la longitud del array de pedidos
                return orders.length;
            }),
            catchError(error => {
                console.error('Error al obtener el total de pedidos en el caso de uso:', error);
                return of(0); // Retorna 0 en caso de error para que la UI siga funcionando
            })
        );
    }
}