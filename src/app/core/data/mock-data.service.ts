import { Injectable } from '@angular/core';
import { ClientData } from './client.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockClients: ClientData[] = [
    {
      id: 1,
      email: 'cliente1@example.com',
      pais: 'España',
      fecha_lead: new Date('2023-01-15'),
      fecha_primer_pedido: new Date('2023-01-20'),
      fecha_ultimo_pedido: new Date('2023-12-15'),
      intervalo_lead_pedido: 5,
      intervalo_vida_pedidos: 329,
      cantidad_pedidos: 8,
      importe_total: 1250.50,
      importe_medio: 156.31,
      lead_magnet_entrada: 'Ebook Marketing Digital',
      productos_pedidos: ['Curso básico', 'Curso avanzado', 'Mentoría']
    },
    {
      id: 2,
      email: 'cliente2@example.com',
      pais: 'México',
      fecha_lead: new Date('2023-02-01'),
      fecha_primer_pedido: new Date('2023-02-15'),
      fecha_ultimo_pedido: new Date('2023-11-30'),
      intervalo_lead_pedido: 14,
      intervalo_vida_pedidos: 288,
      cantidad_pedidos: 5,
      importe_total: 850.75,
      importe_medio: 170.15,
      lead_magnet_entrada: 'Guía Ventas Online',
      productos_pedidos: ['Curso básico', 'Consultoría']
    },
    {
      id: 3,
      email: 'cliente3@example.com',
      pais: 'Colombia',
      fecha_lead: new Date('2023-03-10'),
      fecha_primer_pedido: new Date('2023-03-12'),
      fecha_ultimo_pedido: new Date('2023-12-20'),
      intervalo_lead_pedido: 2,
      intervalo_vida_pedidos: 283,
      cantidad_pedidos: 12,
      importe_total: 2100.00,
      importe_medio: 175.00,
      lead_magnet_entrada: 'Webinar Gratuito',
      productos_pedidos: ['Curso premium', 'Mentoría', 'Curso especialización']
    }
  ];

  getClients(): ClientData[] {
    return this.mockClients;
  }

  getClientByEmail(email: string): ClientData | undefined {
    return this.mockClients.find(client => client.email === email);
  }

  getClientById(id: number): ClientData | undefined {
    return this.mockClients.find(client => client.id === id);
  }

  addClient(client: ClientData): void {
    // Asignar un nuevo ID si no se proporciona uno
    if (!client.id) {
      const maxId = Math.max(...this.mockClients.map(c => c.id), 0);
      client.id = maxId + 1;
    }
    this.mockClients.push(client);
  }
}