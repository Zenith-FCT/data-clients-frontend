import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client } from '../domain/clients';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private clientsSubject = new BehaviorSubject<Client[]>([]);

  clientsList = [
    {
      email: 'cliente1@email.com',
      pais: 'España',
      fecha_lead: new Date('2024-01-15'),
      fecha_primer_pedido: new Date('2024-01-20'),
      fecha_ultimo_pedido: new Date('2024-03-01'),
      intervalo_lead_pedido: 5,
      intervalo_vida_pedidos: 41,
      cantidad_pedidos: 3,
      importe_total: 450.5,
      importe_medio: 150.17,
      lead_magnet_entrada: 'Ebook Marketing',
      productos_pedidos: ['Curso básico', 'Curso avanzado', 'Mentoría'],
    },
    {
      email: 'cliente2@email.com',
      pais: 'México',
      fecha_lead: new Date('2024-02-01'),
      fecha_primer_pedido: new Date('2024-02-15'),
      fecha_ultimo_pedido: new Date('2024-02-15'),
      intervalo_lead_pedido: 14,
      intervalo_vida_pedidos: 0,
      cantidad_pedidos: 1,
      importe_total: 199.99,
      importe_medio: 199.99,
      lead_magnet_entrada: 'Webinar Gratuito',
      productos_pedidos: ['Curso básico'],
    },
    {
      email: 'cliente3@email.com',
      pais: 'Argentina',
      fecha_lead: new Date('2023-12-01'),
      fecha_primer_pedido: new Date('2023-12-10'),
      fecha_ultimo_pedido: new Date('2024-03-01'),
      intervalo_lead_pedido: 9,
      intervalo_vida_pedidos: 82,
      cantidad_pedidos: 4,
      importe_total: 899.99,
      importe_medio: 225.0,
      lead_magnet_entrada: 'PDF Guía',
      productos_pedidos: [
        'Curso premium',
        'Mentoría',
        'Curso avanzado',
        'Consultoría',
      ],
    },
    {
      email: 'cliente4@email.com',
      pais: 'Colombia',
      fecha_lead: new Date('2024-02-20'),
      fecha_primer_pedido: new Date('2024-02-21'),
      fecha_ultimo_pedido: new Date('2024-03-01'),
      intervalo_lead_pedido: 1,
      intervalo_vida_pedidos: 9,
      cantidad_pedidos: 2,
      importe_total: 299.99,
      importe_medio: 150.0,
      lead_magnet_entrada: 'Newsletter',
      productos_pedidos: ['Curso básico', 'Mentoría express'],
    },
    {
      email: 'cliente5@email.com',
      pais: 'Chile',
      fecha_lead: new Date('2024-01-01'),
      fecha_primer_pedido: new Date('2024-02-01'),
      fecha_ultimo_pedido: new Date('2024-03-01'),
      intervalo_lead_pedido: 31,
      intervalo_vida_pedidos: 29,
      cantidad_pedidos: 3,
      importe_total: 599.99,
      importe_medio: 200.0,
      lead_magnet_entrada: 'Prueba gratuita',
      productos_pedidos: ['Curso premium', 'Consultoría', 'Mentoría'],
    },
    {
      email: 'cliente6@email.com',
      pais: 'Perú',
      fecha_lead: new Date('2024-02-15'),
      fecha_primer_pedido: new Date('2024-02-16'),
      fecha_ultimo_pedido: new Date('2024-02-28'),
      intervalo_lead_pedido: 1,
      intervalo_vida_pedidos: 12,
      cantidad_pedidos: 2,
      importe_total: 349.99,
      importe_medio: 175.0,
      lead_magnet_entrada: 'Webinar Gratuito',
      productos_pedidos: ['Curso básico', 'Curso avanzado'],
    },
    {
      email: 'cliente7@email.com',
      pais: 'España',
      fecha_lead: new Date('2023-11-15'),
      fecha_primer_pedido: new Date('2023-12-01'),
      fecha_ultimo_pedido: new Date('2024-03-01'),
      intervalo_lead_pedido: 16,
      intervalo_vida_pedidos: 91,
      cantidad_pedidos: 5,
      importe_total: 1299.99,
      importe_medio: 260.0,
      lead_magnet_entrada: 'Ebook Marketing',
      productos_pedidos: [
        'Curso premium',
        'Mentoría',
        'Consultoría',
        'Curso avanzado',
        'Workshop',
      ],
    },
    {
      email: 'cliente8@email.com',
      pais: 'México',
      fecha_lead: new Date('2024-01-10'),
      fecha_primer_pedido: new Date('2024-01-20'),
      fecha_ultimo_pedido: new Date('2024-02-15'),
      intervalo_lead_pedido: 10,
      intervalo_vida_pedidos: 26,
      cantidad_pedidos: 2,
      importe_total: 399.99,
      importe_medio: 200.0,
      lead_magnet_entrada: 'PDF Guía',
      productos_pedidos: ['Curso básico', 'Curso avanzado'],
    },
    {
      email: 'cliente9@email.com',
      pais: 'Argentina',
      fecha_lead: new Date('2024-02-01'),
      fecha_primer_pedido: new Date('2024-02-05'),
      fecha_ultimo_pedido: new Date('2024-03-01'),
      intervalo_lead_pedido: 4,
      intervalo_vida_pedidos: 25,
      cantidad_pedidos: 3,
      importe_total: 699.99,
      importe_medio: 233.33,
      lead_magnet_entrada: 'Newsletter',
      productos_pedidos: ['Curso premium', 'Mentoría', 'Workshop'],
    },
    {
      email: 'cliente10@email.com',
      pais: 'España',
      fecha_lead: new Date('2024-01-01'),
      fecha_primer_pedido: new Date('2024-01-15'),
      fecha_ultimo_pedido: new Date('2024-02-28'),
      intervalo_lead_pedido: 14,
      intervalo_vida_pedidos: 44,
      cantidad_pedidos: 4,
      importe_total: 899.99,
      importe_medio: 225.0,
      lead_magnet_entrada: 'Webinar Gratuito',
      productos_pedidos: [
        'Curso básico',
        'Curso avanzado',
        'Mentoría',
        'Consultoría',
      ],
    },
  ];

  constructor() {
    this.clientsSubject.next(this.clientsList);
  }

  getClients(): Observable<Client[]> {
    return this.clientsSubject.asObservable();
  }

  getClientByEmail(email: string) {
    return this.clientsList.find((client) => client.email === email);
  }

  getCountryClients(country: string) {
    return this.clientsList.filter((client) => client.pais === country);
  }

  getAllCountries(): string[] {
    return this.clientsList.map((client) => client.pais);
  }
}
