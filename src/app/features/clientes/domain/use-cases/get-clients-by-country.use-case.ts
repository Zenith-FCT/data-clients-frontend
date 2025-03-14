import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClientesService } from '../../data/clients.service';

// Definimos la interfaz para los datos que necesita el gráfico
export interface ClientsByCountryData {
  labels: string[];      // Nombres de los países
  data: number[];        // Cantidad de clientes por país
}

@Injectable({
  providedIn: 'root'
})
export class GetClientsByCountryUseCase {
  constructor(private clientsService: ClientesService) {}

  execute(): Observable<ClientsByCountryData> {
    return this.clientsService.getClients().pipe(
      map(clients => {
        // Agrupamos los clientes por país
        const clientsByCountry = clients.reduce((acc, client) => {
          acc[client.pais] = (acc[client.pais] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Devolvemos el formato que necesita el gráfico
        return {
          labels: Object.keys(clientsByCountry),
          data: Object.values(clientsByCountry)
        };
      })
    );
  }
}