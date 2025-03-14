import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface ClientMetricsBubblePoint {
  x: number;  // Cantidad de pedidos
  y: number;  // Importe total
  r: number;  // Radio de la burbuja (basado en importe medio)
}

export interface ClientMetricsBubbleData {
  data: ClientMetricsBubblePoint[];
}

@Injectable({
  providedIn: 'root'
})
export class GetClientMetricsBubbleUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(): Observable<ClientMetricsBubbleData> {
    return this.clientsService.getClients().pipe(
      map(clients => ({
        data: clients.map(client => ({
          x: client.cantidad_pedidos,
          y: client.importe_total,
          r: client.importe_medio / 20 // Escalamos el importe medio para un tamaño visual apropiado
        }))
      }))
    );
  }
}