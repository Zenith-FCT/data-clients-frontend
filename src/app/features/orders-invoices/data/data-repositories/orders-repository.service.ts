import { Observable } from "rxjs";
import { Order } from "../../domain/models/orders-model";
import { OrdersRepository } from "../../domain/repositories/orders-repository";
import { ApiService } from "../../services/api.service";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class OrdersDataRepository extends OrdersRepository {
    constructor(private apiService: ApiService) {
        super();
    }

    override getOrders(): Observable<Order[]> {
        return new Observable(subscriber => {
            this.apiService.getOrders().then(data => {
                subscriber.next(data);
                subscriber.complete();
            }).catch(error => {
                console.error('Error en OrdersDataRepository.getOrders:', error);
                subscriber.error(error);
            });
        });
    }

    override getOrderById(id: string): Observable<Order> {
        return new Observable(subscriber => {
            this.apiService.getOrder(id).then(data => {
                subscriber.next(data);
                subscriber.complete();
            }).catch(error => {
                console.error(`Error en OrdersDataRepository.getOrderById para id ${id}:`, error);
                subscriber.error(error);
            });
        });
    }
}