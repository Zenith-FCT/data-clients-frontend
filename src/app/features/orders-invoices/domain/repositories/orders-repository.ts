import { Observable } from "rxjs";
import { Order } from "../models/orders-model";

export abstract class OrdersRepository {
    abstract getOrders(): Observable<Order[]>;
    abstract getOrderById(id: string): Observable<Order>;
}