import { Injectable } from '@angular/core';
import { clientes } from '../../domain/models/clients-model';
import { ClientMapper } from '../../data/mappers/client-mapper';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor() { }
  url = 'http://localhost:3000/clientes';

  async getClients(): Promise<clientes[]> {
    try {
      const response = await fetch(this.url);
      const data = await response.json();
      return ClientMapper.toModelList(data);
    } catch (error) {
      // apartado para luego tratar errores
      return [];
      
    }
  }
  
  async getClient(id: string): Promise<clientes> {
    try {
      const response = await fetch(`${this.url}/${id}`);
      const data = await response.json();
      
      if (data) {
        return ClientMapper.toModel(data);
      } else {
        return {} as clientes;
      }
    } catch (error) {
      // apartado para luego tratar errores
      return {} as clientes;
      
    }
  }

}
