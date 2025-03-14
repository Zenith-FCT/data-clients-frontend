import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface OrdersByCountryData {
  labels: string[];      // Nombres de los países
  data: number[];        // Cantidad de pedidos por país
}

@Injectable({
  providedIn: 'root'
})
export class GetOrdersByCountryUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(): Observable<OrdersByCountryData> {
    return this.clientsService.getClients().pipe(
      map(clients => {
        // Agrupamos la cantidad de pedidos por país
        const ordersByCountry = clients.reduce((acc, client) => {
          acc[client.pais] = (acc[client.pais] || 0) + client.cantidad_pedidos;
          return acc;
        }, {} as Record<string, number>);

        return {
          labels: Object.keys(ordersByCountry),
          data: Object.values(ordersByCountry)
        };
      })
    );
  }
}