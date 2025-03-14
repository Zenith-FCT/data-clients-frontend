import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface TopClientsRevenueData {
  labels: string[];      // Nombres/emails de los clientes
  data: number[];        // Ingresos totales
}

@Injectable({
  providedIn: 'root'
})
export class GetTopClientsRevenueUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(limit: number = 5): Observable<TopClientsRevenueData> {
    return this.clientsService.getClients().pipe(
      map(clients => {
        // Ordenamos los clientes por importe total y tomamos los top N
        const topClients = [...clients]
          .sort((a, b) => b.importe_total - a.importe_total)
          .slice(0, limit);

        return {
          labels: topClients.map(client => client.email.split('@')[0]),
          data: topClients.map(client => client.importe_total)
        };
      })
    );
  }
}