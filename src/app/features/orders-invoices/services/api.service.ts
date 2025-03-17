import { Injectable } from '@angular/core';
import { Order } from '../domain/models/orders-model';
import { OrdersMapper } from '../data/mappers/orders-mapper';

@Injectable({
  providedIn: 'root'
})
export class ApiService{
    
    constructor() { }
    url = 'http://localhost:3000/';

    async getOrders():Promise<Order[]>{
        try {
            const response = await fetch(`${this.url}pedidos`);
            const data = await response.json();
            return OrdersMapper.toModelList(data);
        }
        catch (error) {
            // apartado para luego tratar errores
            console.error("Error obteniendo pedidos:", error);
            return [];
        }
    }
    
    async getOrder(id: string): Promise<Order> {
        try {
            const response = await fetch(`${this.url}pedidos/${id}`);
            const data = await response.json();
            
            if (data) {
                return OrdersMapper.toModel(data);
            } else {
                return {} as Order;
            }
        }
        catch (error) {
            // apartado para luego tratar errores
            console.error("Error obteniendo pedido específico:", error);
            return {} as Order;
        }
    }
}