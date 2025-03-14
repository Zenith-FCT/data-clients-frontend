import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface MixedRevenueMetricsData {
  labels: string[];          // Nombres/emails de los clientes
  totalRevenue: number[];    // Ingresos totales por cliente
  averageRevenue: number[];  // Ingresos promedio por cliente
}

@Injectable({
  providedIn: 'root'
})
export class GetMixedRevenueMetricsUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(limit: number = 10): Observable<MixedRevenueMetricsData> {
    return this.clientsService.getClients().pipe(
      map(clients => {
        // Tomamos los top N clientes por ingresos totales
        const topClients = [...clients]
          .sort((a, b) => b.importe_total - a.importe_total)
          .slice(0, limit);

        return {
          labels: topClients.map(client => client.email.split('@')[0]),
          totalRevenue: topClients.map(client => client.importe_total),
          averageRevenue: topClients.map(client => client.importe_medio)
        };
      })
    );
  }
}