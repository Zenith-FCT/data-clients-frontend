import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface AverageOrderValueData {
  labels: string[];      // Fechas
  data: number[];        // Valores medios
}

@Injectable({
  providedIn: 'root'
})
export class GetAverageOrderValueUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(): Observable<AverageOrderValueData> {
    return this.clientsService.getClients().pipe(
      map(clients => {
        // Ordenamos los clientes por fecha del primer pedido
        const sortedClients = [...clients]
          .sort((a, b) => a.fecha_primer_pedido.getTime() - b.fecha_primer_pedido.getTime());

        return {
          labels: sortedClients.map(client => 
            new Date(client.fecha_primer_pedido).toLocaleDateString()
          ),
          data: sortedClients.map(client => client.importe_medio)
        };
      })
    );
  }
}