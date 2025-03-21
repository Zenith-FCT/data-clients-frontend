import { Observable } from "rxjs";
import { Order } from "../models/orders-model";

export interface OrdersRepository {
    getOrders(): Observable<Order[]>;
    getOrderById(id: string): Observable<Order>;
}