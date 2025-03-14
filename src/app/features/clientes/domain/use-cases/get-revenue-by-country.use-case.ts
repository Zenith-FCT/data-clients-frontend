import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

export interface RevenueByCountryData {
  labels: string[];      // Nombres de los países
  data: number[];        // Ingresos totales por país
}

@Injectable({
  providedIn: 'root'
})
export class GetRevenueByCountryUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(): Observable<RevenueByCountryData> {
    return this.clientsService.getClients().pipe(
      map(clients => {
        // Agrupamos los ingresos totales por país
        const revenueByCountry = clients.reduce((acc, client) => {
          acc[client.pais] = (acc[client.pais] || 0) + client.importe_total;
          return acc;
        }, {} as Record<string, number>);

        return {
          labels: Object.keys(revenueByCountry),
          data: Object.values(revenueByCountry)
        };
      })
    );
  }
}