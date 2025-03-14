import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface OrdersVsRevenuePoint {
  x: number;  // Cantidad de pedidos
  y: number;  // Importe total
}

export interface OrdersVsRevenueData {
  data: OrdersVsRevenuePoint[];
}

@Injectable({
  providedIn: 'root'
})
export class GetOrdersVsRevenueUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(): Observable<OrdersVsRevenueData> {
    return this.clientsService.getClients().pipe(
      map(clients => ({
        data: clients.map(client => ({
          x: client.cantidad_pedidos,
          y: client.importe_total
        }))
      }))
    );
  }
}