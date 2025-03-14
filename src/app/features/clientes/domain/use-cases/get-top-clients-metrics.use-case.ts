import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface TopClientMetricsData {
  metricLabels: string[];
  clientsData: Array<{
    label: string;
    metrics: number[];
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class GetTopClientsMetricsUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(limit: number = 3): Observable<TopClientMetricsData> {
    return this.clientsService.getClients().pipe(
      map(clients => {
        // Calculamos primero los valores máximos de todo el conjunto de datos
        const maxValues = {
          pedidos: Math.max(...clients.map(c => c.cantidad_pedidos)),
          ingresos: Math.max(...clients.map(c => c.importe_total)),
          valorMedio: Math.max(...clients.map(c => c.importe_medio)),
          antiguedad: Math.max(...clients.map(c => {
            const days = (new Date().getTime() - new Date(c.fecha_primer_pedido).getTime()) / (1000 * 60 * 60 * 24);
            return days;
          }))
        };

        // Ordenamos los clientes por una puntuación combinada
        const topClients = [...clients]
          .map(client => {
            const antiguedadDias = (new Date().getTime() - new Date(client.fecha_primer_pedido).getTime()) / (1000 * 60 * 60 * 24);
            const score = 
              (client.cantidad_pedidos / maxValues.pedidos) +
              (client.importe_total / maxValues.ingresos) +
              (client.importe_medio / maxValues.valorMedio) +
              (antiguedadDias / maxValues.antiguedad);
            return { ...client, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        // Definimos las métricas que queremos mostrar
        const metricLabels = [
          'Pedidos',
          'Ingresos',
          'Valor Medio',
          'Antigüedad'
        ];

        // Preparamos los datos normalizados para cada cliente
        const clientsData = topClients.map(client => {
          const antiguedadDias = (new Date().getTime() - new Date(client.fecha_primer_pedido).getTime()) / (1000 * 60 * 60 * 24);
          
          return {
            label: client.email.split('@')[0],
            metrics: [
              (client.cantidad_pedidos / maxValues.pedidos) * 100,
              (client.importe_total / maxValues.ingresos) * 100,
              (client.importe_medio / maxValues.valorMedio) * 100,
              (antiguedadDias / maxValues.antiguedad) * 100
            ]
          };
        });

        return {
          metricLabels,
          clientsData
        };
      })
    );
  }
}