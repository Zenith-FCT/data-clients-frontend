import { Injectable } from '@angular/core';
import { Pedido } from '../../domain/models/orders-model';
import { OrdersMapper } from '../../data/mappers/orders-mapper';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor() { }
  url = 'http://localhost:3000/pedidos';

  async getOrders():Promise<Pedido[]>{
    try {
      const response = await fetch(this.url);
      const data = await response.json();
      return OrdersMapper.toModelList(data);
    }
    catch (error) {
      // apartado para luego tratar errores
      return [];
    }
  }
  async getOrder(id: string): Promise<Pedido> {
    try {
      const response = await fetch(`${this.url}/${id}`);
      const data = await response.json();
      
      if (data) {
        return OrdersMapper.toModel(data);
      } else {
        return {} as Pedido;
      }
    }
    catch (error) {
      // apartado para luego tratar errores
      return {} as Pedido;
    }
  }
}