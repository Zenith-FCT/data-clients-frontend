import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface CumulativeRevenueData {
  labels: string[];      // Fechas
  data: number[];        // Ingresos acumulados
}

@Injectable({
  providedIn: 'root'
})
export class GetCumulativeRevenueUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(): Observable<CumulativeRevenueData> {
    return this.clientsService.getClients().pipe(
      map(clients => {
        // Ordenamos los clientes por fecha del primer pedido
        const sortedClients = [...clients]
          .sort((a, b) => a.fecha_primer_pedido.getTime() - b.fecha_primer_pedido.getTime());

        // Calculamos los ingresos acumulados
        let cumulativeRevenue = 0;
        const data = sortedClients.map(client => {
          cumulativeRevenue += client.importe_total;
          return cumulativeRevenue;
        });

        return {
          labels: sortedClients.map(client => 
            new Date(client.fecha_primer_pedido).toLocaleDateString()
          ),
          data: data
        };
      })
    );
  }
}